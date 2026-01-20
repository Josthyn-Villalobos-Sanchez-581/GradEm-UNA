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

    /**
     * Obtener toda la información necesaria para el Dashboard
     * a partir del usuario autenticado.
     */
    public function obtenerDatosDashboard($usuario): array
    {
        // ⬇️ Obtener permisos según el ROL desde el repositorio
        $permisos = $this->dashboardRepository->obtenerPermisosPorRol($usuario->id_rol);

        // ⬇️ Obtener nombre del rol (misma lógica que antes)
        $rolNombre = optional($usuario->rol)->nombre_rol ?? 'Sin rol asignado';

        // ⬇️ Estructura EXACTAMENTE igual a la que usaba el controlador
        return [
            'auth' => [
                'user' => [
                    'id'    => $usuario->id_usuario,
                    'name'  => $usuario->nombre_completo,
                    'email' => $usuario->correo,
                ],
            ],
            'userPermisos' => $permisos,
            'userRol'      => $rolNombre,
        ];
    }
}
