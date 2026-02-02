<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        h1, h2, h3 { color:#034991; }
    </style>
</head>
<body>

    {{-- Encabezado --}}
    <table width="100%">
        <tr>
            <td width="20%">
                <img src="{{ public_path('logos/logo_universidad.png') }}" width="90">
            </td>
            <td width="60%" align="center">
                <h1>Reporte de Egresados</h1>
                <p>Sistema GradEm-SIUA</p>
            </td>
            <td width="20%" align="right">
                <img src="{{ public_path('logos/logo_gradem.png') }}" width="90">
            </td>
        </tr>
    </table>

    <hr>

    {{-- Filtros --}}
    <h3>Filtros aplicados</h3>
    
    @if(!empty($filtros))
        <ul>
            @foreach($filtros as $filtro)
                <li>
                    <strong>{{ ucfirst(str_replace('_', ' ', $filtro['campo'])) }}:</strong>
                    {{ $filtro['valor'] }}
                </li>
            @endforeach
        </ul>
    @else
        <p>No se aplicaron filtros.</p>
    @endif


    {{-- Secciones dinámicas --}}
    @if(!empty($tabla))
        @include('pdf.partials.tabla')
    @endif

    @if(!empty($pie))
        @include('pdf.partials.grafico_pie')
    @endif

    @if(!empty($barras))
        @include('pdf.partials.grafico_barras')
    @endif

</body>
</html>
