<?php

namespace App\Http\Controllers;

use App\Models\Permiso;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermisoController extends Controller
{
    // Listar permisos
    public function index()
    {
        $permisos = Permiso::all();
        return Inertia::render('Permisos/Index', ['permisos' => $permisos]);
    }

    // Crear permiso
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100|unique:permisos,nombre'
        ]);

        Permiso::create($request->all());
        return redirect()->back()->with('success', 'Permiso creado correctamente');
    }

    // Editar permiso
    public function update(Request $request, $id)
    {
        $permiso = Permiso::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:100|unique:permisos,nombre,' . $permiso->id_permiso
        ]);

        $permiso->update($request->all());
        return redirect()->back()->with('success', 'Permiso actualizado correctamente');
    }

    // Eliminar permiso
    public function destroy($id)
    {
        $permiso = Permiso::findOrFail($id);
        $permiso->delete();
        return redirect()->back()->with('success', 'Permiso eliminado correctamente');
    }
}
