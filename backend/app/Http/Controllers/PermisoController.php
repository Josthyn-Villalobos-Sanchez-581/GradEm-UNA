<?php

namespace App\Http\Controllers;

use App\Models\Permiso;
use App\Models\Rol;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PermisoController extends Controller
{
    // Listar permisos y roles
    public function index()
    {
        $roles = Rol::with('permisos')->get();
        $permisos = Permiso::all();

        // Permisos del usuario autenticado para el layout
        $usuario = Auth::user();
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        return Inertia::render('Roles_Permisos/Index', [
            'roles' => $roles,
            'permisos' => $permisos,
            'userPermisos' => $userPermisos,
            'flash' => session('success') ? ['success' => session('success')] : null,
        ]);
    }

    // Mostrar formulario para crear permiso
    public function create()
    {
        $usuario = Auth::user();
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        return Inertia::render('Roles_Permisos/Permisos/Create', [
            'userPermisos' => $userPermisos,
        ]);
    }

    // Mostrar formulario para editar permiso
    public function edit($id)
    {
        $permiso = Permiso::findOrFail($id);

        $usuario = Auth::user();
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        return Inertia::render('Roles_Permisos/Permisos/Edit', [
            'permiso' => $permiso,
            'userPermisos' => $userPermisos,
        ]);
    }

    // Crear permiso
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100', Rule::unique('permisos', 'nombre')],
        ]);

        Permiso::create($data);

        // Redireccionar usando Inertia
        return Inertia::location(route('roles_permisos.index'));
    }

    // Actualizar permiso
    public function update(Request $request, $id)
    {
        $permiso = Permiso::findOrFail($id);

        $data = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:100',
                Rule::unique('permisos', 'nombre')->ignore($permiso->id_permiso, 'id_permiso'),
            ],
        ]);

        $permiso->update($data);

        return Inertia::location(route('roles_permisos.index'));
    }

    // Eliminar permiso
    public function destroy($id)
    {
        $permiso = Permiso::findOrFail($id);
        $permiso->delete();

        return Inertia::location(route('roles_permisos.index'));
    }
}
