<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;

Route::prefix('auth')->group(function () {
    Route::post('registrar', [AuthController::class, 'registrar']);
    Route::post('login',     [AuthController::class, 'iniciarSesion']);
});

Route::apiResource('usuarios', UsuarioController::class);
Route::patch('usuarios/{usuario}/estado', [UsuarioController::class, 'actualizarEstado']);
