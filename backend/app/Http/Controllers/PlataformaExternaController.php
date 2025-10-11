<?php
//backend/app/Http/Controllers/PlataformaExternaController.php
namespace App\Http\Controllers;

use App\Http\Requests\PlataformaExternaRequest;
use App\Models\PlataformaExterna;
use Illuminate\Support\Facades\Auth;
class PlataformaExternaController extends Controller
{
    /**
     * Agregar un enlace externo
     */
   public function store(PlataformaExternaRequest $request)
{
    
    $usuario = Auth::user();
    $estatus = strtolower($usuario->estado_estudios ?? '');
    $permitidos = ['estudiante', 'egresado', 'activo', 'graduado', 'finalizado','empresa'];
    if (!in_array($estatus, $permitidos)) {
        return response()->json(['error' => 'Solo estudiantes o egresados pueden agregar enlaces.'], 403);
    }

    $plataforma = PlataformaExterna::create([
        'id_usuario' => $usuario->id_usuario,
        'tipo' => $request->input('tipo'),
        'url' => $request->input('url'),
    ]);

    return response()->json([
        'success' => true,
        'mensaje' => 'Enlace agregado correctamente.',
        'plataformas' => PlataformaExterna::where('id_usuario', $usuario->id_usuario)->get()
    ]);
}

public function destroy($id)
{
    $usuario = Auth::user();
    $plataforma = PlataformaExterna::findOrFail($id);

    if ($plataforma->id_usuario !== $usuario->id_usuario) {
        return response()->json(['error' => 'No tiene permiso para eliminar este enlace.'], 403);
    }

    $plataforma->delete();

    return response()->json([
        'success' => true,
        'mensaje' => 'Enlace eliminado correctamente.',
        'plataformas' => PlataformaExterna::where('id_usuario', $usuario->id_usuario)->get()
    ]);
}
}
