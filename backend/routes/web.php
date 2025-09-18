<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\PermisoController;
use App\Http\Controllers\RegistroController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

// ==========================================
// Rutas públicas
// ==========================================

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('/login', function () {
    return Inertia::render('Login'); // resources/js/pages/Login.tsx
})->name('login');

Route::post('/login', [AuthController::class, 'login']);

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

    // Rutas de Roles
    Route::get('/roles', [RolController::class, 'index'])->name('roles.index');
    Route::post('/roles', [RolController::class, 'store'])->name('roles.store');
    Route::put('/roles/{id}', [RolController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{id}', [RolController::class, 'destroy'])->name('roles.destroy');
    Route::post('/roles/{id}/permisos', [RolController::class, 'asignarPermisos'])->name('roles.asignar');

    // Rutas de Permisos
    Route::get('/permisos', [PermisoController::class, 'index'])->name('permisos.index');
    Route::post('/permisos', [PermisoController::class, 'store'])->name('permisos.store');
    Route::put('/permisos/{id}', [PermisoController::class, 'update'])->name('permisos.update');
    Route::delete('/permisos/{id}', [PermisoController::class, 'destroy'])->name('permisos.destroy');

    // Registro (puede mantenerse protegido o público según lógica)
    Route::get('/registro', [RegistroController::class, 'mostrarFormulario'])->name('registro.form');
    Route::post('/registro/enviar-codigo', [RegistroController::class, 'enviarCodigo']);
    Route::post('/registro/validar-codigo', [RegistroController::class, 'validarCodigo']);
    Route::post('/registro', [RegistroController::class, 'registrar']);
});

// ==========================================
// Archivos de configuración adicionales
// ==========================================

require __DIR__.'/settings.php';
// require __DIR__.'/auth.php';
