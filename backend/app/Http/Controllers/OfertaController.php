<?php

namespace App\Http\Controllers;

use App\Models\Oferta;
use App\Models\Pais;
use App\Models\Provincia;
use App\Models\Canton;
use App\Models\Modalidad;
use App\Models\Postulacion;
use App\Models\AreaLaboral;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OfertaController extends Controller
{
    /**
     * HU-25 + HU-27
     * Listar ofertas con filtros y paginación.
     */
    public function listar(Request $request)
    {
        // ============================
        // CONSULTA BASE
        // ============================
        $consulta = Oferta::with([
            'empresa.usuario.fotoPerfil',
            'pais',
            'provincia',
            'canton',
            'modalidad',
            'areaLaboral',
        ])->where('estado_id', 1);

        // ============================
        // FILTROS HU-27
        // ============================

        // Tipo de oferta (empleo / practica)
        if ($request->filled('tipo_oferta')) {
            $consulta->where('tipo_oferta', $request->input('tipo_oferta'));
        }

        // País
        if ($request->filled('id_pais')) {
            $consulta->where('id_pais', $request->input('id_pais'));
        }

        // Provincia
        if ($request->filled('id_provincia')) {
            $consulta->where('id_provincia', $request->input('id_provincia'));
        }

        // Cantón
        if ($request->filled('id_canton')) {
            $consulta->where('id_canton', $request->input('id_canton'));
        }

        // Modalidad
        if ($request->filled('id_modalidad')) {
            $consulta->where('id_modalidad', $request->input('id_modalidad'));
        }

        // 🔹 NUEVO: Área laboral
        if ($request->filled('id_area_laboral')) {
            $consulta->where('id_area_laboral', $request->input('id_area_laboral'));
        }

        // Búsqueda general: título, descripción, categoría
        if ($request->filled('buscar')) {
            $buscar = $request->input('buscar');
            $consulta->where(function ($q) use ($buscar) {
                $q->where('titulo', 'like', "%{$buscar}%")
                    ->orWhere('descripcion', 'like', "%{$buscar}%")
                    ->orWhere('categoria', 'like', "%{$buscar}%");
                // Si quieres buscar también por área laboral, se hace con join o whereHas
            });
        }

        // ============================
        // EJECUTAR CONSULTA
        // ============================
        $ofertas = $consulta
            ->orderBy('fecha_publicacion', 'desc')
            ->paginate(9)
            ->withQueryString();

        // Catálogos para filtros
        $paises = Pais::orderBy('nombre')->get(['id_pais as id', 'nombre']);
        $provincias = Provincia::orderBy('nombre')->get(['id_provincia as id', 'nombre', 'id_pais']);
        $cantones = Canton::orderBy('nombre')->get(['id_canton as id', 'nombre', 'id_provincia']);
        $modalidades = Modalidad::orderBy('nombre')->get(['id_modalidad as id', 'nombre']);

        // 🔹 NUEVO: áreas laborales
        $areasLaborales = AreaLaboral::orderBy('nombre')
            ->get(['id_area_laboral as id', 'nombre']);

        return Inertia::render('Ofertas/OfertasIndex', [
            'ofertas'        => $ofertas,
            'filtros'        => $request->only([
                'tipo_oferta',
                'id_pais',
                'id_provincia',
                'id_canton',
                'id_modalidad',
                'id_area_laboral', // 👈 nuevo filtro
                'buscar',
            ]),
            'paises'         => $paises,
            'provincias'     => $provincias,
            'cantones'       => $cantones,
            'modalidades'    => $modalidades,
            'areasLaborales' => $areasLaborales, // 👈 enviado a React
            'userPermisos'   => getUserPermisos(),
        ]);
    }


    /**
     * HU-24
     * Mostrar detalle de una oferta específica.
     */
    public function mostrar(Oferta $oferta)
    {
        $usuario = Auth::user();

        $oferta->load([
            'empresa.usuario.fotoPerfil',
            'pais',
            'provincia',
            'canton',
            'modalidad',
            'areaLaboral',
        ]);

        $yaPostulado = false;
        if ($usuario) {
            $yaPostulado = Postulacion::where('id_usuario', $usuario->id_usuario)
                ->where('id_oferta', $oferta->id_oferta)
                ->exists();
        }

        return Inertia::render('Ofertas/OfertaDetalle', [
            'oferta'       => $oferta,
            'yaPostulado'  => $yaPostulado,
            'userPermisos' => getUserPermisos(),
        ]);
    }

    // =====================================================
    // 🔹 MÉTODOS PARA PUBLICACIÓN (Permiso 5) – OPCIONALES
    //    Los dejo preparados por si luego activas las rutas
    // =====================================================

    /**
     * (Opcional) Listar ofertas creadas por la empresa autenticada.
     */
    public function indexEmpresa()
    {
        $usuario = Auth::user();

        // Aquí depende de cómo relaciones Usuario ↔ Empresa en tu modelo.
        // Ejemplo típico: $usuario->empresa->id_empresa
        // Ajusta esta línea según tu implementación real:
        $idEmpresa = optional($usuario->empresa)->id_empresa ?? null;

        $ofertas = Oferta::with(['pais', 'provincia', 'canton', 'modalidad'])
            ->when($idEmpresa, function ($q) use ($idEmpresa) {
                $q->where('id_empresa', $idEmpresa);
            })
            ->orderBy('fecha_publicacion', 'desc')
            ->paginate(10);

        return Inertia::render('Ofertas/EmpresaOfertasIndex', [
            'ofertas'      => $ofertas,
            'userPermisos' => getUserPermisos(),
        ]);
    }

    /**
     * (Opcional) Formulario de creación de oferta.
     */
    public function crear()
    {
        $paises = Pais::orderBy('nombre')->get(['id_pais as id', 'nombre']);
        $provincias = Provincia::orderBy('nombre')->get(['id_provincia as id', 'nombre', 'id_pais']);
        $cantones = Canton::orderBy('nombre')->get(['id_canton as id', 'nombre', 'id_provincia']);
        $modalidades = Modalidad::orderBy('nombre')->get(['id_modalidad as id', 'nombre']);

        return Inertia::render('Ofertas/EmpresaOfertaFormulario', [
            'modo'         => 'crear',
            'oferta'       => null,
            'paises'       => $paises,
            'provincias'   => $provincias,
            'cantones'     => $cantones,
            'modalidades'  => $modalidades,
            'userPermisos' => getUserPermisos(),
        ]);
    }

    /**
     * (Opcional) Guardar una nueva oferta.
     */
    public function guardar(Request $request)
    {
        $usuario = Auth::user();

        // Ajusta según cómo obtienes la empresa del usuario
        $idEmpresa = optional($usuario->empresa)->id_empresa ?? null;

        $datos = $request->validate([
            'titulo'           => 'required|string|max:100',
            'descripcion'      => 'required|string',
            'requisitos'       => 'nullable|string',
            'tipo_oferta'      => 'required|string|max:50',
            'categoria'        => 'required|string|max:50',
            'campo_aplicacion' => 'required|string|max:100',
            'id_pais'          => 'required|integer|exists:paises,id_pais',
            'id_provincia'     => 'required|integer|exists:provincias,id_provincia',
            'id_canton'        => 'required|integer|exists:cantones,id_canton',
            'id_modalidad'     => 'required|integer|exists:modalidades,id_modalidad',
            'horario'          => 'required|string|max:20',
            'fecha_limite'     => 'required|date',
        ]);

        $datos['id_empresa'] = $idEmpresa;
        $datos['fecha_publicacion'] = now();
        $datos['estado_id'] = 1; // activa por defecto

        Oferta::create($datos);

        return redirect()->route('empresa.ofertas.index')
            ->with('success', 'Oferta creada correctamente.');
    }

    /**
     * (Opcional) Formulario de edición de oferta.
     */
    public function editar(Oferta $oferta)
    {
        $paises = Pais::orderBy('nombre')->get(['id_pais as id', 'nombre']);
        $provincias = Provincia::orderBy('nombre')->get(['id_provincia as id', 'nombre', 'id_pais']);
        $cantones = Canton::orderBy('nombre')->get(['id_canton as id', 'nombre', 'id_provincia']);
        $modalidades = Modalidad::orderBy('nombre')->get(['id_modalidad as id', 'nombre']);

        return Inertia::render('Ofertas/EmpresaOfertaFormulario', [
            'modo'         => 'editar',
            'oferta'       => $oferta->load(['pais', 'provincia', 'canton', 'modalidad']),
            'paises'       => $paises,
            'provincias'   => $provincias,
            'cantones'     => $cantones,
            'modalidades'  => $modalidades,
            'userPermisos' => getUserPermisos(),
        ]);
    }

    /**
     * (Opcional) Actualizar una oferta existente.
     */
    public function actualizar(Request $request, Oferta $oferta)
    {
        $datos = $request->validate([
            'titulo'           => 'required|string|max:100',
            'descripcion'      => 'required|string',
            'requisitos'       => 'nullable|string',
            'tipo_oferta'      => 'required|string|max:50',
            'categoria'        => 'required|string|max:50',
            'campo_aplicacion' => 'required|string|max:100',
            'id_pais'          => 'required|integer|exists:paises,id_pais',
            'id_provincia'     => 'required|integer|exists:provincias,id_provincia',
            'id_canton'        => 'required|integer|exists:cantones,id_canton',
            'id_modalidad'     => 'required|integer|exists:modalidades,id_modalidad',
            'horario'          => 'required|string|max:20',
            'fecha_limite'     => 'required|date',
            'estado_id'        => 'required|integer',
        ]);

        $oferta->update($datos);

        return redirect()->route('empresa.ofertas.index')
            ->with('success', 'Oferta actualizada correctamente.');
    }

    /**
     * (Opcional) Eliminar / desactivar oferta.
     */
    public function eliminar(Oferta $oferta)
    {
        // Si quieres borrado lógico, solo cambia estado_id
        // $oferta->estado_id = 0; $oferta->save();

        $oferta->delete();

        return back()->with('success', 'Oferta eliminada correctamente.');
    }
}
