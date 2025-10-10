<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IdiomaCatalogo extends Model
{
    protected $table = 'idiomas_catalogo';
    protected $primaryKey = 'id_idioma_catalogo';
    public $timestamps = false;

    protected $fillable = ['nombre'];

    public function idiomas()
    {
        //return $this->hasMany(Idioma::class, 'id_idioma_catalogo', 'id_idioma_catalogo');
    }
}
