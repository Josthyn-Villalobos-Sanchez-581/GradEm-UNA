<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RestablecerContrasenaRequest;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;

class ContrasenaController extends Controller
{
    public function restablecer(RestablecerContrasenaRequest $request)
    {
        $estado = Password::reset(
            [
                'email'                 => $request->input('correo'),
                'password'              => $request->input('contrasena'),
                'password_confirmation' => $request->input('contrasena_confirmation'),
                'token'                 => $request->input('token'),
            ],
            function ($usuario, $password) {
                $usuario->password = Hash::make($password);
                $usuario->setRememberToken(Str::random(60));
                $usuario->save();

                event(new PasswordReset($usuario));
            }
        );

        return $estado === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Contraseña restablecida correctamente.'])
            : response()->json(['message' => __($estado)], 422);
    }
}
