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
            'nombre'           => 'required|string|min:3|max:100|regex:/^[\pL\s]+$/u',
            'correo'           => 'required|email|unique:empresas,correo|unique:usuarios,correo',
            'telefono'         => 'required|string|max:20|regex:/^[0-9]{8,20}$/',
            'persona_contacto' => 'required|string|min:3|max:100|regex:/^[\pL\s]+$/u',
            'password'         => 'required|string|min:8|confirmed',
        ], [
        'nombre.required' => 'El nombre de la empresa es obligatorio.',
        'nombre.regex' => 'El nombre solo puede contener letras y espacios.',
        'correo.required' => 'El correo es obligatorio.',
        'correo.email' => 'Debe ingresar un correo válido.',
        'correo.unique' => 'El correo ya está en uso.',
        'telefono.required' => 'El teléfono es obligatorio.',
        'telefono.regex' => 'El teléfono debe contener entre 8 y 20 dígitos numéricos.',
        'persona_contacto.required' => 'Debe ingresar el nombre de la persona de contacto.',
        'persona_contacto.regex' => 'El nombre solo puede contener letras y espacios.',
        'password.required' => 'Debe ingresar una contraseña.',
        'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
        'password.confirmed' => 'Las contraseñas no coinciden.',
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

        // Limpiamos sesión OTP
        session()->forget(['otp_correo', 'otp_codigo', 'otp_expires_at', 'otp_validado']);

        return response()->json(['message' => 'Empresa registrada correctamente']);
    }
}
