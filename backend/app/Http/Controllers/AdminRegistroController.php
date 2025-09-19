<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class AdminRegistroController extends Controller
{
    public function store(Request $request)
    {
        // Validación (nota: 'contrasena' usa 'confirmed' -> espera 'contrasena_confirmation')
        $validated = $request->validate([
            'nombre_completo' => 'required|string|max:100',
            'correo'          => 'required|email|max:100|unique:usuarios,correo',
            'identificacion'  => 'required|string|max:20|unique:usuarios,identificacion',
            'telefono'        => 'nullable|string|max:20',
            'rol'             => ['required','string', Rule::in(['Administrador','Dirección','Subdirección'])],
            'universidad'     => 'nullable|string|max:100',
            'carrera'         => 'nullable|string|max:100',
            'contrasena'      => 'required|string|min:8|confirmed',
        ]);

        // log para depuración
        Log::info('RegistroAdmin - datos recibidos', $validated);

        // mapear el rol textual a id en la BD
        $rolesMap = [
            'Administrador' => 2,
            'Dirección'     => 3,
            'Subdirección'  => 4,
        ];
        $rolId = $rolesMap[$validated['rol']];

        // universidad: buscar por nombre, si no existe crearla (dev)
        $idUniversidad = null;
        if (!empty($validated['universidad'])) {
            $idUniversidad = DB::table('universidades')->where('nombre', $validated['universidad'])->value('id_universidad');
            if (!$idUniversidad) {
                $idUniversidad = DB::table('universidades')->insertGetId([
                    'nombre' => $validated['universidad'],
                    'sigla'  => substr($validated['universidad'], 0, 10),
                ]);
            }
        }

        // carrera: buscar por nombre, si no existe crearla (dev)
        $idCarrera = null;
        if (!empty($validated['carrera'])) {
            $idCarrera = DB::table('carreras')->where('nombre', $validated['carrera'])->value('id_carrera');
            if (!$idCarrera) {
                $idCarrera = DB::table('carreras')->insertGetId([
                    'nombre'         => $validated['carrera'],
                    'id_universidad' => $idUniversidad,
                ]);
            }
        }

        // Insertar usuario
        $usuarioId = DB::table('usuarios')->insertGetId([
            'nombre_completo' => $validated['nombre_completo'],
            'correo'          => $validated['correo'],
            'identificacion'  => $validated['identificacion'],
            'telefono'        => $validated['telefono'] ?? null,
            'id_rol'          => $rolId,
            'id_universidad'  => $idUniversidad,
            'id_carrera'      => $idCarrera,
            'fecha_registro'  => now(),
            'estado_id'       => 1,
        ]);

        // Insertar credencial con hash
        DB::table('credenciales')->insert([
            'id_usuario'       => $usuarioId,
            'hash_contrasena'  => Hash::make($validated['contrasena']),
            'fecha_ultimo_login' => null,
            'intentos_fallidos'  => 0,
        ]);

        Log::info("RegistroAdmin - usuario creado", ['id_usuario' => $usuarioId]);

        // Respuesta para XHR (Inertia form.post) o redirección normal
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => 'Usuario registrado correctamente', 'id_usuario' => $usuarioId], 200);
        }

        return back()->with('success', 'Usuario registrado correctamente');
    }
}
