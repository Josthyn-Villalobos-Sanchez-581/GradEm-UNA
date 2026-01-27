<?php

namespace App\Http\Controllers;

use App\Services\PerfilServices\PerfilService;

use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Support\Facades\Log;

class PerfilController extends Controller
{
    /**
     * Mostrar el perfil del usuario con relación a fotoPerfil cargada
     */
    protected $perfilService;

    public function __construct(PerfilService $perfilService)
    {
        $this->perfilService = $perfilService;
    }

    public function index()
    {
        $datos = $this->perfilService->obtenerDatosPerfil();

        return Inertia::render('Perfil/Index', $datos);
    }
    public function edit()
    {
        $datos = $this->perfilService->obtenerDatosEditar();

        return Inertia::render('Perfil/Editar', $datos);
    }


    public function update(Request $request)
    {
        try {
            $resultado = $this->perfilService->actualizarPerfil($request);

            return redirect($resultado['redirect'])
                ->with('success', $resultado['mensaje']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->validator)->withInput();
        } catch (\Throwable $e) {
            Log::error('Error al actualizar perfil: ' . $e->getMessage());
            return back()->with('error', 'Ocurrió un error al actualizar los datos.')
                ->withInput();
        }
    }


    public function verificarCorreo(Request $request)
    {
        $resultado = $this->perfilService->verificarCorreo($request);

        return response()->json($resultado);
    }



    public function enviarCodigoCorreo(Request $request)
    {
        $resultado = $this->perfilService->enviarCodigoCorreo($request);

        return response()->json($resultado);
    }




    public function validarCodigoCorreo(Request $request)
    {
        $resultado = $this->perfilService->validarCodigoCorreo($request);

        // Si existe un error: responder con código 422
        if (isset($resultado['error'])) {
            return response()->json(['error' => $resultado['error']], 422);
        }

        // Caso exitoso
        return response()->json([
            'message' => $resultado['message'],
            'correoVerificado' => $resultado['correoVerificado']
        ]);
    }


    public function verificarIdentificacion(Request $request)
    {
        $data = $this->perfilService->verificarIdentificacion($request);

        return response()->json($data);
    }

    /* ======================================================
     * CAMBIO DE CONDICIÓN ACADÉMICA
     * ====================================================== */

    public function cambiarCondicionEstudianteAEgresado()
    {
        try {
            $this->perfilService->cambiarEstudianteAEgresado();

            return response()->json([
                'mensaje' => 'Tu condición académica fue actualizada a Egresado.'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 403);
        }
    }

    public function cambiarCondicionEgresadoAEstudiante()
    {
        try {
            $this->perfilService->cambiarEgresadoAEstudiante();

            return response()->json([
                'mensaje' => 'Tu condición académica fue actualizada a Estudiante.'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 403);
        }
    }
}
