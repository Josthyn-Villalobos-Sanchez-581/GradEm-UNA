<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use App\Models\Permiso;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RolesPermisosController extends Controller
{
    public function index()
    {
        $usuario = Auth::user();

        // Todos los roles con sus permisos
        $roles = Rol::with('permisos')->get();

        // Todos los permisos
        $permisos = Permiso::all();

        // Permisos del usuario autenticado para el layout
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        return Inertia::render('Roles_Permisos/Index', [
            'roles' => $roles,
            'permisos' => $permisos,
            'userPermisos' => $userPermisos, // <--- esto es clave
        ]);
    }
}

