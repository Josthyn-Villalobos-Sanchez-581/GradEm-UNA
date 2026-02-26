<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FotoPerfil extends Model
{
    protected $table = 'fotos_perfil';
    protected $primaryKey = 'id_foto';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'ruta_imagen',
        'fecha_subida'
    ];

    protected $appends = ['url'];

    protected $hidden = ['ruta_imagen'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function getUrlAttribute(): string
    {
        return $this->ruta_imagen
            ? asset($this->ruta_imagen)
            : asset('images/avatar-default.png');
    }
}

