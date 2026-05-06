<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        if (!Schema::hasTable('areas_laborales')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `areas_laborales` (
  `id_area_laboral` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_area_laboral`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('catalogo_estados')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `catalogo_estados` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `nombre_estado` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `nombre_estado` (`nombre_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('fotos_perfil')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `fotos_perfil` (
  `id_foto` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `ruta_imagen` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_subida` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_foto`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('idiomas_catalogo')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `idiomas_catalogo` (
  `id_idioma_catalogo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_idioma_catalogo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('login_attempts')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `login_attempts` (
  `correo` varchar(255) NOT NULL,
  `intentos` int DEFAULT '0',
  `fecha_ultimo_intento` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
SQL);
        }

        if (!Schema::hasTable('modalidades')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `modalidades` (
  `id_modalidad` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_modalidad`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('paises')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `paises` (
  `id_pais` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_pais`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('permisos')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `permisos` (
  `id_permiso` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_permiso`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('plataformas_externas')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `plataformas_externas` (
  `id_plataforma` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_plataforma`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('postulaciones')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `postulaciones` (
  `id_postulacion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `id_oferta` int DEFAULT NULL,
  `mensaje` text COLLATE utf8mb4_general_ci,
  `fecha_postulacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado_id` int DEFAULT '1',
  PRIMARY KEY (`id_postulacion`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_oferta` (`id_oferta`),
  KEY `fk_postulaciones_estado` (`estado_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('provincias')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `provincias` (
  `id_provincia` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `id_pais` int NOT NULL,
  PRIMARY KEY (`id_provincia`),
  KEY `id_pais` (`id_pais`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('riesgos')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `riesgos` (
  `id_riesgo` int NOT NULL AUTO_INCREMENT,
  `tipo_riesgo` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `probabilidad` int NOT NULL,
  `impacto` int NOT NULL,
  `magnitud` int GENERATED ALWAYS AS ((`probabilidad` * `impacto`)) STORED,
  `responsable` varchar(100) NOT NULL,
  `estrategia` varchar(100) DEFAULT NULL,
  `accion_mitigacion` text,
  `plan_contingencia` text,
  `estado_id` int DEFAULT '1',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_riesgo`),
  CONSTRAINT `chk_impacto` CHECK ((`impacto` between 1 and 4)),
  CONSTRAINT `chk_probabilidad` CHECK ((`probabilidad` between 1 and 4))
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
SQL);
        }

        if (!Schema::hasTable('roles')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('roles_permisos')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `roles_permisos` (
  `id_rol` int NOT NULL,
  `id_permiso` int NOT NULL,
  PRIMARY KEY (`id_rol`,`id_permiso`),
  KEY `id_permiso` (`id_permiso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('universidades')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `universidades` (
  `id_universidad` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `sigla` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_universidad`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('usuarios')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `identificacion` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado_empleo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado_estudios` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_rol` int DEFAULT NULL,
  `id_universidad` int DEFAULT NULL,
  `id_carrera` int DEFAULT NULL,
  `estado_id` int DEFAULT '1',
  `anio_graduacion` year DEFAULT NULL,
  `nivel_academico` enum('Diplomado','Bachillerato','Licenciatura','Maestría','Doctorado') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tiempo_conseguir_empleo` int DEFAULT NULL,
  `area_laboral_id` int DEFAULT NULL,
  `id_canton` int DEFAULT NULL,
  `salario_promedio` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo_empleo` enum('Tiempo completo','Medio tiempo','Temporal','Independiente','Práctica') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sesion_activa` tinyint(1) DEFAULT '0',
  `ultima_actividad` datetime DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `identificacion` (`identificacion`),
  KEY `id_rol` (`id_rol`),
  KEY `id_universidad` (`id_universidad`),
  KEY `id_carrera` (`id_carrera`),
  KEY `fk_usuarios_estado` (`estado_id`),
  KEY `fk_usuarios_area_laboral` (`area_laboral_id`),
  KEY `fk_usuarios_canton` (`id_canton`),
  KEY `idx_user_genero` (`genero`),
  KEY `idx_user_anio` (`anio_graduacion`),
  KEY `idx_user_nivel` (`nivel_academico`),
  KEY `idx_user_estado_empleo` (`estado_empleo`),
  KEY `idx_user_tiempo_empleo` (`tiempo_conseguir_empleo`),
  KEY `idx_user_salario` (`salario_promedio`),
  KEY `idx_user_tipo_empleo` (`tipo_empleo`),
  KEY `idx_user_uni_car_anio` (`id_universidad`,`id_carrera`,`anio_graduacion`),
  KEY `idx_user_estado_anio` (`estado_empleo`,`anio_graduacion`),
  KEY `idx_user_ubicacion` (`id_canton`,`id_universidad`,`id_carrera`),
  KEY `idx_user_area_tipo` (`area_laboral_id`,`tipo_empleo`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('inscripciones_curso')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `inscripciones_curso` (
  `id_inscripcion` int NOT NULL AUTO_INCREMENT,
  `id_curso` int DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  `fecha_inscripcion` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado_id` int DEFAULT '1',
  PRIMARY KEY (`id_inscripcion`),
  UNIQUE KEY `uq_inscripcion_curso_usuario` (`id_curso`,`id_usuario`),
  KEY `id_curso` (`id_curso`),
  KEY `id_usuario` (`id_usuario`),
  KEY `fk_inscripciones_cursos_estado` (`estado_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('cursos')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `cursos` (
  `id_curso` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `id_modalidad` int DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `fecha_limite_inscripcion` date DEFAULT NULL,
  `duracion` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nombreInstructor` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cupos` int unsigned DEFAULT NULL,
  `estado_id` int DEFAULT '1',
  PRIMARY KEY (`id_curso`),
  KEY `id_modalidad` (`id_modalidad`),
  KEY `fk_cursos_estado` (`estado_id`),
  CONSTRAINT `cursos_ibfk_1` FOREIGN KEY (`id_modalidad`) REFERENCES `modalidades` (`id_modalidad`),
  CONSTRAINT `fk_cursos_estado` FOREIGN KEY (`estado_id`) REFERENCES `catalogo_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('cantones')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `cantones` (
  `id_canton` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `id_provincia` int NOT NULL,
  PRIMARY KEY (`id_canton`),
  KEY `id_provincia` (`id_provincia`),
  CONSTRAINT `cantones_ibfk_1` FOREIGN KEY (`id_provincia`) REFERENCES `provincias` (`id_provincia`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('carreras')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `carreras` (
  `id_carrera` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `id_universidad` int DEFAULT NULL,
  `area_conocimiento` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_carrera`),
  KEY `id_universidad` (`id_universidad`),
  CONSTRAINT `carreras_ibfk_1` FOREIGN KEY (`id_universidad`) REFERENCES `universidades` (`id_universidad`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('bitacora_cambios')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `bitacora_cambios` (
  `id_cambio` int NOT NULL AUTO_INCREMENT,
  `tabla_afectada` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `operacion` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `usuario_responsable` int DEFAULT NULL,
  `fecha_cambio` datetime DEFAULT CURRENT_TIMESTAMP,
  `descripcion_cambio` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id_cambio`),
  KEY `usuario_responsable` (`usuario_responsable`),
  CONSTRAINT `bitacora_cambios_ibfk_1` FOREIGN KEY (`usuario_responsable`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('credenciales')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `credenciales` (
  `id_credencial` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `hash_contrasena` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `session_token` varchar(128) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_ultimo_login` datetime DEFAULT NULL,
  `intentos_fallidos` int DEFAULT '0',
  `fecha_ultimo_cambio` date DEFAULT NULL,
  `fecha_baneo` datetime DEFAULT NULL,
  PRIMARY KEY (`id_credencial`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  KEY `idx_credenciales_session_token` (`session_token`),
  CONSTRAINT `credenciales_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('curriculum')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `curriculum` (
  `id_curriculum` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `generado_sistema` tinyint(1) DEFAULT '1',
  `ruta_archivo_pdf` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nombre_original` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_curriculum`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  UNIQUE KEY `uq_curriculum_usuario` (`id_usuario`),
  CONSTRAINT `curriculum_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('documentos_adjuntos')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `documentos_adjuntos` (
  `id_documento` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ruta_archivo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nombre_original` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_subida` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_documento`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `documentos_adjuntos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('eventos')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `eventos` (
  `id_evento` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `fecha_evento` date DEFAULT NULL,
  `fecha_limite_inscripcion` date DEFAULT NULL,
  `hora_evento` time DEFAULT NULL,
  `id_ubicacion` int DEFAULT NULL,
  `id_modalidad` int DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado_id` int DEFAULT '1',
  `usuario_id` int DEFAULT NULL,
  `otras_observaciones` text COLLATE utf8mb4_general_ci,
  `cupos` int DEFAULT NULL,
  PRIMARY KEY (`id_evento`),
  KEY `id_ubicacion` (`id_ubicacion`),
  KEY `id_modalidad` (`id_modalidad`),
  KEY `fk_eventos_estado` (`estado_id`),
  KEY `idx_eventos_usuario_id` (`usuario_id`),
  CONSTRAINT `fk_eventos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('ofertas')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `ofertas` (
  `id_oferta` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int DEFAULT NULL,
  `titulo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `requisitos` text COLLATE utf8mb4_general_ci,
  `tipo_oferta` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `categoria` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_area_laboral` int DEFAULT NULL,
  `id_pais` int DEFAULT NULL,
  `id_provincia` int DEFAULT NULL,
  `id_canton` int DEFAULT NULL,
  `id_modalidad` int DEFAULT NULL,
  `horario` text COLLATE utf8mb4_general_ci,
  `fecha_limite` datetime NOT NULL,
  `fecha_publicacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado_id` int DEFAULT '1',
  `id_carrera` int DEFAULT NULL,
  PRIMARY KEY (`id_oferta`),
  KEY `id_empresa` (`id_empresa`),
  KEY `id_modalidad` (`id_modalidad`),
  KEY `fk_ofertas_estado` (`estado_id`),
  KEY `fk_oferta_pais` (`id_pais`),
  KEY `fk_oferta_provincia` (`id_provincia`),
  KEY `fk_oferta_canton` (`id_canton`),
  KEY `fk_ofertas_area_laboral` (`id_area_laboral`),
  KEY `idx_ofertas_fecha` (`fecha_publicacion`),
  KEY `idx_ofertas_tipo` (`tipo_oferta`),
  KEY `idx_ofertas_empresa` (`id_empresa`),
  KEY `idx_ofertas_estado` (`estado_id`),
  KEY `fk_oferta_carrera` (`id_carrera`),
  CONSTRAINT `fk_oferta_canton` FOREIGN KEY (`id_canton`) REFERENCES `cantones` (`id_canton`),
  CONSTRAINT `fk_oferta_carrera` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`),
  CONSTRAINT `fk_oferta_pais` FOREIGN KEY (`id_pais`) REFERENCES `paises` (`id_pais`),
  CONSTRAINT `fk_oferta_provincia` FOREIGN KEY (`id_provincia`) REFERENCES `provincias` (`id_provincia`),
  CONSTRAINT `fk_ofertas_area_laboral` FOREIGN KEY (`id_area_laboral`) REFERENCES `areas_laborales` (`id_area_laboral`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
        }

        if (!Schema::hasTable('evento_carrera')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `evento_carrera` (
  `id_evento_carrera` int NOT NULL AUTO_INCREMENT,
  `id_evento` int NOT NULL,
  `id_carrera` int NOT NULL,
  PRIMARY KEY (`id_evento_carrera`),
  KEY `idx_evento_carrera_evento` (`id_evento`),
  KEY `idx_evento_carrera_carrera` (`id_carrera`),
  CONSTRAINT `evento_carrera_ibfk_1` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`) ON DELETE CASCADE,
  CONSTRAINT `evento_carrera_ibfk_2` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
SQL);
        }

        if (!Schema::hasTable('evento_rol')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `evento_rol` (
  `id_evento_rol` int NOT NULL AUTO_INCREMENT,
  `id_evento` int NOT NULL,
  `id_rol` int NOT NULL,
  PRIMARY KEY (`id_evento_rol`),
  KEY `idx_evento_rol_evento` (`id_evento`),
  KEY `idx_evento_rol_rol` (`id_rol`),
  CONSTRAINT `evento_rol_ibfk_1` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`) ON DELETE CASCADE,
  CONSTRAINT `evento_rol_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
SQL);
        }

        if (!Schema::hasTable('inscripciones_evento')) {
            DB::unprepared(<<<'SQL'
CREATE TABLE `inscripciones_evento` (
  `id_inscripcion` int NOT NULL AUTO_INCREMENT,
  `id_evento` int NOT NULL,
  `id_usuario` int NOT NULL,
  `fecha_inscripcion` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado_id` int DEFAULT '1',
  PRIMARY KEY (`id_inscripcion`),
  UNIQUE KEY `unique_evento_usuario` (`id_evento`,`id_usuario`),
  KEY `fk_inscripcion_evento_usuario` (`id_usuario`),
  KEY `fk_inscripcion_evento_estado` (`estado_id`),
  CONSTRAINT `fk_inscripcion_evento_estado` FOREIGN KEY (`estado_id`) REFERENCES `catalogo_estados` (`id_estado`),
  CONSTRAINT `fk_inscripcion_evento_evento` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`),
  CONSTRAINT `fk_inscripcion_evento_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
SQL);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        // No-op intencional: evita borrado destructivo de tablas legacy.
    }
};
