<?php

namespace App\Http\Requests\Curriculum;

use Illuminate\Foundation\Http\FormRequest;

class GenerarCurriculumRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'usuarioId' => 'required|integer',

            'datosPersonales.nombreCompleto' => 'required|string|max:255',
            'datosPersonales.correo'        => 'required|email',
            'datosPersonales.telefono'      => 'nullable|string|max:30',

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

            // ✅ Ahora idiomas es libre: nombre + nivel MCER
            'idiomas' => 'array',
            'idiomas.*.nombre' => 'required|string|max:100',
            'idiomas.*.nivel'  => 'required|in:A1,A2,B1,B2,C1,C2,Nativo',

            'referencias' => 'array',
            'referencias.*.nombre'   => 'required|string|max:255',
            'referencias.*.contacto' => 'required|string|max:255',
            'referencias.*.relacion' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'idiomas.*.nombre.required' => 'El nombre del idioma es obligatorio.',
            'idiomas.*.nivel.required'  => 'Debe seleccionar el nivel MCER.',
        ];
    }
}
