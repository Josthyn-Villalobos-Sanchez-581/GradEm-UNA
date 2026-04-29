<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Riesgo extends Model
{
    protected $table = 'riesgos';

    protected $primaryKey = 'id_riesgo';

    public $timestamps = false; // usamos fecha_creacion manual

    protected $fillable = [
        'tipo_riesgo',
        'descripcion',
        'probabilidad',
        'impacto',
        'responsable',
        'estrategia',
        'accion_mitigacion',
        'plan_contingencia',
        'estado_id'
    ];

    /**
     * Accesor para obtener la magnitud (por si no viene de la BD)
     */
    public function getMagnitudAttribute()
    {
        return $this->probabilidad * $this->impacto;
    }

    /**
     * Obtener nivel de riesgo (bajo, medio, alto)
     */
    public function getNivelRiesgoAttribute()
    {
        $magnitud = $this->magnitud;

        if ($magnitud <= 4) {
            return 'bajo';
        }

        if ($magnitud <= 9) {
            return 'medio';
        }

        return 'alto';
    }
}