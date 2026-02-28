<?php

namespace App\Repositories\InscripcionCursoRepositories;

use App\Models\InscripcionCurso;
use App\Models\Curso;
use Illuminate\Support\Facades\DB;

class InscripcionCursoRepository
{
    /**
     * Verificar si el usuario ya está inscrito en el curso.
     */
    public function existeInscripcion(int $idCurso, int $idUsuario): bool
    {
        return InscripcionCurso::where('id_curso', $idCurso)
            ->where('id_usuario', $idUsuario)
            ->exists();
    }

    /**
     * Contar cuántos inscritos tiene el curso.
     */
    public function contarInscritos(int $idCurso): int
    {
        return InscripcionCurso::where('id_curso', $idCurso)->count();
    }

    /**
     * Obtener el curso con modalidad cargada para el correo.
     */
    public function obtenerCursoConModalidad(int $idCurso): ?Curso
    {
        return Curso::with('modalidad')->find($idCurso);
    }

    /**
     * Inscribir al usuario en el curso.
     */
    public function inscribir(int $idCurso, int $idUsuario): InscripcionCurso
    {
        return InscripcionCurso::create([
            'id_curso'          => $idCurso,
            'id_usuario'        => $idUsuario,
            'fecha_inscripcion' => now()->toDateTimeString(),
            'estado_id'         => 1, // activo
        ]);
    }
}
