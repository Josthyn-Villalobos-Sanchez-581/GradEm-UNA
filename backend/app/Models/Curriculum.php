<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Curriculum extends Model
{
    use HasFactory;
    protected $table = 'curriculum';
    protected $primaryKey = 'id_curriculum';
    public $timestamps = false; // usamos `fecha_creacion`

    protected $fillable = [
        'id_usuario',
        'generado_sistema',
        'ruta_archivo_pdf',
        'fecha_creacion',
    ];
}
