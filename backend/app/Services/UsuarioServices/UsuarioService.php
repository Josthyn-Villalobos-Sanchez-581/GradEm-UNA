<?php

namespace App\Services\UsuarioServices;

use App\Repositories\UsuarioRepositories\UsuarioRepository;
use App\Models\Usuario;

class UsuarioService
{
    protected $usuarioRepository;

    public function __construct(UsuarioRepository $usuarioRepository)
    {
        $this->usuarioRepository = $usuarioRepository;
    }

    /**
     * Obtener todos los usuarios
     */
    public function obtenerListadoUsuarios()
    {
        return $this->usuarioRepository->obtenerTodos();
    }

    /**
     * Registrar un usuario
     */
    public function registrarUsuario($request)
    {
        $datos = $request->all();
        return $this->usuarioRepository->crearUsuario($datos);
    }

    /**
     * Obtener detalles de un usuario
     */
    public function obtenerUsuario(Usuario $usuario)
    {
        return $this->usuarioRepository->obtenerPorModelo($usuario);
    }

    /**
     * Actualizar usuario
     */
    public function actualizarUsuario($request, Usuario $usuario)
    {
        $datos = $request->all();
        return $this->usuarioRepository->actualizarUsuario($usuario, $datos);
    }

    /**
     * Eliminar usuario
     */
    public function eliminarUsuario(Usuario $usuario)
    {
        return $this->usuarioRepository->eliminarUsuario($usuario);
    }
}
