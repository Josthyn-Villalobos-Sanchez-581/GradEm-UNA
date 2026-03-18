<?php

namespace Tests\Repositories;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use App\Repositories\RegistroRepositories\RegistroRepository;
use App\Models\Usuario;
use App\Models\Rol;

class RegistroRepositoryTest extends TestCase
{
    use DatabaseTransactions;

    private RegistroRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new RegistroRepository();
    }

    // ─────────────────────────────────────────
    // correoExiste
    // ─────────────────────────────────────────

    #[Test]
    public function test_correo_existe_retorna_true_si_existe()
    {
        $usuario = Usuario::factory()->create();

        $resultado = $this->repository->correoExiste($usuario->correo);

        $this->assertTrue($resultado);
    }

    #[Test]
    public function test_correo_existe_retorna_false_si_no_existe()
    {
        $resultado = $this->repository->correoExiste('noexiste_' . uniqid() . '@test.com');

        $this->assertFalse($resultado);
    }

    // ─────────────────────────────────────────
    // identificacionExiste
    // ─────────────────────────────────────────

    #[Test]
    public function test_identificacion_existe_retorna_true_si_existe()
    {
        $usuario = Usuario::factory()->create();

        $resultado = $this->repository->identificacionExiste($usuario->identificacion);

        $this->assertTrue($resultado);
    }

    #[Test]
    public function test_identificacion_existe_retorna_false_si_no_existe()
    {
        $resultado = $this->repository->identificacionExiste('NOEXISTE' . uniqid());

        $this->assertFalse($resultado);
    }

    // ─────────────────────────────────────────
    // obtenerRolPorTipoCuenta
    // ─────────────────────────────────────────

    #[Test]
    public function test_obtener_rol_por_tipo_cuenta_retorna_rol_existente()
    {
        $rol = Rol::factory()->create([
            'nombre_rol' => 'Estudiante'
        ]);

        $resultado = $this->repository->obtenerRolPorTipoCuenta('estudiante');

        $this->assertInstanceOf(Rol::class, $resultado);
        $this->assertEquals('Estudiante', $resultado->nombre_rol);
    }

    #[Test]
    public function test_obtener_rol_por_tipo_cuenta_retorna_null_si_no_existe()
    {
        $resultado = $this->repository->obtenerRolPorTipoCuenta('rolquonoexiste');

        $this->assertNull($resultado);
    }

    // ─────────────────────────────────────────
    // crearUsuario
    // ─────────────────────────────────────────

    #[Test]
    public function test_crear_usuario_correctamente()
    {
        $rol = Rol::factory()->create([
            'nombre_rol' => 'Estudiante'
        ]);

        $datos = [
            'correo'          => 'nuevo_' . uniqid() . '@test.com',
            'nombre_completo' => 'Juan Perez',
            'identificacion'  => 'ID' . uniqid(),
            'fecha_registro'  => now(),
            'estado_id'       => 1,
        ];

        $usuario = $this->repository->crearUsuario($datos, $rol);

        $this->assertInstanceOf(Usuario::class, $usuario);

        $this->assertDatabaseHas('usuarios', [
            'correo'  => $datos['correo'],
            'id_rol'  => $rol->id_rol,
        ]);
    }

    // ─────────────────────────────────────────
    // crearCredencial
    // ─────────────────────────────────────────

    #[Test]
    public function test_crear_credencial_correctamente()
    {
        $usuario = Usuario::factory()->create();

        $credencial = $this->repository->crearCredencial($usuario->id_usuario, 'password123');

        $this->assertDatabaseHas('credenciales', [
            'id_usuario' => $usuario->id_usuario,
        ]);
    }
}