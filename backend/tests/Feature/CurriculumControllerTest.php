<?php
namespace Tests\Feature;

use Tests\TestCase;
use App\Services\CurriculumServices\CurriculumService;
use App\Services\ServicioPlantillaCurriculum;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mockery;
use PHPUnit\Framework\Attributes\Test;

class CurriculumControllerTest extends TestCase
{
    use DatabaseTransactions;
 protected function setUp(): void
    {
        parent::setUp();

       
        $this->withoutMiddleware();
             $this->withoutVite();
    }
   #[Test]
public function generar_exitoso()
{
    $user = \App\Models\Usuario::factory()
        ->withCredencial()
        ->create([
            'id_rol' => 2
        ]);

    $this->actingAs($user, 'web');

    $mockService = Mockery::mock(\App\Services\CurriculumServices\CurriculumService::class);
    $mockPdf = Mockery::mock(\App\Services\ServicioPlantillaCurriculum::class);

    $mockService->shouldReceive('generar')
        ->once()
        ->andReturn(response()->json(['ok' => true], 200));

    $this->app->instance(\App\Services\CurriculumServices\CurriculumService::class, $mockService);
    $this->app->instance(\App\Services\ServicioPlantillaCurriculum::class, $mockPdf);

    $payload = [
        'usuarioId' => $user->id_usuario,
        'datosPersonales' => [
            'nombreCompleto' => 'Froy Test',
            'correo' => 'test@test.com',
            'telefono' => '88888888'
        ],
        'experiencias' => [
            [
                'empresa' => 'Empresa X',
                'puesto' => 'Developer',
                'periodo_inicio' => '2020-01-01',
                'trabajando_actualmente' => true
            ]
        ]
    ];

    $response = $this->postJson('/api/curriculum/generate', $payload);

    $response->assertStatus(200)
             ->assertJson(['ok' => true]);
}

   #[Test]
public function generar_error_controlado()
{
    $user = \App\Models\Usuario::factory()
        ->withCredencial()
        ->create([
            'id_rol' => 2
        ]);

    $this->actingAs($user, 'web');

    $mockService = Mockery::mock(\App\Services\CurriculumServices\CurriculumService::class);
    $mockPdf = Mockery::mock(\App\Services\ServicioPlantillaCurriculum::class);

    $mockService->shouldReceive('generar')
        ->once()
        ->andThrow(new \Exception('Error controlado'));

    $this->app->instance(\App\Services\CurriculumServices\CurriculumService::class, $mockService);
    $this->app->instance(\App\Services\ServicioPlantillaCurriculum::class, $mockPdf);

    $payload = [
        'usuarioId' => $user->id_usuario,
        'datosPersonales' => [
            'nombreCompleto' => 'Froy Test',
            'correo' => 'test@test.com',
            'telefono' => '88888888'
        ],
        'experiencias' => [
            [
                'empresa' => 'Empresa X',
                'puesto' => 'Developer',
                'periodo_inicio' => '2020-01-01',
                'trabajando_actualmente' => true
            ]
        ]
    ];

    $response = $this->postJson('/api/curriculum/generate', $payload);

    $response->assertStatus(500)
             ->assertJson(['ok' => false]);
}

    #[Test]
    public function upload_api_exitoso()
    {
        Storage::fake('public');

        $mockService = Mockery::mock(CurriculumService::class);

        $mockService->shouldReceive('uploadApi')
            ->once()
            ->andReturn(response()->json(['ok' => true], 200));

        $this->app->instance(CurriculumService::class, $mockService);

        $file = UploadedFile::fake()->create('cv.pdf');

        $response = $this->post('/api/curriculum/upload', [
            'curriculum' => $file
        ]);

        $response->assertStatus(200)
                 ->assertJson(['ok' => true]);
    }

    #[Test]
    public function delete_exitoso()
    {
        $mockService = Mockery::mock(CurriculumService::class);

        $mockService->shouldReceive('delete')
            ->once()
            ->andReturn(response()->json(['ok' => true], 200));

        $this->app->instance(CurriculumService::class, $mockService);

        $response = $this->deleteJson('/api/curriculum');

        $response->assertStatus(200)
                 ->assertJson(['ok' => true]);
    }

    #[Test]
public function ver_mi_curriculum_exitoso()
{
    $user = \App\Models\Usuario::factory()->create([
        'id_rol' => 2
    ]);

    $this->actingAs($user);

    $mockService = Mockery::mock(CurriculumService::class);

    $mockService->shouldReceive('vistaVerCurriculum')
        ->once()
        ->andReturn(response()->json(['file' => 'ok'], 200));

    $this->app->instance(CurriculumService::class, $mockService);

    $response = $this->get('/mi-curriculum/ver');

    $response->assertStatus(200)
             ->assertJson(['file' => 'ok']);
}

    #[Test]
    public function obtener_adjuntos_exitoso()
    {
        $mockService = Mockery::mock(CurriculumService::class);

        $mockService->shouldReceive('obtenerAdjuntos')
            ->once()
            ->andReturn(response()->json(['data' => []], 200));

        $this->app->instance(CurriculumService::class, $mockService);

        $response = $this->get('/curriculum/adjuntos');

        $response->assertStatus(200)
                 ->assertJson(['data' => []]);
    }
}
/*
namespace Tests\Feature;

use App\Models\Usuario;
use App\Models\Curriculum;
use App\Services\ServicioPlantillaCurriculum;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

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

   #[Test]
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

  #[Test]
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

    #[Test]
public function puede_subir_un_pdf_y_guardarlo_correctamente()
{
    Storage::fake('public');

    $file = UploadedFile::fake()->create('cv_froy.pdf', 200, 'application/pdf');

    $response = $this->actingAs($this->usuario)
                     ->post(route('api.curriculum.upload'), [ // ← cambio aquí
                         'curriculum' => $file,
                     ]);

    $response->assertStatus(200)
             ->assertJson([
                 'ok' => true,
                 'mensaje' => "Currículum '{$file->getClientOriginalName()}' cargado con éxito.",
             ]);

    $curriculum = Curriculum::where('id_usuario', $this->usuario->id_usuario)->first();
    $this->assertNotNull($curriculum);
    Storage::disk('public')->assertExists($curriculum->ruta_archivo_pdf);
    $this->assertDatabaseHas('curriculum', [
        'id_usuario' => $this->usuario->id_usuario,
        'generado_sistema' => 0,
    ]);
}
    #[Test]
    public function no_puede_subir_si_no_envia_archivo()
    {
        Storage::fake('public');

        $response = $this->actingAs($this->usuario)
            ->post(route('api.curriculum.upload'), []); // sin archivo

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['curriculum']);
    }

    #[Test]
    public function no_puede_subir_archivo_que_no_sea_pdf()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('imagen.jpg', 100, 'image/jpeg');

        $response = $this->actingAs($this->usuario)
            ->post(route('api.curriculum.upload'), [
                'curriculum' => $file,
            ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['curriculum']);
    }

   #[Test]
public function puede_eliminar_un_curriculum_existente()
{
    Storage::fake('public');

    $path = 'CurriculumCargado/test_cv.pdf';

    Storage::disk('public')->put($path, 'contenido falso');

    $curriculum = Curriculum::factory()->create([
        'id_usuario' => $this->usuario->id_usuario,
        'ruta_archivo_pdf' => $path,
        'generado_sistema' => 0,
    ]);

    $response = $this->actingAs($this->usuario)
        ->delete(route('api.curriculum.delete'));

    $response->assertStatus(200)
             ->assertJson([
                 'ok' => true,
                 'mensaje' => 'Currículum eliminado correctamente.',
             ]);
     
    Storage::disk('public')->assertMissing($path);

    $this->assertDatabaseMissing('curriculum', [
        'id_curriculum' => $curriculum->id_curriculum,
    ]);
}

    #[Test]
    public function puede_acceder_a_index_carga_y_obtener_estado_200()
    {
        $response = $this->actingAs($this->usuario)
            ->get(route('curriculum.index'));

        $response->assertStatus(200);
    }
}
*/