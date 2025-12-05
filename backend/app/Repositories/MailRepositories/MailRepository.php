<?php

namespace App\Repositories\MailRepositories;

use Illuminate\Support\Facades\Mail;

class MailRepository
{
    public function enviarCorreo($correo, $mailable)
    {
        Mail::to($correo)->send($mailable);
    }
}
