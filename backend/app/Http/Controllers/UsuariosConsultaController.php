<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Usuario;
//use Illuminate\Support\Facades\Storage;
class UsuariosConsultaController extends Controller
{
    public function index()
    {
        $usuario = Auth::user();

        // Obtener permisos del usuario autenticado
        $permisos = $usuario
            ? DB::table('roles_permisos')
                ->where('id_rol', $usuario->id_rol)
                ->pluck('id_permiso')
                ->toArray()
            : [];

        // Filtrar usuarios con rol "egresado" o "estudiante"
        $usuarios = Usuario::with(['rol', 'universidad', 'carrera'])
            ->whereHas('rol', function ($q) {
                $q->whereIn('nombre_rol', ['Estudiante', 'Egresado']);
            })
        ->get();

        return Inertia::render('Usuarios/PerfilesUsuarios', [
            'usuarios' => $usuarios,
            'userPermisos' => $permisos,
        ]);
    }

    public function toggleEstado($id)
    {
        $usuario = Usuario::findOrFail($id);

        // Cambiar estado: 1 = activo, 2 = inactivo
        $nuevoEstado = $usuario->estado_id == 1 ? 2 : 1;
        $usuario->estado_id = $nuevoEstado;
        $usuario->save();

        return response()->json([
            'success' => true,
            'nuevo_estado' => $nuevoEstado,
            'message' => $nuevoEstado == 1
                ? 'La cuenta ha sido activada correctamente.'
                : 'La cuenta ha sido inactivada correctamente.',
        ]);
    }


//prueba 2 para ver perfil 
public function ver($id)
{
    $usuario = Usuario::with([
        'rol',
        'universidad',
        'carrera',
        'curriculum',
        'fotoPerfil',
    ])->findOrFail($id);

    if ($usuario->curriculum && $usuario->curriculum->ruta_archivo_pdf) {
        $path = ltrim($usuario->curriculum->ruta_archivo_pdf, '/');
        $usuario->curriculum->ruta_archivo_pdf = asset($path);
    }

    if ($usuario->fotoPerfil && $usuario->fotoPerfil->ruta_imagen) {
        $path = ltrim($usuario->fotoPerfil->ruta_imagen, '/');
        $usuario->fotoPerfil->ruta_imagen = asset($path);
    }

    return Inertia::render('Usuarios/VerPerfil', [
        'usuario' => [
            ...$usuario->toArray(), // 👈 convierte el modelo y sus relaciones a array
            'fotoPerfil' => $usuario->fotoPerfil ? $usuario->fotoPerfil->toArray() : null,
        ],
        'userPermisos' => getUserPermisos(),
    ]);
}

}
