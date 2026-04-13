<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FinalizarEventosCommand extends Command
{
    /**
     * Nombre del comando (IMPORTANTE)
     */
    protected $signature = 'eventos:finalizar';

    /**
     * Descripción
     */
    protected $description = 'Finaliza eventos automáticamente según fecha y hora';

    /**
     * Lógica del comando
     */
    public function handle()
    {
        $eventosActualizados = DB::table('eventos')
            ->where('estado_id', 1) // publicados
            ->whereRaw("CONCAT(fecha_evento, ' ', hora_evento) < NOW()")
            ->update([
                'estado_id' => 4 // FINALIZADO
            ]);

        $this->info("Eventos finalizados: " . $eventosActualizados);

        return 0;
    }
}



