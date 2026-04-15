<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Recordatorio de evento</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
    <h2 style="color: #034991; margin-bottom: 12px;">Recordatorio de evento</h2>

    <p><strong>Evento:</strong> {{ $nombre_evento ?? 'Evento' }}</p>
    <p><strong>Fecha:</strong> {{ $fecha_evento ?? 'Por definir' }}</p>

    <div style="margin-top: 16px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;">
        {{ $mensaje ?? '' }}
    </div>

    <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">GradEm-UNA</p>
</body>
</html>
