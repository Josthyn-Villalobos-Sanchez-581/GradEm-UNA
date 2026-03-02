<?php

namespace App\Mail\Cursos;

use Illuminate\Mail\Mailable;

class CorreoMasivoCursoMail extends Mailable
{
    public array $datos;

    public function __construct(array $datos)
    {
        $this->datos = $datos;
    }

    public function build()
    {
        return $this
            ->subject($this->datos['asunto'])
            ->view('emails.cursos.masivo')
            ->with($this->datos);
    }
}
