<?php

namespace App\Http\Controllers;

use App\Models\Postulacion;
use App\Models\Oferta;
use App\Services\PostulacionServices\PostulacionService;
use App\Repositories\PostulacionRepositories\PostulacionRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PostulacionController extends Controller
{
    protected $postulacionService;
    protected $postulacionRepo;

    public function __construct(PostulacionService $postulacionService, PostulacionRepository $postulacionRepo)
    {
        $this->postulacionService = $postulacionService;
        $this->postulacionRepo = $postulacionRepo;
    }

    public function postular(Request $request, $id_oferta)
    {
        $usuario = Auth::user();

        if (!$usuario || $usuario->es_admin) {
            abort(403, 'No autorizado.');
        }

        if (!$this->postulacionRepo->tieneCvValido($usuario->id_usuario)) {
            return back()->withErrors([
                'mensaje' => 'Debes crear o adjuntar tu currículum antes de postularte.'
            ]);
        }

        $request->validate([
            'mensaje' => 'nullable|string|max:1000',
        ]);

        $oferta = Oferta::findOrFail($id_oferta);

        $postulacion = $this->postulacionRepo->buscarPorUsuarioYOferta($usuario->id_usuario, $id_oferta);

        if ($postulacion) {
            return back()->withErrors([
                'msg' => 'Ya has realizado una postulación para esta oferta.'
            ]);
        }

        // Crear nueva postulación
        $this->postulacionRepo->crear([
            'id_usuario'        => $usuario->id_usuario,
            'id_oferta'         => $id_oferta,
            'mensaje'           => $request->mensaje,
            'fecha_postulacion' => now(),
            'estado_id'         => 1,
        ]);
        return redirect()
            ->route('ofertas.mostrar', $id_oferta)
            ->with('success', 'Postulación enviada correctamente.');
    }

    public function cambiarEstado(Request $request, $id)
    {
        $request->validate([
            'estado_id' => 'required|in:1,2,3,4,5'
        ]);

        $postulacion = $this->postulacionRepo->findOrFail($id, ['oferta']);
        $usuario = Auth::user();

        if (
            $usuario->empresa &&
            $postulacion->oferta->id_empresa !== $usuario->empresa->id_empresa &&
            !$usuario->es_admin &&
            !in_array(5, getUserPermisos())
        ) {
            abort(403, 'No autorizado.');
        }

        $this->postulacionRepo->actualizar($postulacion, [
            'estado_id' => $request->estado_id
        ]);

        return back();
    }

    public function misPostulaciones(Request $request)
    {
        $usuario = Auth::user();
        $query = $this->postulacionRepo->obtenerConsultaMisPostulaciones($usuario->id_usuario);

        if ($request->filled('buscar')) {
            $query->whereHas('oferta', function ($q) use ($request) {
                $q->where('titulo', 'like', '%' . $request->buscar . '%');
            });
        }

        if ($request->filled('estado_id')) {
            $query->where('estado_id', $request->estado_id);
        }

        if ($request->filled('tipo_oferta')) {
            $query->whereHas('oferta', function ($q) use ($request) {
                $q->where('tipo_oferta', $request->tipo_oferta);
            });
        }

        $postulaciones = $query
            ->orderByDesc('fecha_postulacion')
            ->paginate(9)
            ->withQueryString();

        $postulaciones->getCollection()->transform(function ($postulacion) {
            return $this->postulacionService->normalizarFotoOferta($postulacion);
        });

        return Inertia::render('Ofertas/MisPostulaciones', [
            'postulaciones' => $postulaciones,
            'filtros' => $request->only(['buscar', 'estado_id', 'tipo_oferta']),
            'userPermisos'  => getUserPermisos(),
        ]);
    }

    public function cancelar($id)
    {
        $usuario = Auth::user();
        $postulacion = $this->postulacionRepo->findOrFail($id);

        // Validación de propiedad
        if ($postulacion->id_usuario !== $usuario->id_usuario) {
            abort(403);
        }

        if (!in_array($postulacion->estado_id, [1, 4])) {
            return back()->withErrors([
                'msg' => 'No puedes cancelar esta postulación.'
            ]);
        }

        $this->postulacionRepo->actualizar($postulacion, [
            'estado_id' => 5
        ]);

        return back()->with('success', 'Postulación cancelada.');
    }
}
