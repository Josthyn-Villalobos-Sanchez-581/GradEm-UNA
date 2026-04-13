<?php

namespace App\Repositories\EventoRepository;

use Illuminate\Support\Facades\DB;

class EventoRepository
{
    /**
     * Obtener eventos con filtros y control por rol
     */
    public function filtrarEventos($request, $usuario)
    {
        $query = DB::table('eventos')
            ->leftJoin('modalidades', 'modalidades.id_modalidad', '=', 'eventos.id_modalidad')
            ->leftJoin('cantones', 'cantones.id_canton', '=', 'eventos.id_ubicacion')
            ->leftJoin('provincias', 'provincias.id_provincia', '=', 'cantones.id_provincia')
            ->leftJoin('paises', 'paises.id_pais', '=', 'provincias.id_pais')
            ->select(
                'eventos.*',
                'modalidades.nombre as modalidad_nombre',
                'cantones.nombre as canton_nombre',
                'provincias.nombre as provincia_nombre',
                'paises.nombre as pais_nombre'
            );

        // Excluir únicamente eventos inactivados.
        $query->where('eventos.estado_id', '!=', 4);

        // 🔒 CONTROL POR ROL
        if (!in_array($usuario->id_rol, [1])) {
            $query->where('eventos.usuario_id', $usuario->id_usuario);
        }

        // 🔍 BÚSQUEDA GENERAL
        if ($request->filled('buscar')) {
            $buscar = $request->buscar;
            $query->where(function ($q) use ($buscar) {
                $q->where('eventos.titulo', 'like', "%{$buscar}%")
                    ->orWhere('eventos.descripcion', 'like', "%{$buscar}%");
            });
        }

        // 📌 FILTRO POR ESTADO (⚠️ OPCIONAL AJUSTAR)
        if ($request->filled('estado') && $request->estado != 2  && $request->estado != 4) {
            $query->where('eventos.estado_id', $request->estado);
        }

        // 📅 FILTRO POR FECHA
        if ($request->filled('fecha_inicio')) {
            $query->whereDate('eventos.fecha_evento', '>=', $request->fecha_inicio);
        }

        if ($request->filled('fecha_fin')) {
            $query->whereDate('eventos.fecha_evento', '<=', $request->fecha_fin);
        }

        return $query
            ->orderBy('eventos.fecha_evento', 'desc')
            ->get();
    }

    /**
     * Obtener evento por ID (IMPORTANTE para seguridad)
     */
    public function obtenerEventoPorId(int $idEvento)
    {
        return DB::table('eventos')
            ->where('id_evento', $idEvento)
            ->first();
    }

    /**
     * Obtener evento con relaciones (para detalle/modal)
     */
    public function obtenerEventoCompleto(int $idEvento)
    {
        $evento = DB::table('eventos')
            ->leftJoin('modalidades', 'modalidades.id_modalidad', '=', 'eventos.id_modalidad')
            ->leftJoin('cantones', 'cantones.id_canton', '=', 'eventos.id_ubicacion')
            ->leftJoin('provincias', 'provincias.id_provincia', '=', 'cantones.id_provincia')
            ->leftJoin('paises', 'paises.id_pais', '=', 'provincias.id_pais')
            ->select(
                'eventos.*',
                'modalidades.nombre as modalidad_nombre',
                'cantones.nombre as canton_nombre',
                'provincias.nombre as provincia_nombre',
                'paises.nombre as pais_nombre'
            )
            ->where('eventos.id_evento', $idEvento)
            ->first();

        if ($evento) {
            $evento->carreras_invitadas = DB::table('evento_carrera')
                ->where('id_evento', $idEvento)
                ->pluck('id_carrera')
                ->toArray();

            $evento->roles_interesados = DB::table('evento_rol')
                ->where('id_evento', $idEvento)
                ->pluck('id_rol')
                ->toArray();
        }

        return $evento;
    }

    /**
     * Obtener modalidades (para filtros frontend)
     */
    public function obtenerModalidades()
    {
        return DB::table('modalidades')
            ->orderBy('nombre')
            ->get();
    }

    /**
     * Obtener ubicaciones (para mostrar info)
     */
    public function obtenerUbicaciones()
    {
        return DB::table('cantones')
            ->join('provincias', 'provincias.id_provincia', '=', 'cantones.id_provincia')
            ->join('paises', 'paises.id_pais', '=', 'provincias.id_pais')
            ->select(
                'cantones.id_canton',
                DB::raw("CONCAT(cantones.nombre, ', ', provincias.nombre, ', ', paises.nombre) as nombre")
            )
            ->orderBy('cantones.nombre')
            ->get();
    }

    /**
     * Obtener carreras para el formulario de eventos
     */
    public function obtenerCarreras()
    {
        return DB::table('carreras')
            ->orderBy('nombre')
            ->get(['id_carrera', 'nombre']);
    }

    /**
     * Obtener roles interesados para el formulario de eventos
     */
    public function obtenerRolesInteresados()
    {
        return DB::table('roles')
            ->whereIn('id_rol', [6, 7])
            ->orderBy('nombre_rol')
            ->get(['id_rol', 'nombre_rol']);
    }

    /**
     * Crear evento
     */
    public function crearEvento(array $data)
    {
        $idEvento = DB::table('eventos')->insertGetId($data);

        return $this->obtenerEventoCompleto($idEvento);
    }

    /**
     * Actualizar evento (incluye inactivar/publicar)
     */
    public function actualizarEvento($evento, array $data)
    {
        // 🔒 SOLO CAMPOS PERMITIDOS
        $camposPermitidos = [
            'titulo',
            'descripcion',
            'fecha_evento',
            'hora_evento',
            'id_modalidad',
            'id_ubicacion',
            'otras_observaciones',
            'estado_id',
        ];

        $dataFiltrada = array_intersect_key(
            $data,
            array_flip($camposPermitidos)
        );

        if (empty($dataFiltrada)) {
            return;
        }

        DB::table('eventos')
            ->where('id_evento', $evento->id_evento)
            ->update($dataFiltrada);
    }

    /**
     * Sincronizar carreras invitadas de un evento
     */
    public function sincronizarCarrerasEvento(int $idEvento, array $carreras)
    {
        DB::table('evento_carrera')->where('id_evento', $idEvento)->delete();

        $insert = array_map(function ($idCarrera) use ($idEvento) {
            return [
                'id_evento' => $idEvento,
                'id_carrera' => $idCarrera,
            ];
        }, $carreras);

        if (!empty($insert)) {
            DB::table('evento_carrera')->insert($insert);
        }
    }

    /**
     * Sincronizar roles interesados de un evento
     */
    public function sincronizarRolesEvento(int $idEvento, array $roles)
    {
        DB::table('evento_rol')->where('id_evento', $idEvento)->delete();

        $insert = array_map(function ($idRol) use ($idEvento) {
            return [
                'id_evento' => $idEvento,
                'id_rol' => $idRol,
            ];
        }, $roles);

        if (!empty($insert)) {
            DB::table('evento_rol')->insert($insert);
        }
    }

    /**
     * Publicar evento
     */
    public function publicarEvento(int $idEvento)
    {
        return DB::table('eventos')
            ->where('id_evento', $idEvento)
            ->update([
                'estado_id' => 1 // ACTIVO
            ]);
    }

    /**
     * Inactivar evento
     */
    public function inactivarEvento(int $idEvento)
    {
        return DB::table('eventos')
            ->where('id_evento', $idEvento)
            ->update([
                'estado_id' => 2 // INACTIVO
            ]);
    }

    /**
     * Obtener usuarios por carreras y roles interesados
     */
    public function obtenerUsuariosPorCarrerasYRoles(array $carreras, array $roles)
    {
        if (empty($carreras) && empty($roles)) {
            return collect();
        }

        $query = DB::table('usuarios')
            ->where('estado_id', 1)
            ->where(function ($q) use ($carreras, $roles) {
                if (!empty($carreras)) {
                    $q->whereIn('id_carrera', $carreras);
                }

                if (!empty($roles)) {
                    if (!empty($carreras)) {
                        $q->orWhereIn('id_rol', $roles);
                    } else {
                        $q->whereIn('id_rol', $roles);
                    }
                }
            });

        return $query->distinct()->select('correo')->get();
    }

    /**
     * Obtener inscritos del evento (para correos - lo usarás luego)
     */
    public function obtenerInscritosEvento(int $idEvento)
    {
        return DB::table('inscripciones_evento')
            ->join('usuarios', 'usuarios.id_usuario', '=', 'inscripciones_evento.id_usuario')
            ->where('inscripciones_evento.id_evento', $idEvento)
            ->where('inscripciones_evento.estado_id', 1) // 🔥 AQUÍ
            ->select('usuarios.correo')
            ->get();
    }
}
