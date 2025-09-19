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
    // Nombres reales de roles que queremos mostrar (ajusta si cambian en la BD)
    $buscar = ['Administrador del Sistema', 'Dirección', 'Subdirección'];

    // Obtener los ids correspondientes de la tabla roles (dinámico, robusto)
    $roleIds = Rol::whereIn('nombre_rol', $buscar)->pluck('id_rol')->toArray();

    // Si no hay roles que coincidan, forzamos un array con 0 para no romper la consulta
    if (empty($roleIds)) {
        $roleIds = [0];
    }

    // Query: usuarios cuyo id_rol está dentro de los ids encontrados
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

    // Paginación: 15 por página
    $users = $query->paginate(15)->withQueryString();

    // Transformar colección para enviar campos simples al frontend
    $users->getCollection()->transform(function ($u) {
        return [
            'id' => $u->id_usuario,
            'nombre_completo' => $u->nombre_completo,
            'correo' => $u->correo,
            'identificacion' => $u->identificacion,
            'telefono' => $u->telefono,
            'rol' => $u->rol?->nombre_rol ?? null,
            'universidad' => $u->id_universidad ?? null,
            'carrera' => $u->id_carrera ?? null,
            'fecha_registro' => $u->fecha_registro ?? null,
        ];
    });

    // Permisos del usuario autenticado para el layout (si lo usas)
    $usuario = Auth::user();
    $userPermisos = DB::table('roles_permisos')
        ->where('id_rol', $usuario->id_rol)
        ->pluck('id_permiso')
        ->toArray();

    return Inertia::render('Usuarios/Index', [
        'users' => $users,
        'userPermisos' => $userPermisos,
        'flash' => session('success') ? ['success' => session('success')] : null,
    ]);
}


    /**
     * Store: crear un nuevo usuario administrador/dirección/subdirección.
     * Mantiene las validaciones del código anterior y mapea rol textual a id.
     */
    public function store(Request $request)
    {
        // Validación (nota: 'contrasena' usa 'confirmed' -> espera 'contrasena_confirmation')
        $validated = $request->validate([
            'nombre_completo' => 'required|string|max:100',
            'correo'          => 'required|email|max:100|unique:usuarios,correo',
            'identificacion'  => 'required|string|max:20|unique:usuarios,identificacion',
            'telefono'        => 'nullable|string|max:20',
            'rol'             => ['required','string', Rule::in(['Administrador','Dirección','Subdirección'])],
            'universidad'     => 'nullable|string|max:100',
            'carrera'         => 'nullable|string|max:100',
            'contrasena'      => 'required|string|min:8|confirmed',
        ]);

        Log::info('RegistroAdmin - datos recibidos', $validated);

        // Mapear el rol textual a id_rol. Si tu BD tiene otros ids, ajusta el mapping.
        // Alternativa: buscar en tabla roles por nombre_rol (más robusto) — lo hacemos abajo con fallback.
        $rolesMapStatic = [
            'Administrador' => 2,
            'Dirección'     => 3,
            'Subdirección'  => 4,
        ];

        DB::beginTransaction();
        try {
            // Intentar obtener id_rol buscando en la tabla roles por nombre (más seguro)
            $rolModel = Rol::where('nombre_rol', $validated['rol'])->first();
            if ($rolModel) {
                $rolId = $rolModel->id_rol;
            } else {
                // fallback al mapping estático (útil en entornos de dev)
                $rolId = $rolesMapStatic[$validated['rol']] ?? null;
            }

            if (!$rolId) {
                // Si no encontramos id_rol, no continuar
                return back()->withErrors(['rol' => 'No se pudo resolver el rol seleccionado.'])->withInput();
            }

            // universidad: buscar por nombre, si no existe crearla (dev)
            $idUniversidad = null;
            if (!empty($validated['universidad'])) {
                $idUniversidad = DB::table('universidades')
                    ->where('nombre', $validated['universidad'])
                    ->value('id_universidad');

                if (!$idUniversidad) {
                    $idUniversidad = DB::table('universidades')->insertGetId([
                        'nombre' => $validated['universidad'],
                        'sigla'  => substr($validated['universidad'], 0, 10),
                    ]);
                }
            }

            // carrera: buscar por nombre, si no existe crearla (dev)
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

            // Insertar usuario en tabla 'usuarios'
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

            // Insertar credencial con hash (tabla 'credenciales')
            DB::table('credenciales')->insert([
                'id_usuario'         => $usuarioId,
                'hash_contrasena'    => Hash::make($validated['contrasena']),
                'fecha_ultimo_login' => null,
                'intentos_fallidos'  => 0,
            ]);

            DB::commit();
            Log::info("RegistroAdmin - usuario creado", ['id_usuario' => $usuarioId]);

            // Respuestas: AJAX/JSON o redirect con flash
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Usuario registrado correctamente',
                    'id_usuario' => $usuarioId
                ], 200);
            }

            return redirect()->route('usuarios.index')->with('success', 'Usuario registrado correctamente');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('RegistroAdmin - error al crear usuario', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            // Puedes personalizar el manejo según entorno (dev/prod)
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al crear el usuario',
                    'error' => $e->getMessage()
                ], 500);
            }

            return back()->with('error', 'Ocurrió un error al crear el usuario.')->withInput();
        }
    }

// Mostrar formulario de edición
public function edit($id)
{
    $usuario = Usuario::with('rol')->findOrFail($id);

    // Normalizar el nombre del rol para que coincida con la validación
    $rolNombre = $usuario->rol?->nombre_rol ?? 'Administrador';

    // Mapeo de nombres reales en BD a los valores que espera Rule::in()
    $mapaRoles = [
        'Administrador del Sistema' => 'Administrador',
        'Administrador'             => 'Administrador',
        'Dirección'                  => 'Dirección',
        'Subdirección'               => 'Subdirección',
    ];

    // Si el rol en BD no está en el mapa, por defecto "Administrador"
    $rolNormalizado = $mapaRoles[$rolNombre] ?? 'Administrador';

    $usuarioData = [
        'id'              => $usuario->id_usuario,
        'nombre_completo' => $usuario->nombre_completo,
        'correo'          => $usuario->correo,
        'identificacion'  => $usuario->identificacion,
        'telefono'        => $usuario->telefono,
        'rol'             => $rolNormalizado,
        'universidad'     => $usuario->id_universidad
            ? DB::table('universidades')->where('id_universidad', $usuario->id_universidad)->value('nombre')
            : '',
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
// Actualizar usuario
public function actualizar(Request $request, $id)
{
    // Validación: igual que en store, pero unique ignora el usuario actual
    $validated = $request->validate([
        'nombre_completo' => 'required|string|max:100',
        'correo'          => 'required|email|max:100|unique:usuarios,correo,' . $id . ',id_usuario',
        'identificacion'  => 'required|string|max:20|unique:usuarios,identificacion,' . $id . ',id_usuario',
        'telefono'        => 'nullable|string|max:20',
        'rol'             => ['required','string', Rule::in(['Administrador del sistema','Dirección','Subdirección'])],
        'universidad'     => 'nullable|string|max:100',
        'carrera'         => 'nullable|string|max:100',
        'contrasena'      => 'nullable|string|min:8|confirmed', // opcional
    ]);

    DB::beginTransaction();
    try {
        // Mapear rol textual a id_rol
        $rolModel = Rol::where('nombre_rol', $validated['rol'])->first();
        $rolId = $rolModel?->id_rol ?? null;
        if (!$rolId) {
            return back()->withErrors(['rol' => 'No se pudo resolver el rol seleccionado.'])->withInput();
        }

        // Universidad: buscar o crear
        $idUniversidad = null;
        if (!empty($validated['universidad'])) {
            $idUniversidad = DB::table('universidades')
                ->where('nombre', $validated['universidad'])
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
    DB::beginTransaction();
    try {
        // Eliminar credenciales primero (si existe relación)
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
