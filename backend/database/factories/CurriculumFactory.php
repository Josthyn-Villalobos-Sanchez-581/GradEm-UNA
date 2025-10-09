<?php

namespace Database\Factories;

use App\Models\Curriculum;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class CurriculumFactory extends Factory
{
    protected $model = Curriculum::class;

    public function definition()
    {
        return [
            'id_usuario' => Usuario::factory(), // crea un usuario asociado
            'generado_sistema' => $this->faker->boolean(),
            'ruta_archivo_pdf' => 'curriculum/fake_cv_' . $this->faker->uuid . '.pdf',
            'fecha_creacion' => Carbon::now('America/Costa_Rica'),
        ];
    }
}
