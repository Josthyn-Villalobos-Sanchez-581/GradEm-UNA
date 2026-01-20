<?php

namespace App\Repositories\EmpresaRepositories;

use App\Models\Usuario;
use App\Models\Empresa;
use App\Models\Credencial;
use App\Models\Rol;
use Illuminate\Support\Facades\Hash;

class EmpresaRepository
{
    public function correoExisteUsuario($correo)
    {
        return Usuario::where('correo', $correo)->exists();
    }

    public function correoExisteEmpresa($correo)
    {
        return Empresa::where('correo', $correo)->exists();
    }

    public function nombreEmpresaExiste($nombre)
    {
        return Empresa::where('nombre', $nombre)->exists();
    }

    public function identificacionExiste($identificacion)
    {
        return Usuario::where('identificacion', $identificacion)->exists();
    }

    public function validarDatosRegistro($request)
    {
        return $request->validate([
            'nombre'           => 'required|string|min:3|max:100|regex:/^[\pL\s]+$/u|unique:empresas,nombre',
            'correo'           => 'required|email|unique:empresas,correo|unique:usuarios,correo',
            'telefono'         => 'required|string|digits_between:8,20|regex:/^[0-9]{8,20}$/',
            'persona_contacto' => 'required|string|min:3|max:100|regex:/^[\pL\s]+$/u',
            'identificacion'   => 'required|string|min:8|max:20|unique:usuarios,identificacion|regex:/^[A-Za-z0-9]+$/',
            'password'         => 'required|confirmed|min:8',
        ], [
            'nombre.required'           => 'El nombre de la empresa es obligatorio.',
            'nombre.regex'              => 'El nombre solo puede contener letras y espacios.',
            'nombre.unique'             => 'El nombre de la empresa ya está registrado.',
            'correo.required'           => 'El correo es obligatorio.',
            'correo.email'              => 'Debe ingresar un correo válido.',
            'correo.unique'             => 'El correo ya está en uso.',
            'telefono.required'         => 'El teléfono es obligatorio.',
            'telefono.digits_between'   => 'El teléfono debe contener entre 8 y 20 dígitos numéricos.',
            'telefono.regex'            => 'El teléfono debe contener entre 8 y 20 dígitos numéricos.',
            'persona_contacto.required' => 'Debe ingresar el nombre de la persona de contacto.',
            'persona_contacto.regex'    => 'El nombre solo puede contener letras y espacios.',
            'identificacion.required'   => 'La identificación es obligatoria.',
            'identificacion.unique'     => 'La identificación ya está en uso.',
            'identificacion.regex'      => 'La identificación solo puede contener letras y números (sin espacios ni símbolos).',
            'identificacion.min'        => 'La identificación debe tener al menos 8 caracteres.',
            'identificacion.max'        => 'La identificación no puede superar los 20 caracteres.',
        ]);
    }

    public function crearUsuario($nombre_completo, $correo, $identificacion)
    {
        return Usuario::create([
            'nombre_completo' => $nombre_completo,
            'correo'          => $correo,
            'identificacion'  => $identificacion,
            'id_rol'          => 5, // Rol Empresa
        ]);
    }

    public function crearCredencial($idUsuario, $password)
    {
        return Credencial::create([
            'id_usuario'       => $idUsuario,
            'hash_contrasena'  => Hash::make($password),
        ]);
    }

    public function crearEmpresa($nombre, $correo, $telefono, $persona_contacto, $usuario_id)
    {
        return Empresa::create([
            'nombre'           => $nombre,
            'correo'           => $correo,
            'telefono'         => $telefono,
            'persona_contacto' => $persona_contacto,
            'usuario_id'       => $usuario_id,
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
