<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Services\RolesPermisosServices\RolesPermisosService;

class RolesPermisosController extends Controller
{
    protected RolesPermisosService $rolesPermisosService;

    public function __construct(RolesPermisosService $rolesPermisosService)
    {
        $this->rolesPermisosService = $rolesPermisosService;
    }

    public function index(Request $request)
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return redirect()->route('login');
        }

        $searchRol       = $request->input('searchRol');
        $searchPermiso   = $request->input('searchPermiso');
        $visibleSections = $request->input('visibleSections', ['roles', 'permisos', 'asignacion']);

        $datosVista = $this->rolesPermisosService->obtenerDatosIndex(
            usuario: $usuario,
            searchRol: $searchRol,
            searchPermiso: $searchPermiso,
            visibleSections: $visibleSections
        );

        return Inertia::render('Roles_Permisos/Index', $datosVista);
    }

    public function asignarPermisos(Request $request, $rolId)
    {
        $request->validate([
            'permisos'   => 'required|array|min:1',
            'permisos.*' => 'exists:permisos,id_permiso',
        ]);

        $this->rolesPermisosService->asignarPermisosARol(
            rolId: (int) $rolId,
            permisosIds: array_unique($request->permisos)
        );

        return back()->with('success', 'Permisos actualizados correctamente.');
    }
}
