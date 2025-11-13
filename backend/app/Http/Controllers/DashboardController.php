<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return redirect()->route('login');
        }

        // ⬇️ Obtener permisos según el ROL
        $permisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        // ⬇️ Obtener nombre del rol
        $rolNombre = optional($usuario->rol)->nombre_rol ?? 'Sin rol asignado';

        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => [
                    'id'    => $usuario->id_usuario,
                    'name'  => $usuario->nombre_completo,
                    'email' => $usuario->correo,
                ],
            ],
            'userPermisos' => $permisos, // ⬅️ ESTO USA EL MISMO MÉTODO QUE EN RolesPermisosController
            'userRol'      => $rolNombre, // nombre del rol del usuario
        ]);
    }
}
