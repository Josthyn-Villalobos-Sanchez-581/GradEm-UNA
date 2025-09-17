<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegistroRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nombre'      => ['required','string','max:100'],
            'apellido'    => ['required','string','max:100'],
            'correo'      => ['required','email','max:150','unique:usuarios,correo'],
            'contrasena'  => ['required', Password::defaults()], // min 8, mayúscula, número, etc. (ajustable)
        ];
    }
}
