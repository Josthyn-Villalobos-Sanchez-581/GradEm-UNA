<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use App\Models\Usuario;
use App\Models\Rol;
use App\Services\RolServices\RolService;
use Mockery;

class RolControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $serviceMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();

        $this->serviceMock = Mockery::mock(RolService::class);
        $this->app->instance(RolService::class, $this->serviceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    private function datosIndex(): array
    {
        return [
            'roles'           => collect([]),
            'permisos'        => collect([]),
            'todosPermisos'   => collect([]),
            'userPermisos'    => [],
            'filters'         => ['searchRol' => null, 'searchPermiso' => null],
            'visibleSections' => ['roles', 'permisos', 'asignacion'],
        ];
    }

    #[Test]
    public function test_index_retorna_vista_correcta()
    {
        $usuario = Usuario::factory()->create();

        $this->serviceMock
            ->shouldReceive('obtenerDatosIndex')
            ->once()
            ->withAnyArgs()
            ->andReturn($this->datosIndex());

        $response = $this->actingAs($usuario, 'sanctum')
            ->withHeaders(['X-Inertia' => 'true'])
            ->getJson('/roles');

        $response->assertStatus(200)
                 ->assertJsonPath('component', 'Roles_Permisos/Index');
    }

    #[Test]
    public function test_create_retorna_vista_correcta()
    {
        $usuario = Usuario::factory()->create();

        $this->serviceMock
            ->shouldReceive('obtenerDatosCreate')
            ->once()
            ->withAnyArgs()
            ->andReturn([
                'todosPermisos' => collect([]),
                'userPermisos'  => [],
            ]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->withHeaders(['X-Inertia' => 'true'])
            ->getJson('/roles/create');

        $response->assertStatus(200)
                 ->assertJsonPath('component', 'Roles_Permisos/Roles/Create');
    }

    #[Test]
    public function test_store_crea_rol_y_redirige()
    {
        $usuario = Usuario::factory()->create();

        $this->serviceMock
            ->shouldReceive('crearRol')
            ->once()
            ->with('Rol Nuevo Test');

        $response = $this->actingAs($usuario, 'sanctum')
            ->postJson('/roles', ['nombre_rol' => 'Rol Nuevo Test']);

        $response->assertStatus(302);
    }

    #[Test]
    public function test_store_falla_validacion_nombre_requerido()
    {
        $usuario = Usuario::factory()->create();

        $response = $this->actingAs($usuario, 'sanctum')
            ->postJson('/roles', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['nombre_rol']);
    }

    #[Test]
    public function test_store_falla_validacion_nombre_duplicado()
    {
        $usuario = Usuario::factory()->create();

        // Crear rol real en BD para que unique falle
        Rol::create(['nombre_rol' => 'RolDuplicado']);

        $response = $this->actingAs($usuario, 'sanctum')
            ->postJson('/roles', ['nombre_rol' => 'RolDuplicado']);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['nombre_rol']);
    }

    #[Test]
    public function test_edit_retorna_vista_correcta()
    {
        $usuario = Usuario::factory()->create();
        $rol     = Rol::create(['nombre_rol' => 'Rol Edit ' . uniqid()]);

        $this->serviceMock
            ->shouldReceive('obtenerDatosEdit')
            ->once()
            ->withAnyArgs()
            ->andReturn([
                'rol'           => $rol,
                'todosPermisos' => collect([]),
                'userPermisos'  => [],
            ]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->withHeaders(['X-Inertia' => 'true'])
            ->getJson("/roles/{$rol->id_rol}/edit");

        $response->assertStatus(200)
                 ->assertJsonPath('component', 'Roles_Permisos/Roles/Edit');
    }

    #[Test]
    public function test_update_actualiza_rol_y_redirige()
    {
        $usuario = Usuario::factory()->create();
        $rol     = Rol::create(['nombre_rol' => 'Rol Original ' . uniqid()]);

        $this->serviceMock
            ->shouldReceive('actualizarRol')
            ->once()
            ->with($rol->id_rol, 'Rol Actualizado');

        $response = $this->actingAs($usuario, 'sanctum')
            ->putJson("/roles/{$rol->id_rol}", ['nombre_rol' => 'Rol Actualizado']);

        $response->assertStatus(302);
    }

    #[Test]
    public function test_update_falla_validacion_nombre_requerido()
    {
        $usuario = Usuario::factory()->create();
        $rol     = Rol::create(['nombre_rol' => 'Rol ' . uniqid()]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->putJson("/roles/{$rol->id_rol}", []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['nombre_rol']);
    }

    #[Test]
    public function test_destroy_elimina_rol_y_redirige()
    {
        $usuario = Usuario::factory()->create();
        $rol     = Rol::create(['nombre_rol' => 'Rol Eliminar ' . uniqid()]);

        $this->serviceMock
            ->shouldReceive('eliminarRol')
            ->once()
            ->with($rol->id_rol);

        $response = $this->actingAs($usuario, 'sanctum')
            ->deleteJson("/roles/{$rol->id_rol}");

        $response->assertStatus(302);
    }
}