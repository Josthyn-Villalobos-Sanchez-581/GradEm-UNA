<?php

namespace App\Services;

use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\View;

class ServicioPlantillaCurriculum
{
	public function generarPdf(array $payload): string
	{
		// Renderiza vista Blade con estilos institucionales UNA
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

		$nombre = 'cv_' . $payload['usuarioId'] . '_' . now()->format('Ymd_His') . '.pdf';
		$ruta = 'curriculum/' . $nombre;
		\Storage::disk('public')->put($ruta, $contenido);

		return $ruta; // ruta relativa en storage/app/public
	}
}
