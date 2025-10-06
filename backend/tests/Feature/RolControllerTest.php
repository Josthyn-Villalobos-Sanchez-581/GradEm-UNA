<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\Permiso;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class RolControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Usuario con rol administrador
        $this->admin = Usuario::factory()->withCredencial()->create([
            'id_rol' => 2,
        ]);
    }

    #[Test]
    public function index_muestra_roles_y_permisos()
    {
        Rol::factory()->count(2)->create();
        Permiso::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('roles.index'));

        $response->assertStatus(200);
    }

    #[Test]
    public function un_admin_puede_crear_un_rol()
    {
        $payload = ['nombre_rol' => 'Supervisor Académico'];

        $response = $this->actingAs($this->admin)
            ->post(route('roles.store'), $payload);

        $response->assertRedirect(route('roles_permisos.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('roles', ['nombre_rol' => 'Supervisor Académico']);
    }

    #[Test]
    public function no_se_puede_crear_rol_duplicado()
    {
        Rol::factory()->create(['nombre_rol' => 'Repetido']);

        $payload = ['nombre_rol' => 'Repetido'];

        $response = $this->actingAs($this->admin)
            ->post(route('roles.store'), $payload);

        $response->assertSessionHasErrors(['nombre_rol']);
    }

    #[Test]
    public function un_admin_puede_editar_un_rol_y_asignar_permisos()
    {
        $rol = Rol::factory()->create(['nombre_rol' => 'Editor']);
        $permisos = Permiso::factory()->count(2)->create();

        $payload = [
            'nombre_rol' => 'Editor Modificado',
            'permisos' => $permisos->pluck('id_permiso')->toArray(),
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('roles.update', $rol->id_rol), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('roles', [
            'id_rol' => $rol->id_rol,
            'nombre_rol' => 'Editor Modificado',
        ]);

        // Asegura que los permisos se asignaron correctamente
        $this->assertDatabaseHas('roles_permisos', [
            'id_rol' => $rol->id_rol,
            'id_permiso' => $permisos->first()->id_permiso,
        ]);
    }

    #[Test]
    public function un_admin_puede_eliminar_un_rol_sin_permisos_asignados()
    {
        $rol = Rol::factory()->create(['nombre_rol' => 'Temporal']);

        $response = $this->actingAs($this->admin)
            ->delete(route('roles.destroy', $rol->id_rol));

        $response->assertRedirect();
        $this->assertDatabaseMissing('roles', [
            'id_rol' => $rol->id_rol,
        ]);
    }

    #[Test]
    public function un_admin_puede_eliminar_un_rol_con_permisos_asignados()
    {
        $rol = Rol::factory()->create(['nombre_rol' => 'Rol Asignado']);
        $permisos = Permiso::factory()->count(2)->create();
        $rol->permisos()->attach($permisos);

        $response = $this->actingAs($this->admin)
            ->delete(route('roles.destroy', $rol->id_rol));

        $response->assertRedirect();
        $this->assertDatabaseMissing('roles', ['id_rol' => $rol->id_rol]);

        foreach ($permisos as $permiso) {
            $this->assertDatabaseMissing('roles_permisos', [
                'id_rol' => $rol->id_rol,
                'id_permiso' => $permiso->id_permiso,
            ]);
        }
    }

    #[Test]
    public function no_se_puede_crear_rol_sin_nombre()
    {
        $payload = ['nombre_rol' => ''];

        $response = $this->actingAs($this->admin)
            ->post(route('roles.store'), $payload);

        $response->assertSessionHasErrors(['nombre_rol']);
    }
}
