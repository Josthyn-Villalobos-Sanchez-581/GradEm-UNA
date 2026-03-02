{{-- resources/views/pdf/partials/grafico_barras.blade.php --}}

@php
    /* ============================
       PALETAS DISPONIBLES
    ============================ */
    $PALETAS_BARRAS = [
        'azul'    => ['#034991', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
        'verde'   => ['#065f46', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
        'morado'  => ['#5b21b6', '#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe'],
        'naranja' => ['#9a3412', '#f97316', '#fb923c', '#fdba74', '#fed7aa'],
    ];

    /* ============================
       PALETA ACTIVA (SEGURA)
    ============================ */
    $paleta = data_get($visual ?? [], 'barras.paleta', 'azul');
    $colores = $PALETAS_BARRAS[$paleta] ?? $PALETAS_BARRAS['azul'];

    /* ============================
       UTILIDADES
    ============================ */
    function colorPorIndice($colores, $index, $total) {
        if ($total <= 1) {
            return $colores[0];
        }

        $pos = $index / ($total - 1);
        $escala = $pos * (count($colores) - 1);
        $i = floor($escala);

        return $colores[$i] ?? end($colores);
    }

    $max = collect($barras)->max('total_egresados') ?: 1;
@endphp

<div style="margin-top: 25px;">

    {{-- Título --}}
    <h2 style="text-align:center; margin-bottom: 5px;">
        Egresados por año
    </h2>

    <p style="text-align:center; font-size:11px; color:#555; margin-bottom:15px;">
        Distribución anual de egresados según los filtros aplicados
    </p>

    {{-- Gráfico --}}
    <table width="100%" cellpadding="6" cellspacing="0"
           style="border:1px solid #e5e7eb; border-radius:8px;">

        @foreach($barras as $fila)
            @php
                $porcentaje = ($fila['total_egresados'] / $max) * 100;
                $color = colorPorIndice($colores, $loop->index, count($barras));
            @endphp

            <tr>
                {{-- Año --}}
                <td width="12%" align="center" style="font-weight:bold;">
                    {{ $fila['anio'] }}
                </td>

                {{-- Barra --}}
                <td width="70%">
                    <div style="background:#f1f5f9; height:18px; border-radius:6px;">
                        <div style="
                            width: {{ $porcentaje }}%;
                            height: 18px;
                            background: {{ $color }};
                            border-radius:6px;
                        "></div>
                    </div>
                </td>

                {{-- Valor --}}
                <td width="18%" align="right" style="font-weight:bold;">
                    {{ $fila['total_egresados'] }}
                </td>
            </tr>
        @endforeach

    </table>

    <p style="font-size:10px; color:#666; margin-top:8px; text-align:center;">
        Cada barra representa la cantidad total de egresados por año
    </p>

</div>
