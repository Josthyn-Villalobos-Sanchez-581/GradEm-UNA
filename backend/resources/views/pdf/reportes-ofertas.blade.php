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

<table width="100%">
    <tr>
        <td width="20%">
            <img src="{{ public_path('logos/logo_universidad.png') }}" width="90">
        </td>
        <td width="60%" align="center">
            <h1>Reporte de Ofertas Laborales</h1>
            <p>Sistema de Bolsa de Empleo</p>
        </td>
        <td width="20%" align="right">
            <img src="{{ public_path('logos/logo_gradem.png') }}" width="90">
        </td>
    </tr>
</table>

<hr>

<h3>Filtros aplicados</h3>

@if(!empty($filtros))
    <ul>
        @foreach($filtros as $filtro)
            <li>
                <strong>{{ ucfirst(str_replace('_',' ',$filtro['campo'])) }}:</strong>
                {{ $filtro['valor'] }}
            </li>
        @endforeach
    </ul>
@else
    <p>No se aplicaron filtros.</p>
@endif

@if(!empty($ofertasMes))
    @include('pdf.partials.ofertas_mes')
@endif

@if(!empty($postulacionesTipo))
    @include('pdf.partials.postulaciones_tipo')
@endif

@if(!empty($topEmpresas))
    @include('pdf.partials.top_empresas')
@endif

@if(!empty($topCarreras))
    @include('pdf.partials.top_carreras')
@endif

</body>
</html>
