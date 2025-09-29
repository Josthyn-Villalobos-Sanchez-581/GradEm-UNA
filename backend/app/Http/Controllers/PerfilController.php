<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Usuario;

class PerfilController extends Controller
{
    public function index()
    {
        $usuario = Auth::user();

        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        // Áreas laborales
        $areasLaborales = DB::table('areas_laborales')
            ->select('id_area_laboral as id', 'nombre')
            ->get();

        // Paises
        $paises = DB::table('paises')
            ->select('id_pais as id', 'nombre')
            ->get();

        // Provincias
        $provincias = DB::table('provincias')
            ->select('id_provincia as id', 'nombre', 'id_pais')
            ->get();

        // Cantones
        $cantones = DB::table('cantones')
            ->select('id_canton as id', 'nombre', 'id_provincia')
            ->get();

        // Universidades
        $universidades = DB::table('universidades')
            ->select('id_universidad as id', 'nombre', 'sigla')
            ->get();

        // Carreras
        $carreras = DB::table('carreras')
            ->select('id_carrera as id', 'nombre', 'id_universidad', 'area_conocimiento')
            ->get();


        return Inertia::render('Perfil/Index', [
            'usuario' => $usuario,
            'userPermisos' => $userPermisos,
            'areaLaborales' => $areasLaborales,
            'paises' => $paises,
            'provincias' => $provincias,
            'cantones' => $cantones,
            'universidades' => $universidades,
            'carreras' => $carreras,
        ]);

    }

    public function edit()
    {
        $usuario = Auth::user();

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

        return Inertia::render('Perfil/Editar', [
            'usuario' => $usuario,
            'userPermisos' => $userPermisos,
            'areaLaborales' => $areasLaborales,
            'paises' => $paises,
            'provincias' => $provincias,
            'cantones' => $cantones,
            'universidades' => $universidades,
            'carreras' => $carreras,
        ]);
    }


   public function update(Request $request)
{
    try {
        /** @var \App\Models\Usuario $usuario */
        $usuario = Auth::user(); // usuario autenticado

        // Limpiar los campos vacíos antes de validar
        $dataToValidate = $request->all();
        foreach ($dataToValidate as $key => $value) {
            if ($value === '') {
                $dataToValidate[$key] = null;
            }
        }

        // Validación
        $data = validator($dataToValidate, [
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

        // Guardar cambios
        $usuario->fill($data);
        $usuario->save();

        return redirect(route('perfil.index'))->with('success', 'Datos guardados con éxito');



    } catch (\Illuminate\Validation\ValidationException $e) {
        return back()
            ->withErrors($e->validator)
            ->withInput();
            
    } catch (\Throwable $e) {
        return back()
            ->with('error', 'Ocurrió un error al actualizar los datos.')
            ->withInput();
    }
}
}
