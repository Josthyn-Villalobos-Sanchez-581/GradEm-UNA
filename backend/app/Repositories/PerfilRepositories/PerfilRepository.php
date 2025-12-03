<?php

namespace App\Repositories\PerfilRepositories;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Usuario;
use App\Models\PlataformaExterna;

class PerfilRepository
{
    public function obtenerUsuarioConFoto()
    {
        return Usuario::with('fotoPerfil')->find(Auth::id());
    }

    public function obtenerPermisosRol($idRol)
    {
        return DB::table('roles_permisos')
            ->where('id_rol', $idRol)
            ->pluck('id_permiso')
            ->toArray();
    }

    public function obtenerAreasLaborales()
    {
        return DB::table('areas_laborales')
            ->select('id_area_laboral as id', 'nombre')
            ->get();
    }

    public function obtenerPaises()
    {
        return DB::table('paises')
            ->select('id_pais as id', 'nombre')
            ->get();
    }

    public function obtenerProvincias()
    {
        return DB::table('provincias')
            ->select('id_provincia as id', 'nombre', 'id_pais')
            ->get();
    }

    public function obtenerCantones()
    {
        return DB::table('cantones')
            ->select('id_canton as id', 'nombre', 'id_provincia')
            ->get();
    }

    public function obtenerUniversidades()
    {
        return DB::table('universidades')
            ->select('id_universidad as id', 'nombre', 'sigla')
            ->get();
    }

    public function obtenerCarreras()
    {
        return DB::table('carreras')
            ->select('id_carrera as id', 'nombre', 'id_universidad', 'area_conocimiento')
            ->get();
    }

    public function obtenerNombreRol($idRol)
    {
        return DB::table('roles')
            ->where('id_rol', $idRol)
            ->value('nombre_rol');
    }

    public function obtenerPlataformas($idUsuario)
    {
        return PlataformaExterna::where('id_usuario', $idUsuario)->get();
    }

    public function obtenerEmpresaUsuario($idUsuario)
    {
        return DB::table('empresas')
            ->where('usuario_id', $idUsuario)
            ->first();
    }

    public function actualizarUsuario($idUsuario, array $datos)
    {
        return \App\Models\Usuario::where('id_usuario', $idUsuario)->update($datos);
    }

    public function actualizarEmpresa($idUsuario, array $datos)
    {
        return DB::table('empresas')
            ->where('usuario_id', $idUsuario)
            ->update($datos);
    }

    public function correoExisteExceptoUsuario($correo, $idUsuario)
    {
        return DB::table('usuarios')
            ->where('correo', $correo)
            ->where('id_usuario', '!=', $idUsuario)
            ->exists();
    }

    public function existeIdentificacion($identificacion, $idUsuarioActual)
    {
        return DB::table('usuarios')
            ->where('identificacion', $identificacion)
            ->where('id_usuario', '!=', $idUsuarioActual)
            ->exists();
    }
}
