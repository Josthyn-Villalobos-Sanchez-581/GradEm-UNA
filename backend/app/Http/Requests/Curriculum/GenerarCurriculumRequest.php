<?php

namespace App\Http\Requests\Curriculum;

use Illuminate\Foundation\Http\FormRequest;

class GenerarCurriculumRequest extends FormRequest
{
    /**
     * Autoriza la solicitud (puedes ajustar a tu lógica de permisos).
     */
    public function authorize(): bool
    {
        
        /** @var \Illuminate\Contracts\Auth\Guard $guard */
    $guard = auth();
    return $guard->check();
    }

    /**
     * Reglas de validación para generar el currículum.
     * Nota: Teléfonos CR deben ser exactamente 8 dígitos (sin espacios ni símbolos).
     */
    public function rules(): array
    {
        return [
            'usuarioId' => 'required|integer',

            'datosPersonales.nombreCompleto' => 'required|string|max:255',
            'datosPersonales.correo'        => 'required|email',
            // ✅ Teléfono CR: exactamente 8 dígitos numéricos
            'datosPersonales.telefono'      => ['nullable','regex:/^[0-9]{8}$/'],

            'resumenProfesional' => 'nullable|string|max:2000',

            'educaciones' => 'array',
            'educaciones.*.institucion'  => 'required_with:educaciones.*.titulo|string|max:255',
            'educaciones.*.titulo'       => 'required_with:educaciones.*.institucion|string|max:255',
            'educaciones.*.fecha_inicio' => 'nullable|date',
            'educaciones.*.fecha_fin'    => 'nullable|date',

            'experiencias' => 'array',
            'experiencias.*.empresa'        => 'required_with:experiencias.*.puesto|string|max:255',
            'experiencias.*.puesto'         => 'required_with:experiencias.*.empresa|string|max:255',
            'experiencias.*.periodo_inicio' => 'nullable|date',
            'experiencias.*.periodo_fin'    => 'nullable|date',
            'experiencias.*.funciones'      => 'nullable|string|max:1000',

            'habilidades' => 'array',
            'habilidades.*.descripcion' => 'required|string|max:255',

            // ✅ Idiomas (nombre + nivel MCER)
            'idiomas' => 'array',
            'idiomas.*.nombre' => 'required|string|max:100',
            'idiomas.*.nivel'  => 'required|in:A1,A2,B1,B2,C1,C2,Nativo',

            'referencias' => 'array',
            'referencias.*.nombre'   => 'required|string|max:255',
            // ✅ Teléfono CR para contacto en referencias (obligatorio)
            'referencias.*.contacto' => ['required','regex:/^[0-9]{8}$/'],
            'referencias.*.relacion' => 'nullable|string|max:255',
        ];
    }

    /**
     * Mensajes de error personalizados.
     */
    public function messages(): array
    {
        return [
            'datosPersonales.telefono.regex'   => 'El teléfono debe tener exactamente 8 dígitos (Costa Rica).',
            'referencias.*.contacto.regex'     => 'El teléfono de la referencia debe tener exactamente 8 dígitos (Costa Rica).',

            'idiomas.*.nombre.required' => 'El nombre del idioma es obligatorio.',
            'idiomas.*.nivel.required'  => 'Debe seleccionar el nivel MCER.',
        ];
    }
}
