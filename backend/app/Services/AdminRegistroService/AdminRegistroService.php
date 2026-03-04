<?php

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

        $usuario = $this->repository->obtenerUsuario($id);
        $nuevoEstado = $usuario->estado_id === 1 ? 0 : 1;

        $this->repository->actualizarEstado($id, $nuevoEstado);

        $this->repository->registrarBitacora(
            'usuarios',
            $nuevoEstado ? 'activar' : 'inactivar',
            "Cambio estado usuario ID {$id}",
            $usuarioActual->id_usuario
        );

        return response()->json([
            'message' => $nuevoEstado ? 'Usuario activado' : 'Usuario inactivado',
            'nuevo_estado' => $nuevoEstado
        ]);
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
                "Usuario creado ID {$usuarioId}",
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

            $this->repository->registrarBitacora(
                'usuarios',
                'actualizar',
                "Usuario actualizado ID {$id}",
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
            return response()->json(['status' => 'error'], 403);
        }

        $this->repository->eliminarUsuario($id);

        $this->repository->registrarBitacora(
            'usuarios',
            'eliminar',
            "Usuario eliminado ID {$id}",
            $usuarioActual->id_usuario
        );

      return response()->json([
    'status' => 'success',
    'message' => 'Usuario eliminado correctamente'
]);
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
