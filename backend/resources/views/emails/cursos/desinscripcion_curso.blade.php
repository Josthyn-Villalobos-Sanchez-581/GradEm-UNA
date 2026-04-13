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
                        Desinscripción de curso
                    </td>
                </tr>

                <!-- Saludo -->
                <tr>
                    <td style="padding-top:20px; font-size:15px; color:#555; text-align:center;">
                        Estimado/a <strong>{{ $nombreParticipante }}</strong>,<br>
                        le informamos que ha sido desinscrito/a del siguiente curso:
                    </td>
                </tr>

                <!-- Nombre del curso -->
                <tr>
                    <td style="padding:20px 0; text-align:center; font-size:20px; font-weight:bold; color:#CD1719;">
                        {{ $curso->titulo }}
                    </td>
                </tr>

                <!-- Detalles del curso -->
                <tr>
                    <td>
                        <table width="100%" cellpadding="8" cellspacing="0"
                               style="border:1px solid #e0e0e0; border-radius:6px; font-size:14px; color:#333;">

                            @if($curso->nombreInstructor)
                            <tr style="background:#f9f9f9;">
                                <td style="font-weight:bold; width:40%; padding:10px 14px;">Instructor</td>
                                <td style="padding:10px 14px;">{{ $curso->nombreInstructor }}</td>
                            </tr>
                            @endif

                            @if($curso->modalidad)
                            <tr>
                                <td style="font-weight:bold; padding:10px 14px;">Modalidad</td>
                                <td style="padding:10px 14px;">{{ $curso->modalidad->nombre }}</td>
                            </tr>
                            @endif

                            @if($curso->duracion)
                            <tr style="background:#f9f9f9;">
                                <td style="font-weight:bold; padding:10px 14px;">Duración</td>
                                <td style="padding:10px 14px;">{{ $curso->duracion }}</td>
                            </tr>
                            @endif

                            @if($curso->fecha_inicio)
                            <tr>
                                <td style="font-weight:bold; padding:10px 14px;">Fecha de inicio</td>
                                <td style="padding:10px 14px;">
                                    {{ \Carbon\Carbon::parse($curso->fecha_inicio)->format('d/m/Y') }}
                                </td>
                            </tr>
                            @endif

                            @if($curso->fecha_fin)
                            <tr style="background:#f9f9f9;">
                                <td style="font-weight:bold; padding:10px 14px;">Fecha de fin</td>
                                <td style="padding:10px 14px;">
                                    {{ \Carbon\Carbon::parse($curso->fecha_fin)->format('d/m/Y') }}
                                </td>
                            </tr>
                            @endif

                        </table>
                    </td>
                </tr>

                <!-- Mensaje adicional -->
                <tr>
                    <td style="padding-top:24px; font-size:14px; color:#666; text-align:center;">
                        Si considera que esto es un error o tiene alguna consulta,<br>
                        comuníquese con la administración de GradEm SIUA.
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