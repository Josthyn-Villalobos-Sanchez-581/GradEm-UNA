<?php

namespace App\Mail\Cursos;

use Illuminate\Mail\Mailable;

class RecordatorioCursoMail extends Mailable
{
    public array $datos;

    public function __construct(array $datos)
    {
        $this->datos = $datos;
    }

    public function build()
    {
        return $this
            ->subject('Recordatorio de curso')
            ->view('emails.cursos.recordatorio')
            ->with($this->datos);
    }
}
