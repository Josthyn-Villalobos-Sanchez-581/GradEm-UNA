<?php
//backend/app/Services/AdminRegistroService/AdminRegistroService.php
namespace App\Services\AdminRegistroService;

use App\Repositories\AdminRegistroRepository\AdminRegistroRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class AdminRegistroService
{
    protected AdminRegistroRepository $repository;

    public function __construct(AdminRegistroRepository $repository)
    {
        $this->repository = $repository;
    }

    /* ================= LISTADO ================= */

    public function listarUsuarios(Request $request)
    {
        $users = $this->repository->obtenerUsuariosAdmin($request->input('search'));
        $flash = session()->pull('success');

        return Inertia::render('Usuarios/Index', [
            'users' => $users,
            'userPermisos' => $this->repository->obtenerPermisos(Auth::user()->id_rol),
            'flash' => $flash ? ['success' => $flash] : null,
            'filters' => ['search' => $request->input('search')],
        ]);
    }

    /* ================= ESTADO ================= */

    public function cambiarEstado($usuarioActual, int $id)
    {
        if (!in_array($usuarioActual->id_rol, [1, 2])) {
            return response()->json(['message' => 'No tiene permisos'], 403);
        }
        if ($usuarioActual->id_usuario == $id) {
            return response()->json([
                'status' => 'error',
                'message' => 'No puedes desactivar tu propia cuenta'
            ], 403);
        }
        $usuario = $this->repository->obtenerUsuario($id);
        $nuevoEstado = $usuario->estado_id === 1 ? 0 : 1;

        $this->repository->actualizarEstado($id, $nuevoEstado);

        $accion = $nuevoEstado ? 'activada' : 'inactivada';

        $this->repository->registrarBitacora(
            'usuarios',
            'estado',
            'Cuenta ' . $accion . ' para ' .
                $usuario->nombre_completo .
                ' (ID ' . $usuario->id_usuario . ')',
            $usuarioActual->id_usuario
        );

        return redirect()->route('usuarios.index')
            ->with('success', $nuevoEstado ? 'Usuario activado' : 'Usuario inactivado');
    }

    /* ================= CREAR ================= */

    public function crearUsuario(Request $request)
    {
        $validated = $this->validarDatos($request);

        DB::beginTransaction();
        try {
            $usuarioId = $this->repository->crearUsuarioCompleto($validated);

            DB::commit();

            $this->repository->registrarBitacora(
                'usuarios',
                'crear',
                'Usuario creado: ' . $validated['nombre_completo'] . ' (ID ' . $usuarioId . ')',
                Auth::user()->id_usuario
            );

            return redirect()->route('usuarios.index');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e->getMessage());
            return back()->with('error', 'Error al crear usuario')->withInput();
        }
    }

    /* ================= EDITAR ================= */

    public function editarUsuario($usuarioActual, int $id)
    {
        return Inertia::render('Usuarios/ActualizarAdmin', [
            'usuario' => $this->repository->obtenerUsuarioConDatos($id),
            'userPermisos' => $this->repository->obtenerPermisos($usuarioActual->id_rol),
        ]);
    }

    /* ================= ACTUALIZAR ================= */

    public function actualizarUsuario(Request $request, int $id)
    {
        $validated = $this->validarDatos($request, $id);

        DB::beginTransaction();
        try {
            $this->repository->actualizarUsuarioCompleto($id, $validated);

            DB::commit();

            $usuarioAnterior = $this->repository->obtenerUsuario($id);

            $this->repository->registrarBitacora(
                'usuarios',
                'actualizar',
                'Usuario actualizado: ' .
                    $usuarioAnterior->nombre_completo .
                    ' (ID ' . $id . ')',
                Auth::user()->id_usuario
            );

            return redirect()->route('usuarios.index');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e->getMessage());
            return back()->with('error', 'Error al actualizar usuario')->withInput();
        }
    }

    /* ================= ELIMINAR ================= */

    public function eliminarUsuario($usuarioActual, int $id)
    {
        if (!in_array($usuarioActual->id_rol, [1, 2])) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para eliminar usuarios.'
            ], 403);
        }

        if ($usuarioActual->id_usuario == $id) {
            return response()->json([
                'success' => false,
                'message' => 'No puedes eliminar tu propia cuenta.'
            ], 403);
        }

        try {

            // 🔍 Obtener usuario ANTES de eliminar
            $usuario = $this->repository->obtenerUsuario($id);

            if (!$usuario) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado.'
                ], 404);
            }

            // 🗑️ Eliminar usuario
            $this->repository->eliminarUsuario($id);

            // 📝 Registrar bitácora
            $this->repository->registrarBitacora(
                'usuarios',
                'eliminar',
                'Usuario eliminado: ' .
                    $usuario->nombre_completo .
                    ' (ID ' . $usuario->id_usuario . ')',
                $usuarioActual->id_usuario
            );

            return response()->json([
                'success' => true,
                'message' => 'Usuario eliminado correctamente.'
            ]);
        } catch (\Throwable $e) {

            $mensaje = $e->getMessage();

            if (
                str_contains($mensaje, 'Integrity constraint') ||
                str_contains($mensaje, 'foreign key')
            ) {

                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar porque el usuario tiene registros en la bitácora'
                ], 500);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el usuario.',
                'error' => $mensaje // opcional para debug
            ], 500);
        }
    }
    /* ================= FORM ================= */

    public function mostrarFormularioCreacion($usuario)
    {
        return Inertia::render('Usuarios/CrearAdmin', [
            'userPermisos' => $this->repository->obtenerPermisos($usuario->id_rol),
        ]);
    }

    /* ================= VALIDACIONES ================= */

    private function validarDatos(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'nombre_completo' => 'required|string|max:100',
            'correo' => 'required|email|max:100|unique:usuarios,correo,' . $id . ',id_usuario',
            'identificacion' => 'required|string|max:20|unique:usuarios,identificacion,' . $id . ',id_usuario',
            'telefono' => 'nullable|string|max:20',
            'rol' => ['required', 'string', Rule::in(['Administrador del Sistema', 'Dirección', 'Subdirección'])],
            'contrasena' => $id
                ? 'nullable|string|min:8|confirmed'
                : 'required|string|min:8|confirmed',
            'id_universidad' => 'nullable|integer|exists:universidades,id_universidad',
            'id_carrera' => 'nullable|integer|exists:carreras,id_carrera',
        ]);
    }
}
