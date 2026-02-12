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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OfertaController extends Controller
{
    /**
     * HU-25 + HU-27
     * Listar ofertas (estudiantes / egresados)
     */
    public function listar(Request $request)
    {
        $consulta = Oferta::with([
            'empresa.usuario.fotoPerfil',
            'pais',
            'provincia',
            'canton',
            'modalidad',
            'areaLaboral',
        ])->where('estado_id', 1);

        if ($request->filled('tipo_oferta')) {
            $consulta->where('tipo_oferta', $request->tipo_oferta);
        }

        if ($request->filled('id_pais')) {
            $consulta->where('id_pais', $request->id_pais);
        }

        if ($request->filled('id_provincia')) {
            $consulta->where('id_provincia', $request->id_provincia);
        }

        if ($request->filled('id_canton')) {
            $consulta->where('id_canton', $request->id_canton);
        }

        if ($request->filled('id_modalidad')) {
            $consulta->where('id_modalidad', $request->id_modalidad);
        }

        if ($request->filled('id_area_laboral')) {
            $consulta->where('id_area_laboral', $request->id_area_laboral);
        }

        if ($request->filled('buscar')) {
            $buscar = $request->buscar;
            $consulta->where(function ($q) use ($buscar) {
                $q->where('titulo', 'like', "%{$buscar}%")
                    ->orWhere('descripcion', 'like', "%{$buscar}%")
                    ->orWhere('categoria', 'like', "%{$buscar}%");
            });
        }

        $ofertas = $consulta
            ->orderByDesc('fecha_publicacion')
            ->paginate(9)
            ->withQueryString();

        $ofertas->getCollection()->transform(function ($oferta) {

            if (
                $oferta->empresa &&
                $oferta->empresa->usuario &&
                $oferta->empresa->usuario->fotoPerfil
            ) {

                $foto = $oferta->empresa->usuario->fotoPerfil;

                $url = is_array($foto)
                    ? ($foto['url'] ?? null)
                    : ($foto->ruta_imagen ? asset($foto->ruta_imagen) : null);

                $oferta->empresa->usuario->fotoPerfil = $url
                    ? ['url' => $url]
                    : null;
            } else {
                $oferta->empresa->usuario->fotoPerfil = null;
            }

            return $oferta;
        });


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

    /**
     * HU-24
     * Detalle de oferta
     */
    public function mostrar(Oferta $oferta)
    {
        $oferta->load([
            'empresa.usuario.fotoPerfil',
            'pais',
            'provincia',
            'canton',
            'modalidad',
            'areaLaboral',
            'carrera',
        ]);

        $usuario = Auth::user();

        $yaPostulado = $usuario
            ? Postulacion::where('id_usuario', $usuario->id_usuario)
            ->where('id_oferta', $oferta->id_oferta)
            ->exists()
            : false;

        if (
            $oferta->empresa &&
            $oferta->empresa->usuario &&
            $oferta->empresa->usuario->fotoPerfil
        ) {
            $foto = $oferta->empresa->usuario->fotoPerfil;

            $url = $foto->ruta_imagen
                ? asset('storage/' . $foto->ruta_imagen)
                : null;

            $oferta->empresa->usuario->foto_perfil = $url
                ? ['url' => $url]
                : null;

            unset($oferta->empresa->usuario->fotoPerfil);
        } else {
            $oferta->empresa->usuario->fotoPerfil = null;
        }


        return Inertia::render('Ofertas/OfertaDetallePagina', [
            'oferta'       => $oferta,
            'yaPostulado'  => $yaPostulado,
            'userPermisos' => getUserPermisos(),
        ]);
    }

    /**
     * HU-23
     * Formulario crear oferta (empresa/admin/permiso5)
     */
    public function crear()
    {
        $usuario = Auth::user();
        $empresa = $usuario->empresa;

        if (!$empresa && !($usuario->es_admin || in_array(5, getUserPermisos()))) {
            abort(403, 'No autorizado.');
        }

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

    /**
     * Guardar nueva oferta
     */
    public function guardar(Request $request)
    {
        $usuario = Auth::user();
        $empresa = $usuario->empresa;

        if (!$empresa && !($usuario->es_admin || in_array(5, getUserPermisos()))) {
            abort(403, 'No autorizado.');
        }

        $datos = $request->validate([
            'titulo'           => 'required|string|max:100',
            'descripcion'      => 'required|string',
            'requisitos'       => 'nullable|array',
            'requisitos.*'     => 'string|max:255',
            'tipo_oferta'      => 'required|string|max:50',
            'categoria'        => 'required|string|max:50',
            'id_area_laboral'  => 'required|integer',
            'id_carrera'       => 'required|integer',
            'id_pais'          => 'required|integer',
            'id_provincia'     => 'required|integer',
            'id_canton'        => 'required|integer',
            'id_modalidad'     => 'required|integer',
            'horario'          => 'required|string|max:255',
            'fecha_limite'     => 'required|date',
            'estado_id'        => 'required|integer',
        ]);

        if ($empresa) {
            $datos['id_empresa'] = $empresa->id_empresa;
        }

        $datos['fecha_publicacion'] = now();
        $datos['requisitos'] = json_encode($request->requisitos);

        Oferta::create($datos);

        return redirect()
            ->route('empresa.ofertas.index')
            ->with('success', 'Oferta creada correctamente.');
    }

    /**
     * Borrado lógico de oferta
     */
    public function eliminar(Oferta $oferta)
    {
        $usuario = Auth::user();
        $empresa = $usuario->empresa;

        if (!$empresa && !($usuario->es_admin || in_array(5, getUserPermisos()))) {
            abort(403, 'No autorizado.');
        }

        $oferta->update([
            'estado_id' => 3, // DESACTIVADA
        ]);

        return back()->with('success', 'Oferta desactivada correctamente.');
    }


    /**
     * Listar ofertas de la empresa (empresa/admin/permiso5)
     */
    public function indexEmpresa(Request $request)
    {
        $usuario = $request->user();
        $empresa = $usuario->empresa; // null si es admin/superadmin

        // 🔒 Seguridad básica
        if (!$usuario) {
            abort(403, 'No autorizado.');
        }

        /**
         * 📝 Consulta base
         * ⚠️ OJO: cargamos TODA la cadena necesaria para el frontend
         */
        $consulta = Oferta::with([
            'empresa.usuario.fotoPerfil',
            'modalidad',
        ])
            ->withCount('postulaciones') // 👈 AQUÍ VA
            ->where('estado_id', '!=', 3);

        /**
         * 🔐 Visibilidad
         * - Empresa → solo sus ofertas
         * - Admin/Superadmin → todas
         */
        if ($empresa) {
            $consulta->where('id_empresa', $empresa->id_empresa);
        }

        // 🔍 Búsqueda
        if ($request->filled('buscar')) {
            $consulta->where('titulo', 'like', '%' . $request->buscar . '%');
        }

        // 🎯 Modalidad
        if ($request->filled('id_modalidad')) {
            $consulta->where('id_modalidad', $request->id_modalidad);
        }

        // 📅 Fechas
        if ($request->filled('fecha_inicio')) {
            $consulta->whereDate('fecha_publicacion', '>=', $request->fecha_inicio);
        }

        if ($request->filled('fecha_fin')) {
            $consulta->whereDate('fecha_publicacion', '<=', $request->fecha_fin);
        }

        // 📄 Paginación
        $perPage = (int) $request->get('per_page', 10);

        $ofertas = $consulta
            ->orderByDesc('fecha_publicacion')
            ->paginate($perPage)
            ->withQueryString();

        /**
         * 🖼️ Normalizar foto de perfil (igual que listar / mostrar)
         */
        $ofertas->getCollection()->transform(function ($oferta) {

            if (
                $oferta->empresa &&
                $oferta->empresa->usuario &&
                $oferta->empresa->usuario->fotoPerfil
            ) {
                $foto = $oferta->empresa->usuario->fotoPerfil;

                // 🧠 Si ya viene como array (ya transformado)
                if (is_array($foto)) {
                    $url = $foto['url'] ?? null;
                }
                // 🧠 Si viene como modelo Eloquent
                else {
                    $url = $foto->ruta_imagen
                        ? asset('storage/' . $foto->ruta_imagen)
                        : null;
                }

                $oferta->empresa->usuario->fotoPerfil = $url
                    ? ['url' => $url]
                    : null;
            } else {
                if ($oferta->empresa && $oferta->empresa->usuario) {
                    $oferta->empresa->usuario->fotoPerfil = null;
                }
            }

            return $oferta;
        });


        return Inertia::render('Ofertas/EmpresaOfertasIndex', [
            'ofertas'      => $ofertas,
            'modalidades'  => Modalidad::orderBy('nombre')->get(),
            'filtros'      => $request->only([
                'buscar',
                'id_modalidad',
                'fecha_inicio',
                'fecha_fin',
                'per_page',
            ]),
            'userPermisos' => getUserPermisos(),
        ]);
    }

    public function gestionar(Request $request, Oferta $oferta)
{
    $usuario = Auth::user();
    $empresa = $usuario->empresa;

    // 🔒 Seguridad
    if (
        (!$empresa && !($usuario->es_admin || in_array(5, getUserPermisos()))) ||
        ($empresa && $oferta->id_empresa !== $empresa->id_empresa && !($usuario->es_admin || in_array(5, getUserPermisos())))
    ) {
        abort(403, 'No autorizado.');
    }

    // 🔎 Cargar relaciones de la oferta
    $oferta->load([
        'empresa.usuario.fotoPerfil',
        'modalidad',
        'areaLaboral',
        'carrera',
        'pais',
        'provincia',
        'canton',
    ]);

    // 🔎 Filtro por estado
    $estado = $request->estado;

    $consulta = Postulacion::with([
        'usuario.fotoPerfil',
        'usuario.curriculum'
    ])
        ->where('id_oferta', $oferta->id_oferta);

    if ($estado) {
        $consulta->where('estado_id', $estado);
    }

    // 📄 Paginación SIN through
    $postulaciones = $consulta
        ->orderByDesc('fecha_postulacion')
        ->paginate(10)
        ->withQueryString();

    // 🔄 Transformar colección correctamente
    $postulaciones->getCollection()->transform(function ($postulacion) {

        return [
            'id_postulacion' => $postulacion->id_postulacion,
            'mensaje' => $postulacion->mensaje,
            'fecha_postulacion' => $postulacion->fecha_postulacion,
            'estado_id' => $postulacion->estado_id,

            'usuario' => $postulacion->usuario ? [
                'id_usuario' => $postulacion->usuario->id_usuario,
                'nombre' => $postulacion->usuario->nombre_completo,

                'fotoPerfil' => $postulacion->usuario->fotoPerfil
                    ? [
                        'url' => asset(ltrim($postulacion->usuario->fotoPerfil->ruta_imagen, '/'))
                    ]
                    : null,

                'curriculum' => $postulacion->usuario->curriculum
                    ? [
                        'ruta_archivo_pdf' => asset(ltrim($postulacion->usuario->curriculum->ruta_archivo_pdf, '/'))
                    ]
                    : null,
            ] : null,
        ];
    });

    // 📊 Estadísticas optimizadas
    $estadisticas = Postulacion::selectRaw("
        COUNT(*) as total,
        SUM(estado_id = 1) as espera,
        SUM(estado_id = 2) as aceptado,
        SUM(estado_id = 3) as negado,
        SUM(estado_id = 4) as revision
    ")
        ->where('id_oferta', $oferta->id_oferta)
        ->first();

    return Inertia::render('Ofertas/GestionOferta', [
        'oferta'        => $oferta,
        'postulaciones' => $postulaciones,
        'estadisticas'  => $estadisticas,
        'filtroEstado'  => $estado,
        'userPermisos'  => getUserPermisos(),
    ]);
}


    /**
     * Formulario editar oferta
     */
    public function editar(Oferta $oferta)
    {
        $usuario = Auth::user();

        // 🔹 Empresa asociada (empresa dueña o admin)
        $empresa = $usuario->empresa ?? $oferta->empresa;

        // 🔒 Seguridad
        if (
            !$empresa && !($usuario->es_admin || in_array(5, getUserPermisos())) ||
            ($empresa && $oferta->id_empresa !== $empresa->id_empresa && !($usuario->es_admin || in_array(5, getUserPermisos())))
        ) {
            abort(403, 'No autorizado.');
        }

        return Inertia::render('Ofertas/EditarOferta', [
            // 🧾 Oferta SIN empresa anidada
            'oferta' => $oferta,

            // 🏢 Empresa IGUAL que CrearOferta
            'empresa' => optional($empresa)->load('usuario.fotoPerfil'),

            // 📦 Catálogos
            'areasLaborales' => AreaLaboral::orderBy('nombre')->get([
                'id_area_laboral as id',
                'nombre',
            ]),
            'modalidades' => Modalidad::orderBy('nombre')->get([
                'id_modalidad as id',
                'nombre',
            ]),
            'paises' => Pais::orderBy('nombre')->get([
                'id_pais as id',
                'nombre',
            ]),
            'provincias' => Provincia::orderBy('nombre')->get([
                'id_provincia as id',
                'nombre',
                'id_pais',
            ]),
            'cantones' => Canton::orderBy('nombre')->get([
                'id_canton as id',
                'nombre',
                'id_provincia',
            ]),
            'carreras' => Carrera::orderBy('nombre')->get([
                'id_carrera as id',
                'nombre',
            ]),

            // 🔐 Permisos
            'userPermisos' => getUserPermisos(),
        ]);
    }


    /**
     * Actualizar oferta
     */
    public function actualizar(Request $request, Oferta $oferta)
    {
        $usuario = Auth::user();
        $empresa = $usuario->empresa;

        if (
            !$empresa && !($usuario->es_admin || in_array(5, getUserPermisos())) ||
            ($empresa && $oferta->id_empresa !== $empresa->id_empresa && !($usuario->es_admin || in_array(5, getUserPermisos())))
        ) {
            abort(403, 'No autorizado.');
        }

        $datos = $request->validate([
            'titulo'           => 'required|string|max:100',
            'descripcion'      => 'required|string',
            'requisitos'       => 'nullable|array',
            'requisitos.*'     => 'string|max:255',
            'tipo_oferta'      => 'required|string|max:50',
            'categoria'        => 'required|string|max:50',
            'id_area_laboral'  => 'required|integer',
            'id_carrera'       => 'required|integer',
            'id_pais'          => 'required|integer',
            'id_provincia'     => 'required|integer',
            'id_canton'        => 'required|integer',
            'id_modalidad'     => 'required|integer',
            'horario'          => 'required|string|max:255',
            'fecha_limite'     => 'required|date',
            'estado_id'        => 'required|integer',
        ]);

        $datos['requisitos'] = json_encode($request->requisitos);

        $oferta->update($datos);

        return redirect()
            ->route('empresa.ofertas.index')
            ->with('success', 'Oferta actualizada correctamente.');
    }

    /**
     * Cambiar estado de la oferta (Publicada ↔ Borrador)
     */
    public function cambiarEstado(Request $request, Oferta $oferta)
    {
        $usuario = Auth::user();
        $empresa = $usuario->empresa;

        // Seguridad
        if (
            !$empresa && !($usuario->es_admin || in_array(5, getUserPermisos())) ||
            ($empresa && $oferta->id_empresa !== $empresa->id_empresa && !($usuario->es_admin || in_array(5, getUserPermisos())))
        ) {
            abort(403, 'No autorizado.');
        }

        $request->validate([
            'estado_id' => 'required|in:1,2',
        ]);

        $oferta->update([
            'estado_id' => $request->estado_id,
        ]);

        return back()->with('success', 'Estado de la oferta actualizado.');
    }
}
