<?php

namespace Tests\Repositories\PlataformaExternaRepository;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Repositories\PlataformaExternaRepository\PlataformaExternaRepository;
use App\Models\Usuario;
use App\Models\PlataformaExterna;

class PlataformaExternaRepositoryTest extends TestCase
{
    use DatabaseTransactions;

    private PlataformaExternaRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new PlataformaExternaRepository();
    }

    public function test_crear_plataforma()
    {
        $usuario = Usuario::factory()->create();

        $plataforma = $this->repository->crear([
            'id_usuario' => $usuario->id_usuario,
            'tipo' => 'github',
            'url' => 'https://github.com/test'
        ]);

        $this->assertInstanceOf(PlataformaExterna::class, $plataforma);

        $this->assertDatabaseHas('plataformas_externas', [
            'id_usuario' => $usuario->id_usuario,
            'tipo' => 'github'
        ]);
    }

    public function test_obtener_plataformas_por_usuario()
    {
        $usuario = Usuario::factory()->create();

        PlataformaExterna::create([
            'id_usuario' => $usuario->id_usuario,
            'tipo' => 'github',
            'url' => 'https://github.com/test'
        ]);

        PlataformaExterna::create([
            'id_usuario' => $usuario->id_usuario,
            'tipo' => 'linkedin',
            'url' => 'https://linkedin.com/test'
        ]);

        $resultado = $this->repository->obtenerPorUsuario($usuario->id_usuario);

        $this->assertCount(2, $resultado);
    }

    public function test_obtener_plataforma_por_id()
    {
        $usuario = Usuario::factory()->create();

        $plataforma = PlataformaExterna::create([
            'id_usuario' => $usuario->id_usuario,
            'tipo' => 'github',
            'url' => 'https://github.com/test'
        ]);

        $resultado = $this->repository->obtenerPorId($plataforma->id_plataforma);

        $this->assertEquals($plataforma->id_plataforma, $resultado->id_plataforma);
    }

    public function test_eliminar_plataforma()
    {
        $usuario = Usuario::factory()->create();

        $plataforma = PlataformaExterna::create([
            'id_usuario' => $usuario->id_usuario,
            'tipo' => 'github',
            'url' => 'https://github.com/test'
        ]);

        $this->repository->eliminar($plataforma);

        $this->assertDatabaseMissing('plataformas_externas', [
            'id_plataforma' => $plataforma->id_plataforma
        ]);
    }
}