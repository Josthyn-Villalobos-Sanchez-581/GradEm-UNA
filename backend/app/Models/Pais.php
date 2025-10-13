<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pais extends Model
{
    use HasFactory;

    protected $table = 'paises';
    protected $primaryKey = 'id_pais';
    public $timestamps = false;

    protected $fillable = ['nombre'];

    public function provincias()
    {
        return $this->hasMany(Provincia::class, 'id_pais', 'id_pais');
    }
}
