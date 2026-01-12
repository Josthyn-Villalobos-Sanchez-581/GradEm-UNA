{{-- resources/views/pdf/partials/ofertas_mes.blade.php --}}

@php
    $max = collect($ofertasMes)->max('valor') ?: 1;
@endphp

<div style="margin-top:25px;">

    <h2 style="text-align:center;">Ofertas publicadas por mes</h2>

    <table width="100%" cellpadding="6" cellspacing="0"
           style="border:1px solid #e5e7eb; border-radius:8px;">

        @foreach($ofertasMes as $fila)
            @php
                $porcentaje = (($fila['valor'] ?? 0) / $max) * 100;
            @endphp
            <tr>
                {{-- Mes --}}
                <td width="20%" align="center" style="font-weight:bold;">
                    {{ $fila['mes'] }}
                </td>

                {{-- Barra --}}
                <td width="60%">
                    <div style="background:#f1f5f9; height:16px; border-radius:6px;">
                        <div style="
                            width: {{ $porcentaje }}%;
                            height:16px;
                            background:#CD1719;
                            border-radius:6px;
                        "></div>
                    </div>
                </td>

                {{-- Total ofertas --}}
                <td width="20%" align="right" style="font-weight:bold;">
                    {{ $fila['valor'] ?? 0 }}
                </td>
            </tr>
        @endforeach

    </table>

    <p style="text-align:center; font-size:11px; color:#555; margin-bottom:15px;">
        Cantidad de ofertas según los filtros aplicados
    </p>
</div>
