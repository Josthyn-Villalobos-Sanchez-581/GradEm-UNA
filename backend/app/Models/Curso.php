<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    protected $table = 'cursos';
    protected $primaryKey = 'id_curso';

    public $timestamps = false;

    protected $fillable = [
        'titulo',
        'descripcion',
        'id_modalidad',
        'fecha_inicio',
        'fecha_fin',
        'fecha_limite_inscripcion',
        'duracion',
        'nombreInstructor',
        'estado_id',
    ];

    /* ============================
     | Relaciones
     ============================ */

    public function modalidad()
    {
        return $this->belongsTo(Modalidad::class, 'id_modalidad');
    }

    public function inscripciones()
    {
        return $this->hasMany(InscripcionCurso::class, 'id_curso');
    }
}
