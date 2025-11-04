@php
  // Normalizamos el payload que llega desde el ServicioPlantillaCurriculum
  $d = $datos ?? [];

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
  body {
    font-family: Arial, sans-serif;
    color: #000000;
    margin: 20px;
    line-height: 1.6;
  }
  .header {
    background-color: #000000;
    color: white;
    padding: 15px;
    text-align: center;
    margin-bottom: 20px;
  }
  .titulo {
    font-size: 18px;
    font-weight: bold;
    color: white;
  }
  .sub {
    color: #000000;
    font-weight: bold;
    border-bottom: 2px solid #000000;
    padding-bottom: 5px;
    margin-top: 15px;
    margin-bottom: 10px;
  }
  section {
    margin-bottom: 15px;
  }
  .foto-perfil {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #000000;
  }
  .header-con-foto {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  .info-personal {
    flex: 1;
  }
  .chip {
    display: inline-block;
    background-color: #f0f0f0;
    border: 1px solid #000000;
    border-radius: 12px;
    padding: 4px 10px;
    margin: 2px 4px 2px 0;
    font-size: 11px;
    color: #000000;
  }
  strong {
    color: #000000;
  }
</style>
</head>
<body>

  <section>
    <h3 class="sub">Datos personales</h3>
    
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
      <div><strong>{{ $d['datosPersonales']['nombreCompleto'] ?? '' }}</strong></div>
      @if($lineaContacto !== '')
        <div>{{ $lineaContacto }}</div>
      @endif
      @if(!empty($d['resumenProfesional']))
        <p style="margin-top:8px;">{{ $d['resumenProfesional'] }}</p>
      @endif
    @endif
  </section>

  @if(!empty($d['educaciones']))
  <section>
    <h3 class="sub">Formación académica</h3>
    @foreach($d['educaciones'] as $e)
      @php
        $tipo = trim($e['tipo'] ?? '');
        $institucion = trim($e['institucion'] ?? '');
        $titulo = trim($e['titulo'] ?? '');
        $fechaFin = trim($e['fecha_fin'] ?? '');
      @endphp
      
      @if($institucion && $titulo)
        <div style="margin-bottom:8px;">
          @if($tipo)
            <span style="font-size:10px; color:#666; text-transform:uppercase;">[{{ $tipo }}]</span>
          @endif
          <strong>{{ $titulo }}</strong> - {{ $institucion }}
          @if($fechaFin) <em>({{ $fechaFin }})</em> @endif
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
        
        $funcionesArray = [];
        if ($funciones) {
            $funcionesArray = preg_split('/[\r\n;]+/', $funciones);
            $funcionesArray = array_map('trim', $funcionesArray);
            $funcionesArray = array_filter($funcionesArray);
        }
        
        $referencias = $ex['referencias'] ?? [];
      @endphp
      
      @if($empresa && $puesto)
        <div style="margin-bottom:12px;">
          <div><strong>{{ $puesto }}</strong> - {{ $empresa }} @if($periodo) <em>{{ $periodo }}</em> @endif</div>
          
          @if(!empty($funcionesArray))
            <ul style="margin-top:4px; margin-bottom:4px; padding-left:20px; font-size:11px;">
              @foreach($funcionesArray as $funcion)
                <li style="margin-bottom:2px;">{{ $funcion }}</li>
              @endforeach
            </ul>
          @endif
          
          @if(!empty($referencias))
            <div style="margin-top:6px; padding-left:10px; border-left:2px solid #ddd;">
              <div style="font-size:10px; font-weight:bold; margin-bottom:3px;">Referencias:</div>
              @foreach($referencias as $ref)
                @php
                  $nombre = trim($ref['nombre'] ?? '');
                  $contacto = trim($ref['contacto'] ?? '');
                  $correo = trim($ref['correo'] ?? '');
                  $relacion = trim($ref['relacion'] ?? '');
                @endphp
                
                @if($nombre && ($contacto || $correo))
                  <div style="font-size:10px; margin-bottom:2px;">
                    <strong>{{ $nombre }}</strong>
                    @if($relacion) - {{ $relacion }} @endif
                    @if($contacto) · Tel: {{ $contacto }} @endif
                    @if($correo) · Email: {{ $correo }} @endif
                  </div>
                @endif
              @endforeach
            </div>
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
</body>
</html>