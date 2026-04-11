<?php

namespace App\Repositories\BitacoraCambioRepositories;

use App\Models\BitacoraCambio;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class BitacoraCambioRepository
{
    /**
     * Obtener bitácora con filtros dinámicos
     */
    public function obtenerBitacora(array $filtros): LengthAwarePaginator
    {
        $query = BitacoraCambio::query()
            ->leftJoin('usuarios', 'bitacora_cambios.usuario_responsable', '=', 'usuarios.id_usuario')
            ->select(
                'bitacora_cambios.*',
                'usuarios.nombre_completo as nombre_usuario'
            );

        /* =========================
           FILTROS
        ========================= */

        // 🔎 Tabla afectada
        $query->when($filtros['tabla_afectada'] ?? null, function ($q, $valor) {
            $q->where('bitacora_cambios.tabla_afectada', 'LIKE', "%{$valor}%");
        });

        // 🔎 Operación
        $query->when($filtros['operacion'] ?? null, function ($q, $valor) {
            $q->where('bitacora_cambios.operacion', $valor);
        });

        // 🔎 Usuario
        $query->when($filtros['usuario_responsable'] ?? null, function ($q, $valor) {
            $q->where('bitacora_cambios.usuario_responsable', $valor);
        });

        // 🔎 Fecha inicio
        $query->when($filtros['fecha_inicio'] ?? null, function ($q, $valor) {
            $q->whereDate('bitacora_cambios.fecha_cambio', '>=', $valor);
        });

        // 🔎 Fecha fin
        $query->when($filtros['fecha_fin'] ?? null, function ($q, $valor) {
            $q->whereDate('bitacora_cambios.fecha_cambio', '<=', $valor);
        });

        // 🔎 Búsqueda global
        $query->when($filtros['busqueda'] ?? null, function ($q, $valor) {
            $q->where(function ($sub) use ($valor) {
                $sub->where('bitacora_cambios.tabla_afectada', 'LIKE', "%{$valor}%")
                    ->orWhere('bitacora_cambios.descripcion_cambio', 'LIKE', "%{$valor}%")
                    ->orWhere('bitacora_cambios.operacion', 'LIKE', "%{$valor}%")
                    ->orWhere('usuarios.nombre_completo', 'LIKE', "%{$valor}%");
            });
        });

        /* =========================
           ORDENAMIENTO SEGURO
        ========================= */

        $orden = strtolower($filtros['orden'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        /* =========================
           PAGINACIÓN
        ========================= */

        $porPagina = isset($filtros['por_pagina']) && is_numeric($filtros['por_pagina'])
            ? (int) $filtros['por_pagina']
            : 10;

        return $query
            ->orderBy('bitacora_cambios.fecha_cambio', $orden)
            ->paginate($porPagina)
            ->withQueryString();
    }

    /**
     * Registrar cambio en bitácora
     */
    public function registrarCambio(array $data): BitacoraCambio
    {
        return BitacoraCambio::create([
            'tabla_afectada' => $data['tabla_afectada'],
            'operacion' => $data['operacion'],
            'usuario_responsable' => $data['usuario_responsable'] ?? null,
            'descripcion_cambio' => $data['descripcion_cambio'] ?? null,
            'fecha_cambio' => $data['fecha_cambio'] ?? now(),
        ]);
    }
}