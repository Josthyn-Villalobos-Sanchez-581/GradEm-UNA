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

class CatalogoController extends Controller
{
    /**
     * Muestra la vista principal del catálogo con todos los registros.
     */
    public function index()
    {
        return Inertia::render('Catalogo/Index', [
            'paises' => Pais::orderBy('id_pais')->get()->map(fn($p) => ['id' => $p->id_pais, 'nombre' => $p->nombre]),
            'provincias' => Provincia::orderBy('id_provincia')->get()->map(fn($p) => ['id' => $p->id_provincia, 'nombre' => $p->nombre, 'id_pais' => $p->id_pais]),
            'cantones' => Canton::orderBy('id_canton')->get()->map(fn($c) => ['id' => $c->id_canton, 'nombre' => $c->nombre, 'id_provincia' => $c->id_provincia]),
            'universidades' => Universidad::orderBy('id_universidad')->get()->map(fn($u) => ['id' => $u->id_universidad, 'nombre' => $u->nombre, 'sigla' => $u->sigla]),
            'carreras' => Carrera::orderBy('id_carrera')->get()->map(fn($c) => ['id' => $c->id_carrera, 'nombre' => $c->nombre, 'id_universidad' => $c->id_universidad]),
            'estados' => CatalogoEstado::orderBy('id_estado')->get()->map(fn($e) => ['id' => $e->id_estado, 'nombre_estado' => $e->nombre_estado]),
            'modalidades' => Modalidad::orderBy('id_modalidad')->get()->map(fn($m) => ['id' => $m->id_modalidad, 'nombre' => $m->nombre]),
            'idiomas' => IdiomaCatalogo::orderBy('id_idioma_catalogo')->get()->map(fn($i) => ['id' => $i->id_idioma_catalogo, 'nombre' => $i->nombre]),
            'areas_laborales' => AreaLaboral::orderBy('id_area_laboral')->get()->map(fn($a) => ['id' => $a->id_area_laboral, 'nombre' => $a->nombre]),
            'userPermisos' => getUserPermisos(),
        ]);
    }

    // ========================= PAISES =========================
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
        $tieneProvincias = Provincia::where('id_pais', $id)->exists();
        if ($tieneProvincias) {
            return redirect()->back()->with('error', 'No se puede eliminar este país, tiene provincias asociadas.');
        }

        Pais::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'País eliminado correctamente.');
    }

    // ========================= PROVINCIAS =========================
    public function guardarProvincia(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'id_pais' => 'required|integer|exists:paises,id_pais'
        ]);

        Provincia::updateOrCreate(
            ['id_provincia' => $request->id ?? null],
            ['nombre' => $request->nombre, 'id_pais' => $request->id_pais]
        );

        return redirect()->back()->with('success', 'Provincia guardada correctamente.');
    }

    public function eliminarProvincia($id)
    {
        $tieneCantones = Canton::where('id_provincia', $id)->exists();
        if ($tieneCantones) {
            return redirect()->back()->with('error', 'No se puede eliminar esta provincia, tiene cantones asociados.');
        }

        Provincia::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Provincia eliminada correctamente.');
    }

    // ========================= CANTONES =========================
    public function guardarCanton(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'id_provincia' => 'required|integer|exists:provincias,id_provincia'
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

    // ========================= UNIVERSIDADES =========================
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

    // ========================= CARRERAS =========================
    public function guardarCarrera(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'id_universidad' => 'required|integer|exists:universidades,id_universidad'
        ]);

        Carrera::updateOrCreate(
            ['id_carrera' => $request->id ?? null],
            ['nombre' => $request->nombre, 'id_universidad' => $request->id_universidad]
        );

        return redirect()->back()->with('success', 'Carrera guardada correctamente.');
    }

    public function eliminarCarrera($id)
    {
        Carrera::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Carrera eliminada correctamente.');
    }

    // ========================= ESTADOS =========================
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

    // ========================= MODALIDADES =========================
    public function guardarModalidad(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
        ]);

        Modalidad::updateOrCreate(
            ['id_modalidad' => $request->id ?? null],
            ['nombre' => $request->nombre]
        );

        return redirect()->back()->with('success', 'Modalidad guardada correctamente.');
    }

    public function eliminarModalidad($id)
    {
        Modalidad::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Modalidad eliminada correctamente.');
    }

    // ========================= IDIOMAS =========================
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

    // ========================= ÁREAS LABORALES =========================
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
