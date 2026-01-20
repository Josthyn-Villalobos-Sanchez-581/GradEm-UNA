<?php

namespace App\Services\PermisoServices;

use App\Repositories\PermisoRepositories\PermisoRepository;
use Illuminate\Support\Facades\Auth;

class PermisoService
{
    protected PermisoRepository $permisoRepository;

    public function __construct(PermisoRepository $permisoRepository)
    {
        $this->permisoRepository = $permisoRepository;
    }

    /**
     * Datos para la vista index de permisos.
     */
    public function obtenerDatosIndex($usuario): array
    {
        $permisos     = $this->permisoRepository->obtenerPermisosPaginados();
        $userPermisos = $this->permisoRepository->obtenerPermisosPorRolUsuario($usuario->id_rol);

        return [
            'permisos'     => $permisos,
            'userPermisos' => $userPermisos,
        ];
    }

    /**
     * Datos para la vista create de permisos.
     */
    public function obtenerDatosCreate($usuario): array
    {
        $userPermisos = $this->permisoRepository->obtenerPermisosPorRolUsuario($usuario->id_rol);

        return [
            'userPermisos' => $userPermisos,
        ];
    }

    /**
     * Datos para la vista edit de un permiso.
     */
    public function obtenerDatosEdit(int $idPermiso, $usuario): array
    {
        $permiso      = $this->permisoRepository->buscarPermisoPorId($idPermiso);
        $userPermisos = $this->permisoRepository->obtenerPermisosPorRolUsuario($usuario->id_rol);

        return [
            'permiso'      => $permiso,
            'userPermisos' => $userPermisos,
        ];
    }

    /**
     * Crear un permiso y registrar bitácora.
     */
    public function crearPermiso(string $nombre): void
    {
        $permiso = $this->permisoRepository->crearPermiso([
            'nombre' => $nombre,
        ]);

        $this->permisoRepository->registrarBitacora(
            tabla: 'permisos',
            operacion: 'crear',
            descripcion: "Permiso creado ID {$permiso->id_permiso}",
            usuarioId: Auth::id()
        );
    }

    /**
     * Actualizar un permiso y registrar bitácora.
     */
    public function actualizarPermiso(int $idPermiso, string $nombre): void
    {
        $permiso = $this->permisoRepository->buscarPermisoPorId($idPermiso);

        $this->permisoRepository->actualizarPermiso($permiso, [
            'nombre' => $nombre,
        ]);

        $this->permisoRepository->registrarBitacora(
            tabla: 'permisos',
            operacion: 'actualizar',
            descripcion: "Permiso actualizado ID {$idPermiso}",
            usuarioId: Auth::id()
        );
    }

    /**
     * Intenta eliminar un permiso. Devuelve:
     * - null si se eliminó correctamente.
     * - string con mensaje de error si NO se puede eliminar.
     */
    public function intentarEliminarPermiso(int $idPermiso): ?string
    {
        $permiso = $this->permisoRepository->obtenerPermisoConRoles($idPermiso);

        // Misma lógica que en el controlador original
        if ($permiso->roles()->exists()) {
            return "No se puede eliminar el permiso '{$permiso->nombre}' porque está asignado a uno o más roles.";
        }

        $this->permisoRepository->eliminarPermiso($permiso);

        // Nota: en el código original NO se registraba bitácora al eliminar, mantenemos el comportamiento

        return null;
    }
}
