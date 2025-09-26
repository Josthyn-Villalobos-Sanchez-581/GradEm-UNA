<?php

namespace App\Http\Controllers;

use App\Models\Permiso;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PermisoController extends Controller
{
    public function index()
    {
        $permisos = Permiso::paginate(10)->withQueryString();
        $usuario = Auth::user();
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        return Inertia::render('Roles_Permisos/Index', [
            'permisos' => $permisos,
            'userPermisos' => $userPermisos,
        ]);
    }

    public function create()
    {
        $usuario = Auth::user();
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        return Inertia::render('Roles_Permisos/Permisos/Create', [
            'userPermisos' => $userPermisos
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required','string','max:50', Rule::unique('permisos','nombre')]
        ]);

        $permiso = Permiso::create($data);
        $this->registrarBitacora('permisos','crear',"Permiso creado ID {$permiso->id_permiso}");

        // Redirigir al index después de crear
        return redirect()->route('roles_permisos.index')
            ->with('success', 'Permiso creado correctamente.');
    }

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
            'userPermisos' => $userPermisos
        ]);
    }

    public function update(Request $request, $id)
    {
        $permiso = Permiso::findOrFail($id);
        $data = $request->validate([
            'nombre' => ['required','string','max:50', Rule::unique('permisos','nombre')->ignore($permiso->id_permiso,'id_permiso')]
        ]);

        $permiso->update($data);
        $this->registrarBitacora('permisos','actualizar',"Permiso actualizado ID {$id}");

        // Redirigir al index después de actualizar
        return redirect()->route('roles_permisos.index')
            ->with('success', 'Permiso actualizado correctamente.');
    }

    public function destroy($id)
    {
        $permiso = Permiso::with('roles')->findOrFail($id);

        if ($permiso->roles->count() > 0) {
            return redirect()->route('roles_permisos.index')
                ->with('error', 'No se puede eliminar un permiso asignado a un rol.');
        }

        $permiso->delete();
        $this->registrarBitacora('permisos','eliminar',"Permiso eliminado ID {$id}");

        return redirect()->route('roles_permisos.index')
            ->with('success', 'Permiso eliminado correctamente.');
    }

    private function registrarBitacora($tabla,$operacion,$descripcion)
    {
        DB::table('bitacora_cambios')->insert([
            'tabla_afectada'=>$tabla,
            'operacion'=>$operacion,
            'usuario_responsable'=>Auth::id(),
            'descripcion_cambio'=>$descripcion,
            'fecha_cambio'=>now()
        ]);
    }
}
