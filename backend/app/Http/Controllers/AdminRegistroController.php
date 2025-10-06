<?php
// backend/app/Http/Controllers/AdminRegistroController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

use App\Models\Usuario;
use App\Models\Rol;

class AdminRegistroController extends Controller
{
    /**
     * Mostrar listado de usuarios (Administradores / Dirección / Subdirección).
     * Devuelve paginador compatible con el Index.tsx frontend.
     */
   public function index(Request $request)
{
    $buscarRoles = ['Administrador del Sistema', 'Dirección', 'Subdirección'];

    $roleIds = Rol::whereIn('nombre_rol', $buscarRoles)->pluck('id_rol')->toArray();
    if (empty($roleIds)) $roleIds = [0];

    $query = Usuario::with('rol')
        ->whereIn('id_rol', $roleIds)
        ->select([
            'id_usuario',
            'nombre_completo',
            'correo',
            'identificacion',
            'telefono',
            'id_rol',
            'id_universidad',
            'id_carrera',
            'fecha_registro'
        ])
        ->orderByDesc('fecha_registro');

    // 🔎 Filtrar por nombre o cédula
    if ($request->filled('search')) {
        $search = $request->input('search');
        $query->where(function($q) use ($search) {
            $q->where('nombre_completo', 'like', "%{$search}%")
              ->orWhere('identificacion', 'like', "%{$search}%");
        });
    }

    $users = $query->paginate(5)->withQueryString(); // backend pagination

    // Transformar resultados para frontend
    $users->getCollection()->transform(function ($u) {
        $uni = $u->id_universidad
            ? DB::table('universidades')->where('id_universidad', $u->id_universidad)->first()
            : null;

        $carrera = $u->id_carrera
            ? DB::table('carreras')->where('id_carrera', $u->id_carrera)->value('nombre')
            : null;

        return [
            'id' => $u->id_usuario,
            'nombre_completo' => $u->nombre_completo,
            'correo' => $u->correo,
            'identificacion' => $u->identificacion,
            'telefono' => $u->telefono,
            'rol' => $u->rol?->nombre_rol ?? null,
            'universidad' => $uni?->sigla ?? $uni?->nombre ?? null,
            'carrera' => $carrera ? $this->shortCarreraName($carrera) : null,
            'fecha_registro' => $u->fecha_registro ?? null,
        ];
    });

    $flashSuccess = session()->pull('success');

    $usuario = Auth::user();
    $userPermisos = DB::table('roles_permisos')
        ->where('id_rol', $usuario->id_rol)
        ->pluck('id_permiso')
        ->toArray();

    return Inertia::render('Usuarios/Index', [
        'users' => $users,
        'userPermisos' => $userPermisos,
        'flash' => $flashSuccess ? ['success' => $flashSuccess] : null,
        'filters' => ['search' => $request->input('search')],
    ]);
}
    /**
     * Helper para acortar nombres de carrera.
     */
    private function shortCarreraName(string $nombre): string
    {
        return match ($nombre) {
            'Ingeniería en Sistemas' => 'Ing. Sistemas',
            default => $nombre,
        };
    }



    /**
     * Store: crear un nuevo usuario administrador/dirección/subdirección.
     * Mantiene las validaciones del código anterior y mapea rol textual a id.
     */
   public function store(Request $request)
{
    $validated = $request->validate([
        'nombre_completo' => 'required|string|max:100',
        'correo'          => 'required|email|max:100|unique:usuarios,correo',
        'identificacion'  => 'required|string|max:20|unique:usuarios,identificacion',
        'telefono'        => 'nullable|string|max:20',
        'rol'             => ['required','string', Rule::in(['Administrador del Sistema','Dirección','Subdirección'])],
        'universidad'     => 'nullable|string|max:100',
        'carrera'         => 'nullable|string|max:100',
        'contrasena'      => 'required|string|min:8|confirmed',
    ]);

    Log::info('RegistroAdmin - datos recibidos', $validated);

    DB::beginTransaction();
    try {
        // Resolver rol (tabla roles)
        $rolModel = Rol::where('nombre_rol', $validated['rol'])->first();
        $rolId = $rolModel?->id_rol ?? null;

        // fallback a mapping estático si no lo encontró
        if (!$rolId) {
            $rolesMapStatic = [
                'Administrador' => 2,
                'Dirección'     => 3,
                'Subdirección'  => 4,
            ];
            $rolId = $rolesMapStatic[$validated['rol']] ?? null;
        }

        if (!$rolId) {
            return back()->withErrors(['rol' => 'No se pudo resolver el rol seleccionado.'])->withInput();
        }

        // Universidad (buscar o crear)
        $idUniversidad = null;
        if (!empty($validated['universidad'])) {
            $idUniversidad = DB::table('universidades')->where('nombre', $validated['universidad'])->value('id_universidad');
            if (!$idUniversidad) {
                $idUniversidad = DB::table('universidades')->insertGetId([
                    'nombre' => $validated['universidad'],
                    'sigla'  => substr($validated['universidad'], 0, 10),
                ]);
            }
        }

        // Carrera (buscar o crear)
        $idCarrera = null;
        if (!empty($validated['carrera'])) {
            $idCarrera = DB::table('carreras')->where('nombre', $validated['carrera'])->value('id_carrera');
            if (!$idCarrera) {
                $idCarrera = DB::table('carreras')->insertGetId([
                    'nombre'         => $validated['carrera'],
                    'id_universidad' => $idUniversidad,
                ]);
            }
        }

        // Insertar usuario
        $usuarioId = DB::table('usuarios')->insertGetId([
            'nombre_completo' => $validated['nombre_completo'],
            'correo'          => $validated['correo'],
            'identificacion'  => $validated['identificacion'],
            'telefono'        => $validated['telefono'] ?? null,
            'id_rol'          => $rolId,
            'id_universidad'  => $idUniversidad,
            'id_carrera'      => $idCarrera,
            'fecha_registro'  => now(),
            'estado_id'       => 1,
        ]);

        // Insertar credencial
        DB::table('credenciales')->insert([
            'id_usuario'       => $usuarioId,
            'hash_contrasena'  => Hash::make($validated['contrasena']),
            'fecha_ultimo_login' => null,
            'intentos_fallidos'  => 0,
        ]);

        DB::commit();
        Log::info("RegistroAdmin - usuario creado", ['id_usuario' => $usuarioId]);

        // <-- Aquí: redirigir siempre a la lista (Inertia seguirá la redirección)
        return redirect()->route('usuarios.index')->with('success', 'Usuario registrado correctamente');
    } catch (\Throwable $e) {
        DB::rollBack();
        Log::error('RegistroAdmin - error al crear usuario', ['error' => $e->getMessage()]);

        return back()->with('error', 'Ocurrió un error al crear el usuario.')->withInput();
    }
}


// Mostrar formulario de edición
public function edit($id)
{
    $usuario = Usuario::with('rol')->findOrFail($id);

    // Normalizar el nombre del rol para que coincida con la validación
    $rolNombre = $usuario->rol?->nombre_rol ?? 'Administrador del Sistema';

    // Si el rol en BD no está en el mapa, por defecto "Administrador del Sistema"
    $rolNormalizado = $rolNombre;

    // Obtener universidad con sigla si existe
    $uni = $usuario->id_universidad
        ? DB::table('universidades')->where('id_universidad', $usuario->id_universidad)->first()
        : null;

    $usuarioData = [
        'id'              => $usuario->id_usuario,
        'nombre_completo' => $usuario->nombre_completo,
        'correo'          => $usuario->correo,
        'identificacion'  => $usuario->identificacion,
        'telefono'        => $usuario->telefono,
        'rol'             => $rolNormalizado,
        'universidad'     => $uni?->sigla ?? $uni?->nombre ?? '',
        'carrera'         => $usuario->id_carrera
            ? DB::table('carreras')->where('id_carrera', $usuario->id_carrera)->value('nombre')
            : '',
    ];

    $userPermisos = DB::table('roles_permisos')
        ->where('id_rol', Auth::user()->id_rol)
        ->pluck('id_permiso')
        ->toArray();

    return Inertia::render('Usuarios/ActualizarAdmin', [
        'usuario'      => $usuarioData,
        'userPermisos' => $userPermisos,
    ]);
}

public function actualizar(Request $request, $id)
{
    $validated = $request->validate([
        'nombre_completo' => 'required|string|max:100',
        'correo'          => 'required|email|max:100|unique:usuarios,correo,' . $id . ',id_usuario',
        'identificacion'  => 'required|string|max:20|unique:usuarios,identificacion,' . $id . ',id_usuario',
        'telefono'        => 'nullable|string|max:20',
        'rol'             => ['required','string', Rule::in(['Administrador del Sistema','Dirección','Subdirección'])],
        'universidad'     => 'nullable|string|max:100',
        'carrera'         => 'nullable|string|max:100',
        'contrasena'      => 'nullable|string|min:8|confirmed',
    ]);

    DB::beginTransaction();
    try {
        // Mapear rol textual a id_rol
        $rolModel = Rol::where('nombre_rol', $validated['rol'])->first();
        $rolId = $rolModel?->id_rol ?? null;
        if (!$rolId) {
            return back()->withErrors(['rol' => 'No se pudo resolver el rol seleccionado.'])->withInput();
        }

        // Universidad: buscar por nombre o sigla, o crear
        $idUniversidad = null;
        if (!empty($validated['universidad'])) {
            $idUniversidad = DB::table('universidades')
                ->where('nombre', $validated['universidad'])
                ->orWhere('sigla', $validated['universidad'])
                ->value('id_universidad');

            if (!$idUniversidad) {
                $idUniversidad = DB::table('universidades')->insertGetId([
                    'nombre' => $validated['universidad'],
                    'sigla'  => substr($validated['universidad'], 0, 10),
                ]);
            }
        }

        // Carrera: buscar o crear
        $idCarrera = null;
        if (!empty($validated['carrera'])) {
            $idCarrera = DB::table('carreras')
                ->where('nombre', $validated['carrera'])
                ->value('id_carrera');

            if (!$idCarrera) {
                $idCarrera = DB::table('carreras')->insertGetId([
                    'nombre'         => $validated['carrera'],
                    'id_universidad' => $idUniversidad,
                ]);
            }
        }

        // Actualizar datos del usuario
        DB::table('usuarios')
            ->where('id_usuario', $id)
            ->update([
                'nombre_completo' => $validated['nombre_completo'],
                'correo'          => $validated['correo'],
                'identificacion'  => $validated['identificacion'],
                'telefono'        => $validated['telefono'] ?? null,
                'id_rol'          => $rolId,
                'id_universidad'  => $idUniversidad,
                'id_carrera'      => $idCarrera,
            ]);

        // Actualizar contraseña solo si se envió
        if (!empty($validated['contrasena'])) {
            DB::table('credenciales')
                ->where('id_usuario', $id)
                ->update([
                    'hash_contrasena'     => Hash::make($validated['contrasena']),
                    'fecha_ultimo_cambio' => now(),
                ]);
        }

        DB::commit();
        return redirect()->route('usuarios.index')->with('success', 'Usuario actualizado correctamente');
    } catch (\Throwable $e) {
        DB::rollBack();
        Log::error('Error al actualizar usuario', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return back()->with('error', 'Ocurrió un error al actualizar el usuario.')->withInput();
    }
}

// Eliminar administrador/dirección/subdirección
public function destroy($id)
{
    $usuarioActual = Auth::user();

    // Verificar si el usuario autenticado tiene rol "Administrador del Sistema"
    if ($usuarioActual->rol?->nombre_rol !== 'Administrador del Sistema') {
        return redirect()->route('usuarios.index')
            ->with('error', 'No tiene permisos para eliminar usuarios.');
    }

    DB::beginTransaction();
    try {
        // Eliminar credenciales primero
        DB::table('credenciales')->where('id_usuario', $id)->delete();

        // Eliminar usuario
        DB::table('usuarios')->where('id_usuario', $id)->delete();

        DB::commit();

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario eliminado correctamente');
    } catch (\Throwable $e) {
        DB::rollBack();
        Log::error('Error al eliminar usuario', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return back()->with('error', 'Ocurrió un error al eliminar el usuario.');
    }
}

public function create()
{
    $usuario = Auth::user();

    $userPermisos = DB::table('roles_permisos')
        ->where('id_rol', $usuario->id_rol)
        ->pluck('id_permiso')
        ->toArray();

    return Inertia::render('Usuarios/CrearAdmin', [
        'userPermisos' => $userPermisos,
    ]);
}

}
