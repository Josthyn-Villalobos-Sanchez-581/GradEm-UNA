<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Credencial;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class RecuperarContrasenaController extends Controller
{
    // 1. Enviar código OTP al correo
    public function enviarCodigo(Request $request)
    {
        $request->validate(['correo' => 'required|email']);

        $codigo = rand(100000, 999999);

        session([
            'reset_correo' => $request->correo,
            'reset_codigo' => $codigo,
            'reset_expires_at' => now()->addMinutes(5)
        ]);

        Mail::raw("Tu código de recuperación es: $codigo", function ($m) use ($request) {
            $m->to($request->correo)->subject('Código de recuperación de contraseña');
        });

        return response()->json(['message' => 'Código enviado al correo']);
    }

    // 2. Cambiar contraseña
    public function cambiarContrasena(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
            'codigo' => 'required|string',
            'password' => 'required|confirmed|min:8',
        ]);

        if (
            $request->correo !== session('reset_correo') ||
            $request->codigo != session('reset_codigo') ||
            now()->gt(session('reset_expires_at'))
        ) {
            return response()->json(['message' => 'Código inválido o expirado'], 422);
        }

        // Buscar usuario por correo
        $usuario = Usuario::where('correo', $request->correo)->firstOrFail();

        // Cambiar contraseña en credenciales
        $credencial = Credencial::where('id_usuario', $usuario->id_usuario)->firstOrFail();
        $credencial->hash_contrasena = Hash::make($request->password);
        $credencial->fecha_ultimo_cambio = now();
        $credencial->save();

        // Limpiar la sesión OTP
        session()->forget(['reset_correo', 'reset_codigo', 'reset_expires_at']);

        return response()->json(['message' => 'Contraseña restablecida con éxito']);
    }
}
