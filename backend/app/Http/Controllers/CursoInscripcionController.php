<?php

namespace App\Http\Controllers;

use App\Services\CursoServices\CursoInscripcionViewService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CursoInscripcionController extends Controller
{
    protected CursoInscripcionViewService $service;

    public function __construct(CursoInscripcionViewService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $usuario = Auth::user();

        $permisos = $usuario
            ? DB::table('roles_permisos')
                ->where('id_rol', $usuario->id_rol)
                ->pluck('id_permiso')
                ->toArray()
            : [];

        return Inertia::render('Cursos/Inscripcion', [
            'cursos' => $this->service->obtenerCursosParaInscripcion($request, $usuario),
            'modalidades' => $this->service->obtenerModalidades(),
            'userPermisos' => $permisos,
            'misInscripciones' => $usuario
                ? $this->service->obtenerMisInscripciones($usuario->id_usuario)
                : [],
            'inscritosCount' => $this->service->obtenerInscritosCount(),
        ]);
    }
}
