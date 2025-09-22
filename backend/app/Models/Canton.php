<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Canton extends Model
{
    protected $table = 'cantones';
    protected $primaryKey = 'id_canton';
    public $timestamps = false;

    public function provincia()
    {
        return $this->belongsTo(Provincia::class, 'id_provincia');
    }
}
