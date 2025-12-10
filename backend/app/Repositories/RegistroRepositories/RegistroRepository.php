<?php

namespace App\Repositories\RegistroRepositories;

use App\Models\Usuario;
use App\Models\Credencial;
use App\Models\Rol;
use Illuminate\Support\Facades\Hash;

class RegistroRepository
{
    public function correoExiste($correo)
    {
        return Usuario::where('correo', $correo)->exists();
    }

    public function identificacionExiste($identificacion)
    {
        return Usuario::where('identificacion', $identificacion)->exists();
    }

    public function obtenerRolPorTipoCuenta($tipoCuenta)
    {
        return Rol::where('nombre_rol', ucfirst($tipoCuenta))->first();
    }

    public function validarDatosRegistro($request)
    {
        return $request->validate([
            'correo' => 'required|email|max:150',
            'password' => 'required|confirmed|min:8',
            'nombre_completo' => 'required|string|min:3|max:100|regex:/^[\pL\s]+$/u',
            'identificacion' => 'required|string|min:8|max:12|regex:/^[A-Za-z0-9]+$/',
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
            // Aceptar ids de universidad y carrera enviados desde el frontend
            'id_universidad' => 'nullable|integer|exists:universidades,id_universidad',
            'id_carrera' => 'nullable|integer|exists:carreras,id_carrera',
            'salario_promedio' => 'nullable|string|in:<300000,300000-600000,600000-1000000,>1000000',
            'tipo_empleo' => 'nullable|string|in:Tiempo completo,Medio tiempo,Temporal,Independiente,Práctica',
            'tipoCuenta' => 'required|in:estudiante,egresado,empresa',
        ]);
    }

    public function crearUsuario($datos, $rol)
    {
        // Asegurar que estado_id esté establecido (por defecto activo)
        if (!isset($datos['estado_id'])) {
            $datos['estado_id'] = 1;
        }

        return Usuario::create([
            ...$datos,
            'id_rol' => $rol->id_rol,
        ]);
    }

    public function crearCredencial($idUsuario, $password)
    {
        return Credencial::create([
            'id_usuario' => $idUsuario,
            'hash_contrasena' => Hash::make($password),
        ]);
    }

    public function enviarCodigo($correo, $codigo)
    {
        \Mail::raw(
            "Tu código de verificación es: $codigo",
            fn($m) => $m->to($correo)->subject('Código de verificación')
        );
    }
}
