<?php

namespace Tests\Unit\Repositories;

use Tests\TestCase;
use App\Repositories\CurriculumRepositories\CurriculumRepository;
use App\Models\Usuario;
use App\Models\Curriculum;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Test;

class CurriculumRepositoryTest extends TestCase
{
    use DatabaseTransactions;

    private CurriculumRepository $repo;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->repo = new CurriculumRepository();
    }

    #[Test]
    public function puede_buscar_curriculum_por_usuario()
    {
        $usuario = Usuario::factory()->create();

        $curriculum = Curriculum::create([
            'id_usuario' => $usuario->id_usuario,
            'ruta_archivo_pdf' => 'test.pdf',
            'fecha_subida' => now()
        ]);

        $resultado = $this->repo->findByUser($usuario->id_usuario);

        $this->assertNotNull($resultado);
        $this->assertEquals($curriculum->id, $resultado->id);
    }

    #[Test]
    public function retorna_null_si_no_existe_curriculum()
    {
        $usuario = Usuario::factory()->create();

        $resultado = $this->repo->findByUser($usuario->id_usuario);

        $this->assertNull($resultado);
    }

    #[Test]
    public function puede_crear_curriculum()
    {
        $usuario = Usuario::factory()->create();

        $data = [
            'id_usuario' => $usuario->id_usuario,
            'ruta_archivo_pdf' => 'archivo.pdf',
            'fecha_subida' => now()
        ];

        $curriculum = $this->repo->create($data);

        $this->assertDatabaseHas('curriculum', [
            'id_usuario' => $usuario->id_usuario,
            'ruta_archivo_pdf' => 'archivo.pdf'
        ]);

        $this->assertNotNull($curriculum);
    }

    #[Test]
    public function puede_actualizar_o_crear_curriculum()
    {
        $usuario = Usuario::factory()->create();

        // Primera vez (create)
        $this->repo->updateOrCreate(
            ['id_usuario' => $usuario->id_usuario],
            ['ruta_archivo_pdf' => 'uno.pdf']
        );

        // Segunda vez (update)
        $this->repo->updateOrCreate(
            ['id_usuario' => $usuario->id_usuario],
            ['ruta_archivo_pdf' => 'dos.pdf']
        );

        $this->assertDatabaseHas('curriculum', [
            'id_usuario' => $usuario->id_usuario,
            'ruta_archivo_pdf' => 'dos.pdf'
        ]);
    }

    #[Test]
    public function elimina_archivo_si_existe()
    {
        Storage::disk('public')->put('archivo.pdf', 'fake');

        $resultado = $this->repo->deleteFileIfExists('archivo.pdf');

        $this->assertTrue($resultado);
        Storage::disk('public')->assertMissing('archivo.pdf');
    }

    #[Test]
    public function no_elimina_archivo_si_no_existe()
    {
        $resultado = $this->repo->deleteFileIfExists('no_existe.pdf');

        $this->assertFalse($resultado);
    }

    #[Test]
    public function puede_eliminar_registro()
    {
        $usuario = Usuario::factory()->create();

        $curriculum = Curriculum::create([
            'id_usuario' => $usuario->id_usuario,
            'ruta_archivo_pdf' => 'test.pdf',
            'fecha_subida' => now()
        ]);

        $resultado = $this->repo->deleteRecord($curriculum);

        $this->assertTrue($resultado);
        $this->assertDatabaseMissing('curriculum', [
            'id_usuario' => $usuario->id_usuario
        ]);
    }
}