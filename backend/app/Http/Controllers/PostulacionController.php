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
            'estado_id' => 'required|in:1,2,3,4,5'
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
    public function misPostulaciones(Request $request)
    {
        $usuario = Auth::user();

        $query = Postulacion::with([
            'oferta.empresa.usuario.fotoPerfil',
            'oferta.pais',
            'oferta.provincia',
            'oferta.canton',
            'oferta.modalidad',
            'oferta.areaLaboral', // ✅ CORRECTO
        ])
            ->where('id_usuario', $usuario->id_usuario);

        // 🔎 Buscar por título
        if ($request->filled('buscar')) {
            $query->whereHas('oferta', function ($q) use ($request) {
                $q->where('titulo', 'like', '%' . $request->buscar . '%');
            });
        }

        // 🎯 Filtrar por estado
        if ($request->filled('estado_id')) {
            $query->where('estado_id', $request->estado_id);
        }

        $postulaciones = $query
            ->orderByDesc('fecha_postulacion')
            ->paginate(9)
            ->withQueryString();

        $postulaciones->getCollection()->transform(function ($postulacion) {

            if (
                $postulacion->oferta &&
                $postulacion->oferta->empresa &&
                $postulacion->oferta->empresa->usuario &&
                $postulacion->oferta->empresa->usuario->fotoPerfil
            ) {

                $foto = $postulacion->oferta->empresa->usuario->fotoPerfil;

                $url = is_array($foto)
                    ? ($foto['url'] ?? null)
                    : ($foto->ruta_imagen ? asset($foto->ruta_imagen) : null);

                $postulacion->oferta->empresa->usuario->fotoPerfil = $url
                    ? ['url' => $url]
                    : null;
            } else {

                if (
                    $postulacion->oferta &&
                    $postulacion->oferta->empresa &&
                    $postulacion->oferta->empresa->usuario
                ) {
                    $postulacion->oferta->empresa->usuario->fotoPerfil = null;
                }
            }

            return $postulacion;
        });

        return Inertia::render('Ofertas/MisPostulaciones', [
            'postulaciones' => $postulaciones,
            'filtros' => $request->only(['buscar', 'estado_id']),
            'userPermisos'  => getUserPermisos(),
        ]);
    }

    public function cancelar($id)
    {
        $usuario = Auth::user();

        $postulacion = Postulacion::where('id_postulacion', $id)
            ->where('id_usuario', $usuario->id_usuario)
            ->firstOrFail();

        if (!in_array($postulacion->estado_id, [1, 4])) {
            return back()->withErrors([
                'msg' => 'No puedes cancelar esta postulación.'
            ]);
        }

        $postulacion->update([
            'estado_id' => 5
        ]);

        return back()->with('success', 'Postulación cancelada.');
    }
}
