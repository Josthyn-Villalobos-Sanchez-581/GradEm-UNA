<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\CatalogoServices\CatalogoService;

class CatalogoController extends Controller
{
    protected CatalogoService $catalogoService;

    public function __construct(CatalogoService $catalogoService)
    {
        $this->catalogoService = $catalogoService;
    }

    /**
     * Muestra la vista principal del catálogo con todos los registros.
     */
    public function index()
    {
        // Toda la carga de catálogos se delega al servicio
        $datosCatalogos = $this->catalogoService->obtenerDatosCatalogos();

        // Mantenemos el helper existente para permisos
        $datosCatalogos['userPermisos'] = getUserPermisos();

        return Inertia::render('Catalogo/Index', $datosCatalogos);
    }

    // ========================= PAISES =========================
    public function guardarPais(Request $request)
    {
        $request->validate(['nombre' => 'required|string|max:100']);

        $this->catalogoService->guardarPais(
            id: $request->id ?? null,
            nombre: $request->nombre
        );

        return redirect()->back()->with('success', 'País guardado correctamente.');
    }

    public function eliminarPais($id)
    {
        if (! $this->catalogoService->puedeEliminarPais((int) $id)) {
            return redirect()->back()->with('error', 'No se puede eliminar este país, tiene provincias asociadas.');
        }

        $this->catalogoService->eliminarPais((int) $id);

        return redirect()->back()->with('success', 'País eliminado correctamente.');
    }

    // ========================= PROVINCIAS =========================
    public function guardarProvincia(Request $request)
    {
        $request->validate([
            'nombre'   => 'required|string|max:100',
            'id_pais'  => 'required|integer|exists:paises,id_pais'
        ]);

        $this->catalogoService->guardarProvincia(
            id: $request->id ?? null,
            nombre: $request->nombre,
            idPais: (int) $request->id_pais
        );

        return redirect()->back()->with('success', 'Provincia guardada correctamente.');
    }

    public function eliminarProvincia($id)
    {
        if (! $this->catalogoService->puedeEliminarProvincia((int) $id)) {
            return redirect()->back()->with('error', 'No se puede eliminar esta provincia, tiene cantones asociados.');
        }

        $this->catalogoService->eliminarProvincia((int) $id);

        return redirect()->back()->with('success', 'Provincia eliminada correctamente.');
    }

    // ========================= CANTONES =========================
    public function guardarCanton(Request $request)
    {
        $request->validate([
            'nombre'       => 'required|string|max:100',
            'id_provincia' => 'required|integer|exists:provincias,id_provincia'
        ]);

        $this->catalogoService->guardarCanton(
            id: $request->id ?? null,
            nombre: $request->nombre,
            idProvincia: (int) $request->id_provincia
        );

        return redirect()->back()->with('success', 'Cantón guardado correctamente.');
    }

    public function eliminarCanton($id)
    {
        $this->catalogoService->eliminarCanton((int) $id);

        return redirect()->back()->with('success', 'Cantón eliminado correctamente.');
    }

    // ========================= UNIVERSIDADES =========================
    public function guardarUniversidad(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'sigla'  => 'required|string|max:10'
        ]);

        $this->catalogoService->guardarUniversidad(
            id: $request->id ?? null,
            nombre: $request->nombre,
            sigla: $request->sigla
        );

        return redirect()->back()->with('success', 'Universidad guardada correctamente.');
    }

    public function eliminarUniversidad($id)
    {
        $this->catalogoService->eliminarUniversidad((int) $id);

        return redirect()->back()->with('success', 'Universidad eliminada correctamente.');
    }

    // ========================= CARRERAS =========================
    public function guardarCarrera(Request $request)
    {
        $request->validate([
            'nombre'        => 'required|string|max:100',
            'id_universidad'=> 'required|integer|exists:universidades,id_universidad'
        ]);

        $this->catalogoService->guardarCarrera(
            id: $request->id ?? null,
            nombre: $request->nombre,
            idUniversidad: (int) $request->id_universidad
        );

        return redirect()->back()->with('success', 'Carrera guardada correctamente.');
    }

    public function eliminarCarrera($id)
    {
        $this->catalogoService->eliminarCarrera((int) $id);

        return redirect()->back()->with('success', 'Carrera eliminada correctamente.');
    }

    // ========================= ESTADOS =========================
    public function guardarEstado(Request $request)
    {
        $request->validate(['nombre_estado' => 'required|string|max:50']);

        $this->catalogoService->guardarEstado(
            id: $request->id ?? null,
            nombreEstado: $request->nombre_estado
        );

        return redirect()->back()->with('success', 'Estado guardado correctamente.');
    }

    public function eliminarEstado($id)
    {
        $this->catalogoService->eliminarEstado((int) $id);

        return redirect()->back()->with('success', 'Estado eliminado correctamente.');
    }

    // ========================= MODALIDADES =========================
    public function guardarModalidad(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
        ]);

        $this->catalogoService->guardarModalidad(
            id: $request->id ?? null,
            nombre: $request->nombre
        );

        return redirect()->back()->with('success', 'Modalidad guardada correctamente.');
    }

    public function eliminarModalidad($id)
    {
        $this->catalogoService->eliminarModalidad((int) $id);

        return redirect()->back()->with('success', 'Modalidad eliminada correctamente.');
    }

    // ========================= IDIOMAS =========================
    public function guardarIdioma(Request $request)
    {
        $request->validate(['nombre' => 'required|string|max:50']);

        $this->catalogoService->guardarIdioma(
            id: $request->id ?? null,
            nombre: $request->nombre
        );

        return redirect()->back()->with('success', 'Idioma guardado correctamente.');
    }

    public function eliminarIdioma($id)
    {
        $this->catalogoService->eliminarIdioma((int) $id);

        return redirect()->back()->with('success', 'Idioma eliminado correctamente.');
    }

    // ========================= ÁREAS LABORALES =========================
    public function guardarAreaLaboral(Request $request)
    {
        $request->validate(['nombre' => 'required|string|max:100']);

        $this->catalogoService->guardarAreaLaboral(
            id: $request->id ?? null,
            nombre: $request->nombre
        );

        return redirect()->back()->with('success', 'Área laboral guardada correctamente.');
    }

    public function eliminarAreaLaboral($id)
    {
        $this->catalogoService->eliminarAreaLaboral((int) $id);

        return redirect()->back()->with('success', 'Área laboral eliminada correctamente.');
    }
}
