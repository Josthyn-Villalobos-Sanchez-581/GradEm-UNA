@php
    $PALETAS_BARRAS = [
        'azul'    => ['#034991', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
        'verde'   => ['#065f46', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
        'morado'  => ['#5b21b6', '#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe'],
        'naranja' => ['#9a3412', '#f97316', '#fb923c', '#fdba74', '#fed7aa'],
    ];

    $paleta = data_get($visual ?? [], 'carrera.paleta', 'azul');
    $colores = $PALETAS_BARRAS[$paleta] ?? $PALETAS_BARRAS['azul'];


    $max = collect($carrera)->max('total_egresados') ?: 1;
@endphp

<div style="margin-top: 35px;">

    <h2 style="text-align:center; margin-bottom: 5px;">
        Egresados por carrera
    </h2>

    <p style="text-align:center; font-size:11px; color:#555; margin-bottom:15px;">
        Distribución total de egresados por carrera académica
    </p>

    <table width="100%" cellpadding="6" cellspacing="0"
           style="border:1px solid #e5e7eb; border-radius:8px;">

        @foreach($carrera as $fila)
           @php
    $porcentaje = ($fila['total_egresados'] / $max) * 100;

    $totalItems = count($carrera);
    if ($totalItems <= 1) {
        $color = $colores[0];
    } else {
        $pos = $loop->index / ($totalItems - 1);
        $escala = $pos * (count($colores) - 1);
        $i = floor($escala);
        $color = $colores[$i] ?? end($colores);
    }
@endphp


            <tr>
                <td width="25%" style="font-weight:bold;">
                    {{ $fila['carrera'] }}
                </td>

                <td width="60%">
                    <div style="background:#f1f5f9; height:18px; border-radius:6px;">
                        <div style="
                            width: {{ $porcentaje }}%;
                            height: 18px;
                            background: {{ $color }};
                            border-radius:6px;
                        "></div>
                    </div>
                </td>

                <td width="15%" align="right" style="font-weight:bold;">
                    {{ $fila['total_egresados'] }}
                </td>
            </tr>
        @endforeach

    </table>

    <p style="font-size:10px; color:#666; margin-top:8px; text-align:center;">
        Cada barra representa la cantidad total de egresados por carrera
    </p>

</div>
