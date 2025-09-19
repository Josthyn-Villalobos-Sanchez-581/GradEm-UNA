<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\Usuario;
use App\Models\Credencial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EmpresaController extends Controller
{
    public function store(Request $request)
    {
        // Validación
        $request->validate([
            'nombre'           => 'required|string|max:100',
            'correo'           => 'required|email|unique:empresas,correo|unique:usuarios,correo',
            'telefono'         => 'required|string|max:20',
            'persona_contacto' => 'required|string|max:100',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        // 1. Crear usuario encargado
        $usuario = Usuario::create([
            'nombre_completo' => $request->persona_contacto,
            'correo'          => $request->correo,
            'identificacion'  => $request->identificacion,
            'id_rol'          => 5, // Rol Empresa
        ]);

        // 2. Crear credenciales del usuario
        Credencial::create([
            'id_usuario'       => $usuario->id_usuario,
            'hash_contrasena'  => Hash::make($request->password),
        ]);

        // 3. Crear empresa
        $empresa = Empresa::create([
            'nombre'           => $request->nombre,
            'correo'           => $request->correo,
            'telefono'         => $request->telefono,
            'persona_contacto' => $request->persona_contacto,
            'id_usuario'       => $usuario->id_usuario,
        ]);

        return response()->json([
            'message' => 'Registro de empresa exitoso',
            'empresa' => $empresa
        ], 201);
    }
}
