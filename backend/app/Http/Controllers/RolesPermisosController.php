<?php

//backend/app/Http/Controllers/RolesPermisosController.php 
namespace App\Http\Controllers;

use App\Models\Rol;
use App\Models\Permiso;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

// Controlador principal para la gestión de roles y permisos
class RolesPermisosController extends Controller
{
    public function index()
    {
        // Obtener al usuario autenticado
        $usuario = Auth::user();

        // Obtener todos los roles con sus permisos asociados
        $roles = Rol::with('permisos')->get();

        // Obtener todos los permisos
        $permisos = Permiso::all();

        // Obtener los IDs de los permisos del usuario autenticado para controlar la visibilidad del layout
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        // Renderizar la vista Inertia y pasar los datos necesarios
        return Inertia::render('Roles_Permisos/Index', [
            'roles' => $roles,
            'permisos' => $permisos,
            'userPermisos' => $userPermisos, // Esto es clave para el control de la interfaz de usuario en el frontend
        ]);
    }
}