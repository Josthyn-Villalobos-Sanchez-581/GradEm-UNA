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

    /**
     * Obtener foto de perfil del usuario
     */
    public function obtenerFotoPerfil(int $idUsuario): ?string
    {
        return DB::table('fotos_perfil')
            ->where('id_usuario', $idUsuario)
            ->value('ruta_imagen'); // retorna string o null
    }
}
