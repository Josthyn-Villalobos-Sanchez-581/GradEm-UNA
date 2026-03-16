<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\AdminRegistroService\AdminRegistroService;

class AdminRegistroController extends Controller
{
    private AdminRegistroService $service;

    public function __construct(AdminRegistroService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        return $this->service->listarUsuarios($request);
    }

    public function toggleEstado(int $id)
    {
        return $this->service->cambiarEstado(Auth::user(), $id);
    }

    public function store(Request $request)
    {
        return $this->service->crearUsuario($request);
    }

    public function edit(int $id)
    {
        return $this->service->editarUsuario(Auth::user(), $id);
    }

    public function actualizar(Request $request, int $id)
    {
        return $this->service->actualizarUsuario($request, $id);
    }

    public function destroy(int $id)
    {
        return $this->service->eliminarUsuario(Auth::user(), $id);
    }

    public function create()
    {
        return $this->service->mostrarFormularioCreacion(Auth::user());
    }
}
