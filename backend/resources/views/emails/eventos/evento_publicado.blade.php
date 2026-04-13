<!DOCTYPE html>
<html lang="es">
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">
<table width="600" style="background:#ffffff; border-radius:8px; padding:40px;">
<tr>
<td align="center" style="padding-bottom:20px;">
<img src="cid:logo_universidad" style="width:120px; margin-right:20px;">
<img src="cid:logo_gradem" style="width:120px;">
</td>
</tr>
<tr>
<td style="text-align:center; font-size:24px; font-weight:bold;">
Nuevo evento publicado
</td>
</tr>
<tr>
<td style="padding-top:15px; font-size:15px; text-align:center; color:#555;">
El evento <strong>{{ $evento->titulo }}</strong> ya está disponible. Revisa los detalles y anota la fecha.
</td>
</tr>
<tr>
<td style="padding-top:20px; font-size:14px; color:#555;">
<strong>Fecha:</strong> {{ $evento->fecha_evento ?? 'Pendiente' }}
@if(!empty($evento->hora_evento)) a las <strong>{{ $evento->hora_evento }}</strong>@endif
</td>
</tr>
<tr>
<td style="padding-top:10px; font-size:14px; color:#555;">
<strong>Modalidad:</strong> {{ $evento->modalidad_nombre ?? 'No definida' }}<br>
<strong>Ubicación:</strong>
@if(!empty($evento->canton_nombre) || !empty($evento->provincia_nombre) || !empty($evento->pais_nombre))
    {{ trim(($evento->canton_nombre ?? '') . ', ' . ($evento->provincia_nombre ?? '') . ', ' . ($evento->pais_nombre ?? ''), ', ') }}
@else
    No definida
@endif
</td>
</tr>
<tr>
<td style="padding-top:20px; font-size:14px; color:#555;">
{{ $evento->descripcion ?? 'No hay descripción disponible.' }}
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
