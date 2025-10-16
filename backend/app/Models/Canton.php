<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Canton extends Model
{
    use HasFactory;

    protected $table = 'cantones';
    protected $primaryKey = 'id_canton';
    public $timestamps = false;

    protected $fillable = ['nombre', 'id_provincia'];

    public function provincia()
    {
        return $this->belongsTo(Provincia::class, 'id_provincia', 'id_provincia');
    }
}
