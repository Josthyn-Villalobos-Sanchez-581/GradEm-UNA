<?php

namespace App\Services\RegistroServices;

use App\Repositories\RegistroRepositories\RegistroRepository;
use App\Repositories\MailRepositories\MailRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use App\Mail\CodigoVerificacionMail;

class RegistroService
{
    protected $registroRepository;
    protected $mailRepository;

    public function __construct(
        RegistroRepository $registroRepository,
        MailRepository $mailRepository
    ) {
        $this->registroRepository = $registroRepository;
        $this->mailRepository = $mailRepository;
    }

    /**
     * Enviar código OTP
     */
    public function enviarCodigo($request)
    {
        $request->validate(['correo' => 'required|email']);

        // Validar que el correo no esté registrado
        if ($this->registroRepository->correoExiste($request->correo)) {
            throw new \Exception('Este correo ya está registrado');
        }

        $codigo = rand(100000, 999999);

        Session::put('otp_correo', $request->correo);
        Session::put('otp_codigo', $codigo);
        Session::put('otp_expires_at', now()->addMinutes(5));

        // Enviar correo
        $this->mailRepository->enviarCorreo($request->correo, new CodigoVerificacionMail($codigo));

        return response()->json(['message' => 'Código enviado correctamente']);
    }

    /**
     * Validar OTP
     */
    public function validarCodigo($request)
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
            throw new \Exception('Código inválido o expirado');
        }

        session(['otp_validado' => true]);

        return response()->json(['message' => 'Correo validado correctamente']);
    }

    /**
     * Registrar usuario + credencial
     */
    public function registrar($request)
    {
        $datos = $this->registroRepository->validarDatosRegistro($request);

        // Validar que el correo haya sido validado
        if (!session('otp_validado') || $request->correo !== session('otp_correo')) {
            throw new \Exception('Debe validar su correo primero');
        }

        $rol = $this->registroRepository->obtenerRolPorTipoCuenta($request->tipoCuenta);

        if (!$rol) {
            throw new \Exception('Rol no encontrado. Por favor, contacte al administrador');
        }

        // Agregar datos faltantes necesarios para la BD
        $datos['fecha_registro'] = now();
        $datos['estado_id'] = 1; // Estado activo por defecto

        $usuario = $this->registroRepository->crearUsuario($datos, $rol);

        $this->registroRepository->crearCredencial($usuario->id_usuario, $request->password);

        // Limpiar sesión
        session()->forget(['otp_correo', 'otp_codigo', 'otp_expires_at', 'otp_validado']);

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'usuario' => $usuario->id_usuario
        ]);
    }

    /**
     * Verificar correo
     */
    public function verificarCorreo($request)
    {
        $request->validate(['correo' => 'required|email']);

        return response()->json([
            'exists' => $this->registroRepository->correoExiste($request->correo)
        ]);
    }

    /**
     * Verificar identificación
     */
    public function verificarIdentificacion($request)
    {
        $request->validate(['identificacion' => 'required|string']);

        return response()->json([
            'exists' => $this->registroRepository->identificacionExiste($request->identificacion)
        ]);
    }
}
