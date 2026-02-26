<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\CheckPermiso;
use App\Http\Middleware\VerificarSesionActiva; // 👈 importa tu middleware aquí
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;


return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // 🔐 Configuración general de cookies
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // 🔹 Middleware del grupo "web"
        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            VerificarSesionActiva::class, // 👈 se ejecuta para todas las rutas web
        ]);

        // 👇 Alias personalizados
        $middleware->alias([
            'permiso' => CheckPermiso::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
