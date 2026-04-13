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
        return Curso::with('modalidades')->find($idCurso);
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

    /**
     * Cancelar inscripción
     */
    public function cancelarInscripcion(int $idCurso, int $idUsuario): void
    {
        InscripcionCurso::where('id_curso', $idCurso)
            ->where('id_usuario', $idUsuario)
            ->delete();
    }

    /**
     * Obtener cursos inscritos por usuario
     */
    public function obtenerCursosPorUsuario(int $idUsuario)
    {
        return DB::table('inscripciones_curso as ic')
            ->join('cursos as c', 'c.id_curso', '=', 'ic.id_curso') // ✅ FIX
            ->leftJoin('modalidad as m', 'm.id_modalidad', '=', 'c.id_modalidad') // ⚠️ validar nombre
            ->select(
                'c.id_curso',
                'c.titulo',
                'c.descripcion',
                'c.fecha_inicio',
                'c.fecha_fin',
                'c.fecha_limite_inscripcion',
                'c.cupos',
                'c.estado_id',
                'm.id_modalidad',
                'm.nombre as modalidad_nombre'
            )
            ->where('ic.id_usuario', $idUsuario)
            ->where('ic.estado_id', 1) // 🔥 importante (solo activos)
            ->get()
            ->map(function ($curso) {
                return [
                    'id_curso' => $curso->id_curso,
                    'titulo' => $curso->titulo,
                    'descripcion' => $curso->descripcion,
                    'fecha_inicio' => $curso->fecha_inicio,
                    'fecha_fin' => $curso->fecha_fin,
                    'fecha_limite_inscripcion' => $curso->fecha_limite_inscripcion,
                    'cupos' => $curso->cupos,
                    'estado_id' => $curso->estado_id,
                    'modalidad' => [
                        'id_modalidad' => $curso->id_modalidad,
                        'nombre' => $curso->modalidad_nombre,
                    ]
                ];
            });
    }

    public function obtenerConteoInscritos($cursos)
    {
        $ids = collect($cursos)->pluck('id_curso');

        return DB::table('inscripciones_curso')
            ->selectRaw('id_curso, COUNT(*) as total')
            ->whereIn('id_curso', $ids)
            ->groupBy('id_curso')
            ->pluck('total', 'id_curso');
    }
}
