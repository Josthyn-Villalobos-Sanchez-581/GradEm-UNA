<?php

namespace App\Services\MailServices;

use App\Repositories\MailRepositories\MailRepository;
use App\Mail\CodigoVerificacionMail;
use App\Repositories\PerfilRepositories\PerfilRepository;
use Illuminate\Support\Facades\Auth;

class MailService
{
    protected $mailRepository;
    protected $perfilRepository;

    public function __construct(MailRepository $mailRepository, PerfilRepository $perfilRepository)
    {
        $this->mailRepository = $mailRepository;
        $this->perfilRepository = $perfilRepository;
    }

    public function enviarCodigoVerificacion($correo)
{
    $idUsuarioActual = Auth::id();

    // Validar si ya existe
    $existe = $this->perfilRepository
        ->correoExisteExceptoUsuario($correo, $idUsuarioActual);

    if ($existe) {
        return response()->json([
            'error' => 'Este correo ya está registrado. No se puede enviar un código.'
        ], 422);
    }

    // Crear código
    $codigo = rand(100000, 999999);

    session([
        'codigo_verificacion_correo' => $codigo,
        'correo_a_verificar' => $correo,
        'codigo_expira' => now()->addMinutes(5),
    ]);

    // Aquí usamos MailRepository como pediste
    $this->mailRepository->enviarCorreo(
        $correo,
        new CodigoVerificacionMail($codigo)
    );

    return response()->json([
        'message' => 'Código enviado con éxito al correo proporcionado.'
    ]);
}


    public function validarCodigoCorreo($request)
    {
        // Validar entrada
        $request->validate([
            'codigo' => 'required',
        ]);

        // Validar existencia del código en sesión
        if (!session()->has('codigo_verificacion_correo')) {
            return [
                'error' => 'Debe solicitar un código primero',
                'status' => 422
            ];
        }

        // Validar expiración
        if (now()->greaterThan(session('codigo_expira'))) {
            return [
                'error' => 'El código ha expirado',
                'status' => 422
            ];
        }

        // Validar coincidencia
        if ($request->codigo != session('codigo_verificacion_correo')) {
            return [
                'error' => 'El código es incorrecto',
                'status' => 422
            ];
        }

        // Código correcto
        return [
            'message' => 'Correo verificado con éxito',
            'correoVerificado' => session('correo_a_verificar'),
            'status' => 200
        ];
    }
}
