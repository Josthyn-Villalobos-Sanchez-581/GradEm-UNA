<?php

namespace App\Services\OfertaServices;

use App\Repositories\OfertaRepositories\OfertaRepository;
use App\Models\Oferta;
use Illuminate\Support\Facades\Auth;

class OfertaService
{
    protected $repository;

    public function __construct(OfertaRepository $repository)
    {
        $this->repository = $repository;
    }

    public function desactivarOfertasVencidas(): void
    {
        $usuarioId = Auth::id();
        $idsOfertas = $this->repository->obtenerOfertasVencidasIds();

        if ($idsOfertas->isEmpty()) {
            return;
        }

        $this->repository->actualizarEstadosMasivo($idsOfertas->toArray(), Oferta::ESTADO_VENCIDA);

        $this->repository->registrarBitacora([
            'tabla_afectada'      => 'ofertas',
            'operacion'           => 'FINALIZAR',
            'usuario_responsable' => $usuarioId,
            'descripcion_cambio'  => 'Ofertas desactivadas automáticamente por vencimiento. IDs: ' . $idsOfertas->implode(', '),
            'fecha_cambio'        => now(),
        ]);
    }

    public function normalizarFotoPerfil($oferta)
    {
        if ($oferta->empresa && $oferta->empresa->usuario && $oferta->empresa->usuario->fotoPerfil) {
            $foto = $oferta->empresa->usuario->fotoPerfil;
            
            if (is_array($foto)) {
                $url = $foto['url'] ?? null;
            } else {
                // Se usa asset() o asset('storage/...') según la lógica original detectada
                $url = $foto->ruta_imagen ? asset($foto->ruta_imagen) : null;
                // Nota: En mostrar() usabas 'storage/', se mantiene la lógica de "asset" genérico para unificar.
            }

            $oferta->empresa->usuario->fotoPerfil = $url ? ['url' => $url] : null;
        } else {
            if ($oferta->empresa && $oferta->empresa->usuario) {
                $oferta->empresa->usuario->fotoPerfil = null;
            }
        }
        return $oferta;
    }
}