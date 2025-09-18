<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\Credencial;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

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
            return response()->json(['message' => 'Usuario no encontrado'], 422);
        }

        $credencial = Credencial::where('id_usuario', $usuario->id_usuario)->first();
        if (!$credencial || !Hash::check($request->password, $credencial->hash_contrasena)) {
            return response()->json(['message' => 'Contraseña incorrecta'], 422);
        }

        Auth::login($usuario);

        // Redirigir al Dashboard protegido
        return response()->json([
            'redirect' => route('dashboard')
        ]);
    }
}


