<?php

namespace App\Http\Controllers;

use App\Models\Permiso;
use App\Models\Rol;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class PermisoController extends Controller
{
    // Listar permisos y roles
    public function index()
    {
        $roles = Rol::with('permisos')->get();
        $permisos = Permiso::all();

        return Inertia::render('Roles_Permisos/Index', [
            'roles' => $roles,
            'permisos' => $permisos,
            'flash' => session('success') ? ['success' => session('success')] : null,
        ]);
    }

    // Mostrar formulario para crear permiso
    public function create()
    {
        return Inertia::render('Roles_Permisos/Permisos/Create');
    }

    // Mostrar formulario para editar permiso
    public function edit($id)
    {
        $permiso = Permiso::findOrFail($id);
        return Inertia::render('Roles_Permisos/Permisos/Edit', ['permiso' => $permiso]);
    }

    // Crear permiso
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100', Rule::unique('permisos', 'nombre')],
        ]);

        Permiso::create($data);

        return redirect()->route('permisos.index')
            ->with('success', 'Permiso creado correctamente');
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

        return redirect()->route('permisos.index')
            ->with('success', 'Permiso actualizado correctamente');
    }

    // Eliminar permiso
    public function destroy($id)
    {
        $permiso = Permiso::findOrFail($id);
        $permiso->delete();

        return redirect()->route('permisos.index')
            ->with('success', 'Permiso eliminado correctamente');
    }
}


