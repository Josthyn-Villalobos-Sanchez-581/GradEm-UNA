{{-- resources/views/pdf/partials/postulaciones_tipo.blade.php --}}

@php
    $total = collect($postulacionesTipo)->sum('value') ?: 1;
@endphp

<div style="margin-top:30px;">

    <h2 style="text-align:center;">Postulaciones por tipo de oferta</h2>

    <table width="100%" cellpadding="6" cellspacing="0"
           style="border:1px solid #e5e7eb; border-radius:8px;">

        @foreach($postulacionesTipo as $row)
            @php
                $porcentaje = round((($row['value'] ?? 0) / $total) * 100, 1);

                $color = strtolower($row['label'] ?? '') === 'empleo'
                    ? '#034991'
                    : '#dc2626';
            @endphp
            <tr>
                <td width="25%">
                    {{ $row['label'] ?? 'N/D' }}
                </td>

                <td width="55%">
                    <div style="background:#f1f5f9; height:14px; border-radius:6px;">
                        <div style="
                            width: {{ $porcentaje }}%;
                            height:14px;
                            background: {{ $color }};
                            border-radius:6px;
                        "></div>
                    </div>
                </td>

                <td width="20%" align="right" style="font-weight:bold;">
                    {{ $row['value'] ?? 0 }} ({{ $porcentaje }}%)
                </td>
            </tr>
        @endforeach

    </table>
    <p style="margin-top:10px; text-align:center; font-size:12px; color:#6b7280;">
        Porcentaje de postulaciones por tipo de oferta
    </p>
</div>
