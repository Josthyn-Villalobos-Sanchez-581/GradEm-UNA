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
            ->where('estado_id', 1)
            ->exists();
    }

    /**
     * Contar cuántos inscritos tiene el curso.
     */
    public function contarInscritos(int $idCurso): int
    {
        return InscripcionCurso::where('id_curso', $idCurso)
            ->where('estado_id', 1)
            ->count();
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
        $inscripcion = InscripcionCurso::where('id_curso', $idCurso)
            ->where('id_usuario', $idUsuario)
            ->first();

        if ($inscripcion) {
            
            $inscripcion->update([
                'estado_id' => 1,
                'fecha_inscripcion' => now()
            ]);

            return $inscripcion;
        }

        return InscripcionCurso::create([
            'id_curso' => $idCurso,
            'id_usuario' => $idUsuario,
            'fecha_inscripcion' => now(),
            'estado_id' => 1,
        ]);
    }

    /**
     * Obtener cursos en los que el usuario está inscrito
     */
    public function obtenerCursosPorUsuario(int $idUsuario)
    {
        return InscripcionCurso::with([
            'curso.modalidad',
        ])
            ->where('id_usuario', $idUsuario)
            ->where('estado_id', 1)
            ->get()
            ->map(function ($inscripcion) {
                $curso = $inscripcion->curso;

                return [
                    'id_curso' => $curso->id_curso,
                    'titulo' => $curso->titulo,
                    'descripcion' => $curso->descripcion,
                    'modalidad' => $curso->modalidad,
                    'nombreInstructor' => $curso->nombreInstructor ?? 'NA',
                    'fecha_inicio' => $curso->fecha_inicio,
                    'fecha_fin' => $curso->fecha_fin,
                    'fecha_limite_inscripcion' => $curso->fecha_limite_inscripcion,
                    'duracion' => $curso->duracion,
                    'cupos' => $curso->cupos,
                    'estado_id' => $curso->estado_id,
                ];
            });
    }

    /**
     * Cancelar inscripción (cambio lógico de estado)
     */
    public function cancelarInscripcion(int $idCurso, int $idUsuario): bool
{
    return InscripcionCurso::where('id_curso', $idCurso)
        ->where('id_usuario', $idUsuario)
        ->delete() > 0; // ✅ DELETE REAL
}

/**
 * Obtener cantidad de inscritos por curso
 */
public function obtenerConteoInscritosPorCurso(): array
{
    return InscripcionCurso::select('id_curso', DB::raw('COUNT(*) as total'))
        ->where('estado_id', 1)
        ->groupBy('id_curso')
        ->pluck('total', 'id_curso')
        ->toArray();
}
}
