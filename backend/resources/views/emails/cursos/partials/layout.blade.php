<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $titulo ?? 'Notificación de curso' }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #f5f7fb;
            font-family: Arial, Helvetica, sans-serif;
            color: #1f2937;
        }

        .wrapper {
            width: 100%;
            padding: 24px 12px;
        }

        .card {
            max-width: 640px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
        }

        .header {
            background: #034991;
            color: #ffffff;
            padding: 16px 20px;
            font-size: 18px;
            font-weight: 700;
        }

        .content {
            padding: 20px;
            font-size: 15px;
            line-height: 1.55;
        }

        .footer {
            padding: 12px 20px 20px;
            font-size: 12px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="header">
                {{ $titulo ?? 'Notificacion de curso' }}
            </div>
            <div class="content">
                {!! nl2br(e($mensaje ?? '')) !!}
            </div>
            <div class="footer">
                GradEm UNA
            </div>
        </div>
    </div>
</body>
</html>
