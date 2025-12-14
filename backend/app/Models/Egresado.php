<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Egresado extends Model
{
    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;

    protected $fillable = [
        'nombre_completo','correo','genero','estado_empleo','nivel_academico',
        'anio_graduacion','id_universidad','id_carrera','id_canton',
        'salario_promedio','tipo_empleo','tiempo_conseguir_empleo','estado_estudios'
    ];
}
