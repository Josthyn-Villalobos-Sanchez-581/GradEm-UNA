<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\FotoPerfil;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FotoPerfilController extends Controller
{
    /**
     * Mostrar la vista para subir foto de perfil
     */
    public function mostrarFoto()
    {
        /** @var \App\Models\Usuario $usuario */
        $usuario = Auth::user();
        $usuario->load('fotoPerfil'); // carga relación de fotoPerfil

        // Obtener permisos del usuario autenticado para PpLayout
        $permisos = $usuario
            ? DB::table('roles_permisos')
                ->where('id_rol', $usuario->id_rol)
                ->pluck('id_permiso')
                ->toArray()
            : [];

        $fotoPerfil = $usuario->fotoPerfil?->ruta_imagen ?? null;

        return Inertia::render('Perfil/PerfilFoto', [
            'userPermisos' => $permisos,
            'fotoPerfil' => $fotoPerfil,
        ]);
    }

    /**
     * Subir o actualizar foto de perfil
     */
   public function subirFoto(Request $request)
{
    $request->validate([
        'foto' => 'required|image|mimes:jpg,jpeg,png|max:2048|dimensions:min_width=500,min_height=500',
    ], [
        'foto.required' => 'Debe seleccionar una imagen.',
        'foto.image' => 'El archivo debe ser una imagen.',
        'foto.mimes' => 'Solo se permiten imágenes JPG o PNG.',
        'foto.max' => 'La imagen no puede superar los 2MB.',
        'foto.dimensions' => 'La imagen debe tener al menos 500x500 píxeles.',
    ]);

    /** @var \App\Models\Usuario $usuario */
    $usuario = Auth::user();
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
    $tol = 0.03; // ±3%
    $ratio = $width / $height;

    // Permitimos: cuadrada (1:1) o "tamaño pasaporte" (~3.5:4.5 = 0.777...)
    $isCuadrada = abs($ratio - 1.0) <= $tol;
    $passportRatio = 3.5 / 4.5; // ≈ 0.777...
    $isPasaporte = ($height > $width) && (abs($ratio - $passportRatio) <= $tol);

    if (!($isCuadrada || $isPasaporte)) {
        return back()->withErrors([
            'foto' => 'La imagen debe ser cuadrada (1:1) o tamaño pasaporte (3.5:4.5), con mínimo 500x500 píxeles y máximo 2MB, en formato JPG o PNG.',
        ]);
    }

    try {
        // Eliminar foto antigua si existe
        if ($usuario->fotoPerfil?->ruta_imagen) {
            $rutaAntigua = str_replace('/storage/', '', $usuario->fotoPerfil->ruta_imagen);
            if (Storage::disk('public')->exists($rutaAntigua)) {
                Storage::disk('public')->delete($rutaAntigua);
            }
            $usuario->fotoPerfil()->delete();
        }

        // Guardar la nueva imagen
        $ruta = $file->store('fotos_perfil', 'public');

        // Crear registro de FotoPerfil
        $usuario->fotoPerfil()->create([
            'ruta_imagen' => "/storage/" . $ruta,
            'fecha_subida' => now(),
        ]);

        return redirect()
            ->route('perfil.index')
            ->with('success', 'Foto de perfil actualizada exitosamente.');
    } catch (\Exception $e) {
        return back()->withErrors(['foto' => 'Error al subir la imagen: ' . $e->getMessage()]);
    }
}


    /**
     * Eliminar foto de perfil
     */
    public function eliminarFoto()
    {
        /** @var \App\Models\Usuario $usuario */
        $usuario = Auth::user();
        $usuario->load('fotoPerfil');

        $foto = $usuario->fotoPerfil;
        if ($foto) {
            $rutaArchivo = str_replace('/storage/', '', $foto->ruta_imagen);
            if (Storage::disk('public')->exists($rutaArchivo)) {
                Storage::disk('public')->delete($rutaArchivo);
            }
            $foto->delete();
        }

        return redirect()->route('perfil.index')
                         ->with('success', 'Foto de perfil eliminada exitosamente.');
    }
}

