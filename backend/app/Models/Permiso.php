<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Permiso extends Model
{
    use HasFactory;

    protected $table = 'permisos';
    protected $primaryKey = 'id_permiso';
    public $timestamps = false;

    protected $fillable = ['nombre'];

    public function roles()
    {
        return $this->belongsToMany(Rol::class, 'roles_permisos', 'id_permiso', 'id_rol');
    }
}
