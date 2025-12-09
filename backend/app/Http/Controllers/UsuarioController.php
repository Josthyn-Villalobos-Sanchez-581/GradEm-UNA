<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use App\Services\UsuarioServices\UsuarioService;

class UsuarioController extends Controller
{
    protected $usuarioService;

    public function __construct(UsuarioService $usuarioService)
    {
        $this->usuarioService = $usuarioService;
    }

    public function index()
    {
        $usuarios = $this->usuarioService->obtenerListadoUsuarios();
        return inertia('Usuario/Index', compact('usuarios'));
    }

    public function create()
    {
        return inertia('Usuario/Create');
    }

    public function store(Request $request)
    {
        $this->usuarioService->registrarUsuario($request);
        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario registrado correctamente.');
    }

    public function show(Usuario $usuario)
    {
        $usuarioDetalles = $this->usuarioService->obtenerUsuario($usuario);
        return inertia('Usuario/Show', compact('usuarioDetalles'));
    }

    public function edit(Usuario $usuario)
    {
        $usuarioDetalles = $this->usuarioService->obtenerUsuario($usuario);
        return inertia('Usuario/Edit', compact('usuarioDetalles'));
    }

    public function update(Request $request, Usuario $usuario)
    {
        $this->usuarioService->actualizarUsuario($request, $usuario);
        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(Usuario $usuario)
    {
        $this->usuarioService->eliminarUsuario($usuario);
        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario eliminado correctamente.');
    }
}
