<?php

namespace Database\Factories;

use App\Models\Rol;
use Illuminate\Database\Eloquent\Factories\Factory;

class RolFactory extends Factory
{
    protected $model = Rol::class;

    public function definition()
    {
        return [
            'nombre_rol' => 'Rol ' . $this->faker->unique()->word(),
        ];
    }
}
