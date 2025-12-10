<?php

namespace App\Repositories\DashboardRepositories;

use Illuminate\Support\Facades\DB;

class DashboardRepository
{
    /**
     * Obtener los permisos asociados a un rol específico.
     */
    public function obtenerPermisosPorRol(int $idRol): array
    {
        return DB::table('roles_permisos')
            ->where('id_rol', $idRol)
            ->pluck('id_permiso')
            ->toArray();
    }
}
