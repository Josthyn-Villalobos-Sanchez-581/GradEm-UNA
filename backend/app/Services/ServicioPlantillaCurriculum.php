<?php

namespace App\Services;

use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Storage;

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

        $html = View::make('pdf.curriculum', [
            'datos' => $payload
        ])->render();

        $options = new Options();
        $options->set('isRemoteEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $contenido = $dompdf->output();

        $nombre = 'cv_' . ($payload['usuarioId'] ?? 'anon') . '_' . now()->format('Ymd_His') . '.pdf';
        $ruta = 'curriculum/' . $nombre;

        Storage::disk('public')->put($ruta, $contenido);

        return $ruta;
    }
}
