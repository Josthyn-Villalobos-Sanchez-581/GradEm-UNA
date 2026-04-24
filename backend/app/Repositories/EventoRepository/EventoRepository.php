<?php
// backend/app/Repositories/EventoRepository/EventoRepository.php 
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
            ->leftJoin('usuarios', 'usuarios.id_usuario', '=', 'eventos.usuario_id')
            ->leftJoin('modalidades', 'modalidades.id_modalidad', '=', 'eventos.id_modalidad')
            ->leftJoin('cantones', 'cantones.id_canton', '=', 'eventos.id_ubicacion')
            ->leftJoin('provincias', 'provincias.id_provincia', '=', 'cantones.id_provincia')
            ->leftJoin('paises', 'paises.id_pais', '=', 'provincias.id_pais')

            ->select(
                'eventos.*',
                'usuarios.nombre_completo as creador_nombre',
                'modalidades.nombre as modalidad_nombre',
                'cantones.nombre as canton_nombre',
                'provincias.nombre as provincia_nombre',
                'paises.nombre as pais_nombre'
            );

        //AQUÍ VA (INMEDIATAMENTE DESPUÉS DEL QUERY)
        $query->whereNotIn('eventos.estado_id', [2, 4]);

        // CONTROL POR ROL
        if (!in_array($usuario->id_rol, [1])) {
            $query->where('eventos.usuario_id', $usuario->id_usuario);
        }

        // BÚSQUEDA GENERAL
        if ($request->filled('buscar')) {
            $buscar = $request->buscar;
            $query->where(function ($q) use ($buscar) {
                $q->where('eventos.titulo', 'like', "%{$buscar}%")
                    ->orWhere('eventos.descripcion', 'like', "%{$buscar}%");
            });
        }

        // FILTRO POR ESTADO (⚠️ OPCIONAL AJUSTAR)
        if ($request->filled('estado') && $request->estado != 2  && $request->estado != 4) {
            $query->where('eventos.estado_id', $request->estado);
        }

        // FILTRO POR FECHA
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
            ->leftJoin('usuarios', 'usuarios.id_usuario', '=', 'eventos.usuario_id')
            ->leftJoin('modalidades', 'modalidades.id_modalidad', '=', 'eventos.id_modalidad')
            ->leftJoin('cantones', 'cantones.id_canton', '=', 'eventos.id_ubicacion')
            ->leftJoin('provincias', 'provincias.id_provincia', '=', 'cantones.id_provincia')
            ->leftJoin('paises', 'paises.id_pais', '=', 'provincias.id_pais')

            // 🔥 CLAVE: JOIN PARA CONTAR INSCRITOS
            ->leftJoin('inscripciones_evento as ie', function ($join) {
                $join->on('ie.id_evento', '=', 'eventos.id_evento')
                    ->where('ie.estado_id', 1);
            })

            ->where('eventos.id_evento', $idEvento)

            ->select(
                'eventos.*',
                'usuarios.nombre_completo as creador_nombre',
                'modalidades.nombre as modalidad_nombre',
                'cantones.nombre as canton_nombre',
                'provincias.nombre as provincia_nombre',
                'paises.nombre as pais_nombre',

                // 🔥 TOTAL INSCRITOS
                DB::raw('COUNT(ie.id_inscripcion) as inscritos_count')
            )

            // 🔥 NECESARIO POR EL COUNT
            ->groupBy(
                'eventos.id_evento',
                'usuarios.nombre_completo',
                'modalidades.nombre',
                'cantones.nombre',
                'provincias.nombre',
                'paises.nombre'
            )

            ->first();

        if ($evento) {

            // 🔥 CUPOS DISPONIBLES (BACKEND LIMPIO)
            $evento->cupos_disponibles = is_null($evento->cupos)
                ? null
                : max(0, $evento->cupos - $evento->inscritos_count);

            // =============================
            // RELACIONES EXISTENTES
            // =============================

            $evento->carreras_invitadas = DB::table('evento_carrera')
                ->where('id_evento', $idEvento)
                ->pluck('id_carrera')
                ->toArray();

            $evento->roles_interesados = DB::table('evento_rol')
                ->where('id_evento', $idEvento)
                ->pluck('id_rol')
                ->toArray();

            $evento->carreras = DB::table('evento_carrera')
                ->join('carreras', 'carreras.id_carrera', '=', 'evento_carrera.id_carrera')
                ->where('evento_carrera.id_evento', $idEvento)
                ->pluck('carreras.nombre');

            $evento->roles = DB::table('evento_rol')
                ->join('roles', 'roles.id_rol', '=', 'evento_rol.id_rol')
                ->where('evento_rol.id_evento', $idEvento)
                ->pluck('roles.nombre_rol');
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
        //SOLO CAMPOS PERMITIDOS
        $camposPermitidos = [
            'titulo',
            'descripcion',
            'fecha_evento',
            'hora_evento',
            'id_modalidad',
            'id_ubicacion',
            'otras_observaciones',
            'estado_id',
            'cupos',
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
            ->where('inscripciones_evento.estado_id', 1)
            ->select('usuarios.correo')
            ->get();
    }

    /**
     * Obtener inscritos del evento para gestión
     */
    public function obtenerInscritosGestionEvento(int $idEvento)
    {
        return DB::table('inscripciones_evento')
            ->join('usuarios', 'usuarios.id_usuario', '=', 'inscripciones_evento.id_usuario')
            ->leftJoin('universidades', 'universidades.id_universidad', '=', 'usuarios.id_universidad')
            ->leftJoin('carreras', 'carreras.id_carrera', '=', 'usuarios.id_carrera')
            ->where('inscripciones_evento.id_evento', $idEvento)
            ->where('inscripciones_evento.estado_id', 1)
            ->select(
                'usuarios.id_usuario',
                'usuarios.nombre_completo',
                'usuarios.correo',
                'usuarios.identificacion',
                'usuarios.telefono',
                'universidades.nombre as universidad',
                'carreras.nombre as carrera'
            )
            ->orderBy('usuarios.nombre_completo')
            ->get();
    }

    /**
     * Obtener datos de un inscrito puntual en evento
     */
    public function obtenerInscritoEvento(int $idEvento, int $idUsuario)
    {
        return DB::table('inscripciones_evento')
            ->join('usuarios', 'usuarios.id_usuario', '=', 'inscripciones_evento.id_usuario')
            ->where('inscripciones_evento.id_evento', $idEvento)
            ->where('inscripciones_evento.id_usuario', $idUsuario)
            ->where('inscripciones_evento.estado_id', 1)
            ->select(
                'usuarios.nombre_completo',
                'usuarios.correo'
            )
            ->first();
    }

    /**
     * Eliminar inscripción de usuario en evento
     */
    public function eliminarInscripcionEvento(int $idEvento, int $idUsuario): bool
    {
        $eliminados = DB::table('inscripciones_evento')
            ->where('id_evento', $idEvento)
            ->where('id_usuario', $idUsuario)
            ->delete();

        return $eliminados > 0;
    }


    public function finalizarEventosAutomaticamente()
    {
        cache()->remember('finalizacion_eventos_lock', 300, function () {

            $existen = DB::table('eventos')
                ->where('estado_id', 1)
                ->where(function ($query) {
                    $query->where('fecha_evento', '<', now()->toDateString())
                        ->orWhere(function ($q) {
                            $q->where('fecha_evento', now()->toDateString())
                                ->where('hora_evento', '<', now()->format('H:i:s'));
                        });
                })
                ->exists();

            if (!$existen) {
                return;
            }

            DB::table('eventos')
                ->where('estado_id', 1)
                ->where(function ($query) {
                    $query->where('fecha_evento', '<', now()->toDateString())
                        ->orWhere(function ($q) {
                            $q->where('fecha_evento', now()->toDateString())
                                ->where('hora_evento', '<', now()->format('H:i:s'));
                        });
                })
                ->update(['estado_id' => 4]);

            DB::table('bitacora_cambios')->insert([
                'tabla_afectada' => 'eventos',
                'operacion' => 'FINALIZAR',
                'usuario_responsable' => null,
                'fecha_cambio' => now(),
                'descripcion_cambio' => 'Eventos finalizados automáticamente por sistema',
            ]);
        });
    }

    // OTROS MÉTODOS RELACIONADOS CON INSCRIPCIONES de eventos por froy 
// repository
    /**
     * Verificar si el usuario ya tiene inscripción activa en el evento
     */
    public function existeInscripcionActiva(int $idEvento, int $idUsuario): bool
    {
        return DB::table('inscripciones_evento')
            ->where('id_evento', $idEvento)
            ->where('id_usuario', $idUsuario)
            ->where('estado_id', 1)
            ->exists();
    }

    /**
     * Contar inscritos activos en un evento
     */
    public function contarInscritos(int $idEvento): int
    {
        return DB::table('inscripciones_evento')
            ->where('id_evento', $idEvento)
            ->where('estado_id', 1)
            ->count();
    }

/**
 * Crear inscripción
 */
public function crearInscripcion(array $data): void
{
    $existente = DB::table('inscripciones_evento')
        ->where('id_evento', $data['id_evento'])
        ->where('id_usuario', $data['id_usuario'])
        ->first();

    if ($existente) {
        // Reactivar inscripción cancelada
        DB::table('inscripciones_evento')
            ->where('id_evento', $data['id_evento'])
            ->where('id_usuario', $data['id_usuario'])
            ->update([
                'estado_id' => 1,
                'fecha_inscripcion' => $data['fecha_inscripcion'],
            ]);
    } else {
        DB::table('inscripciones_evento')->insert($data);
    }
}

    /**
     * Obtener inscripción puntual (para cancelar)
     */
    public function obtenerInscripcion(int $idEvento, int $idUsuario): ?object
    {
        return DB::table('inscripciones_evento')
            ->where('id_evento', $idEvento)
            ->where('id_usuario', $idUsuario)
            ->where('estado_id', 1)
            ->first();
    }
    public function obtenerEventoParaInscripcionPorId(int $idEvento)
    {
        return DB::table('eventos')
            ->leftJoin('modalidades', 'modalidades.id_modalidad', '=', 'eventos.id_modalidad')
            ->leftJoin('cantones', 'cantones.id_canton', '=', 'eventos.id_ubicacion')
            ->leftJoin('provincias', 'provincias.id_provincia', '=', 'cantones.id_provincia')
            ->leftJoin('paises', 'paises.id_pais', '=', 'provincias.id_pais')
            ->leftJoin('inscripciones_evento as ie', function ($join) {
                $join->on('ie.id_evento', '=', 'eventos.id_evento')
                    ->where('ie.estado_id', 1);
            })
            ->where('eventos.id_evento', $idEvento)
            ->select(
                'eventos.id_evento',
                'eventos.titulo',
                'eventos.descripcion',
                'eventos.fecha_evento',
                'eventos.hora_evento',
                'eventos.cupos',
                'modalidades.nombre as modalidad_nombre',
                'cantones.nombre as canton_nombre',
                'provincias.nombre as provincia_nombre',
                'paises.nombre as pais_nombre',
                DB::raw('COUNT(ie.id_inscripcion) as inscritos_count')
            )
            ->groupBy(
                'eventos.id_evento',
                'eventos.titulo',
                'eventos.descripcion',
                'eventos.fecha_evento',
                'eventos.hora_evento',
                'eventos.cupos',
                'modalidades.nombre',
                'cantones.nombre',
                'provincias.nombre',
                'paises.nombre'
            )
            ->first();
    }
    /**
     * Actualizar estado de inscripción (cancelar, etc.)
     */
    public function actualizarEstadoInscripcion(int $idEvento, int $idUsuario, int $estado): void
    {
        DB::table('inscripciones_evento')
            ->where('id_evento', $idEvento)
            ->where('id_usuario', $idUsuario)
            ->update(['estado_id' => $estado]);
    }

    /**
     * Obtener IDs de eventos donde el usuario está inscrito activamente
     */
    public function obtenerEventosUsuario(int $idUsuario): array
    {
        return DB::table('inscripciones_evento')
            ->where('id_usuario', $idUsuario)
            ->where('estado_id', 1)
            ->pluck('id_evento')
            ->toArray();
    }

    /**
     * Conteo de inscritos por evento (para el index)
     */
    public function obtenerConteoInscritos(): array
    {
        return DB::table('inscripciones_evento')
            ->where('estado_id', 1)
            ->select('id_evento', DB::raw('COUNT(*) as total'))
            ->groupBy('id_evento')
            ->pluck('total', 'id_evento')
            ->toArray();
    }

    /**
     * Obtener eventos activos filtrados por carrera y rol del usuario
     */
    public function obtenerEventosActivosParaInscripcion(int $idCarrera, int $idRol): array
    {
        return DB::table('eventos')
            ->leftJoin('modalidades', 'modalidades.id_modalidad', '=', 'eventos.id_modalidad')
            ->leftJoin('cantones', 'cantones.id_canton', '=', 'eventos.id_ubicacion')
            ->leftJoin('provincias', 'provincias.id_provincia', '=', 'cantones.id_provincia')
            ->leftJoin('paises', 'paises.id_pais', '=', 'provincias.id_pais')
            ->leftJoin('inscripciones_evento as ie', function ($join) {
                $join->on('ie.id_evento', '=', 'eventos.id_evento')
                    ->where('ie.estado_id', 1);
            })
            ->join('evento_carrera', 'evento_carrera.id_evento', '=', 'eventos.id_evento')
            ->join('evento_rol', 'evento_rol.id_evento', '=', 'eventos.id_evento')
            ->where('eventos.estado_id', 1)
            ->where('evento_carrera.id_carrera', $idCarrera)
            ->where('evento_rol.id_rol', $idRol)
            ->select(
                'eventos.id_evento',
                'eventos.titulo',
                'eventos.descripcion',
                'eventos.fecha_evento',
                'eventos.hora_evento',
                'eventos.estado_id',
                'eventos.cupos',
                'modalidades.nombre as modalidad_nombre',
                'cantones.nombre as canton_nombre',
                'provincias.nombre as provincia_nombre',
                'paises.nombre as pais_nombre',
                DB::raw('COUNT(ie.id_inscripcion) as inscritos_count')
            )
            ->groupBy(
                'eventos.id_evento',
                'eventos.titulo',
                'eventos.descripcion',
                'eventos.fecha_evento',
                'eventos.hora_evento',
                'eventos.estado_id',
                'eventos.cupos',
                'modalidades.nombre',
                'cantones.nombre',
                'provincias.nombre',
                'paises.nombre'
            )
            ->orderBy('eventos.fecha_evento', 'asc')
            ->get()
            ->toArray();
    }

    /**
     * Obtener eventos inscritos del usuario con datos completos
     */
    public function obtenerMisEventos(int $idUsuario): array
    {
        return DB::table('inscripciones_evento')
            ->join('eventos', 'eventos.id_evento', '=', 'inscripciones_evento.id_evento')
            ->leftJoin('modalidades', 'modalidades.id_modalidad', '=', 'eventos.id_modalidad')
            ->leftJoin('cantones', 'cantones.id_canton', '=', 'eventos.id_ubicacion')
            ->leftJoin('provincias', 'provincias.id_provincia', '=', 'cantones.id_provincia')
            ->leftJoin('paises', 'paises.id_pais', '=', 'provincias.id_pais')
            ->where('inscripciones_evento.id_usuario', $idUsuario)
            ->where('inscripciones_evento.estado_id', 1)
            ->select(
                'eventos.id_evento',
                'eventos.titulo',
                'eventos.descripcion',
                'eventos.fecha_evento',
                'eventos.hora_evento',
                'eventos.cupos',
                'eventos.estado_id',
                'modalidades.nombre as modalidad_nombre',
                'cantones.nombre as canton_nombre',
                'provincias.nombre as provincia_nombre',
                'paises.nombre as pais_nombre',
                'inscripciones_evento.fecha_inscripcion',
            )
            ->orderBy('eventos.fecha_evento', 'asc')
            ->get()
            ->toArray();
    }
}
