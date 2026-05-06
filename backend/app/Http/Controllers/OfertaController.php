<?php

namespace App\Http\Controllers;

use App\Models\Oferta;
use App\Models\Pais;
use App\Models\Provincia;
use App\Models\Canton;
use App\Models\Modalidad;
use App\Models\Postulacion;
use App\Models\AreaLaboral;
use App\Models\Carrera;
use App\Models\Curriculum;
use App\Services\OfertaServices\OfertaService;
use App\Repositories\OfertaRepositories\OfertaRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OfertaController extends Controller
{
    protected $ofertaService;
    protected $ofertaRepo;

    public function __construct(OfertaService $ofertaService, OfertaRepository $ofertaRepo)
    {
        $this->ofertaService = $ofertaService;
        $this->ofertaRepo = $ofertaRepo;
    }

    public function listar(Request $request)
    {
        $this->ofertaService->desactivarOfertasVencidas();

        $consulta = $this->ofertaRepo->obtenerConsultaBase()
            ->where('estado_id', 1)
            ->where('fecha_limite', '>=', now());

        // --- Filtros (Misma lógica original) ---
        if ($request->filled('tipo_oferta')) $consulta->where('tipo_oferta', $request->tipo_oferta);
        if ($request->filled('id_pais')) $consulta->where('id_pais', $request->id_pais);
        if ($request->filled('id_provincia')) $consulta->where('id_provincia', $request->id_provincia);
        if ($request->filled('id_canton')) $consulta->where('id_canton', $request->id_canton);
        if ($request->filled('id_area_laboral')) $consulta->where('id_area_laboral', $request->id_area_laboral);
        if ($request->filled('id_modalidad')) $consulta->where('id_modalidad', $request->id_modalidad);

        if ($request->filled('buscar')) {
            $buscar = $request->buscar;
            $consulta->where(function ($q) use ($buscar) {
                $q->where('titulo', 'like', "%{$buscar}%")
                    ->orWhere('descripcion', 'like', "%{$buscar}%")
                    ->orWhere('categoria', 'like', "%{$buscar}%");
            });
        }

        if ($request->filled('fecha_inicio')) $consulta->whereDate('fecha_publicacion', '>=', $request->fecha_inicio);
        if ($request->filled('fecha_fin')) $consulta->whereDate('fecha_publicacion', '<=', $request->fecha_fin);

        $ordenarPor = $request->get('ordenar_por', 'fecha_publicacion');
        $direccion  = $request->get('direccion', 'desc');
        if (!in_array($ordenarPor, ['fecha_publicacion', 'fecha_limite', 'titulo'])) $ordenarPor = 'fecha_publicacion';
        if (!in_array($direccion, ['asc', 'desc'])) $direccion = 'desc';

        $ofertas = $consulta->orderBy($ordenarPor, $direccion)->paginate(9)->withQueryString();

        $ofertas->getCollection()->transform(fn($o) => $this->ofertaService->normalizarFotoPerfil($o));

        return Inertia::render('Ofertas/OfertasIndex', [
            'ofertas'        => $ofertas,
            'filtros'        => $request->all(),
            'paises'         => Pais::orderBy('nombre')->get(['id_pais as id', 'nombre']),
            'provincias'     => Provincia::orderBy('nombre')->get(['id_provincia as id', 'nombre', 'id_pais']),
            'cantones'       => Canton::orderBy('nombre')->get(['id_canton as id', 'nombre', 'id_provincia']),
            'modalidades'    => Modalidad::orderBy('nombre')->get(['id_modalidad as id', 'nombre']),
            'areasLaborales' => AreaLaboral::orderBy('nombre')->get(['id_area_laboral as id', 'nombre']),
            'userPermisos'   => getUserPermisos(),
        ]);
    }

    public function mostrar(Oferta $oferta)
    {
        $oferta->load(['empresa.usuario.fotoPerfil', 'pais', 'provincia', 'canton', 'modalidad', 'areaLaboral', 'carrera']);
        $usuario = Auth::user();

        $yaPostulado = $usuario ? Postulacion::where('id_usuario', $usuario->id_usuario)->where('id_oferta', $oferta->id_oferta)->exists() : false;

        $this->ofertaService->normalizarFotoPerfil($oferta);

        $tieneCvValido = false;
        if ($usuario) {
            $tieneCvValido = Curriculum::where('id_usuario', $usuario->id_usuario)
                ->where(function ($query) {
                    $query->where('generado_sistema', true)->orWhereNotNull('ruta_archivo_pdf');
                })->exists();
        }

        return Inertia::render('Ofertas/OfertaDetallePagina', [
            'oferta'       => $oferta,
            'yaPostulado'  => $yaPostulado,
            'tieneCV'      => $tieneCvValido,
            'userPermisos' => getUserPermisos(),
        ]);
    }

    public function crear()
    {
        $usuario = Auth::user();
        $empresa = $usuario->empresa;

        if (!$empresa && !($usuario->es_admin || in_array(5, getUserPermisos()))) abort(403, 'No autorizado.');

        return Inertia::render('Ofertas/CrearOferta', [
            'empresa'        => optional($empresa)->load('usuario.fotoPerfil'),
            'areasLaborales' => AreaLaboral::orderBy('nombre')->get(['id_area_laboral as id', 'nombre']),
            'modalidades'    => Modalidad::orderBy('nombre')->get(['id_modalidad as id', 'nombre']),
            'paises'         => Pais::orderBy('nombre')->get(['id_pais as id', 'nombre']),
            'provincias'     => Provincia::orderBy('nombre')->get(['id_provincia as id', 'nombre', 'id_pais']),
            'cantones'       => Canton::orderBy('nombre')->get(['id_canton as id', 'nombre', 'id_provincia']),
            'carreras'       => Carrera::orderBy('nombre')->get(['id_carrera as id', 'nombre']),
            'userPermisos'   => getUserPermisos(),
        ]);
    }

    public function guardar(Request $request)
    {
        $usuario = Auth::user();
        $empresa = $usuario->empresa;

        if (!$empresa && !($usuario->es_admin || in_array(5, getUserPermisos()))) abort(403, 'No autorizado.');

        $datos = $request->validate([
            'titulo' => 'required|string|max:100',
            'descripcion' => 'required|string',
            'requisitos' => 'nullable|array',
            'requisitos.*' => 'string|max:255',
            'tipo_oferta' => 'required|string|max:50',
            'categoria' => 'required|string|max:50',
            'id_area_laboral' => 'required|integer',
            'id_carrera' => 'required|integer',
            'id_pais' => 'required|integer',
            'id_provincia' => 'required|integer',
            'id_canton' => 'required|integer',
            'id_modalidad' => 'required|integer',
            'horario' => 'required|string|max:255',
            'fecha_limite' => 'required|date|after_or_equal:today',
            'estado_id' => 'nullable|integer|in:1,2',
        ]);

        if ($empresa) $datos['id_empresa'] = $empresa->id_empresa;
        $datos['fecha_publicacion'] = now();
        $datos['requisitos'] = json_encode($request->requisitos);

        $this->ofertaRepo->crear($datos);

        return redirect()->route('empresa.ofertas.index')->with('success', 'Oferta creada correctamente.');
    }

    public function eliminar(Oferta $oferta)
    {
        $usuario = Auth::user();
        if (!$usuario->empresa && !($usuario->es_admin || in_array(5, getUserPermisos()))) abort(403, 'No autorizado.');

        $this->ofertaRepo->actualizar($oferta, ['estado_id' => 3]);
        return back()->with('success', 'Oferta desactivada correctamente.');
    }

    public function indexEmpresa(Request $request)
    {
        $this->ofertaService->desactivarOfertasVencidas();
        $usuario = $request->user();

        if (!$usuario) abort(403, 'No autorizado.');

        $consulta = Oferta::with(['empresa.usuario.fotoPerfil', 'modalidad'])
            ->withCount('postulaciones')
            ->where('estado_id', '!=', Oferta::ESTADO_INACTIVA);

        if ($usuario->empresa) $consulta->where('id_empresa', $usuario->empresa->id_empresa);
        if ($request->filled('buscar')) $consulta->where('titulo', 'like', '%' . $request->buscar . '%');
        if ($request->filled('id_modalidad')) $consulta->where('id_modalidad', (int) $request->id_modalidad);
        if ($request->filled('estado')) $consulta->where('estado_id', $request->estado);
        if ($request->filled('fecha_inicio')) $consulta->whereDate('fecha_publicacion', '>=', $request->fecha_inicio);
        if ($request->filled('fecha_fin')) $consulta->whereDate('fecha_publicacion', '<=', $request->fecha_fin);

        $ofertas = $consulta->orderByDesc('fecha_publicacion')->paginate($request->get('per_page', 10))->withQueryString();
        $ofertas->getCollection()->transform(fn($o) => $this->ofertaService->normalizarFotoPerfil($o));

        return Inertia::render('Ofertas/EmpresaOfertasIndex', [
            'ofertas' => $ofertas,
            'filtros' => $request->only(['buscar', 'fecha_inicio', 'fecha_fin', 'estado', 'per_page']),
            'userPermisos' => getUserPermisos(),
        ]);
    }

    public function gestionar(Request $request, Oferta $oferta)
    {
        $usuario = Auth::user();
        $empresa = $usuario->empresa;

        if ((!$empresa && !($usuario->es_admin || in_array(5, getUserPermisos()))) ||
            ($empresa && $oferta->id_empresa !== $empresa->id_empresa && !($usuario->es_admin || in_array(5, getUserPermisos())))
        ) {
            abort(403, 'No autorizado.');
        }

        $oferta->load(['empresa.usuario.fotoPerfil', 'modalidad', 'areaLaboral', 'carrera', 'pais', 'provincia', 'canton']);
        $this->ofertaService->normalizarFotoPerfil($oferta);

        $consulta = Postulacion::with(['usuario.fotoPerfil', 'usuario.curriculum'])->where('id_oferta', $oferta->id_oferta);
        if ($request->estado) $consulta->where('estado_id', $request->estado);

        $postulaciones = $consulta->orderByDesc('fecha_postulacion')->paginate(10)->withQueryString();
        $postulaciones->getCollection()->transform(function ($p) {
            return [
                'id_postulacion' => $p->id_postulacion,
                'mensaje' => $p->mensaje,
                'fecha_postulacion' => $p->fecha_postulacion,
                'estado_id' => $p->estado_id,
                'usuario' => $p->usuario ? [
                    'id_usuario' => $p->usuario->id_usuario,
                    'nombre' => $p->usuario->nombre_completo,
                    'fotoPerfil' => $p->usuario->fotoPerfil ? ['url' => asset(ltrim($p->usuario->fotoPerfil->ruta_imagen, '/'))] : null,
                    'curriculum' => $p->usuario->curriculum ? ['ruta_archivo_pdf' => asset(ltrim($p->usuario->curriculum->ruta_archivo_pdf, '/'))] : null,
                ] : null,
            ];
        });

        return Inertia::render('Ofertas/GestionOferta', [
            'oferta'        => $oferta,
            'postulaciones' => $postulaciones,
            'estadisticas'  => $this->ofertaRepo->obtenerEstadisticasPostulaciones($oferta->id_oferta),
            'filtroEstado'  => $request->estado,
            'userPermisos'  => getUserPermisos(),
        ]);
    }

    public function editar(Oferta $oferta)
    {
        $usuario = Auth::user();
        $empresa = $usuario->empresa ?? $oferta->empresa;

        if ((!$empresa && !($usuario->es_admin || in_array(5, getUserPermisos()))) ||
            ($empresa && $oferta->id_empresa !== $empresa->id_empresa && !($usuario->es_admin || in_array(5, getUserPermisos())))
        ) {
            abort(403, 'No autorizado.');
        }

        return Inertia::render('Ofertas/EditarOferta', [
            'oferta' => $oferta,
            'empresa' => optional($empresa)->load('usuario.fotoPerfil'),
            'areasLaborales' => AreaLaboral::orderBy('nombre')->get(['id_area_laboral as id', 'nombre']),
            'modalidades' => Modalidad::orderBy('nombre')->get(['id_modalidad as id', 'nombre']),
            'paises' => Pais::orderBy('nombre')->get(['id_pais as id', 'nombre']),
            'provincias' => Provincia::orderBy('nombre')->get(['id_provincia as id', 'nombre', 'id_pais']),
            'cantones' => Canton::orderBy('nombre')->get(['id_canton as id', 'nombre', 'id_provincia']),
            'carreras' => Carrera::orderBy('nombre')->get(['id_carrera as id', 'nombre']),
            'userPermisos' => getUserPermisos(),
        ]);
    }

    public function actualizar(Request $request, Oferta $oferta)
    {
        $usuario = Auth::user();
        if (
            !$usuario->es_admin &&
            !in_array(5, getUserPermisos()) &&
            (!$usuario->empresa || $oferta->id_empresa !== $usuario->empresa->id_empresa)
        ) {
            abort(403, 'No autorizado.');
        }

        $datos = $request->validate([
            'titulo' => 'required|string|max:100',
            'descripcion' => 'required|string',
            'requisitos' => 'nullable|array',
            'requisitos.*' => 'string|max:255',
            'tipo_oferta' => 'required|string|max:50',
            'categoria' => 'required|string|max:50',
            'id_area_laboral' => 'required|integer',
            'id_carrera' => 'required|integer',
            'id_pais' => 'required|integer',
            'id_provincia' => 'required|integer',
            'id_canton' => 'required|integer',
            'id_modalidad' => 'required|integer',
            'horario' => 'required|string|max:255',
            'fecha_limite' => 'required|date|after_or_equal:today',
            'estado_id' => 'required|integer',
        ]);

        // 🔥 DETECTAR CAMBIO DE FECHA
        $fechaOriginal = $oferta->fecha_limite->format('Y-m-d');
        $fechaNueva = $request->fecha_limite;

        $fechaCambio = $fechaOriginal !== $fechaNueva;

        // 🔥 REGLA DE NEGOCIO
        if ($fechaCambio && !$request->filled('estado_id')) {
            return back()->withErrors([
                'estado_id' => 'Debes seleccionar el estado de la oferta al modificar la fecha de inscripción.'
            ])->withInput();
        }

        $datos['requisitos'] = json_encode($request->requisitos);

        $this->ofertaRepo->actualizar($oferta, $datos);

        return redirect()
            ->route('empresa.ofertas.index')
            ->with('success', 'Oferta actualizada correctamente.');
    }

    public function cambiarEstado(Request $request, Oferta $oferta)
    {
        $usuario = Auth::user();
        if (!$usuario->es_admin && !in_array(5, getUserPermisos()) && (!$usuario->empresa || $oferta->id_empresa !== $usuario->empresa->id_empresa)) {
            abort(403, 'No autorizado.');
        }

        $request->validate(['estado_id' => 'required|in:1,2']);
        $this->ofertaRepo->actualizar($oferta, ['estado_id' => $request->estado_id]);

        return back()->with('success', 'Estado de la oferta actualizado.');
    }
}
