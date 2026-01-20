@php
  // Normalizamos el payload que llega desde el ServicioPlantillaCurriculum
  $d = $datos ?? [];
  $datosPersonales = $d['datosPersonales'] ?? [];
  
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
<title>Currículum</title>
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #000000;
    padding: 30px 40px;
    background-color: #ffffff;
  }
  
  /* ===== ENCABEZADO - ATS OPTIMIZADO ===== */
  .header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #000000;
  }
  
  .nombre {
    font-size: 20pt;
    font-weight: bold;
    color: #000000;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .contacto {
    font-size: 10pt;
    color: #333333;
    line-height: 1.6;
  }
  
  .contacto-linea {
    margin: 3px 0;
  }
  
  .foto-perfil {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #000000;
    margin: 0 auto 10px;
    display: block;
  }
  
  /* ===== SECCIONES - ENCABEZADOS ATS ===== */
  .seccion {
    margin-bottom: 18px;
    page-break-inside: avoid;
  }
  
  .seccion-titulo {
    font-size: 13pt;
    font-weight: bold;
    color: #000000;
    text-transform: uppercase;
    border-bottom: 2px solid #000000;
    padding-bottom: 4px;
    margin-bottom: 10px;
    letter-spacing: 1px;
  }
  
  /* ===== RESUMEN PROFESIONAL ===== */
  .resumen {
    font-size: 10pt;
    color: #333333;
    text-align: justify;
    line-height: 1.6;
    margin-bottom: 15px;
  }
  
  /* ===== ITEMS DE CONTENIDO ===== */
  .item {
    margin-bottom: 12px;
    page-break-inside: avoid;
  }
  
  .item-titulo {
    font-size: 11pt;
    font-weight: bold;
    color: #000000;
  }
  
  .item-subtitulo {
    font-size: 10pt;
    color: #333333;
    font-style: italic;
  }
  
  .item-fecha {
    font-size: 9pt;
    color: #666666;
  }
  
  .item-descripcion {
    font-size: 10pt;
    color: #333333;
    margin-top: 4px;
  }
  
  /* ===== LISTAS ===== */
  ul {
    margin: 6px 0 6px 20px;
    padding: 0;
  }
  
  li {
    font-size: 10pt;
    color: #333333;
    margin-bottom: 3px;
    line-height: 1.4;
  }
  
  /* ===== HABILIDADES (Texto plano para ATS) ===== */
  .habilidades-texto {
    font-size: 10pt;
    color: #000000;
    line-height: 1.8;
  }
  
  .habilidad-item {
    display: inline;
  }
  
  .habilidad-item:after {
    content: " • ";
    color: #666666;
  }
  
  .habilidad-item:last-child:after {
    content: "";
  }
  
  /* ===== REFERENCIAS ===== */
  .referencias {
    margin-top: 8px;
    padding-left: 15px;
    border-left: 3px solid #cccccc;
    font-size: 9pt;
  }
  
  .referencia-titulo {
    font-weight: bold;
    font-size: 9pt;
    color: #000000;
    margin-bottom: 4px;
  }
  
  .referencia-item {
    margin-bottom: 4px;
    color: #333333;
  }
  
  /* ===== ETIQUETAS (Opcional - menos decorativo) ===== */
  .etiqueta {
    font-size: 9pt;
    color: #666666;
    text-transform: uppercase;
    font-weight: bold;
    margin-right: 6px;
  }
  
  strong {
    font-weight: bold;
    color: #000000;
  }
</style>
</head>
<body>

  {{-- Encabezado: Datos personales --}}
  <div class="header">
    {{-- Foto de perfil (si está incluida) --}}
    @if(isset($d['fotoPerfil']) && $d['fotoPerfil'] && $srcFoto)
      <img src="{{ $srcFoto }}" alt="Foto de perfil" class="foto-perfil">
    @endif
    
    {{-- Nombre completo --}}
    <div class="nombre">{{ $datosPersonales['nombreCompleto'] ?? '' }}</div>
    
    {{-- Información de contacto --}}
    <div class="contacto">
      @if(!empty($datosPersonales['correo']))
        <div class="contacto-linea">
          <strong>Email:</strong> {{ $datosPersonales['correo'] }}
        </div>
      @endif
      
      @if(!empty($datosPersonales['telefono']))
        <div class="contacto-linea">
          <strong>Teléfono:</strong> {{ $datosPersonales['telefono'] }}
        </div>
      @endif
      
      @if(!empty($datosPersonales['linkedin']))
        <div class="contacto-linea">
          <strong>LinkedIn:</strong> {{ $datosPersonales['linkedin'] }}
        </div>
      @endif
      
      @if(!empty($datosPersonales['github']))
        <div class="contacto-linea">
          <strong>GitHub:</strong> {{ $datosPersonales['github'] }}
        </div>
      @endif
    </div>
  </div>

  {{-- Resumen profesional --}}
  @if(!empty($d['resumenProfesional']))
  <div class="seccion">
    <div class="seccion-titulo">Perfil Profesional</div>
    <div class="resumen">{{ $d['resumenProfesional'] }}</div>
  </div>
  @endif

  {{-- Formación académica --}}
  @if(!empty($d['educaciones']))
  <div class="seccion">
    <div class="seccion-titulo">Formación Académica</div>
    @foreach($d['educaciones'] as $e)
      @php
        $tipo = trim($e['tipo'] ?? '');
        $institucion = trim($e['institucion'] ?? '');
        $titulo = trim($e['titulo'] ?? '');
        $fechaFin = trim($e['fecha_fin'] ?? '');
      @endphp
      
      @if($titulo)
        <div class="item">
          <div class="item-titulo">
            @if($tipo)
              <span class="etiqueta">[{{ $tipo }}]</span>
            @endif
            {{ $titulo }}
          </div>
          @if($institucion)
            <div class="item-subtitulo">{{ $institucion }}</div>
          @endif
          @if($fechaFin)
            <div class="item-fecha">Fecha de finalización: {{ $fechaFin }}</div>
          @endif
        </div>
      @endif
    @endforeach
  </div>
  @endif

  {{-- Certificaciones --}}
  @if(!empty($d['certificaciones']) && count($d['certificaciones']) > 0)
  <div class="seccion">
    <div class="seccion-titulo">Certificaciones y Cursos</div>
    
    @foreach($d['certificaciones'] as $cert)
      @php
        $nombreCert = trim($cert['nombre'] ?? '');
        $institucionCert = trim($cert['institucion'] ?? '');
        $fechaCert = trim($cert['fecha_obtencion'] ?? '');
        
        $fechaCertFormateada = '';
        if ($fechaCert) {
            try {
                $fechaCertFormateada = date('m/Y', strtotime($fechaCert));
            } catch (\Exception $e) {
                $fechaCertFormateada = $fechaCert;
            }
        }
      @endphp
      
      @if($nombreCert)
        <div class="item">
          <div class="item-titulo">{{ $nombreCert }}</div>
          @if($institucionCert)
            <div class="item-subtitulo">{{ $institucionCert }}</div>
          @endif
          @if($fechaCertFormateada)
            <div class="item-fecha">Fecha de obtención: {{ $fechaCertFormateada }}</div>
          @endif
        </div>
      @endif
    @endforeach
  </div>
  @endif

  {{-- Experiencia profesional --}}
  @if(!empty($d['experiencias']))
  <div class="seccion">
    <div class="seccion-titulo">Experiencia Profesional</div>
    @foreach($d['experiencias'] as $ex)
      @php
        $empresa = trim($ex['empresa'] ?? '');
        $puesto = trim($ex['puesto'] ?? '');
        $periodoInicio = trim($ex['periodo_inicio'] ?? '');
        $periodoFin = trim($ex['periodo_fin'] ?? '');
        $trabajandoActualmente = $ex['trabajando_actualmente'] ?? false;
        
        $periodo = '';
        if ($trabajandoActualmente && $periodoInicio) {
            $periodo = "{$periodoInicio} - Actual";
        } elseif ($periodoInicio && $periodoFin) {
            $periodo = "{$periodoInicio} - {$periodoFin}";
        } elseif ($periodoInicio) {
            $periodo = "Desde {$periodoInicio}";
        } elseif ($periodoFin) {
            $periodo = "Hasta {$periodoFin}";
        }
        
        // Funciones como array
        $funcionesArray = [];
        if (!empty($ex['funciones']) && is_array($ex['funciones'])) {
            foreach ($ex['funciones'] as $func) {
                $desc = trim($func['descripcion'] ?? '');
                if ($desc) {
                    $funcionesArray[] = $desc;
                }
            }
        }
        
        $referencias = $ex['referencias'] ?? [];
      @endphp
      
      @if($puesto)
        <div class="item">
          <div class="item-titulo">{{ $puesto }}</div>
          @if($empresa)
            <div class="item-subtitulo">{{ $empresa }}</div>
          @endif
          @if($periodo)
            <div class="item-fecha">{{ $periodo }}</div>
          @endif
          
          {{-- Funciones --}}
          @if(!empty($funcionesArray))
            <ul>
              @foreach($funcionesArray as $funcion)
                <li>{{ $funcion }}</li>
              @endforeach
            </ul>
          @endif
          
          {{-- Referencias --}}
          @if(!empty($referencias))
            <div class="referencias">
              <div class="referencia-titulo">Referencias:</div>
              @foreach($referencias as $ref)
                @php
                  $nombre = trim($ref['nombre'] ?? '');
                  $contacto = trim($ref['contacto'] ?? '');
                  $correo = trim($ref['correo'] ?? '');
                  $relacion = trim($ref['relacion'] ?? '');
                @endphp
                
                @if($nombre)
                  <div class="referencia-item">
                    <strong>{{ $nombre }}</strong>
                    @if($relacion) ({{ $relacion }}) @endif
                    @if($contacto) - Tel: {{ $contacto }} @endif
                    @if($correo) - Email: {{ $correo }} @endif
                  </div>
                @endif
              @endforeach
            </div>
          @endif
        </div>
      @endif
    @endforeach
  </div>
  @endif

  {{-- Habilidades técnicas --}}
  @php
    $habilidadesTecnicas = collect($d['habilidadesTecnicas'] ?? [])->map(function($h) {
        return trim($h['descripcion'] ?? '');
    })->filter()->values();
  @endphp
  
  @if($habilidadesTecnicas->isNotEmpty())
  <div class="seccion">
    <div class="seccion-titulo">Habilidades Técnicas</div>
    <div class="habilidades-texto">
      @foreach($habilidadesTecnicas as $hab)
        <span class="habilidad-item">{{ $hab }}</span>
      @endforeach
    </div>
  </div>
  @endif
  
  {{-- Competencias profesionales --}}
  @php
    $habilidadesBlandas = collect($d['habilidadesBlandas'] ?? [])->map(function($h) {
        return trim($h['descripcion'] ?? '');
    })->filter()->values();
  @endphp
  
  @if($habilidadesBlandas->isNotEmpty())
  <div class="seccion">
    <div class="seccion-titulo">Competencias Profesionales</div>
    <div class="habilidades-texto">
      @foreach($habilidadesBlandas as $hab)
        <span class="habilidad-item">{{ $hab }}</span>
      @endforeach
    </div>
  </div>
  @endif
  
  {{-- Idiomas --}}
  @if(!empty($idiomasNormalizados))
  <div class="seccion">
    <div class="seccion-titulo">Idiomas</div>
    <div class="habilidades-texto">
      @foreach($idiomasNormalizados as $idioma)
        @if($idioma)
          <span class="habilidad-item">{{ $idioma }}</span>
        @endif
      @endforeach
    </div>
  </div>
  @endif
</body>
</html>