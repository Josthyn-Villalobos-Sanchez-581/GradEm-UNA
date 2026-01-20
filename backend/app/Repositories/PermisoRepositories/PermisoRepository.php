<?php

namespace App\Repositories\PermisoRepositories;

use App\Models\Permiso;
use Illuminate\Support\Facades\DB;

class PermisoRepository
{
    /**
     * Obtener permisos paginados.
     */
    public function obtenerPermisosPaginados()
    {
        return Permiso::paginate(10)->withQueryString();
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
     * Buscar permiso por ID (404 si no existe).
     */
    public function buscarPermisoPorId(int $idPermiso): Permiso
    {
        return Permiso::findOrFail($idPermiso);
    }

    /**
     * Obtener permiso con relación roles cargada.
     */
    public function obtenerPermisoConRoles(int $idPermiso): Permiso
    {
        return Permiso::with('roles')->findOrFail($idPermiso);
    }

    /**
     * Crear un nuevo permiso.
     */
    public function crearPermiso(array $datos): Permiso
    {
        return Permiso::create($datos);
    }

    /**
     * Actualizar un permiso existente.
     */
    public function actualizarPermiso(Permiso $permiso, array $datos): void
    {
        $permiso->update($datos);
    }

    /**
     * Eliminar un permiso.
     */
    public function eliminarPermiso(Permiso $permiso): void
    {
        $permiso->delete();
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
