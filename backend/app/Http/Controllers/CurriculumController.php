<?php

namespace App\Http\Controllers;

use App\Http\Requests\Curriculum\GenerarCurriculumRequest;
use App\Services\ServicioPlantillaCurriculum;
use Illuminate\Support\Facades\DB;

class CurriculumController extends Controller
{
	protected ServicioPlantillaCurriculum $servicio;

	public function __construct(ServicioPlantillaCurriculum $servicio)
	{
		$this->servicio = $servicio;
	}

	public function generar(GenerarCurriculumRequest $request)
	{
		$payload = $request->validated();

		// Genera PDF
		$ruta = $this->servicio->generarPdf($payload);

		// Guarda en BD vía SP transaccional
		DB::statement('CALL sp_guardar_curriculum(?, ?, ?, ?, ?, ?, ?)', [
			$payload['usuarioId'],
			$ruta,
			json_encode($payload['educaciones'] ?? []),
			json_encode($payload['experiencias'] ?? []),
			json_encode($payload['habilidades'] ?? []),
			json_encode($payload['idiomas'] ?? []),
			json_encode($payload['referencias'] ?? []),
		]);

		// Opcional: registrar en bitácora_cambios
		DB::table('bitacora_cambios')->insert([
			'tabla_afectada' => 'curriculum',
			'operacion' => 'UPSERT',
			'usuario_responsable' => $payload['usuarioId'],
			'descripcion_cambio' => 'Generación de CV y actualización de detalles',
		]);

		return response()->json([
			'ok' => true,
			'mensaje' => 'Currículum generado correctamente.',
			'rutaPublica' => asset('storage/' . $ruta),
		]);
	}
}
