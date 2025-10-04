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
use App\Http\Controllers\UbicacionController;
use App\Http\Controllers\UniversidadController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\FotoPerfilController;
use App\Http\Controllers\DocumentosController;
use App\Http\Controllers\UsuariosConsultaController;
use App\Http\Controllers\PlataformaExternaController;

// ==========================================
// Rutas públicas
// ==========================================
Route::get('/', fn () => Inertia::render('Welcome'))->name('home');

Route::get('/login', fn () => Inertia::render('Login'))->name('login');
Route::post('/login', [AuthController::class, 'login']);

// Registro público
Route::get('/registro', [RegistroController::class, 'mostrarFormulario'])->name('registro.form');
Route::post('/registro/enviar-codigo', [RegistroController::class, 'enviarCodigo']);
Route::post('/registro/validar-codigo', [RegistroController::class, 'validarCodigo']);
Route::post('/registro', [RegistroController::class, 'registrar']);

// Registro de admin
Route::get('/registro-admin', fn () => Inertia::render('RegistroAdminPage'))->name('registro.admin');
Route::post('/registro-admin', [AdminRegistroController::class, 'store'])->name('registro.admin.store');

// Ubicaciones
Route::get('/ubicaciones/paises', [UbicacionController::class, 'getPaises']);
Route::get('/ubicaciones/provincias/{id_pais}', [UbicacionController::class, 'getProvincias']);
Route::get('/ubicaciones/cantones/{id_provincia}', [UbicacionController::class, 'getCantones']);

// Universidades
Route::get('/universidades', [UniversidadController::class, 'getUniversidades']);
Route::get('/universidades/{id}/carreras', [UniversidadController::class, 'getCarreras']);

// Registro de empresa
Route::get('/registro-empresa', fn () => Inertia::render('RegistroEmpresa'))->name('registro-empresa.form');
Route::post('/registro-empresa', [EmpresaController::class, 'store'])->name('registro-empresa.store');

// Recuperar contraseña
Route::get('/recuperar', fn () => Inertia::render('RecuperarContrasena'))->name('recuperar.form');
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
    Route::get('/dashboard', fn () => Inertia::render('Dashboard', [
        'userPermisos' => getUserPermisos()
    ]))->name('dashboard');

    // Logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // ==========================================
    // Gestión de Perfil y Cuenta (Permiso 1)
    // ==========================================
    Route::middleware('permiso:1')->group(function () {
        Route::get('/perfil', [PerfilController::class, 'index'])->name('perfil.index');
        Route::get('/perfil/editar', [PerfilController::class, 'edit'])->name('perfil.edit');
        Route::put('/perfil', [PerfilController::class, 'update'])->name('perfil.update');

        Route::post('/perfil/foto', [FotoPerfilController::class, 'subirFoto'])->name('perfil.foto.subir');
        Route::get('/perfil/foto', [FotoPerfilController::class, 'mostrarFoto'])->name('perfil.foto.mostrar');
        Route::post('/perfil/foto/eliminar', [FotoPerfilController::class, 'eliminarFoto'])->name('perfil.foto.eliminar');
    });

    // ==========================================
    // Gestión de Currículum (Permiso 2)
    // ==========================================
    Route::middleware('permiso:2')->group(function () {
        Route::get('/curriculum/generar', fn () => Inertia::render('Frt_FormularioGeneracionCurriculum', [
            'userPermisos' => getUserPermisos()
        ]))->name('curriculum.generar');

        Route::post('/api/curriculum/generate', [CurriculumController::class, 'generar'])->name('api.curriculum.generate');
        Route::get('/curriculum-cargado', [CurriculumController::class, 'indexCarga'])->name('curriculum.index');
        Route::post('/curriculum-cargado', [CurriculumController::class, 'upload'])->name('curriculum.upload');
        Route::delete('/curriculum-cargado', [CurriculumController::class, 'delete'])->name('curriculum.delete');

        // 🚀 Nueva ruta: Ver Currículum
        Route::get('/mi-curriculum/ver', [CurriculumController::class, 'vistaVerCurriculum'])
            ->name('curriculum.ver');
    });

    // ==========================================
    // Carga de Documentos y Fotos (Permiso 3)
    // ==========================================
    Route::middleware('permiso:3')->group(function () {
        Route::get('/documentos', [DocumentosController::class, 'index'])->name('documentos.index');
    });

    // ==========================================
    // Gestión de Usuarios y Roles (Permiso 12)
    // ==========================================
    Route::middleware('permiso:12')->group(function () {
        // Roles
        Route::get('/roles', [RolController::class, 'index'])->name('roles.index');
        Route::get('/roles/create', [RolController::class, 'create'])->name('roles.create');
        Route::post('/roles', [RolController::class, 'store'])->name('roles.store');
        Route::get('/roles/{id}/edit', [RolController::class, 'edit'])->name('roles.edit');
        Route::put('/roles/{id}', [RolController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{id}', [RolController::class, 'destroy'])->name('roles.destroy');

        // Permisos
        Route::get('/permisos', [PermisoController::class, 'index'])->name('permisos.index');
        Route::get('/permisos/create', [PermisoController::class, 'create'])->name('permisos.create');
        Route::post('/permisos', [PermisoController::class, 'store'])->name('permisos.store');
        Route::get('/permisos/{id}/edit', [PermisoController::class, 'edit'])->name('permisos.edit');
        Route::put('/permisos/{id}', [PermisoController::class, 'update'])->name('permisos.update');
        Route::delete('/permisos/{id}', [PermisoController::class, 'destroy'])->name('permisos.destroy');

        // Roles_Permisos
        Route::get('/roles_permisos', [RolesPermisosController::class, 'index'])->name('roles_permisos.index');
        Route::post('/roles/{id}/permisos', [RolesPermisosController::class, 'asignarPermisos'])->name('roles.asignar');

        // Usuarios
        Route::get('/usuarios', [AdminRegistroController::class, 'index'])->name('usuarios.index');
        Route::get('/usuarios/crear', fn () => Inertia::render('Usuarios/CrearAdmin', [
            'userPermisos' => getUserPermisos()
        ]))->name('usuarios.create');
        Route::post('/usuarios', [AdminRegistroController::class, 'store'])->name('usuarios.store');
        Route::put('/usuarios/{id}/actualizar', [AdminRegistroController::class, 'actualizar'])->name('admin.actualizar');
        Route::get('/admin/usuarios/{id}/edit', [AdminRegistroController::class, 'edit'])->name('admin.editar');
        Route::delete('/admin/usuarios/{id}', [AdminRegistroController::class, 'destroy'])->name('admin.eliminar');
        Route::get('/admin/usuarios/crear', [AdminRegistroController::class, 'create'])->name('admin.crear');
        Route::post('/admin/usuarios', [AdminRegistroController::class, 'store'])->name('admin.store');

        // Consulta de Perfiles de Usuarios (Egresados y Estudiantes)
        Route::get('/usuarios/perfiles', [UsuariosConsultaController::class, 'index'])->name('usuarios.perfiles');
        Route::put('/usuarios/{id}/toggle-estado', [UsuariosConsultaController::class, 'toggleEstado'])->name('usuarios.toggle-estado');
    });

    // ==========================================
    // 🚧 Pendientes (cuando estén desarrollados)
    // ==========================================
    // 4 - Visualización de Currículum de Egresados
    // 5 - Publicación de Ofertas Laborales
    // 6 - Postulación a Ofertas Laborales
    // 7 - Gestión de Postulaciones
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

// Ruta adicional duplicada de perfil (cuidado con conflicto)
Route::middleware(['auth'])->group(function () {
    Route::get('/perfil', [PerfilController::class, 'index'])->name('perfil.index'); 
});

// ==========================================
// Archivos de configuración adicionales
// ==========================================
require __DIR__.'/settings.php';
// require __DIR__.'/auth.php';
