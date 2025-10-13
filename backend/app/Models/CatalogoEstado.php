<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatalogoEstado extends Model
{
    use HasFactory;

    protected $table = 'catalogo_estados';
    protected $primaryKey = 'id_estado';
    public $timestamps = false;

    protected $fillable = ['nombre_estado'];
}
