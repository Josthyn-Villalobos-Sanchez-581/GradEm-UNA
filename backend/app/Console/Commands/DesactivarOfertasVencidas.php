<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DesactivarOfertasCommand extends Command
{
    /**
     * Nombre del comando
     */
    protected $signature = 'ofertas:desactivar';

    /**
     * Descripción
     */
    protected $description = 'Desactiva ofertas automáticamente según fecha límite';

    /**
     * Lógica del comando
     */
    public function handle()
    {
        $ofertasActualizadas = DB::table('ofertas')
            ->where('estado_id', 1) // activas
            ->whereDate('fecha_limite', '<', now())
            ->update([
                'estado_id' => 4 // INACTIVA
            ]);

        $this->info("Ofertas desactivadas: " . $ofertasActualizadas);

        return 0;
    }
}