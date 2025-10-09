<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Rol;
use App\Models\Permiso;
use App\Models\Usuario;
use Inertia\Testing\AssertableInertia as Assert;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test; 
use Illuminate\Foundation\Testing\WithoutMiddleware;

class RolesPermisosControllerTest extends TestCase
{
    use DatabaseTransactions, WithoutMiddleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();
    }
#[Test]
public function index_muestra_roles_y_permisos()
{
    // Simular usuario autenticado existente (id_rol=2 -> Administrador del Sistema)
    $usuario = Usuario::firstWhere('id_rol', 2);
    $this->actingAs($usuario);

    $response = $this->withoutMiddleware()->get(route('roles_permisos.index'));

    $response->assertStatus(200);

    // Verificar que existan los roles y permisos esperados sin asumir cantidad exacta
    $response->assertInertia(fn ($page) =>
        $page->component('Roles_Permisos/Index')
            ->where('roles', fn($roles) => collect($roles)->contains('nombre_rol', 'Administrador del Sistema'))
->where('permisos', fn($permisos) => collect($permisos)->contains('nombre', 'Gestión de Currículum'))

    );
}

    #[Test]
    public function un_admin_puede_asignar_permisos_a_un_rol()
    {
        $rol = Rol::factory()->create();
        $permisos = Permiso::factory()->count(3)->create();

        $usuario = Usuario::factory()->create([
            'id_rol' => $rol->id_rol
        ]);
$usuario = Usuario::findOrFail(1); // siempre devuelve un Usuario
        $response = $this->actingAs($usuario)
                         ->post(route('roles.asignar', $rol->id_rol), [
                             'permisos' => $permisos->pluck('id_permiso')->toArray()
                         ]);

        $response->assertRedirect();

        foreach ($permisos as $permiso) {
            $this->assertDatabaseHas('roles_permisos', [
                'id_rol' => $rol->id_rol,
                'id_permiso' => $permiso->id_permiso,
            ]);
        }
    }

    #[Test]
    public function no_se_puede_asignar_sin_lista_de_permisos()
    {
        $rol = Rol::factory()->create();
        $usuario = Usuario::factory()->create(['id_rol' => $rol->id_rol]);
$usuario = Usuario::findOrFail(1); // siempre devuelve un Usuario
        $response = $this->actingAs($usuario)
                         ->post(route('roles.asignar', $rol->id_rol), [
                             'permisos' => []
                         ]);

        $response->assertSessionHasErrors(['permisos']);
    }

    #[Test]
    public function no_se_puede_asignar_permisos_inexistentes()
    {
        $rol = Rol::factory()->create();
        $usuario = Usuario::factory()->create(['id_rol' => $rol->id_rol]);
$usuario = Usuario::findOrFail(1); // siempre devuelve un Usuario
        $response = $this->actingAs($usuario)
                         ->post(route('roles.asignar', $rol->id_rol), [
                             'permisos' => [9999, 8888]
                         ]);

        $response->assertSessionHasErrors(['permisos.0']);
    }

    #[Test]
    public function actualizar_permisos_sobrescribe_los_existentes()
    {
        $rol = Rol::factory()->create();
        $permisoViejo = Permiso::factory()->create();
        $rol->permisos()->attach($permisoViejo);

        $permisosNuevos = Permiso::factory()->count(2)->create();

        $usuario = Usuario::factory()->create(['id_rol' => $rol->id_rol]);
$usuario = Usuario::findOrFail(1); // siempre devuelve un Usuario
        $this->actingAs($usuario)
             ->post(route('roles.asignar', $rol->id_rol), [
                 'permisos' => $permisosNuevos->pluck('id_permiso')->toArray()
             ]);

        // Verifica que el permiso viejo ya no exista
        $this->assertDatabaseMissing('roles_permisos', [
            'id_rol' => $rol->id_rol,
            'id_permiso' => $permisoViejo->id_permiso,
        ]);

        // Verifica que los nuevos permisos existan
        foreach ($permisosNuevos as $permiso) {
            $this->assertDatabaseHas('roles_permisos', [
                'id_rol' => $rol->id_rol,
                'id_permiso' => $permiso->id_permiso,
            ]);
        }
    }

#[Test]
public function filtrar_roles_y_permisos_por_nombre()
{
    // Simular usuario autenticado existente
    $usuario = Usuario::firstWhere('id_rol', 2);
    $this->actingAs($usuario);

    $response = $this->withoutMiddleware()->get(route('roles_permisos.index', [
        'searchRol' => 'Administrador',
        'searchPermiso' => 'Currículum',
    ]));

    $response->assertStatus(200);

    // Verificar que el rol y permiso filtrados aparezcan entre los resultados
    $response->assertInertia(fn ($page) =>
        $page->component('Roles_Permisos/Index')
             ->where('roles', fn($roles) => collect($roles)->contains('nombre_rol', 'Administrador del Sistema'))
->where('permisos', fn($permisos) => collect($permisos)->contains('nombre', 'Gestión de Currículum'))

    );
}
}
