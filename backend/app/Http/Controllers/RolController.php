<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use App\Models\Permiso;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RolController extends Controller
{
    public function index(Request $request)
    {
        $searchRol = $request->input('searchRol');
        $searchPermiso = $request->input('searchPermiso');

        $roles = Rol::with('permisos')
            ->when($searchRol, fn($q) => $q->where('nombre_rol', 'like', "%$searchRol%"))
            ->paginate(10)->withQueryString();

        $permisos = Permiso::when($searchPermiso, fn($q) => $q->where('nombre', 'like', "%$searchPermiso%"))
            ->paginate(10)->withQueryString();

        $usuario = Auth::user();
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        return Inertia::render('Roles_Permisos/Index', [
            'roles' => $roles,
            'permisos' => $permisos,
            'todosPermisos' => Permiso::all(['id_permiso', 'nombre']),
            'userPermisos' => $userPermisos,
            'filters' => [
                'searchRol' => $searchRol,
                'searchPermiso' => $searchPermiso,
            ],
            'visibleSections' => $request->input('visibleSections', ['roles', 'permisos', 'asignacion']),
        ]);
    }

    public function create()
    {
        $usuario = Auth::user();
        $userPermisos = DB::table('roles_permisos')->where('id_rol', $usuario->id_rol)->pluck('id_permiso')->toArray();
        return Inertia::render('Roles_Permisos/Roles/Create', [
            'todosPermisos' => Permiso::all(['id_permiso', 'nombre']),
            'userPermisos' => $userPermisos
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_rol' => 'required|string|max:255|unique:roles,nombre_rol',
        ]);

        $rol = Rol::create([
            'nombre_rol' => $request->nombre_rol,
        ]);

        $this->registrarBitacora('roles', 'crear', 'Rol creado ID ' . $rol->id_rol);

        return redirect()->route('roles_permisos.index')->with('success', 'Rol creado correctamente. Recuerda asignarle permisos.');
    }

    public function edit($id)
    {
        $rol = Rol::with('permisos')->findOrFail($id);
        $usuario = Auth::user();
        $userPermisos = DB::table('roles_permisos')->where('id_rol', $usuario->id_rol)->pluck('id_permiso')->toArray();

        return Inertia::render('Roles_Permisos/Roles/Edit', [
            'rol' => $rol,
            'todosPermisos' => Permiso::all(['id_permiso', 'nombre']),
            'userPermisos' => $userPermisos
        ]);
    }

    public function update(Request $request, $id)
    {
        $rol = Rol::findOrFail($id);

        $request->validate([
            'nombre_rol' => ['required', 'string', 'max:50', Rule::unique('roles', 'nombre_rol')->ignore($rol->id_rol, 'id_rol')],
        ]);

        $rol->update(['nombre_rol' => $request->nombre_rol]);

        $this->registrarBitacora('roles', 'actualizar', "Nombre del rol actualizado ID {$rol->id_rol}");

        return redirect()->route('roles_permisos.index')
            ->with('success', 'Rol actualizado correctamente.');
    }

    public function destroy($id)
    {
        $rol = Rol::with('permisos')->findOrFail($id);

        $permisosAsignados = $rol->permisos->pluck('id_permiso')->toArray();
        if (count($permisosAsignados) > 0) {
            $rol->permisos()->detach();
            $this->registrarBitacora('roles', 'desasignar', "Permisos desasignados antes de eliminar rol ID {$rol->id_rol}: " . implode(',', $permisosAsignados));
        }

        $rol->delete();
        $this->registrarBitacora('roles', 'eliminar', "Rol eliminado ID {$id}");
        return back();
    }

    private function registrarBitacora($tabla, $operacion, $descripcion)
    {
        DB::table('bitacora_cambios')->insert([
            'tabla_afectada' => $tabla,
            'operacion' => $operacion,
            'usuario_responsable' => Auth::id(),
            'descripcion_cambio' => $descripcion,
            'fecha_cambio' => now(),
        ]);
    }
}
