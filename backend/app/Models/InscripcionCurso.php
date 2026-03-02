<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InscripcionCurso extends Model
{
    protected $table = 'inscripciones_curso';
    protected $primaryKey = 'id_inscripcion';
    public $timestamps = false;

    protected $fillable = [
        'id_curso',
        'id_usuario',
        'fecha_inscripcion',
        'estado_id',
    ];

    // ============================
    // RELACIONES
    // ============================

    public function curso()
    {
        return $this->belongsTo(Curso::class, 'id_curso');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
