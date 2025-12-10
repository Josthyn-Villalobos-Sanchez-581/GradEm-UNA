<?php

namespace App\Repositories\RolesPermisosRepositories;

use App\Models\Rol;
use App\Models\Permiso;
use Illuminate\Support\Facades\DB;

class RolesPermisosRepository
{
    /**
     * Obtener todos los roles con permisos, filtrando por nombre o ID si aplica.
     * (Misma lógica que el controlador original).
     */
    public function obtenerRolesFiltrados(?string $searchRol)
    {
        return Rol::with('permisos')
            ->when($searchRol, function ($q) use ($searchRol) {
                $q->where('nombre_rol', 'LIKE', "%{$searchRol}%")
                  ->orWhere('id_rol', is_numeric($searchRol) ? $searchRol : 0);
            })
            ->get();
    }

    /**
     * Obtener todos los permisos, filtrando por nombre o ID si aplica.
     */
    public function obtenerPermisosFiltrados(?string $searchPermiso)
    {
        return Permiso::when($searchPermiso, function ($q) use ($searchPermiso) {
                $q->where('nombre', 'LIKE', "%{$searchPermiso}%")
                  ->orWhere('id_permiso', is_numeric($searchPermiso) ? $searchPermiso : 0);
            })
            ->get();
    }

    /**
     * Obtener todos los permisos para checkboxes de asignación.
     */
    public function obtenerTodosPermisosCheckbox()
    {
        return Permiso::all(['id_permiso', 'nombre']);
    }

    /**
     * Obtener IDs de permisos asociados al rol de un usuario.
     */
    public function obtenerPermisosPorRolUsuario(int $idRol): array
    {
        return DB::table('roles_permisos')
            ->where('id_rol', $idRol)
            ->pluck('id_permiso')
            ->toArray();
    }

    /**
     * Obtener un rol por ID (404 si no existe).
     */
    public function obtenerRolPorId(int $rolId): Rol
    {
        return Rol::findOrFail($rolId);
    }

    /**
     * Sincronizar permisos de un rol.
     */
    public function sincronizarPermisosRol(Rol $rol, array $permisosIds): void
    {
        $rol->permisos()->sync($permisosIds);
    }

    /**
     * Registrar un cambio en la bitácora.
     */
    public function registrarBitacora(string $tabla, string $operacion, string $descripcion, ?int $usuarioId): void
    {
        DB::table('bitacora_cambios')->insert([
            'tabla_afectada'      => $tabla,
            'operacion'           => $operacion,
            'usuario_responsable' => $usuarioId,
            'descripcion_cambio'  => $descripcion,
            'fecha_cambio'        => now(),
        ]);
    }
}
