<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Modalidad extends Model
{
    protected $table = 'modalidades';
    protected $primaryKey = 'id_modalidad';
    public $timestamps = false;

    protected $fillable = ['nombre_modalidad', 'descripcion'];

    public function cursos()
    {
        //return $this->hasMany(Curso::class, 'id_modalidad', 'id_modalidad');
    }

    public function eventos()
    {
        //return $this->hasMany(Evento::class, 'id_modalidad', 'id_modalidad');
    }
}
