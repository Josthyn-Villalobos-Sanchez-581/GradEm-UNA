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
        if (!$credencial || !Hash::check($request->password, $credencial->hash_contrasena)) {
            return response()->json(['message' => 'Los datos ingresados son incorrectos'], 422);
        }

        Auth::login($usuario);

        // Regenerar sesión para seguridad
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
