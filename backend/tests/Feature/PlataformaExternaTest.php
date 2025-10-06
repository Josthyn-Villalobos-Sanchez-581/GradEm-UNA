<?php
//backend/tests/Feature/PlataformaExternaTest.php

namespace Tests\Feature;

use App\Models\PlataformaExterna;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;
class PlataformaExternaTest extends TestCase
{
    use DatabaseTransactions;

    protected $usuario;

    protected function setUp(): void
    {
        parent::setUp();

        // ⚠️ Usar un usuario ya existente en tu BD de pruebas
        // Ejemplo: el que me pasaste con id_usuario = 8
        $this->usuario = Usuario::find(5);

        // Seguridad: si no existe, lo creamos manualmente
        if (!$this->usuario) {
            $this->usuario = Usuario::create([
                'id_usuario' => 8,
                'nombre_completo' => 'Froylan',
                'correo' => 'froyrsalas@gmail.com',
                'identificacion' => '604840075',
                'telefono' => '60075887',
                'fecha_nacimiento' => '2003-12-26',
                'genero' => 'masculino',
                'estado_empleo' => 'desempleado',
                'estado_estudios' => 'activo',
                'fecha_registro' => now(),
                'id_rol' => 6,
                'estado_id' => 1,
            ]);
        }
    }

    #[Test]
    public function test_usuario_puede_agregar_un_enlace()
    {
        $payload = [
            'tipo' => 'GitHub',
            'url' => 'https://github.com/froy-test'
        ];

        $response = $this->actingAs($this->usuario)
            ->postJson(route('perfil.plataformas.store'), $payload);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'mensaje' => 'Enlace agregado correctamente.'
                 ]);

        $this->assertDatabaseHas('plataformas_externas', [
            'id_usuario' => $this->usuario->id_usuario,
            'tipo' => 'GitHub',
            'url' => 'https://github.com/froy-test'
        ]);
    }

    #[Test]
    public function test_usuario_puede_eliminar_su_enlace()
    {
        $plataforma = PlataformaExterna::create([
            'id_usuario' => $this->usuario->id_usuario,
            'tipo' => 'LinkedIn',
            'url' => 'https://linkedin.com/in/froy-test'
        ]);

        $response = $this->actingAs($this->usuario)
            ->deleteJson(route('perfil.plataformas.destroy', $plataforma->id_plataforma));

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'mensaje' => 'Enlace eliminado correctamente.'
                 ]);

        $this->assertDatabaseMissing('plataformas_externas', [
            'id_plataforma' => $plataforma->id_plataforma
        ]);
    }

    #[Test]
    public function test_no_puede_agregar_enlace_si_estado_invalido()
    {
        $this->usuario->estado_estudios = 'suspendido';
        $this->usuario->save();

        $payload = [
            'tipo' => 'Facebook',
            'url' => 'https://facebook.com/froy-test'
        ];

        $response = $this->actingAs($this->usuario)
            ->postJson(route('perfil.plataformas.store'), $payload);

        $response->assertStatus(403)
                 ->assertJson([
                     'error' => 'Solo estudiantes o egresados pueden agregar enlaces.'
                 ]);
    }

    #[Test]
    public function test_no_puede_eliminar_enlace_de_otro_usuario()
    {
        // Creamos un usuario falso diferente
        $otroUsuario = Usuario::create([
            'id_usuario' => 99,
            'nombre_completo' => 'Otro Usuario',
            'correo' => 'otro@example.com',
            'identificacion' => '123456789',
            'telefono' => '12345678',
            'fecha_nacimiento' => '2000-01-01',
            'genero' => 'masculino',
            'estado_empleo' => 'desempleado',
            'estado_estudios' => 'activo',
            'fecha_registro' => now(),
            'id_rol' => 6,
            'estado_id' => 1,
        ]);

        $plataforma = PlataformaExterna::create([
            'id_usuario' => $otroUsuario->id_usuario,
            'tipo' => 'Twitter',
            'url' => 'https://twitter.com/otro-test'
        ]);

        $response = $this->actingAs($this->usuario)
            ->deleteJson(route('perfil.plataformas.destroy', $plataforma->id_plataforma));

        $response->assertStatus(403)
                 ->assertJson([
                     'error' => 'No tiene permiso para eliminar este enlace.'
                 ]);
    }
}