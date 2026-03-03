{{-- resources/views/pdf/partials/kpis.blade.php --}}

<div style="margin-top:25px;">
    <h2 style="text-align:center;">KPIs generales</h2>

    <table width="100%" cellpadding="8" cellspacing="0" style="margin-top:10px;">
        <tr>
            <td align="center" style="border:1px solid #034991; border-radius:6px; padding:10px; width:25%;">
                <div style="font-size:14px; color:#034991;">Total ofertas</div>
                <div style="font-size:18px; font-weight:bold; margin-top:4px;">{{ $kpis['total_ofertas'] ?? 0 }}</div>
            </td>
            <td align="center" style="border:1px solid #034991; border-radius:6px; padding:10px; width:25%;">
                <div style="font-size:14px; color:#034991;">Ofertas activas</div>
                <div style="font-size:18px; font-weight:bold; margin-top:4px;">{{ $kpis['ofertas_activas'] ?? 0 }}</div>
            </td>
            <td align="center" style="border:1px solid #034991; border-radius:6px; padding:10px; width:25%;">
                <div style="font-size:14px; color:#034991;">Total postulaciones</div>
                <div style="font-size:18px; font-weight:bold; margin-top:4px;">{{ $kpis['total_postulaciones'] ?? 0 }}</div>
            </td>
            <td align="center" style="border:1px solid #034991; border-radius:6px; padding:10px; width:25%;">
                <div style="font-size:14px; color:#034991;">Empresas activas</div>
                <div style="font-size:18px; font-weight:bold; margin-top:4px;">{{ $kpis['empresas_activas'] ?? 0 }}</div>
            </td>
        </tr>
    </table>

</div>
