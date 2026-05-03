<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\Test;
use App\Models\Usuario;
use App\Models\Oferta;
use App\Models\Empresa;
use App\Models\Postulacion;

class PostulacionControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();
    }

    // ─────────────────────────────────────────
    // Helper para crear empresa con usuario
    // ─────────────────────────────────────────

    private function crearEmpresaConUsuario(): array
    {
        $usuarioEmpresa = Usuario::factory()->create();

        $empresa = Empresa::create([
            'nombre'           => 'Empresa Test ' . uniqid(),
            'correo'           => 'empresa_' . uniqid() . '@test.com',
            'telefono'         => '88887777',
            'persona_contacto' => 'Juan Perez',
            'usuario_id'       => $usuarioEmpresa->id_usuario,
        ]);

        return [$usuarioEmpresa, $empresa];
    }
private function crearCurriculumValido(int $idUsuario): void
{
    \App\Models\Curriculum::create([
        'id_usuario'        => $idUsuario,
        'generado_sistema'  => true,
    ]);
}

    // ─────────────────────────────────────────
    // postular
    // ─────────────────────────────────────────

    #[Test]
public function test_postular_correctamente()
{
    $usuario = Usuario::factory()->create();

    
    $this->crearCurriculumValido($usuario->id_usuario);

    [, $empresa] = $this->crearEmpresaConUsuario();

    $oferta = Oferta::create([
        'id_empresa'        => $empresa->id_empresa,
        'titulo'            => 'Oferta Test',
        'descripcion'       => 'Descripción test',
        'requisitos'        => json_encode([]),
        'tipo_oferta'       => 'Tiempo completo',
        'estado_id'         => 1,
        'fecha_publicacion' => now(),
        'fecha_limite'      => now()->addDays(30),
    ]);

    $response = $this->actingAs($usuario, 'sanctum')
                     ->postJson("/ofertas/{$oferta->id_oferta}/postular", [
                         'mensaje' => 'Me interesa esta oferta'
                     ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('postulaciones', [
        'id_usuario' => $usuario->id_usuario,
        'id_oferta'  => $oferta->id_oferta,
        'estado_id'  => 1,
    ]);
}

   #[Test]
public function test_postular_falla_si_ya_existe_postulacion()
{
    $usuario = Usuario::factory()->create();

   
    $this->crearCurriculumValido($usuario->id_usuario);

    [, $empresa] = $this->crearEmpresaConUsuario();

    $oferta = Oferta::create([
        'id_empresa'        => $empresa->id_empresa,
        'titulo'            => 'Oferta Test',
        'descripcion'       => 'Descripción test',
        'requisitos'        => json_encode([]),
        'tipo_oferta'       => 'Tiempo completo',
        'estado_id'         => 1,
        'fecha_publicacion' => now(),
        'fecha_limite'      => now()->addDays(30),
    ]);

    
    Postulacion::create([
        'id_usuario'        => $usuario->id_usuario,
        'id_oferta'         => $oferta->id_oferta,
        'mensaje'           => 'Primera postulación',
        'fecha_postulacion' => now(),
        'estado_id'         => 1,
    ]);

    $response = $this->actingAs($usuario, 'sanctum')
                     ->postJson("/ofertas/{$oferta->id_oferta}/postular", [
                         'mensaje' => 'Segunda postulación'
                     ]);

    $response->assertStatus(302);
    $response->assertSessionHasErrors('msg'); 
}

    // ─────────────────────────────────────────
    // cambiarEstado
    // ─────────────────────────────────────────

    #[Test]
    public function test_cambiar_estado_postulacion_correctamente()
    {
        $usuario = Usuario::factory()->create();

        [, $empresa] = $this->crearEmpresaConUsuario();

        $oferta = Oferta::create([
            'id_empresa'        => $empresa->id_empresa,
            'titulo'            => 'Oferta Test',
            'descripcion'       => 'Descripción test',
            'requisitos'        => json_encode([]),
            'tipo_oferta'       => 'Tiempo completo',
            'estado_id'         => 1,
            'fecha_publicacion' => now(),
            'fecha_limite'      => now()->addDays(30),
        ]);

        $postulacion = Postulacion::create([
            'id_usuario'        => $usuario->id_usuario,
            'id_oferta'         => $oferta->id_oferta,
            'mensaje'           => 'Postulación test',
            'fecha_postulacion' => now(),
            'estado_id'         => 1,
        ]);

        $usuarioAuth = Usuario::factory()->create();
        $usuarioAuth->empresa()->save($empresa);

        $response = $this->actingAs($usuarioAuth, 'sanctum')
                         ->putJson("/postulaciones/{$postulacion->id_postulacion}/estado", [
                             'estado_id' => 2
                         ]);

        $response->assertStatus(302);

        $this->assertDatabaseHas('postulaciones', [
            'id_postulacion' => $postulacion->id_postulacion,
            'estado_id'      => 2,
        ]);
    }

    #[Test]
    public function test_cambiar_estado_falla_si_estado_invalido()
    {
        $usuario = Usuario::factory()->create();

        [, $empresa] = $this->crearEmpresaConUsuario();

        $oferta = Oferta::create([
            'id_empresa'        => $empresa->id_empresa,
            'titulo'            => 'Oferta Test',
            'descripcion'       => 'Descripción test',
            'requisitos'        => json_encode([]),
            'tipo_oferta'       => 'Tiempo completo',
            'estado_id'         => 1,
            'fecha_publicacion' => now(),
            'fecha_limite'      => now()->addDays(30),
        ]);

        $postulacion = Postulacion::create([
            'id_usuario'        => $usuario->id_usuario,
            'id_oferta'         => $oferta->id_oferta,
            'mensaje'           => 'Postulación test',
            'fecha_postulacion' => now(),
            'estado_id'         => 1,
        ]);

        $response = $this->actingAs($usuario, 'sanctum')
                         ->putJson("/postulaciones/{$postulacion->id_postulacion}/estado", [
                             'estado_id' => 99
                         ]);

        $response->assertStatus(422);
    }

    #[Test]
    public function test_cambiar_estado_falla_si_postulacion_no_existe()
    {
        $usuario = Usuario::factory()->create();

        $response = $this->actingAs($usuario, 'sanctum')
                         ->putJson('/postulaciones/999999/estado', [
                             'estado_id' => 2
                         ]);

        $response->assertStatus(404);
    }

    // ─────────────────────────────────────────
    // misPostulaciones
    // ─────────────────────────────────────────

    #[Test]
    public function test_mis_postulaciones_retorna_vista_correcta()
    {
        $usuario = Usuario::factory()->create();

        $response = $this->actingAs($usuario, 'sanctum')
                         ->withHeaders(['X-Inertia' => 'true'])
                         ->getJson('/misPostulaciones');

        $response->assertStatus(200)
                 ->assertJsonPath('component', 'Ofertas/MisPostulaciones');
    }

    #[Test]
    public function test_mis_postulaciones_filtra_por_buscar()
    {
        $usuario = Usuario::factory()->create();

        $response = $this->actingAs($usuario, 'sanctum')
                         ->withHeaders(['X-Inertia' => 'true'])
                         ->getJson('/misPostulaciones?buscar=desarrollador');

        $response->assertStatus(200)
                 ->assertJsonPath('component', 'Ofertas/MisPostulaciones');
    }

    // ─────────────────────────────────────────
    // cancelar
    // ─────────────────────────────────────────


    #[Test]
public function test_cancelar_falla_si_estado_no_permite_cancelacion()
{
    $usuario = Usuario::factory()->create();

    [, $empresa] = $this->crearEmpresaConUsuario();

    $oferta = Oferta::create([
        'id_empresa'        => $empresa->id_empresa,
        'titulo'            => 'Oferta Test',
        'descripcion'       => 'Descripción test',
        'requisitos'        => json_encode([]),
        'tipo_oferta'       => 'Tiempo completo',
        'estado_id'         => 1,
        'fecha_publicacion' => now(),
        'fecha_limite'      => now()->addDays(30),
    ]);

    $postulacion = Postulacion::create([
        'id_usuario'        => $usuario->id_usuario,
        'id_oferta'         => $oferta->id_oferta,
        'mensaje'           => 'Postulación test',
        'fecha_postulacion' => now(),
        'estado_id'         => 2,
    ]);

    $response = $this->actingAs($usuario, 'sanctum')
                     ->patchJson("/postulaciones/{$postulacion->id_postulacion}/cancelar");

    $response->assertStatus(302);
    $response->assertSessionHasErrors('msg');
}
    #[Test]
    public function test_cancelar_falla_si_postulacion_no_pertenece_al_usuario()
    {
        $usuario1 = Usuario::factory()->create();
        $usuario2 = Usuario::factory()->create();

        [, $empresa] = $this->crearEmpresaConUsuario();

        $oferta = Oferta::create([
            'id_empresa'        => $empresa->id_empresa,
            'titulo'            => 'Oferta Test',
            'descripcion'       => 'Descripción test',
            'requisitos'        => json_encode([]),
            'tipo_oferta'       => 'Tiempo completo',
            'estado_id'         => 1,
            'fecha_publicacion' => now(),
            'fecha_limite'      => now()->addDays(30),
        ]);

        $postulacion = Postulacion::create([
            'id_usuario'        => $usuario1->id_usuario,
            'id_oferta'         => $oferta->id_oferta,
            'mensaje'           => 'Postulación test',
            'fecha_postulacion' => now(),
            'estado_id'         => 1,
        ]);

        $response = $this->actingAs($usuario2, 'sanctum')
                         ->patchJson("/postulaciones/{$postulacion->id_postulacion}/cancelar");

        $response->assertStatus(404);
    }
}