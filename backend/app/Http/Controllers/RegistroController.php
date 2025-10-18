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

        // Verificar si el correo ya está registrado
        if (\App\Models\Usuario::where('correo', $request->correo)->exists()) {
            return response()->json(['message' => 'Este correo ya está registrado'], 422);
        }

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
            'correo' => 'required|email|max:150|unique:usuarios,correo',
            'password' => 'required|confirmed|min:8',
            'nombre_completo' => 'required|string|min:3|max:100|regex:/^[\pL\s]+$/u',
            'identificacion' => 'required|numeric|digits_between:8,12|unique:usuarios,identificacion',
            'telefono' => 'nullable|numeric|digits_between:8,15',
            'fecha_nacimiento' => 'nullable|date|before:today',
            'genero' => 'nullable|string|max:20|in:masculino,femenino,otro',
            'estado_empleo' => 'nullable|string|max:50|in:empleado,desempleado',
            'estado_estudios' => 'nullable|string|max:50|in:activo,pausado,finalizado',
            'nivel_academico' => 'nullable|string|max:50',
            'anio_graduacion' => 'nullable|digits:4|integer|min:2007|max:' . date('Y'),
            'tiempo_conseguir_empleo' => 'nullable|digits_between:1,3|integer|min:0|max:120',
            'area_laboral_id' => 'nullable|integer|exists:areas_laborales,id_area_laboral',
            'id_canton' => 'nullable|integer|exists:cantones,id_canton',
            'salario_promedio' => 'nullable|string|in:<300000,300000-600000,600000-1000000,>1000000',
            'tipo_empleo' => 'nullable|string|in:Tiempo completo,Medio tiempo,Temporal,Independiente,Práctica',
            'tipoCuenta' => 'required|in:estudiante,egresado,empresa',
        ], [
        // ⚡ Mensajes personalizados
        'nombre_completo.regex' => 'El nombre solo puede contener letras y espacios.',
        'correo.unique' => 'El correo ya está registrado.',
        'identificacion.numeric' => 'La identificación debe ser un número.',
        'identificacion.digits_between' => 'La identificación debe tener entre 8 y 12 dígitos.',
        'telefono.numeric' => 'El teléfono debe contener solo números.',
        'telefono.digits_between' => 'El teléfono debe tener entre 8 y 15 dígitos.',
        'fecha_nacimiento.before' => 'La fecha de nacimiento debe ser anterior a hoy.',
        'genero.in' => 'Debe seleccionar una opción válida en género.',
        'estado_empleo.in' => 'Debe ser empleado o desempleado.',
        'estado_estudios.in' => 'Debe ser activo, pausado o finalizado.',
        'anio_graduacion.digits' => 'El año de graduación debe tener 4 dígitos.',
        'anio_graduacion.min' => 'El año de graduación no puede ser antes de 2007.',
        'tiempo_conseguir_empleo.integer' => 'El tiempo deben ser numeros enteros de entre 1 y 3 dígitos.',
        'estado_empleo.in' => 'Debe ser empleado o desempleado.',
        'estado_estudios.in' => 'Debe ser activo, pausado o finalizado.',
        'salario_promedio.in' => 'Debe seleccionar un rango salarial válido.',
        'tipo_empleo.in' => 'Debe seleccionar un tipo de empleo válido.',
        ]);

        if (!session('otp_validado') || $request->correo !== session('otp_correo')) {
            return response()->json(['message' => 'Debe validar su correo primero'], 422);
        }

        // 🔹 Obtener el ID del rol según el nombre del rol
        $rol = \App\Models\Rol::where('nombre_rol', ucfirst($request->tipoCuenta))->first();

        if (!$rol) {
            return response()->json(['message' => 'Rol no encontrado para el tipo de cuenta seleccionado'], 422);
        }

        $usuario = Usuario::create([
            'nombre_completo' => $request->nombre_completo,
            'correo' => $request->correo,
            'identificacion' => $request->identificacion,
            'telefono' => $request->telefono,
            'fecha_nacimiento' => $request->fecha_nacimiento,
            'genero' => $request->genero,
            'id_universidad' => $request->id_universidad,
            'id_carrera' => $request->id_carrera, 
            'estado_empleo' => $request->estado_empleo,
            'estado_estudios' => $request->estado_estudios,
            'nivel_academico' => $request->nivel_academico,
            'anio_graduacion' => $request->anio_graduacion ? (int) $request->anio_graduacion : null,
            'tiempo_conseguir_empleo' => $request->estado_empleo === 'empleado' ? $request->tiempo_conseguir_empleo : null,
            'area_laboral_id' => $request->estado_empleo === 'empleado' ? $request->area_laboral_id : null,
            'id_canton' => $request->id_canton,
            'salario_promedio' => $request->estado_empleo === 'empleado' ? $request->salario_promedio : null,
            'tipo_empleo' => $request->estado_empleo === 'empleado' ? $request->tipo_empleo : null,
            'id_rol' => $rol->id_rol,
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

    // Método para verificar si el correo ya existe
    public function verificarCorreo(Request $request)
    {
        $request->validate([
            'correo' => 'required|email'
        ]);

        $exists = \App\Models\Usuario::where('correo', $request->correo)->exists();

        return response()->json(['exists' => $exists]);
    }
}
