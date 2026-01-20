<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Postulacion extends Model
{
    protected $table = 'postulaciones';
    protected $primaryKey = 'id_postulacion';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_oferta',
        'mensaje',
        'fecha_postulacion',
        'estado_id'
    ];

    // ============================
    // RELACIONES
    // ============================

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function oferta()
    {
        return $this->belongsTo(Oferta::class, 'id_oferta');
    }

    public function estado()
    {
        return $this->belongsTo(CatalogoEstado::class, 'estado_id');
    }
}
