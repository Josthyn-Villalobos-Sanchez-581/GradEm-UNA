<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use Illuminate\Support\Facades\DB;

class UsuariosConsultaControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();
    }

    // ─────────────────────────────────────────
    // index
    // ─────────────────────────────────────────

    #[Test]
    public function test_index_retorna_vista_correcta()
    {
        $usuario = Usuario::factory()->create();

        $response = $this->actingAs($usuario, 'sanctum')
                         ->withHeaders(['X-Inertia' => 'true'])
                         ->getJson('/usuarios/perfiles');

        $response->assertStatus(200)
                 ->assertJsonPath('component', 'Usuarios/PerfilesUsuarios');
    }

    // ─────────────────────────────────────────
    // toggleEstado
    // ─────────────────────────────────────────

    #[Test]
    public function test_toggle_estado_activa_usuario_inactivo()
    {
        $usuarioAuth = Usuario::factory()->create();

        $usuarioTarget = Usuario::factory()->create([
            'estado_id' => 2
        ]);

        $response = $this->actingAs($usuarioAuth, 'sanctum')
                         ->putJson("/usuarios/{$usuarioTarget->id_usuario}/toggle-estado");

        $response->assertStatus(200)
                 ->assertJson([
                     'success'      => true,
                     'nuevo_estado' => 1,
                 ]);

        $this->assertDatabaseHas('usuarios', [
            'id_usuario' => $usuarioTarget->id_usuario,
            'estado_id'  => 1,
        ]);
    }

    #[Test]
    public function test_toggle_estado_inactiva_usuario_activo()
    {
        $usuarioAuth = Usuario::factory()->create();

        $usuarioTarget = Usuario::factory()->create([
            'estado_id' => 1
        ]);

        $response = $this->actingAs($usuarioAuth, 'sanctum')
                         ->putJson("/usuarios/{$usuarioTarget->id_usuario}/toggle-estado");

        $response->assertStatus(200)
                 ->assertJson([
                     'success'      => true,
                     'nuevo_estado' => 2,
                 ]);

        $this->assertDatabaseHas('usuarios', [
            'id_usuario' => $usuarioTarget->id_usuario,
            'estado_id'  => 2,
        ]);
    }

    #[Test]
    public function test_toggle_estado_retorna_404_si_usuario_no_existe()
    {
        $usuarioAuth = Usuario::factory()->create();

        $response = $this->actingAs($usuarioAuth, 'sanctum')
                         ->putJson('/usuarios/999999/toggle-estado');

        $response->assertStatus(404);
    }

    // ─────────────────────────────────────────
    // ver
    // ─────────────────────────────────────────

    #[Test]
public function test_ver_perfil_retorna_vista_correcta()
{
    $usuarioAuth = Usuario::factory()->create();
    $usuarioAuth->rol->nombre_rol = 'superusuario';
    $usuarioAuth->rol->save();

    $usuarioTarget = Usuario::factory()->create();

    $response = $this->actingAs($usuarioAuth, 'sanctum')
                     ->withHeaders(['X-Inertia' => 'true'])
                     ->getJson("/usuarios/{$usuarioTarget->id_usuario}/ver");

    $response->assertStatus(200)
             ->assertJsonPath('component', 'Usuarios/VerPerfil');
}

    #[Test]
    public function test_ver_perfil_retorna_404_si_usuario_no_existe()
    {
        $usuarioAuth = Usuario::factory()->create();

        $response = $this->actingAs($usuarioAuth, 'sanctum')
                         ->withHeaders(['X-Inertia' => 'true'])
                         ->getJson('/usuarios/999999/ver');

        $response->assertStatus(404);
    }

    #[Test]
public function test_ver_perfil_empresa_postulante()
{
    $usuarioAuth = Usuario::factory()->create();
    $usuarioAuth->rol->nombre_rol = 'superusuario';
    $usuarioAuth->rol->save();

    $usuarioTarget = Usuario::factory()->create();

    $response = $this->actingAs($usuarioAuth, 'sanctum')
                     ->withHeaders(['X-Inertia' => 'true'])
                     ->getJson("/empresa/postulantes/{$usuarioTarget->id_usuario}/perfil");

    $response->assertStatus(200)
             ->assertJsonPath('component', 'Usuarios/VerPerfil');
}
}