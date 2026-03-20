<?php

namespace App\Services\CursoServices;

use App\Repositories\CursoRepositories\CursoRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CursoInscripcionViewService
{
    protected CursoRepository $cursoRepository;

    public function __construct(CursoRepository $cursoRepository)
    {
        $this->cursoRepository = $cursoRepository;
    }

    public function obtenerCursosParaInscripcion(Request $request, $usuario)
    {
        return $this->cursoRepository->filtrarCursos($request, $usuario);
    }

    public function obtenerModalidades()
    {
        return $this->cursoRepository->obtenerModalidades();
    }

    public function obtenerMisInscripciones(int $idUsuario): array
    {
        return DB::table('inscripciones_curso')
            ->where('id_usuario', $idUsuario)
            ->pluck('id_curso')
            ->toArray();
    }

    public function obtenerInscritosCount(): array
    {
        return DB::table('inscripciones_curso')
            ->select('id_curso', DB::raw('COUNT(*) as total'))
            ->groupBy('id_curso')
            ->pluck('total', 'id_curso')
            ->toArray();
    }
}
