<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BitacoraCambio;
use Barryvdh\DomPDF\Facade\Pdf;

class BitacoraCambioController extends Controller
{
    /**
     * Listar bitácora con filtros
     */
    public function index(Request $request)
    {
        $request->validate([
            'tabla_afectada' => 'nullable|string|max:100',
            'operacion' => 'nullable|string|max:50',
            'busqueda'       => 'nullable|string|max:255',
            'fecha_inicio'   => 'nullable|date',
            'fecha_fin'      => 'nullable|date',
            'por_pagina'     => 'nullable|integer|min:5|max:100',
        ]);

        // 🔒 Validación lógica de fechas
        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            if ($request->fecha_inicio > $request->fecha_fin) {
                abort(422, 'La fecha inicio no puede ser mayor que la fecha fin.');
            }
        }

        $consulta = BitacoraCambio::leftJoin(
            'usuarios',
            'bitacora_cambios.usuario_responsable',
            '=',
            'usuarios.id_usuario'
        )
            ->select(
                'bitacora_cambios.*',
                'usuarios.nombre_completo as nombre_usuario'
            );

        /* =========================
           FILTROS
        ========================= */

        // 🔎 Tabla
        if ($request->filled('tabla_afectada')) {
            $consulta->where('bitacora_cambios.tabla_afectada', 'like', "%{$request->tabla_afectada}%");
        }

        // 🔎 Operación
        if ($request->filled('operacion')) {
            $consulta->where('bitacora_cambios.operacion', $request->operacion);
        }

        // 🔎 Fechas
        if ($request->filled('fecha_inicio')) {
            $consulta->whereDate('bitacora_cambios.fecha_cambio', '>=', $request->fecha_inicio);
        }

        if ($request->filled('fecha_fin')) {
            $consulta->whereDate('bitacora_cambios.fecha_cambio', '<=', $request->fecha_fin);
        }

        // 🔎 Búsqueda global
        if ($request->filled('busqueda')) {
            $buscar = $request->busqueda;

            $consulta->where(function ($q) use ($buscar) {
                $q->where('bitacora_cambios.tabla_afectada', 'like', "%{$buscar}%")
                    ->orWhere('bitacora_cambios.descripcion_cambio', 'like', "%{$buscar}%")
                    ->orWhere('bitacora_cambios.operacion', 'like', "%{$buscar}%")
                    ->orWhere('usuarios.nombre_completo', 'like', "%{$buscar}%");
            });
        }

        /* =========================
           ORDENAMIENTO
        ========================= */

        $consulta->orderByDesc('bitacora_cambios.fecha_cambio');


        /* =========================
           PAGINACIÓN
        ========================= */

        $porPagina = (int) $request->get('por_pagina', 10);

        $bitacora = $consulta
            ->paginate($porPagina)
            ->withQueryString();

        /* =========================
        ESTADÍSTICAS
        ========================= */

        $operacionesPrincipales = ['crear', 'actualizar', 'eliminar'];

        $estadisticasPorOperacion = BitacoraCambio::selectRaw('operacion, COUNT(*) as total')
            ->groupBy('operacion')
            ->pluck('total', 'operacion');

        $estadisticas = [
            'total' => BitacoraCambio::count(),
            'hoy' => BitacoraCambio::whereDate('fecha_cambio', now()->toDateString())->count(),
            'por_operacion' => [
                'crear' => $estadisticasPorOperacion['crear'] ?? 0,
                'actualizar' => $estadisticasPorOperacion['actualizar'] ?? 0,
                'eliminar' => $estadisticasPorOperacion['eliminar'] ?? 0,
                'otros' => collect($estadisticasPorOperacion)
                    ->except($operacionesPrincipales)
                    ->sum(),
            ],
        ];

        $operaciones = BitacoraCambio::select('operacion')
            ->distinct()
            ->orderBy('operacion')
            ->pluck('operacion');

        return Inertia::render('Bitacora/Index', [
            'bitacora' => $bitacora,
            'filtros' => $request->only([
                'busqueda',
                'tabla_afectada',
                'operacion',
                'fecha_inicio',
                'fecha_fin',
                'por_pagina',
            ]),
            'estadisticas' => $estadisticas,
            'operaciones' => $operaciones,
            'userPermisos' => getUserPermisos(),
        ]);
    }

    public function descargarPdf(Request $request)
    {
        $consulta = BitacoraCambio::leftJoin(
            'usuarios',
            'bitacora_cambios.usuario_responsable',
            '=',
            'usuarios.id_usuario'
        )
            ->select(
                'bitacora_cambios.*',
                'usuarios.nombre_completo as nombre_usuario'
            );

        /* =========================
       FILTROS (MISMO INDEX)
    ========================= */
        if ($request->filled('tabla_afectada')) {
            $consulta->where('bitacora_cambios.tabla_afectada', 'like', "%{$request->tabla_afectada}%");
        }

        if ($request->filled('operacion')) {
            $consulta->where('bitacora_cambios.operacion', $request->operacion);
        }

        if ($request->filled('fecha_inicio')) {
            $consulta->whereDate('bitacora_cambios.fecha_cambio', '>=', $request->fecha_inicio);
        }

        if ($request->filled('fecha_fin')) {
            $consulta->whereDate('bitacora_cambios.fecha_cambio', '<=', $request->fecha_fin);
        }

        if ($request->filled('busqueda')) {
            $buscar = $request->busqueda;
            $consulta->where(function ($q) use ($buscar) {
                $q->where('bitacora_cambios.tabla_afectada', 'like', "%{$buscar}%")
                    ->orWhere('bitacora_cambios.descripcion_cambio', 'like', "%{$buscar}%")
                    ->orWhere('bitacora_cambios.operacion', 'like', "%{$buscar}%")
                    ->orWhere('usuarios.nombre_completo', 'like', "%{$buscar}%");
            });
        }

        // 🔥 CAMBIO AQUÍ: Usamos fecha_cambio para evitar el error de columna inexistente
        $bitacora = $consulta->orderByDesc('bitacora_cambios.fecha_cambio')->get();

        /* =========================
       PROCESAR LOGO PARA PDF
    ========================= */
        $logoSrc = null;
        $path = public_path('logos/logo_gradem.png');

        if (file_exists($path)) {
            $type = pathinfo($path, PATHINFO_EXTENSION);
            $dataImg = file_get_contents($path);
            $logoSrc = 'data:image/' . $type . ';base64,' . base64_encode($dataImg);
        }

        /* =========================
       GENERAR PDF
    ========================= */
        $pdf = Pdf::loadView('pdf.bitacora', [
            'bitacora' => $bitacora,
            'filtros'  => $request->all(),
            'logoSrc'  => $logoSrc
        ]);

        $pdf->setPaper('a4', 'landscape');

        // 🔥 CAMBIO AQUÍ: Agregamos renderizado de fuentes para tildes y eñes
        $pdf->setOption([
            'isRemoteEnabled' => true,
            'defaultFont' => 'Helvetica',
            'isHtml5ParserEnabled' => true
        ]);

        return $pdf->download('bitacora_gradem_' . now()->format('d_m_Y') . '.pdf');
    }
}
