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
    // Listar roles y permisos para la vista principal de gestión
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

    // Mostrar formulario para crear un nuevo rol
    public function create()
    {
        // Obtener los permisos del usuario autenticado para la navegación o UI
        $usuario = Auth::user();
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        return Inertia::render('Roles_Permisos/Roles/Create', [
            'userPermisos' => $userPermisos,
        ]);
    }

    // Mostrar formulario para editar un rol existente
    public function edit($id)
    {
        // Encontrar el rol por su ID o fallar
        $rol = Rol::findOrFail($id);

        // Obtener los permisos del usuario autenticado para la navegación o UI
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

    // Almacenar un nuevo rol en la base de datos
    public function store(Request $request)
    {
        // Validar los datos de la solicitud
        $data = $request->validate([
            // 'nombre_rol' es un campo obligatorio, de tipo string, máximo 50 caracteres y único en la tabla 'roles'
            'nombre_rol' => ['required', 'string', 'max:50', Rule::unique('roles', 'nombre_rol')],
        ]);

        // Crear una nueva instancia de rol con los datos validados
        Rol::create($data);

        // Redireccionar a la vista de índice con una redirección de Inertia
        return Inertia::location(route('roles_permisos.index'));
    }

    // Actualizar un rol existente
    public function update(Request $request, $id)
    {
        // Encontrar el rol por su ID o fallar
        $rol = Rol::findOrFail($id);

        // Validar los datos de la solicitud
        $data = $request->validate([
            'nombre_rol' => [
                'required',
                'string',
                'max:50',
                // Asegurar que el nombre del rol sea único, ignorando el rol actual
                Rule::unique('roles', 'nombre_rol')->ignore($rol->id_rol, 'id_rol'),
            ],
        ]);

        // Actualizar el rol con los datos validados
        $rol->update($data);

        // Redireccionar a la vista de índice con una redirección de Inertia
        return Inertia::location(route('roles_permisos.index'));
    }

    // Eliminar un rol
    public function destroy($id)
    {
        // Encontrar el rol por su ID o fallar
        $rol = Rol::findOrFail($id);
        // Eliminar el rol de la base de datos
        $rol->delete();

        // Redireccionar a la vista de índice con una redirección de Inertia
        return Inertia::location(route('roles_permisos.index'));
    }

    // Asignar permisos a un rol específico
    public function asignarPermisos(Request $request, $id)
    {
        // Encontrar el rol por su ID o fallar
        $rol = Rol::findOrFail($id);
        // Obtener la lista de IDs de permisos del request, o un array vacío si no se proporciona
        $permisos = $request->get('permisos', []);
        // Sincronizar los permisos del rol. Esto adjunta, elimina y actualiza permisos en la tabla pivote
        // para que solo existan los IDs de permisos enviados en el array.
        $rol->permisos()->sync($permisos);

        // Redireccionar a la vista de índice con una redirección de Inertia
        return Inertia::location(route('roles_permisos.index'));
    }
}