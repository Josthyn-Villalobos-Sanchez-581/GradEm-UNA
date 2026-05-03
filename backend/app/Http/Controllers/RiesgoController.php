<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Riesgo;

class RiesgoController extends Controller
{
    /**
     * Listar riesgos (con filtros)
     */
    public function index(Request $request)
    {
        $query = Riesgo::query();

        // 🔍 Filtros
        if ($request->filled('tipo_riesgo')) {
            $query->where('tipo_riesgo', 'like', '%' . $request->tipo_riesgo . '%');
        }

        if ($request->filled('responsable')) {
            $query->where('responsable', $request->responsable);
        }

        if ($request->filled('nivel')) {
            $query->whereRaw('(probabilidad * impacto) ' . $this->obtenerFiltroNivel($request->nivel));
        }

        // 🧠 ORDEN DINÁMICO
        $ordenPor = $request->get('orden_por', 'fecha');
        $direccion = $request->get('direccion', 'desc');

        switch ($ordenPor) {
            case 'nivel':
                $query->orderByRaw('(probabilidad * impacto) ' . $direccion);
                break;

            case 'tipo':
                $query->orderBy('tipo_riesgo', $direccion);
                break;

            case 'fecha':
            default:
                $query->orderBy('fecha_creacion', $direccion);
                break;
        }

        $riesgos = $query
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Riesgos/Index', [
            'riesgos' => $riesgos,
            'filtros' => $request->only([
                'tipo_riesgo',
                'responsable',
                'nivel',
                'orden_por',
                'direccion'
            ])
        ]);
    }

    /**
     * Vista crear
     */
    public function create()
    {
        return Inertia::render('Riesgos/Crear');
    }

    /**
     * Guardar riesgo
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'tipo_riesgo' => 'required|string|max:100',
            'descripcion' => 'required|string',
            'probabilidad' => 'required|integer|min:1|max:4',
            'impacto' => 'required|integer|min:1|max:4',
            'responsable' => 'required|string|max:100',
            'estrategia' => 'nullable|string|max:100',
            'accion_mitigacion' => 'nullable|string',
            'plan_contingencia' => 'nullable|string',
        ]);

        Riesgo::create($data);

        return redirect()->route('riesgos.index')
            ->with('success', 'Riesgo creado correctamente');
    }

    /**
     * Vista editar
     */
    public function edit($id)
    {
        $riesgo = Riesgo::findOrFail($id);

        return Inertia::render('Riesgos/Editar', [
            'riesgo' => $riesgo
        ]);
    }

    /**
     * Actualizar riesgo
     */
    public function update(Request $request, $id)
    {
        $riesgo = Riesgo::findOrFail($id);

        $data = $request->validate([
            'tipo_riesgo' => 'required|string|max:100',
            'descripcion' => 'required|string',
            'probabilidad' => 'required|integer|min:1|max:4',
            'impacto' => 'required|integer|min:1|max:4',
            'responsable' => 'required|string|max:100',
            'estrategia' => 'nullable|string|max:100',
            'accion_mitigacion' => 'nullable|string',
            'plan_contingencia' => 'nullable|string',
        ]);

        $riesgo->update($data);

        return redirect()->route('riesgos.index')
            ->with('success', 'Riesgo actualizado correctamente');
    }

    /**
     * Eliminar riesgo
     */
    public function destroy($id)
    {
        $riesgo = Riesgo::findOrFail($id);
        $riesgo->delete();

        return redirect()->back()
            ->with('success', 'Riesgo eliminado correctamente');
    }

    /**
     * Convertir nivel a condición SQL
     */
    private function obtenerFiltroNivel($nivel)
    {
        return match ($nivel) {
            'bajo' => '<= 4',
            'medio' => 'BETWEEN 5 AND 9',
            'alto' => '>= 10',
            default => '>= 0'
        };
    }
}
