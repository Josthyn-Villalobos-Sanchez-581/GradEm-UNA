<?php

namespace App\Services\RolServices;

use App\Repositories\RolRepositories\RolRepository;
use Illuminate\Support\Facades\Auth;

class RolService
{
    protected RolRepository $rolRepository;

    public function __construct(RolRepository $rolRepository)
    {
        $this->rolRepository = $rolRepository;
    }

    /**
     * Datos para la vista principal de roles y permisos.
     */
    public function obtenerDatosIndex(?string $searchRol, ?string $searchPermiso, array $visibleSections, $usuario): array
    {
        $roles         = $this->rolRepository->obtenerRolesPaginados($searchRol);
        $permisos      = $this->rolRepository->obtenerPermisosPaginados($searchPermiso);
        $todosPermisos = $this->rolRepository->obtenerTodosPermisos();
        $userPermisos  = $this->rolRepository->obtenerPermisosPorRolUsuario($usuario->id_rol);

        return [
            'roles'         => $roles,
            'permisos'      => $permisos,
            'todosPermisos' => $todosPermisos,
            'userPermisos'  => $userPermisos,
            'filters'       => [
                'searchRol'      => $searchRol,
                'searchPermiso'  => $searchPermiso,
            ],
            'visibleSections' => $visibleSections,
        ];
    }

    /**
     * Datos para la vista de creación de rol.
     */
    public function obtenerDatosCreate($usuario): array
    {
        $todosPermisos = $this->rolRepository->obtenerTodosPermisos();
        $userPermisos  = $this->rolRepository->obtenerPermisosPorRolUsuario($usuario->id_rol);

        return [
            'todosPermisos' => $todosPermisos,
            'userPermisos'  => $userPermisos,
        ];
    }

    /**
     * Datos para la vista de edición de rol.
     */
    public function obtenerDatosEdit(int $idRol, $usuario): array
    {
        $rol           = $this->rolRepository->obtenerRolConPermisos($idRol);
        $todosPermisos = $this->rolRepository->obtenerTodosPermisos();
        $userPermisos  = $this->rolRepository->obtenerPermisosPorRolUsuario($usuario->id_rol);

        return [
            'rol'           => $rol,
            'todosPermisos' => $todosPermisos,
            'userPermisos'  => $userPermisos,
        ];
    }

    /**
     * Crear un nuevo rol y registrar bitácora.
     */
    public function crearRol(string $nombreRol): void
    {
        $rol = $this->rolRepository->crearRol($nombreRol);

        $this->rolRepository->registrarBitacora(
            tabla: 'roles',
            operacion: 'crear',
            descripcion: 'Rol creado ID ' . $rol->id_rol,
            usuarioId: Auth::id()
        );
    }

    /**
     * Actualizar rol y registrar bitácora.
     */
    public function actualizarRol(int $idRol, string $nombreRol): void
    {
        $rol = $this->rolRepository->buscarRolPorId($idRol);

        $this->rolRepository->actualizarRol($rol, $nombreRol);

        $this->rolRepository->registrarBitacora(
            tabla: 'roles',
            operacion: 'actualizar',
            descripcion: "Nombre del rol actualizado ID {$rol->id_rol}",
            usuarioId: Auth::id()
        );
    }

    /**
     * Eliminar rol (desasignando permisos si corresponde) y registrar bitácora.
     */
    public function eliminarRol(int $idRol): void
    {
        $rol = $this->rolRepository->obtenerRolConPermisos($idRol);

        // Desasignar permisos si tiene
        $permisosDesasignados = $this->rolRepository->desasignarPermisosRol($rol);

        if (count($permisosDesasignados) > 0) {
            $this->rolRepository->registrarBitacora(
                tabla: 'roles',
                operacion: 'desasignar',
                descripcion: "Permisos desasignados antes de eliminar rol ID {$rol->id_rol}: " . implode(',', $permisosDesasignados),
                usuarioId: Auth::id()
            );
        }

        // Eliminar rol
        $this->rolRepository->eliminarRol($rol);

        $this->rolRepository->registrarBitacora(
            tabla: 'roles',
            operacion: 'eliminar',
            descripcion: "Rol eliminado ID {$idRol}",
            usuarioId: Auth::id()
        );
    }
}
