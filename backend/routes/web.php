<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\PermisoController;
use App\Http\Controllers\RolesPermisosController;
use App\Http\Controllers\RegistroController;
use App\Http\Controllers\AdminRegistroController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\RecuperarContrasenaController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\UniversidadController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\FotoPerfilController;
use App\Http\Controllers\DocumentosController;
use App\Http\Controllers\UsuariosConsultaController;
use App\Http\Controllers\CertificadosController;
use App\Http\Controllers\TitulosController;
use App\Http\Controllers\OtrosController;
use App\Http\Controllers\PlataformaExternaController;
use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OfertaController;
use App\Http\Controllers\PostulacionController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\UbicacionController;
use App\Http\Controllers\ReportesOfertasController;
use App\Http\Controllers\EstadisticasController;
use App\Http\Controllers\NotificacionCursoController;
use App\Http\Controllers\CursoController;


// ==========================================
// Rutas públicas
// ==========================================
Route::get('/', fn() => Inertia::render('Welcome'))->name('home');

Route::get('/login', fn() => Inertia::render('Login'))->name('login');
Route::post('/login', [AuthController::class, 'login']);

// Registro público
Route::get('/registro', [RegistroController::class, 'mostrarFormulario'])->name('registro.form');
Route::post('/registro/enviar-codigo', [RegistroController::class, 'enviarCodigo']);
Route::post('/registro/validar-codigo', [RegistroController::class, 'validarCodigo']);
Route::post('/registro', [RegistroController::class, 'registrar']);
Route::post('/verificar-correo', [RegistroController::class, 'verificarCorreo']);
Route::post('/verificar-identificacion', [RegistroController::class, 'verificarIdentificacion']);

// Registro de admin
Route::get('/registro-admin', fn() => Inertia::render('RegistroAdminPage'))->name('registro.admin');
Route::post('/registro-admin', [AdminRegistroController::class, 'store'])->name('registro.admin.store');

// Ubicaciones
Route::get('/ubicaciones/paises', [UbicacionController::class, 'getPaises']);
Route::get('/ubicaciones/provincias/{id_pais}', [UbicacionController::class, 'getProvincias']);
Route::get('/ubicaciones/cantones/{id_provincia}', [UbicacionController::class, 'getCantones']);

// Universidades
Route::get('/universidades', [UniversidadController::class, 'getUniversidades']);
Route::get('/universidades/{id}/carreras', [UniversidadController::class, 'getCarreras']);

// Registro de empresa
Route::get('/registro-empresa', fn() => Inertia::render('RegistroEmpresa'))->name('registro-empresa.form');
Route::post('/registro-empresa', [EmpresaController::class, 'store'])->name('registro-empresa.store');

// Recuperar contraseña
Route::get('/recuperar', fn() => Inertia::render('RecuperarContrasena'))->name('recuperar.form');
Route::post('/recuperar/enviar-codigo', [RecuperarContrasenaController::class, 'enviarCodigo']);
Route::post('/recuperar/validar-codigo', [RecuperarContrasenaController::class, 'validarCodigo']);
Route::post('/recuperar/cambiar-contrasena', [RecuperarContrasenaController::class, 'cambiarContrasena']);

// ==========================================
// Rutas protegidas (requieren autenticación)
// ==========================================
Route::middleware('auth')->group(function () {

    // ==========================================
    // Dashboard
    // ==========================================
    Route::middleware(['auth'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->name('dashboard');
    });

    // Logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // ==========================================
    // Gestión de Perfil y Cuenta (Permiso 1)
    // ==========================================
    Route::middleware('permiso:1')->group(function () {
        Route::get('/perfil', [PerfilController::class, 'index'])->name('perfil.index');
        Route::get('/perfil/editar', [PerfilController::class, 'edit'])->name('perfil.edit');
        Route::put('/perfil', [PerfilController::class, 'update'])->name('perfil.update');
        Route::post('/perfil/verificar-identificacion', [PerfilController::class, 'verificarIdentificacion'])
            ->name('perfil.verificar-identificacion');

        //cambio de rol egresado-estudiante o estudiante-egresado
        Route::post(
            '/perfil/cambiar-condicion/estudiante-egresado',
            [PerfilController::class, 'cambiarCondicionEstudianteAEgresado']
        );

        Route::post(
            '/perfil/cambiar-condicion/egresado-estudiante',
            [PerfilController::class, 'cambiarCondicionEgresadoAEstudiante']
        );


        Route::post('/perfil/verificar-correo', [PerfilController::class, 'verificarCorreo'])
            ->name('perfil.verificar-correo');

        Route::post('/perfil/enviar-codigo-correo', [PerfilController::class, 'enviarCodigoCorreo'])
            ->name('perfil.enviar-codigo-correo');

        Route::post('/perfil/validar-codigo-correo', [PerfilController::class, 'validarCodigoCorreo'])
            ->name('perfil.validar-codigo-correo');

        Route::post('/perfil/foto', [FotoPerfilController::class, 'subirFoto'])->name('perfil.foto.subir');
        Route::get('/perfil/foto', [FotoPerfilController::class, 'mostrarFoto'])->name('perfil.foto.mostrar');
        Route::post('/perfil/foto/eliminar', [FotoPerfilController::class, 'eliminarFoto'])->name('perfil.foto.eliminar');
    });

    // ==========================================
    // Gestión de Currículum (Permiso 2)
    // ==========================================
    Route::middleware('permiso:2')->group(function () {
        Route::get('/curriculum/generar', function () {
            $usuario = \App\Models\Usuario::with('fotoPerfil')->find(\Illuminate\Support\Facades\Auth::id());
            return Inertia::render('Frt_FormularioGeneracionCurriculum', [
                'userPermisos' => getUserPermisos(),
                'usuario' => [
                    'id_usuario' => $usuario->id_usuario,
                    'nombre_completo' => $usuario->nombre_completo,
                    'cedula' => $usuario->identificacion,  // ✅ AGREGADO: usar el campo identificacion
                    'correo' => $usuario->correo,
                    'telefono' => $usuario->telefono ?? '',
                    'fotoPerfil' => $usuario->fotoPerfil ? $usuario->fotoPerfil->toArray() : null,
                ]
            ]);
        })->name('curriculum.generar');

        Route::post('/api/curriculum/generate', [CurriculumController::class, 'generar'])->name('api.curriculum.generate');
        Route::get('/curriculum-cargado', [CurriculumController::class, 'indexCarga'])->name('curriculum.index');
        Route::post('/api/curriculum/upload', [CurriculumController::class, 'uploadApi'])->name('api.curriculum.upload');
        Route::delete('/api/curriculum', [CurriculumController::class, 'delete'])->name('api.curriculum.delete');


        // Nueva ruta: Ver Currículum
        Route::get('/mi-curriculum/ver', [CurriculumController::class, 'vistaVerCurriculum'])
            ->name('curriculum.ver');

        // Nueva ruta: Obtener archivos adjuntos del usuario autenticado
        Route::get('/curriculum/adjuntos', [CurriculumController::class, 'obtenerAdjuntos'])
            ->name('curriculum.adjuntos');
    });

    // Ruta para obtener los documentos adjuntos de un usuario (permiso autenticado)
    Route::get('/usuarios/{id}/adjuntos', [DocumentosController::class, 'obtenerAdjuntos'])
        ->name('usuarios.adjuntos')
        ->middleware(['auth']);


    // ==========================================
    // Carga de Documentos y Fotos (Permiso 3)
    // ==========================================
    Route::middleware('permiso:3')->group(function () {
        Route::get('/documentos', [DocumentosController::class, 'index'])->name('documentos.index');
        Route::get('/api/documentos/url', [DocumentosController::class, 'obtenerUrlIndex'])->name('api.documentos.url');
    });

    Route::middleware('auth')->group(function () {
        Route::get('/titulos-cargados', [TitulosController::class, 'indexCarga'])->name('titulos.index');
        Route::post('/titulos/upload', [TitulosController::class, 'upload'])->name('titulos.upload');
        Route::delete('/titulos/delete', [TitulosController::class, 'delete'])->name('titulos.delete');

        Route::get('/certificados-cargados', [CertificadosController::class, 'indexCarga'])->name('certificados.index');
        Route::post('/certificados/upload', [CertificadosController::class, 'upload'])->name('certificados.upload');
        Route::delete('/certificados/delete', [CertificadosController::class, 'delete'])->name('certificados.delete');

        Route::get('/otros-cargados', [OtrosController::class, 'indexCarga'])->name('otros.index');
        Route::post('/otros-cargados/upload', [OtrosController::class, 'upload'])->name('otros.upload');
        Route::delete('/otros-cargados/delete', [OtrosController::class, 'delete'])->name('otros.delete');
    });

    // ==========================================
    // 5 - Publicación de Ofertas Laborales
    //    (empresas / admin crean y gestionan ofertas)
    // ==========================================
    Route::middleware(['auth', 'permiso:5'])->prefix('empresa')->group(function () {

        Route::get('/ofertas', [OfertaController::class, 'indexEmpresa'])
            ->name('empresa.ofertas.index');

        Route::get('/ofertas/crear', [OfertaController::class, 'crear'])
            ->name('empresa.ofertas.crear');

        Route::post('/ofertas', [OfertaController::class, 'guardar'])
            ->name('empresa.ofertas.guardar');

        Route::get('/ofertas/{oferta}/editar', [OfertaController::class, 'editar'])
            ->name('empresa.ofertas.editar');

        Route::put('/ofertas/{oferta}', [OfertaController::class, 'actualizar'])
            ->name('empresa.ofertas.actualizar');

        Route::delete('/ofertas/{oferta}', [OfertaController::class, 'eliminar'])
            ->name('empresa.ofertas.eliminar');
    });

    // ==========================================
    // 6 - Postulación a Ofertas Laborales
    //    (listado, detalle y postulación)
    // ==========================================
    Route::middleware(['auth', 'permiso:6'])->group(function () {

        // HU-25 + HU-27: Listar ofertas con filtros
        Route::get('/ofertas', [OfertaController::class, 'listar'])
            ->name('ofertas.listar');

        // HU-24: Ver detalle de una oferta
        Route::get('/ofertas/{oferta}', [OfertaController::class, 'mostrar'])
            ->name('ofertas.mostrar');

        // Otra HU: Postularse a una oferta
        Route::post('/ofertas/{oferta}/postular', [PostulacionController::class, 'postular'])
            ->name('ofertas.postular');
    });

    // ==========================================
    // 7 - Gestión de Postulaciones
    //    (empresa/admin revisan y gestionan postulaciones)
    // ==========================================
    Route::middleware(['auth', 'permiso:7'])->group(function () {

        Route::get('/postulaciones', [PostulacionController::class, 'index'])
            ->name('postulaciones.index');

        Route::get('/postulaciones/{postulacion}', [PostulacionController::class, 'mostrar'])
            ->name('postulaciones.mostrar');

        Route::put('/empresa/ofertas/{oferta}/estado', [OfertaController::class, 'cambiarEstado'])
        ->name('empresa.ofertas.cambiarEstado');
    });

    // ==========================================
    // 8 - Gestión de Cursos
    // ==========================================
    Route::middleware(['auth', 'permiso:8'])->prefix('cursos')->group(function () {

        Route::get('/', [CursoController::class, 'index'])
            ->name('cursos.index');

        Route::post('/', [CursoController::class, 'store'])
            ->name('cursos.store');

        Route::put('/{idCurso}', [CursoController::class, 'update'])
            ->name('cursos.update');

        Route::delete('/{id}', [CursoController::class, 'destroy'])
            ->name('cursos.destroy');

        Route::put('/{idCurso}/publicar', [CursoController::class, 'publicar'])
            ->name('cursos.publicar');

        // Correo masivo manual a inscritos
        Route::post(
            '/notificaciones/cursos/correo-masivo',
            [NotificacionCursoController::class, 'enviarCorreoMasivo']
        )->name('notificaciones.cursos.correo-masivo');

        // Recordatorios automáticos (cuando exista scheduler)
        Route::post(
            '/notificaciones/cursos/recordatorio',
            [NotificacionCursoController::class, 'enviarRecordatorio']
        )->name('notificaciones.cursos.recordatorio');

        // Notificación de inscripción o cancelación
        Route::post(
            '/notificaciones/cursos/cambio-inscripcion',
            [NotificacionCursoController::class, 'notificarCambioInscripcion']
        )->name('notificaciones.cursos.cambio-inscripcion');
    });

    // ==========================================
    // Gestión de Usuarios y Roles (Permiso 12)
    // ==========================================
    Route::middleware('permiso:12')->group(function () {

        // --- ROLES ---
        Route::get('/roles', [RolController::class, 'index'])->name('roles.index');
        Route::get('/roles/create', [RolController::class, 'create'])->name('roles.create');
        Route::post('/roles', [RolController::class, 'store'])->name('roles.store');
        Route::get('/roles/{id}/edit', [RolController::class, 'edit'])->name('roles.edit');
        Route::put('/roles/{id}', [RolController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{id}', [RolController::class, 'destroy'])->name('roles.destroy');

        // --- PERMISOS ---
        Route::get('/permisos', [PermisoController::class, 'index'])->name('permisos.index');
        Route::get('/permisos/create', [PermisoController::class, 'create'])->name('permisos.create');
        Route::post('/permisos', [PermisoController::class, 'store'])->name('permisos.store');
        Route::get('/permisos/{id}/edit', [PermisoController::class, 'edit'])->name('permisos.edit');
        Route::put('/permisos/{id}', [PermisoController::class, 'update'])->name('permisos.update');
        Route::delete('/permisos/{id}', [PermisoController::class, 'destroy'])->name('permisos.destroy');

        // --- ROLES_PERMISOS ---
        Route::get('/roles_permisos', [RolesPermisosController::class, 'index'])->name('roles_permisos.index');
        Route::post('/roles/{id}/permisos', [RolesPermisosController::class, 'asignarPermisos'])->name('roles.asignar');

        // Usuarios - CRUD principal
        Route::get('/usuarios', [AdminRegistroController::class, 'index'])->name('usuarios.index');
        Route::get('/usuarios/crear', [AdminRegistroController::class, 'create'])->name('admin.crear');
        Route::post('/usuarios', [AdminRegistroController::class, 'store'])->name('admin.store');
        Route::get('/usuarios/{id}/edit', [AdminRegistroController::class, 'edit'])->name('admin.editar');
        Route::put('/usuarios/{id}/actualizar', [AdminRegistroController::class, 'actualizar'])->name('admin.actualizar');
        Route::delete('/usuarios/{id}', [AdminRegistroController::class, 'destroy'])->name('admin.eliminar');

        // Toggle estado (activar/inactivar)
        Route::put('/usuarios/{id}/toggle-estado', [AdminRegistroController::class, 'toggleEstado'])->name('admin.toggle-estado');

        // Consulta de Perfiles de Usuarios (Egresados y Estudiantes)
        Route::post('/usuarios', [AdminRegistroController::class, 'store'])->name('usuarios.store');

        // Rutas alternativas bajo prefijo /admin (si aplica)
        Route::get('/admin/usuarios/crear', [AdminRegistroController::class, 'create'])->name('admin.crear');
        Route::post('/admin/usuarios', [AdminRegistroController::class, 'store'])->name('admin.store');
        Route::get('/admin/usuarios/{id}/edit', [AdminRegistroController::class, 'edit'])->name('admin.editar');
        Route::put('/admin/usuarios/{id}/actualizar', [AdminRegistroController::class, 'actualizar'])->name('admin.actualizar');
        Route::delete('/admin/usuarios/{id}', [AdminRegistroController::class, 'destroy'])->name('admin.eliminar');


        // --- CONSULTA DE PERFILES (UsuariosConsultaController) ---
        Route::get('/usuarios/perfiles', [UsuariosConsultaController::class, 'index'])->name('usuarios.perfiles');
        Route::put('/usuarios/{id}/toggle-estado', [UsuariosConsultaController::class, 'toggleEstado'])->name('usuarios.toggle-estado');

        //HU21 mostrar perfil estudiante a empresa o administrador 
        Route::middleware(['auth', 'permiso:12'])
        ->get('/usuarios/{id}/ver', [UsuariosConsultaController::class, 'ver'])
        ->name('usuarios.ver');
    });


    // ==========================================
    // Gestión de Catálogos (Permiso 13)
    // ==========================================
    Route::middleware('permiso:13')->group(function () {
        // Vista principal del Catálogo
        Route::get('/catalogo', [CatalogoController::class, 'index'])->name('catalogo.index');

        // ======== PAISES ========
        Route::post('/catalogo/paises', [CatalogoController::class, 'guardarPais'])->name('catalogo.paises.guardar');
        Route::delete('/catalogo/paises/{id}', [CatalogoController::class, 'eliminarPais'])->name('catalogo.paises.eliminar');

        // ======== PROVINCIAS ========
        Route::post('/catalogo/provincias', [CatalogoController::class, 'guardarProvincia'])->name('catalogo.provincias.guardar');
        Route::delete('/catalogo/provincias/{id}', [CatalogoController::class, 'eliminarProvincia'])->name('catalogo.provincias.eliminar');

        // ======== CANTONES ========
        Route::post('/catalogo/cantones', [CatalogoController::class, 'guardarCanton'])->name('catalogo.cantones.guardar');
        Route::delete('/catalogo/cantones/{id}', [CatalogoController::class, 'eliminarCanton'])->name('catalogo.cantones.eliminar');

        // ======== UNIVERSIDADES ========
        Route::post('/catalogo/universidades', [CatalogoController::class, 'guardarUniversidad'])->name('catalogo.universidades.guardar');
        Route::delete('/catalogo/universidades/{id}', [CatalogoController::class, 'eliminarUniversidad'])->name('catalogo.universidades.eliminar');

        // ======== CARRERAS ========
        Route::post('/catalogo/carreras', [CatalogoController::class, 'guardarCarrera'])->name('catalogo.carreras.guardar');
        Route::delete('/catalogo/carreras/{id}', [CatalogoController::class, 'eliminarCarrera'])->name('catalogo.carreras.eliminar');

        // ======== ESTADOS ========
        Route::post('/catalogo/estados', [CatalogoController::class, 'guardarEstado'])->name('catalogo.estados.guardar');
        Route::delete('/catalogo/estados/{id}', [CatalogoController::class, 'eliminarEstado'])->name('catalogo.estados.eliminar');

        // ======== MODALIDADES ========
        Route::post('/catalogo/modalidades', [CatalogoController::class, 'guardarModalidad'])->name('catalogo.modalidades.guardar');
        Route::delete('/catalogo/modalidades/{id}', [CatalogoController::class, 'eliminarModalidad'])->name('catalogo.modalidades.eliminar');

        // ======== IDIOMAS ========
        Route::post('/catalogo/idiomas', [CatalogoController::class, 'guardarIdioma'])->name('catalogo.idiomas.guardar');
        Route::delete('/catalogo/idiomas/{id}', [CatalogoController::class, 'eliminarIdioma'])->name('catalogo.idiomas.eliminar');

        // ======== ÁREAS LABORALES ========
        Route::post('/catalogo/areas_laborales', [CatalogoController::class, 'guardarAreaLaboral'])->name('catalogo.areas_laborales.guardar');
        Route::delete('/catalogo/areas_laborales/{id}', [CatalogoController::class, 'eliminarAreaLaboral'])->name('catalogo.areas_laborales.eliminar');
    });

    // ==========================================
    // Reportes de Egresados (Permiso 14)
    // ==========================================
    Route::middleware(['auth', 'permiso:14'])->group(function () {

        Route::get('/reportes-egresados', [ReporteController::class, 'index'])
            ->middleware(['auth', 'permiso:14'])
            ->name('reportes.egresados');


        Route::get('/reportes/egresados', [ReporteController::class, 'obtenerEgresados'])
            ->name('reportes.egresados');

        Route::get('/reportes/grafico-empleo', [ReporteController::class, 'graficoEmpleo'])
            ->name('reportes.grafico-empleo');

        Route::get('/reportes/grafico-anual', [ReporteController::class, 'graficoAnual'])
            ->name('reportes.grafico-anual');

        Route::get('/reportes/grafico-por-carrera', [ReporteController::class, 'graficoPorCarrera'])
            ->name('reportes.grafico-por-carrera');

            

        Route::get('/reportes/catalogos', [ReporteController::class, 'catalogos']);

        Route::post('/reportes/descargar-pdf', [ReporteController::class, 'descargarPdf']);

        // Catálogos
        Route::get('universidades', [ReporteController::class, 'universidades']);
        Route::get('carreras', [ReporteController::class, 'carreras']);
        Route::get('areas-laborales', [ReporteController::class, 'areasLaborales']);
        Route::get('paises', [ReporteController::class, 'paises']);
        Route::get('provincias', [ReporteController::class, 'provincias']);
        Route::get('cantones', [ReporteController::class, 'cantones']);
    });

    // ==========================================
    // Reportes de Ofertas / Postulaciones (Permiso 15)
    // ==========================================
    Route::middleware(['auth', 'permiso:15'])->group(function () {

        Route::get('/reportes-ofertas', [EstadisticasController::class, 'index']);

        Route::prefix('estadisticas/ofertas')->group(function () {
            Route::get('kpis', [EstadisticasController::class, 'kpis']);
            Route::get('ofertas-mes', [EstadisticasController::class, 'ofertasPorMes']);
            Route::get('postulaciones-tipo', [EstadisticasController::class, 'postulacionesPorTipo']);
            Route::get('top-empresas', [EstadisticasController::class, 'topEmpresas']);
            Route::get('top-carreras', [EstadisticasController::class, 'topCarreras']);
        });

        Route::post('/reportes-ofertas/descargar-pdf', [EstadisticasController::class, 'descargarPdf'])
            ->name('reportes-ofertas.descargar-pdf');
    });


    // ==========================================
    // 🚧 Pendientes (cuando estén desarrollados)
    // ==========================================
    // 8 - Gestión de Cursos
    // 9 - Inscripción a Cursos
    // 10 - Gestión de Eventos
    // 11 - Confirmación de Asistencia a Eventos
    // 13 - Gestión de Catálogos
    // 14 - Reportes de Egresados
    // 15 - Reportes de Ofertas y Postulaciones
    // 16 - Gestión de Auditoría/Bitácora
    // 17 - Integraciones externas
});

// cosas de plataforma externa 
Route::middleware(['auth'])->group(function () {
    Route::post('/perfil/plataformas', [PlataformaExternaController::class, 'store'])
        ->name('perfil.plataformas.store');
    Route::delete('/perfil/plataformas/{id}', [PlataformaExternaController::class, 'destroy'])
        ->name('perfil.plataformas.destroy');
});


// ==========================================
// Archivos de configuración adicionales
// ==========================================
require __DIR__ . '/settings.php';
// require __DIR__.'/auth.php';
