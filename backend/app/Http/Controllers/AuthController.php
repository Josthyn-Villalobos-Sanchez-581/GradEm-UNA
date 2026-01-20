<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AuthServices\AuthService;

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

        return $this->service->login($request->all());
    }

    public function logout(Request $request)
    {
        return $this->service->logout($request);
    }
}
