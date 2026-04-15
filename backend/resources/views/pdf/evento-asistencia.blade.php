<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
        }

        h1, h2, h3 {
            color: #034991;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background-color: #034991;
            color: white;
            padding: 8px;
            border: 1px solid #ddd;
            font-size: 11px;
        }

        td {
            padding: 10px;
            border: 1px solid #ddd;
            font-size: 11px;
        }

        .firma-box {
            height: 28px;
        }

        .info-evento {
            margin-top: 20px;
            margin-bottom: 20px;
        }

        .info-evento p {
            margin: 4px 0;
        }

        .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>

    <table width="100%">
        <tr>
            <td width="20%">
                <img src="{{ public_path('logos/logo_universidad.png') }}" width="90">
            </td>

            <td width="60%" align="center">
                <h1>Hoja de Asistencia</h1>
                <p>Sistema GradEm-SIUA</p>
            </td>

            <td width="20%" align="right">
                <img src="{{ public_path('logos/logo_gradem.png') }}" width="90">
            </td>
        </tr>
    </table>

    <hr>

    <div class="info-evento">
        <h3>Información del Evento</h3>

        <p><strong>Evento:</strong> {{ $evento->titulo }}</p>
        <p><strong>Fecha:</strong> {{ $evento->fecha_evento ?? 'No definida' }}</p>
        <p><strong>Hora:</strong> {{ $evento->hora_evento ?? 'No definida' }}</p>
        <p><strong>Total Participantes:</strong> {{ count($inscritos) }}</p>
    </div>

    <h3>Control de Asistencia</h3>

    <table>
        <thead>
            <tr>
                <th width="70%">Nombre del Participante</th>
                <th width="30%">Firma / Asistencia</th>
            </tr>
        </thead>

        <tbody>
            @forelse($inscritos as $inscrito)
                <tr>
                    <td>{{ $inscrito->nombre_completo }}</td>
                    <td class="firma-box"></td>
                </tr>
            @empty
                <tr>
                    <td colspan="2" align="center">
                        No hay participantes inscritos.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Documento generado el {{ now()->format('d/m/Y H:i') }}
    </div>
</body>
</html>
