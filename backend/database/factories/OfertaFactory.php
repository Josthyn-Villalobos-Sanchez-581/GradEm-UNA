<?php

namespace Database\Factories;

use App\Models\Oferta;
use App\Models\Empresa;
use Illuminate\Database\Eloquent\Factories\Factory;

class OfertaFactory extends Factory
{
    protected $model = Oferta::class;

    public function definition()
    {
        return [
            'id_empresa'        => Empresa::factory(),
            'titulo'            => $this->faker->jobTitle(),
            'descripcion'       => $this->faker->paragraph(),
            'requisitos'        => [],
            'tipo_oferta'       => 'Tiempo completo',
            'estado_id'         => 1,
            'fecha_publicacion' => now(),
            'fecha_limite'      => now()->addDays(30),
        ];
    }
}