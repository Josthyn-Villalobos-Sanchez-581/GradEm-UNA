<?php

namespace App\Services\FotoPerfilServices;

use Illuminate\Http\Request;
use App\Repositories\FotoPerfilRepositories\FotoPerfilRepository;

class FotoPerfilService
{
    protected FotoPerfilRepository $fotoPerfilRepository;

    public function __construct(FotoPerfilRepository $fotoPerfilRepository)
    {
        $this->fotoPerfilRepository = $fotoPerfilRepository;
    }

    /**
     * Obtener datos necesarios para la vista de foto de perfil.
     */
    public function obtenerDatosVistaFotoPerfil($usuario): array
    {
        // Cargar relación de fotoPerfil
        $usuario->load('fotoPerfil');

        // Obtener permisos según el rol desde el repositorio
        $permisos = $this->fotoPerfilRepository->obtenerPermisosPorRol($usuario->id_rol);

        // Ruta de la foto de perfil (si existe)
        $fotoPerfil = $usuario->fotoPerfil?->ruta_imagen ?? null;

        return [
            'userPermisos' => $permisos,
            'fotoPerfil'   => $fotoPerfil,
        ];
    }

    /**
     * Lógica completa de subida o actualización de foto de perfil.
     */
    public function subirFotoUsuario($usuario, Request $request)
    {
        $usuario->load('fotoPerfil');

        $file = $request->file('foto');

        if (!$file) {
            return back()->withErrors(['foto' => 'No se recibió ningún archivo.']);
        }

        try {

            // eliminar foto anterior
            $this->fotoPerfilRepository->eliminarFotoPerfilUsuario($usuario);

            // guardar archivo
            $ruta = $file->store('fotos_perfil', 'public');

            // guardar en BD
            $this->fotoPerfilRepository->crearFotoPerfilUsuario(
                $usuario,
                "/storage/" . $ruta
            );

            return redirect()
                ->route('perfil.index')
                ->with('success', 'Foto de perfil actualizada exitosamente.');
        } catch (\Exception $e) {

            return back()->withErrors([
                'foto' => 'Error al subir la imagen.'
            ]);
        }
    }

    /**
     * Lógica para eliminar foto de perfil de un usuario.
     */
    public function eliminarFotoUsuario($usuario)
    {
        $usuario->load('fotoPerfil');

        // Eliminar foto (archivo + registro BD) si existe
        $this->fotoPerfilRepository->eliminarFotoPerfilUsuario($usuario);

        return redirect()
            ->route('perfil.index')
            ->with('success', 'Foto de perfil eliminada exitosamente.');
    }
}
