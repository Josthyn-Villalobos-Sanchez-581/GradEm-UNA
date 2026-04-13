<?php

namespace Tests\Repositories;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Repositories\AuthRepositories\AuthRepository;
use App\Models\Usuario;
use App\Models\Credencial;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\Test;

class AuthRepositoryTest extends TestCase
{
    use DatabaseTransactions;

    protected AuthRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new AuthRepository();
    }

    #[Test]
    public function buscar_usuario_por_correo()
    {
        $usuario = Usuario::factory()->create([
            'correo' => 'repo_test@email.com'
        ]);

        $resultado = $this->repository->buscarUsuarioPorCorreo('repo_test@email.com');

        $this->assertNotNull($resultado);
        $this->assertEquals($usuario->correo, $resultado->correo);
    }

    #[Test]
  public function obtener_credencial_por_usuario()
    {
        $usuario = Usuario::factory()->create();

        $credencial = Credencial::create([
            'id_usuario' => $usuario->id_usuario,
            'hash_contrasena' => bcrypt('Password123!')
        ]);

        $resultado = $this->repository->obtenerCredencial($usuario->id_usuario);

        $this->assertNotNull($resultado);
        $this->assertEquals($credencial->id_usuario, $resultado->id_usuario);
    }

    #[Test]
   public function obtener_estado_ids()
    {
        $resultado = $this->repository->obtenerEstadoIds();

        $this->assertIsArray($resultado);
        $this->assertArrayHasKey('activo', $resultado);
        $this->assertArrayHasKey('inactivo', $resultado);
    }

    #[Test]
    public function registrar_intento_correo_crea_registro()
    {
        $correo = 'login_test@email.com';

        $intentos = $this->repository->registrarIntentoCorreo($correo);

        $registro = DB::table('login_attempts')
            ->where('correo', $correo)
            ->first();

        $this->assertEquals(1, $intentos);
        $this->assertNotNull($registro);
    }

    #[Test]
    public function registrar_intento_correo_incrementa_intentos()
    {
        $correo = 'login_test2@email.com';

        DB::table('login_attempts')->insert([
            'correo' => $correo,
            'intentos' => 1,
            'fecha_ultimo_intento' => now()
        ]);

        $intentos = $this->repository->registrarIntentoCorreo($correo);

        $this->assertEquals(2, $intentos);
    }

    #[Test]
    public function registrar_intento_correo_forza_bloqueo()
    {
        $correo = 'login_test3@email.com';

        $intentos = $this->repository->registrarIntentoCorreo($correo, true);

        $this->assertEquals(3, $intentos);
    }

    #[Test]
    public function limpiar_intentos_correo_elimina_registro()
    {
        $correo = 'login_test4@email.com';

        DB::table('login_attempts')->insert([
            'correo' => $correo,
            'intentos' => 2,
            'fecha_ultimo_intento' => now()
        ]);

        $this->repository->limpiarIntentosCorreo($correo);

        $registro = DB::table('login_attempts')
            ->where('correo', $correo)
            ->first();

        $this->assertNull($registro);
    }

    #[Test]
    public function limpiar_correos_expirados_elimina_correos_sin_usuario()
    {
        $correo = 'expirado@email.com';

        DB::table('login_attempts')->insert([
            'correo' => $correo,
            'intentos' => 2,
            'fecha_ultimo_intento' => now()->subSeconds(5000)
        ]);

        $this->repository->limpiarCorreosExpirados(300);

        $registro = DB::table('login_attempts')
            ->where('correo', $correo)
            ->first();

        $this->assertNull($registro);
    }

}