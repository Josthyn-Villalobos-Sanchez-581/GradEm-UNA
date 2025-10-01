<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

if (! function_exists('getUserPermisos')) {
    /**
     * Retorna los permisos del usuario autenticado de forma dinámica,
     * cacheándolos en la sesión para mejorar rendimiento.
     *
     * @return array<int>
     */
    function getUserPermisos(): array
    {
        $usuario = Auth::user();
        if (! $usuario) {
            return [];
        }

        $cacheKey = "user_permisos_{$usuario->id}";

        // Si ya están en sesión, los devolvemos
        if (session()->has($cacheKey)) {
            return session($cacheKey);
        }

        // Sino, los obtenemos de la DB y guardamos en sesión
        $permisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        session([$cacheKey => $permisos]);

        return $permisos;
    }
}

