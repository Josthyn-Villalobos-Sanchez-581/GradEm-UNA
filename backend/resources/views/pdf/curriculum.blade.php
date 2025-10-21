@php
  // Normalizamos el payload que llega desde el ServicioPlantillaCurriculum
  $d = $datos;

  // Teléfono y correo en una sola línea con separador solo si ambos existen
  $lineaContacto = trim(($d['datosPersonales']['correo'] ?? '') . ' ' .
                    ((isset($d['datosPersonales']['telefono']) && $d['datosPersonales']['telefono'] !== '')
                      ? '· ' . $d['datosPersonales']['telefono'] : ''));

  // Idiomas normalizados
  $idiomasNormalizados = $d['idiomas_normalizados'] ?? collect($d['idiomas'] ?? [])->map(function ($i) {
      $nombre = trim($i['nombre'] ?? '');
      $nivel  = trim($i['nivel'] ?? '');
      return $nombre !== '' || $nivel !== '' ? ($nivel ? "{$nombre} ({$nivel})" : $nombre) : null;
  })->filter()->values()->all();

    // Alias para mantener compatibilidad si el resto de la vista usa $d
    $d = $datos ?? [];

    $srcFoto = null;
    if (!empty($d['fotoPerfil'])) {
        $rutaCompleta = $d['fotoPerfil']['ruta_completa'] ?? null;
        $rutaPublica  = $d['fotoPerfil']['ruta_imagen'] ?? null;

        if ($rutaCompleta && file_exists($rutaCompleta)) {
            $mime = function_exists('mime_content_type') ? (mime_content_type($rutaCompleta) ?: 'image/jpeg') : 'image/jpeg';
            $srcFoto = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($rutaCompleta));
        } elseif ($rutaPublica) {
            // Asegurar URL absoluta para Dompdf (requiere isRemoteEnabled=true)
            $srcFoto = filter_var($rutaPublica, FILTER_VALIDATE_URL) ? $rutaPublica : url($rutaPublica);
        }
    }
@endphp

<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  /* Colores UNA */
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
  
  /* Estilos para la foto de perfil - CUADRADA */
  .header-con-foto{ display: flex; align-items: flex-start; gap: 20px; }
  .foto-perfil{ 
    width: 80px; 
    height: 80px; 
    border-radius: 8px; /* esquinas redondeadas suaves */
    object-fit: cover; 
    border: 2px solid var(--azul-una); 
  }
  .info-personal{ flex: 1; }
</style>
</head>
<body>
  <header>
    <div class="titulo">Universidad Nacional (UNA) - Currículum Vitae</div>
  </header>

  <section>
    <h3 class="sub">Datos personales</h3>
    
    {{-- Contenedor con o sin foto según corresponda --}}
    @if(isset($d['fotoPerfil']) && $d['fotoPerfil'])
      <div class="header-con-foto">
        <img src="{{ $srcFoto }}" alt="Foto de perfil" class="foto-perfil">
        <div class="info-personal">
          <div><strong>{{ $d['datosPersonales']['nombreCompleto'] ?? '' }}</strong></div>
          @if($lineaContacto !== '')
            <div>{{ $lineaContacto }}</div>
          @endif
          @if(!empty($d['resumenProfesional']))
            <p style="margin-top:8px;">{{ $d['resumenProfesional'] }}</p>
          @endif
        </div>
      </div>
    @else
      {{-- Sin foto: diseño original --}}
      <div><strong>{{ $d['datosPersonales']['nombreCompleto'] ?? '' }}</strong></div>
      @if($lineaContacto !== '')
        <div>{{ $lineaContacto }}</div>
      @endif
      @if(!empty($d['resumenProfesional']))
        <p style="margin-top:8px;">{{ $d['resumenProfesional'] }}</p>
      @endif
    @endif
  </section>

  {{-- Resto de las secciones --}}
  @if(!empty($d['educaciones']))
  <section>
    <h3 class="sub">Formación académica</h3>
    @foreach($d['educaciones'] as $e)
      @php
        $institucion = trim($e['institucion'] ?? '');
        $titulo = trim($e['titulo'] ?? '');
        $fechaInicio = trim($e['fecha_inicio'] ?? '');
        $fechaFin = trim($e['fecha_fin'] ?? '');
        
        $periodo = '';
        if ($fechaInicio && $fechaFin) {
            $periodo = "({$fechaInicio} - {$fechaFin})";
        } elseif ($fechaInicio) {
            $periodo = "(Desde {$fechaInicio})";
        } elseif ($fechaFin) {
            $periodo = "(Hasta {$fechaFin})";
        }
      @endphp
      
      @if($institucion && $titulo)
        <div style="margin-bottom:8px;">
          <strong>{{ $titulo }}</strong> - {{ $institucion }}
          @if($periodo) <em>{{ $periodo }}</em> @endif
        </div>
      @endif
    @endforeach
  </section>
  @endif

  @if(!empty($d['experiencias']))
  <section>
    <h3 class="sub">Experiencia laboral</h3>
    @foreach($d['experiencias'] as $ex)
      @php
        $empresa = trim($ex['empresa'] ?? '');
        $puesto = trim($ex['puesto'] ?? '');
        $funciones = trim($ex['funciones'] ?? '');
        $periodoInicio = trim($ex['periodo_inicio'] ?? '');
        $periodoFin = trim($ex['periodo_fin'] ?? '');
        
        $periodo = '';
        if ($periodoInicio && $periodoFin) {
            $periodo = "({$periodoInicio} - {$periodoFin})";
        } elseif ($periodoInicio) {
            $periodo = "(Desde {$periodoInicio})";
        } elseif ($periodoFin) {
            $periodo = "(Hasta {$periodoFin})";
        }
        
        // Dividir funciones por saltos de línea o puntos y comas
        $funcionesArray = [];
        if ($funciones) {
            $funcionesArray = preg_split('/[\r\n;]+/', $funciones);
            $funcionesArray = array_map('trim', $funcionesArray);
            $funcionesArray = array_filter($funcionesArray);
        }
      @endphp
      
      @if($empresa && $puesto)
        <div style="margin-bottom:12px;">
          <div><strong>{{ $puesto }}</strong> - {{ $empresa }} @if($periodo) <em>{{ $periodo }}</em> @endif</div>
          @if(!empty($funcionesArray))
            <ul style="margin-top:4px; margin-bottom:0; padding-left:20px; font-size:11px;">
              @foreach($funcionesArray as $funcion)
                <li style="margin-bottom:2px;">{{ $funcion }}</li>
              @endforeach
            </ul>
          @endif
        </div>
      @endif
    @endforeach
  </section>
  @endif

  @if(!empty($d['habilidades']))
  <section>
    <h3 class="sub">Habilidades</h3>
    <div>
      @foreach($d['habilidades'] as $h)
        @php 
          $desc = trim($h['descripcion'] ?? ''); 
        @endphp
        @if($desc) 
          <span class="chip">{{ $desc }}</span> 
        @endif
      @endforeach
    </div>
  </section>
  @endif

  @if(!empty($d['certificaciones']))
  <section>
    <h3 class="sub">Certificaciones</h3>
    @foreach($d['certificaciones'] as $c)
      @php
        $nombre = trim($c['nombre'] ?? '');
        $institucion = trim($c['institucion'] ?? '');
        $fechaObtencion = trim($c['fecha_obtencion'] ?? '');
        
        $fechaFormateada = '';
        if ($fechaObtencion) {
            try {
                // Configurar locale a español para formatear fechas
                setlocale(LC_TIME, 'es_ES.UTF-8', 'es_ES', 'spanish');
                $timestamp = strtotime($fechaObtencion);
                // Usar strftime en lugar de date para respetar el locale
                $fechaFormateada = strftime('%B %Y', $timestamp);
                // Capitalizar primera letra del mes
                $fechaFormateada = ucfirst($fechaFormateada);
            } catch (Exception $e) {
                $fechaFormateada = $fechaObtencion;
            }
        }
      @endphp
      
      @if($nombre)
        <div style="margin-bottom:8px;">
          <strong>{{ $nombre }}</strong>
          @if($institucion) - {{ $institucion }} @endif
          @if($fechaFormateada) <em>({{ $fechaFormateada }})</em> @endif
        </div>
      @endif
    @endforeach
  </section>
  @endif

  @if(!empty($idiomasNormalizados))
  <section>
    <h3 class="sub">Idiomas</h3>
    <div>
      @foreach($idiomasNormalizados as $idioma)
        @if($idioma) 
          <span class="chip">{{ $idioma }}</span> 
        @endif
      @endforeach
    </div>
  </section>
  @endif

  @if(!empty($d['referencias']))
  <section>
    <h3 class="sub">Referencias</h3>
    @foreach($d['referencias'] as $r)
      @php
        $nombre = trim($r['nombre'] ?? '');
        $contacto = trim($r['contacto'] ?? '');
        $relacion = trim($r['relacion'] ?? '');
      @endphp
      
      @if($nombre && $contacto)
        <div style="margin-bottom:6px;">
          <strong>{{ $nombre }}</strong> - {{ $contacto }}
          @if($relacion) ({{ $relacion }}) @endif
        </div>
      @endif
    @endforeach
  </section>
  @endif

  <footer>
    <p>Generado por el Sistema de Graduados de la Universidad Nacional de Costa Rica</p>
  </footer>
</body>
</html>