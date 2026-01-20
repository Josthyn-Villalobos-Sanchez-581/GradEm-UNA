<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Oferta extends Model
{
    protected $table = 'ofertas';
    protected $primaryKey = 'id_oferta';

    protected $fillable = [
        'id_empresa',
        'titulo',
        'descripcion',
        'requisitos',
        'tipo_oferta',
        'categoria',
        'id_area_laboral',
        'id_pais',
        'id_provincia',
        'id_canton',
        'id_modalidad',
        'horario',
        'fecha_limite',
        'fecha_publicacion',
        'estado_id',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'id_empresa');
    }

    public function pais()
    {
        return $this->belongsTo(Pais::class, 'id_pais');
    }

    public function provincia()
    {
        return $this->belongsTo(Provincia::class, 'id_provincia');
    }

    public function canton()
    {
        return $this->belongsTo(Canton::class, 'id_canton');
    }

    public function modalidad()
    {
        return $this->belongsTo(Modalidad::class, 'id_modalidad');
    }

    // 👇 Relación con áreas laborales
    public function areaLaboral()
    {
        return $this->belongsTo(AreaLaboral::class, 'id_area_laboral');
    }
}
