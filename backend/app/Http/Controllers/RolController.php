<?php
//backend/app/Http/Controllers/RolController.php
namespace App\Http\Controllers;

use App\Models\Rol;
use App\Models\Permiso;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RolController extends Controller
{
    // Listar roles y permisos
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

    // Mostrar formulario para crear rol
    public function create()
    {
        $usuario = Auth::user();
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        return Inertia::render('Roles_Permisos/Roles/Create', [
            'userPermisos' => $userPermisos,
        ]);
    }

    // Mostrar formulario para editar rol
    public function edit($id)
    {
        $rol = Rol::findOrFail($id);

        $usuario = Auth::user();
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        return Inertia::render('Roles_Permisos/Roles/Edit', [
            'rol' => $rol,
            'userPermisos' => $userPermisos,
        ]);
    }

    // Crear rol
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre_rol' => ['required', 'string', 'max:50', Rule::unique('roles', 'nombre_rol')],
        ]);

        Rol::create($data);

        return redirect()->route('roles_permisos.index')
            ->with('success', 'Rol creado correctamente');
    }

    // Actualizar rol
    public function update(Request $request, $id)
    {
        $rol = Rol::findOrFail($id);

        $data = $request->validate([
            'nombre_rol' => [
                'required',
                'string',
                'max:50',
                Rule::unique('roles', 'nombre_rol')->ignore($rol->id_rol, 'id_rol'),
            ],
        ]);

        $rol->update($data);

        return redirect()->route('roles_permisos.index')
            ->with('success', 'Rol actualizado correctamente');
    }

    // Eliminar rol
    public function destroy($id)
    {
        $rol = Rol::findOrFail($id);
        $rol->delete();

        return redirect()->route('roles_permisos.index')
            ->with('success', 'Rol eliminado correctamente');
    }

    // Asignar permisos a un rol
    public function asignarPermisos(Request $request, $id)
    {
        $rol = Rol::findOrFail($id);
        $permisos = $request->get('permisos', []);
        $rol->permisos()->sync($permisos);

        return redirect()->route('roles_permisos.index')
            ->with('success', 'Permisos del rol actualizados correctamente');
    }
}
