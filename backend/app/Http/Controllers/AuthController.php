<?php

namespace App\Http\Controllers;

use App\Models\CatalogoEstado;
use App\Models\Credencial;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    private const MAX_FAILED_ATTEMPTS = 3;
    private const LOCKOUT_SECONDS = 60;

    public function login(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
            'password' => 'required',
        ]);

        $usuario = Usuario::where('correo', $request->correo)->first();

        if (!$usuario) {
            return response()->json(['message' => 'Los datos ingresados son incorrectos'], 422);
        }

        $credencial = Credencial::where('id_usuario', $usuario->id_usuario)->first();

        if (!$credencial) {
            return response()->json(['message' => 'Los datos ingresados son incorrectos'], 422);
        }

        $estadoIds = $this->obtenerEstadoIds();

        if (!empty($estadoIds['inactivo']) && (int) $usuario->estado_id === (int) $estadoIds['inactivo']) {
            return response()->json([
                'message' => 'La cuenta se encuentra inactiva. Comuniquese con el administrador.',
            ], Response::HTTP_LOCKED);
        }

        $bloqueo = $this->evaluarBloqueoActivo($credencial);

        if ($bloqueo['locked']) {
            if (!empty($estadoIds['suspendido']) && (int) $usuario->estado_id !== (int) $estadoIds['suspendido']) {
                $usuario->estado_id = $estadoIds['suspendido'];
                $usuario->save();
            }

            return response()->json([
                'message' => 'Cuenta bloqueada temporalmente por intentos fallidos. Intente nuevamente en unos segundos.',
                'code' => 'too_many_attempts',
                'retryAfter' => $bloqueo['remaining'],
            ], Response::HTTP_LOCKED);
        }

        if ($bloqueo['reset'] && !empty($estadoIds['activo']) && (int) $usuario->estado_id === (int) ($estadoIds['suspendido'] ?? null)) {
            $usuario->estado_id = $estadoIds['activo'];
            $usuario->save();
        }

        if (!Hash::check($request->password, $credencial->hash_contrasena)) {
            $resultadoFallo = $this->registrarIntentoFallido($usuario, $credencial, $estadoIds);

            if ($resultadoFallo['locked']) {
                return response()->json([
                    'message' => 'Cuenta bloqueada temporalmente por intentos fallidos. Intente nuevamente en unos segundos.',
                    'code' => 'too_many_attempts',
                    'retryAfter' => $resultadoFallo['remaining'],
                ], Response::HTTP_LOCKED);
            }

            return response()->json(['message' => 'Los datos ingresados son incorrectos'], 422);
        }

        $sessionLifetime = (int) config('session.lifetime', 120);
        $ultimaActividad = $usuario->ultima_actividad instanceof Carbon
            ? $usuario->ultima_actividad
            : ($usuario->ultima_actividad ? Carbon::parse($usuario->ultima_actividad) : null);

        $sessionIsFresh = $usuario->sesion_activa
            && $ultimaActividad instanceof Carbon
            && $ultimaActividad->greaterThan(now()->subMinutes($sessionLifetime));

        if ($usuario->sesion_activa && !$sessionIsFresh) {
            $this->invalidateStoredSession($usuario, $credencial);
            $sessionIsFresh = false;
        }

        if ($sessionIsFresh && !$request->boolean('force')) {
            return response()->json([
                'message' => 'Esta cuenta ya tiene una sesion activa en otro dispositivo.',
                'requiresForce' => true,
            ], Response::HTTP_LOCKED);
        }

        if ($sessionIsFresh && $request->boolean('force')) {
            $this->invalidateStoredSession($usuario, $credencial);
        }

        $token = bin2hex(random_bytes(32));
        $credencial->intentos_fallidos = 0;
        $credencial->fecha_ultimo_cambio = null;
        $credencial->session_token = $token;
        $credencial->fecha_ultimo_login = now();
        $credencial->save();

        if (!empty($estadoIds['activo']) && (int) $usuario->estado_id !== (int) $estadoIds['activo']) {
            $usuario->estado_id = $estadoIds['activo'];
        }

        $usuario->sesion_activa = true;
        $usuario->ultima_actividad = now();
        $usuario->save();

        Auth::login($usuario);
        $request->session()->put('session_token', $token);
        $request->session()->regenerate();

        return response()->json(['redirect' => route('dashboard')]);
    }

    public function logout(Request $request)
    {
        $usuario = Auth::user();

        if ($usuario) {
            /** @var \App\Models\Usuario $usuario */
            $credencial = Credencial::where('id_usuario', $usuario->id_usuario)->first();
            $this->invalidateStoredSession($usuario, $credencial);
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['redirect' => route('login')]);
    }

    private function invalidateStoredSession(Usuario $usuario, ?Credencial $credencial = null): void
    {
        $usuario->sesion_activa = false;
        $usuario->ultima_actividad = now();
        $usuario->save();

        if (!$credencial) {
            $credencial = Credencial::where('id_usuario', $usuario->id_usuario)->first();
        }

        if ($credencial) {
            $credencial->session_token = null;
            $credencial->fecha_ultimo_cambio = now();
            $credencial->save();
        }
    }

    private function obtenerEstadoIds(): array
    {
        $estados = CatalogoEstado::whereIn('nombre_estado', ['activo', 'inactivo', 'suspendido'])
            ->pluck('id_estado', 'nombre_estado');

        return [
            'activo' => $estados['activo'] ?? null,
            'inactivo' => $estados['inactivo'] ?? null,
            'suspendido' => $estados['suspendido'] ?? null,
        ];
    }

    /**
     * @return array{locked: bool, remaining: int, reset: bool}
     */
    private function evaluarBloqueoActivo(Credencial $credencial): array
    {
        $resultado = [
            'locked' => false,
            'remaining' => 0,
            'reset' => false,
        ];

        $fallos = (int) ($credencial->intentos_fallidos ?? 0);

        if ($fallos < self::MAX_FAILED_ATTEMPTS) {
            return $resultado;
        }

        $inicioBloqueo = $credencial->fecha_ultimo_cambio
            ? Carbon::parse($credencial->fecha_ultimo_cambio)
            : null;

        if (!$inicioBloqueo) {
            $inicioBloqueo = now();
            $credencial->fecha_ultimo_cambio = $inicioBloqueo;
            $credencial->save();
        }

        $finBloqueo = $inicioBloqueo->copy()->addSeconds(self::LOCKOUT_SECONDS);

        if (now()->lt($finBloqueo)) {
            $resultado['locked'] = true;
            $resultado['remaining'] = max(1, now()->diffInSeconds($finBloqueo));
            return $resultado;
        }

        $credencial->intentos_fallidos = 0;
        $credencial->fecha_ultimo_cambio = null;
        $credencial->save();

        $resultado['reset'] = true;

        return $resultado;
    }

    /**
     * @return array{locked: bool, remaining: int}
     */
    private function registrarIntentoFallido(Usuario $usuario, Credencial $credencial, array $estadoIds): array
    {
        $credencial->intentos_fallidos = (int) ($credencial->intentos_fallidos ?? 0) + 1;
        if ($credencial->intentos_fallidos > self::MAX_FAILED_ATTEMPTS) {
            $credencial->intentos_fallidos = self::MAX_FAILED_ATTEMPTS;
        }

        $bloqueado = false;
        $restante = 0;

        if ($credencial->intentos_fallidos >= self::MAX_FAILED_ATTEMPTS) {
            $credencial->fecha_ultimo_cambio = now();
            $bloqueado = true;
            $restante = self::LOCKOUT_SECONDS;

            if (!empty($estadoIds['suspendido']) && (int) $usuario->estado_id !== (int) $estadoIds['suspendido']) {
                $usuario->estado_id = $estadoIds['suspendido'];
                $usuario->save();
            }
        }

        $credencial->save();

        return [
            'locked' => $bloqueado,
            'remaining' => $restante,
        ];
    }
}
