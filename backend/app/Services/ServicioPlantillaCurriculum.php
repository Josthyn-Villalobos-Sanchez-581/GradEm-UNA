<?php

namespace App\Services;

use Dompdf\Dompdf;
use Dompdf\Options;
use Spatie\Browsershot\Browsershot;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log; // NUEVO
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

        // ✅ Manejar la foto de perfil con logs de debug
        $payload['fotoPerfil'] = null;
        Log::info('[CV] incluirFotoPerfil:', ['valor' => $payload['incluirFotoPerfil'] ?? null]);
        Log::info('[CV] usuarioId en payload:', ['usuarioId' => $payload['usuarioId'] ?? null]);

        if (!empty($payload['incluirFotoPerfil'])) {
            $usuario = Usuario::with('fotoPerfil')->find($payload['usuarioId'] ?? null);
            Log::info('[CV] Usuario encontrado:', ['ok' => (bool)$usuario]);
            Log::info('[CV] Usuario tiene fotoPerfil:', ['ok' => (bool)($usuario?->fotoPerfil)]);

            if ($usuario && $usuario->fotoPerfil && $usuario->fotoPerfil->ruta_imagen) {
                // Convertir la ruta pública a ruta del sistema de archivos
                $rutaFoto = str_replace('/storage/', '', $usuario->fotoPerfil->ruta_imagen);
                $rutaCompleta = storage_path('app/public/' . $rutaFoto);

                Log::info('[CV] Ruta pública foto:', ['ruta_imagen' => $usuario->fotoPerfil->ruta_imagen]);
                Log::info('[CV] Ruta absoluta foto:', ['ruta_completa' => $rutaCompleta, 'existe' => file_exists($rutaCompleta)]);

                if (file_exists($rutaCompleta)) {
                    $payload['fotoPerfil'] = [
                        'ruta_imagen'   => $usuario->fotoPerfil->ruta_imagen, // pública (/storage/...)
                        'ruta_completa' => $rutaCompleta,                      // absoluta (filesystem)
                    ];
                    Log::info('[CV] Foto agregada al payload con ruta_completa');
                } else {
                    // Fallback: usar la ruta pública con isRemoteEnabled
                    $payload['fotoPerfil'] = [
                        'ruta_imagen' => $usuario->fotoPerfil->ruta_imagen,
                    ];
                    Log::warning('[CV] Archivo de foto no existe localmente; usando ruta pública');
                }
            } else {
                Log::warning('[CV] No hay fotoPerfil asociada al usuario o ruta_imagen vacía');
            }
        }

        $html = View::make('pdf.curriculum', [
            'datos' => $payload
        ])->render();

        try {
            // Motor principal: Chromium para que el PDF se vea como la vista previa web.
            $contenidoPdf = Browsershot::html($html)
                ->format('A4')
                ->margins(10, 10, 10, 10)
                ->showBackground()
                ->waitUntilNetworkIdle()
                ->setOption('printBackground', true)
                ->setOption('preferCSSPageSize', true)
                ->setNodeBinary('node')
                ->setNpmBinary('npm')
                ->setNodeModulePath(base_path('node_modules'))
                ->noSandbox()
                ->pdf();

            Log::info('[CV] PDF generado con Chromium/Browsershot');
        } catch (\Throwable $e) {
            // Fallback para no romper generación en entornos sin Chromium.
            Log::warning('[CV] Browsershot falló, usando Dompdf como respaldo', [
                'error' => $e->getMessage(),
            ]);

            $options = new Options();
            $options->set('isRemoteEnabled', true);
            $options->set('isHtml5ParserEnabled', true);

            $dompdf = new Dompdf($options);
            $dompdf->loadHtml($html, 'UTF-8');
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();

            $contenidoPdf = $dompdf->output();
        }

        $nombreArchivo = 'curriculum_' . ($payload['usuarioId'] ?? 'anon') . '_' . time() . '.pdf';
        $rutaArchivo = 'curriculums/' . $nombreArchivo;

        Storage::disk('public')->put($rutaArchivo, $contenidoPdf);

        Log::info('[CV] PDF generado y guardado', ['ruta' => $rutaArchivo]);

        return $rutaArchivo;
    }
}
