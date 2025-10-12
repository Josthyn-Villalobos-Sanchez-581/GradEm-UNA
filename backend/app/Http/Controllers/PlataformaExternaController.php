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

    // 🔹 Detectar estado y rol
    $estatus = strtolower($usuario->estado_estudios ?? '');
    $rol = strtolower($usuario->rol->nombre_rol ?? '');

    // 🔹 Permitir estudiantes, egresados y empresas
    $permitidos = ['estudiante', 'egresado', 'activo', 'pausado', 'finalizado'];

    if (!in_array($estatus, $permitidos) && $rol !== 'empresa') {
        return response()->json([
            'error' => 'Solo estudiantes, egresados o empresas pueden agregar enlaces.'
        ], 403);
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
