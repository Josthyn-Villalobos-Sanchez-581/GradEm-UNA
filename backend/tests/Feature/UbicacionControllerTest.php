<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Models\Pais;
use App\Models\Provincia;
//use App\Models\Canton;

class UbicacionControllerTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * ✅ Devuelve lista de países correctamente
     */
    public function test_get_paises_devuelve_lista_correcta()
    {
        $response = $this->getJson('/ubicaciones/paises');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id_pais', 'nombre']
                 ]);

        $this->assertGreaterThan(0, count($response->json()));
    }

    /**
     * ✅ Devuelve provincias de un país existente
     */
    public function test_get_provincias_por_pais()
    {
        $pais = Pais::first();
        $this->assertNotNull($pais, 'Debe existir al menos un país.');

        $response = $this->getJson("/ubicaciones/provincias/{$pais->id_pais}");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id_provincia', 'nombre', 'id_pais']
                 ]);

        foreach ($response->json() as $provincia) {
            $this->assertEquals($pais->id_pais, $provincia['id_pais']);
        }
    }

    /**
     * ✅ Devuelve cantones de una provincia existente
     */
    public function test_get_cantones_por_provincia()
    {
        $provincia = Provincia::first();
        $this->assertNotNull($provincia, 'Debe existir al menos una provincia.');

        $response = $this->getJson("/ubicaciones/cantones/{$provincia->id_provincia}");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id_canton', 'nombre', 'id_provincia']
                 ]);

        foreach ($response->json() as $canton) {
            $this->assertEquals($provincia->id_provincia, $canton['id_provincia']);
        }
    }

    /**
     * 🚫 Devuelve lista vacía si el país no existe
     */
    public function test_get_provincias_con_pais_inexistente_retorna_vacio()
    {
        $response = $this->getJson('/ubicaciones/provincias/99999');

        $response->assertStatus(200)
                 ->assertExactJson([]);
    }

    /**
     * 🚫 Devuelve lista vacía si la provincia no existe
     */
    public function test_get_cantones_con_provincia_inexistente_retorna_vacio()
    {
        $response = $this->getJson('/ubicaciones/cantones/99999');

        $response->assertStatus(200)
                 ->assertExactJson([]);
    }
}
