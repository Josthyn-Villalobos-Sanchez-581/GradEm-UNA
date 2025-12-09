<?php

namespace App\Http\Controllers;

use App\Services\EmpresaServices\EmpresaService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmpresaController extends Controller
{
    protected $empresaService;

    public function __construct(EmpresaService $empresaService)
    {
        $this->empresaService = $empresaService;
    }

    public function enviarCodigo(Request $request)
    {
        try {
            return $this->empresaService->enviarCodigo($request);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function validarCodigo(Request $request)
    {
        try {
            return $this->empresaService->validarCodigo($request);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function store(Request $request)
    {
        try {
            return $this->empresaService->registrar($request);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function verificarIdentificacion(Request $request)
    {
        try {
            return $this->empresaService->verificarIdentificacion($request);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
