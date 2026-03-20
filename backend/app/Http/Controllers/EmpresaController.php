<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\Usuario;
use App\Models\Credencial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class EmpresaController extends Controller
{

    /**
     * Enviar código OTP
     */
    public function enviarCodigo(Request $request)
    {
        $request->validate([
            'correo' => 'required|email'
        ]);

        if (
            Usuario::where('correo', $request->correo)->exists() ||
            Empresa::where('correo', $request->correo)->exists()
        ) {
            return response()->json([
                'message' => 'Este correo ya está registrado'
            ], 422);
        }

        $codigo = rand(100000, 999999);

        Session::put('otp_correo', $request->correo);
        Session::put('otp_codigo', $codigo);
        Session::put('otp_expires_at', now()->addMinutes(5));

        Mail::raw(
            "Tu código de verificación es: $codigo",
            fn($m) => $m->to($request->correo)->subject('Código de verificación')
        );

        return response()->json([
            'message' => 'Código enviado correctamente'
        ]);
    }

    /**
     * Validar OTP
     */
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
            return response()->json([
                'message' => 'Código inválido o expirado'
            ], 422);
        }

        session(['otp_validado' => true]);

        return response()->json([
            'message' => 'Correo validado correctamente'
        ]);
    }

    /**
     * Registrar empresa
     */
    public function store(Request $request)
    {
        if (!session('otp_validado') || $request->correo !== session('otp_correo')) {
            return response()->json([
                'message' => 'Debe validar su correo primero'
            ], 422);
        }

        $request->validate([
            'nombre'           => 'required|string|min:3|max:100|unique:empresas,nombre',
            'correo'           => 'required|email|unique:empresas,correo|unique:usuarios,correo',
            'telefono'         => 'required|string',
            'persona_contacto' => 'required|string',
            'identificacion'   => 'required|string|unique:usuarios,identificacion',
            'password'         => 'required|confirmed|min:8',
        ]);

        $usuario = Usuario::create([
            'nombre_completo' => $request->persona_contacto,
            'correo' => $request->correo,
            'identificacion' => $request->identificacion,
            'id_rol' => 5
        ]);

        Credencial::create([
            'id_usuario' => $usuario->id_usuario,
            'hash_contrasena' => Hash::make($request->password)
        ]);

        $empresa = Empresa::create([
            'nombre' => $request->nombre,
            'correo' => $request->correo,
            'telefono' => $request->telefono,
            'persona_contacto' => $request->persona_contacto,
            'usuario_id' => $usuario->id_usuario
        ]);

        session()->forget([
            'otp_correo',
            'otp_codigo',
            'otp_expires_at',
            'otp_validado'
        ]);

        return response()->json([
            'message' => 'Empresa registrada correctamente',
            'empresa' => $empresa->id_empresa
        ]);
    }

    /**
     * Verificar identificación
     */
    public function verificarIdentificacion(Request $request)
    {
        $request->validate([
            'identificacion' => 'required|string'
        ]);

        return response()->json([
            'exists' => Usuario::where('identificacion', $request->identificacion)->exists()
        ]);
    }

    /**
     * Listar empresas
     */
    public function listarEmpresas(Request $request)
    {
        $query = Empresa::with('usuario.fotoPerfil');

        // 🔎 BUSCAR
        if ($request->buscar) {
            $query->where('nombre', 'like', '%' . $request->buscar . '%');
        }

        // 📄 CANTIDAD POR PAGINA
        $perPage = $request->per_page ?? 10;

        $empresas = $query
            ->orderBy('nombre')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('empresas/lista-empresas', [
            'empresas' => $empresas,

            'filtros' => [
                'buscar' => $request->buscar,
                'per_page' => $perPage
            ],

            'userPermisos' => getUserPermisos()
        ]);
    }


    /**
     * Ver empresa
     */
    public function verEmpresa($id)
    {
        $empresa = Empresa::with([
            'usuario.fotoPerfil',
            'ofertas' => function ($query) {
                $query->where('estado_id', 1);
            }
        ])->where('id_empresa', $id)->firstOrFail();

        return Inertia::render('empresas/ver-empresa', [
            'empresa' => $empresa,
            'userPermisos' => getUserPermisos(),
        ]);
    }
}
