<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RestablecerContrasenaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'token'        => ['required','string'],
            'correo'       => ['required','email'],
            'contrasena'   => [
                'required',
                'string',
                'min:8',
                'max:15',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%?&])([A-Za-z\d$@$!%?&]|[^ ]){8,15}$/',
                'confirmed', // usa campo contrasena_confirmation
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required'         => 'El token es obligatorio.',
            'correo.required'        => 'El correo es obligatorio.',
            'correo.email'           => 'El formato del correo no es válido.',
            'contrasena.required'    => 'La contraseña es obligatoria.',
            'contrasena.min'         => 'La contraseña debe tener al menos 8 caracteres.',
            'contrasena.max'         => 'La contraseña no puede superar los 15 caracteres.',
            'contrasena.regex'       => 'La contraseña debe incluir minúscula, mayúscula, número, un carácter especial ($ @ $ ! % ? &) y no contener espacios.',
            'contrasena.confirmed'   => 'Las contraseñas no coinciden.',
        ];
    }
}
