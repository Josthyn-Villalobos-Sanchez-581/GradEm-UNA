<?php
namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use App\Models\Usuario;
use App\Models\Empresa;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Inertia\Testing\AssertableInertia;

class EmpresaControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();
    }

    // ─────────────────────────────────────────
    // store
    // ─────────────────────────────────────────

    #[Test]
    public function test_store_registra_empresa_correctamente()
    {
        Mail::fake();

        Session::put('otp_validado', true);
        Session::put('otp_correo', 'empresa_' . uniqid() . '@test.com');

        $correo = session('otp_correo');

        $response = $this->postJson('/registro-empresa', [
            'nombre'                  => 'Empresa Test ' . uniqid(),
            'correo'                  => $correo,
            'telefono'                => '88887777',
            'persona_contacto'        => 'Juan Perez',
            'identificacion'          => 'ID' . uniqid(),
            'password'                => 'password123',
            'password_confirmation'   => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Empresa registrada correctamente'
                 ]);

        $this->assertDatabaseHas('empresas', [
            'correo' => $correo,
        ]);
    }

    #[Test]
    public function test_store_falla_si_otp_no_validado()
    {
        Session::forget('otp_validado');
        Session::put('otp_correo', 'empresa@test.com');

        $response = $this->postJson('/registro-empresa', [
            'correo' => 'empresa@test.com',
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'message' => 'Debe validar su correo primero'
                 ]);
    }

    #[Test]
    public function test_store_falla_si_correo_no_coincide_con_otp()
    {
        Session::put('otp_validado', true);
        Session::put('otp_correo', 'otro@test.com');

        $response = $this->postJson('/registro-empresa', [
            'correo' => 'diferente@test.com',
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'message' => 'Debe validar su correo primero'
                 ]);
    }

    #[Test]
    public function test_store_falla_si_correo_ya_registrado_en_usuarios()
    {
        $usuario = Usuario::factory()->create();

        Session::put('otp_validado', true);
        Session::put('otp_correo', $usuario->correo);

        $response = $this->postJson('/registro-empresa', [
            'nombre'                => 'Empresa Test ' . uniqid(),
            'correo'                => $usuario->correo,
            'telefono'              => '88887777',
            'persona_contacto'      => 'Juan Perez',
            'identificacion'        => 'ID' . uniqid(),
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    // ─────────────────────────────────────────
    // listarEmpresas
    // ─────────────────────────────────────────

    #[Test]
public function test_listar_empresas_retorna_vista_correcta()
{
    $usuario = Usuario::factory()->create();

    Empresa::create([
        'nombre'           => 'Empresa Lista ' . uniqid(),
        'correo'           => 'lista_' . uniqid() . '@test.com',
        'telefono'         => '88887777',
        'persona_contacto' => 'Juan Perez',
        'usuario_id'       => $usuario->id_usuario,
    ]);

    $response = $this->actingAs($usuario, 'sanctum')
                     ->withHeaders(['X-Inertia' => 'true'])
                     ->getJson('/empresas');

    $response->assertStatus(200)
             ->assertJsonPath('component', 'empresas/lista-empresas');
}


    #[Test]
public function test_listar_empresas_filtra_por_buscar()
{
    $usuario = Usuario::factory()->create();

    $nombre = 'EmpresaBuscar ' . uniqid();

    Empresa::create([
        'nombre'           => $nombre,
        'correo'           => 'buscar_' . uniqid() . '@test.com',
        'telefono'         => '88887777',
        'persona_contacto' => 'Juan Perez',
        'usuario_id'       => $usuario->id_usuario,
    ]);

    $response = $this->actingAs($usuario, 'sanctum')
                     ->withHeaders(['X-Inertia' => 'true'])
                     ->getJson('/empresas?buscar=' . urlencode($nombre));

    $response->assertStatus(200)
             ->assertJsonPath('component', 'empresas/lista-empresas');
}

    // ─────────────────────────────────────────
    // verEmpresa
    // ─────────────────────────────────────────

   #[Test]
public function test_ver_empresa_retorna_vista_correcta()
{
    $usuario = Usuario::factory()->create();

    $empresa = Empresa::create([
        'nombre'           => 'Empresa Ver ' . uniqid(),
        'correo'           => 'ver_' . uniqid() . '@test.com',
        'telefono'         => '88887777',
        'persona_contacto' => 'Juan Perez',
        'usuario_id'       => $usuario->id_usuario,
    ]);

    $response = $this->actingAs($usuario, 'sanctum')
                     ->withHeaders(['X-Inertia' => 'true'])
                     ->getJson("/empresas/{$empresa->id_empresa}");

    $response->assertStatus(200)
             ->assertJsonPath('component', 'empresas/ver-empresa');
}

    #[Test]
    public function test_ver_empresa_retorna_404_si_no_existe()
    {
        $usuario = Usuario::factory()->create();

        $response = $this->actingAs($usuario, 'sanctum')
                         ->getJson('/empresas/999999');

        $response->assertStatus(404);
    }
}