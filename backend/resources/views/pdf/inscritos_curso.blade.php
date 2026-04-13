<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Listado de inscritos</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #1e293b;
            margin: 0;
            padding: 16px;
        }

        .header {
            border-bottom: 2px solid #034991;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }

        .header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .title {
            font-size: 16px;
            font-weight: 700;
            color: #034991;
            margin: 0;
        }

        .subtitle {
            margin: 4px 0 0;
            font-size: 12px;
            color: #475569;
        }

        .logo {
            max-height: 38px;
        }

        .meta {
            margin-top: 10px;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            padding: 10px;
            line-height: 1.45;
        }

        .meta strong {
            color: #0f172a;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
        }

        thead th {
            background: #034991;
            color: #fff;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            text-align: left;
            padding: 8px 6px;
        }

        tbody td {
            border: 1px solid #e2e8f0;
            padding: 6px;
            vertical-align: top;
            font-size: 10px;
        }

        tbody tr:nth-child(even) {
            background: #f8fafc;
        }

        .empty {
            text-align: center;
            padding: 20px;
            color: #64748b;
            border: 1px solid #e2e8f0;
            margin-top: 12px;
        }

        .footer {
            margin-top: 12px;
            font-size: 9px;
            color: #64748b;
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-top">
            <div>
                <h1 class="title">Listado de inscritos al curso</h1>
                <p class="subtitle">{{ $curso->titulo }}</p>
            </div>
            @if($logoSrc)
                <img class="logo" src="{{ $logoSrc }}" alt="Logo GradEm">
            @endif
        </div>

        <div class="meta">
            <strong>Modalidad:</strong> {{ $curso->modalidad?->nombre ?? 'NA' }}<br>
            <strong>Instructor:</strong> {{ $curso->nombreInstructor ?? 'NA' }}<br>
            <strong>Fecha de inicio:</strong> {{ $curso->fecha_inicio ?? 'NA' }}<br>
            <strong>Total de inscritos:</strong> {{ count($inscritos) }}
        </div>
    </div>

    @if(count($inscritos) > 0)
        <table>
            <thead>
                <tr>
                    <th style="width: 4%;">#</th>
                    <th style="width: 20%;">Nombre</th>
                    <th style="width: 21%;">Correo</th>
                    <th style="width: 12%;">Identificación</th>
                    <th style="width: 12%;">Teléfono</th>
                    <th style="width: 15%;">Universidad</th>
                    <th style="width: 16%;">Carrera</th>
                </tr>
            </thead>
            <tbody>
                @foreach($inscritos as $index => $inscrito)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $inscrito->nombre_completo ?? 'NA' }}</td>
                        <td>{{ $inscrito->correo ?? 'NA' }}</td>
                        <td>{{ $inscrito->identificacion ?? 'NA' }}</td>
                        <td>{{ $inscrito->telefono ?? 'NA' }}</td>
                        <td>{{ $inscrito->universidad ?? 'NA' }}</td>
                        <td>{{ $inscrito->carrera ?? 'NA' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="empty">No hay inscritos registrados para este curso.</div>
    @endif

    <div class="footer">Generado el {{ $generadoEn }}</div>
</body>
</html>
