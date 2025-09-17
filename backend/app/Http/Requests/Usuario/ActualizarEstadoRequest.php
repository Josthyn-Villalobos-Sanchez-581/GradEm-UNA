<?php

namespace App\Http\Requests\Usuario;

use Illuminate\Foundation\Http\FormRequest;

class ActualizarEstadoRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'estado_id' => ['required','integer','exists:catalogo_estados,id'], // ajusta a tu catálogo
        ];
    }
}
