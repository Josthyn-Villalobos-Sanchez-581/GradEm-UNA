<?php

namespace Tests\Feature;

use App\Models\Usuario;
use App\Models\Permiso;
use App\Models\Rol;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;
class PermisoControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected $usuario;

    protected function setUp(): void
    {
        parent::setUp();
    $this->withoutMiddleware(); // Ahora sí se puede usar
        // Crear usuario con credencial y loguearlo
        $this->usuario = Usuario::factory()->withCredencial()->create();
        $this->actingAs($this->usuario);

        // Crear un rol y asociarlo al usuario
        $rol = Rol::create(['nombre_rol' => 'Administrador']);
        $this->usuario->id_rol = $rol->id_rol;
        $this->usuario->save();
    }

    #[Test]
    public function usuario_puede_ver_lista_de_permisos()
    {
        $response = $this->get(route('permisos.index'));

        $response->assertStatus(200)
                 ->assertInertia(fn ($page) => $page
                    ->component('Roles_Permisos/Index')
                    ->has('permisos')
                    ->has('userPermisos')
                 );
    }

    #[Test]
    public function usuario_puede_ver_vista_de_crear_permiso()
    {
        $response = $this->get(route('permisos.create'));

        $response->assertStatus(200)
                 ->assertInertia(fn ($page) => $page
                    ->component('Roles_Permisos/Permisos/Create')
                    ->has('userPermisos')
                 );
    }

    #[Test]
    public function usuario_puede_crear_permiso_valido()
    {
        $response = $this->post(route('permisos.store'), [
            'nombre' => 'Permiso Test'
        ]);

        $response->assertRedirect(route('roles_permisos.index'));
        $response->assertSessionHas('success', 'Permiso creado correctamente.');

        $this->assertDatabaseHas('permisos', [
            'nombre' => 'Permiso Test'
        ]);
    }

    #[Test]
    public function error_al_crear_permiso_sin_nombre()
    {
        $response = $this->post(route('permisos.store'), [
            'nombre' => ''
        ]);

        $response->assertSessionHasErrors('nombre');
    }

    #[Test]
    public function error_al_crear_permiso_duplicado()
    {
        Permiso::create(['nombre' => 'Permiso Duplicado']);

        $response = $this->post(route('permisos.store'), [
            'nombre' => 'Permiso Duplicado'
        ]);

        $response->assertSessionHasErrors('nombre');
    }

    #[Test]
    public function usuario_puede_ver_vista_de_editar_permiso()
    {
        $permiso = Permiso::create(['nombre' => 'Permiso Editar']);

        $response = $this->get(route('permisos.edit', $permiso->id_permiso));

        $response->assertStatus(200)
                 ->assertInertia(fn ($page) => $page
                    ->component('Roles_Permisos/Permisos/Edit')
                    ->has('permiso')
                    ->has('userPermisos')
                 );
    }

    #[Test]
    public function usuario_puede_actualizar_permiso_valido()
    {
        $permiso = Permiso::create(['nombre' => 'Permiso Original']);

        $response = $this->put(route('permisos.update', $permiso->id_permiso), [
            'nombre' => 'Permiso Actualizado'
        ]);

        $response->assertRedirect(route('roles_permisos.index'));
        $response->assertSessionHas('success', 'Permiso actualizado correctamente.');

        $this->assertDatabaseHas('permisos', [
            'id_permiso' => $permiso->id_permiso,
            'nombre' => 'Permiso Actualizado'
        ]);
    }

    #[Test]
    public function error_al_actualizar_permiso_a_nombre_duplicado()
    {
        Permiso::create(['nombre' => 'Permiso Existente']);
        $permiso = Permiso::create(['nombre' => 'Permiso Original']);

        $response = $this->put(route('permisos.update', $permiso->id_permiso), [
            'nombre' => 'Permiso Existente'
        ]);

        $response->assertSessionHasErrors('nombre');
    }

    #[Test]
    public function usuario_puede_eliminar_permiso_no_asignado()
    {
        $permiso = Permiso::create(['nombre' => 'Permiso a Eliminar']);

        $response = $this->delete(route('permisos.destroy', $permiso->id_permiso));

        $response->assertRedirect(route('roles_permisos.index'));
        $response->assertSessionHas('success', 'Permiso eliminado correctamente.');

        $this->assertDatabaseMissing('permisos', [
            'id_permiso' => $permiso->id_permiso
        ]);
    }

    #[Test]
    public function error_al_eliminar_permiso_asignado_a_rol()
    {
        $permiso = Permiso::create(['nombre' => 'Permiso Rol']);
        $rol = Rol::create(['nombre_rol' => 'Rol Test']);
        DB::table('roles_permisos')->insert([
            'id_rol' => $rol->id_rol,
            'id_permiso' => $permiso->id_permiso
        ]);

        $response = $this->delete(route('permisos.destroy', $permiso->id_permiso));

        $response->assertRedirect(route('roles_permisos.index'));
        $response->assertSessionHasErrors([
            'error' => "No se puede eliminar el permiso '{$permiso->nombre}' porque está asignado a uno o más roles."
        ]);

        $this->assertDatabaseHas('permisos', [
            'id_permiso' => $permiso->id_permiso
        ]);
    }
}
