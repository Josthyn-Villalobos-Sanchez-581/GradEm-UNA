<?php

namespace App\Repositories\RolRepositories;

use App\Models\Rol;
use App\Models\Permiso;
use Illuminate\Support\Facades\DB;

class RolRepository
{
    /**
     * Obtener roles paginados con permisos, filtrando por nombre si aplica.
     */
    public function obtenerRolesPaginados(?string $searchRol)
    {
        return Rol::with('permisos')
            ->when($searchRol, fn($q) => $q->where('nombre_rol', 'like', "%{$searchRol}%"))
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * Obtener permisos paginados filtrando por nombre si aplica.
     */
    public function obtenerPermisosPaginados(?string $searchPermiso)
    {
        return Permiso::when($searchPermiso, fn($q) => $q->where('nombre', 'like', "%{$searchPermiso}%"))
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * Obtener todos los permisos (id_permiso, nombre).
     */
    public function obtenerTodosPermisos()
    {
        return Permiso::all(['id_permiso', 'nombre']);
    }

    /**
     * Obtener id de permisos asociados al rol del usuario autenticado.
     */
    public function obtenerPermisosPorRolUsuario(int $idRol): array
    {
        return DB::table('roles_permisos')
            ->where('id_rol', $idRol)
            ->pluck('id_permiso')
            ->toArray();
    }

    /**
     * Crear un nuevo rol.
     */
    public function crearRol(string $nombreRol): Rol
    {
        return Rol::create([
            'nombre_rol' => $nombreRol,
        ]);
    }

    /**
     * Buscar un rol por ID (lanzando 404 si no existe).
     */
    public function buscarRolPorId(int $idRol): Rol
    {
        return Rol::findOrFail($idRol);
    }

    /**
     * Obtener un rol con sus permisos cargados.
     */
    public function obtenerRolConPermisos(int $idRol): Rol
    {
        return Rol::with('permisos')->findOrFail($idRol);
    }

    /**
     * Actualizar nombre de rol.
     */
    public function actualizarRol(Rol $rol, string $nombreRol): void
    {
        $rol->update([
            'nombre_rol' => $nombreRol,
        ]);
    }

    /**
     * Desasignar todos los permisos de un rol.
     * Devuelve los IDs de permisos que fueron desasignados.
     */
    public function desasignarPermisosRol(Rol $rol): array
    {
        $permisosAsignados = $rol->permisos->pluck('id_permiso')->toArray();

        if (count($permisosAsignados) > 0) {
            $rol->permisos()->detach();
        }

        return $permisosAsignados;
    }

    /**
     * Eliminar un rol.
     */
    public function eliminarRol(Rol $rol): void
    {
        $rol->delete();
    }

    /**
     * Registrar un cambio en la bitácora.
     */
    public function registrarBitacora(string $tabla, string $operacion, string $descripcion, ?int $usuarioId): void
    {
        DB::table('bitacora_cambios')->insert([
            'tabla_afectada'     => $tabla,
            'operacion'          => $operacion,
            'usuario_responsable'=> $usuarioId,
            'descripcion_cambio' => $descripcion,
            'fecha_cambio'       => now(),
        ]);
    }
}
