<?php

namespace App\Repositories\EstadisticasRepositories;

use Illuminate\Support\Facades\DB;
use Throwable;

class EstadisticasRepository
{
    /* ============================================================
       ============================ KPIs ===========================
       ============================================================ */

    public function obtenerKpisRaw(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?int $carrera,
        ?int $empresa
    ) {
        try {
            return DB::select(
                'CALL sp_kpis_estadisticas(?,?,?,?,?)',
                [
                    $fechaInicio,
                    $fechaFin,
                    $tipoOferta,
                    $carrera,
                    $empresa
                ]
            );
        } catch (Throwable $e) {
            throw $e;
        }
    }

    /* ============================================================
       ====================== OFERTAS POR MES =====================
       ============================================================ */

    public function obtenerOfertasPorMesRaw(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?int $carrera,
        ?int $empresa
    ) {
        try {
            return DB::select(
                'CALL sp_ofertas_por_mes(?,?,?,?,?)',
                [
                    $fechaInicio,
                    $fechaFin,
                    $tipoOferta,
                    $carrera,
                    $empresa
                ]
            );
        } catch (Throwable $e) {
            throw $e;
        }
    }

    /* ============================================================
       ================= POSTULACIONES POR TIPO ===================
       ============================================================ */

    public function obtenerPostulacionesPorTipoRaw(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?int $carrera,
        ?int $empresa
    ) {
        try {
            return DB::select(
                'CALL sp_postulaciones_por_tipo(?,?,?,?,?)',
                [
                    $fechaInicio,
                    $fechaFin,
                    $tipoOferta,
                    $carrera,
                    $empresa
                ]
            );
        } catch (Throwable $e) {
            throw $e;
        }
    }

    /* ============================================================
       ======================= TOP EMPRESAS =======================
       ============================================================ */

    public function obtenerTopEmpresasRaw(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?int $carrera,
        ?int $empresa
    ) {
        return DB::select(
            'CALL sp_top_empresas(?,?,?,?,?)',
            [
                $fechaInicio,
                $fechaFin,
                $tipoOferta,
                $carrera,
                $empresa
            ]
        );
    }

    /* ============================================================
       ======================= TOP CARRERAS =======================
       ============================================================ */

    public function obtenerTopCarrerasRaw(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?int $empresa
    ) {
        return DB::select(
            'CALL sp_top_carreras(?,?,?,?)',
            [
                $fechaInicio,
                $fechaFin,
                $tipoOferta,
                $empresa
            ]
        );
    }

    /* ============================================================
       ========================== CATÁLOGOS =======================
       ============================================================ */

    public function obtenerCarreras()
    {
        try {
            return DB::table('carreras')
                ->select('id_carrera as id', 'nombre')
                ->orderBy('nombre')
                ->get();
        } catch (Throwable $e) {
            throw $e;
        }
    }

    public function obtenerEmpresas()
    {
        try {
            return DB::table('empresas')
                ->select('id_empresa as id', 'nombre')
                ->orderBy('nombre')
                ->get();
        } catch (Throwable $e) {
            throw $e;
        }
    }

    /* ============================================================
       ======================= PERMISOS ROL =======================
       ============================================================ */

    public function obtenerPermisosRol(int $idRol): array
    {
        try {
            return DB::table('roles_permisos')
                ->where('id_rol', $idRol)
                ->pluck('id_permiso')
                ->toArray();
        } catch (Throwable $e) {
            throw $e;
        }
    }
}
