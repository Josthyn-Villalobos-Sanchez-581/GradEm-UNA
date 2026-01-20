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

        // ==========================
        // Validación de proporción
        // ==========================
        [$width, $height] = @getimagesize($file->getPathname());
        if (!$width || !$height) {
            return back()->withErrors(['foto' => 'No fue posible leer las dimensiones de la imagen.']);
        }

        // Reglas
        $min = 500;
        if ($width < $min || $height < $min) {
            return back()->withErrors(['foto' => 'La imagen debe tener al menos 500x500 píxeles.']);
        }

        // Tolerancia para permitir pequeñas variaciones en la compresión/escalado
        $tol   = 0.03; // ±3%
        $ratio = $width / $height;

        // Permitimos: cuadrada (1:1) o "tamaño pasaporte" (~3.5:4.5 = 0.777...)
        $isCuadrada    = abs($ratio - 1.0) <= $tol;
        $passportRatio = 3.5 / 4.5; // ≈ 0.777...
        $isPasaporte   = ($height > $width) && (abs($ratio - $passportRatio) <= $tol);

        if (!($isCuadrada || $isPasaporte)) {
            return back()->withErrors([
                'foto' => 'La imagen debe ser cuadrada (1:1) o tamaño pasaporte (3.5:4.5), con mínimo 500x500 píxeles y máximo 2MB, en formato JPG o PNG.',
            ]);
        }

        try {
            // Eliminar foto anterior (archivo + registro BD) si existe
            $this->fotoPerfilRepository->eliminarFotoPerfilUsuario($usuario);

            // Guardar nueva imagen en storage
            $ruta = $file->store('fotos_perfil', 'public');

            // Crear nuevo registro de FotoPerfil en BD
            $this->fotoPerfilRepository->crearFotoPerfilUsuario($usuario, "/storage/" . $ruta);

            return redirect()
                ->route('perfil.index')
                ->with('success', 'Foto de perfil actualizada exitosamente.');
        } catch (\Exception $e) {
            return back()->withErrors(['foto' => 'Error al subir la imagen: ' . $e->getMessage()]);
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
