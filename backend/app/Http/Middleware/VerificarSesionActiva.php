<?php

namespace App\Http\Middleware;

use App\Models\Credencial;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VerificarSesionActiva
{
    public function handle(Request $request, Closure $next)
    {
        $usuario = Auth::user();

        if ($usuario) {
            $sessionToken = session('session_token');
            $credencial = Credencial::where('id_usuario', $usuario->id_usuario)->first();

            if (!$credencial || $credencial->session_token !== $sessionToken) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors([
                    'sesion' => 'Su sesion ha sido cerrada porque fue iniciada en otro dispositivo o navegador.',
                ]);
            }

            $sessionLifetime = (int) config('session.lifetime', 120);
            $ultimaActividad = $usuario->ultima_actividad instanceof Carbon
                ? $usuario->ultima_actividad
                : ($usuario->ultima_actividad ? Carbon::parse($usuario->ultima_actividad) : null);

            if (
                $usuario->sesion_activa
                && $ultimaActividad instanceof Carbon
                && $ultimaActividad->lte(now()->subMinutes($sessionLifetime))
            ) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors([
                    'sesion' => 'La sesion expiro por inactividad. Vuelva a iniciar sesion.',
                ]);
            }

            /** @var \App\Models\Usuario $usuario */
            $usuario->forceFill([
                'sesion_activa' => true,
                'ultima_actividad' => now(),
            ])->saveQuietly();
        }

        return $next($request);
    }
}
