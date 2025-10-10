<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Pais;
use App\Models\Provincia;
use App\Models\Canton;
use App\Models\Universidad;
use App\Models\Carrera;
use App\Models\CatalogoEstado;
use App\Models\Modalidad;
use App\Models\IdiomaCatalogo;
use App\Models\AreaLaboral;
use Illuminate\Support\Facades\DB;

class CatalogoController extends Controller
{
    /**
     * Muestra la vista principal del catálogo con todos los registros.
     */
    public function index()
    {
        return Inertia::render('Catalogo/Index', [
            'paises' => Pais::orderBy('id_pais', 'asc')->get(),
            'provincias' => Provincia::orderBy('id_provincia', 'asc')->get(),
            'cantones' => Canton::orderBy('id_canton', 'asc')->get(),
            'universidades' => Universidad::orderBy('id_universidad', 'asc')->get(),
            'carreras' => Carrera::orderBy('id_carrera', 'asc')->get(),
            'estados' => CatalogoEstado::orderBy('id_estado', 'asc')->get(),
            'modalidades' => Modalidad::orderBy('id_modalidad', 'asc')->get(),
            'idiomas' => IdiomaCatalogo::orderBy('id_idioma_catalogo', 'asc')->get(),
            'areas_laborales' => AreaLaboral::orderBy('id_area_laboral', 'asc')->get(),
            'userPermisos' => getUserPermisos(), 
        ]);
    }

    // =======================================================
    // 🔹 PAISES
    // =======================================================
    public function guardarPais(Request $request)
    {
        $request->validate(['nombre' => 'required|string|max:100']);

        Pais::updateOrCreate(
            ['id_pais' => $request->id ?? null],
            ['nombre' => $request->nombre]
        );

        return redirect()->back()->with('success', 'País guardado correctamente.');
    }

    public function eliminarPais($id)
    {
        Pais::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'País eliminado correctamente.');
    }

    // =======================================================
    // 🔹 PROVINCIAS
    // =======================================================
    public function guardarProvincia(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'id_pais' => 'required|integer'
        ]);

        Provincia::updateOrCreate(
            ['id_provincia' => $request->id ?? null],
            ['nombre' => $request->nombre, 'id_pais' => $request->id_pais]
        );

        return redirect()->back()->with('success', 'Provincia guardada correctamente.');
    }

    public function eliminarProvincia($id)
    {
        Provincia::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Provincia eliminada correctamente.');
    }

    // =======================================================
    // 🔹 CANTONES
    // =======================================================
    public function guardarCanton(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'id_provincia' => 'required|integer'
        ]);

        Canton::updateOrCreate(
            ['id_canton' => $request->id ?? null],
            ['nombre' => $request->nombre, 'id_provincia' => $request->id_provincia]
        );

        return redirect()->back()->with('success', 'Cantón guardado correctamente.');
    }

    public function eliminarCanton($id)
    {
        Canton::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Cantón eliminado correctamente.');
    }

    // =======================================================
    // 🔹 UNIVERSIDADES
    // =======================================================
    public function guardarUniversidad(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'sigla' => 'required|string|max:10'
        ]);

        Universidad::updateOrCreate(
            ['id_universidad' => $request->id ?? null],
            ['nombre' => $request->nombre, 'sigla' => $request->sigla]
        );

        return redirect()->back()->with('success', 'Universidad guardada correctamente.');
    }

    public function eliminarUniversidad($id)
    {
        Universidad::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Universidad eliminada correctamente.');
    }

    // =======================================================
    // 🔹 CARRERAS
    // =======================================================
    public function guardarCarrera(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'id_universidad' => 'nullable|integer',
        ]);

        Carrera::updateOrCreate(
            ['id_carrera' => $request->id ?? null],
            [
                'nombre' => $request->nombre,
                'id_universidad' => $request->id_universidad,
            ]
        );

        return redirect()->back()->with('success', 'Carrera guardada correctamente.');
    }

    public function eliminarCarrera($id)
    {
        Carrera::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Carrera eliminada correctamente.');
    }

    // =======================================================
    // 🔹 ESTADOS
    // =======================================================
    public function guardarEstado(Request $request)
    {
        $request->validate(['nombre_estado' => 'required|string|max:50']);

        CatalogoEstado::updateOrCreate(
            ['id_estado' => $request->id ?? null],
            ['nombre_estado' => $request->nombre_estado]
        );

        return redirect()->back()->with('success', 'Estado guardado correctamente.');
    }

    public function eliminarEstado($id)
    {
        CatalogoEstado::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Estado eliminado correctamente.');
    }

    // =======================================================
    // 🔹 MODALIDADES
    // =======================================================
    public function guardarModalidad(Request $request)
    {
        $request->validate([
            'nombre_modalidad' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255'
        ]);

        Modalidad::updateOrCreate(
            ['id_modalidad' => $request->id ?? null],
            [
                'nombre_modalidad' => $request->nombre_modalidad,
                'descripcion' => $request->descripcion
            ]
        );

        return redirect()->back()->with('success', 'Modalidad guardada correctamente.');
    }

    public function eliminarModalidad($id)
    {
        Modalidad::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Modalidad eliminada correctamente.');
    }

    // =======================================================
    // 🔹 IDIOMAS
    // =======================================================
    public function guardarIdioma(Request $request)
    {
        $request->validate(['nombre' => 'required|string|max:50']);

        IdiomaCatalogo::updateOrCreate(
            ['id_idioma_catalogo' => $request->id ?? null],
            ['nombre' => $request->nombre]
        );

        return redirect()->back()->with('success', 'Idioma guardado correctamente.');
    }

    public function eliminarIdioma($id)
    {
        IdiomaCatalogo::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Idioma eliminado correctamente.');
    }

    // =======================================================
    // 🔹 ÁREAS LABORALES
    // =======================================================
    public function guardarAreaLaboral(Request $request)
    {
        $request->validate(['nombre' => 'required|string|max:100']);

        AreaLaboral::updateOrCreate(
            ['id_area_laboral' => $request->id ?? null],
            ['nombre' => $request->nombre]
        );

        return redirect()->back()->with('success', 'Área laboral guardada correctamente.');
    }

    public function eliminarAreaLaboral($id)
    {
        AreaLaboral::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Área laboral eliminada correctamente.');
    }
}
