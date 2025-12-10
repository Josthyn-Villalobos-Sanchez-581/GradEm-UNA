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

        // Validación
        $request->validate([
            'mensaje' => 'nullable|string|max:1000',
        ]);

        // Verificar que la oferta exista
        $oferta = Oferta::findOrFail($id_oferta);

        // Evitar postulación duplicada
        $existe = Postulacion::where('id_usuario', $usuario->id_usuario)
            ->where('id_oferta', $id_oferta)
            ->first();

        if ($existe) {
            return back()->withErrors(['msg' => 'Ya te has postulado a esta oferta.']);
        }

        // Crear postulación
        Postulacion::create([
            'id_usuario'       => $usuario->id_usuario,
            'id_oferta'        => $id_oferta,
            'mensaje'          => $request->mensaje,
            'fecha_postulacion' => now(),
            'estado_id'        => 1, // estado "activo" o "pendiente"
        ]);

        return redirect()->route('ofertas.mostrar', $id_oferta)
            ->with('success', 'Postulación enviada correctamente.');
    }



    // ===========================================================
    // LISTAR POSTULACIONES RECIBIDAS (permiso 7)
    // Empresas y admin revisan postulaciones
    // ===========================================================
    public function index()
    {
        $postulaciones = Postulacion::with(['usuario', 'oferta'])
            ->orderBy('fecha_postulacion', 'desc')
            ->paginate(15);

        return Inertia::render('Postulaciones/PostulacionesIndex', [
            'postulaciones' => $postulaciones,
            'userPermisos'   => getUserPermisos(),
        ]);
    }


    // ===========================================================
    // VER DETALLE DE UNA POSTULACIÓN (permiso 7)
    // ===========================================================
    public function mostrar($id)
    {
        $postulacion = Postulacion::with(['usuario', 'oferta'])
            ->findOrFail($id);

        return Inertia::render('Postulaciones/PostulacionDetalle', [
            'postulacion' => $postulacion,
            'userPermisos' => getUserPermisos(),
        ]);
    }


    // ===========================================================
    // CAMBIAR ESTADO DE POSTULACIÓN (permiso 7)
    // ejemplo: aceptado, rechazado, en revisión, etc.
    // ===========================================================
    public function actualizarEstado(Request $request, $id)
    {
        $request->validate([
            'estado_id' => 'required|integer'
        ]);

        $postulacion = Postulacion::findOrFail($id);
        $postulacion->estado_id = $request->estado_id;
        $postulacion->save();

        return back()->with('success', 'Estado actualizado correctamente.');
    }


    // ===========================================================
    // LISTAR POSTULACIONES DEL USUARIO LOGUEADO
    // (estudiante ve sus postulaciones)
    // ===========================================================
    public function misPostulaciones()
    {
        $usuario = Auth::user();

        $postulaciones = Postulacion::with(['oferta'])
            ->where('id_usuario', $usuario->id_usuario)
            ->orderBy('fecha_postulacion', 'desc')
            ->paginate(10);

        return Inertia::render('Postulaciones/MisPostulaciones', [
            'postulaciones' => $postulaciones,
            'userPermisos' => getUserPermisos(),
        ]);
    }
}
