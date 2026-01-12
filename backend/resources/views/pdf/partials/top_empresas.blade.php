{{-- resources/views/pdf/partials/top_empresas.blade.php --}}

@php
    $total = collect($topEmpresas)->sum('postulaciones') ?: 1;
@endphp

<div style="margin-top:30px;">

    <h2 style="text-align:center;">Top empresas con más postulaciones</h2>

    <table width="100%" cellpadding="6" cellspacing="0"
           style="border:1px solid #e5e7eb; border-radius:8px;">

        @foreach($topEmpresas as $i => $e)
            @php
                $valor = $e['postulaciones'] ?? 0;
                $porcentaje = round(($valor / $total) * 100, 1);

                $color = $i === 0
                    ? '#dc2626'   // Top 1
                    : ($i === 1
                        ? '#034991' // Top 2
                        : '#9ca3af' // resto
                    );
            @endphp

            <tr>
                <td width="30%">
                    {{ $e['nombre'] ?? 'N/D' }}
                </td>

                <td width="45%">
                    <div style="background:#f1f5f9; height:14px; border-radius:6px;">
                        <div style="
                            width: {{ $porcentaje }}%;
                            height:14px;
                            background: {{ $color }};
                            border-radius:6px;
                        "></div>
                    </div>
                </td>

                <td width="25%" align="right" style="font-weight:bold;">
                    {{ $valor }} ({{ $porcentaje }}%)
                </td>
            </tr>
        @endforeach

    </table>

    <p style="margin-top:10px; text-align:center; font-size:12px; color:#6b7280;">
        Porcentaje de postulaciones por empresa respecto al total
    </p>
</div>
