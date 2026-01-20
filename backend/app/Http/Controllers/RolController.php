<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Services\RolServices\RolService;

class RolController extends Controller
{
    protected RolService $rolService;

    public function __construct(RolService $rolService)
    {
        $this->rolService = $rolService;
    }

    public function index(Request $request)
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return redirect()->route('login');
        }

        $searchRol      = $request->input('searchRol');
        $searchPermiso  = $request->input('searchPermiso');
        $visibleSections = $request->input('visibleSections', ['roles', 'permisos', 'asignacion']);

        $datosVista = $this->rolService->obtenerDatosIndex(
            searchRol: $searchRol,
            searchPermiso: $searchPermiso,
            visibleSections: $visibleSections,
            usuario: $usuario
        );

        return Inertia::render('Roles_Permisos/Index', $datosVista);
    }

    public function create()
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return redirect()->route('login');
        }

        $datosVista = $this->rolService->obtenerDatosCreate($usuario);

        return Inertia::render('Roles_Permisos/Roles/Create', $datosVista);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_rol' => 'required|string|max:255|unique:roles,nombre_rol',
        ]);

        $this->rolService->crearRol($request->nombre_rol);

        return redirect()
            ->route('roles_permisos.index')
            ->with('success', 'Rol creado correctamente. Recuerda asignarle permisos.');
    }

    public function edit($id)
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return redirect()->route('login');
        }

        $datosVista = $this->rolService->obtenerDatosEdit((int) $id, $usuario);

        return Inertia::render('Roles_Permisos/Roles/Edit', $datosVista);
    }

    public function update(Request $request, $id)
    {
        $rolId = (int) $id;

        $request->validate([
            'nombre_rol' => [
                'required',
                'string',
                'max:50',
                Rule::unique('roles', 'nombre_rol')->ignore($rolId, 'id_rol'),
            ],
        ]);

        $this->rolService->actualizarRol($rolId, $request->nombre_rol);

        return redirect()
            ->route('roles_permisos.index')
            ->with('success', 'Rol actualizado correctamente.');
    }

    public function destroy($id)
    {
        $this->rolService->eliminarRol((int) $id);

        return back();
    }
}
