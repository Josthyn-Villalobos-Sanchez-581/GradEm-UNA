@php
  $d = $datos ?? [];
  $datosPersonales = $d['datosPersonales'] ?? [];

  $fmtFecha = function (?string $fecha, string $fallback = ''): string {
      if (!$fecha) {
          return $fallback;
      }

      try {
          return \Carbon\Carbon::parse($fecha)->format('m/Y');
      } catch (\Throwable $e) {
          return trim($fecha) ?: $fallback;
      }
  };

  $idiomasNormalizados = $d['idiomas_normalizados'] ?? collect($d['idiomas'] ?? [])->map(function ($i) {
      $nombre = trim($i['nombre'] ?? '');
      $nivel = trim($i['nivel'] ?? '');
      if ($nombre === '' && $nivel === '') {
          return null;
      }

      return $nivel ? "{$nombre}: {$nivel}" : $nombre;
  })->filter()->values()->all();

  $habilidadesTecnicas = collect($d['habilidadesTecnicas'] ?? [])->map(function ($h) {
      return trim($h['descripcion'] ?? '');
  })->filter()->values()->all();

  $habilidadesBlandas = collect($d['habilidadesBlandas'] ?? [])->map(function ($h) {
      return trim($h['descripcion'] ?? '');
  })->filter()->values()->all();

  $srcFoto = null;
  if (!empty($d['fotoPerfil'])) {
      $rutaCompleta = $d['fotoPerfil']['ruta_completa'] ?? null;
      $rutaPublica = $d['fotoPerfil']['ruta_imagen'] ?? null;

      if ($rutaCompleta && file_exists($rutaCompleta)) {
          $mime = function_exists('mime_content_type') ? (mime_content_type($rutaCompleta) ?: 'image/jpeg') : 'image/jpeg';
          $srcFoto = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($rutaCompleta));
      } elseif ($rutaPublica) {
          $srcFoto = filter_var($rutaPublica, FILTER_VALIDATE_URL) ? $rutaPublica : url($rutaPublica);
      }
  }

  $educaciones = $d['educaciones'] ?? [];
  $certificaciones = $d['certificaciones'] ?? [];
  $experiencias = $d['experiencias'] ?? [];
  $resumen = trim($d['resumenProfesional'] ?? '');
@endphp

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Currículum</title>
  <style>
    @page {
      margin: 18mm 18mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: "DejaVu Sans", Arial, sans-serif;
      color: #1f2937;
      font-size: 10pt;
      line-height: 1.45;
      background: #ffffff;
    }

    .cv {
      width: 100%;
      max-width: none;
      margin: 0;
      background: transparent;
      border: 0;
      border-radius: 0;
      padding: 0;
    }

    .header {
      text-align: center;
      border-bottom: 1.8px solid #111827;
      padding-bottom: 8px;
      margin-bottom: 11px;
    }

    .nombre {
      font-size: 19pt;
      font-weight: 700;
      letter-spacing: 0.4px;
      color: #0f172a;
      text-transform: uppercase;
      margin-bottom: 7px;
    }

    .contacto {
      font-size: 9.4pt;
      color: #374151;
    }

    .contacto .linea {
      margin-bottom: 2px;
    }

    .contacto a {
      color: #1d4ed8;
      text-decoration: underline;
    }

    .foto-perfil {
      width: 78px;
      height: 78px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #111827;
      margin: 0 auto 8px;
      display: block;
    }

    .seccion {
      margin-bottom: 11px;
      page-break-inside: avoid;
    }

    .seccion-titulo {
      font-size: 10.2pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.55px;
      color: #111827;
      border-bottom: 1.6px solid #111827;
      padding-bottom: 2px;
      margin-bottom: 5px;
    }

    .texto {
      font-size: 9.3pt;
      color: #374151;
      text-align: justify;
      line-height: 1.55;
    }

    .entry {
      margin-bottom: 8px;
      font-size: 9.1pt;
    }

    .entry-titulo {
      font-size: 9.5pt;
      font-weight: 700;
      color: #111827;
    }

    .entry-subtitulo {
      font-size: 9pt;
      color: #4b5563;
      margin-top: 1px;
      font-style: italic;
    }

    .entry-fecha {
      font-size: 8.7pt;
      color: #6b7280;
      margin-top: 1px;
    }

    ul.lista {
      margin: 4px 0 0 15px;
      padding: 0;
    }

    ul.lista li {
      margin-bottom: 2px;
      font-size: 9pt;
      line-height: 1.45;
    }

    .linea-tags {
      font-size: 9.1pt;
      line-height: 1.45;
    }

    .refs {
      margin-top: 4px;
      padding-left: 8px;
      border-left: 2px solid #d1d5db;
      font-size: 8.6pt;
      color: #4b5563;
    }

    .refs strong {
      color: #1f2937;
    }
  </style>
</head>
<body>
  <div class="cv">
    <div class="header">
      @if($srcFoto)
        <img src="{{ $srcFoto }}" alt="Foto de perfil" class="foto-perfil">
      @endif

      <div class="nombre">{{ $datosPersonales['nombreCompleto'] ?? '' }}</div>

      <div class="contacto">
        @if(!empty($datosPersonales['correo']))
          <div class="linea"><strong>Email:</strong> {{ $datosPersonales['correo'] }}</div>
        @endif
        @if(!empty($datosPersonales['telefono']))
          <div class="linea"><strong>Teléfono:</strong> {{ $datosPersonales['telefono'] }}</div>
        @endif
        @if(!empty($datosPersonales['linkedin']))
          <div class="linea"><strong>LinkedIn:</strong> <a href="{{ $datosPersonales['linkedin'] }}" target="_blank">LinkedIn</a></div>
        @endif
        @if(!empty($datosPersonales['github']))
          <div class="linea"><strong>GitHub:</strong> <a href="{{ $datosPersonales['github'] }}" target="_blank">GitHub</a></div>
        @endif
      </div>
    </div>

    @if($resumen !== '')
      <div class="seccion">
        <div class="seccion-titulo">Perfil Profesional</div>
        <div class="texto">{{ $resumen }}</div>
      </div>
    @endif

    @if(!empty($educaciones))
      <div class="seccion">
        <div class="seccion-titulo">Formación Académica</div>
        @foreach($educaciones as $e)
          @php
            $tipo = trim($e['tipo'] ?? '');
            $institucion = trim($e['institucion'] ?? '');
            $titulo = trim($e['titulo'] ?? '');
            $fechaFin = $fmtFecha($e['fecha_fin'] ?? null);
          @endphp
          @if($titulo || $institucion)
            <div class="entry">
              <div class="entry-titulo">
                @if($tipo)
                  [{{ $tipo }}]
                @endif
                {{ $titulo }}
              </div>
              @if($institucion)
                <div class="entry-subtitulo">{{ $institucion }}</div>
              @endif
              @if($fechaFin)
                <div class="entry-fecha">Fecha de finalización: {{ $fechaFin }}</div>
              @endif
            </div>
          @endif
        @endforeach
      </div>
    @endif

    @if(!empty($certificaciones) && count($certificaciones) > 0)
      <div class="seccion">
        <div class="seccion-titulo">Certificaciones y Cursos</div>
        @foreach($certificaciones as $cert)
          @php
            $nombreCert = trim($cert['nombre'] ?? '');
            $institucionCert = trim($cert['institucion'] ?? '');
            $fechaCert = $fmtFecha($cert['fecha_obtencion'] ?? null);
          @endphp
          @if($nombreCert)
            <div class="entry">
              <div class="entry-titulo">{{ $nombreCert }}</div>
              @if($institucionCert)
                <div class="entry-subtitulo">{{ $institucionCert }}</div>
              @endif
              @if($fechaCert)
                <div class="entry-fecha">Fecha de obtención: {{ $fechaCert }}</div>
              @endif
            </div>
          @endif
        @endforeach
      </div>
    @endif

    @if(!empty($experiencias))
      <div class="seccion">
        <div class="seccion-titulo">Experiencia Profesional</div>
        @foreach($experiencias as $ex)
          @php
            $empresa = trim($ex['empresa'] ?? '');
            $puesto = trim($ex['puesto'] ?? '');
            $periodoInicio = $fmtFecha($ex['periodo_inicio'] ?? null);
            $periodoFin = $fmtFecha($ex['periodo_fin'] ?? null);
            $trabajandoActualmente = (bool)($ex['trabajando_actualmente'] ?? false);

            $periodo = '';
            if ($periodoInicio && $trabajandoActualmente) {
                $periodo = $periodoInicio . ' - Actual';
            } elseif ($periodoInicio && $periodoFin) {
                $periodo = $periodoInicio . ' - ' . $periodoFin;
            } elseif ($periodoInicio) {
                $periodo = 'Desde ' . $periodoInicio;
            } elseif ($periodoFin) {
                $periodo = 'Hasta ' . $periodoFin;
            }

            $funcionesArray = [];
            if (!empty($ex['funciones'])) {
                if (is_array($ex['funciones'])) {
                    foreach ($ex['funciones'] as $func) {
                        $desc = trim($func['descripcion'] ?? '');
                        if ($desc !== '') {
                            $funcionesArray[] = $desc;
                        }
                    }
                } elseif (is_string($ex['funciones'])) {
                    $funcionesArray = collect(explode(';', $ex['funciones']))
                        ->map(fn($f) => trim($f))
                        ->filter()
                        ->values()
                        ->all();
                }
            }

            $referencias = $ex['referencias'] ?? [];
          @endphp

          @if($puesto || $empresa)
            <div class="entry">
              <div class="entry-titulo">{{ $puesto ?: 'Experiencia laboral' }}</div>
              @if($empresa)
                <div class="entry-subtitulo">{{ $empresa }}</div>
              @endif
              @if($periodo)
                <div class="entry-fecha">{{ $periodo }}</div>
              @endif

              @if(!empty($funcionesArray))
                <ul class="lista">
                  @foreach($funcionesArray as $funcion)
                    <li>{{ $funcion }}</li>
                  @endforeach
                </ul>
              @endif

              @if(!empty($referencias))
                <div class="refs">
                  <strong>Referencias:</strong>
                  @foreach($referencias as $ref)
                    @php
                      $nombreRef = trim($ref['nombre'] ?? '');
                      $contactoRef = trim($ref['contacto'] ?? '');
                      $correoRef = trim($ref['correo'] ?? '');
                      $relacionRef = trim($ref['relacion'] ?? '');
                    @endphp
                    @if($nombreRef)
                      <div>
                        {{ $nombreRef }}
                        @if($relacionRef) · {{ $relacionRef }} @endif
                        @if($contactoRef) · Tel: {{ $contactoRef }} @endif
                        @if($correoRef) · {{ $correoRef }} @endif
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

    @if(!empty($habilidadesTecnicas))
      <div class="seccion">
        <div class="seccion-titulo">Habilidades Técnicas</div>
        <div class="linea-tags">{{ implode(' · ', $habilidadesTecnicas) }}</div>
      </div>
    @endif

    @if(!empty($habilidadesBlandas))
      <div class="seccion">
        <div class="seccion-titulo">Competencias Profesionales</div>
        <div class="linea-tags">{{ implode(' · ', $habilidadesBlandas) }}</div>
      </div>
    @endif

    @if(!empty($idiomasNormalizados))
      <div class="seccion">
        <div class="seccion-titulo">Idiomas</div>
        <div class="linea-tags">{{ implode(' · ', $idiomasNormalizados) }}</div>
      </div>
    @endif
  </div>
</body>
</html>