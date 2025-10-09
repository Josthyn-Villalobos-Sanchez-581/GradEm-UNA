<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    protected $table = 'empresas';

    protected $primaryKey = 'id_empresa';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'correo',
        'telefono',
        'persona_contacto',
        'usuario_id',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }
}
