<?php

namespace Database\Factories;

use App\Models\Postulacion;
use App\Models\Usuario;
use App\Models\Oferta;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostulacionFactory extends Factory
{
    protected $model = Postulacion::class;

    public function definition()
    {
        return [
            'id_usuario'        => Usuario::factory(),
            'id_oferta'         => Oferta::factory(),
            'mensaje'           => $this->faker->sentence(),
            'fecha_postulacion' => now(),
            'estado_id'         => 1,
        ];
    }
    
}