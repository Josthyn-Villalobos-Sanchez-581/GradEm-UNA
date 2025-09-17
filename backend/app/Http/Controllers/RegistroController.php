<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\Credencial;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class RegistroController extends Controller
{
    // 1. Enviar código
    public function enviarCodigo(Request $request)
    {
        $request->validate(['correo' => 'required|email']);

        $codigo = rand(100000, 999999);

        // Guardamos en sesión por 5 minutos
        session([
            'otp_correo' => $request->correo,
            'otp_codigo' => $codigo,
            'otp_expires_at' => now()->addMinutes(5)
        ]);

        // Enviar el correo con el código
        Mail::raw("Tu código de verificación es: $codigo", function ($m) use ($request) {
            $m->to($request->correo)->subject('Código de verificación');
        });

        return response()->json(['message' => 'Código enviado']);
    }

    // 2. Validar código
    public function validarCodigo(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
            'codigo' => 'required'
        ]);

        if (
            $request->correo !== session('otp_correo') ||
            $request->codigo != session('otp_codigo') ||
            now()->gt(session('otp_expires_at'))
        ) {
            return response()->json(['message' => 'Código inválido o expirado'], 422);
        }

        // Marcamos el correo como validado
        session(['otp_validado' => true]);

        return response()->json(['message' => 'Correo validado']);
    }

    // 3. Crear perfil
    public function registrar(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
            'password' => 'required|confirmed|min:6',
            'nombre_completo' => 'required|string|max:100',
            'tipoCuenta' => 'required|in:estudiante,egresado'
        ]);

        if (!session('otp_validado') || $request->correo !== session('otp_correo')) {
            return response()->json(['message' => 'Debe validar su correo primero'], 422);
        }

        $usuario = Usuario::create([
            'nombre_completo' => $request->nombre_completo,
            'correo' => $request->correo,
            'id_rol' => $request->tipoCuenta === 'estudiante' ? 2 : 3, // ejemplo de roles
        ]);

        Credencial::create([
            'id_usuario' => $usuario->id_usuario,
            'hash_contrasena' => Hash::make($request->password),
        ]);

        // Limpiamos sesión OTP
        session()->forget(['otp_correo', 'otp_codigo', 'otp_expires_at', 'otp_validado']);

        return response()->json(['message' => 'Usuario registrado correctamente']);
    }

    public function mostrarFormulario()
    {
        return Inertia::render('Registro'); // apunta a resources/js/pages/Registro.tsx
    }
}
