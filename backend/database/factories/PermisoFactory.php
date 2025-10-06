<?php

namespace Database\Factories;

use App\Models\Permiso;
use Illuminate\Database\Eloquent\Factories\Factory;

class PermisoFactory extends Factory
{
    protected $model = Permiso::class;

    public function definition()
    {
        return [
            'nombre' => 'Permiso ' . $this->faker->unique()->word(),
        ];
    }
}
