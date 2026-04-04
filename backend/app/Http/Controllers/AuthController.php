<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AuthServices\AuthService;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    private AuthService $service;

    public function __construct(AuthService $service)
    {
        $this->service = $service;
    }

    public function login(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
            'password' => 'required',
        ]);

        $respuesta = $this->service->login(
            $request->only('correo', 'password', 'force')
        );

        /*
        |--------------------------------------------------------------------------
        | Si el servicio devolvió JSON, convertirlo a redirect Inertia
        |--------------------------------------------------------------------------
        */

        if ($respuesta instanceof \Illuminate\Http\JsonResponse) {

            $data = $respuesta->getData(true);
            $status = $respuesta->getStatusCode();

            // login correcto
            if (isset($data['redirect'])) {

                $redirect = $request->input('redirect');
                
                // Determinar la URL de destino
                $redirectUrl = $redirect && str_starts_with($redirect, '/') 
                    ? $redirect 
                    : $data['redirect'];

                // Si es una solicitud normal, hacer redirect HTML
                return redirect()->to($redirectUrl);
            }

            // Sesión activa (requiere force)
            if ($status === 423 && isset($data['requiresForce'])) {
                return back()->withErrors([
                    'force_required' => $data['message'] ?? 'Esta cuenta ya tiene una sesión activa.'
                ])->withInput();
            }

            // Bloqueo por intentos fallidos
            if ($status === 423 && isset($data['code']) && $data['code'] === 'too_many_attempts') {
                return back()->withErrors([
                    'lockout' => $data['message'] ?? 'Cuenta bloqueada por intentos fallidos.',
                    'retry_after' => $data['retryAfter'] ?? 60
                ])->withInput();
            }

            // Otros errores
            return back()->withErrors([
                'correo' => $data['message'] ?? 'Error al iniciar sesión'
            ])->withInput();
        }

        return $respuesta;
    }

    public function logout(Request $request)
    {
        $this->service->logout($request);

        return redirect('/login');
    }
}