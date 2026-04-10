<?php

namespace App\Services\BitacoraCambioServices;

use App\Repositories\BitacoraCambioRepositories\BitacoraCambioRepository;

class BitacoraCambioService
{
    protected $repository;

    public function __construct(BitacoraCambioRepository $repository)
    {
        $this->repository = $repository;
    }

    public function obtenerBitacora($filtros)
    {
        return $this->repository->obtenerBitacora($filtros);
    }

    public function registrarCambio($tabla, $operacion, $usuarioId, $descripcion)
    {
        return $this->repository->registrarCambio([
            'tabla_afectada' => $tabla,
            'operacion' => $operacion,
            'usuario_responsable' => $usuarioId,
            'descripcion_cambio' => $descripcion,
            'fecha_cambio' => now()
        ]);
    }
}