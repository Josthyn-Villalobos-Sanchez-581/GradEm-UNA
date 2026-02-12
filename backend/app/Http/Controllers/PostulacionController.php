<?php

namespace App\Http\Controllers;

use App\Models\Postulacion;
use App\Models\Oferta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PostulacionController extends Controller
{
    // ===========================================================
    // POSTULARSE A UNA OFERTA (permiso 6)
    // ===========================================================
    public function postular(Request $request, $id_oferta)
    {
        $usuario = Auth::user();

        $request->validate([
            'mensaje' => 'nullable|string|max:1000',
        ]);

        $oferta = Oferta::findOrFail($id_oferta);

        $existe = Postulacion::where('id_usuario', $usuario->id_usuario)
            ->where('id_oferta', $id_oferta)
            ->exists();

        if ($existe) {
            return back()->withErrors([
                'msg' => 'Ya te has postulado a esta oferta.'
            ]);
        }

        Postulacion::create([
            'id_usuario'        => $usuario->id_usuario,
            'id_oferta'         => $id_oferta,
            'mensaje'           => $request->mensaje,
            'fecha_postulacion' => now(),
            'estado_id'         => 1, // 1 = Espera
        ]);

        return redirect()
            ->route('ofertas.mostrar', $id_oferta)
            ->with('success', 'Postulación enviada correctamente.');
    }

    // ===========================================================
    // CAMBIAR ESTADO DE POSTULACIÓN (permiso 7)
    // 1 Espera | 2 Aceptado | 3 Negado
    // ===========================================================
    public function cambiarEstado(Request $request, $id)
    {
        $request->validate([
            'estado_id' => 'required|in:1,2,3,4'
        ]);

        $postulacion = Postulacion::with('oferta')->findOrFail($id);

        $usuario = Auth::user();

        if (
            $usuario->empresa &&
            $postulacion->oferta->id_empresa !== $usuario->empresa->id_empresa &&
            !$usuario->es_admin &&
            !in_array(5, getUserPermisos())
        ) {
            abort(403, 'No autorizado.');
        }

        $postulacion->update([
            'estado_id' => $request->estado_id
        ]);

        return back(); // 👈 IMPORTANTE
    }


    // ===========================================================
    // LISTAR POSTULACIONES DEL USUARIO LOGUEADO
    // ===========================================================
    public function misPostulaciones()
    {
        $usuario = Auth::user();

        $postulaciones = Postulacion::with(['oferta'])
            ->where('id_usuario', $usuario->id_usuario)
            ->orderByDesc('fecha_postulacion')
            ->paginate(10);

        return Inertia::render('Postulaciones/MisPostulaciones', [
            'postulaciones' => $postulaciones,
            'userPermisos'  => getUserPermisos(),
        ]);
    }
}
