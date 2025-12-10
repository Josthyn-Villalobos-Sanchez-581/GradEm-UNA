<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\RegistroServices\RegistroService;
use Inertia\Inertia;

class RegistroController extends Controller
{
    protected $registroService;

    public function __construct(RegistroService $registroService)
    {
        $this->registroService = $registroService;
    }

    public function enviarCodigo(Request $request)
    {
        try {
            return $this->registroService->enviarCodigo($request);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function validarCodigo(Request $request)
    {
        try {
            return $this->registroService->validarCodigo($request);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function registrar(Request $request)
    {
        try {
            return $this->registroService->registrar($request);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function mostrarFormulario()
    {
        return Inertia::render('Registro');
    }

    public function verificarCorreo(Request $request)
    {
        try {
            return $this->registroService->verificarCorreo($request);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function verificarIdentificacion(Request $request)
    {
        try {
            return $this->registroService->verificarIdentificacion($request);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
