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
            'nombre'           => 'required|string|min:3|max:100|regex:/^[\pL\s]+$/u|unique:empresas,nombre',
            'correo'           => 'required|email|unique:empresas,correo|unique:usuarios,correo',
            'telefono'         => 'required|string|digits_between:8,20|regex:/^[0-9]{8,20}$/',
            'persona_contacto' => 'required|string|min:3|max:100|regex:/^[\pL\s]+$/u',
            'identificacion'   => 'required|string|min:8|max:20|unique:usuarios,identificacion|regex:/^[A-Za-z0-9]+$/',
            'password' => 'required|confirmed|min:8',
        ], [
        'nombre.required' => 'El nombre de la empresa es obligatorio.',
        'nombre.regex' => 'El nombre solo puede contener letras y espacios.',
        'nombre.unique' => 'El nombre de la empresa ya está registrado.',
        'correo.required' => 'El correo es obligatorio.',
        'correo.email' => 'Debe ingresar un correo válido.',
        'correo.unique' => 'El correo ya está en uso.',
        'telefono.required' => 'El teléfono es obligatorio.',
        'telefono.digits_between' => 'El teléfono debe contener entre 8 y 20 dígitos numéricos.',
        'telefono.regex' => 'El teléfono debe contener entre 8 y 20 dígitos numéricos.',
        'persona_contacto.required' => 'Debe ingresar el nombre de la persona de contacto.',
        'persona_contacto.regex' => 'El nombre solo puede contener letras y espacios.',
        'identificacion.required' => 'La identificación es obligatoria.',
        'identificacion.unique' => 'La identificación ya está en uso.',
        'identificacion.regex' => 'La identificación solo puede contener letras y números (sin espacios ni símbolos).',
        'identificacion.min' => 'La identificación debe tener al menos 8 caracteres.',
        'identificacion.max' => 'La identificación no puede superar los 20 caracteres.',
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
            'usuario_id'       => $usuario->id_usuario,
        ]);

        // Limpiamos sesión OTP
        session()->forget(['otp_correo', 'otp_codigo', 'otp_expires_at', 'otp_validado']);

        return response()->json(['message' => 'Empresa registrada correctamente']);
    }

    public function verificarIdentificacion(Request $request)
    {
        $request->validate(['identificacion' => 'required|string']);

        $existe = \App\Models\Usuario::where('identificacion', $request->identificacion)->exists();

        return response()->json(['exists' => $existe]);
    }
}
