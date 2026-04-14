<?php

namespace Tests\Repositories;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use App\Repositories\EmpresaRepositories\EmpresaRepository;
use App\Models\Usuario;
use App\Models\Empresa;
use Illuminate\Support\Facades\Mail;

class EmpresaRepositoryTest extends TestCase
{
    use DatabaseTransactions;

    private EmpresaRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new EmpresaRepository();
    }

    // ─────────────────────────────────────────
    // correoExisteUsuario
    // ─────────────────────────────────────────

    #[Test]
    public function test_correo_existe_usuario_retorna_true_si_existe()
    {
        $usuario = Usuario::factory()->create();

        $resultado = $this->repository->correoExisteUsuario($usuario->correo);

        $this->assertTrue($resultado);
    }

    #[Test]
    public function test_correo_existe_usuario_retorna_false_si_no_existe()
    {
        $resultado = $this->repository->correoExisteUsuario('noexiste_' . uniqid() . '@test.com');

        $this->assertFalse($resultado);
    }

    // ─────────────────────────────────────────
    // correoExisteEmpresa
    // ─────────────────────────────────────────

    #[Test]
    public function test_correo_existe_empresa_retorna_true_si_existe()
    {
        $usuario = Usuario::factory()->create();

        Empresa::create([
            'nombre'           => 'Empresa Test ' . uniqid(),
            'correo'           => 'empresa_' . uniqid() . '@test.com',
            'telefono'         => '88887777',
            'persona_contacto' => 'Juan Perez',
            'usuario_id'       => $usuario->id_usuario,
        ]);

        $empresa = Empresa::orderBy('id_empresa', 'desc')->first();

        $resultado = $this->repository->correoExisteEmpresa($empresa->correo);

        $this->assertTrue($resultado);
    }

    #[Test]
    public function test_correo_existe_empresa_retorna_false_si_no_existe()
    {
        $resultado = $this->repository->correoExisteEmpresa('noexiste_' . uniqid() . '@test.com');

        $this->assertFalse($resultado);
    }

    // ─────────────────────────────────────────
    // nombreEmpresaExiste
    // ─────────────────────────────────────────

    #[Test]
    public function test_nombre_empresa_existe_retorna_true_si_existe()
    {
        $usuario = Usuario::factory()->create();

        $nombre = 'EmpresaUnica ' . uniqid();

        Empresa::create([
            'nombre'           => $nombre,
            'correo'           => 'empresa_' . uniqid() . '@test.com',
            'telefono'         => '88887777',
            'persona_contacto' => 'Juan Perez',
            'usuario_id'       => $usuario->id_usuario,
        ]);

        $resultado = $this->repository->nombreEmpresaExiste($nombre);

        $this->assertTrue($resultado);
    }

    #[Test]
    public function test_nombre_empresa_existe_retorna_false_si_no_existe()
    {
        $resultado = $this->repository->nombreEmpresaExiste('NombreQueNoExiste ' . uniqid());

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
    // crearUsuario
    // ─────────────────────────────────────────

    #[Test]
    public function test_crear_usuario_correctamente()
    {
        $correo = 'empresa_' . uniqid() . '@test.com';
        $identificacion = 'ID' . uniqid();

        $usuario = $this->repository->crearUsuario(
            'Juan Perez',
            $correo,
            $identificacion
        );

        $this->assertInstanceOf(Usuario::class, $usuario);

        $this->assertDatabaseHas('usuarios', [
            'correo'      => $correo,
            'id_rol'      => 5,
        ]);
    }

    // ─────────────────────────────────────────
    // crearEmpresa
    // ─────────────────────────────────────────

    #[Test]
    public function test_crear_empresa_correctamente()
    {
        $usuario = Usuario::factory()->create();

        $correo = 'empresa_' . uniqid() . '@test.com';
        $nombre = 'Empresa ' . uniqid();

        $empresa = $this->repository->crearEmpresa(
            $nombre,
            $correo,
            '88887777',
            'Juan Perez',
            $usuario->id_usuario
        );

        $this->assertInstanceOf(Empresa::class, $empresa);

        $this->assertDatabaseHas('empresas', [
            'correo'     => $correo,
            'usuario_id' => $usuario->id_usuario,
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

    // ─────────────────────────────────────────
    // listarEmpresas
    // ─────────────────────────────────────────

    #[Test]
    public function test_listar_empresas_retorna_coleccion()
    {
        $usuario = Usuario::factory()->create();

        Empresa::create([
            'nombre'           => 'Empresa Lista ' . uniqid(),
            'correo'           => 'lista_' . uniqid() . '@test.com',
            'telefono'         => '88887777',
            'persona_contacto' => 'Juan Perez',
            'usuario_id'       => $usuario->id_usuario,
        ]);

        $resultado = $this->repository->listarEmpresas();

        $this->assertNotEmpty($resultado);
        $this->assertInstanceOf(Empresa::class, $resultado->first());
    }

    // ─────────────────────────────────────────
    // verEmpresa
    // ─────────────────────────────────────────

    #[Test]
    public function test_ver_empresa_retorna_empresa_correcta()
    {
        $usuario = Usuario::factory()->create();

        $empresa = Empresa::create([
            'nombre'           => 'Empresa Ver ' . uniqid(),
            'correo'           => 'ver_' . uniqid() . '@test.com',
            'telefono'         => '88887777',
            'persona_contacto' => 'Juan Perez',
            'usuario_id'       => $usuario->id_usuario,
        ]);

        $resultado = $this->repository->verEmpresa($empresa->id_empresa);

        $this->assertEquals($empresa->id_empresa, $resultado->id_empresa);
    }

    #[Test]
    public function test_ver_empresa_falla_si_no_existe()
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $this->repository->verEmpresa(999999);
    }

    // ─────────────────────────────────────────
    // enviarCodigo
    // ─────────────────────────────────────────

#[Test]
public function test_enviar_codigo_llama_mail()
{
    Mail::fake();

    $excepcion = null;

    try {
        $this->repository->enviarCodigo('test@test.com', 123456);
    } catch (\Exception $e) {
        $excepcion = $e;
    }

    $this->assertNull($excepcion, 'Se esperaba que enviarCodigo no lanzara excepciones');
}
}