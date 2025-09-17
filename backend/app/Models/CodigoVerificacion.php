<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CodigoVerificacion extends Model
{
    protected $table = 'codigos_verificacion';
    public $timestamps = false; // solo tenemos created_at
    protected $fillable = ['correo', 'codigo', 'validado'];
}
