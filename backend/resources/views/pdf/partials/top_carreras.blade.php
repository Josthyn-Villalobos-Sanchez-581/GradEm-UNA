{{-- resources/views/pdf/partials/top_carreras.blade.php --}}

@php
    $max = collect($topCarreras)->max('vacantes') ?: 1;
@endphp

<div style="margin-top:30px;">

    <h2 style="text-align:center;">Carreras más solicitadas</h2>

    <table width="100%" cellpadding="6" cellspacing="0"
           style="border:1px solid #e5e7eb; border-radius:8px;">

        @foreach($topCarreras as $c)
            @php
                $vacantes = $c['vacantes'] ?? 0;
                $porcentaje = ($vacantes / $max) * 100;
                $tendencia = $c['tendencia'] ?? 0;

                if ($tendencia > 0) {
                    $icono = '▲';
                    $color = '#16a34a'; // verde
                    $texto = $tendencia . '%';
                } elseif ($tendencia < 0) {
                    $icono = '▼';
                    $color = '#dc2626'; // rojo
                    $texto = abs($tendencia) . '%';
                } else {
                    $icono = '—';
                    $color = '#6b7280'; // gris
                    $texto = '';
                }
            @endphp

            <tr>
                <td width="30%">
                    {{ $c['carrera'] ?? 'N/D' }}
                </td>

                <td width="40%">
                    <div style="background:#f1f5f9; height:14px; border-radius:6px;">
                        <div style="
                            width: {{ $porcentaje }}%;
                            height:14px;
                            background:#034991;
                            border-radius:6px;
                        "></div>
                    </div>
                </td>

                <td width="15%" align="center" style="font-weight:bold;">
                    {{ $vacantes }}
                </td>

                <td width="15%" align="center"
                    style="font-weight:bold; color:{{ $color }};">
                    {{ $icono }} {{ $texto }}
                </td>
            </tr>
        @endforeach

    </table>

    <p style="margin-top:10px; text-align:center; font-size:12px; color:#6b7280;">
        Tendencia respecto al período anterior
    </p>
</div>
