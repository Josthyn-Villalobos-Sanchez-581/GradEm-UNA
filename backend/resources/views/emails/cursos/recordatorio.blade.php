@include('emails.cursos.partials.layout', [
    'titulo' => 'Recordatorio del curso ' . $nombre_curso,
    'mensaje' => $mensaje . '<br><br>Fecha: ' . $fecha_evento
])
