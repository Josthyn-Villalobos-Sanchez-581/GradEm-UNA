<?php
//backend/app/Models/PlataformaExterna.php 
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlataformaExterna extends Model
{
    protected $table = 'plataformas_externas';
    protected $primaryKey = 'id_plataforma';
    public $timestamps = false; // ⚠️ Desactiva si la tabla no tiene created_at/updated_at

    protected $fillable = [
        'id_usuario',
        'tipo',
        'url',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}
