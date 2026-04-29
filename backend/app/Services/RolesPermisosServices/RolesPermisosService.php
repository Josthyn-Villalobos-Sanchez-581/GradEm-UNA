<?php

namespace App\Services\RolesPermisosServices;

use App\Repositories\RolesPermisosRepositories\RolesPermisosRepository;
use App\Services\BitacoraServices\BitacoraService;
use Illuminate\Support\Facades\Auth;

class RolesPermisosService
{
    protected RolesPermisosRepository $rolesPermisosRepository;

    public function __construct(RolesPermisosRepository $rolesPermisosRepository)
    {
        $this->rolesPermisosRepository = $rolesPermisosRepository;
    }

    /**
     * Obtener todos los datos necesarios para la vista Index de Roles y Permisos.
     */
    public function obtenerDatosIndex($usuario, ?string $searchRol, ?string $searchPermiso, array $visibleSections): array
    {
        $roles         = $this->rolesPermisosRepository->obtenerRolesFiltrados($searchRol);
        $permisos      = $this->rolesPermisosRepository->obtenerPermisosFiltrados($searchPermiso);
        $todosPermisos = $this->rolesPermisosRepository->obtenerTodosPermisosCheckbox();
        $userPermisos  = $this->rolesPermisosRepository->obtenerPermisosPorRolUsuario($usuario->id_rol);

        return [
            'roles'           => $roles,
            'permisos'        => $permisos,
            'todosPermisos'   => $todosPermisos,
            'userPermisos'    => $userPermisos,
            'filters'         => [
                'searchRol'     => $searchRol,
                'searchPermiso' => $searchPermiso,
            ],
            'visibleSections' => $visibleSections,
        ];
    }

    /**
     * Asignar permisos a un rol y registrar la bitácora.
     */
    public function asignarPermisosARol(int $rolId, array $permisosIds): void
    {
        $rol = $this->rolesPermisosRepository->obtenerRolPorId($rolId);

        $this->rolesPermisosRepository->sincronizarPermisosRol($rol, $permisosIds);

        $permisos = $this->rolesPermisosRepository
            ->obtenerPermisosPorIds($permisosIds);

        $nombresPermisos = $permisos->pluck('nombre')->implode(', ');

        $this->rolesPermisosRepository->registrarBitacora(
            tabla: 'roles_permisos',
            operacion: 'asignar',
            usuarioId: Auth::id(),
            descripcion:
                'Permisos actualizados rol "' .
                $rol->nombre_rol .
                '" (ID ' . $rolId . '): ' .
                $nombresPermisos
        );
    }
}
