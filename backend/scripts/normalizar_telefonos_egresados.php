<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$baseQuery = DB::table('usuarios as u')
    ->join('roles as r', 'r.id_rol', '=', 'u.id_rol')
    ->whereRaw('LOWER(r.nombre_rol)=?', ['egresado'])
    ->whereNotNull('u.telefono')
    ->whereRaw("u.telefono NOT REGEXP '^[68][0-9]{7}$'");

$invalidBefore = (clone $baseQuery)->count();
echo "egresados_invalidos_antes={$invalidBefore}" . PHP_EOL;

$rows = (clone $baseQuery)
    ->select('u.id_usuario', 'u.telefono')
    ->orderBy('u.id_usuario')
    ->get();

$normalized = 0;
foreach ($rows as $row) {
    $digits = preg_replace('/\D+/', '', (string) $row->telefono);
    $last7 = substr(str_pad($digits, 7, '0', STR_PAD_LEFT), -7);
    $prefix = ((int) $row->id_usuario % 2 === 0) ? '8' : '6';
    $nuevo = $prefix . $last7;

    DB::table('usuarios')
        ->where('id_usuario', $row->id_usuario)
        ->update(['telefono' => $nuevo]);

    $normalized++;
}

echo "egresados_normalizados={$normalized}" . PHP_EOL;

$invalidAfter = (clone $baseQuery)->count();
echo "egresados_invalidos_despues={$invalidAfter}" . PHP_EOL;
