<?php

namespace App\Services\CursoServices;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Repositories\CursoRepositories\CursoRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\CursoCanceladoMail;
use App\Mail\CursoActualizadoMail;
use App\Models\Curso;
use Barryvdh\DomPDF\Facade\Pdf; 
class CursoService
{
    protected $cursoRepository;

    public function __construct(CursoRepository $cursoRepository)
    {
        $this->cursoRepository = $cursoRepository;
    }

    /**
     * Obtener cursos filtrados
     */
    public function obtenerCursosFiltrados($request, $usuario)
    {
        return $this->cursoRepository->filtrarCursos($request, $usuario);
    }

    /**
     * Obtener curso por ID
     */
    public function obtenerCursoPorId(int $idCurso)
    {
        return $this->cursoRepository->obtenerCursoPorId($idCurso);
    }

    /**
     * Obtener inscritos por curso
     */
    public function obtenerInscritosCurso(int $idCurso)
    {
        return $this->cursoRepository->obtenerInscritosCurso($idCurso);
    }

    /**
     * Obtener modalidades
     */
    public function obtenerModalidades()
    {
        return $this->cursoRepository->obtenerModalidades();
    }

    public function registrarCurso(Request $request)
    {
        DB::beginTransaction();

        try {
            $data = [
                'titulo' => $request->titulo ?? null,
                'descripcion' => $request->descripcion ?? null,
                'fecha_inicio' => $request->fecha_inicio ?? null,
                'fecha_fin' => $request->fecha_fin ?? null,
                'fecha_limite_inscripcion' => $request->fecha_limite_inscripcion ?? null,
                'duracion' => $request->duracion ?? null,
                'id_modalidad' => $request->id_modalidad ?? null,
                'nombreInstructor' => $request->nombreInstructor ?? null,
                'estado_id' => 2,
            ];

            $curso = $this->cursoRepository->crearCurso($data);

            DB::commit();

            return $curso->load('modalidad');

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Actualizar curso con detección de cambios críticos
     */
    public function actualizarCurso($request, $idCurso)
    {
        DB::beginTransaction();

        try {
            $curso = $this->cursoRepository->obtenerCursoPorId($idCurso);

            if (!$curso) {
                throw new \Exception('Curso no encontrado.');
            }

            // Datos actuales (antes de cambios)
            $datosOriginales = $curso->only([
                'titulo',
                'fecha_inicio',
                'fecha_fin',
                'fecha_limite_inscripcion',
                'duracion',
                'id_modalidad',
                'nombreInstructor',
            ]);

            // Datos nuevos
            $datosNuevos = [
                'titulo' => $request->input('titulo'),
                'descripcion' => $request->input('descripcion'),
                'fecha_inicio' => $request->input('fecha_inicio'),
                'fecha_fin' => $request->input('fecha_fin'),
                'fecha_limite_inscripcion' => $request->input('fecha_limite_inscripcion'),
                'duracion' => $request->input('duracion'),
                'id_modalidad' => $request->input('id_modalidad'),
                'nombreInstructor' => $request->input('nombreInstructor'),
            ];

            // Detectar cambios críticos
            $cambiosCriticos = [];

            foreach ($datosOriginales as $campo => $valorOriginal) {
                if (
                    array_key_exists($campo, $datosNuevos) &&
                    $datosNuevos[$campo] != $valorOriginal
                ) {
                    $cambiosCriticos[$campo] = $datosNuevos[$campo];
                }
            }

            // 4️⃣ ACTUALIZAR CURSO PRIMERO
            $this->cursoRepository->actualizarCurso($curso, $datosNuevos);

            // 🔄 Refrescar el modelo con datos nuevos
            $curso->refresh();

            // Obtener inscritos
            $inscritos = $this->cursoRepository->obtenerInscritosCurso($idCurso);

            // Disparar correos si hay cambios críticos
            if (!empty($cambiosCriticos) && $inscritos->count() > 0) {
                foreach ($inscritos as $inscrito) {
                    Mail::to($inscrito->correo)->send(
                        new CursoActualizadoMail($curso, $cambiosCriticos)
                    );
                }
            }

            // Actualizar curso
            

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Publicar curso (Borrador → Publicado)
     */
    public function publicarCurso(int $idCurso)
    {
        $curso = $this->cursoRepository->obtenerCursoPorId($idCurso);

        if (!$curso) {
            throw new \Exception('Curso no encontrado.');
        }

        if ($curso->estado_id === 1) {
            throw new \Exception('El curso ya se encuentra publicado.');
        }

        $faltantes = [];

        if (!$curso->titulo) $faltantes[] = 'Título';
        if (!$curso->descripcion) $faltantes[] = 'Descripción';
        if (!$curso->id_modalidad) $faltantes[] = 'Modalidad';
        if (!$curso->fecha_inicio) $faltantes[] = 'Fecha de inicio';
        if (!$curso->fecha_limite_inscripcion) $faltantes[] = 'Fecha límite de inscripción';
        if (!$curso->nombreInstructor) $faltantes[] = 'Instructor';

        if (!empty($faltantes)) {
            throw new \DomainException(
                'No se puede publicar el curso. Faltan los siguientes campos obligatorios: '
                . implode(', ', $faltantes)
            );
        }

        $this->cursoRepository->publicarCurso($curso);
    }

    public function editarCurso(int $idCurso, array $data)
    {
        DB::beginTransaction();

        try {
            $curso = $this->cursoRepository->obtenerCursoPorId($idCurso);

            if (!$curso) {
                throw new \Exception('Curso no encontrado.');
            }

            $this->cursoRepository->actualizarCurso($curso, $data);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Eliminar curso con notificación
     */
    public function eliminarCurso($idCurso, ?string $motivo = null)
    {
        DB::beginTransaction();

        try {
            $curso = $this->cursoRepository->obtenerCursoPorId($idCurso);

            if (!$curso) {
                throw new \Exception('Curso no encontrado.');
            }

            // 📌 Extraer datos necesarios ANTES de eliminar
            $cursoData = [
                'titulo' => $curso->titulo,
            ];

            $inscritos = $this->cursoRepository->obtenerInscritosCurso($idCurso);

            foreach ($inscritos as $inscrito) {
                Mail::to($inscrito->correo)->send(
                    new CursoCanceladoMail(
                        $curso->toArray(),
                        $motivo
                    )
                );
            }

            $this->cursoRepository->eliminarCurso($curso);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

// Método para generar PDF de inscritos o asistencias
    public function generarPdfCurso(int $idCurso, string $tipo)
{
    $curso = $this->cursoRepository->obtenerCursoPorId($idCurso);

    if (!$curso) {
        throw new \Exception('Curso no encontrado.');
    }

    $inscritos = $this->cursoRepository->obtenerInscritosCurso($idCurso);

    if ($tipo === 'participantes') {
        $pdf = Pdf::loadView('pdf.curso-inscritos', [
            'curso' => $curso,
            'inscritos' => $inscritos,
        ]);

        return $pdf->download('Participantes_'.$curso->titulo.'.pdf');
    }

    if ($tipo === 'asistencia') {
        $pdf = Pdf::loadView('pdf.curso-asistencia', [
            'curso' => $curso,
            'inscritos' => $inscritos,
        ]);

        return $pdf->download('Asistencia_'.$curso->titulo.'.pdf');
    }

    throw new \Exception('Tipo de PDF inválido.');
}

public function eliminarInscripcionCurso(int $idCurso, int $idUsuario): void
{
    DB::beginTransaction();

    try {
        $curso = $this->cursoRepository->obtenerCursoPorId($idCurso);

        if (!$curso) {
            throw new \Exception('Curso no encontrado.');
        }

        $eliminado = $this->cursoRepository->eliminarInscripcionCurso(
            $idCurso,
            $idUsuario
        );

        if (!$eliminado) {
            throw new \Exception('La inscripción no existe.');
        }

        DB::commit();

    } catch (\Exception $e) {
        DB::rollBack();
        throw $e;
    }
}

}
