<?php

namespace App\Services\EstadisticasServices;

use App\Repositories\EstadisticasRepositories\EstadisticasRepository;

class EstadisticasService
{
    protected EstadisticasRepository $repository;

    public function __construct(EstadisticasRepository $repository)
    {
        $this->repository = $repository;
    }

    /* ========================
     * KPIs
     * ======================== */
    public function obtenerKpis(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?string $campoAplicacion,
        ?string $empresaNombre
    ) {
        return $this->repository->obtenerKpisRaw(
            $fechaInicio,
            $fechaFin,
            $tipoOferta,
            $campoAplicacion,
            $empresaNombre
        );
    }

    /* ========================
     * Ofertas por mes
     * ======================== */
    public function obtenerOfertasPorMes(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?string $campoAplicacion,
        ?string $empresaNombre
    ) {
        return $this->repository->obtenerOfertasPorMesRaw(
            $fechaInicio,
            $fechaFin,
            $tipoOferta,
            $campoAplicacion,
            $empresaNombre
        );
    }

    /* ========================
     * Postulaciones por tipo
     * ======================== */
    public function obtenerPostulacionesTipo(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?string $campoAplicacion,
        ?string $empresaNombre
    ) {
        return $this->repository->obtenerPostulacionesTipoRaw(
            $fechaInicio,
            $fechaFin,
            $tipoOferta,
            $campoAplicacion,
            $empresaNombre
        );
    }

    /* ========================
     * Top empresas
     * ======================== */
    public function obtenerTopEmpresas(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?string $campoAplicacion,
        ?string $empresaNombre
    ) {
        return $this->repository->obtenerTopEmpresasRaw(
            $fechaInicio,
            $fechaFin,
            $tipoOferta,
            $campoAplicacion,
            $empresaNombre
        );
    }

    /* ========================
     * Top carreras
     * ======================== */
    public function obtenerTopCarreras(
        ?string $fechaInicio,
        ?string $fechaFin,
        ?string $tipoOferta,
        ?string $campoAplicacion,
        ?string $empresaNombre
    ) {
        return $this->repository->obtenerTopCarrerasRaw(
            $fechaInicio,
            $fechaFin,
            $tipoOferta,
            $campoAplicacion,
            $empresaNombre
        );
    }

    /* ========================
     * Datos iniciales
     * ======================== */
    public function obtenerDatosIniciales()
    {
        return [
            'tiposOferta' => $this->repository->obtenerTiposOferta(),
            'camposAplicacion' => $this->repository->obtenerCamposAplicacion(),
            'empresas' => $this->repository->obtenerEmpresas(),
        ];
    }
}
