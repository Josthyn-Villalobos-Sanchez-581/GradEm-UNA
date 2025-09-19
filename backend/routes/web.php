<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\PermisoController;
use App\Http\Controllers\RolesPermisosController;
use App\Http\Controllers\RegistroController;
use App\Http\Controllers\EmpresaController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\PerfilController;
// ==========================================
// Rutas públicas
// ==========================================

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('/login', function () {
    return Inertia::render('Login');
})->name('login');

Route::post('/login', [AuthController::class, 'login']);

// Registro (público)
Route::get('/registro', [RegistroController::class, 'mostrarFormulario'])->name('registro.form');
Route::post('/registro/enviar-codigo', [RegistroController::class, 'enviarCodigo']);
Route::post('/registro/validar-codigo', [RegistroController::class, 'validarCodigo']);
Route::post('/registro', [RegistroController::class, 'registrar']);

// Rutas para el registro de empresa
Route::get('/registro-empresa', function () {
    return Inertia::render('RegistroEmpresa'); // Apunta a la vista de React
})->name('registro-empresa.form');

Route::post('/registro-empresa', [EmpresaController::class, 'store'])->name('registro-empresa.store');

// ==========================================
// Rutas protegidas (requieren autenticación)
// ==========================================

Route::middleware('auth')->group(function () {

    // Dashboard dinámico con permisos
    Route::get('/dashboard', function () {
        $usuario = Auth::user();

        // Obtener permisos según el rol del usuario
        $userPermisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        return Inertia::render('Dashboard', [
            'userPermisos' => $userPermisos
        ]);
    })->name('dashboard');

    // Logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // ==========================================
    // Rutas de Roles
    // ==========================================
    Route::get('/roles', [RolController::class, 'index'])->name('roles.index');
    Route::get('/roles/create', [RolController::class, 'create'])->name('roles.create');
    Route::post('/roles', [RolController::class, 'store'])->name('roles.store');
    Route::get('/roles/{id}/edit', [RolController::class, 'edit'])->name('roles.edit');
    Route::put('/roles/{id}', [RolController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{id}', [RolController::class, 'destroy'])->name('roles.destroy');
    Route::post('/roles/{id}/permisos', [RolController::class, 'asignarPermisos'])->name('roles.asignar');

    // ==========================================
    // Rutas de Permisos
    // ==========================================
    Route::get('/permisos', [PermisoController::class, 'index'])->name('permisos.index');
    Route::get('/permisos/create', [PermisoController::class, 'create'])->name('permisos.create');
    Route::post('/permisos', [PermisoController::class, 'store'])->name('permisos.store');
    Route::get('/permisos/{id}/edit', [PermisoController::class, 'edit'])->name('permisos.edit');
    Route::put('/permisos/{id}', [PermisoController::class, 'update'])->name('permisos.update');
    Route::delete('/permisos/{id}', [PermisoController::class, 'destroy'])->name('permisos.destroy');

    // ==========================================
    // Ruta de Roles_Permisos (Index general)
    // ==========================================
    Route::get('/roles_permisos', [RolesPermisosController::class, 'index'])
        ->name('roles_permisos.index');


    Route::middleware('auth')->group(function () {
        Route::get('/perfil', [PerfilController::class, 'index'])->name('perfil.index');
        Route::put('/perfil/{id}', [PerfilController::class, 'update'])->name('perfil.update');
    });

});

// ==========================================
// Archivos de configuración adicionales
// ==========================================
require __DIR__.'/settings.php';
// require __DIR__.'/auth.php';
