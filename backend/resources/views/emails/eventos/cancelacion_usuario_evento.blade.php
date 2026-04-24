<!DOCTYPE html>
<html lang="es">
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
                   style="background:#ffffff; border-radius:8px; padding:40px;">

                <!-- Logos -->
                <tr>
                    <td align="center" style="padding-bottom:20px;">
                        <img src="cid:logo_universidad" style="width:120px; margin-right:20px;"
                             alt="Logo Universidad Nacional">
                        <img src="cid:logo_gradem" style="width:120px;" alt="Logo GradEm">
                    </td>
                </tr>

                <!-- Título -->
                <tr>
                    <td style="text-align:center; font-size:24px; font-weight:bold; color:#1a1a2e;">
                        Cancelación de inscripción
                    </td>
                </tr>

                <!-- Saludo -->
                <tr>
                    <td style="padding-top:20px; font-size:15px; color:#555; text-align:center;">
                        Estimado/a <strong>{{ $nombreParticipante }}</strong>,<br>
                        hemos recibido tu solicitud de cancelación de inscripción al siguiente evento:
                    </td>
                </tr>

                <!-- Nombre del evento -->
                <tr>
                    <td style="padding:20px 0; text-align:center; font-size:20px;
                                font-weight:bold; color:#CD1719;">
                        {{ $evento['titulo'] ?? 'Evento' }}
                    </td>
                </tr>

                <!-- Detalles -->
                <tr>
                    <td>
                        <table width="100%" cellpadding="8" cellspacing="0"
                               style="border:1px solid #e0e0e0; border-radius:6px;
                                      font-size:14px; color:#333;">

                            @if(!empty($evento['fecha_evento']))
                            <tr style="background:#f9f9f9;">
                                <td style="font-weight:bold; width:40%; padding:10px 14px;">
                                    Fecha del evento
                                </td>
                                <td style="padding:10px 14px;">
                                    {{ \Carbon\Carbon::parse($evento['fecha_evento'])->format('d/m/Y') }}
                                </td>
                            </tr>
                            @endif

                            @if(!empty($evento['hora_evento']))
                            <tr>
                                <td style="font-weight:bold; padding:10px 14px;">Hora</td>
                                <td style="padding:10px 14px;">
                                    {{ $evento['hora_evento'] }}
                                </td>
                            </tr>
                            @endif

                            @if(!empty($evento['modalidad_nombre']))
                            <tr style="background:#f9f9f9;">
                                <td style="font-weight:bold; padding:10px 14px;">Modalidad</td>
                                <td style="padding:10px 14px;">{{ $evento['modalidad_nombre'] }}</td>
                            </tr>
                            @endif

                        </table>
                    </td>
                </tr>

                <!-- Mensaje -->
                <tr>
                    <td style="padding-top:24px; font-size:14px; color:#666; text-align:center;">
                        Tu inscripción ha sido cancelada exitosamente. El cupo quedará
                        disponible para otros participantes.<br><br>
                        Si deseas volverte a inscribir, poduedes hacerlo desde la plataforma
                        mientras haya cupos disponibles.
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="padding-top:40px; font-size:12px; text-align:center; color:#999;">
                        GradEm SIUA – Universidad Nacional de Costa Rica
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>