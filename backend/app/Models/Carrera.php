<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Carrera extends Model
{
    use HasFactory;

    protected $table = 'carreras';
    protected $primaryKey = 'id_carrera';
    public $timestamps = false;

    protected $fillable = ['nombre', 'id_universidad'];

    public function universidad()
    {
        return $this->belongsTo(Universidad::class, 'id_universidad', 'id_universidad');
    }
}
