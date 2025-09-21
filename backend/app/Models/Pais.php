<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pais extends Model
{
    protected $table = 'paises';       // Nombre de la tabla
    protected $primaryKey = 'id_pais'; // Clave primaria
    public $timestamps = false;        // No tiene created_at ni updated_at
}