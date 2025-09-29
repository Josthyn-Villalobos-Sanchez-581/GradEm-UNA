<?php

namespace App\Http\Requests\Curriculum;

use Illuminate\Foundation\Http\FormRequest;

class GenerarCurriculumRequest extends FormRequest
{
	// PEL06: comentarios en bloque
	// Valida payload con reglas espejo a las del frontend
	public function authorize(): bool { return true; }

	public function rules(): array
	{
		return [
			'usuarioId' => ['required','integer','exists:usuarios,id_usuario'],
			'datosPersonales.nombreCompleto' => ['required','string','max:100'],
			'datosPersonales.correo' => ['required','email','max:100'],
			'datosPersonales.telefono' => ['nullable','string','max:20'],
			'resumenProfesional' => ['nullable','string','max:2000'],

			'educaciones' => ['array'],
			'educaciones.*.institucion' => ['required','string','max:100'],
			'educaciones.*.titulo' => ['required','string','max:100'],
			'educaciones.*.fecha_inicio' => ['nullable','date'],
			'educaciones.*.fecha_fin' => ['nullable','date','after_or_equal:educaciones.*.fecha_inicio'],

			'experiencias' => ['array'],
			'experiencias.*.empresa' => ['required','string','max:100'],
			'experiencias.*.puesto' => ['required','string','max:100'],
			'experiencias.*.periodo_inicio' => ['nullable','date'],
			'experiencias.*.periodo_fin' => ['nullable','date'],

			'habilidades' => ['array'],
			'habilidades.*.descripcion' => ['required','string','max:100'],

			'idiomas' => ['array'],
			'idiomas.*.id_idioma_catalogo' => ['required','integer','exists:idiomas_catalogo,id_idioma_catalogo'],
			'idiomas.*.nivel' => ['required','string','max:50'],

			'referencias' => ['array'],
			'referencias.*.nombre' => ['required','string','max:100'],
			'referencias.*.contacto' => ['required','string','max:100'],
			'referencias.*.relacion' => ['required','string','max:100'],
		];
	}

	public function messages(): array
	{
		return [
			'usuarioId.required' => 'El usuario es obligatorio.',
			'datosPersonales.nombreCompleto.required' => 'El nombre completo es obligatorio.',
			// ... agrega mensajes específicos si lo deseas
		];
	}
}
