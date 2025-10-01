<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CheckPermiso
{
    /**
     * Maneja la solicitud entrante verificando si el usuario
     * tiene el permiso requerido de acuerdo a su rol.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  int  $permisoId
     * @return mixed
     */
    public function handle($request, Closure $next, int $permisoId)
    {
        $usuario = Auth::user();

        // 🚨 Usuario no autenticado
        if (!$usuario) {
            return redirect()->route('login');
        }

        // 🔍 Consultar en roles_permisos si el rol tiene el permiso
        $tienePermiso = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->where('id_permiso', $permisoId)
            ->exists();

        if ($tienePermiso) {
            return $next($request);
        }

        // 🚫 Denegar acceso
        abort(403, 'No tiene permisos para acceder a esta sección.');
    }
}
