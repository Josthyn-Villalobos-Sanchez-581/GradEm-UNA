@php
  // Normalizamos el payload que llega desde el ServicioPlantillaCurriculum
  // y damos un fallback si aún no existiera 'idiomas_normalizados'.
  $d = $datos;

  // Telefóno y correo en una sola línea con separador solo si ambos existen
  $lineaContacto = trim(($d['datosPersonales']['correo'] ?? '') . ' ' .
                    ((isset($d['datosPersonales']['telefono']) && $d['datosPersonales']['telefono'] !== '')
                      ? '· ' . $d['datosPersonales']['telefono'] : ''));

  // Idiomas normalizados: preferir $d['idiomas_normalizados']; si no existe, construirlos de nombre + nivel
  $idiomasNormalizados = $d['idiomas_normalizados'] ?? collect($d['idiomas'] ?? [])->map(function ($i) {
      $nombre = trim($i['nombre'] ?? '');
      $nivel  = trim($i['nivel'] ?? '');
      return $nombre !== '' || $nivel !== '' ? ($nivel ? "{$nombre} ({$nivel})" : $nombre) : null;
  })->filter()->values()->all();

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
    <div><strong>{{ $d['datosPersonales']['nombreCompleto'] ?? '' }}</strong></div>
    @if($lineaContacto !== '')
      <div>{{ $lineaContacto }}</div>
    @endif
    @if(!empty($d['resumenProfesional']))
      <p style="margin-top:8px;">{{ $d['resumenProfesional'] }}</p>
    @endif
  </section>

  @if(!empty($d['educaciones']))
  <section>
    <h3 class="sub">Formación académica</h3>
    @foreach($d['educaciones'] as $e)
      @php
        $ini = $e['fecha_inicio'] ?? '';
        $fin = $e['fecha_fin'] ?? '';
        $rango = ($ini || $fin) ? '(' . ($ini ?: '¿?') . ' - ' . ($fin ?: 'Actual') . ')' : '';
      @endphp
      <div>
        <strong>{{ $e['titulo'] ?? '' }}</strong>
        @if(!empty($e['institucion'])) — {{ $e['institucion'] }} @endif
        @if($rango) {{ $rango }} @endif
      </div>
    @endforeach
  </section>
  @endif

  @if(!empty($d['experiencias']))
  <section>
    <h3 class="sub">Experiencia laboral</h3>
    @foreach($d['experiencias'] as $x)
      @php
        $ini = $x['periodo_inicio'] ?? '';
        $fin = $x['periodo_fin'] ?? '';
        $rango = ($ini || $fin) ? '(' . ($ini ?: '¿?') . ' - ' . ($fin ?: 'Actual') . ')' : '';
      @endphp
      <div>
        <strong>{{ $x['puesto'] ?? '' }}</strong>
        @if(!empty($x['empresa'])) — {{ $x['empresa'] }} @endif
        @if($rango) {{ $rango }} @endif
      </div>
      @if(!empty($x['funciones']))<div style="margin-left:10px">{{ $x['funciones'] }}</div>@endif
    @endforeach
  </section>
  @endif

  @if(!empty($d['habilidades']))
  <section>
    <h3 class="sub">Habilidades</h3>
    <div>
    @foreach($d['habilidades'] as $h)
      @if(!empty($h['descripcion']))
        <span class="chip">{{ $h['descripcion'] }}</span>
      @endif
    @endforeach
    </div>
  </section>
  @endif

  {{-- ✅ Idiomas: se usa la versión normalizada (Nombre (Nivel)) --}}
  @if(!empty($idiomasNormalizados))
  <section>
    <h3 class="sub">Idiomas</h3>
    <div>
      @foreach($idiomasNormalizados as $idioma)
        <span class="chip">{{ $idioma }}</span>
      @endforeach
    </div>
  </section>
  @endif

  @if(!empty($d['referencias']))
  <section>
    <h3 class="sub">Referencias</h3>
    @foreach($d['referencias'] as $r)
      @php
        $partes = [];
        if (!empty($r['nombre']))    $partes[] = $r['nombre'];
        if (!empty($r['relacion']))  $partes[] = $r['relacion'];
        $cabecera = implode(' — ', $partes);
      @endphp
      <div>
        @if($cabecera !== '') <strong>{{ $cabecera }}</strong>@endif
        @if(!empty($r['contacto'])) · {{ $r['contacto'] }} @endif
      </div>
    @endforeach
  </section>
  @endif

  <footer>Generado por GradEm-SIUA • {{ now()->format('d/m/Y') }}</footer>
</body>
</html>
