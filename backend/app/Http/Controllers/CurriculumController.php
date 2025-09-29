<?php

namespace App\Http\Controllers;

use App\Http\Requests\Curriculum\GenerarCurriculumRequest;
use App\Services\ServicioPlantillaCurriculum;

class CurriculumController extends Controller
{
    public function generar(GenerarCurriculumRequest $request, ServicioPlantillaCurriculum $servicio)
    {
        $data = $request->validated();

        $rutaRel = $servicio->generarPdf($data);

        return response()->json([
            'ok'          => true,
            'rutaPublica' => asset('storage/' . $rutaRel),
            'mensaje'     => 'Currículum generado correctamente.',
        ]);
    }
}
