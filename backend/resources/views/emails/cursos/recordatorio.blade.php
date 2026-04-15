<!DOCTYPE html>
<html lang="es">
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
        <td align="center">

            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:40px;">

                <!-- Logos -->
                <tr>
                    <td align="center" style="padding-bottom:20px;">
                        <img src="cid:logo_universidad" style="width:120px; margin-right:20px;">
                        <img src="cid:logo_gradem" style="width:120px;">
                    </td>
                </tr>

                <!-- Título -->
                <tr>
                    <td style="text-align:center; font-size:24px; font-weight:bold; color:#1a1a2e;">
                        Recordatorio de curso
                    </td>
                </tr>

                <!-- Saludo -->
                <tr>
                    <td style="padding-top:20px; font-size:15px; color:#555; text-align:center;">
                        Le recordamos que tiene un curso próximo:
                    </td>
                </tr>

                <!-- Nombre del curso -->
                <tr>
                    <td style="padding:20px 0; text-align:center; font-size:20px; font-weight:bold; color:#CD1719;">
                        {{ $nombre_curso }}
                    </td>
                </tr>

                <!-- Detalles -->
                <tr>
                    <td>
                        <table width="100%" cellpadding="8" cellspacing="0"
                               style="border:1px solid #e0e0e0; border-radius:6px; font-size:14px; color:#333;">

                            <tr style="background:#f9f9f9;">
                                <td style="font-weight:bold; width:40%; padding:10px 14px;">Fecha del evento</td>
                                <td style="padding:10px 14px;">{{ $fecha_evento }}</td>
                            </tr>

                        </table>
                    </td>
                </tr>

                <!-- Mensaje del recordatorio -->
                <tr>
                    <td style="padding-top:24px;">
                        <table width="100%" cellpadding="0" cellspacing="0"
                               style="background:#f0f6ff; border-left:4px solid #034991; border-radius:4px; padding:16px;">
                            <tr>
                                <td style="padding:16px; font-size:14px; color:#1a1a2e; line-height:1.6;">
                                    {!! nl2br(e($mensaje)) !!}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Mensaje adicional -->
                <tr>
                    <td style="padding-top:24px; font-size:14px; color:#666; text-align:center;">
                        Si tiene alguna consulta, comuníquese con la administración de GradEm SIUA.
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