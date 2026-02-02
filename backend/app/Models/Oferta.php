<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Oferta extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla
     */
    protected $table = 'ofertas';

    /**
     * Llave primaria
     */
    protected $primaryKey = 'id_oferta';

    /**
     * Timestamps
     * (fecha_publicacion se maneja manualmente)
     */
    public $timestamps = false;

    /**
     * Campos asignables masivamente
     */
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
        'id_carrera',
    ];

    /**
     * Casts de tipos
     * 👉 CLAVE para requisitos en JSON
     */
    protected $casts = [
        'requisitos'         => 'array',     // JSON ⇄ array automático
        'fecha_limite'       => 'date',
        'fecha_publicacion'  => 'datetime',
    ];

    /* ======================================================
     * RELACIONES
     * ====================================================== */

    /**
     * Empresa que publica la oferta
     */
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'id_empresa', 'id_empresa');
    }

    /**
     * Área laboral
     */
    public function areaLaboral(): BelongsTo
    {
        return $this->belongsTo(AreaLaboral::class, 'id_area_laboral', 'id_area_laboral');
    }

    /**
     * País
     */
    public function pais(): BelongsTo
    {
        return $this->belongsTo(Pais::class, 'id_pais', 'id_pais');
    }

    /**
     * Provincia
     */
    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'id_provincia', 'id_provincia');
    }

    /**
     * Cantón
     */
    public function canton(): BelongsTo
    {
        return $this->belongsTo(Canton::class, 'id_canton', 'id_canton');
    }

    /**
     * Modalidad (Presencial, Remoto, etc.)
     */
    public function modalidad(): BelongsTo
    {
        return $this->belongsTo(Modalidad::class, 'id_modalidad', 'id_modalidad');
    }

    /**
     * Carrera asociada a la oferta
     */
    public function carrera(): BelongsTo
    {
        return $this->belongsTo(Carrera::class, 'id_carrera', 'id_carrera');
    }
    /**
     * Oferta eliminada
     */
    public function estaEliminada(): bool
    {
        return $this->estado_id === 0;
    }

}
