<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BitacoraCambio extends Model
{
    protected $table = 'bitacora_cambios';

    protected $primaryKey = 'id_cambio';

    public $timestamps = false;

    protected $fillable = [
        'tabla_afectada',
        'operacion',
        'usuario_responsable',
        'fecha_cambio',
        'descripcion_cambio'
    ];
}