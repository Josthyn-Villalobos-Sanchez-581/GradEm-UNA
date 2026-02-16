<?php

namespace App\Services\PerfilServices;

use App\Repositories\PerfilRepositories\PerfilRepository;
use Illuminate\Support\Facades\Auth;
use Exception;
use App\Services\MailServices\MailService;


class PerfilService
{
    protected $perfilRepository;
    protected $mailService;

    public function __construct(PerfilRepository $perfilRepository, MailService $mailService)
    {
        $this->perfilRepository = $perfilRepository;
        $this->mailService = $mailService;
    }


    public function obtenerDatosPerfil()
    {
        $usuario = $this->perfilRepository->obtenerUsuarioConFoto();
        $empresa = $this->perfilRepository->obtenerEmpresaUsuario($usuario->id_usuario);

        return [
            'usuario' => [
                ...$usuario->toArray(),
                'fotoPerfil' => $usuario->fotoPerfil ? $usuario->fotoPerfil->toArray() : null,
            ],
            'empresa' => $empresa,
            'userPermisos' => $this->perfilRepository->obtenerPermisosRol($usuario->id_rol),
            'areaLaborales' => $this->perfilRepository->obtenerAreasLaborales(),
            'paises' => $this->perfilRepository->obtenerPaises(),
            'provincias' => $this->perfilRepository->obtenerProvincias(),
            'cantones' => $this->perfilRepository->obtenerCantones(),
            'universidades' => $this->perfilRepository->obtenerUniversidades(),
            'carreras' => $this->perfilRepository->obtenerCarreras(),
            'rolNombre' => $this->perfilRepository->obtenerNombreRol($usuario->id_rol),
            'plataformas' => $this->perfilRepository->obtenerPlataformas($usuario->id_usuario),
        ];
    }

    public function obtenerDatosEditar()
    {
        $usuario = $this->perfilRepository->obtenerUsuarioConFoto();

        $rolNombre = strtolower($usuario->rol->nombre_rol ?? '');
        $empresa = null;

        if ($rolNombre === 'empresa') {
            $empresa = $this->perfilRepository->obtenerEmpresaUsuario($usuario->id_usuario);
        }

        return [
            'empresa' => $empresa,
            'usuario' => [
                ...$usuario->toArray(),
                'fotoPerfil' => $usuario->fotoPerfil ? $usuario->fotoPerfil->toArray() : null,
            ],

            'userPermisos'     => $this->perfilRepository->obtenerPermisosRol($usuario->id_rol),
            'areaLaborales'    => $this->perfilRepository->obtenerAreasLaborales(),
            'paises'           => $this->perfilRepository->obtenerPaises(),
            'provincias'       => $this->perfilRepository->obtenerProvincias(),
            'cantones'         => $this->perfilRepository->obtenerCantones(),
            'universidades'    => $this->perfilRepository->obtenerUniversidades(),
            'carreras'         => $this->perfilRepository->obtenerCarreras(),
            'rolNombre'        => $this->perfilRepository->obtenerNombreRol($usuario->id_rol),
        ];
    }

    public function actualizarPerfil($request)
    {
        /** @var \App\Models\Usuario $usuario */
        $usuario = Auth::user();

        $rolNombre = strtolower(trim($usuario->rol->nombre_rol ?? ''));

        // Normalizar campos vacíos
        $data = $request->all();
        foreach ($data as $key => $value) {
            if ($value === '') {
                $data[$key] = null;
            }
        }

        // ======================================================
        // 🔹 CASO 1: EMPRESA
        // ======================================================
        if ($rolNombre === 'empresa') {

            $validated = validator($data, [
                'nombre_completo'          => 'required|string|max:100',
                'identificacion'           => 'required|string|max:50|unique:usuarios,identificacion,' . $usuario->id_usuario . ',id_usuario',
                'correo'                   => 'required|email|max:100|unique:usuarios,correo,' . $usuario->id_usuario . ',id_usuario',

                // VALIDACIÓN EMPRESA
                'empresa_nombre'           => 'required|string|max:100',
                'empresa_correo'           => 'required|email|max:100',
                'empresa_telefono'         => 'nullable|string|max:20',
                'empresa_persona_contacto' => 'required|string|max:100',
                'id_canton'                => 'nullable|integer|exists:cantones,id_canton',
            ])->validate();

            // Actualizar usuario
            $this->perfilRepository->actualizarUsuario($usuario->id_usuario, [
                'nombre_completo' => $validated['nombre_completo'],
                'identificacion'  => $validated['identificacion'],
                'correo'          => $validated['correo'],
                'id_canton'       => $validated['id_canton'],
            ]);

            // Actualizar empresa
            $this->perfilRepository->actualizarEmpresa($usuario->id_usuario, [
                'nombre'           => $validated['empresa_nombre'],
                'correo'           => $validated['empresa_correo'],
                'telefono'         => $validated['empresa_telefono'] ?? null,
                'persona_contacto' => $validated['empresa_persona_contacto'],
            ]);

            return [
                'redirect' => route('perfil.index'),
                'mensaje'  => 'Datos de la empresa actualizados con éxito.',
            ];
        }

        // ======================================================
        // 🔹 CASO 2: EGRESADO / ESTUDIANTE / OTROS
        // ======================================================
        $validated = validator($data, [
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

        // Actualizar usuario
        $usuario->fill($validated);
        $usuario->save();

        return [
            'redirect' => route('perfil.index'),
            'mensaje'  => 'Datos personales actualizados con éxito.',
        ];
    }

    public function verificarCorreo($request)
    {
        $request->validate([
            'correo' => 'required|email|max:100',
        ]);

        $correo = $request->correo;
        $idUsuario = Auth::id();

        $existe = $this->perfilRepository->correoExisteExceptoUsuario($correo, $idUsuario);

        return [
            'existe' => $existe
        ];
    }

    public function enviarCodigoCorreo($request)
    {
        $request->validate([
            'correo' => 'required|email|max:100',
        ]);

        return $this->mailService->enviarCodigoVerificacion($request->correo);
    }

    public function validarCodigoCorreo($request)
    {
        return $this->mailService->validarCodigoCorreo($request);
    }

    public function verificarIdentificacion($request)
    {
        // Validación
        $request->validate([
            'identificacion' => 'required|string|max:12',
        ]);

        // Obtener identificación
        $identificacion = $request->identificacion;

        // ID del usuario actual
        $idUsuarioActual = Auth::id();

        // Repositorio ejecuta la consulta
        $existe = $this->perfilRepository
            ->existeIdentificacion($identificacion, $idUsuarioActual);

        return ['existe' => $existe];
    }

    /* ======================================================
     * CAMBIO DE CONDICIÓN ACADÉMICA
     * ====================================================== */
    public function cambiarEstudianteAEgresado(): void
    {
        $usuario = Auth::user();

        if (!$usuario) {
            throw new Exception('Usuario no autenticado.');
        }

        if (mb_strtolower($usuario->rol->nombre_rol) !== 'estudiante') {
            throw new Exception(
                'Solo los usuarios con condición de estudiante pueden realizar este cambio.'
            );
        }

        $this->perfilRepository->cambiarEstudianteAEgresado(
            $usuario->id_usuario
        );
    }


    public function cambiarEgresadoAEstudiante(): void
    {
        $usuario = Auth::user();

        if (!$usuario) {
            throw new Exception('Usuario no autenticado.');
        }

        if (mb_strtolower($usuario->rol->nombre_rol) !== 'egresado') {
            throw new Exception(
                'Solo los usuarios con condición de egresado pueden realizar este cambio.'
            );
        }

        $this->perfilRepository->cambiarEgresadoAEstudiante(
            $usuario->id_usuario
        );
    }
}
