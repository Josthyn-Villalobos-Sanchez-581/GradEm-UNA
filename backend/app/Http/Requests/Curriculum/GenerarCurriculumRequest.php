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
        return auth()->check();
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
            // Teléfono CR: exactamente 8 dígitos numéricos
            'datosPersonales.telefono'      => ['nullable','regex:/^[0-9]{8}$/'],

            'resumenProfesional' => 'nullable|string|max:2000',

            // NUEVO: bandera para incluir foto en el CV
            'incluirFotoPerfil' => 'boolean',

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
            // Requerido solo si se agrega una habilidad
            'habilidades.*.descripcion' => 'required_with:habilidades|string|max:255',

            // Idiomas: par nombre/nivel opcional, pero si se envía uno se exige el otro
            'idiomas' => 'array',
            'idiomas.*.nombre' => 'required_with:idiomas.*.nivel|string|max:100',
            'idiomas.*.nivel'  => 'required_with:idiomas.*.nombre|string|max:50',

            // Referencias: par nombre/contacto opcional, si se envía uno se exige el otro
            'referencias' => 'array',
            'referencias.*.nombre'    => 'required_with:referencias.*.contacto|string|max:255',
            'referencias.*.contacto'  => ['required_with:referencias.*.nombre','regex:/^[0-9]{8}$/'],
            'referencias.*.relacion'  => 'nullable|string|max:255',

            // Certificaciones: nombre requerido si se agrega, institución y fecha opcionales
            'certificaciones' => 'array',
            'certificaciones.*.nombre' => 'required_with:certificaciones.*.institucion,certificaciones.*.fecha_obtencion|string|max:100',
            'certificaciones.*.institucion' => 'nullable|string|max:80',
            'certificaciones.*.fecha_obtencion' => 'nullable|date|before_or_equal:today',
        ];
    }

    /**
     * Mensajes de error personalizados.
     */
    public function messages(): array
    {
        return [
            'datosPersonales.telefono.regex' => 'El teléfono debe tener exactamente 8 dígitos (Costa Rica).',

            'habilidades.*.descripcion.required_with' => 'La descripción de la habilidad es obligatoria cuando agregas una habilidad.',

            'idiomas.*.nombre.required_with' => 'El nombre del idioma es obligatorio cuando especificas el nivel.',
            'idiomas.*.nivel.required_with'  => 'Debes indicar el nivel del idioma cuando especificas el nombre.',

            'referencias.*.contacto.regex'        => 'El teléfono de la referencia debe tener exactamente 8 dígitos (Costa Rica).',
            'referencias.*.nombre.required_with'  => 'El nombre de la referencia es obligatorio cuando indicas el teléfono.',
            'referencias.*.contacto.required_with'=> 'El teléfono de la referencia es obligatorio cuando indicas el nombre.',

            'certificaciones.*.nombre.required_with' => 'El nombre de la certificación es obligatorio cuando agregas una certificación.',
            'certificaciones.*.fecha_obtencion.before_or_equal' => 'La fecha de obtención no puede ser futura.',
        ];
    }
}