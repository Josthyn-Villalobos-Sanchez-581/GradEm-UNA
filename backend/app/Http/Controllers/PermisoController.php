<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Services\PermisoServices\PermisoService;

class PermisoController extends Controller
{
    protected PermisoService $permisoService;

    public function __construct(PermisoService $permisoService)
    {
        $this->permisoService = $permisoService;
    }

    public function index()
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return redirect()->route('login');
        }

        $datosVista = $this->permisoService->obtenerDatosIndex($usuario);

        return Inertia::render('Roles_Permisos/Index', $datosVista);
    }

    public function create()
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return redirect()->route('login');
        }

        $datosVista = $this->permisoService->obtenerDatosCreate($usuario);

        return Inertia::render('Roles_Permisos/Permisos/Create', $datosVista);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:50', Rule::unique('permisos', 'nombre')],
        ]);

        $this->permisoService->crearPermiso($data['nombre']);

        return redirect()
            ->route('roles_permisos.index')
            ->with('success', 'Permiso creado correctamente.');
    }

    public function edit($id)
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return redirect()->route('login');
        }

        $datosVista = $this->permisoService->obtenerDatosEdit((int) $id, $usuario);

        return Inertia::render('Roles_Permisos/Permisos/Edit', $datosVista);
    }

    public function update(Request $request, $id)
    {
        $permisoId = (int) $id;

        $data = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:50',
                Rule::unique('permisos', 'nombre')->ignore($permisoId, 'id_permiso'),
            ],
        ]);

        $this->permisoService->actualizarPermiso($permisoId, $data['nombre']);

        return redirect()
            ->route('roles_permisos.index')
            ->with('success', 'Permiso actualizado correctamente.');
    }

    public function destroy($id)
    {
        $permisoId = (int) $id;

        $mensajeError = $this->permisoService->intentarEliminarPermiso($permisoId);

        if ($mensajeError) {
            return redirect()
                ->route('roles_permisos.index')
                ->withErrors(['error' => $mensajeError]);
        }

        return redirect()
            ->route('roles_permisos.index')
            ->with('success', 'Permiso eliminado correctamente.');
    }
}
