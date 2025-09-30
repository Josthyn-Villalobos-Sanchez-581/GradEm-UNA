<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
  <head>
      {{-- ✅ Rutas Ziggy (una sola vez) --}}
      @routes

      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">

      {{-- ✅ CSRF para Axios y formularios --}}
      <meta name="csrf-token" content="{{ csrf_token() }}">



      {{-- Inline script para aplicar dark mode del sistema lo antes posible --}}
      <script>
          (function() {
              const appearance = '{{ $appearance ?? "system" }}';
              if (appearance === 'system') {
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (prefersDark) {
                      document.documentElement.classList.add('dark');
                  }
              }
          })();
      </script>

      {{-- Inline style para color de fondo según tema (coincide con tu app.css) --}}
      <style>
          html { background-color: oklch(1 0 0); }
          html.dark { background-color: oklch(0.145 0 0); }
      </style>

      <title inertia>{{ config('app.name', 'Laravel') }}</title>

      <link rel="icon" href="/favicon.ico" sizes="any">
      <link rel="icon" href="/favicon.svg" type="image/svg+xml">
      <link rel="apple-touch-icon" href="/apple-touch-icon.png">

      <link rel="preconnect" href="https://fonts.bunny.net">
      <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

      {{-- Vite + React Refresh --}}
      @viteReactRefresh
      @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])

      {{-- ✅ Inertia Head (una sola vez y al final del head) --}}
      @inertiaHead
  </head>
  <body class="font-sans antialiased">
      {{-- ✅ Inertia app point (en el body, no en el head) --}}
      @inertia
  </body>
</html>
