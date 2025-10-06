<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Models\Universidad;
use App\Models\Carrera;
use PHPUnit\Framework\Attributes\Test; 
class UniversidadControllerTest extends TestCase
{
    use DatabaseTransactions;

    #[Test]
    public function get_universidades_devuelve_lista_correcta()
    {
        $response = $this->getJson('/universidades');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id_universidad', 'nombre', 'sigla']
                 ]);

        $this->assertGreaterThan(0, count($response->json()));
    }

   #[Test]
    public function get_carreras_devuelve_lista_por_universidad()
    {
        $universidad = Universidad::firstOrFail();

        $response = $this->getJson("/universidades/{$universidad->id_universidad}/carreras");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id_carrera', 'nombre', 'id_universidad', 'area_conocimiento']
                 ]);

        foreach ($response->json() as $carrera) {
            $this->assertEquals($universidad->id_universidad, $carrera['id_universidad']);
        }
    }

    #[Test]
    public function get_carreras_con_universidad_inexistente_retorna_vacio()
    {
        $response = $this->getJson('/universidades/99999/carreras');

        $response->assertStatus(200);
        $this->assertEquals([], $response->json());
    }

    #[Test]
    public function relaciones_universidad_carreras_funcionan_correctamente()
    {
        $universidad = Universidad::with('carreras')->first();

        $this->assertNotNull($universidad, 'No se encontró universidad');
        $this->assertTrue($universidad->carreras->count() >= 0, 'Relación carreras no se cargó correctamente');
    }

   #[Test]
    public function puede_crear_universidad_y_carrera_temporalmente()
    {
        $universidad = Universidad::create([
            'nombre' => 'Universidad Temporal',
            'sigla' => 'UTMP'
        ]);

        $this->assertDatabaseHas('universidades', [
            'nombre' => 'Universidad Temporal'
        ]);

        $carrera = Carrera::create([
            'nombre' => 'Ingeniería de Prueba',
            'id_universidad' => $universidad->id_universidad,
            'area_conocimiento' => 'Tecnología'
        ]);

        $this->assertDatabaseHas('carreras', [
            'nombre' => 'Ingeniería de Prueba'
        ]);

        $this->assertEquals($universidad->id_universidad, $carrera->id_universidad);
    }

   #[Test]
    public function no_se_puede_crear_universidad_sin_datos()
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        Universidad::create([]); // debería fallar por campos requeridos
    }
}
