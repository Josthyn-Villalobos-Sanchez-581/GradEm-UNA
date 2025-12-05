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
        $this->repository->limpiarCorreosExpirados(self::LOCKOUT_SECONDS);

        $correo = $datos['correo'];

        $usuario = $this->repository->buscarUsuarioPorCorreo($correo);
        $registro = $this->repository->obtenerIntentosCorreo($correo);
        $estadoIds = $this->repository->obtenerEstadoIds();


        /*
    |--------------------------------------------------------------------------
    | 1. Si existe usuario suspendido → verificar si el tiempo ya venció
    |--------------------------------------------------------------------------
    */
        if ($usuario && (int)$usuario->estado_id === (int)($estadoIds['suspendido'] ?? -1)) {

            if ($registro) {
                $inicio = Carbon::parse($registro->fecha_ultimo_intento);
                $fin = $inicio->copy()->addSeconds(self::LOCKOUT_SECONDS);

                if (now()->gte($fin)) {

                    // TIEMPO VENCIDO → restaurar
                    $usuario->estado_id = $estadoIds['activo'];
                    $this->repository->guardarUsuario($usuario);

                    $this->repository->limpiarIntentosCorreo($correo);

                    $cred = $this->repository->obtenerCredencial($usuario->id_usuario);
                    if ($cred) {
                        $cred->intentos_fallidos = 0;
                        $cred->fecha_ultimo_cambio = null;
                        $this->repository->guardarCredencial($cred);
                    }
                } else {
                    return $this->errorBloqueo(now()->diffInSeconds($fin));
                }
            }
        }


        /*
    |--------------------------------------------------------------------------
    | 2. BLOQUEO GENERAL POR CORREO (exista o no exista usuario)
    |--------------------------------------------------------------------------
    */
        if ($registro && $registro->intentos >= self::MAX_FAILED_ATTEMPTS) {
            $inicio = Carbon::parse($registro->fecha_ultimo_intento);
            $fin = $inicio->copy()->addSeconds(self::LOCKOUT_SECONDS);

            if (now()->lt($fin)) {
                return $this->errorBloqueo(now()->diffInSeconds($fin));
            }

            // Tiempo vencido → limpiar
            $this->repository->limpiarIntentosCorreo($correo);
            $registro = null;
        }


        /*
    |--------------------------------------------------------------------------
    | 3. Usuario no existe → solo bloqueo por correo
    |--------------------------------------------------------------------------
    */
        if (!$usuario) {

            // 1. Registrar intento
            $intentos = $this->repository->registrarIntentoCorreo($correo);

            // 2. Si llega al límite → bloquear
            if ($intentos >= self::MAX_FAILED_ATTEMPTS) {
                return $this->errorBloqueo(self::LOCKOUT_SECONDS);
            }

            // 3. Si no llegó al límite → limpieza automática de correos inexistentes
            if ($registro) {
                $inicio = Carbon::parse($registro->fecha_ultimo_intento);
                $fin = $inicio->copy()->addSeconds(self::LOCKOUT_SECONDS);

                // Si ya pasó el tiempo → eliminar registro fantasma
                if (now()->gte($fin)) {
                    $this->repository->limpiarIntentosCorreo($correo);
                }
            }

            return $this->error("Los datos ingresados son incorrectos", 422);
        }



        /*
    |--------------------------------------------------------------------------
    | 4. Usuario existe: obtener credencial
    |--------------------------------------------------------------------------
    */
        $credencial = $this->repository->obtenerCredencial($usuario->id_usuario);

        if (!$credencial) {
            return $this->error("Los datos ingresados son incorrectos", 422);
        }


        /*
    |--------------------------------------------------------------------------
    | 5. Estado INACTIVO → no permitir login
    |--------------------------------------------------------------------------
    */
        if ((int)$usuario->estado_id === (int)($estadoIds['inactivo'] ?? -1)) {
            return $this->error(
                "La cuenta se encuentra inactiva. Comuníquese con el administrador.",
                Response::HTTP_LOCKED
            );
        }


        /*
    |--------------------------------------------------------------------------
    | 6. Bloqueo por intentos fallidos en CREDENCIAL
    |--------------------------------------------------------------------------
    */
        $bloqueo = $this->evaluarBloqueoActivo($credencial);

        if ($bloqueo['locked']) {
            $this->ponerSuspendido($usuario, $estadoIds);

            // También guardamos en login_attempts para tener tiempo real
            $this->repository->registrarIntentoCorreo($correo, true);

            return $this->errorBloqueo($bloqueo['remaining']);
        }


        /*
    |--------------------------------------------------------------------------
    | 7. Validar contraseña
    |--------------------------------------------------------------------------
    */
        if (!Hash::check($datos['password'], $credencial->hash_contrasena)) {

            $resultado = $this->registrarIntentoFallido($usuario, $credencial, $estadoIds);

            if ($resultado['locked']) {
                $this->repository->registrarIntentoCorreo($correo, true);
                return $this->errorBloqueo($resultado['remaining']);
            }

            return $this->error("Los datos ingresados son incorrectos", 422);
        }


        /*
    |--------------------------------------------------------------------------
    | 8. Login correcto → limpiar intentos y avanzar
    |--------------------------------------------------------------------------
    */
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
