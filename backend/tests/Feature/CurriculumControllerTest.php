<?php

namespace Tests\Feature;

use App\Models\Usuario;
use App\Models\Curriculum;
use App\Services\ServicioPlantillaCurriculum;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CurriculumControllerTest extends TestCase
{
    use DatabaseTransactions, WithoutMiddleware;

    protected $usuario;

    protected function setUp(): void
    {
        parent::setUp();

        // Creamos un usuario de prueba con credenciales simuladas
        $this->usuario = Usuario::factory()->withCredencial()->create([
            'id_rol' => 2, // rol de Administrador del Sistema
        ]);
    }

   /** @test */
public function puede_generar_curriculum_con_servicio_mockeado()
{
    Storage::fake('public');

    // Simulamos el servicio de generación de PDF
    $this->mock(ServicioPlantillaCurriculum::class, function ($mock) {
        $mock->shouldReceive('generarPdf')
             ->once()
             ->andReturn('curriculum/fake.pdf');
    });

    $payload = [
        'usuarioId' => $this->usuario->id_usuario,
        'datosPersonales' => [
            'nombreCompleto' => 'Froy Rivera',
            'correo' => 'froy@example.com',
            'telefono' => '88888888', // opcional
        ],
        'resumenProfesional' => 'Desarrollador Laravel',
        'educaciones' => [],
        'experiencias' => [],
        'habilidades' => [],
        'idiomas' => [],
        'referencias' => [],
    ];

    $response = $this->actingAs($this->usuario)
                     ->post(route('api.curriculum.generate'), $payload);

    $response->assertStatus(200)
             ->assertJson([
                 'ok' => true,
                 'mensaje' => 'Currículum generado correctamente.',
             ]);

    $this->assertDatabaseHas('curriculum', [
        'id_usuario' => $this->usuario->id_usuario,
        'generado_sistema' => 1,
        'ruta_archivo_pdf' => 'curriculum/fake.pdf',
    ]);
}
/** @test */
public function no_puede_generar_curriculum_si_falta_el_usuarioid()
{
    $this->mock(ServicioPlantillaCurriculum::class);

    $payload = [
        'datosPersonales' => [
            'nombreCompleto' => 'Sin usuario',
            'correo' => 'falso@example.com',
        ],
        'resumenProfesional' => '',
        'educaciones' => [],
        'experiencias' => [],
        'habilidades' => [],
        'idiomas' => [],
        'referencias' => [],
    ];

    $response = $this->actingAs($this->usuario)
                     ->post(route('api.curriculum.generate'), $payload); // << usar post()

    $response->assertStatus(302); // Laravel redirige en validación web
    $response->assertSessionHasErrors(['usuarioId']);
}

    /** @test */
public function puede_subir_un_pdf_y_guardarlo_correctamente()
{
    Storage::fake('public');

    $file = UploadedFile::fake()->create('cv_froy.pdf', 200, 'application/pdf');

    $response = $this->actingAs($this->usuario)
                     ->post(route('curriculum.upload'), [
                         'curriculum' => $file,
                     ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Currículum cargado con éxito');

    // Obtener el último registro del usuario para verificar la ruta
    $curriculum = Curriculum::where('id_usuario', $this->usuario->id_usuario)->first();

    $this->assertNotNull($curriculum);
    Storage::disk('public')->assertExists($curriculum->ruta_archivo_pdf);  // no afecta el error, porque no es reconocido por laravel pero no afecta

    $this->assertDatabaseHas('curriculum', [
        'id_usuario' => $this->usuario->id_usuario,
        'generado_sistema' => 0,
    ]);
}

    /** @test */
    public function no_puede_subir_si_no_envia_archivo()
    {
        Storage::fake('public');

        $response = $this->actingAs($this->usuario)
            ->post(route('curriculum.upload'), []); // sin archivo

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['curriculum']);
    }

    /** @test */
    public function no_puede_subir_archivo_que_no_sea_pdf()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('imagen.jpg', 100, 'image/jpeg');

        $response = $this->actingAs($this->usuario)
            ->post(route('curriculum.upload'), [
                'curriculum' => $file,
            ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['curriculum']);
    }

    /** @test */
    public function puede_eliminar_un_curriculum_existente()
    {
        Storage::fake('public');

        // Creamos un archivo simulado en el disco fake
        $path = 'CurriculumCargado/test_cv.pdf';
        Storage::disk('public')->put($path, 'contenido falso');

        // Creamos el registro en base de datos (fake)
        $curriculum = Curriculum::factory()->create([
            'id_usuario' => $this->usuario->id_usuario,
            'ruta_archivo_pdf' => $path,
            'generado_sistema' => 0,
        ]);

        $response = $this->actingAs($this->usuario)
            ->delete(route('curriculum.delete'));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Currículum eliminado correctamente');

        // El archivo y el registro deben desaparecer
        Storage::disk('public')->assertMissing($path);  // no afecta el error, porque no es reconocido por laravel pero no afecta
        $this->assertDatabaseMissing('curriculum', [
            'id_curriculum' => $curriculum->id_curriculum,
        ]);
    }

    /** @test */
    public function puede_acceder_a_index_carga_y_obtener_estado_200()
    {
        $response = $this->actingAs($this->usuario)
            ->get(route('curriculum.index'));

        $response->assertStatus(200);
    }
}
