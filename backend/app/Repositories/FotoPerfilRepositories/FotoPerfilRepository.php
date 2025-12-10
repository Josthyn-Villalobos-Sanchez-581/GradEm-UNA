<?php

namespace App\Repositories\FotoPerfilRepositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FotoPerfilRepository
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
     * Eliminar foto de perfil de un usuario:
     * - Elimina el archivo físico si existe.
     * - Elimina el registro en la base de datos.
     */
    public function eliminarFotoPerfilUsuario($usuario): void
    {
        $foto = $usuario->fotoPerfil;

        if ($foto) {
            $rutaArchivo = str_replace('/storage/', '', $foto->ruta_imagen);

            if (Storage::disk('public')->exists($rutaArchivo)) {
                Storage::disk('public')->delete($rutaArchivo);
            }

            $foto->delete();
        }
    }

    /**
     * Crear un nuevo registro de foto de perfil para un usuario.
     */
    public function crearFotoPerfilUsuario($usuario, string $rutaImagen): void
    {
        $usuario->fotoPerfil()->create([
            'ruta_imagen'  => $rutaImagen,
            'fecha_subida' => now(),
        ]);
    }
}
