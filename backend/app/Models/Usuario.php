<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Usuario extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false; // no hay created_at / updated_at
    protected $guarded = []; // puedes usar fillable si prefieres

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
        'id_universidad',
        'id_carrera',
        'estado_id',
        // ¡Estos son los campos que faltaban!
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
}
