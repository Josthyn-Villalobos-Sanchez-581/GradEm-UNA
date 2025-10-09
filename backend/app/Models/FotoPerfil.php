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

    // Relación con Usuario
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
    // Accesor para obtener la URL completa de la imagen
/*public function getRutaImagenAttribute($valor)
{
    return $valor ? asset(ltrim($valor, '/')) : null;
}
*/
}
