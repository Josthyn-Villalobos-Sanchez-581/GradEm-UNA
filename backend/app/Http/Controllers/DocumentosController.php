<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DocumentosController extends Controller
{
    public function index()
    {
        $usuario = Auth::user();

        // Obtener permisos
        $permisos = $usuario
            ? DB::table('roles_permisos')
                ->where('id_rol', $usuario->id_rol)
                ->pluck('id_permiso')
                ->toArray()
            : [];

        return Inertia::render('Documentos/Index', [
            'userPermisos' => $permisos,
        ]);
    }
}
