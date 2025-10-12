<?php

namespace App\Services;

use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\Usuario;

class ServicioPlantillaCurriculum
{
    public function generarPdf(array $payload): string
    {
        // Normalizamos arrays por si vienen null
        $payload['habilidades']  = $payload['habilidades']  ?? [];
        $payload['idiomas']      = $payload['idiomas']      ?? [];
        $payload['referencias']  = $payload['referencias']  ?? [];
        $payload['educaciones']  = $payload['educaciones']  ?? [];
        $payload['experiencias'] = $payload['experiencias'] ?? [];

        // NUEVO: Manejar la foto de perfil
        $payload['fotoPerfil'] = null;
        if (isset($payload['incluirFotoPerfil']) && $payload['incluirFotoPerfil']) {
            $usuario = Usuario::with('fotoPerfil')->find($payload['usuarioId']);
            if ($usuario && $usuario->fotoPerfil && $usuario->fotoPerfil->ruta_imagen) {
                // Convertir la ruta pública a ruta del sistema de archivos
                $rutaFoto = str_replace('/storage/', '', $usuario->fotoPerfil->ruta_imagen);
                $rutaCompleta = storage_path('app/public/' . $rutaFoto);

                if (file_exists($rutaCompleta)) {
                    $payload['fotoPerfil'] = [
                        'ruta_imagen'   => $usuario->fotoPerfil->ruta_imagen, // pública (/storage/...)
                        'ruta_completa' => $rutaCompleta,                      // absoluta (filesystem)
                    ];
                } else {
                    // Si no existe localmente, aún se puede usar la ruta pública con isRemoteEnabled
                    $payload['fotoPerfil'] = [
                        'ruta_imagen' => $usuario->fotoPerfil->ruta_imagen,
                    ];
                }
            }
        }

        $html = View::make('pdf.curriculum', [
            'datos' => $payload
        ])->render();

        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $options->set('isHtml5ParserEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $contenidoPdf = $dompdf->output();
        $nombreArchivo = 'curriculum_' . ($payload['usuarioId'] ?? 'anon') . '_' . time() . '.pdf';
        $rutaArchivo = 'curriculums/' . $nombreArchivo;

        Storage::disk('public')->put($rutaArchivo, $contenidoPdf);

        return $rutaArchivo;
    }
}
