<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

        // Traer áreas laborales
        $areasLaborales = DB::table('areas_laborales')
            ->select('id_area_laboral as id', 'nombre')
            ->get();

        // Traer ubicaciones
        $ubicaciones = DB::table('cantones as c')
        ->join('provincias as p', 'c.id_provincia', '=', 'p.id_provincia')
        ->join('paises as pa', 'p.id_pais', '=', 'pa.id_pais')
        ->select(
            'c.id_canton as id',
            'pa.nombre as pais',
            'p.nombre as provincia',
            'c.nombre as canton'
        )
        ->get();


        return Inertia::render('Perfil/Index', [
            'usuario' => $usuario,
            'userPermisos' => $userPermisos,
            'areaLaborales' => $areasLaborales,
            'ubicaciones' => $ubicaciones,
        ]);
    }


    public function update(Request $request, $id)
    {
        $usuario = Usuario::findOrFail($id);

        // Limpiar los campos vacíos antes de validar
        $dataToValidate = $request->all();
        foreach ($dataToValidate as $key => $value) {
            if ($value === '') {
                $dataToValidate[$key] = null;
            }
        }

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
            // Corrección de los nombres de las columnas
            'area_laboral_id' => 'nullable|integer|exists:areas_laborales,id_area_laboral',
            'id_canton' => 'nullable|integer|exists:cantones,id_canton',
            'salario_promedio' => 'nullable|string|max:50',
            'tipo_empleo' => 'nullable|string|max:50',
        ])->validate();


        $usuario->update($data);

        return redirect()->route('perfil.index')->with('success', 'Perfil actualizado correctamente');
    }
}
