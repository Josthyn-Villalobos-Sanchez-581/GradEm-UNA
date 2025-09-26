<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use App\Models\Permiso;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RolesPermisosController extends Controller
{
    public function index(Request $request)
    {
        $usuario = Auth::user();
        $searchRol = $request->input('searchRol');
        $searchPermiso = $request->input('searchPermiso');
        $visibleSections = $request->input('visibleSections',['roles','permisos','asignacion']);

        $roles = Rol::with('permisos')
            ->when($searchRol,function($q) use ($searchRol){
                $q->where('nombre_rol','LIKE',"%{$searchRol}%")->orWhere('id_rol',is_numeric($searchRol)?$searchRol:0);
            })
            ->paginate(10)->withQueryString();

        $permisos = Permiso::when($searchPermiso,function($q) use ($searchPermiso){
            $q->where('nombre','LIKE',"%{$searchPermiso}%")->orWhere('id_permiso',is_numeric($searchPermiso)?$searchPermiso:0);
        })->paginate(10)->withQueryString();

        $todosPermisos = Permiso::all(['id_permiso','nombre']);
        $userPermisos = DB::table('roles_permisos')->where('id_rol',$usuario->id_rol)->pluck('id_permiso')->toArray();

        return Inertia::render('Roles_Permisos/Index',[
            'roles'=>$roles,
            'permisos'=>$permisos,
            'todosPermisos'=>$todosPermisos,
            'userPermisos'=>$userPermisos,
            'filters'=>['searchRol'=>$searchRol,'searchPermiso'=>$searchPermiso],
            'visibleSections'=>$visibleSections
        ]);
    }

    public function asignarPermisos(Request $request,$rolId)
    {
        $rol = Rol::findOrFail($rolId);
        $request->validate([
            'permisos'=>'required|array|min:1',
            'permisos.*'=>'exists:permisos,id_permiso'
        ]);

        $rol->permisos()->sync(array_unique($request->permisos));
        $this->registrarBitacora('roles_permisos','asignar',"Permisos actualizados rol ID {$rolId}: ".implode(',',$request->permisos));

        return back();
    }

    private function registrarBitacora($tabla,$operacion,$descripcion)
    {
        DB::table('bitacora_cambios')->insert([
            'tabla_afectada'=>$tabla,
            'operacion'=>$operacion,
            'usuario_responsable'=>Auth::id(),
            'descripcion_cambio'=>$descripcion,
            'fecha_cambio'=>now()
        ]);
    }
}
