<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\PermisoController;
use App\Http\Controllers\RolesPermisosController;
use App\Http\Controllers\RegistroController;
use App\Http\Controllers\AdminRegistroController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\PerfilController;
// ==========================================
// Rutas públicas
// ==========================================

Route::get('/', fn() => Inertia::render('welcome'))->name('home');

Route::get('/login', fn() => Inertia::render('Login'))->name('login');
Route::post('/login', [AuthController::class, 'login']);

Route::get('/registro', [RegistroController::class, 'mostrarFormulario'])->name('registro.form');
Route::post('/registro/enviar-codigo', [RegistroController::class, 'enviarCodigo']);
Route::post('/registro/validar-codigo', [RegistroController::class, 'validarCodigo']);
Route::post('/registro', [RegistroController::class, 'registrar']);

Route::get('/registro-admin', fn() => Inertia::render('RegistroAdminPage'))->name('registro.admin');
Route::post('/registro-admin', [AdminRegistroController::class, 'store'])->name('registro.admin.store');

Route::get('/registro-empresa', fn() => Inertia::render('RegistroEmpresa'))->name('registro-empresa.form');
Route::post('/registro-empresa', [EmpresaController::class, 'store'])->name('registro-empresa.store');

// Mostrar listado de usuarios administradores/dirección/subdirección
Route::middleware(['auth'])->group(function () {
    Route::get('/usuarios', [AdminRegistroController::class, 'index'])->name('usuarios.index');
    Route::get('/usuarios/crear', function () {
        return Inertia::render('Usuarios/CrearAdmin');
    })->name('usuarios.create');
    Route::post('/usuarios', [AdminRegistroController::class, 'store'])->name('usuarios.store');
});

// ==========================================
// Rutas protegidas (requieren autenticación)
// ==========================================

Route::middleware(['auth'])->group(function () {

    // Dashboard dinámico con permisos
    Route::get('/dashboard', function () {
        $usuario = Auth::user();
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

    // Rutas de Roles
    Route::prefix('roles')->name('roles.')->group(function () {
        Route::get('/', [RolController::class, 'index'])->name('index');
        Route::get('/create', [RolController::class, 'create'])->name('create');
        Route::post('/', [RolController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [RolController::class, 'edit'])->name('edit');
        Route::put('/{id}', [RolController::class, 'update'])->name('update');
        Route::delete('/{id}', [RolController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/permisos', [RolController::class, 'asignarPermisos'])->name('asignar');
    });

    // Rutas de Permisos
    Route::prefix('permisos')->name('permisos.')->group(function () {
        Route::get('/', [PermisoController::class, 'index'])->name('index');
        Route::get('/create', [PermisoController::class, 'create'])->name('create');
        Route::post('/', [PermisoController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [PermisoController::class, 'edit'])->name('edit');
        Route::put('/{id}', [PermisoController::class, 'update'])->name('update');
        Route::delete('/{id}', [PermisoController::class, 'destroy'])->name('destroy');
    });

    // Ruta de Roles_Permisos (Index general)
    Route::get('/roles_permisos', [RolesPermisosController::class, 'index'])->name('roles_permisos.index');
});

// Rutas para gestión de usuarios administradores/dirección/subdirección
Route::middleware(['auth'])->group(function () {
  Route::put('/usuarios/{id}/actualizar', [AdminRegistroController::class, 'actualizar'])
    ->name('admin.actualizar');
});
Route::middleware(['auth'])->group(function () {
    Route::get('/admin/usuarios/{id}/edit', [AdminRegistroController::class, 'edit'])
        ->name('admin.editar');
});

// Ruta para eliminar usuario administrador/dirección/subdirección
Route::middleware(['auth'])->group(function () {
    Route::delete('/admin/usuarios/{id}', [AdminRegistroController::class, 'destroy'])
        ->name('admin.eliminar');
});

// Ruta para mostrar formulario de creación de usuario administrador/dirección/subdirección
Route::middleware(['auth'])->group(function () {
    Route::get('/admin/usuarios/crear', [AdminRegistroController::class, 'create'])
        ->name('admin.crear');
});

// Ruta para manejar el envío del formulario de creación de usuario administrador/dirección/subdirección
Route::post('/admin/usuarios', [AdminRegistroController::class, 'store'])
    ->name('admin.store')->middleware('auth');


    Route::middleware('auth')->group(function () {
        Route::get('/perfil', [PerfilController::class, 'index'])->name('perfil.index');
        Route::put('/perfil/{id}', [PerfilController::class, 'update'])->name('perfil.update');
    });


   
// ==========================================
// Archivos de configuración adicionales
// ==========================================

require __DIR__.'/settings.php';
// require __DIR__.'/auth.php';