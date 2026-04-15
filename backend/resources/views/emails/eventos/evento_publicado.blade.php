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
                        ¡Nuevo Evento Publicado!
                    </td>
                </tr>

                <tr>
                    <td style="padding-top:20px; font-size:15px; color:#555; text-align:center;">
                        Se ha publicado un nuevo evento que podría ser de su interés:
                    </td>
                </tr>

                <tr>
                    <td style="padding-top:20px; text-align:center; font-size:20px; font-weight:bold; color:#CD1719;">
                        {{ $evento->titulo }}
                    </td>
                </tr>

                <tr>
                    <td style="padding:15px 0 25px 0; font-size:14px; color:#666; line-height:1.6; text-align:center; font-style: italic;">
                        "{{ $evento->descripcion ?? 'Sin descripción disponible.' }}"
                    </td>
                </tr>

                <tr>
                    <td>
                        <table width="100%" cellpadding="8" cellspacing="0" 
                               style="border:1px solid #e0e0e0; border-radius:6px; font-size:14px; color:#333;">
                            <tr style="background:#f9f9f9;">
                                <td style="font-weight:bold; width:40%; padding:10px 14px;">Modalidad</td>
                                <td style="padding:10px 14px;">{{ $evento->modalidad_nombre ?? 'No definida' }}</td>
                            </tr>
                            <tr>
                                <td style="font-weight:bold; padding:10px 14px;">Ubicación</td>
                                <td style="padding:10px 14px;">
                                    {{ trim(($evento->canton_nombre ?? '') . ', ' . ($evento->provincia_nombre ?? '') . ', ' . ($evento->pais_nombre ?? ''), ', ') ?: 'No definida' }}
                                </td>
                            </tr>
                            <tr style="background:#f9f9f9;">
                                <td style="font-weight:bold; padding:10px 14px;">Fecha</td>
                                <td style="padding:10px 14px;">
                                    {{ $evento->fecha_evento ? \Carbon\Carbon::parse($evento->fecha_evento)->format('d/m/Y') : 'Pendiente' }}
                                </td>
                            </tr>
                            @if(!empty($evento->hora_evento))
                            <tr>
                                <td style="font-weight:bold; padding:10px 14px;">Hora</td>
                                <td style="padding:10px 14px;">{{ $evento->hora_evento }}</td>
                            </tr>
                            @endif
                        </table>
                    </td>
                </tr>

                @if(!empty($evento->otras_observaciones))
                <tr>
                    <td style="padding-top:25px; font-size:14px; color:#333;">
                        <strong style="color:#1a1a2e;">Otras observaciones:</strong><br>
                        <div style="margin-top:8px; padding:12px; background-color:#f8f9fa; border-radius:6px; border-left:4px solid #CD1719;">
                            @if(filter_var($evento->otras_observaciones, FILTER_VALIDATE_URL))
                                <a href="{{ $evento->otras_observaciones }}" target="_blank" style="color:#034991; text-decoration:underline; font-weight:bold;">
                                    {{ $evento->otras_observaciones }}
                                </a>
                            @else
                                {{ $evento->otras_observaciones }}
                            @endif
                        </div>
                    </td>
                </tr>
                @endif

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