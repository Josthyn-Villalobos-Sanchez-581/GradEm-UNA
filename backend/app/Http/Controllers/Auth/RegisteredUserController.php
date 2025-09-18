<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Usuario; // Importar el modelo Usuario
use App\Models\Egresado; // Importar el modelo Egresado
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Validar los datos recibidos del formulario de React
        $request->validate([
            'nombre_completo' => ['required', 'string', 'max:255'],
            'correo' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.Usuario::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'tipoCuenta' => ['required', 'string'],
            'numeroIdentificacion' => ['required', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:255'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'fechaNacimiento' => ['nullable', 'date'],
            'genero' => ['nullable', 'string'],
            'estadoEmpleo' => ['nullable', 'string'],
            'estadoEstudios' => ['nullable', 'string'],
            'anoGraduacion' => ['required_if:tipoCuenta,egresado', 'string', 'max:4', 'nullable'],
            'empresaActual' => ['required_if:tipoCuenta,egresado', 'string', 'max:255', 'nullable'],
        ]);

        // Asignar el ID de rol basado en el tipo de cuenta. 
        // Se asume 2 para estudiantes y 3 para egresados, según la estructura de la base de datos.
        $id_rol = ($request->tipoCuenta === 'estudiante') ? 2 : 3;

        // Crear el nuevo usuario en la tabla 'usuarios'
        $usuario = Usuario::create([
            'nombre_completo' => $request->nombre_completo,
            'correo' => $request->correo,
            'password' => Hash::make($request->password),
            'identificacion' => $request->numeroIdentificacion,
            'telefono' => $request->telefono,
            'direccion' => $request->direccion,
            'fecha_nacimiento' => $request->fechaNacimiento,
            'genero' => $request->genero,
            'estado_empleo' => $request->estadoEmpleo,
            'estado_estudios' => $request->estadoEstudios,
            'id_rol' => $id_rol,
            'estado_id' => 1, // Puedes ajustar este valor si el estado inicial de un usuario registrado es diferente
        ]);

        // Si el usuario es un egresado, crear el registro correspondiente en la tabla 'egresados'
        if ($request->tipoCuenta === 'egresado') {
            Egresado::create([
                'id_usuario' => $usuario->id_usuario,
                'ano_graduacion' => $request->anoGraduacion,
                'empresa_actual' => $request->empresaActual,
            ]);
        }
        
        // Autenticar al usuario y redirigir
        Auth::login($usuario);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}