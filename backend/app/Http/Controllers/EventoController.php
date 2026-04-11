<?php

namespace App\Http\Controllers;

use App\Services\EventoServices\EventoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EventoController extends Controller
{
    protected EventoService $service;

    public function __construct(EventoService $service)
    {
        $this->service = $service;
    }

    /**
     * 📌 Listado de eventos (HU-33 Parte 2)
     * Carga TODO desde el inicio (eventos + FK)
     */
    public function index(Request $request)
    {
        $usuario = Auth::user();

        // 🔐 Permisos del usuario
        $permisos = $usuario
            ? DB::table('roles_permisos')
                ->where('id_rol', $usuario->id_rol)
                ->pluck('id_permiso')
                ->toArray()
            : [];

        return Inertia::render('Eventos/Index', [
            'eventos' => $this->service->obtenerEventosFiltrados(
                $request,
                $usuario
            ),

            // 🔽 FK necesarias para frontend
            'modalidades' => $this->service->obtenerModalidades(),
            'ubicaciones' => $this->service->obtenerUbicaciones(),

            'userPermisos' => $permisos,

            // 🔍 Para mantener filtros en frontend
            'filtros' => $request->only([
                'buscar',
                'estado',
                'fecha_inicio',
                'fecha_fin'
            ]),
        ]);
    }

    /**
     * 📌 Publicar evento
     */
    public function publicar(int $idEvento)
    {
        try {
            $this->service->publicarEvento($idEvento);

            return response()->json([
                'success' => true,
                'message' => 'El evento ha sido publicado con éxito',
            ]);

        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 📌 Inactivar evento (HU-33 Parte 2 🔥)
     */
    public function destroy(Request $request, int $idEvento)
    {
        $request->validate([
            'motivo' => 'required|min:10',
        ]);

        try {
            $this->service->inactivarEvento(
                $idEvento,
                $request->motivo
            );

            return response()->json([
                'success' => true,
                'message' => 'Evento inactivado correctamente',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 📌 Obtener detalle de evento (para modal si lo querés dinámico)
     */
    public function show(int $idEvento)
    {
        try {
            $evento = $this->service->obtenerEventoCompleto($idEvento);

            return response()->json([
                'success' => true,
                'evento' => $evento,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }
}