<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

// Esta clase maneja la validación de los datos enviados en el login simple.
class LoginSimpleRequest extends FormRequest
{
    // Permite que cualquier usuario realice la solicitud.
    public function authorize(): bool { return true; }

    // Define las reglas de validación para los campos del formulario de login.
    public function rules(): array
    {
        return [
            // El campo 'correo' es requerido y debe tener formato de email.
            'correo'     => ['required','email'],
            // El campo 'contrasena' es requerido y debe ser una cadena de texto.
            'contrasena' => ['required','string'],
        ];
    }
}
