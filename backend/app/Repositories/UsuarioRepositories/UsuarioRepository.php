<?php

namespace App\Repositories\UsuarioRepositories;

use App\Models\Usuario;

class UsuarioRepository
{
    /**
     * Obtener todos los usuarios
     */
    public function obtenerTodos()
    {
        return Usuario::all();
    }

    /**
     * Crear un nuevo usuario
     */
    public function crearUsuario(array $datos)
    {
        return Usuario::create($datos);
    }

    /**
     * Obtener un usuario por su instancia (Eloquent)
     */
    public function obtenerPorModelo(Usuario $usuario)
    {
        return $usuario->load([
            'fotoPerfil',
            'rol',
            'empresa',
            'universidad',
            'carrera',
            'areaLaboral',
            'canton',
        ]);
    }

    /**
     * Actualizar un usuario
     */
    public function actualizarUsuario(Usuario $usuario, array $datos)
    {
        $usuario->update($datos);
        return $usuario;
    }

    /**
     * Eliminar un usuario
     */
    public function eliminarUsuario(Usuario $usuario)
    {
        return $usuario->delete();
    }
}
