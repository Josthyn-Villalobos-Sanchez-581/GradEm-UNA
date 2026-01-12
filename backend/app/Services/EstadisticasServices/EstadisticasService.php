<?php

namespace App\Services\EstadisticasServices;

use App\Repositories\EstadisticasRepositories\EstadisticasRepository;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class EstadisticasService
{
    protected EstadisticasRepository $repo;

    public function __construct(EstadisticasRepository $repo)
    {
        $this->repo = $repo;
    }

    /* ============================================================
       ============================ KPIs ===========================
       ============================================================ */

    public function obtenerKpis(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?int $carrera,
        ?int $empresa
    ): array {
        $raw = $this->repo->obtenerKpisRaw(
            $fechaInicio,
            $fechaFin,
            $tipoOferta,
            $carrera,
            $empresa
        );

        $rows = json_decode(json_encode($raw), true);

        if (!$rows) {
            return [
                'total_ofertas'        => 0,
                'total_postulaciones' => 0,
                'empresas_activas'     => 0,
                'top_campo'            => null,
            ];
        }

        $r = $rows[0];

        return [
            'total_ofertas'        => (int) ($r['total_ofertas'] ?? 0),
            'ofertas_activas'      => (int) ($r['ofertas_activas'] ?? 0),
            'total_postulaciones' => (int) ($r['total_postulaciones'] ?? 0),
            'empresas_activas'     => (int) ($r['empresas_activas'] ?? 0),
        ];
    }

    /* ============================================================
       ====================== OFERTAS POR MES =====================
       ============================================================ */

    public function obtenerOfertasPorMes(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?int $carrera,
        ?int $empresa
    ): array {
        $raw = $this->repo->obtenerOfertasPorMesRaw(
            $fechaInicio,
            $fechaFin,
            $tipoOferta,
            $carrera,
            $empresa
        );

        return json_decode(json_encode($raw), true) ?: [];
    }

    /* ============================================================
       ================= POSTULACIONES POR TIPO ===================
       ============================================================ */

    public function obtenerPostulacionesPorTipo(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?int $carrera,
        ?int $empresa
    ): array {
        $raw = $this->repo->obtenerPostulacionesPorTipoRaw(
            $fechaInicio,
            $fechaFin,
            $tipoOferta,
            $carrera,
            $empresa
        );

        return json_decode(json_encode($raw), true) ?: [];
    }

    /* ============================================================
       ======================= TOP EMPRESAS =======================
       ============================================================ */

    public function obtenerTopEmpresas(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?int $carrera,
        ?int $empresa
    ): array {
        $raw = $this->repo->obtenerTopEmpresasRaw(
            $fechaInicio,
            $fechaFin,
            $tipoOferta,
            $carrera,
            $empresa
        );

        return json_decode(json_encode($raw), true) ?: [];
    }

    /* ============================================================
       ======================= TOP CARRERAS =======================
       ============================================================ */

    public function obtenerTopCarreras(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?int $empresa
    ): array {

        $usarFechas = $fechaInicio || $fechaFin;

        // ===============================
        // PERIODO ACTUAL
        // ===============================
        if ($usarFechas) {
            $finActual = $fechaFin
                ? now()->parse($fechaFin)
                : now();

            $inicioActual = $fechaInicio
                ? now()->parse($fechaInicio)
                : $finActual->copy()->subDays(30);
        } else {
            $inicioActual = null;
            $finActual = null;
        }

        // ===============================
        // PERIODO ANTERIOR (solo si hay fechas)
        // ===============================
        if ($usarFechas) {
            $diasPeriodo = $inicioActual->diffInDays($finActual) + 1;
            $finAnterior = $inicioActual->copy()->subDay();
            $inicioAnterior = $finAnterior->copy()->subDays($diasPeriodo - 1);
        } else {
            $inicioAnterior = null;
            $finAnterior = null;
        }

        $actualRaw = $this->repo->obtenerTopCarrerasRaw(
            $inicioActual?->format('Y-m-d'),
            $finActual?->format('Y-m-d'),
            $tipoOferta,
            $empresa
        );

        $actual = collect(json_decode(json_encode($actualRaw), true));

        $anteriorRaw = $usarFechas
            ? $this->repo->obtenerTopCarrerasRaw(
                $inicioAnterior->format('Y-m-d'),
                $finAnterior->format('Y-m-d'),
                $tipoOferta,
                $empresa
            )
            : [];

        $anterior = collect(json_decode(json_encode($anteriorRaw), true))
            ->keyBy('carrera');

        return $actual->map(function ($item) use ($anterior, $usarFechas) {

            $vacantesActual = (int) ($item['vacantes'] ?? 0);
            $vacantesAnterior = $usarFechas
                ? (int) ($anterior[$item['carrera']]['vacantes'] ?? 0)
                : 0;

            $tendencia = $usarFechas && $vacantesAnterior > 0
                ? round((($vacantesActual - $vacantesAnterior) / $vacantesAnterior) * 100, 1)
                : 0;

            return [
                'carrera'   => $item['carrera'],
                'vacantes' => $vacantesActual,
                'tendencia'=> $tendencia,
            ];
        })->values()->toArray();
    }


    /* ============================================================
       =================== DATOS INICIALES ========================
       ============================================================ */

    public function obtenerDatosIniciales(): array
    {
        $usuario = Auth::user();

        return [
            'userPermisos' => $this->repo->obtenerPermisosRol($usuario->id_rol),
            'catalogosIniciales' => [
                'carreras' => $this->repo->obtenerCarreras(),
                'empresas' => $this->repo->obtenerEmpresas(),
            ],
        ];
    }

    public function generarPdfReportes(array $reportes, array $p, array $filtrosLegibles = [])
    {
        $ofertasMes = [];
        $postulacionesTipo = [];
        $topEmpresas = [];
        $topCarreras = [];

        if (in_array('ofertas_mes', $reportes)) {
            $ofertasMes = $this->obtenerOfertasPorMes(
                $p['fecha_inicio'] ?? null,
                $p['fecha_fin'] ?? null,
                $p['tipo_oferta'] ?? null,
                $p['carrera'] ?? null,
                $p['empresa'] ?? null
            );
        }

        if (in_array('postulaciones_tipo', $reportes)) {
            $postulacionesTipo = $this->obtenerPostulacionesPorTipo(
                $p['fecha_inicio'] ?? null,
                $p['fecha_fin'] ?? null,
                $p['tipo_oferta'] ?? null,
                $p['carrera'] ?? null,
                $p['empresa'] ?? null
            );
        }

        if (in_array('top_empresas', $reportes)) {
            $topEmpresas = $this->obtenerTopEmpresas(
                $p['fecha_inicio'] ?? null,
                $p['fecha_fin'] ?? null,
                $p['tipo_oferta'] ?? null,
                $p['carrera'] ?? null,
                $p['empresa'] ?? null
            );
        }

        if (in_array('top_carreras', $reportes)) {
            $topCarreras = $this->obtenerTopCarreras(
                $p['fecha_inicio'] ?? null,
                $p['fecha_fin'] ?? null,
                $p['tipo_oferta'] ?? null,
                $p['empresa'] ?? null
            );
        }

        return Pdf::loadView('pdf.reportes-ofertas', [
            'reportes'             => $reportes,
            'ofertasMes'           => $ofertasMes,
            'postulacionesTipo'    => $postulacionesTipo,
            'topEmpresas'          => $topEmpresas,
            'topCarreras'          => $topCarreras,
            'filtros'              => $filtrosLegibles,
            'fecha'                => now()->format('d/m/Y H:i'),
        ])
            ->setPaper('a4', 'portrait')
            ->download('Reporte_Ofertas_UNA.pdf');
    }
}
