<?php

namespace App\Services\PostulacionServices;

use App\Repositories\PostulacionRepositories\PostulacionRepository;

class PostulacionService
{
    protected $repository;

    public function __construct(PostulacionRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Normaliza la foto de perfil de la empresa asociada a la oferta
     */
    public function normalizarFotoOferta($postulacion)
    {
        if (
            $postulacion->oferta &&
            $postulacion->oferta->empresa &&
            $postulacion->oferta->empresa->usuario &&
            $postulacion->oferta->empresa->usuario->fotoPerfil
        ) {
            $foto = $postulacion->oferta->empresa->usuario->fotoPerfil;

            $url = is_array($foto)
                ? ($foto['url'] ?? null)
                : ($foto->ruta_imagen ? asset($foto->ruta_imagen) : null);

            $postulacion->oferta->empresa->usuario->fotoPerfil = $url ? ['url' => $url] : null;
        } else {
            if ($postulacion->oferta && $postulacion->oferta->empresa && $postulacion->oferta->empresa->usuario) {
                $postulacion->oferta->empresa->usuario->fotoPerfil = null;
            }
        }

        return $postulacion;
    }

    public function getRepository()
    {
        return $this->repository;
    }
}