<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegistroRequest extends FormRequest
{
    // Permite que cualquier usuario realice la solicitud.
    public function authorize(): bool 
    { 
        return true; 
    }

    // Define las reglas de validación para los campos del formulario de registro.
    public function rules(): array
    {
        return [
            'nombre'      => ['required','string','max:100'],
            'apellido'    => ['required','string','max:100'],
            'correo'      => ['required','email','max:150','unique:usuarios,correo'],
            'contrasena'  => [
                'required',
                'string',
                'min:8',
                'max:15',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%?&])([A-Za-z\d$@$!%?&]|[^ ]){8,15}$/'
            ],
        ];
    }

    // Mensajes personalizados de error en español.
    public function messages(): array
    {
        return [
            'nombre.required'      => 'El nombre es obligatorio.',
            'apellido.required'    => 'El apellido es obligatorio.',
            'correo.required'      => 'El correo es obligatorio.',
            'correo.email'         => 'El formato del correo no es válido.',
            'correo.unique'        => 'Este correo ya está registrado.',
            'contrasena.required'  => 'La contraseña es obligatoria.',
            'contrasena.min'       => 'La contraseña debe tener al menos 8 caracteres.',
            'contrasena.max'       => 'La contraseña no puede superar los 15 caracteres.',
            'contrasena.regex'     => 'La contraseña debe incluir al menos una letra minúscula, una mayúscula, un número, un carácter especial ($ @ $ ! % ? &) y no contener espacios.',
        ];
    }
}

