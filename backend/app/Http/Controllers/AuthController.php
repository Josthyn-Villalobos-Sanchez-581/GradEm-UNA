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
            return back()->withErrors(['message' => 'Usuario no encontrado']);
        }

        $credencial = Credencial::where('id_usuario', $usuario->id_usuario)->first();
        if (!$credencial || !Hash::check($request->password, $credencial->hash_contrasena)) {
            return back()->withErrors(['message' => 'Contraseña incorrecta']);
        }

        Auth::login($usuario);

        // Redirige según el rol (ejemplo)
        switch ($usuario->id_rol) {
            case 1: // Administrador
                return redirect()->route('dashboard');
            case 2: // Egresado/Estudiante
                return redirect()->route('dashboard'); // puedes crear rutas diferentes
            case 3: // Empresa
                return redirect()->route('dashboard');
            default:
                return redirect()->route('dashboard');
        }
    }
}
