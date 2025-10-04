<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\Credencial;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

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

        // 🔹 Si no existe la credencial, es error
        if (!$credencial) {
            return response()->json(['message' => 'Los datos ingresados son incorrectos'], 422);
        }

        // 🔹 Verificar baneo activo
        if ($credencial->fecha_baneo && now()->lt($credencial->fecha_baneo)) {
            $restante = now()->diffInSeconds($credencial->fecha_baneo);
            $minutos = floor($restante / 60);
            $segundos = $restante % 60;

            return response()->json([
                'message' => "La cuenta está temporalmente bloqueada. Intente de nuevo en {$minutos} min y {$segundos} seg."
            ], 423); // 423 Locked
        }

        // 🔹 Verificar estado del usuario
        if ($usuario->estado_id != 1) {
            $motivos = [
                2 => 'La cuenta se encuentra inactivada.',
                3 => 'La cuenta se encuentra suspendida temporalmente.',
                4 => 'La cuenta ha sido finalizada.',
            ];

            $mensaje = $motivos[$usuario->estado_id] ?? 'La cuenta no está activa.';
            return response()->json(['message' => $mensaje], 403);
        }

        // 🔹 Verificar contraseña
        if (!Hash::check($request->password, $credencial->hash_contrasena)) {
            $credencial->intentos_fallidos = ($credencial->intentos_fallidos ?? 0) + 1;

            // Si llegó a 3 intentos => aplicar baneo de 1 minuto
            if ($credencial->intentos_fallidos >= 3) {
                $credencial->fecha_baneo = now()->addMinute();
                $credencial->intentos_fallidos = 0; // Reiniciamos contador tras aplicar el baneo
            }

            $credencial->save();

            return response()->json(['message' => 'Los datos ingresados son incorrectos'], 422);
        }

        // 🔹 Si pasa la validación -> login exitoso
        $credencial->intentos_fallidos = 0;
        $credencial->fecha_baneo = null;
        $credencial->fecha_ultimo_login = now();
        $credencial->save();

        Auth::login($usuario);
        $request->session()->regenerate();

        return response()->json([
            'redirect' => route('dashboard')
        ]);
    }

    public function logout(Request $request)
    {
        // Cerrar sesión
        Auth::logout();

        // Invalidar sesión y regenerar token CSRF
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Devolver JSON para que axios pueda redirigir
        return response()->json([
            'redirect' => route('login')
        ]);
    }
}
