<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use App\Models\Permiso;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RolController extends Controller
{
    // Listar roles
    public function index()
    {
        $roles = Rol::with('permisos')->get();
        return Inertia::render('Roles/Index', ['roles' => $roles]);
    }

    // Crear rol
    public function store(Request $request)
    {
        $request->validate([
            'nombre_rol' => 'required|string|max:50|unique:roles,nombre_rol'
        ]);

        Rol::create($request->all());
        return redirect()->back()->with('success', 'Rol creado correctamente');
    }

    // Editar rol
    public function update(Request $request, $id)
    {
        $rol = Rol::findOrFail($id);
        $request->validate([
            'nombre_rol' => 'required|string|max:50|unique:roles,nombre_rol,' . $rol->id_rol
        ]);

        $rol->update($request->all());
        return redirect()->back()->with('success', 'Rol actualizado correctamente');
    }

    // Eliminar rol
    public function destroy($id)
    {
        $rol = Rol::findOrFail($id);
        $rol->delete();
        return redirect()->back()->with('success', 'Rol eliminado correctamente');
    }

    // Asignar permisos a un rol
    public function asignarPermisos(Request $request, $id)
    {
        $rol = Rol::findOrFail($id);
        $rol->permisos()->sync($request->permisos); // recibe array de id_permiso
        return redirect()->back()->with('success', 'Permisos actualizados');
    }
}
