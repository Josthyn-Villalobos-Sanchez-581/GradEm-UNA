<?php

namespace App\Repositories\EstadisticasRepositories;

use Illuminate\Support\Facades\DB;

class EstadisticasRepository
{
    /* ========================
     * KPIs
     * ======================== */
    public function obtenerKpisRaw(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?string $campoAplicacion,
        ?string $empresaNombre
    ) {
        $query = DB::table('vw_ofertas_reporte');

        if ($fechaInicio) {
            $query->whereDate('fecha_publicacion', '>=', $fechaInicio);
        }
        if ($fechaFin) {
            $query->whereDate('fecha_publicacion', '<=', $fechaFin);
        }
        if ($tipoOferta) {
            $query->where('tipo_oferta', $tipoOferta);
        }
        if ($campoAplicacion) {
            $query->where('campo_aplicacion', $campoAplicacion);
        }
        if ($empresaNombre) {
            $query->where('empresa_nombre', $empresaNombre);
        }

        return [
            'totalOfertas'       => (clone $query)->count(),
            'ofertasActivas'     => (clone $query)->where('estado', 'Activa')->count(),
            'totalPostulaciones' => DB::table('postulaciones')->count(),
            'empresasActivas'    => (clone $query)->distinct('empresa_nombre')->count(),
        ];
    }

    /* ========================
     * Ofertas por mes
     * ======================== */
    public function obtenerOfertasPorMesRaw(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?string $campoAplicacion,
        ?string $empresaNombre
    ) {
        $query = DB::table('vw_ofertas_reporte')
            ->selectRaw('MONTH(fecha_publicacion) mes, COUNT(*) total')
            ->groupBy('mes')
            ->orderBy('mes');

        if ($fechaInicio) {
            $query->whereDate('fecha_publicacion', '>=', $fechaInicio);
        }
        if ($fechaFin) {
            $query->whereDate('fecha_publicacion', '<=', $fechaFin);
        }
        if ($tipoOferta) {
            $query->where('tipo_oferta', $tipoOferta);
        }
        if ($campoAplicacion) {
            $query->where('campo_aplicacion', $campoAplicacion);
        }
        if ($empresaNombre) {
            $query->where('empresa_nombre', $empresaNombre);
        }

        return $query->get();
    }

    /* ========================
     * Postulaciones por tipo
     * ======================== */
    public function obtenerPostulacionesTipoRaw(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?string $campoAplicacion,
        ?string $empresaNombre
    ) {
        $query = DB::table('postulaciones')
            ->selectRaw('tipo_postulacion label, COUNT(*) value')
            ->groupBy('tipo_postulacion');

        if ($fechaInicio) {
            $query->whereDate('created_at', '>=', $fechaInicio);
        }
        if ($fechaFin) {
            $query->whereDate('created_at', '<=', $fechaFin);
        }

        return $query->get();
    }

    /* ========================
     * Top empresas
     * ======================== */
    public function obtenerTopEmpresasRaw(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?string $campoAplicacion,
        ?string $empresaNombre
    ) {
        return DB::table('vw_ofertas_reporte')
            ->selectRaw('empresa_nombre nombre, COUNT(*) postulaciones')
            ->groupBy('empresa_nombre')
            ->orderByDesc('postulaciones')
            ->limit(10)
            ->get();
    }

    /* ========================
     * Top carreras
     * ======================== */
    public function obtenerTopCarrerasRaw(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?string $campoAplicacion,
        ?string $empresaNombre
    ) {
        return DB::table('vw_ofertas_reporte')
            ->selectRaw('campo_aplicacion carrera, COUNT(*) vacantes')
            ->groupBy('campo_aplicacion')
            ->orderByDesc('vacantes')
            ->limit(10)
            ->get();
    }

    /* ========================
     * Catálogos
     * ======================== */
    public function obtenerTiposOferta()
    {
        return DB::table('ofertas')->distinct()->pluck('tipo_oferta');
    }

    public function obtenerCamposAplicacion()
    {
        return DB::table('ofertas')->distinct()->pluck('campo_aplicacion');
    }

    public function obtenerEmpresas()
    {
        return DB::table('empresas')->select('id', 'nombre')->get();
    }
}
