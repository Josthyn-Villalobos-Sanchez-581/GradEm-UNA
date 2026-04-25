<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evento extends Model
{
    protected $table = 'eventos';
    protected $primaryKey = 'id_evento';

    public $timestamps = false;

    protected $fillable = [
        'titulo',
        'descripcion',
        'fecha_evento',
        'fecha_limite_inscripcion',
        'hora_evento',
        'id_ubicacion',
        'id_modalidad',
        'cupos',
        'fecha_creacion',
        'estado_id',
        'usuario_id'
    ];
}