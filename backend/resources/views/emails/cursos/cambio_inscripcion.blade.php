@include('emails.cursos.partials.layout', [
    'titulo' => 'Actualización de inscripción',
    'mensaje' => $nombre_persona . ' ha realizado una ' . $tipo .
                ' en el curso ' . $nombre_curso
])
