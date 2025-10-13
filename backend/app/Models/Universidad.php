<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Universidad extends Model
{
    use HasFactory;

    protected $table = 'universidades';
    protected $primaryKey = 'id_universidad';
    public $timestamps = false;

    protected $fillable = ['nombre', 'sigla'];

    public function carreras()
    {
        return $this->hasMany(Carrera::class, 'id_universidad', 'id_universidad');
    }
}
