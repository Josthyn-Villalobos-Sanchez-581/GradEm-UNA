<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Usuario;
use App\Models\PlataformaExterna;
use App\Mail\CodigoVerificacionMail;
use Illuminate\Support\Facades\Mail;

use Illuminate\Support\Facades\Log;

class PerfilController extends Controller
{
    /**
     * Mostrar el perfil del usuario con relación a fotoPerfil cargada
     */
    public function index()
    {
        /** @var Usuario $usuario */
        $usuario = Usuario::with('fotoPerfil')->find(Auth::id());

        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        $areasLaborales = DB::table('areas_laborales')
            ->select('id_area_laboral as id', 'nombre')
            ->get();

        $paises = DB::table('paises')
            ->select('id_pais as id', 'nombre')
            ->get();

        $provincias = DB::table('provincias')
            ->select('id_provincia as id', 'nombre', 'id_pais')
            ->get();

        $cantones = DB::table('cantones')
            ->select('id_canton as id', 'nombre', 'id_provincia')
            ->get();

        $universidades = DB::table('universidades')
            ->select('id_universidad as id', 'nombre', 'sigla')
            ->get();

        $carreras = DB::table('carreras')
            ->select('id_carrera as id', 'nombre', 'id_universidad', 'area_conocimiento')
            ->get();

        $nombreRol = DB::table('roles')
            ->where('id_rol', $usuario->id_rol)
            ->value('nombre_rol');


        $plataformas = PlataformaExterna::where('id_usuario', $usuario->id_usuario)->get();
        // Cargar empresa asociada al usuario
        $empresa = DB::table('empresas')
            ->where('usuario_id', $usuario->id_usuario)
            ->first();

        return Inertia::render('Perfil/Index', [
            'usuario' => [
                ...$usuario->toArray(),
                'fotoPerfil' => $usuario->fotoPerfil ? $usuario->fotoPerfil->toArray() : null,
            ],
            'empresa' => $empresa, // 🔹 enviar la empresa a la vista
            'userPermisos' => $userPermisos,
            'areaLaborales' => $areasLaborales,
            'paises' => $paises,
            'provincias' => $provincias,
            'cantones' => $cantones,
            'universidades' => $universidades,
            'carreras' => $carreras,
            'plataformas' => $plataformas,
            'rolNombre' => $nombreRol,
        ]);
    }


    public function edit()
    {
        /** @var Usuario $usuario */
        $usuario = Usuario::with('fotoPerfil')->find(Auth::id());
        $rolNombre = $usuario->rol->nombre_rol ?? null;
        $empresa = null;

        if (strtolower($rolNombre) === 'empresa') {
            $empresa = DB::table('empresas')
                ->where('usuario_id', $usuario->id_usuario)
                ->first();
        }
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        $areasLaborales = DB::table('areas_laborales')
            ->select('id_area_laboral as id', 'nombre')
            ->get();

        $paises = DB::table('paises')
            ->select('id_pais as id', 'nombre')
            ->get();

        $provincias = DB::table('provincias')
            ->select('id_provincia as id', 'nombre', 'id_pais')
            ->get();

        $cantones = DB::table('cantones')
            ->select('id_canton as id', 'nombre', 'id_provincia')
            ->get();

        $universidades = DB::table('universidades')
            ->select('id_universidad as id', 'nombre', 'sigla')
            ->get();

        $carreras = DB::table('carreras')
            ->select('id_carrera as id', 'nombre', 'id_universidad', 'area_conocimiento')
            ->get();

        $nombreRol = DB::table('roles')
            ->where('id_rol', $usuario->id_rol)
            ->value('nombre_rol');

        return Inertia::render('Perfil/Editar', [
            'empresa' => $empresa,
            'usuario' => [
                ...$usuario->toArray(),
                'fotoPerfil' => $usuario->fotoPerfil ? $usuario->fotoPerfil->toArray() : null,
            ],
            'userPermisos' => $userPermisos,
            'areaLaborales' => $areasLaborales,
            'paises' => $paises,
            'provincias' => $provincias,
            'cantones' => $cantones,
            'universidades' => $universidades,
            'carreras' => $carreras,
            'rolNombre' => $nombreRol,
        ]);
    }

    public function update(Request $request)
    {
        try {
            /** @var Usuario $usuario */
            $usuario = Auth::user();
            $rolNombre = strtolower($usuario->rol->nombre_rol ?? '');

            // Normalizar campos vacíos
            $dataToValidate = $request->all();
            foreach ($dataToValidate as $key => $value) {
                if ($value === '') {
                    $dataToValidate[$key] = null;
                }
            }

            // ======================================================
            // 🔹 CASO 1: EMPRESA
            // ======================================================
            if (trim(strtolower($rolNombre)) === 'empresa') {

                $validated = validator($dataToValidate, [
                    'nombre_completo'          => 'required|string|max:100',
                    'identificacion'           => 'required|string|max:50|unique:usuarios,identificacion,' . $usuario->id_usuario . ',id_usuario',

                    // VALIDACIÓN DE CORREO DEL USUARIO
                    'correo'                   => 'required|email|max:100|unique:usuarios,correo,' . $usuario->id_usuario . ',id_usuario',

                    // VALIDACIÓN DE DATOS DE EMPRESA
                    'empresa_nombre'           => 'required|string|max:100',
                    'empresa_correo'           => 'required|email|max:100', // ← AHORA TAMBIÉN REQUIRED
                    'empresa_telefono'         => 'nullable|string|max:20',
                    'empresa_persona_contacto' => 'required|string|max:100',
                    'id_canton'                => 'nullable|integer|exists:cantones,id_canton',
                ])->validate();


                // ======================================================
                // 🔹 ACTUALIZAR USUARIO (INCLUYENDO CORREO)
                // ======================================================
                $usuario->update([
                    'nombre_completo' => $validated['nombre_completo'],
                    'identificacion'  => $validated['identificacion'],
                    'correo'          => $validated['correo'],       // <<< ***AQUÍ ESTÁ LA SOLUCIÓN***
                    'id_canton'       => $validated['id_canton'],
                ]);


                // ======================================================
                // 🔹 ACTUALIZAR EMPRESA
                // ======================================================
                DB::table('empresas')
                    ->where('usuario_id', $usuario->id_usuario)
                    ->update([
                        'nombre'           => $validated['empresa_nombre'],
                        'correo'           => $validated['empresa_correo'],
                        'telefono'         => $validated['empresa_telefono'] ?? null,
                        'persona_contacto' => $validated['empresa_persona_contacto'],
                    ]);


                return redirect(route('perfil.index'))
                    ->with('success', 'Datos de la empresa actualizados con éxito.');
            }

            // ======================================================
            // 🔹 CASO 2: EGRESADO / ESTUDIANTE / OTROS
            // ======================================================
            $validated = validator($dataToValidate, [
                'nombre_completo' => 'required|string|max:100',
                'correo' => 'required|email|max:100|unique:usuarios,correo,' . $usuario->id_usuario . ',id_usuario',
                'identificacion' => 'required|string|max:50|unique:usuarios,identificacion,' . $usuario->id_usuario . ',id_usuario',
                'telefono' => 'nullable|string|max:20',
                'fecha_nacimiento' => 'nullable|date',
                'genero' => 'nullable|string|max:10',
                'estado_empleo' => 'nullable|string|max:20',
                'estado_estudios' => 'nullable|string|max:20',
                'anio_graduacion' => 'nullable|integer',
                'nivel_academico' => 'nullable|string|max:50',
                'tiempo_conseguir_empleo' => 'nullable|integer',
                'area_laboral_id' => 'nullable|integer|exists:areas_laborales,id_area_laboral',
                'id_canton' => 'nullable|integer|exists:cantones,id_canton',
                'salario_promedio' => 'nullable|string|max:50',
                'tipo_empleo' => 'nullable|string|max:50',
                'id_universidad' => 'nullable|integer|exists:universidades,id_universidad',
                'id_carrera' => 'nullable|integer|exists:carreras,id_carrera',
            ])->validate();

            $usuario->fill($validated);
            $usuario->save();

            return redirect(route('perfil.index'))
                ->with('success', 'Datos personales actualizados con éxito.');
        }

        // ======================================================
        // 🔹 MANEJO DE ERRORES
        // ======================================================
        catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->validator)->withInput();
        } catch (\Throwable $e) {
            Log::error('Error al actualizar perfil: ' . $e->getMessage());
            return back()->with('error', 'Ocurrió un error al actualizar los datos.')->withInput();
        }
    }

    public function verificarCorreo(Request $request)
    {
        $request->validate([
            'correo' => 'required|email|max:100',
        ]);

        $correo = $request->correo;

        // Verificar si existe en la BD
        $existe = DB::table('usuarios')
            ->where('correo', $correo)
            ->where('id_usuario', '!=', Auth::id()) // evitar conflicto con su mismo correo
            ->exists();

        return response()->json([
            'existe' => $existe
        ]);
    }


    public function enviarCodigoCorreo(Request $request)
    {
        $request->validate([
            'correo' => 'required|email|max:100',
        ]);

        $codigo = rand(100000, 999999);

        session([
            'codigo_verificacion_correo' => $codigo,
            'correo_a_verificar' => $request->correo,
            'codigo_expira' => now()->addMinutes(5),
        ]);

        Mail::to($request->correo)->send(new CodigoVerificacionMail($codigo));

        return response()->json([
            'message' => 'Código enviado con éxito al correo proporcionado.'
        ]);
    }



    public function validarCodigoCorreo(Request $request)
    {
        $request->validate([
            'codigo' => 'required',
        ]);

        if (!session()->has('codigo_verificacion_correo')) {
            return response()->json(['error' => 'Debe solicitar un código primero'], 422);
        }

        if (now()->greaterThan(session('codigo_expira'))) {
            return response()->json(['error' => 'El código ha expirado'], 422);
        }

        if ($request->codigo != session('codigo_verificacion_correo')) {
            return response()->json(['error' => 'El código es incorrecto'], 422);
        }

        return response()->json([
            'message' => 'Correo verificado con éxito',
            'correoVerificado' => session('correo_a_verificar'),
        ]);
    }

    public function verificarIdentificacion(Request $request)
    {
        $request->validate([
            'identificacion' => 'required|string|max:12',
        ]);

        $identificacion = $request->identificacion;

        // Verificar si existe, excluyendo al usuario actual
        $existe = DB::table('usuarios')
            ->where('identificacion', $identificacion)
            ->where('id_usuario', '!=', Auth::id())
            ->exists();

        return response()->json([
            'existe' => $existe
        ]);
    }
}
