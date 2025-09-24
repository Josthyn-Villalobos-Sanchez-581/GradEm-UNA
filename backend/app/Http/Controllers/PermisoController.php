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
    // Listar permisos y roles para la vista principal de gestión
    public function index()
    {
        // Obtener todos los roles con sus permisos asociados
        $roles = Rol::with('permisos')->get();
        // Obtener todos los permisos disponibles
        $permisos = Permiso::all();

        // Permisos del usuario autenticado para controlar la visibilidad del layout
        $usuario = Auth::user();
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        return Inertia::render('Roles_Permisos/Index', [
            'roles' => $roles,
            'permisos' => $permisos,
            'userPermisos' => $userPermisos,
            // Pasar un mensaje flash de éxito si existe en la sesión
            'flash' => session('success') ? ['success' => session('success')] : null,
        ]);
    }

    // Mostrar formulario para crear un nuevo permiso
    public function create()
    {
        // Obtener los permisos del usuario autenticado para la navegación o UI
        $usuario = Auth::user();
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        return Inertia::render('Roles_Permisos/Permisos/Create', [
            'userPermisos' => $userPermisos,
        ]);
    }

    // Mostrar formulario para editar un permiso existente
    public function edit($id)
    {
        // Encontrar el permiso por su ID o fallar
        $permiso = Permiso::findOrFail($id);

        // Obtener los permisos del usuario autenticado para la navegación o UI
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

    // Almacenar un nuevo permiso en la base de datos
    public function store(Request $request)
    {
        // Validar los datos de la solicitud
        $data = $request->validate([
            // 'nombre' es un campo obligatorio, de tipo string, máximo 100 caracteres y único en la tabla 'permisos'
            'nombre' => ['required', 'string', 'max:100', Rule::unique('permisos', 'nombre')],
        ]);

        // Crear una nueva instancia de permiso con los datos validados
        Permiso::create($data);

        // Redireccionar a la vista de índice con una redirección de Inertia
        return Inertia::location(route('roles_permisos.index'));
    }

    // Actualizar un permiso existente
    public function update(Request $request, $id)
    {
        // Encontrar el permiso por su ID o fallar
        $permiso = Permiso::findOrFail($id);

        // Validar los datos de la solicitud
        $data = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:100',
                // Asegurar que el nombre sea único, ignorando el permiso actual
                Rule::unique('permisos', 'nombre')->ignore($permiso->id_permiso, 'id_permiso'),
            ],
        ]);

        // Actualizar el permiso con los datos validados
        $permiso->update($data);

        // Redireccionar a la vista de índice con una redirección de Inertia
        return Inertia::location(route('roles_permisos.index'));
    }

    // Eliminar un permiso
    public function destroy($id)
    {
        // Encontrar el permiso por su ID o fallar
        $permiso = Permiso::findOrFail($id);
        // Eliminar el permiso de la base de datos
        $permiso->delete();

        // Redireccionar a la vista de índice con una redirección de Inertia
        return Inertia::location(route('roles_permisos.index'));
    }
}