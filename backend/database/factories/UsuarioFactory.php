<?php

namespace Database\Factories;

use App\Models\Usuario;
use App\Models\Credencial;
use Illuminate\Database\Eloquent\Factories\Factory;

class UsuarioFactory extends Factory
{
    protected $model = Usuario::class;

    public function definition()
    {
        return [
            'nombre_completo' => $this->faker->name,
            'correo' => $this->faker->unique()->safeEmail,
            'identificacion' => $this->faker->unique()->numerify('ID######'),
            'telefono' => $this->faker->numerify('6#######'),
            'id_rol' => 1,
            'fecha_registro' => now(),
            'estado_id' => 1,
            'id_universidad' => 1,
            'id_carrera' => 1,
        ];
    }

    // Crear usuario con credencial automáticamente
    public function withCredencial($password = 'Password123!')
    {
        return $this->afterCreating(function (Usuario $usuario) use ($password) {
            Credencial::create([
                'id_usuario' => $usuario->id_usuario,
                'hash_contrasena' => bcrypt($password),
            ]);
        });
    }
}
