<?php

namespace App\Services\InscripcionCursoServices;

use App\Repositories\InscripcionCursoRepositories\InscripcionCursoRepository;
use App\Mail\InscripcionConfirmadaMail;
use App\Models\Usuario;
use Illuminate\Support\Facades\Mail;

class InscripcionCursoService
{
    protected InscripcionCursoRepository $repo;

    public function __construct(InscripcionCursoRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * Inscribir a un usuario en un curso.
     *
     * @throws \DomainException  con mensaje legible para el frontend
     */
    public function inscribir(int $idCurso, int $idUsuario): void
    {
        // 1️⃣ Obtener el curso con su modalidad
        $curso = $this->repo->obtenerCursoConModalidad($idCurso);

        if (!$curso) {
            throw new \DomainException('El curso solicitado no existe.');
        }

        // 2️⃣ Verificar que el curso esté publicado (estado_id = 1)
        if ($curso->estado_id !== 1) {
            throw new \DomainException('Este curso no está disponible para inscripciones.');
        }

        // 3️⃣ Verificar que la fecha límite de inscripción no haya pasado
        if ($curso->fecha_limite_inscripcion) {
            $limite = \Carbon\Carbon::parse($curso->fecha_limite_inscripcion)->endOfDay();
            if (now()->greaterThan($limite)) {
                throw new \DomainException('El plazo de inscripción para este curso ha vencido.');
            }
        }

        // 4️⃣ Verificar inscripción única (el usuario no puede inscribirse dos veces)
        if ($this->repo->existeInscripcion($idCurso, $idUsuario)) {
            throw new \DomainException('Ya se encuentra inscrito/a en este curso.');
        }

        // 5️⃣ Verificar cupos disponibles (si el curso tiene cupos definidos)
        if (!is_null($curso->cupos)) {
            $inscritos = $this->repo->contarInscritos($idCurso);
            if ($inscritos >= $curso->cupos) {
                throw new \DomainException('No hay cupos disponibles en este curso.');
            }
        }

        // 6️⃣ Registrar la inscripción
        $this->repo->inscribir($idCurso, $idUsuario);

        // 7️⃣ Enviar correo de confirmación al participante
        $usuario = Usuario::find($idUsuario);
        if ($usuario && $usuario->correo) {
            Mail::to($usuario->correo)->send(
                new InscripcionConfirmadaMail($curso, $usuario->nombre_completo)
            );
        }
    }

    /**
     * Verificar si un usuario está inscrito en un curso.
     */
    public function estaInscrito(int $idCurso, int $idUsuario): bool
    {
        return $this->repo->existeInscripcion($idCurso, $idUsuario);
    }

    /**
     * Retorna cupos disponibles o null si no aplica.
     */
    public function cuposDisponibles(int $idCurso): ?int
    {
        $curso = $this->repo->obtenerCursoConModalidad($idCurso);
        if (!$curso || is_null($curso->cupos)) {
            return null;
        }
        $inscritos = $this->repo->contarInscritos($idCurso);
        return max(0, $curso->cupos - $inscritos);
    }
}
