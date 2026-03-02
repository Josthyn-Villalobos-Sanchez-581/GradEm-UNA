<?php

namespace App\Mail\Cursos;

use Illuminate\Mail\Mailable;

class CambioInscripcionCursoMail extends Mailable
{
    public array $datos;

    public function __construct(array $datos)
    {
        $this->datos = $datos;
    }

    public function build()
    {
        return $this
            ->subject('Actualización de inscripción')
            ->view('emails.cursos.cambio_inscripcion')
            ->with($this->datos);
    }
}
