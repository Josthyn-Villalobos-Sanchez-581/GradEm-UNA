<?php

namespace App\Http\Controllers;

use App\Models\Credencial;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
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

        if (!$credencial || !Hash::check($request->password, $credencial->hash_contrasena)) {
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
        $credencial->session_token = $token;
        $credencial->fecha_ultimo_login = now();
        $credencial->save();

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
}
