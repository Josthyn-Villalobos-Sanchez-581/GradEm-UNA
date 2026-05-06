<?php

namespace App\Repositories\CursoRepositories;

use App\Models\Curso;
use App\Models\Modalidad;
use Illuminate\Support\Facades\DB;
use App\Models\InscripcionCurso; 
class CursoRepository
{
    /**
     * Obtener cursos con filtros robustos
     */
    public function filtrarCursos($request, $usuario)
    {
        $query = Curso::with('modalidad');

        // 1. REGLA BASE: Nunca inactivos
        $query->where('estado_id', '!=', 2);

        // 2. CONTROL DE VISIBILIDAD POR ROL
        // Si NO es administrativo, forzamos que solo vea lo publicado (ID 1)
        if (!in_array($usuario->id_rol, [1, 2])) {
            $query->where('estado_id', 1);
        }

        // 3. BÚSQUEDA GENERAL (Mejoramos la validación)
        if ($request->filled('buscar') && $request->buscar != '') {
            $buscar = $request->buscar;
            $query->where(function ($q) use ($buscar) {
                $q->where('titulo', 'like', "%{$buscar}%")
                ->orWhere('descripcion', 'like', "%{$buscar}%");
            });
        }

        // 4. FILTRO DE MODALIDAD (Validar que no sea 'todos')
        if ($request->filled('modalidad') && $request->modalidad !== 'todos') {
            $query->where('id_modalidad', $request->modalidad);
        }

        // 5. FILTRO DE ESTADO (Aquí es donde fallaba)
        // Solo filtramos si el usuario seleccionó algo específico que no sea "todos"
        if ($request->filled('estado') && $request->estado !== 'todos') {
            if ($request->estado === 'publicado') {
                $query->where('estado_id', 1);
            } elseif ($request->estado === 'borrador') {
                // Importante: No uses whereNotIn([1, 2]) aquí porque el 2 ya está excluido arriba.
                // Simplemente pide todo lo que NO sea 1.
                $query->where('estado_id', '!=', 1);
            }
        }

        // 6. INSTRUCTOR
        if (in_array($usuario->id_rol, [1, 2]) && $request->filled('instructor') && $request->instructor != '') {
            $query->where('nombreInstructor', 'like', '%' . $request->instructor . '%');
        }

        // 7. FECHAS (Validación estricta para evitar que filtros vacíos rompan la query)
        if ($request->filled('fecha_inicio') && $request->fecha_inicio != '') {
            $query->whereDate('fecha_limite_inscripcion', '>=', $request->fecha_inicio);
        }

        if ($request->filled('fecha_fin') && $request->fecha_fin != '') {
            $query->whereDate('fecha_limite_inscripcion', '<=', $request->fecha_fin);
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
            ->leftJoin('universidades', 'universidades.id_universidad', '=', 'usuarios.id_universidad')
            ->leftJoin('carreras', 'carreras.id_carrera', '=', 'usuarios.id_carrera')
            ->where('inscripciones_curso.id_curso', $idCurso)
            ->select(
                'usuarios.id_usuario',
                'usuarios.nombre_completo',
                'usuarios.correo',
                'usuarios.identificacion',
                'usuarios.telefono',
                'universidades.nombre as universidad',
                'carreras.nombre as carrera'
            )
            ->orderBy('usuarios.nombre_completo')
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
            'cupos',
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
    public function inactivarCurso(Curso $curso, string $motivo)
    {
        $curso->estado_id = 2; // 2 = inactivo
        $curso->save();

        // Registro en bitácora
        DB::table('bitacora_cambios')->insert([
            'tabla_afectada' => 'cursos',
            'operacion' => 'INACTIVAR',
            'usuario_responsable' => auth()->id(),
            'descripcion_cambio' => 'Curso inactivado. Motivo: ' . $motivo,
            'fecha_cambio' => now(),
        ]);

        return $curso;
    }

    public function eliminarInscripcionCurso(int $idCurso, int $idUsuario): bool
{
    $inscripcion = InscripcionCurso::where('id_curso', $idCurso)
        ->where('id_usuario', $idUsuario)
        ->first();

    if (!$inscripcion) {
        return false;
    }

    return $inscripcion->delete();
}

}
