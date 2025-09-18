<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

// Esta clase valida los datos enviados para registrar un nuevo usuario.
class RegistroRequest extends FormRequest
{
    // Permite que cualquier usuario realice la solicitud.
    public function authorize(): bool { return true; }

    // Define las reglas de validación para los campos del formulario de registro.
    public function rules(): array
    {
        return [
            // 'nombre' es requerido, debe ser texto y máximo 100 caracteres.
            'nombre'      => ['required','string','max:100'],
            // 'apellido' es requerido, debe ser texto y máximo 100 caracteres.
            'apellido'    => ['required','string','max:100'],
            // 'correo' es requerido, debe ser email, máximo 150 caracteres y único en la tabla 'usuarios'.
            'correo'      => ['required','email','max:150','unique:usuarios,correo'],
            // 'contrasena' es requerido y debe cumplir las reglas por defecto de seguridad.
            // (mínimo 8 caracteres, mayúscula, número, etc.)
            'contrasena'  => ['required', Password::defaults()], // min 8, mayúscula, número, etc. (ajustable)
        ];
    }
}
