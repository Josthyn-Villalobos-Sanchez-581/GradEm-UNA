<?php

namespace Database\Factories;

use App\Models\DocumentoAdjunto;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

class DocumentoAdjuntoFactory extends Factory
{
    protected $model = DocumentoAdjunto::class;

    public function definition()
    {
        return [
            'id_usuario' => Usuario::factory(),
            'tipo' => 'certificado',
            'ruta_archivo' => 'certificados/' . $this->faker->uuid . '.pdf',
            'fecha_subida' => now(),
        ];
    }
}
