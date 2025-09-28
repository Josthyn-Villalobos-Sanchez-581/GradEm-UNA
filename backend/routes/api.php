<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\RegistroController; // Agrega esta línea
use App\Models\User;
use Illuminate\Http\Request;

// Grupo de rutas relacionadas con autenticación bajo el prefijo 'auth'
Route::prefix('auth')->group(function () {
    // Ruta para registrar un nuevo usuario
    Route::post('registrar', [AuthController::class, 'registrar']);
    // Ruta para iniciar sesión
    Route::post('login',     [AuthController::class, 'iniciarSesion']);
});

// Rutas RESTful para el recurso 'usuarios'
Route::apiResource('usuarios', UsuarioController::class);
// Ruta para actualizar el estado de un usuario específico
Route::patch('usuarios/{usuario}/estado', [UsuarioController::class, 'actualizarEstado']);

// Ruta para verificar si el correo ya existe usando RegistroController
Route::post('/verificar-correo', [RegistroController::class, 'verificarCorreo']);
