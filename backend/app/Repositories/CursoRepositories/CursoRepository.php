<?php

namespace App\Repositories\CursoRepositories;

use App\Models\Curso;
use App\Models\Modalidad;
use Illuminate\Support\Facades\DB;

class CursoRepository
{
    /**
     * Obtener cursos con filtros robustos
     */
    public function filtrarCursos($request, $usuario)
    {
        $query = Curso::with('modalidad');

        // 🔒 Control por rol
        // Solo Admin / Coordinador ven borradores
        if (!in_array($usuario->id_rol, [1, 2])) {
            $query->where('estado_id', 1); // publicado
        }

        // 🔍 Búsqueda general
        if ($request->filled('buscar')) {
            $buscar = $request->buscar;
            $query->where(function ($q) use ($buscar) {
                $q->where('titulo', 'like', "%{$buscar}%")
                  ->orWhere('descripcion', 'like', "%{$buscar}%");
            });
        }

        // 🎓 Modalidad
        if ($request->filled('modalidad')) {
            $query->where('id_modalidad', $request->modalidad);
        }

        // 📌 Estado
        if ($request->filled('estado')) {
            if ($request->estado === 'publicado') {
                $query->where('estado_id', 1);
            }
            if ($request->estado === 'borrador') {
                $query->where('estado_id', '!=', 1);
            }
        }

        // 👨‍🏫 Instructor (solo admins)
        if (
            in_array($usuario->id_rol, [1, 2]) &&
            $request->filled('instructor')
        ) {
            $query->where(
                'nombreInstructor',
                'like',
                '%' . $request->instructor . '%'
            );
        }

        // 📅 Rango de fecha de inscripción
        // (Campo REAL de la BD)
        if ($request->filled('fecha_inicio')) {
            $query->whereDate(
                'fecha_limite_inscripcion',
                '>=',
                $request->fecha_inicio
            );
        }

        if ($request->filled('fecha_fin')) {
            $query->whereDate(
                'fecha_limite_inscripcion',
                '<=',
                $request->fecha_fin
            );
        }

        return $query
            ->orderBy('fecha_inicio', 'desc')
            ->get();
    }

    /**
     * Obtener modalidades
     */
    public function obtenerModalidades()
    {
        return Modalidad::orderBy('nombre')->get();
    }

    /**
     * Obtener curso por ID
     */
    public function obtenerCursoPorId($idCurso)
    {
        return Curso::find($idCurso);
    }

    /**
     * Obtener inscritos del curso
     */
    public function obtenerInscritosCurso($idCurso)
    {
        return DB::table('inscripciones_curso')
            ->join('usuarios', 'usuarios.id_usuario', '=', 'inscripciones_curso.id_usuario')
            ->where('inscripciones_curso.id_curso', $idCurso)
            ->select('usuarios.correo')
            ->get();
    }

    public function crearCurso(array $data)
    {
        return Curso::create($data);
    }

    public function publicarCurso(Curso $curso): void
    {
        $curso->update([
            'estado_id' => 1,
        ]);
    }

    /**
     * Actualizar curso (admite datos parciales)
     */
    public function actualizarCurso(Curso $curso, array $data): void
    {
        // 🔒 Solo permitir columnas válidas
        $camposPermitidos = [
            'titulo',
            'descripcion',
            'fecha_inicio',
            'fecha_fin',
            'fecha_limite_inscripcion',
            'duracion',
            'id_modalidad',
            'nombreInstructor',
            'estado_id',
        ];

        $dataFiltrada = array_intersect_key(
            $data,
            array_flip($camposPermitidos)
        );

        if (empty($dataFiltrada)) {
            return;
        }

        $curso->update($dataFiltrada);
    }

    /**
     * Eliminar curso
     */
    public function eliminarCurso(Curso $curso)
    {
        return $curso->delete();
    }
}
