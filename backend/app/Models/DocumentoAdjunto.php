<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentoAdjunto extends Model
{
    use HasFactory;

    protected $table = 'documentos_adjuntos';
    protected $primaryKey = 'id_documento';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'tipo',
        'ruta_archivo',
        'nombre_original',
        'fecha_subida',
    ];

    // Accesor para obtener el nombre del archivo desde la ruta (útil en frontend)
    public function getNombreAttribute()
    {
        return basename($this->ruta_archivo);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }
    
}
