<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory; 

class Usuario extends Authenticatable
{
       use HasFactory;
    use HasApiTokens;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false; // no hay created_at / updated_at
    protected $guarded = [];

    protected $fillable = [
        'nombre_completo',
        'correo',
        'identificacion',
        'telefono',
        'fecha_nacimiento',
        'genero',
        'id_universidad',
        'id_carrera',
        'estado_empleo',
        'estado_estudios',
        'fecha_registro',
        'id_rol',
        'estado_id',
        'anio_graduacion',
        'nivel_academico',
        'tiempo_conseguir_empleo',
        'area_laboral_id',
        'id_canton',
        'salario_promedio',
        'tipo_empleo',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'anio_graduacion' => 'integer',
    ];

    /**
     * Relación uno a uno con Credencial
     */
    public function credencial(): HasOne
    {
        return $this->hasOne(Credencial::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Relación uno a uno con empresa
     */
    public function empresa()
    {
        return $this->hasOne(Empresa::class, 'usuario_id', 'id_usuario');
    }

    /**
     * Relación con Rol
     */
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol', 'id_rol');
    }

    /**
     * Relación uno a uno con FotoPerfil
     */
    public function fotoPerfil(): HasOne
    {
        return $this->hasOne(FotoPerfil::class, 'id_usuario', 'id_usuario');
    }

    public function universidad(): BelongsTo
    {
        return $this->belongsTo(Universidad::class, 'id_universidad', 'id_universidad');
    }

    /**
     * Relación con Carrera
     */
    public function carrera(): BelongsTo
    {
        return $this->belongsTo(Carrera::class, 'id_carrera', 'id_carrera');
    }

    public function curriculum(): HasOne
    {
        return $this->hasOne(Curriculum::class, 'id_usuario', 'id_usuario');
    }

    public function documentosAdjuntos()
    {
        return $this->hasMany(DocumentoAdjunto::class, 'id_usuario', 'id_usuario');
    }

    public function plataformasExternas()
{
    return $this->hasMany(PlataformaExterna::class, 'id_usuario', 'id_usuario');
}
    public function areaLaboral()
    {
        return $this->belongsTo(AreaLaboral::class, 'area_laboral_id', 'id_area_laboral');
    }
}
