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
                        Actualización de Curso
                    </td>
                </tr>

                <tr>
                    <td style="padding-top:20px; font-size:15px; color:#555; text-align:center;">
                        Le informamos que se han realizado modificaciones en el siguiente curso:
                    </td>
                </tr>

                <tr>
                    <td style="padding-top:20px; text-align:center; font-size:20px; font-weight:bold; color:#CD1719;">
                        {{ $curso->titulo }}
                    </td>
                </tr>

                @if(!empty($curso->descripcion))
                <tr>
                    <td style="padding:15px 0 25px 0; font-size:14px; color:#666; line-height:1.6; text-align:center; font-style: italic;">
                        "{{ $curso->descripcion }}"
                    </td>
                </tr>
                @endif

                <tr>
                    <td>
                        <table width="100%" cellpadding="8" cellspacing="0" 
                               style="border:1px solid #e0e0e0; border-radius:6px; font-size:14px; color:#333;">
                            
                            <tr style="background:#f9f9f9;">
                                <td style="font-weight:bold; width:40%; padding:10px 14px;">Instructor</td>
                                <td style="padding:10px 14px;">{{ $curso->nombreInstructor ?? 'No asignado' }}</td>
                            </tr>

                            <tr>
                                <td style="font-weight:bold; padding:10px 14px;">Modalidad</td>
                                <td style="padding:10px 14px;">{{ $curso->modalidad->nombre ?? 'No definida' }}</td>
                            </tr>

                            <tr style="background:#f9f9f9;">
                                <td style="font-weight:bold; padding:10px 14px;">Fecha de Inicio</td>
                                <td style="padding:10px 14px;">
                                    {{ $curso->fecha_inicio ? \Carbon\Carbon::parse($curso->fecha_inicio)->format('d/m/Y') : 'Pendiente' }}
                                </td>
                            </tr>

                            <tr>
                                <td style="font-weight:bold; padding:10px 14px;">Fecha de Finalización</td>
                                <td style="padding:10px 14px;">
                                    {{ $curso->fecha_fin ? \Carbon\Carbon::parse($curso->fecha_fin)->format('d/m/Y') : 'Pendiente' }}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                @if(!empty($cambios))
                <tr>
                    <td style="padding-top:30px; font-size:14px; color:#555;">
                        <p style="font-weight:bold; margin-bottom:12px; color:#1a1a2e; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px;">
                            Cambios realizados:
                        </p>
                        <ul style="padding-left:18px; line-height:1.6; margin:0;">
                            @foreach($cambios as $campo => $valor)
                            <li style="margin-bottom:8px;">
                                <strong style="color:#333;">
                                    @switch($campo)
                                        @case('id_modalidad') Modalidad @break
                                        @case('nombreInstructor') Instructor @break
                                        @case('fecha_inicio') Fecha de inicio @break
                                        @case('fecha_fin') Fecha de finalización @break
                                        @case('fecha_limite_inscripcion') Límite de inscripción @break
                                        @default {{ ucfirst(str_replace('_', ' ', $campo)) }}
                                    @endswitch
                                :</strong> 
                                <span style="color:#CD1719;">{{ $campo === 'id_modalidad' ? ($curso->modalidad->nombre ?? '—') : ($valor ?? '—') }}</span>
                            </li>
                            @endforeach
                        </ul>
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