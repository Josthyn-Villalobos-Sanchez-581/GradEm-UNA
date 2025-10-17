<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IdiomaCatalogo extends Model
{
    use HasFactory;

    protected $table = 'idiomas_catalogo';
    protected $primaryKey = 'id_idioma_catalogo';
    public $timestamps = false;

    protected $fillable = ['nombre'];
}
