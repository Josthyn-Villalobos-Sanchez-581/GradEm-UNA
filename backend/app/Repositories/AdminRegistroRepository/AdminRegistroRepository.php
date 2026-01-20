<?php

namespace App\Repositories\AdminRegistroRepository;

use App\Models\Usuario;
use App\Models\Rol;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminRegistroRepository
{
  /*  public function obtenerUsuariosAdmin(?string $search)
    {
        $roles = ['Administrador del Sistema', 'Dirección', 'Subdirección'];
        $roleIds = Rol::whereIn('nombre_rol', $roles)->pluck('id_rol')->toArray() ?: [0];

        $query = Usuario::with('rol')
            ->whereIn('id_rol', $roleIds)
            ->orderByDesc('fecha_registro');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre_completo', 'like', "%{$search}%")
                  ->orWhere('identificacion', 'like', "%{$search}%");
            });
        }

        return $query->paginate(5)->withQueryString();
    }*/
public function obtenerUsuariosAdmin(?string $search)
{
    $roles = ['Administrador del Sistema', 'Dirección', 'Subdirección'];
    $roleIds = Rol::whereIn('nombre_rol', $roles)->pluck('id_rol');

    $query = Usuario::query()
        ->join('roles', 'usuarios.id_rol', '=', 'roles.id_rol')
        ->whereIn('usuarios.id_rol', $roleIds)
        ->select([
            'usuarios.id_usuario',
            'usuarios.nombre_completo',
            'usuarios.correo',
            'usuarios.identificacion',
            'usuarios.telefono',
            'usuarios.estado_id',
            'usuarios.fecha_registro',
            'roles.nombre_rol as rol',
        ])
        ->orderByDesc('usuarios.fecha_registro');

    if ($search) {
        $query->where(function ($q) use ($search) {
            $q->where('usuarios.nombre_completo', 'like', "%{$search}%")
              ->orWhere('usuarios.identificacion', 'like', "%{$search}%");
        });
    }

    return $query->paginate(5)->withQueryString();
}

    public function obtenerUsuario(int $id): Usuario
    {
        return Usuario::findOrFail($id);
    }

    public function obtenerUsuarioConDatos(int $id): array
    {
        $u = Usuario::with('rol')->findOrFail($id);

        return [
            'id' => $u->id_usuario,
            'nombre_completo' => $u->nombre_completo,
            'correo' => $u->correo,
            'identificacion' => $u->identificacion,
            'telefono' => $u->telefono,
            'rol' => $u->rol?->nombre_rol,
            'universidad' => DB::table('universidades')
                ->where('id_universidad', $u->id_universidad)
                ->value('nombre') ?? '',
            'carrera' => DB::table('carreras')
                ->where('id_carrera', $u->id_carrera)
                ->value('nombre') ?? '',
        ];
    }

    public function crearUsuarioCompleto(array $data): int
    {
        $rolId = Rol::where('nombre_rol', $data['rol'])->value('id_rol');

        $usuarioId = DB::table('usuarios')->insertGetId([
            'nombre_completo' => $data['nombre_completo'],
            'correo' => $data['correo'],
            'identificacion' => $data['identificacion'],
            'telefono' => $data['telefono'] ?? null,
            'id_rol' => $rolId,
            'fecha_registro' => now(),
            'estado_id' => 1,
        ]);

        DB::table('credenciales')->insert([
            'id_usuario' => $usuarioId,
            'hash_contrasena' => Hash::make($data['contrasena']),
        ]);

        return $usuarioId;
    }

    public function actualizarUsuarioCompleto(int $id, array $data): void
    {
        $rolId = Rol::where('nombre_rol', $data['rol'])->value('id_rol');

        DB::table('usuarios')->where('id_usuario', $id)->update([
            'nombre_completo' => $data['nombre_completo'],
            'correo' => $data['correo'],
            'identificacion' => $data['identificacion'],
            'telefono' => $data['telefono'] ?? null,
            'id_rol' => $rolId,
        ]);

        if (!empty($data['contrasena'])) {
            DB::table('credenciales')->where('id_usuario', $id)->update([
                'hash_contrasena' => Hash::make($data['contrasena']),
            ]);
        }
    }

    public function eliminarUsuario(int $id): void
    {
        DB::table('credenciales')->where('id_usuario', $id)->delete();
        DB::table('usuarios')->where('id_usuario', $id)->delete();
    }

    public function obtenerPermisos(int $rolId): array
    {
        return DB::table('roles_permisos')
            ->where('id_rol', $rolId)
            ->pluck('id_permiso')
            ->toArray();
    }

    public function actualizarEstado(int $id, int $estado): void
    {
        DB::table('usuarios')
            ->where('id_usuario', $id)
            ->update(['estado_id' => $estado]);
    }

    public function registrarBitacora(
        string $tabla,
        string $operacion,
        string $descripcion,
        int $usuarioResponsable
    ): void {
        DB::table('bitacora_cambios')->insert([
            'tabla_afectada' => $tabla,
            'operacion' => $operacion,
            'usuario_responsable' => $usuarioResponsable,
            'descripcion_cambio' => $descripcion,
            'fecha_cambio' => now(),
        ]);
    }
}
