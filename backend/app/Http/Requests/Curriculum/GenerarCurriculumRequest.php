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

            'datosPersonales.nombreCompleto' => 'required|string|min:3|max:80',
            'datosPersonales.correo'        => 'required|email|max:255',
            'datosPersonales.telefono'      => ['nullable','regex:/^[0-9]{8}$/'],

            'resumenProfesional' => 'nullable|string|max:600',

            'incluirFotoPerfil' => 'boolean',

            // EDUCACIONES - actualizado
            'educaciones' => 'array',
            'educaciones.*.tipo'         => 'required_with:educaciones.*.titulo|string|in:Título,Certificación,Curso,Diplomado,Técnico',
            'educaciones.*.institucion'  => 'required_with:educaciones.*.titulo|string|min:3|max:100',
            'educaciones.*.titulo'       => 'required_with:educaciones.*.institucion|string|min:3|max:100',
            'educaciones.*.fecha_fin'    => 'required_with:educaciones.*.titulo|date',

            // EXPERIENCIAS - actualizado
            'experiencias' => 'array',
            'experiencias.*.empresa'        => 'required_with:experiencias.*.puesto|string|min:2|max:60',
            'experiencias.*.puesto'         => 'required_with:experiencias.*.empresa|string|min:3|max:60',
            'experiencias.*.periodo_inicio' => 'required_with:experiencias.*.puesto|date',
            'experiencias.*.periodo_fin'    => 'required_with:experiencias.*.puesto|date',
            'experiencias.*.funciones'      => 'nullable|string|max:2000',

            // REFERENCIAS dentro de experiencias - NUEVO
            'experiencias.*.referencias'            => 'array',
            'experiencias.*.referencias.*.nombre'   => 'required_with:experiencias.*.referencias.*.contacto|string|min:3|max:80',
            'experiencias.*.referencias.*.contacto' => ['required_with:experiencias.*.referencias.*.nombre','regex:/^[0-9]{8}$/'],
            'experiencias.*.referencias.*.correo'   => 'nullable|email|max:255',
            'experiencias.*.referencias.*.relacion' => 'required_with:experiencias.*.referencias.*.nombre|string|max:50',

            // HABILIDADES
            'habilidades' => 'array',
            'habilidades.*.descripcion' => 'required_with:habilidades|string|min:2|max:40',

            // IDIOMAS
            'idiomas' => 'array',
            'idiomas.*.nombre' => 'required_with:idiomas.*.nivel|string|min:2|max:15',
            'idiomas.*.nivel'  => 'required_with:idiomas.*.nombre|string|in:A1,A2,B1,B2,C1,C2,Nativo',
        ];
    }

    public function messages(): array
    {
        return [
            'datosPersonales.nombreCompleto.required' => 'El nombre completo es obligatorio.',
            'datosPersonales.nombreCompleto.min' => 'El nombre debe tener al menos 3 caracteres.',
            'datosPersonales.nombreCompleto.max' => 'El nombre no puede exceder 80 caracteres.',
            
            'datosPersonales.correo.required' => 'El correo es obligatorio.',
            'datosPersonales.correo.email' => 'El correo debe ser válido.',
            
            'datosPersonales.telefono.regex' => 'El teléfono debe tener exactamente 8 dígitos.',

            'educaciones.*.tipo.required_with' => 'El tipo de educación es obligatorio.',
            'educaciones.*.tipo.in' => 'El tipo de educación debe ser: Título, Certificación, Curso, Diplomado o Técnico.',
            'educaciones.*.institucion.required_with' => 'La institución es obligatoria.',
            'educaciones.*.titulo.required_with' => 'El título es obligatorio.',
            'educaciones.*.fecha_fin.required_with' => 'La fecha de finalización es obligatoria.',

            'experiencias.*.empresa.required_with' => 'La empresa es obligatoria.',
            'experiencias.*.puesto.required_with' => 'El puesto es obligatorio.',
            'experiencias.*.periodo_inicio.required_with' => 'La fecha de inicio es obligatoria.',
            'experiencias.*.periodo_fin.required_with' => 'La fecha de fin es obligatoria.',

            'experiencias.*.referencias.*.nombre.required_with' => 'El nombre de la referencia es obligatorio.',
            'experiencias.*.referencias.*.contacto.required_with' => 'El teléfono de la referencia es obligatorio.',
            'experiencias.*.referencias.*.contacto.regex' => 'El teléfono debe tener exactamente 8 dígitos.',
            'experiencias.*.referencias.*.correo.email' => 'El correo de la referencia debe ser válido.',
            'experiencias.*.referencias.*.relacion.required_with' => 'La relación con la referencia es obligatoria.',

            'habilidades.*.descripcion.required_with' => 'La descripción de la habilidad es obligatoria.',
            
            'idiomas.*.nombre.required_with' => 'El nombre del idioma es obligatorio.',
            'idiomas.*.nivel.required_with' => 'El nivel del idioma es obligatorio.',
            'idiomas.*.nivel.in' => 'El nivel debe ser: A1, A2, B1, B2, C1, C2 o Nativo.',
        ];
    }
}