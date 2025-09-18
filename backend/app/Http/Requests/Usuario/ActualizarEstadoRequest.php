<?php

namespace App\Http\Requests\Usuario;

use Illuminate\Foundation\Http\FormRequest;

// Esta clase valida la solicitud para actualizar el estado de un usuario.
class ActualizarEstadoRequest extends FormRequest
{
    // Permite que cualquier usuario realice la solicitud.
    public function authorize(): bool { return true; }

    // Define las reglas de validación para los datos enviados.
    public function rules(): array
    {
        return [
            // 'estado_id' es requerido, debe ser un entero y existir en la tabla 'catalogo_estados'.
            'estado_id' => ['required','integer','exists:catalogo_estados,id'], // ajusta a tu catálogo
        ];
    }
}
