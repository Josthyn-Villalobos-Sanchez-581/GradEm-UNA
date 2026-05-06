<?php

namespace App\Services\DashboardServices;

use App\Repositories\DashboardRepositories\DashboardRepository;

class DashboardService
{
    protected DashboardRepository $dashboardRepository;

    public function __construct(DashboardRepository $dashboardRepository)
    {
        $this->dashboardRepository = $dashboardRepository;
    }

    public function obtenerDatosDashboard($usuario): array
    {
        $permisos = $this->dashboardRepository->obtenerPermisosPorRol($usuario->id_rol);
        $rolNombre = optional($usuario->rol)->nombre_rol ?? 'Sin rol asignado';

        // 🔥 Obtener ruta desde BD
        $foto = $this->dashboardRepository->obtenerFotoPerfil($usuario->id_usuario);

        // 🔥 NORMALIZAR (AQUÍ ESTÁ LA CLAVE)
        $fotoPerfil = null;

        if ($foto) {
            // quitar "storage/" si ya viene en la BD
            $rutaLimpia = ltrim(str_replace('storage/', '', $foto), '/');

            $fotoPerfil = [
                'url' => asset('storage/' . $rutaLimpia)
            ];
        }

        return [
            'auth' => [
                'user' => [
                    'id'    => $usuario->id_usuario,
                    'name'  => $usuario->nombre_completo,
                    'email' => $usuario->correo,
                    'fotoPerfil' => $fotoPerfil, // 👈 formato correcto
                ],
            ],
            'userPermisos' => $permisos,
            'userRol'      => $rolNombre,
        ];
    }
}