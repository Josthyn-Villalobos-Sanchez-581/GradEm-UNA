@include('emails.cursos.partials.layout', [
    'titulo' => 'Recordatorio del curso ' . $nombre_curso,
    'mensaje' => $mensaje . "\n\nFecha: " . $fecha_evento
])
