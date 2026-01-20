<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Services\FotoPerfilServices\FotoPerfilService;

class FotoPerfilController extends Controller
{
    protected FotoPerfilService $fotoPerfilService;

    public function __construct(FotoPerfilService $fotoPerfilService)
    {
        $this->fotoPerfilService = $fotoPerfilService;
    }

    /**
     * Mostrar la vista para subir foto de perfil
     */
    public function mostrarFoto()
    {
        /** @var \App\Models\Usuario $usuario */
        $usuario = Auth::user();

        // Si por alguna razón no hay usuario (por seguridad)
        if (!$usuario) {
            return redirect()->route('login');
        }

        // Toda la lógica se delega al Service
        $datosVista = $this->fotoPerfilService->obtenerDatosVistaFotoPerfil($usuario);

        return Inertia::render('Perfil/PerfilFoto', $datosVista);
    }

    /**
     * Subir o actualizar foto de perfil
     */
    public function subirFoto(Request $request)
    {
        // Validación se mantiene en el controlador
        $request->validate([
            'foto' => 'required|image|mimes:jpg,jpeg,png|max:2048|dimensions:min_width=500,min_height=500',
        ], [
            'foto.required'   => 'Debe seleccionar una imagen.',
            'foto.image'      => 'El archivo debe ser una imagen.',
            'foto.mimes'      => 'Solo se permiten imágenes JPG o PNG.',
            'foto.max'        => 'La imagen no puede superar los 2MB.',
            'foto.dimensions' => 'La imagen debe tener al menos 500x500 píxeles.',
        ]);

        /** @var \App\Models\Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario) {
            return redirect()->route('login');
        }

        // Delegar toda la lógica de subida al Service
        return $this->fotoPerfilService->subirFotoUsuario($usuario, $request);
    }

    /**
     * Eliminar foto de perfil
     */
    public function eliminarFoto()
    {
        /** @var \App\Models\Usuario $usuario */
        $usuario = Auth::user();

        if (!$usuario) {
            return redirect()->route('login');
        }

        // Delegar la lógica de eliminación al Service
        return $this->fotoPerfilService->eliminarFotoUsuario($usuario);
    }
}
