<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Bitácora GradEm - UNA</title>
    <style>
        @page { margin: 1.5cm; }
        
        body {
            font-family: 'Helvetica', Arial, sans-serif;
            font-size: 10px;
            color: #000000;
        }

        /* Encabezado con Colores UNA */
        .header {
            width: 100%;
            border-bottom: 3px solid #CD1719; /* Rojo UNA */
            margin-bottom: 20px;
            padding-bottom: 10px;
        }

        .header table { width: 100%; border: none; }
        .header td { border: none; vertical-align: middle; }

        .logo-gradem { width: 140px; }

        .info-sistema {
            text-align: right;
            color: #034991; /* Azul UNA */
        }

        .info-sistema h1 {
            margin: 0;
            font-size: 18px;
            text-transform: uppercase;
        }

        .info-sistema p {
            margin: 2px 0;
            color: #A7A7A9; /* Gris UNA */
            font-weight: bold;
        }

        /* Bloque de Filtros */
        .filtros {
            background-color: #F8F9FA;
            border-left: 5px solid #A7A7A9; /* Gris UNA */
            padding: 10px;
            margin-bottom: 20px;
        }

        .filtros strong { color: #034991; }

        /* Estilo de la Tabla de Movimientos */
        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background-color: #034991; /* Azul UNA */
            color: #FFFFFF;
            padding: 10px;
            text-align: left;
            text-transform: uppercase;
            font-size: 9px;
            border: 1px solid #034991;
        }

        td {
            padding: 8px;
            border: 1px solid #E0E0E0;
            vertical-align: top;
        }

        tr:nth-child(even) {
            background-color: #F2F2F2;
        }

        .op-text {
            font-weight: bold;
            color: #CD1719; /* Rojo UNA para resaltar la acción */
        }

        .footer {
            position: fixed;
            bottom: -30px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8px;
            color: #A7A7A9;
        }
    </style>
</head>
<body>

    <div class="header">
        <table>
            <tr>
                <td>
                    <img src="{{ $logoSrc }}" class="logo-gradem">
                </td>
                <td class="info-sistema">
                    <h1>Bitácora de Movimientos</h1>
                    <p>Sistema GradEm - Universidad Nacional</p>
                    <span style="font-size: 8px; color: #000;">Generado el: {{ date('d/m/Y H:i:s') }}</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="filtros">
        <strong>Filtros aplicados:</strong><br>
        Módulo: {{ $filtros['tabla_afectada'] ?? 'General' }} | 
        Acción: {{ $filtros['operacion'] ?? 'Todas' }} | 
        Rango: {{ $filtros['fecha_inicio'] ?? 'N/A' }} a {{ $filtros['fecha_fin'] ?? 'N/A' }}
    </div>

    <table>
        <thead>
            <tr>
                <th width="12%">Tabla</th>
                <th width="10%">Operación</th>
                <th width="18%">Usuario</th>
                <th width="15%">Fecha / Hora</th>
                <th>Descripción del Cambio</th>
            </tr>
        </thead>
        <tbody>
            @foreach($bitacora as $item)
            <tr>
                <td><strong>{{ $item->tabla_afectada }}</strong></td>
                <td class="op-text">{{ strtoupper($item->operacion) }}</td>
                <td>{{ $item->nombre_usuario ?? 'Sistema (Automático)' }}</td>
                <td>{{ $item->fecha_cambio }}</td>
                <td>{{ $item->descripcion_cambio }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        "La verdad nos hace libres" - Reporte generado por GradEm para la Universidad Nacional de Costa Rica
    </div>

</body>
</html>