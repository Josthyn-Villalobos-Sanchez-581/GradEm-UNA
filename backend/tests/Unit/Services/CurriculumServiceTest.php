<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\CurriculumServices\CurriculumService;
use App\Repositories\CurriculumRepositories\CurriculumRepository;
use App\Services\ServicioPlantillaCurriculum;
use App\Models\Usuario;
use App\Models\Curriculum;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Mockery;
use PHPUnit\Framework\Attributes\Test;

class CurriculumServiceTest extends TestCase
{
    use DatabaseTransactions;

    private $repo;
    private $service;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->repo = Mockery::mock(CurriculumRepository::class);
        $this->service = new CurriculumService($this->repo);
    }

    #[Test]
    public function puede_generar_curriculum()
    {
        $usuario = Usuario::factory()->create();

        $request = Mockery::mock();
        $request->shouldReceive('validated')->andReturn([
            'usuarioId' => $usuario->id_usuario
        ]);

        $servicioPdf = Mockery::mock(ServicioPlantillaCurriculum::class);
        $servicioPdf->shouldReceive('generarPdf')
            ->once()
            ->andReturn('curriculum/test.pdf');

        $this->repo
            ->shouldReceive('findByUser')
            ->once()
            ->andReturn(null);

        $this->repo
            ->shouldReceive('updateOrCreate')
            ->once();

        $response = $this->service->generar($request, $servicioPdf);

        $this->assertTrue($response->getData()->ok);
    }

    #[Test]
    public function elimina_archivo_anterior_si_existe()
    {
        $usuario = Usuario::factory()->create();

        Storage::disk('public')->put('curriculum/viejo.pdf', 'fake');

        $curriculum = new Curriculum();
        $curriculum->ruta_archivo_pdf = 'curriculum/viejo.pdf';

        $request = Mockery::mock();
        $request->shouldReceive('validated')->andReturn([
            'usuarioId' => $usuario->id_usuario
        ]);

        $servicioPdf = Mockery::mock(ServicioPlantillaCurriculum::class);
        $servicioPdf->shouldReceive('generarPdf')
            ->andReturn('curriculum/nuevo.pdf');

        $this->repo
            ->shouldReceive('findByUser')
            ->andReturn($curriculum);

        $this->repo
            ->shouldReceive('updateOrCreate')
            ->once();

        $this->service->generar($request, $servicioPdf);

        Storage::disk('public')->assertMissing('curriculum/viejo.pdf');
    }

    #[Test]
    public function puede_eliminar_curriculum()
    {
        $usuario = Usuario::factory()->create();
        Auth::login($usuario);

        Storage::disk('public')->put('curriculum/test.pdf', 'fake');

        $curriculum = new Curriculum();
        $curriculum->ruta_archivo_pdf = 'curriculum/test.pdf';

        $this->repo
            ->shouldReceive('findByUser')
            ->once()
            ->andReturn($curriculum);

        $this->repo
            ->shouldReceive('deleteRecord')
            ->once();

        $response = $this->service->delete(null);

        $this->assertTrue($response->getData()->ok);
        Storage::disk('public')->assertMissing('curriculum/test.pdf');
    }

    #[Test]
    public function retorna_404_si_no_hay_curriculum()
    {
        $usuario = Usuario::factory()->create();
        Auth::login($usuario);

        $this->repo
            ->shouldReceive('findByUser')
            ->once()
            ->andReturn(null);

        $response = $this->service->delete(null);

        $this->assertEquals(404, $response->status());
    }

    #[Test]
public function puede_subir_curriculum()
{
    Storage::fake('public');

    $usuario = Usuario::factory()->create();
    Auth::login($usuario);

    // Archivo fake
    $file = \Illuminate\Http\UploadedFile::fake()->create('cv.pdf', 100);

    $request = Mockery::mock();
    $request->shouldReceive('validate')->once();
    $request->shouldReceive('file')->with('curriculum')->andReturn($file);

    // No hay registro previo
    $this->repo
        ->shouldReceive('findByUser')
        ->once()
        ->andReturn(null);

    // Se crea nuevo registro
    $this->repo
        ->shouldReceive('create')
        ->once();

    $response = $this->service->uploadApi($request);

    $this->assertTrue($response->getData()->ok);

    // Verifica que el archivo se guardó
    $files = Storage::disk('public')->allFiles('CurriculumCargado');

$this->assertNotEmpty($files);
}
#[Test]
public function falla_si_hay_error_y_hace_rollback()
{
    Storage::fake('public');

    $usuario = Usuario::factory()->create();
    Auth::login($usuario);

    $file = \Illuminate\Http\UploadedFile::fake()->create('cv.pdf', 100);

    $request = Mockery::mock();
    $request->shouldReceive('validate')->once();
    $request->shouldReceive('file')->andReturn($file);

    $this->repo
        ->shouldReceive('findByUser')
        ->andReturn(null);

    // Forzar error en create
    $this->repo
        ->shouldReceive('create')
        ->andThrow(new \Exception('Error forzado'));

    $response = $this->service->uploadApi($request);

    $this->assertFalse($response->getData()->ok);
    $this->assertEquals(500, $response->status());
}
}