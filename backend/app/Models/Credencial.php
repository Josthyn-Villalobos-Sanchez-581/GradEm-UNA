<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Credencial extends Model
{
    protected $table = 'credenciales';
    protected $primaryKey = 'id_credencial';
    public $timestamps = false; // no hay created_at / updated_at
    protected $guarded = [];

    protected $fillable = [
        'id_usuario',
        'hash_contrasena',
        'fecha_ultimo_login',
        'intentos_fallidos',
        'fecha_ultimo_cambio',
        'fecha_baneo',
    ];

    /**
     * Relación inversa a Usuario
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}
