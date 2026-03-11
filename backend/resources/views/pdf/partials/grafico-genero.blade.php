@php
$PALETAS_GENERO = [
  'institucional' => ['#1d4ed8', '#dc2626', '#16a34a'],
  'vibrante'      => ['#7c3aed', '#06b6d4', '#f97316'],
  'natural'       => ['#065f46', '#92400e', '#0369a1'],
  'contraste'     => ['#000000', '#c8cbab', '#ef4444'],
];

$paleta = $visual['pie']['paleta'] ?? 'institucional';
$colores = $PALETAS_GENERO[$paleta] ?? $PALETAS_GENERO['institucional'];
@endphp

@php
$genero = $genero ?? [];

$datos = [
  ['nombre' => 'Masculino', 'valor' => $genero['hombres'] ?? 0],
  ['nombre' => 'Femenino', 'valor' => $genero['mujeres'] ?? 0],
  ['nombre' => 'No especificado', 'valor' => $genero['no_especificado'] ?? 0],
];

$total = collect($datos)->sum('valor') ?: 1;

foreach ($datos as $i => &$d) {
  $d['color'] = $colores[$i % count($colores)];
}
unset($d);
@endphp

<div style="margin-top:30px;">

<h2 style="text-align:center; margin-bottom:5px;">
Distribución por género
</h2>

<p style="text-align:center; font-size:11px; color:#555; margin-bottom:15px;">
Proporción de egresados según género
</p>

<table width="100%" cellpadding="6" cellspacing="0"
       style="border:1px solid #e5e7eb; border-radius:8px;">

@foreach($datos as $item)

@php
$porcentaje = round(($item['valor'] / $total) * 100, 1);
@endphp

<tr>

<td width="20%" style="font-size:12px;">
{{ $item['nombre'] }}
</td>

<td width="60%">
<div style="background:#f1f5f9; height:14px; border-radius:6px;">
<div style="
width: {{ $porcentaje }}%;
height:14px;
background: {{ $item['color'] }};
border-radius:6px;
"></div>
</div>
</td>

<td width="20%" align="right" style="font-weight:bold;">
{{ $item['valor'] }} ({{ $porcentaje }}%)
</td>

</tr>

@endforeach

</table>

<p style="font-size:10px; color:#666; margin-top:8px; text-align:center;">
Total de egresados analizados: <strong>{{ $total }}</strong>
</p>

</div>