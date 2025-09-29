@php
  $d = $datos;
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  /* ER colores UNA */
  :root{
    --rojo-una:#CD1719; --azul-una:#034991; --gris:#A7A7A9; --blanco:#FFFFFF; --negro:#000000;
  }
  body{ font-family: "Open Sans", DejaVu Sans, Arial, sans-serif; font-size:12px; color:#000; }
  header{ border-bottom:3px solid var(--rojo-una); padding:8px 0; }
  .titulo{ color:var(--azul-una); font-size:18px; font-weight:700; }
  .sub{ color:var(--rojo-una); font-weight:700; margin-top:14px; border-bottom:1px solid var(--gris); }
  .fila{ display:flex; gap:12px; }
  .col{ flex:1; }
  .chip{ display:inline-block; border:1px solid var(--azul-una); padding:3px 6px; margin:2px; border-radius:4px; font-size:11px;}
  footer{ position:fixed; bottom:10px; left:0; right:0; text-align:center; font-size:10px; color:#555; }
</style>
</head>
<body>
  <header>
    <div class="titulo">Universidad Nacional (UNA) - Currículum Vitae</div>
  </header>

  <section>
    <h3 class="sub">Datos personales</h3>
    <div><strong>{{ $d['datosPersonales']['nombreCompleto'] }}</strong></div>
    <div>{{ $d['datosPersonales']['correo'] }} · {{ $d['datosPersonales']['telefono'] ?? '' }}</div>
    @if(!empty($d['resumenProfesional']))
      <p style="margin-top:8px;">{{ $d['resumenProfesional'] }}</p>
    @endif
  </section>

  @if(!empty($d['educaciones']))
  <section>
    <h3 class="sub">Formación académica</h3>
    @foreach($d['educaciones'] as $e)
      <div><strong>{{ $e['titulo'] }}</strong> — {{ $e['institucion'] }} ({{ $e['fecha_inicio'] ?? '' }} - {{ $e['fecha_fin'] ?? 'Actual' }})</div>
    @endforeach
  </section>
  @endif

  @if(!empty($d['experiencias']))
  <section>
    <h3 class="sub">Experiencia laboral</h3>
    @foreach($d['experiencias'] as $x)
      <div><strong>{{ $x['puesto'] }}</strong> — {{ $x['empresa'] }} ({{ $x['periodo_inicio'] ?? '' }} - {{ $x['periodo_fin'] ?? 'Actual' }})</div>
      @if(!empty($x['funciones']))<div style="margin-left:10px">{{ $x['funciones'] }}</div>@endif
    @endforeach
  </section>
  @endif

  @if(!empty($d['habilidades']))
  <section>
    <h3 class="sub">Habilidades</h3>
    <div>
    @foreach($d['habilidades'] as $h)
      <span class="chip">{{ $h['descripcion'] }}</span>
    @endforeach
    </div>
  </section>
  @endif

  @if(!empty($d['idiomas']))
  <section>
    <h3 class="sub">Idiomas</h3>
    @foreach($d['idiomas'] as $i)
      <div>- {{ $i['nombre'] ?? 'Idioma' }} ({{ $i['nivel'] }})</div>
    @endforeach
  </section>
  @endif

  @if(!empty($d['referencias']))
  <section>
    <h3 class="sub">Referencias</h3>
    @foreach($d['referencias'] as $r)
      <div>- {{ $r['nombre'] }} · {{ $r['contacto'] }} ({{ $r['relacion'] }})</div>
    @endforeach
  </section>
  @endif

  <footer>Generado por GradEm-SIUA • {{ now()->format('d/m/Y') }}</footer>
</body>
</html>
