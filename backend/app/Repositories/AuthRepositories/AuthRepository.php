<?php

namespace App\Repositories\AuthRepositories;

use App\Models\Usuario;
use App\Models\Credencial;
use App\Models\CatalogoEstado;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AuthRepository
{
    public function buscarUsuarioPorCorreo(string $correo): ?Usuario
    {
        return Usuario::where('correo', $correo)->first();
    }

    public function obtenerCredencial(int $idUsuario): ?Credencial
    {
        return Credencial::where('id_usuario', $idUsuario)->first();
    }

    public function obtenerEstadoIds(): array
    {
        $estados = CatalogoEstado::whereIn('nombre_estado', ['activo', 'inactivo', 'suspendido'])
            ->pluck('id_estado', 'nombre_estado');

        return [
            'activo' => $estados['activo'] ?? null,
            'inactivo' => $estados['inactivo'] ?? null,
            'suspendido' => $estados['suspendido'] ?? null,
        ];
    }

    public function guardarUsuario(Usuario $usuario): void
    {
        $usuario->save();
    }

    public function guardarCredencial(Credencial $credencial): void
    {
        $credencial->save();
    }

    public function obtenerIntentosCorreo(string $correo)
    {
        return DB::table('login_attempts')->where('correo', $correo)->first();
    }

    public function registrarIntentoCorreo(string $correo, bool $forzarBloqueo = false)
    {
        $registro = $this->obtenerIntentosCorreo($correo);

        // Si no existe registro, crearlo
        if (!$registro) {
            DB::table('login_attempts')->insert([
                'correo' => $correo,
                'intentos' => $forzarBloqueo ? 3 : 1,
                'fecha_ultimo_intento' => now()
            ]);
            return $forzarBloqueo ? 3 : 1;
        }

        // Si existe, actualizarlo
        DB::table('login_attempts')->where('correo', $correo)->update([
            'intentos' => $forzarBloqueo ? 3 : min(3, $registro->intentos + 1),
            'fecha_ultimo_intento' => now()
        ]);

        return $forzarBloqueo ? 3 : min(3, $registro->intentos + 1);
    }


    public function limpiarIntentosCorreo(string $correo)
    {
        DB::table('login_attempts')->where('correo', $correo)->delete();
    }


    public function limpiarCorreosExpirados(int $lockoutSeconds)
{
    $registros = DB::table('login_attempts')->get();

    foreach ($registros as $registro) {

        // ¿Existe usuario real con este correo?
        $usuario = DB::table('usuarios')->where('correo', $registro->correo)->first();

        // Si existe usuario → NO eliminar
        if ($usuario) {
            continue;
        }

        // Calcular expiración
        $inicio = Carbon::parse($registro->fecha_ultimo_intento);
        $fin = $inicio->copy()->addSeconds($lockoutSeconds);

        // Expirado → eliminar
        if (now()->gte($fin)) {
            DB::table('login_attempts')
                ->where('correo', $registro->correo)
                ->delete();
        }
    }
}

}
