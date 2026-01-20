{{-- resources/views/pdf/partials/grafico_barras.blade.php --}}

@php
    // Máximo para escalar barras
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

    {{-- Contenedor gráfico --}}
    <table width="100%" cellpadding="6" cellspacing="0"
           style="border:1px solid #e5e7eb; border-radius:8px;">

        @foreach($barras as $fila)
            @php
                $porcentaje = ($fila['total_egresados'] / $max) * 100;
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
                            background: #034991;
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

    {{-- Leyenda --}}
    <p style="font-size:10px; color:#666; margin-top:8px; text-align:center;">
        Cada barra representa la cantidad total de egresados por año
    </p>

</div>
