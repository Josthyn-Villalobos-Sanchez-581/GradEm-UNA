<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Usuario;
//use Illuminate\Support\Facades\Storage;
use App\Models\PlataformaExterna;
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

        // Registrar en bitácora
        $descripcion = $nuevoEstado == 1
            ? "Cuenta activada para el usuario ID {$usuario->id_usuario}"
            : "Cuenta inactivada para el usuario ID {$usuario->id_usuario}";

        $this->registrarBitacora('usuarios', 'estado', $descripcion);

        return response()->json([
            'success' => true,
            'nuevo_estado' => $nuevoEstado,
            'message' => $nuevoEstado == 1
                ? 'La cuenta ha sido activada correctamente.'
                : 'La cuenta ha sido inactivada correctamente.',
        ]);
    }

    //prueba 2 para ver perfil 
  /*  public function ver($id)
    {
        $usuario = Usuario::with(['rol', 'universidad', 'carrera', 'curriculum'])
            ->findOrFail($id);*/


//prueba 2 para ver perfil 
public function ver($id)
{
    $authUser = Auth::user();

    $usuario = Usuario::with([
        'rol',
        'universidad',
        'carrera',
        'curriculum',
        'fotoPerfil',
    ])->findOrFail($id);

    // 🔒 Solo roles con permiso o si está viendo su propio perfil
    $rolesPermitidos = [
        'Super Usuario',
        'Administrador del Sistema',
        'Empresa',
    ];

    if ($authUser->id_usuario !== $usuario->id_usuario && !in_array($authUser->rol->nombre_rol, $rolesPermitidos)) {
        return response()->json([
            'error' => true,
            'titulo' => 'Acceso denegado',
            'mensaje' => 'No tiene permisos para ver el perfil de otro usuario.',
        ], 403);
    }

    // 🖼️ Ajustar rutas de archivos
    if ($usuario->curriculum && $usuario->curriculum->ruta_archivo_pdf) {
        $usuario->curriculum->ruta_archivo_pdf = asset('storage/' . ltrim($usuario->curriculum->ruta_archivo_pdf, '/'));
    }

    if ($usuario->fotoPerfil && $usuario->fotoPerfil->ruta_imagen) {
        $usuario->fotoPerfil->ruta_imagen = asset(ltrim($usuario->fotoPerfil->ruta_imagen, '/'));
    }

    // 🔗 Cargar plataformas externas
    $plataformas = PlataformaExterna::where('id_usuario', $usuario->id_usuario)->get();

    // 🔹 Render Inertia normal para todos los que sí pueden ver el perfil
    return Inertia::render('Usuarios/VerPerfil', [
        'usuario' => [
            ...$usuario->toArray(),
            'fotoPerfil' => $usuario->fotoPerfil ? $usuario->fotoPerfil->toArray() : null,
        ],
        'plataformas' => $plataformas,
        'userPermisos' => getUserPermisos(),
    ]);
}

/**
 * Registrar acción en la bitácora de cambios
 */
    private function registrarBitacora($tabla, $operacion, $descripcion)
    {
        DB::table('bitacora_cambios')->insert([
            'tabla_afectada' => $tabla,
            'operacion' => $operacion,
            'usuario_responsable' => Auth::id(),
            'descripcion_cambio' => $descripcion,
            'fecha_cambio' => now(),
        ]);
    }
}



