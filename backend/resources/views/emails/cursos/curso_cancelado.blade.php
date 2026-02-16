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
                    <td style="text-align:center; font-size:24px; font-weight:bold;">
                        Curso cancelado
                    </td>
                </tr>

                <!-- Texto introductorio -->
                <tr>
                    <td style="padding-top:20px; font-size:15px; color:#555; text-align:center;">
                        Lamentamos informarle que el curso:
                    </td>
                </tr>

                <!-- Nombre del curso -->
                <tr>
                    <td style="padding:20px 0; text-align:center; font-size:18px; font-weight:bold; color:#CD1719;">
                        {{ $curso['titulo'] }}
                    </td>
                </tr>

                <tr>
                    <td style="padding-bottom:20px; text-align:center; font-size:18px; font-weight:bold;">
                        Ha sido cancelado.
                    </td>
                </tr>

                <!-- Motivo -->
                @if(!empty($motivo))
                    <tr>
                        <td style="font-size:14px; color:#666; text-align:center;">
                            Motivo de cancelación:
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-top:8px; font-size:15px; font-weight:bold; color:#CD1719; text-align:center;">
                            {{ $motivo }}
                        </td>
                    </tr>
                @else
                    <tr>
                        <td style="font-size:14px; color:#666; text-align:center;">
                            Ha sido cancelado por motivos administrativos.
                        </td>
                    </tr>
                @endif

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
