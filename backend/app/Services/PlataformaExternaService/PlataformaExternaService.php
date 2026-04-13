<?php
//backend/app/Services/PlataformaExternaService/PlataformaExternaService.php
namespace App\Services\PlataformaExternaService;
use App\Repositories\PlataformaExternaRepository\PlataformaExternaRepository;
use App\Models\Usuario;
use Symfony\Component\HttpFoundation\Response;

class PlataformaExternaService
{
    private PlataformaExternaRepository $repository;

    public function __construct(PlataformaExternaRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Agregar plataforma externa
     */
    public function agregarPlataforma(Usuario $usuario, array $datos)
    {
        $this->validarPermisos($usuario);

        $this->repository->crear([
            'id_usuario' => $usuario->id_usuario,
            'tipo'       => $datos['tipo'],
            'url'        => $datos['url'],
        ]);

        return response()->json([
            'success' => true,
            'mensaje' => 'Enlace agregado correctamente.',
            'plataformas' => $this->repository->obtenerPorUsuario($usuario->id_usuario),
        ],201);
    }

    /**
     * Eliminar plataforma externa
     */
    public function eliminarPlataforma(Usuario $usuario, int $idPlataforma)
    {
        $plataforma = $this->repository->obtenerPorId($idPlataforma);

        if ($plataforma->id_usuario !== $usuario->id_usuario) {
            return response()->json([
                'error' => 'No tiene permiso para eliminar este enlace.'
            ], Response::HTTP_FORBIDDEN);
        }

        $this->repository->eliminar($plataforma);

        return response()->json([
            'success' => true,
            'mensaje' => 'Enlace eliminado correctamente.',
            'plataformas' => $this->repository->obtenerPorUsuario($usuario->id_usuario),
        ]);
    }

    /**
     * Validaciones de negocio
     */
    private function validarPermisos(Usuario $usuario): void
    {
        $estatus = strtolower($usuario->estado_estudios ?? '');
        $rol = strtolower($usuario->rol->nombre_rol ?? '');

        $permitidos = ['estudiante', 'egresado', 'activo', 'pausado', 'finalizado'];

        if (!in_array($estatus, $permitidos) && $rol !== 'empresa') {
            abort(Response::HTTP_FORBIDDEN,
                'Solo estudiantes, egresados o empresas pueden agregar enlaces.'
            );
        }
    }
}
