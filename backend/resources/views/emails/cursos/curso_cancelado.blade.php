<!DOCTYPE html>
<html lang="es">
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:40px;">
                <tr>
                    <td align="center" style="padding-bottom:20px;">
                        <img src="cid:logo_universidad" style="width:120px; margin-right:20px;">
                        <img src="cid:logo_gradem" style="width:120px;">
                    </td>
                </tr>

                <tr>
                    <td style="text-align:center; font-size:24px; font-weight:bold; color:#1a1a2e;">
                        Curso Cancelado
                    </td>
                </tr>

                <tr>
                    <td style="padding-top:20px; font-size:15px; color:#555; text-align:center;">
                        Lamentamos informarle que el siguiente curso ha sido cancelado:
                    </td>
                </tr>

                <tr>
                    <td style="padding-top:20px; text-align:center; font-size:20px; font-weight:bold; color:#CD1719;">
                        {{ $curso['titulo'] }}
                    </td>
                </tr>

                <tr>
                    <td style="padding:10px 0 25px 0; text-align:center; font-size:16px; font-weight:bold; color:#1a1a2e;">
                        Estado: <span style="color:#CD1719;">Cancelado</span>
                    </td>
                </tr>

                <tr>
                    <td style="padding-top:10px; font-size:14px; color:#333;">
                        <strong style="color:#1a1a2e;">Motivo de la cancelación:</strong><br>
                        <div style="margin-top:8px; padding:15px; background-color:#fff5f5; border-radius:6px; border-left:4px solid #CD1719; color:#666; line-height:1.5;">
                            @if(!empty($motivo))
                                {{ $motivo }}
                            @else
                                Ha sido cancelado por motivos administrativos internos de la institución.
                            @endif
                        </div>
                    </td>
                </tr>

                <tr>
                    <td style="padding-top:25px; font-size:14px; color:#555; text-align:center;">
                        Sentimos los inconvenientes que esto pueda causarle.
                    </td>
                </tr>

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