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
Actualización de curso
</td>
</tr>

<tr>
<td style="padding-top:15px; font-size:15px; text-align:center;">
El curso <strong>{{ $curso->titulo }}</strong> ha tenido cambios importantes:
</td>
</tr>

<tr>
<td style="padding-top:20px;">
<ul style="font-size:14px; color:#555;">
@foreach($cambios as $campo => $valor)
  <li>
    <strong>
      @switch($campo)
        @case('id_modalidad')
          Modalidad
          @break

        @case('nombreInstructor')
          Nombre Instructor
          @break

        @case('fecha_inicio')
          Fecha de inicio
          @break

        @case('fecha_fin')
          Fecha de finalización
          @break

        @case('fecha_limite_inscripcion')
          Fecha límite de inscripción
          @break

        @default
          {{ ucfirst(str_replace('_', ' ', $campo)) }}
      @endswitch
    :</strong>

    {{-- Valor --}}
    @if($campo === 'id_modalidad')
      {{ $curso->modalidad->nombre ?? '—' }}
    @else
      {{ $valor }}
    @endif
  </li>
@endforeach
</ul>
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
