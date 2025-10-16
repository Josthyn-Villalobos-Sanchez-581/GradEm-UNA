<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Provincia extends Model
{
    use HasFactory;

    protected $table = 'provincias';
    protected $primaryKey = 'id_provincia';
    public $timestamps = false;

    protected $fillable = ['nombre', 'id_pais'];

    public function pais()
    {
        return $this->belongsTo(Pais::class, 'id_pais', 'id_pais');
    }

    public function cantones()
    {
        return $this->hasMany(Canton::class, 'id_provincia', 'id_provincia');
    }
}
