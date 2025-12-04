<?php

namespace App\Services\AuthServices;

use App\Repositories\AuthRepositories\AuthRepository;
use App\Models\Usuario;
use App\Models\Credencial;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthService
{
    private const MAX_FAILED_ATTEMPTS = 3;
    private const LOCKOUT_SECONDS = 60;

    private AuthRepository $repository;

    public function __construct(AuthRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Maneja todo el proceso de login.
     */
    public function login(array $datos)
    {
        $usuario = $this->repository->buscarUsuarioPorCorreo($datos['correo']);

        $correo = $datos['correo'];

        // BLOQUEO GENERAL (correo)
        $registro = $this->repository->obtenerIntentosCorreo($correo);
        $estadoIds = $this->repository->obtenerEstadoIds();

        // SI EL USUARIO ESTÁ SUSPENDIDO, VERIFICAR SI EL TIEMPO YA VENCIO
        if ($usuario && (int)$usuario->estado_id === (int)($estadoIds['suspendido'] ?? -1)) {

            $registro = $this->repository->obtenerIntentosCorreo($correo);

            if ($registro) {
                $inicio = Carbon::parse($registro->fecha_ultimo_intento);
                $fin = $inicio->copy()->addSeconds(self::LOCKOUT_SECONDS);

                if (now()->gte($fin)) {

                    // TIEMPO VENCIDO → restaurar usuario
                    $usuario->estado_id = $estadoIds['activo'];
                    $this->repository->guardarUsuario($usuario);

                    // limpiar intentos correo
                    $this->repository->limpiarIntentosCorreo($correo);

                    // limpiar credencial
                    $credencial = $this->repository->obtenerCredencial($usuario->id_usuario);
                    if ($credencial) {
                        $credencial->intentos_fallidos = 0;
                        $credencial->fecha_ultimo_cambio = null;
                        $this->repository->guardarCredencial($credencial);
                    }
                }
            }
        }


        if ($registro && $registro->intentos >= self::MAX_FAILED_ATTEMPTS) {
            $inicio = Carbon::parse($registro->fecha_ultimo_intento);
            $fin = $inicio->copy()->addSeconds(self::LOCKOUT_SECONDS);

            if (now()->lt($fin)) {
                return response()->json([
                    'message' => 'Cuenta bloqueada temporalmente por intentos fallidos.',
                    'code' => 'too_many_attempts',
                    'retryAfter' => now()->diffInSeconds($fin)
                ], Response::HTTP_LOCKED);
            } else {
                $this->repository->limpiarIntentosCorreo($correo);
            }
        }

        if (!$usuario) {
            $intentos = $this->repository->registrarIntentoCorreo($correo);

            if ($intentos >= self::MAX_FAILED_ATTEMPTS) {
                return $this->errorBloqueo(self::LOCKOUT_SECONDS);
            }

            return $this->error("Los datos ingresados son incorrectos", 422);
        }


        $credencial = $this->repository->obtenerCredencial($usuario->id_usuario);

        if (!$credencial) {
            return $this->error("Los datos ingresados son incorrectos", 422);
        }

        $estadoIds = $this->repository->obtenerEstadoIds();

        // Validación de estado inactivo
        if ((int)$usuario->estado_id === (int)($estadoIds['inactivo'] ?? -1)) {
            return $this->error(
                "La cuenta se encuentra inactiva. Comuníquese con el administrador.",
                Response::HTTP_LOCKED
            );
        }

        // Validación de estado suspendido
        if ((int)$usuario->estado_id === (int)($estadoIds['suspendido'] ?? -1)) {

            // buscar registro de intentos por correo
            $registro = $this->repository->obtenerIntentosCorreo($datos['correo']);

            if ($registro) {
                $inicio = Carbon::parse($registro->fecha_ultimo_intento);
                $fin = $inicio->copy()->addSeconds(self::LOCKOUT_SECONDS);

                $remaining = now()->lt($fin)
                    ? now()->diffInSeconds($fin)
                    : 0;
            } else {
                $remaining = self::LOCKOUT_SECONDS;
            }

            return response()->json([
                'message' => 'Su cuenta está temporalmente suspendida por intentos fallidos.',
                'code' => 'too_many_attempts',
                'retryAfter' => $remaining
            ], Response::HTTP_LOCKED);
        }



        // Evaluar bloqueo
        $bloqueo = $this->evaluarBloqueoActivo($credencial);

        if ($bloqueo['locked']) {
            $this->ponerSuspendido($usuario, $estadoIds);
            return $this->errorBloqueo($bloqueo['remaining']);
        }

        // Validar contraseña
        if (!Hash::check($datos['password'], $credencial->hash_contrasena)) {
            $resultadoFallo = $this->registrarIntentoFallido($usuario, $credencial, $estadoIds);
            if ($resultadoFallo['locked']) {
                return $this->errorBloqueo($resultadoFallo['remaining']);
            }
            return $this->error("Los datos ingresados son incorrectos", 422);
        }

        // Login correcto => restaurar intento fallidos
        return $this->loginCorrecto($usuario, $credencial, $estadoIds, force: ($datos['force'] ?? false));
    }




    private function ponerSuspendido(Usuario $usuario, array $estadoIds)
    {
        if (!empty($estadoIds['suspendido']) && (int)$usuario->estado_id !== (int)$estadoIds['suspendido']) {
            $usuario->estado_id = $estadoIds['suspendido'];
            $this->repository->guardarUsuario($usuario);
        }
    }

    private function error(string $msg, int $status)
    {
        return response()->json(['message' => $msg], $status);
    }

    private function errorBloqueo(int $remaining)
    {
        return response()->json([
            'message' => 'Cuenta bloqueada temporalmente por intentos fallidos.',
            'code' => 'too_many_attempts',
            'retryAfter' => $remaining
        ], Response::HTTP_LOCKED);
    }




    private function evaluarBloqueoActivo(Credencial $credencial): array
    {
        $fallos = (int)($credencial->intentos_fallidos ?? 0);

        if ($fallos < self::MAX_FAILED_ATTEMPTS) {
            return ['locked' => false, 'remaining' => 0];
        }

        $inicio = $credencial->fecha_ultimo_cambio
            ? Carbon::parse($credencial->fecha_ultimo_cambio)
            : null;

        if (!$inicio) {
            $inicio = now();
            $credencial->fecha_ultimo_cambio = $inicio;
            $this->repository->guardarCredencial($credencial);
        }

        $fin = $inicio->copy()->addSeconds(self::LOCKOUT_SECONDS);

        if (now()->lt($fin)) {
            return [
                'locked' => true,
                'remaining' => now()->diffInSeconds($fin),
            ];
        }

        // Reset
        $credencial->intentos_fallidos = 0;
        $credencial->fecha_ultimo_cambio = null;
        $this->repository->guardarCredencial($credencial);

        return ['locked' => false, 'remaining' => 0];
    }




    private function registrarIntentoFallido(Usuario $usuario, Credencial $credencial, array $estadoIds): array
    {
        $credencial->intentos_fallidos++;
        if ($credencial->intentos_fallidos >= self::MAX_FAILED_ATTEMPTS) {
            $credencial->intentos_fallidos = self::MAX_FAILED_ATTEMPTS;
            $credencial->fecha_ultimo_cambio = now();
        }

        $this->repository->guardarCredencial($credencial);

        if ($credencial->intentos_fallidos >= self::MAX_FAILED_ATTEMPTS) {

            // guardar intento de bloqueo en INTENTOS_CORREO (TIEMPO REAL)
            $this->repository->registrarIntentoCorreo($usuario->correo, true);

            $this->ponerSuspendido($usuario, $estadoIds);

            return [
                'locked' => true,
                'remaining' => self::LOCKOUT_SECONDS,
            ];
        }


        return [
            'locked' => false,
            'remaining' => 0,
        ];
    }




    private function loginCorrecto(Usuario $usuario, Credencial $credencial, array $estadoIds, bool $force)
    {
        $sessionLifetime = (int)config('session.lifetime', 120);
        $ultima = $usuario->ultima_actividad
            ? Carbon::parse($usuario->ultima_actividad)
            : null;

        $sessionFresh = $usuario->sesion_activa
            && $ultima instanceof Carbon
            && $ultima->greaterThan(now()->subMinutes($sessionLifetime));

        if ($sessionFresh && !$force) {
            return response()->json([
                'message' => 'Esta cuenta ya tiene una sesion activa.',
                'requiresForce' => true,
            ], Response::HTTP_LOCKED);
        }

        if ($sessionFresh && $force) {
            $this->invalidateStoredSession($usuario, $credencial);
        }

        // Crear token
        $token = bin2hex(random_bytes(32));

        // Reset credencial
        $credencial->intentos_fallidos = 0;
        $credencial->session_token = $token;
        $credencial->fecha_ultimo_login = now();
        $this->repository->guardarCredencial($credencial);
        $this->repository->limpiarIntentosCorreo($usuario->correo);


        // Activar usuario
        $usuario->estado_id = $estadoIds['activo'] ?? $usuario->estado_id;
        $usuario->sesion_activa = true;
        $usuario->ultima_actividad = now();
        $this->repository->guardarUsuario($usuario);

        Auth::login($usuario);

        session()->put('session_token', $token);
        session()->regenerate();

        return response()->json([
            'redirect' => route('dashboard')
        ]);
    }




    private function invalidateStoredSession(Usuario $usuario, ?Credencial $credencial = null): void
    {
        $usuario->sesion_activa = false;
        $usuario->ultima_actividad = now();
        $this->repository->guardarUsuario($usuario);

        if (!$credencial) {
            $credencial = $this->repository->obtenerCredencial($usuario->id_usuario);
        }

        if ($credencial) {
            $credencial->session_token = null;
            $credencial->fecha_ultimo_cambio = now();
            $this->repository->guardarCredencial($credencial);
        }
    }




    public function logout($request)
    {
        $usuario = Auth::user();

        if ($usuario) {
            /** @var \App\Models\Usuario $usuario */
            $credencial = $this->repository->obtenerCredencial($usuario->id_usuario);

            // invalidar sesión interna
            $this->invalidateStoredSession($usuario, $credencial);
        }

        // logout Laravel
        Auth::logout();

        // invalidar sesión HTTP
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'redirect' => route('login')
        ]);
    }
}
