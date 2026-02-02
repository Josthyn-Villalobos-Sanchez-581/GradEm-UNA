<?php

namespace App\Services\EmpresaServices;

use App\Repositories\EmpresaRepositories\EmpresaRepository;
use App\Repositories\MailRepositories\MailRepository;
use Illuminate\Support\Facades\Session;

class EmpresaService
{
    protected $empresaRepository;
    protected $mailRepository;

    public function __construct(
        EmpresaRepository $empresaRepository,
        MailRepository $mailRepository
    ) {
        $this->empresaRepository = $empresaRepository;
        $this->mailRepository = $mailRepository;
    }

    /**
     * Enviar código OTP
     */
    public function enviarCodigo($request)
    {
        $request->validate(['correo' => 'required|email']);

        // Validar que el correo no esté registrado en usuarios ni en empresas
        if ($this->empresaRepository->correoExisteUsuario($request->correo) || $this->empresaRepository->correoExisteEmpresa($request->correo)) {
            throw new \Exception('Este correo ya está registrado');
        }

        $codigo = rand(100000, 999999);

        Session::put('otp_correo', $request->correo);
        Session::put('otp_codigo', $codigo);
        Session::put('otp_expires_at', now()->addMinutes(5));

        // Enviar correo
        $this->empresaRepository->enviarCodigo($request->correo, $codigo);

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
     * Registrar empresa + usuario + credencial
     */
    public function registrar($request)
    {
        // Validar primero que el correo haya sido validado
        if (!session('otp_validado') || $request->correo !== session('otp_correo')) {
            throw new \Exception('Debe validar su correo primero');
        }

        // Validar los datos del formulario
        $datos = $this->empresaRepository->validarDatosRegistro($request);

        // Crear usuario encargado
        $usuario = $this->empresaRepository->crearUsuario(
            $request->persona_contacto,
            $request->correo,
            $request->identificacion
        );

        // Crear credenciales del usuario
        $this->empresaRepository->crearCredencial($usuario->id_usuario, $request->password);

        // Crear empresa
        $empresa = $this->empresaRepository->crearEmpresa(
            $request->nombre,
            $request->correo,
            $request->telefono,
            $request->persona_contacto,
            $usuario->id_usuario
        );

        // Limpiar sesión
        session()->forget(['otp_correo', 'otp_codigo', 'otp_expires_at', 'otp_validado']);

        return response()->json([
            'message' => 'Empresa registrada correctamente',
            'empresa' => $empresa->id_empresa
        ]);
    }

    /**
     * Verificar identificación
     */
    public function verificarIdentificacion($request)
    {
        $request->validate(['identificacion' => 'required|string']);

        return response()->json([
            'exists' => $this->empresaRepository->identificacionExiste($request->identificacion)
        ]);
    }
}
