<?php

namespace App\Repositories\NotificacionCursoRepositories;

use Illuminate\Support\Facades\Log;

class NotificacionCursoRepository
{
    public function registrarEvento(array $datos)
    {
        // Placeholder: aquí luego se conecta a BD
        Log::info('Evento de curso registrado', $datos);
    }
}
