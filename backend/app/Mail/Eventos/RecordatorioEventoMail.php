<?php

namespace App\Mail\Eventos;

use Illuminate\Mail\Mailable;

class RecordatorioEventoMail extends Mailable
{
    public array $datos;

    public function __construct(array $datos)
    {
        $this->datos = $datos;
    }

    public function build()
    {
        return $this
            ->subject('Recordatorio de evento')
            ->view('emails.eventos.recordatorio')
            ->with($this->datos);
    }
}
