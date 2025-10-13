<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Usuario;
//use Illuminate\Support\Facades\Storage;
use App\Models\PlataformaExterna;
use Illuminate\Support\Facades\Log; // 👈 aquí
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

        // 🔹 Cargar usuarios junto con empresa
        $usuarios = Usuario::with(['rol', 'universidad', 'carrera', 'empresa'])
            ->whereHas('rol', function ($q) {
                $q->whereIn('nombre_rol', ['Estudiante', 'Egresado', 'Empresa']);
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
        'empresa'
    ])
    ->leftJoin('areas_laborales', 'usuarios.area_laboral_id', '=', 'areas_laborales.id_area_laboral')
    ->select('usuarios.*', 'areas_laborales.nombre as nombre_area_laboral')
    ->where('usuarios.id_usuario', $id)
    ->firstOrFail();

    // 🔒 Verificar acceso
    $rolAuth = strtolower($authUser->rol->nombre_rol ?? '');
    $rolUsuarioVer = strtolower($usuario->rol->nombre_rol ?? '');
    $estadoEstudios = strtolower($authUser->estado_estudios ?? '');

    // Estados válidos para considerar estudiante/egresado
    $estadosEstudiosPermitidos = ['estudiante', 'egresado', 'activo', 'pausado', 'finalizado'];

    Log::info('Verificación de permiso', [
        'authUser_id' => $authUser->id_usuario,
        'rolAuth' => $rolAuth,
        'estadoEstudios' => $estadoEstudios,
        'usuarioVer_id' => $usuario->id_usuario,
        'rolUsuarioVer' => $rolUsuarioVer,
    ]);

    // 🖼 Ajustar rutas de archivos
    if ($usuario->curriculum && $usuario->curriculum->ruta_archivo_pdf) {
        $usuario->curriculum->ruta_archivo_pdf = asset('storage/' . ltrim($usuario->curriculum->ruta_archivo_pdf, '/'));
    }

    if ($usuario->fotoPerfil && $usuario->fotoPerfil->ruta_imagen) {
        $usuario->fotoPerfil->ruta_imagen = asset(ltrim($usuario->fotoPerfil->ruta_imagen, '/'));
    }

    // 🔗 Plataformas externas
    $plataformas = PlataformaExterna::where('id_usuario', $usuario->id_usuario)->get();

    return Inertia::render('Usuarios/VerPerfil', [
        'usuario' => [
            ...$usuario->toArray(),
            'fotoPerfil' => $usuario->fotoPerfil ? $usuario->fotoPerfil->toArray() : null,
            'areaLaboral' => [
                'nombre_area' => $usuario->nombre_area_laboral ?? null,
            ],
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



