<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\PermisoController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/login', function () {
    return Inertia::render('Login'); // apunta a resources/js/pages/Login.tsx
})->name('login');

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
//require __DIR__.'/auth.php';

//Rutas de Roles
Route::middleware(['auth'])->group(function () {
    Route::get('/roles', [RolController::class, 'index'])->name('roles.index');
    Route::post('/roles', [RolController::class, 'store'])->name('roles.store');
    Route::put('/roles/{id}', [RolController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{id}', [RolController::class, 'destroy'])->name('roles.destroy');
    Route::post('/roles/{id}/permisos', [RolController::class, 'asignarPermisos'])->name('roles.asignar');
});

//Rutas de Permisos
Route::middleware(['auth'])->group(function () {
    Route::get('/permisos', [PermisoController::class, 'index'])->name('permisos.index');
    Route::post('/permisos', [PermisoController::class, 'store'])->name('permisos.store');
    Route::put('/permisos/{id}', [PermisoController::class, 'update'])->name('permisos.update');
    Route::delete('/permisos/{id}', [PermisoController::class, 'destroy'])->name('permisos.destroy');
});