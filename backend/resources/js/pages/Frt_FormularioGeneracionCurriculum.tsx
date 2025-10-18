import React, { useMemo, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import PpLayout from '../layouts/PpLayout';
import { validarPaso, ErrorMapa } from '../components/Frt_ValidacionClienteGeneracionCurriculum';
import { postGenerarCurriculum } from '../services/curriculumService';
import Frt_VistaPreviaCurriculum from '../pages/Frt_VistaPreviaCurriculum';
import { useModal } from '../hooks/useModal';
import FotoXDefecto from '../assets/FotoXDefecto.png';
import { Button } from "@/components/ui/button";

//  IMPORTAR TIPOS COMPARTIDOS
import type { FormCV, Educacion, Experiencia, Funcion, Habilidad, Idioma, Referencia, Certificacion } from '../types/curriculum';

// ================== Constantes ==================
const FECHA_MINIMA_CURRICULUM = '1960-01-01';
const MAX_FUNCIONES_POR_EXPERIENCIA = 10;
const MAX_ELEMENTOS_CV = 5;

// ================== Definición de Tipos ==================
type UsuarioActual = {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  telefono?: string;
  fotoPerfil?: { ruta_imagen: string } | null;
};

interface PageProps {
  auth: { 
    user?: {
      id_usuario: number;
      nombre_completo: string;
      correo: string;
      telefono: string;
      fotoPerfil?: { ruta_imagen: string } | null;
    } 
  };
  userPermisos?: number[];
  usuario?: UsuarioActual;
  [key: string]: unknown;
}

// ================== Utilidades locales ==================
function descargarArchivo(url: string, nombre: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function getAbsoluteUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = window.location.origin;
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

function abrirEnPestanaNueva(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ================== Definición de Reglas de Validación ==================
type Regla = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: unknown, ctx?: unknown) => boolean | string;
};

function validarCampoSegunReglas(
  valor: unknown,
  reglas: Regla,
  etiqueta: string,
  ctx?: unknown
): string | null {
  const v = (typeof valor === 'string') ? valor.trim() : valor;

  if (reglas.required && (v === undefined || v === null || v === '')) {
    return `Campo requerido: ${etiqueta}`;
  }
  if (v !== undefined && v !== null && v !== '') {
    if (reglas.minLength !== undefined && typeof v === 'string' && v.length < reglas.minLength) {
      return `Debe tener al menos ${reglas.minLength} caracteres.`;
    }
    if (reglas.maxLength !== undefined && typeof v === 'string' && v.length > reglas.maxLength) {
      return `Debe tener como máximo ${reglas.maxLength} caracteres.`;
    }
    if (reglas.pattern && typeof v === 'string' && !reglas.pattern.test(v)) {
      return `Formato inválido en ${etiqueta}.`;
    }
    if (reglas.validate) {
      const res = reglas.validate(v, ctx);
      if (res === false) return `Valor inválido en ${etiqueta}.`;
      if (typeof res === 'string') return res;
    }
  }
  return null;
}

// ================== Validaciones ==================
const validacionesDatosPersonales = {
  nombreCompleto: { 
    required: true, 
    minLength: 3,   
    maxLength: 80,    
    pattern: /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s'-]+$/ 
  },
  correo: { 
    required: true, 
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/, 
    maxLength: 255 
  },
  telefono: { 
    required: false, 
    pattern: /^[0-9]{8}$/ 
  }
};

const validacionesEducacion = {
  institucion: { 
    required: true, 
    minLength: 3, 
    maxLength: 100,  
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()'-]+$/ 
  },
  titulo: { 
    required: true, 
    minLength: 3, 
    maxLength: 100, 
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()'-]+$/ 
  },
  fecha_inicio: { 
    required: true, 
    validate: (value: unknown) => {
      if (!value || typeof value !== 'string') return true;
      const fecha = new Date(value);
      const hoy = new Date();
      if (fecha > hoy) return 'La fecha no puede ser futura';
      if (fecha < new Date(FECHA_MINIMA_CURRICULUM)) return `La fecha no puede ser anterior a ${FECHA_MINIMA_CURRICULUM}`;
      return true;
    }
  },
  fecha_fin: { 
    required: true, 
    validate: (value: unknown, ctx: unknown) => {
      if (!value || typeof value !== 'string') return true;
      const fechaFin = new Date(value);
      const hoy = new Date();
      
      if (fechaFin > hoy) return 'La fecha no puede ser futura';
      
      const contextObj = ctx as { fecha_inicio?: string };
      if (contextObj?.fecha_inicio) {
        const fechaInicio = new Date(contextObj.fecha_inicio);
        if (fechaFin < fechaInicio) return 'La fecha de fin no puede ser anterior a la fecha de inicio';
      }
      return true;
    }
  }
};

const validacionesExperiencia = {
  empresa: { 
    required: true, 
    minLength: 2,    
    maxLength: 60,    
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()&'-]+$/ 
  },
  puesto: { 
    required: true, 
    minLength: 3, 
    maxLength: 60,   
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()&/'-]+$/ 
  },
  periodo_inicio: { 
    required: true, 
    validate: (value: unknown) => {
      if (!value || typeof value !== 'string') return true;
      const fecha = new Date(value);
      const hoy = new Date();
      if (fecha > hoy) return 'La fecha no puede ser futura';
      if (fecha < new Date(FECHA_MINIMA_CURRICULUM)) return `La fecha no puede ser anterior a ${FECHA_MINIMA_CURRICULUM}`;
      return true;
    }
  },
  periodo_fin: { 
    required: true, 
    validate: (value: unknown, ctx: unknown) => {
      if (!value || typeof value !== 'string') return true;
      const fechaFin = new Date(value);
      const hoy = new Date();
      
      if (fechaFin > hoy) return 'La fecha no puede ser futura';
      
      const contextObj = ctx as { periodo_inicio?: string };
      if (contextObj?.periodo_inicio) {
        const fechaInicio = new Date(contextObj.periodo_inicio);
        if (fechaFin < fechaInicio) return 'La fecha de fin no puede ser anterior a la fecha de inicio';
      }
      return true;
    }
  }
};

// NUEVO: Validación para funciones individuales
const validacionesFuncion = {
  descripcion: { 
    required: false, 
    minLength: 10,  
    maxLength: 150,  
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()&/'\-–—%:;°]+$/ 
  }
};

const validacionesHabilidad = {
  descripcion: { 
    required: false, 
    minLength: 2,    
    maxLength: 40,   
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()&/+#'-]+$/ 
  }
};

const validacionesIdioma = {
  nombre: { 
    required: false, 
    minLength: 2, 
    maxLength: 15, 
    pattern: /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+$/ 
  },
  nivel: { 
    required: false, 
    validate: (value: unknown) => {
      if (!value || typeof value !== 'string') return true;
      return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo'].includes(value) || 'Nivel inválido';
    }
  }
};

const validacionesReferencia = {
  nombre: { 
    required: false, 
    minLength: 3, 
    maxLength: 80, 
    pattern: /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s'-]+$/ 
  },
  contacto: { 
    required: false, 
    pattern: /^[0-9]{8}$/ 
  },
  relacion: { 
    required: false, 
    maxLength: 50, 
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()'-]+$/ 
  }
};

const validacionesCertificacion = {
  nombre: { 
    required: false, 
    minLength: 3, 
    maxLength: 100, 
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()&/'-]+$/ 
  },
  institucion: { 
    required: false, 
    minLength: 2, 
    maxLength: 80, 
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()&'-]+$/ 
  },
  fecha_obtencion: { 
    required: false, 
    validate: (value: unknown) => {
      if (!value || typeof value !== 'string') return true;
      const fecha = new Date(value);
      const hoy = new Date();
      if (fecha > hoy) return 'La fecha no puede ser futura';
      if (fecha < new Date(FECHA_MINIMA_CURRICULUM)) return `La fecha no puede ser anterior a ${FECHA_MINIMA_CURRICULUM}`;
      return true;
    }
  }
};

// ===========================================================

export default function Frt_FormularioGeneracionCurriculum() {
  const page = usePage<PageProps>();
  const userPermisos = page.props.userPermisos ?? [];

  const modal = useModal();

  const usuario: UsuarioActual | null = page.props.usuario || (page.props.auth?.user
    ? {
        id_usuario: page.props.auth.user.id_usuario,
        nombre_completo: page.props.auth.user.nombre_completo,
        correo: page.props.auth.user.correo,
        telefono: page.props.auth.user.telefono,
        fotoPerfil: page.props.auth.user.fotoPerfil || null,
      }
    : null);

  const prefill: FormCV = useMemo(() => ({
    usuarioId: usuario?.id_usuario ?? 0,
    datosPersonales: {
      nombreCompleto: usuario?.nombre_completo ?? '',
      correo: usuario?.correo ?? '',
      telefono: usuario?.telefono ?? ''
    },
    resumenProfesional: '',
    educaciones: [],
    experiencias: [],
    habilidades: [],
    idiomas: [],
    referencias: [],
    certificaciones: [],
    incluirFotoPerfil: false,
  }), [usuario]);

  const [form, setForm] = useState<FormCV>(prefill);
  const [paso, setPaso] = useState<number>(1);
  const [errores, setErrores] = useState<ErrorMapa>({});
  const [cargando, setCargando] = useState<boolean>(false);
  const [mostrarBtnDashboard, setMostrarBtnDashboard] = useState<boolean>(false);

  const paso4Completo = useMemo(() => {
    // Validar habilidades: si hay alguna agregada, todas deben estar completas
    const habilidadesOk = form.habilidades.length === 0 || form.habilidades.every(h => {
      const desc = (h.descripcion ?? '').trim();
      return desc && desc.length >= 2 && desc.length <= 40;
    });

    // Validar idiomas: si hay alguno agregado, todos deben estar completos
    const idiomasOk = form.idiomas.length === 0 || form.idiomas.every(i => {
      const nombre = (i.nombre ?? '').trim();
      const nivel = (i.nivel ?? '').trim();
      return nombre && nombre.length >= 2 && nombre.length <= 15 && nivel;
    });

    // Validar referencias: si hay alguna agregada, todas deben estar completas
    const referenciasOk = form.referencias.length === 0 || form.referencias.every(r => {
      const nombre = (r.nombre ?? '').trim();
      const contacto = solo8Digitos(r.contacto ?? '');
      const relacion = (r.relacion ?? '').trim();
      return (
        nombre && nombre.length >= 3 && nombre.length <= 80 &&
        contacto.length === 8 &&
        relacion && relacion.length <= 50
      );
    });

    // Validar certificaciones: si hay alguna agregada, todas deben estar completas
    const certificacionesOk = form.certificaciones.length === 0 || form.certificaciones.every(c => {
      const nombre = (c.nombre ?? '').trim();
      const institucion = (c.institucion ?? '').trim();
      const fecha = (c.fecha_obtencion ?? '').trim();
      
      if (nombre || institucion || fecha) {
        return nombre && nombre.length >= 3 && nombre.length <= 100;
      }
      return true;
    });

    // El botón se habilita solo si TODAS las validaciones pasan
    return habilidadesOk && idiomasOk && referenciasOk && certificacionesOk;
  }, [
    form.habilidades, 
    form.idiomas, 
    form.referencias,
    form.certificaciones,
    // NUEVO: Agregar los valores individuales para re-calcular en tiempo real
    ...form.habilidades.map(h => h.descripcion),
    ...form.idiomas.map(i => `${i.nombre}|${i.nivel}`),
    ...form.referencias.map(r => `${r.nombre}|${r.contacto}|${r.relacion}`),
    ...form.certificaciones.map(c => `${c.nombre}|${c.institucion}|${c.fecha_obtencion}`)
  ]);

  const botonGenerarDeshabilitado = cargando || !paso4Completo;

  // ================== Helpers ==================
  function setCampo(path: string, value: unknown) {
    setForm(prevForm => {
      const newForm = { ...prevForm };
      let current: Record<string, unknown> = newForm;
      const parts = path.split('.');
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]] as Record<string, unknown>;
      }
      current[parts[parts.length - 1]] = value;

      if (path.startsWith('educaciones.') && (path.endsWith('fecha_inicio') || path.endsWith('fecha_fin'))) {
        const [, indexStr] = path.split('.');
        const index = parseInt(indexStr);
        const nuevosErrores = validarFechasEducacion(newForm.educaciones[index], index);
        setErrores(prev => ({ ...prev, ...nuevosErrores }));
      }

      if (path.startsWith('experiencias.') && (path.endsWith('periodo_inicio') || path.endsWith('periodo_fin'))) {
        const [, indexStr] = path.split('.');
        const index = parseInt(indexStr);
        const nuevosErrores = validarFechasExperiencia(newForm.experiencias[index], index);
        setErrores(prev => ({ ...prev, ...nuevosErrores }));
      }

      return newForm;
    });
  }

  function solo8Digitos(valor: string) {
    return valor.replace(/\D/g, '').slice(0, 8);
  }

  function validarTelefonosLocales(formActual: FormCV, pasoActual: number): ErrorMapa {
    const errs: ErrorMapa = {};
    const regexTelefono = /^[0-9]{8}$/;

    if (pasoActual === 1) {
      const tel = formActual.datosPersonales.telefono?.trim();
      if (tel && !regexTelefono.test(tel)) {
        errs['datosPersonales.telefono'] = 'El teléfono debe tener exactamente 8 dígitos (Costa Rica).';
      }
    }

    if (pasoActual === 4) {
      formActual.referencias.forEach((r, idx) => {
        const c = r.contacto?.trim();
        if (c && !regexTelefono.test(c)) {
          errs[`referencias.${idx}.contacto`] = 'Debe contener exactamente 8 dígitos (CR).';
        }
      });
    }

    return errs;
  }

  function recolectarErroresFechas(formActual: FormCV): ErrorMapa {
    const errs: ErrorMapa = {};
    formActual.educaciones.forEach((e, i) => Object.assign(errs, validarFechasEducacion(e, i)));
    formActual.experiencias.forEach((e, i) => Object.assign(errs, validarFechasExperiencia(e, i)));
    return errs;
  }

  function validarColecciones(formActual: FormCV): ErrorMapa {
    const errs: ErrorMapa = {};

    // EDUCACIÓN
    formActual.educaciones.forEach((edu, i) => {
      let msg = validarCampoSegunReglas(edu.institucion, validacionesEducacion.institucion, 'Institución');
      if (msg) errs[`educaciones.${i}.institucion`] = msg;

      msg = validarCampoSegunReglas(edu.titulo, validacionesEducacion.titulo, 'Título');
      if (msg) errs[`educaciones.${i}.titulo`] = msg;

      msg = validarCampoSegunReglas(edu.fecha_inicio, validacionesEducacion.fecha_inicio, 'Fecha inicio');
      if (msg) errs[`educaciones.${i}.fecha_inicio`] = msg;

      msg = validarCampoSegunReglas(edu.fecha_fin, validacionesEducacion.fecha_fin, 'Fecha fin', { fecha_inicio: edu.fecha_inicio });
      if (msg) errs[`educaciones.${i}.fecha_fin`] = msg;
    });

    // EXPERIENCIA
    formActual.experiencias.forEach((exp, i) => {
      let msg = validarCampoSegunReglas(exp.empresa, validacionesExperiencia.empresa, 'Empresa');
      if (msg) errs[`experiencias.${i}.empresa`] = msg;

      msg = validarCampoSegunReglas(exp.puesto, validacionesExperiencia.puesto, 'Puesto');
      if (msg) errs[`experiencias.${i}.puesto`] = msg;

      msg = validarCampoSegunReglas(exp.periodo_inicio, validacionesExperiencia.periodo_inicio, 'Fecha inicio');
      if (msg) errs[`experiencias.${i}.periodo_inicio`] = msg;

      msg = validarCampoSegunReglas(
        exp.periodo_fin,
        validacionesExperiencia.periodo_fin,
        'Fecha fin',
        { periodo_inicio: exp.periodo_inicio }
      );
      if (msg) errs[`experiencias.${i}.periodo_fin`] = msg;

      // NUEVO: Validar funciones
      if (!exp.funciones || exp.funciones.length === 0) {
        errs[`experiencias.${i}.funciones`] = 'Agrega al menos una función para esta experiencia';
      } else {
        exp.funciones.forEach((func, fIdx) => {
          const desc = (func.descripcion ?? '').trim();
          
          if (!desc) {
            errs[`experiencias.${i}.funciones.${fIdx}.descripcion`] = 'Completa la función o elimínala';
          } else {
            const msgFunc = validarCampoSegunReglas(desc, validacionesFuncion.descripcion, 'Función');
            if (msgFunc) errs[`experiencias.${i}.funciones.${fIdx}.descripcion`] = msgFunc;
          }
        });
      }
    });

    // HABILIDADES
    formActual.habilidades.forEach((h, i) => {
      const desc = (h.descripcion ?? '').trim();
      
      if (formActual.habilidades.length > 0 && !desc) {
        errs[`habilidades.${i}.descripcion`] = 'Completa la habilidad o elimínala';
      } else if (desc) {
        const msg = validarCampoSegunReglas(desc, validacionesHabilidad.descripcion, 'Descripción de habilidad');
        if (msg) errs[`habilidades.${i}.descripcion`] = msg;
      }
    });

    // IDIOMAS
    formActual.idiomas.forEach((id, i) => {
      const nom = (id.nombre ?? '').trim();
      const niv = (id.nivel ?? '').trim();
      const tieneAlgunValor = nom || niv;

      if (tieneAlgunValor) {
        if (!nom) {
          errs[`idiomas.${i}.nombre`] = 'Completa el nombre del idioma o elimina esta fila';
        } else {
          const msgNom = validarCampoSegunReglas(nom, validacionesIdioma.nombre, 'Nombre del idioma');
          if (msgNom) errs[`idiomas.${i}.nombre`] = msgNom;
        }

        if (!niv) {
          errs[`idiomas.${i}.nivel`] = 'Selecciona un nivel o elimina esta fila';
        } else {
          const msgNiv = validarCampoSegunReglas(niv, validacionesIdioma.nivel, 'Nivel');
          if (msgNiv) errs[`idiomas.${i}.nivel`] = msgNiv;
        }
      }
    });

    // REFERENCIAS
    formActual.referencias.forEach((r, i) => {
      const nom = (r.nombre ?? '').trim();
      const tel = (r.contacto ?? '').trim();
      const rel = (r.relacion ?? '').trim();
      const tieneAlgunValor = nom || tel || rel;

      if (tieneAlgunValor) {
        if (!nom) {
          errs[`referencias.${i}.nombre`] = 'Completa el nombre o elimina esta referencia';
        } else {
          const msgNom = validarCampoSegunReglas(nom, validacionesReferencia.nombre, 'Nombre');
          if (msgNom) errs[`referencias.${i}.nombre`] = msgNom;
        }

        if (!tel) {
          errs[`referencias.${i}.contacto`] = 'Completa el teléfono o elimina esta referencia';
        } else {
          const msgTel = validarCampoSegunReglas(tel, validacionesReferencia.contacto, 'Teléfono');
          if (msgTel) errs[`referencias.${i}.contacto`] = msgTel;
        }

        if (!rel) {
          errs[`referencias.${i}.relacion`] = 'Completa la relación o elimina esta referencia';
        } else {
          const msgRel = validarCampoSegunReglas(rel, validacionesReferencia.relacion, 'Relación');
          if (msgRel) errs[`referencias.${i}.relacion`] = msgRel;
        }
      }
    });

    // CERTIFICACIONES
    formActual.certificaciones.forEach((cert, i) => {
      const nombre = (cert.nombre ?? '').trim();
      const institucion = (cert.institucion ?? '').trim();
      const fecha = (cert.fecha_obtencion ?? '').trim();
      const tieneAlgunValor = nombre || institucion || fecha;

      if (tieneAlgunValor) {
        if (!nombre) {
          errs[`certificaciones.${i}.nombre`] = 'Completa el nombre de la certificación o elimínala';
        } else {
          const msgNombre = validarCampoSegunReglas(nombre, validacionesCertificacion.nombre, 'Nombre de certificación');
          if (msgNombre) errs[`certificaciones.${i}.nombre`] = msgNombre;
        }

        if (institucion) {
          const msgInstitucion = validarCampoSegunReglas(institucion, validacionesCertificacion.institucion, 'Institución');
          if (msgInstitucion) errs[`certificaciones.${i}.institucion`] = msgInstitucion;
        }

        if (fecha) {
          const msgFecha = validarCampoSegunReglas(fecha, validacionesCertificacion.fecha_obtencion, 'Fecha de obtención');
          if (msgFecha) errs[`certificaciones.${i}.fecha_obtencion`] = msgFecha;
        }
      }
    });

    return errs;
  }

  // ================== FUNCIÓN: Validación centralizada ==================
  function validarFormularioCompleto(pasoActual?: number): ErrorMapa {
    const pasoAValidar = pasoActual ?? paso;
    const eBase = validarPaso(form, pasoAValidar);
    const eTel = validarTelefonosLocales(form, pasoAValidar);
    const eTelDP = pasoAValidar === 4 ? validarTelefonosLocales(form, 1) : {};
    const eFechas = recolectarErroresFechas(form);
    const eColecciones = validarColecciones(form);

    const e: ErrorMapa = { ...eBase, ...eTel, ...eTelDP, ...eFechas, ...eColecciones };

    // Validar resumen profesional (Paso 1)
    if (pasoAValidar === 1 || pasoAValidar === 4) {
      if (!(form.resumenProfesional ?? '').trim()) {
        e['resumenProfesional'] = 'Campo requerido: Resumen profesional';
      } else if ((form.resumenProfesional ?? '').length > 600) {
        e['resumenProfesional'] = 'Máximo 600 caracteres.';
      }
    }

    // Validar datos personales
    if (pasoAValidar === 1 || pasoAValidar === 4) {
      let msg = validarCampoSegunReglas(
        form.datosPersonales.nombreCompleto,
        validacionesDatosPersonales.nombreCompleto,
        'Nombre completo'
      );
      if (msg) e['datosPersonales.nombreCompleto'] = msg;

      msg = validarCampoSegunReglas(
        form.datosPersonales.correo,
        validacionesDatosPersonales.correo,
        'Correo electrónico'
      );
      if (msg) e['datosPersonales.correo'] = msg;

      if ((form.datosPersonales.telefono ?? '').trim()) {
        msg = validarCampoSegunReglas(
          form.datosPersonales.telefono,
          validacionesDatosPersonales.telefono,
          'Teléfono'
        );
        if (msg) e['datosPersonales.telefono'] = msg;
      }
    }

    return e;
  }

  // ================== Manejo de Errores API Mejorado ==================
  const manejarErrorApi = async (error: unknown) => {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
      request?: unknown;
    };

    if (axiosError.response) {
      if (axiosError.response.status === 422) {
        setErrores(formatearErroresConEtiquetas(axiosError.response.data?.errors));
        return;
      }

      if (axiosError.response.status === 401) {
        await modal.alerta({
          titulo: "Sesión expirada",
          mensaje: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        });
        router.visit('/login');
        return;
      }

      if (axiosError.response.status === 403) {
        await modal.alerta({
          titulo: "Acceso denegado",
          mensaje: "No tienes permisos para realizar esta acción.",
        });
        return;
      }

      if (axiosError.response.status === 500) {
        await modal.alerta({
          titulo: "Error del servidor",
          mensaje: "Ocurrió un error en el servidor. Por favor, intenta más tarde.",
        });
        return;
      }

      await modal.alerta({
        titulo: "Error",
        mensaje: axiosError.response.data?.message || "Ocurrió un error al procesar la solicitud.",
      });
    } else if (axiosError.request) {
      await modal.alerta({
        titulo: "Error de conexión",
        mensaje: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
      });
    } else {
      await modal.alerta({
        titulo: "Error inesperado",
        mensaje: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
      });
    }
  };

  async function removeArrayItem(
    key: 'educaciones' | 'experiencias' | 'habilidades' | 'idiomas' | 'referencias' | 'certificaciones',
    idx: number
  ) {
    const continuar = await modal.confirmacion({
      titulo: "Confirmar eliminación",
      mensaje: "¿Deseas eliminar este elemento?",
      textoAceptar: "Eliminar",
      textoCancelar: "Cancelar",
    });
    if (!continuar) return;

    setForm(prev => {
      const copia = JSON.parse(JSON.stringify(prev)) as FormCV;
      (copia[key] as unknown[]).splice(idx, 1);
      return copia;
    });
  }

  // NUEVA: Función para eliminar una función específica de una experiencia
  async function removeFuncion(expIdx: number, funcIdx: number) {
    const continuar = await modal.confirmacion({
      titulo: "Confirmar eliminación",
      mensaje: "¿Deseas eliminar esta función?",
      textoAceptar: "Eliminar",
      textoCancelar: "Cancelar",
    });
    if (!continuar) return;

    setForm(prev => {
      const copia = JSON.parse(JSON.stringify(prev)) as FormCV;
      copia.experiencias[expIdx].funciones.splice(funcIdx, 1);
      return copia;
    });
  }

  async function siguiente() {
    const erroresFormateados = formatearErroresConEtiquetas(validarFormularioCompleto(paso));
    setErrores(erroresFormateados);
    if (Object.keys(erroresFormateados).length === 0) setPaso(paso + 1);
  }

  function anterior() {
    setPaso(paso - 1);
  }

  async function generar() {
    const erroresFormateados = formatearErroresConEtiquetas(validarFormularioCompleto(4));
    setErrores(erroresFormateados);

    if (Object.keys(erroresFormateados).length > 0) {
      await modal.alerta({
        titulo: "Validación",
        mensaje: "Revisa los campos marcados antes de continuar.",
      });
      return;
    }

    setMostrarBtnDashboard(false);

    try {
      setCargando(true);
      const resp = await postGenerarCurriculum(form);
      if (resp.rutaPublica) {
        const abrir = await modal.confirmacion({
          titulo: "Currículum generado",
          mensaje: "Tu currículum se generó correctamente.\n\nElige una opción:",
          textoAceptar: "Abrir en pestaña nueva",
          textoCancelar: "Descargar PDF"
        });
        if (abrir) {
          abrirEnPestanaNueva(getAbsoluteUrl(resp.rutaPublica));
        } else {
          descargarArchivo(getAbsoluteUrl(resp.rutaPublica), 'curriculum.pdf');
        }
        setMostrarBtnDashboard(true);
      } else {
        throw new Error("No se pudo generar el PDF");
      }
    } catch (error: unknown) {
      await manejarErrorApi(error);
    } finally {
      setCargando(false);
    }
  }

  function validarFechasEducacion(educacion: Educacion, index: number): ErrorMapa {
    const errores: ErrorMapa = {};
    const hoy = new Date();
    const fechaMinima = new Date(FECHA_MINIMA_CURRICULUM);

    if (educacion.fecha_inicio) {
      const fechaInicio = new Date(educacion.fecha_inicio);
      if (fechaInicio > hoy) errores[`educaciones.${index}.fecha_inicio`] = 'La fecha no puede ser mayor a hoy';
      if (fechaInicio < fechaMinima) errores[`educaciones.${index}.fecha_inicio`] = `La fecha no puede ser anterior a ${FECHA_MINIMA_CURRICULUM}`;
    }
    if (educacion.fecha_fin) {
      const fechaFin = new Date(educacion.fecha_fin);
      const fechaInicio = educacion.fecha_inicio ? new Date(educacion.fecha_inicio) : null;
      if (fechaFin > hoy) errores[`educaciones.${index}.fecha_fin`] = 'La fecha no puede ser mayor a hoy';
      if (fechaInicio && fechaFin < fechaInicio) errores[`educaciones.${index}.fecha_fin`] = 'La fecha de fin no puede ser anterior a la fecha de inicio';
    }
    return errores;
  }

  function validarFechasExperiencia(experiencia: Experiencia, index: number): ErrorMapa {
    const errores: ErrorMapa = {};
    const hoy = new Date();
    const fechaMinima = new Date(FECHA_MINIMA_CURRICULUM);

    if (experiencia.periodo_inicio) {
      const fechaInicio = new Date(experiencia.periodo_inicio);
      if (fechaInicio > hoy) errores[`experiencias.${index}.periodo_inicio`] = 'La fecha no puede ser mayor a hoy';
      if (fechaInicio < fechaMinima) errores[`experiencias.${index}.periodo_inicio`] = `La fecha no puede ser anterior a ${FECHA_MINIMA_CURRICULUM}`;
    }
    if (experiencia.periodo_fin) {
      const fechaFin = new Date(experiencia.periodo_fin);
      const fechaInicio = experiencia.periodo_inicio ? new Date(experiencia.periodo_inicio) : null;
      if (fechaFin > hoy) errores[`experiencias.${index}.periodo_fin`] = 'La fecha no puede ser mayor a hoy';
      if (fechaInicio && fechaFin < fechaInicio) errores[`experiencias.${index}.periodo_fin`] = 'La fecha de fin no puede ser anterior a la fecha de inicio';
    }
    return errores;
  }

  const etiquetasCampo: Record<string, string> = {
    'datosPersonales.nombreCompleto': 'Nombre completo',
    'datosPersonales.correo': 'Correo electrónico',
    'datosPersonales.telefono': 'Teléfono',
    resumenProfesional: 'Resumen profesional',
    'educaciones.institucion': 'Institución',
    'educaciones.titulo': 'Título',
    'educaciones.fecha_inicio': 'Fecha inicio',
    'educaciones.fecha_fin': 'Fecha fin',
    'experiencias.empresa': 'Empresa',
    'experiencias.puesto': 'Puesto',
    'experiencias.periodo_inicio': 'Fecha inicio',
    'experiencias.periodo_fin': 'Fecha fin',
    'experiencias.funciones': 'Funciones',
    'experiencias.funciones.descripcion': 'Función',
    'habilidades.descripcion': 'Descripción de habilidad',
    'idiomas.nombre': 'Nombre del idioma',
    'idiomas.nivel': 'Nivel',
    'referencias.nombre': 'Nombre',
    'referencias.contacto': 'Teléfono',
    'referencias.relacion': 'Relación',
    'certificaciones.nombre': 'Nombre de certificación',
    'certificaciones.institucion': 'Institución',
    'certificaciones.fecha_obtencion': 'Fecha de obtención',
  };

  function obtenerEtiquetaDeClave(clave: string): string {
    const claveNormalizada = clave.replace(/\.\d+/g, '.').replace(/\.$/, '');
    if (etiquetasCampo[claveNormalizada]) return etiquetasCampo[claveNormalizada];
    const partes = clave.split('.');
    const ultima = partes[partes.length - 1] ?? clave;
    return ultima.replace(/[_-]/g, ' ').replace(/\b\w/g, letra => letra.toUpperCase());
  }

  function formatearErroresConEtiquetas(errores: ErrorMapa | Record<string, string[]> = {}): ErrorMapa {
    const resultado: ErrorMapa = {};
    Object.entries(errores).forEach(([clave, valor]) => {
      const mensajeBase = Array.isArray(valor) ? valor[0] : valor;
      if (typeof mensajeBase === 'string' && /requerid/i.test(mensajeBase)) {
        resultado[clave] = `Campo requerido: ${obtenerEtiquetaDeClave(clave)}`;
      } else if (mensajeBase) {
        resultado[clave] = mensajeBase;
      }
    });
    return resultado;
  }

  const getAriaInvalid = (key: string) => (errores[key] ? true : undefined);
  const getDescribedBy = (key: string) => (errores[key] ? `${key.replace(/[^\w-]/g, '_')}_err` : undefined);

  const fotoPerfilUrl = usuario?.fotoPerfil?.ruta_imagen
    ? getAbsoluteUrl(usuario.fotoPerfil.ruta_imagen)
    : FotoXDefecto;

  return (
    <PpLayout userPermisos={userPermisos}>
      <h1 className="text-2xl font-bold text-[#034991] mb-4">Generación de Currículum</h1>

      <div className="max-w-6xl mx-auto p-4 text-gray-900">
        <ol className="flex gap-2 mb-4 text-sm">
          {[1, 2, 3, 4].map(n => (
            <li key={n} className={`px-3 py-1 rounded-full ${paso === n ? 'bg-[#034991] text-white' : 'bg-gray-200'}`}>
              Paso {n}
            </li>
          ))}
        </ol>

        {paso === 1 && (
          <section className="grid grid-cols-2 gap-4">
            {/* Nombre completo */}
            <div className="float-label-input">
              <input
                id="dp_nombreCompleto"
                className="peer"
                placeholder=" "
                value={form.datosPersonales.nombreCompleto}
                onChange={e => setCampo('datosPersonales.nombreCompleto', e.target.value)}
                aria-invalid={getAriaInvalid('datosPersonales.nombreCompleto')}
                aria-describedby={getDescribedBy('datosPersonales.nombreCompleto')}
                maxLength={80}
              />
              <label htmlFor="dp_nombreCompleto">Nombre completo</label>
              {errores['datosPersonales.nombreCompleto'] &&
                <p id="datosPersonales_nombreCompleto_err" className="text-red-600 text-sm">{errores['datosPersonales.nombreCompleto']}</p>
              }
            </div>
            {/* Correo */}
            <div className="float-label-input">
              <input
                id="dp_correo"
                type="email"
                className="peer"
                placeholder=" "
                value={form.datosPersonales.correo}
                onChange={e => setCampo('datosPersonales.correo', e.target.value)}
                aria-invalid={getAriaInvalid('datosPersonales.correo')}
                aria-describedby={getDescribedBy('datosPersonales.correo')}
              />
              <label htmlFor="dp_correo">Correo electrónico</label>
              {errores['datosPersonales.correo'] &&
                <p id="datosPersonales_correo_err" className="text-red-600 text-sm">{errores['datosPersonales.correo']}</p>
              }
            </div>
            {/* Teléfono */}
            <div className="float-label-input">
              <input
                id="dp_telefono"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{8}"
                maxLength={8}
                className={`peer ${form.datosPersonales.telefono ? 'has-value' : ''}`}
                placeholder=" "
                value={form.datosPersonales.telefono}
                onChange={(e) => {
                  const limpio = solo8Digitos(e.target.value);
                  setCampo('datosPersonales.telefono', limpio);
                }}
                aria-invalid={getAriaInvalid('datosPersonales.telefono')}
                aria-describedby={getDescribedBy('datosPersonales.telefono')}
              />
              <label htmlFor="dp_telefono">Teléfono (8 dígitos)</label>
              <p className="text-xs text-gray-500 mt-1">Debe contener exactamente 8 dígitos (Costa Rica).</p>
              {errores['datosPersonales.telefono'] &&
                <p id="datosPersonales_telefono_err" className="text-red-600 text-sm">{errores['datosPersonales.telefono']}</p>
              }
            </div>

            {/* Foto de Perfil */}
            <div className="bg-gray-50 p-4 rounded-lg border col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Foto de Perfil</h3>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={fotoPerfilUrl}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="incluirFotoPerfil"
                      checked={!!form.incluirFotoPerfil}
                      onChange={e => setCampo('incluirFotoPerfil', e.target.checked)}
                      className="rounded border-gray-300 text-[#034991] focus:ring-[#034991]"
                    />
                    <label htmlFor="incluirFotoPerfil" className="text-sm font-medium text-gray-700">
                      Incluir foto de perfil en el currículum
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {usuario?.fotoPerfil?.ruta_imagen
                      ? "Tu foto de perfil actual se incluirá si activas esta opción."
                      : "No tienes una foto de perfil configurada. Se usará una imagen por defecto."}
                  </p>
                  {!usuario?.fotoPerfil?.ruta_imagen && (
                    <a href="/perfil/foto" className="text-[#034991] text-xs hover:underline">
                      Subir foto de perfil →
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen profesional */}
            <div className="float-label-input col-span-2">
              <textarea
                id="dp_resumen"
                className={`peer ${(form.resumenProfesional ?? '').trim() ? 'has-value' : ''}`}
                placeholder=" "
                maxLength={600}
                value={form.resumenProfesional}
                onChange={e => setCampo('resumenProfesional', e.target.value)}
                aria-invalid={getAriaInvalid('resumenProfesional')}
                aria-describedby={getDescribedBy('resumenProfesional')}
              />
              <label htmlFor="dp_resumen">Resumen profesional</label>
              {errores['resumenProfesional'] &&
                <p id="resumenProfesional_err" className="text-red-600 text-sm">{errores['resumenProfesional']}</p>
              }
            </div>
          </section>
        )}

        {paso === 2 && (
          <section>
            <Button
              variant="outline"
              onClick={() => {
                setForm(prev => ({
                  ...prev,
                  educaciones: [...prev.educaciones, { institucion: '', titulo: '', fecha_inicio: '', fecha_fin: '' }]
                }));
              }}
              className="mb-2"
              disabled={form.educaciones.length >= MAX_ELEMENTOS_CV}
              title={form.educaciones.length >= MAX_ELEMENTOS_CV ? `Máximo ${MAX_ELEMENTOS_CV} educaciones permitidas` : undefined}
            >
              + Agregar educación ({form.educaciones.length}/{MAX_ELEMENTOS_CV})
            </Button>
            
            {form.educaciones.length >= MAX_ELEMENTOS_CV && (
              <p className="text-amber-600 text-sm mb-2">
                Has alcanzado el límite máximo de {MAX_ELEMENTOS_CV} educaciones.
              </p>
            )}

            {form.educaciones.map((ed, i) => (
              <div key={i} className="mb-3 p-4 border rounded bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Educación {i + 1}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeArrayItem('educaciones', i)}
                    aria-label={`Eliminar educación ${i + 1}`}
                  >
                    Eliminar
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {/* Institución */}
                  <div className="float-label-input">
                    <input
                      id={`ed_${i}_institucion`}
                      className={`peer ${ed.institucion ? 'has-value' : ''}`}
                      placeholder=" "
                      value={ed.institucion}
                      onChange={e => setCampo(`educaciones.${i}.institucion`, e.target.value)}
                      aria-invalid={getAriaInvalid(`educaciones.${i}.institucion`)}
                      aria-describedby={getDescribedBy(`educaciones.${i}.institucion`)}
                      maxLength={100}
                    />
                    <label htmlFor={`ed_${i}_institucion`}>Institución</label>
                  </div>

                  {/* Título */}
                  <div className="float-label-input">
                    <input
                      id={`ed_${i}_titulo`}
                      className={`peer ${ed.titulo ? 'has-value' : ''}`}
                      placeholder=" "
                      value={ed.titulo}
                      onChange={e => setCampo(`educaciones.${i}.titulo`, e.target.value)}
                      aria-invalid={getAriaInvalid(`educaciones.${i}.titulo`)}
                      aria-describedby={getDescribedBy(`educaciones.${i}.titulo`)}
                      maxLength={100}
                    />
                    <label htmlFor={`ed_${i}_titulo`}>Título</label>
                  </div>

                  {/* Fecha inicio */}
                  <div className="float-label-input">
                    <input
                      id={`ed_${i}_fecha_inicio`}
                      className={`peer ${ed.fecha_inicio ? 'has-value' : ''}`}
                      type="date"
                      placeholder=" "
                      min={FECHA_MINIMA_CURRICULUM}
                      max={new Date().toISOString().split('T')[0]}
                      value={ed.fecha_inicio ?? ''}
                      onChange={e => setCampo(`educaciones.${i}.fecha_inicio`, e.target.value)}
                      aria-invalid={getAriaInvalid(`educaciones.${i}.fecha_inicio`)}
                      aria-describedby={getDescribedBy(`educaciones.${i}.fecha_inicio`)}
                    />
                    <label htmlFor={`ed_${i}_fecha_inicio`}>Fecha inicio</label>
                  </div>

                  {/* Fecha fin */}
                  <div className="float-label-input">
                    <input
                      id={`ed_${i}_fecha_fin`}
                      className={`peer ${ed.fecha_fin ? 'has-value' : ''}`}
                      type="date"
                      placeholder=" "
                      min={ed.fecha_inicio ?? FECHA_MINIMA_CURRICULUM}
                      max={new Date().toISOString().split('T')[0]}
                      value={ed.fecha_fin ?? ''}
                      onChange={e => setCampo(`educaciones.${i}.fecha_fin`, e.target.value)}
                      aria-invalid={getAriaInvalid(`educaciones.${i}.fecha_fin`)}
                      aria-describedby={getDescribedBy(`educaciones.${i}.fecha_fin`)}
                    />
                    <label htmlFor={`ed_${i}_fecha_fin`}>Fecha fin</label>
                  </div>
                </div>

                {/* Errores */}
                {errores[`educaciones.${i}.institucion`] && <p id={`educaciones_${i}_institucion_err`} className="text-red-600 text-sm mt-2">{errores[`educaciones.${i}.institucion`]}</p>}
                {errores[`educaciones.${i}.titulo`] && <p id={`educaciones_${i}_titulo_err`} className="text-red-600 text-sm">{errores[`educaciones.${i}.titulo`]}</p>}
                {errores[`educaciones.${i}.fecha_inicio`] && <p id={`educaciones_${i}_fecha_inicio_err`} className="text-red-600 text-sm">{errores[`educaciones.${i}.fecha_inicio`]}</p>}
                {errores[`educaciones.${i}.fecha_fin`] && <p id={`educaciones_${i}_fecha_fin_err`} className="text-red-600 text-sm">{errores[`educaciones.${i}.fecha_fin`]}</p>}
              </div>
            ))}
          </section>
        )}

        {paso === 3 && (
          <section>
            <Button
              variant="outline"
              onClick={() => {
                setForm(prev => ({
                  ...prev,
                  experiencias: [...prev.experiencias, { 
                    empresa: '', 
                    puesto: '', 
                    periodo_inicio: '', 
                    periodo_fin: '', 
                    funciones: [{ descripcion: '' }]
                  }]
                }));
              }}
              className="mb-2"
              disabled={form.experiencias.length >= MAX_ELEMENTOS_CV}
              title={form.experiencias.length >= MAX_ELEMENTOS_CV ? `Máximo ${MAX_ELEMENTOS_CV} experiencias permitidas` : undefined}
            >
              + Agregar experiencia ({form.experiencias.length}/{MAX_ELEMENTOS_CV})
            </Button>
            
            {form.experiencias.length >= MAX_ELEMENTOS_CV && (
              <p className="text-amber-600 text-sm mb-2">
                Has alcanzado el límite máximo de {MAX_ELEMENTOS_CV} experiencias laborales.
              </p>
            )}

            {form.experiencias.map((ex, i) => (
              <div key={i} className="mb-4 p-4 border rounded bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-lg">Experiencia {i + 1}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeArrayItem('experiencias', i)}
                    aria-label={`Eliminar experiencia ${i + 1}`}
                  >
                    Eliminar
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {/* Empresa */}
                  <div className="float-label-input">
                    <input
                      id={`ex_${i}_empresa`}
                      className={`peer ${ex.empresa ? 'has-value' : ''}`}
                      placeholder=" "
                      value={ex.empresa}
                      onChange={e => setCampo(`experiencias.${i}.empresa`, e.target.value)}
                      aria-invalid={getAriaInvalid(`experiencias.${i}.empresa`)}
                      aria-describedby={getDescribedBy(`experiencias.${i}.empresa`)}
                      maxLength={60}
                    />
                    <label htmlFor={`ex_${i}_empresa`}>Empresa</label>
                  </div>

                  {/* Puesto */}
                  <div className="float-label-input">
                    <input
                      id={`ex_${i}_puesto`}
                      className={`peer ${ex.puesto ? 'has-value' : ''}`}
                      placeholder=" "
                      value={ex.puesto}
                      onChange={e => setCampo(`experiencias.${i}.puesto`, e.target.value)}
                      aria-invalid={getAriaInvalid(`experiencias.${i}.puesto`)}
                      aria-describedby={getDescribedBy(`experiencias.${i}.puesto`)}
                      maxLength={60}
                    />
                    <label htmlFor={`ex_${i}_puesto`}>Puesto</label>
                  </div>

                  {/* Fecha inicio */}
                  <div className="float-label-input">
                    <input
                      id={`ex_${i}_periodo_inicio`}
                      className={`peer ${ex.periodo_inicio ? 'has-value' : ''}`}
                      type="date"
                      placeholder=" "
                      min={FECHA_MINIMA_CURRICULUM}
                      max={new Date().toISOString().split('T')[0]}
                      value={ex.periodo_inicio ?? ''}
                      onChange={e => setCampo(`experiencias.${i}.periodo_inicio`, e.target.value)}
                      aria-invalid={getAriaInvalid(`experiencias.${i}.periodo_inicio`)}
                      aria-describedby={getDescribedBy(`experiencias.${i}.periodo_inicio`)}
                    />
                    <label htmlFor={`ex_${i}_periodo_inicio`}>Fecha inicio</label>
                  </div>

                  {/* Fecha fin */}
                  <div className="float-label-input">
                    <input
                      id={`ex_${i}_periodo_fin`}
                      className={`peer ${ex.periodo_fin ? 'has-value' : ''}`}
                      type="date"
                      placeholder=" "
                      min={ex.periodo_inicio ?? FECHA_MINIMA_CURRICULUM}
                      max={new Date().toISOString().split('T')[0]}
                      value={ex.periodo_fin ?? ''}
                      onChange={e => setCampo(`experiencias.${i}.periodo_fin`, e.target.value)}
                      aria-invalid={getAriaInvalid(`experiencias.${i}.periodo_fin`)}
                      aria-describedby={getDescribedBy(`experiencias.${i}.periodo_fin`)}
                    />
                    <label htmlFor={`ex_${i}_periodo_fin`}>Fecha fin</label>
                  </div>
                </div>

                {/* NUEVO: Sección de Funciones */}
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">
                      Funciones del puesto
                    </label>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        const nuevasFunciones = [...(ex.funciones || []), { descripcion: '' }];
                        setCampo(`experiencias.${i}.funciones`, nuevasFunciones);
                      }}
                      disabled={(ex.funciones?.length || 0) >= MAX_FUNCIONES_POR_EXPERIENCIA}
                      title={(ex.funciones?.length || 0) >= MAX_FUNCIONES_POR_EXPERIENCIA 
                        ? `Máximo ${MAX_FUNCIONES_POR_EXPERIENCIA} funciones` 
                        : 'Agregar función'}
                      className="text-xs"
                    >
                      + Agregar función
                    </Button>
                  </div>

                  {(ex.funciones || []).map((func, fIdx) => (
                                        <div key={fIdx} className="flex gap-2 mb-2">
                      <div className="flex-1 relative">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-medium w-6">
                            {fIdx + 1}.
                          </span>
                          <input
                            id={`ex_${i}_func_${fIdx}_descripcion`}
                            className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-[#034991] focus:border-transparent"
                            placeholder={`Describe la función ${fIdx + 1}...`}
                            value={func.descripcion}
                            onChange={e => {
                              const nuevasFunciones = [...ex.funciones];
                              nuevasFunciones[fIdx] = { descripcion: e.target.value };
                              setCampo(`experiencias.${i}.funciones`, nuevasFunciones);
                            }}
                            aria-invalid={getAriaInvalid(`experiencias.${i}.funciones.${fIdx}.descripcion`)}
                            aria-describedby={getDescribedBy(`experiencias.${i}.funciones.${fIdx}.descripcion`)}
                            maxLength={150}
                          />
                        </div>
                        {errores[`experiencias.${i}.funciones.${fIdx}.descripcion`] && (
                          <p id={`experiencias_${i}_funciones_${fIdx}_descripcion_err`} className="text-red-600 text-xs mt-1 ml-8">
                            {errores[`experiencias.${i}.funciones.${fIdx}.descripcion`]}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFuncion(i, fIdx)}
                        aria-label={`Eliminar función ${fIdx + 1}`}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}

                  {(!ex.funciones || ex.funciones.length === 0) && (
                    <p className="text-sm text-gray-500 italic">
                      No hay funciones agregadas. Haz clic en "+ Agregar función" para comenzar.
                    </p>
                  )}

                  {errores[`experiencias.${i}.funciones`] && (
                    <p id={`experiencias_${i}_funciones_err`} className="text-red-600 text-sm mt-2">
                      {errores[`experiencias.${i}.funciones`]}
                    </p>
                  )}
                </div>

                {/* Errores de campos principales */}
                {errores[`experiencias.${i}.empresa`] && <p id={`experiencias_${i}_empresa_err`} className="text-red-600 text-sm mt-2">{errores[`experiencias.${i}.empresa`]}</p>}
                {errores[`experiencias.${i}.puesto`] && <p id={`experiencias_${i}_puesto_err`} className="text-red-600 text-sm">{errores[`experiencias.${i}.puesto`]}</p>}
                {errores[`experiencias.${i}.periodo_inicio`] && <p id={`experiencias_${i}_periodo_inicio_err`} className="text-red-600 text-sm">{errores[`experiencias.${i}.periodo_inicio`]}</p>}
                {errores[`experiencias.${i}.periodo_fin`] && <p id={`experiencias_${i}_periodo_fin_err`} className="text-red-600 text-sm">{errores[`experiencias.${i}.periodo_fin`]}</p>}
              </div>
            ))}
          </section>
        )}

        {paso === 4 && (
          <section className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-[#034991] mb-1">Habilidades</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setForm(prev => ({ ...prev, habilidades: [...prev.habilidades, { descripcion: '' }] }));
                }}
                className="mb-2"
                disabled={form.habilidades.length >= MAX_ELEMENTOS_CV}
                title={form.habilidades.length >= MAX_ELEMENTOS_CV ? `Máximo ${MAX_ELEMENTOS_CV} habilidades permitidas` : undefined}
              >
                + Habilidad ({form.habilidades.length}/{MAX_ELEMENTOS_CV})
              </Button>
              
              {form.habilidades.length >= MAX_ELEMENTOS_CV && (
                <p className="text-amber-600 text-sm mb-2">
                  Has alcanzado el límite máximo de {MAX_ELEMENTOS_CV} habilidades.
                </p>
              )}

              {form.habilidades.map((h, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <div className="float-label-input w-full">
                    <input
                      id={`hab_${i}_descripcion`}
                      className="peer"
                      placeholder=" "
                      maxLength={40}
                      value={h.descripcion}
                      onChange={e => setCampo(`habilidades.${i}.descripcion`, e.target.value)}
                      aria-invalid={getAriaInvalid(`habilidades.${i}.descripcion`)}
                      aria-describedby={getDescribedBy(`habilidades.${i}.descripcion`)}
                    />
                    <label htmlFor={`hab_${i}_descripcion`}>Descripción de habilidad</label>
                    {errores[`habilidades.${i}.descripcion`] && (
                      <p id={`habilidades_${i}_descripcion_err`} className="text-red-600 text-sm mt-1">
                        {errores[`habilidades.${i}.descripcion`]}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeArrayItem('habilidades', i)}
                    aria-label={`Eliminar habilidad ${i + 1}`}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}

              <h3 className="font-bold text-[#034991] mt-4 mb-1">Certificaciones</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setForm(prev => ({ ...prev, certificaciones: [...prev.certificaciones, { nombre: '', institucion: '', fecha_obtencion: '' }] }));
                }}
                className="mb-2"
                disabled={form.certificaciones.length >= MAX_ELEMENTOS_CV}
                title={form.certificaciones.length >= MAX_ELEMENTOS_CV ? `Máximo ${MAX_ELEMENTOS_CV} certificaciones permitidas` : undefined}
              >
                + Certificación ({form.certificaciones.length}/{MAX_ELEMENTOS_CV})
              </Button>
              
              {form.certificaciones.length >= MAX_ELEMENTOS_CV && (
                <p className="text-amber-600 text-sm mb-2">
                  Has alcanzado el límite máximo de {MAX_ELEMENTOS_CV} certificaciones.
                </p>
              )}

              {form.certificaciones.map((cert, idx) => (
                <div key={idx} className="mb-3 p-3 border rounded bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Certificación {idx + 1}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeArrayItem('certificaciones', idx)}
                      aria-label={`Eliminar certificación ${idx + 1}`}
                    >
                      Eliminar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {/* Nombre */}
                    <div className="float-label-input">
                      <input
                        id={`cert_${idx}_nombre`}
                        className="peer"
                        placeholder=" "
                        maxLength={100}
                        value={cert.nombre}
                        onChange={e => setCampo(`certificaciones.${idx}.nombre`, e.target.value)}
                        aria-invalid={getAriaInvalid(`certificaciones.${idx}.nombre`)}
                        aria-describedby={getDescribedBy(`certificaciones.${idx}.nombre`)}
                      />
                      <label htmlFor={`cert_${idx}_nombre`}>Nombre de la certificación</label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Institución */}
                      <div className="float-label-input">
                        <input
                          id={`cert_${idx}_institucion`}
                          className="peer"
                          placeholder=" "
                          maxLength={80}
                          value={cert.institucion || ''}
                          onChange={e => setCampo(`certificaciones.${idx}.institucion`, e.target.value)}
                          aria-invalid={getAriaInvalid(`certificaciones.${idx}.institucion`)}
                          aria-describedby={getDescribedBy(`certificaciones.${idx}.institucion`)}
                        />
                        <label htmlFor={`cert_${idx}_institucion`}>Institución (opcional)</label>
                      </div>

                      {/* Fecha obtención */}
                      <div className="float-label-input">
                        <input
                          id={`cert_${idx}_fecha_obtencion`}
                          className={`peer ${cert.fecha_obtencion ? 'has-value' : ''}`}
                          type="date"
                          placeholder=" "
                          min={FECHA_MINIMA_CURRICULUM}
                          max={new Date().toISOString().split('T')[0]}
                          value={cert.fecha_obtencion || ''}
                          onChange={e => setCampo(`certificaciones.${idx}.fecha_obtencion`, e.target.value)}
                          aria-invalid={getAriaInvalid(`certificaciones.${idx}.fecha_obtencion`)}
                          aria-describedby={getDescribedBy(`certificaciones.${idx}.fecha_obtencion`)}
                        />
                        <label htmlFor={`cert_${idx}_fecha_obtencion`}>Fecha obtención (opcional)</label>
                      </div>
                    </div>
                  </div>

                  {/* Errores */}
                  {errores[`certificaciones.${idx}.nombre`] && <p id={`certificaciones_${idx}_nombre_err`} className="text-red-600 text-sm mt-1">{errores[`certificaciones.${idx}.nombre`]}</p>}
                  {errores[`certificaciones.${idx}.institucion`] && <p id={`certificaciones_${idx}_institucion_err`} className="text-red-600 text-sm mt-1">{errores[`certificaciones.${idx}.institucion`]}</p>}
                  {errores[`certificaciones.${idx}.fecha_obtencion`] && <p id={`certificaciones_${idx}_fecha_obtencion_err`} className="text-red-600 text-sm mt-1">{errores[`certificaciones.${idx}.fecha_obtencion`]}</p>}
                </div>
              ))}

              <h3 className="font-bold text-[#034991] mt-4 mb-1">Idiomas</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setForm(prev => ({ ...prev, idiomas: [...prev.idiomas, { nombre: '', nivel: '' }] }));
                }}
                className="mb-2"
                disabled={form.idiomas.length >= MAX_ELEMENTOS_CV}
                title={form.idiomas.length >= MAX_ELEMENTOS_CV ? `Máximo ${MAX_ELEMENTOS_CV} idiomas permitidos` : undefined}
              >
                + Idioma ({form.idiomas.length}/{MAX_ELEMENTOS_CV})
              </Button>
              
              {form.idiomas.length >= MAX_ELEMENTOS_CV && (
                <p className="text-amber-600 text-sm mb-2">
                  Has alcanzado el límite máximo de {MAX_ELEMENTOS_CV} idiomas.
                </p>
              )}

              {form.idiomas.map((i2, idx) => (
                <div key={idx} className="mb-3 p-3 border rounded bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Idioma {idx + 1}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeArrayItem('idiomas', idx)}
                      aria-label={`Eliminar idioma ${idx + 1}`}
                    >
                      Eliminar
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Nombre idioma */}
                    <div className="float-label-input col-span-2">
                      <input
                        id={`idioma_${idx}_nombre`}
                        className="peer"
                        placeholder=" "
                        maxLength={15}
                        value={i2.nombre}
                        onChange={e => setCampo(`idiomas.${idx}.nombre`, e.target.value)}
                        aria-invalid={getAriaInvalid(`idiomas.${idx}.nombre`)}
                        aria-describedby={getDescribedBy(`idiomas.${idx}.nombre`)}
                      />
                      <label htmlFor={`idioma_${idx}_nombre`}>Nombre del idioma</label>
                    </div>

                    {/* Nivel */}
                    <div className="float-label-input">
                      <select
                        id={`idioma_${idx}_nivel`}
                        className={`peer ${i2.nivel ? 'has-value' : ''}`}
                        value={i2.nivel}
                        onChange={e => setCampo(`idiomas.${idx}.nivel`, e.target.value)}
                        aria-invalid={getAriaInvalid(`idiomas.${idx}.nivel`)}
                        aria-describedby={getDescribedBy(`idiomas.${idx}.nivel`)}
                      >
                        <option value="">Seleccione...</option>
                        <option value="A1">A1</option>
                        <option value="A2">A2</option>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                        <option value="C1">C1</option>
                        <option value="C2">C2</option>
                        <option value="Nativo">Nativo</option>
                      </select>
                      <label htmlFor={`idioma_${idx}_nivel`}>Nivel</label>
                    </div>
                  </div>
                  {errores[`idiomas.${idx}.nombre`] && <p id={`idiomas_${idx}_nombre_err`} className="text-red-600 text-sm mt-1">{errores[`idiomas.${idx}.nombre`]}</p>}
                  {errores[`idiomas.${idx}.nivel`] && <p id={`idiomas_${idx}_nivel_err`} className="text-red-600 text-sm mt-1">{errores[`idiomas.${idx}.nivel`]}</p>}
                </div>
              ))}

              <h3 className="font-bold text-[#034991] mt-4 mb-1">Referencias</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setForm(prev => ({ ...prev, referencias: [...prev.referencias, { nombre: '', contacto: '', relacion: '' }] }));
                }}
                className="mb-2"
                disabled={form.referencias.length >= MAX_ELEMENTOS_CV}
                title={form.referencias.length >= MAX_ELEMENTOS_CV ? `Máximo ${MAX_ELEMENTOS_CV} referencias permitidas` : undefined}
              >
                + Referencia ({form.referencias.length}/{MAX_ELEMENTOS_CV})
              </Button>
              
              {form.referencias.length >= MAX_ELEMENTOS_CV && (
                <p className="text-amber-600 text-sm mb-2">
                  Has alcanzado el límite máximo de {MAX_ELEMENTOS_CV} referencias.
                </p>
              )}

              {form.referencias.map((r, idx) => (
                <div key={idx} className="mb-3 p-3 border rounded bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Referencia {idx + 1}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeArrayItem('referencias', idx)}
                      aria-label={`Eliminar referencia ${idx + 1}`}
                    >
                      Eliminar
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Nombre */}
                    <div className="float-label-input">
                      <input
                        id={`ref_${idx}_nombre`}
                        className="peer"
                        placeholder=" "
                        maxLength={80}
                        value={r.nombre}
                        onChange={e => setCampo(`referencias.${idx}.nombre`, e.target.value)}
                        aria-invalid={getAriaInvalid(`referencias.${idx}.nombre`)}
                        aria-describedby={getDescribedBy(`referencias.${idx}.nombre`)}
                      />
                      <label htmlFor={`ref_${idx}_nombre`}>Nombre</label>
                    </div>

                    {/* Contacto */}
                    <div className="float-label-input">
                      <input
                        id={`ref_${idx}_contacto`}
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{8}"
                        maxLength={8}
                        className={`peer ${r.contacto ? 'has-value' : ''}`}
                        placeholder=" "
                        value={r.contacto}
                        onChange={(e) => {
                          const limpio = solo8Digitos(e.target.value);
                          setCampo(`referencias.${idx}.contacto`, limpio);
                        }}
                        aria-invalid={getAriaInvalid(`referencias.${idx}.contacto`)}
                        aria-describedby={getDescribedBy(`referencias.${idx}.contacto`)}
                      />
                      <label htmlFor={`ref_${idx}_contacto`}>Teléfono</label>
                    </div>

                    {/* Relación */}
                    <div className="float-label-input">
                      <input
                        id={`ref_${idx}_relacion`}
                        className="peer"
                        placeholder=" "
                        maxLength={50}
                        value={r.relacion}
                        onChange={e => setCampo(`referencias.${idx}.relacion`, e.target.value)}
                        aria-invalid={getAriaInvalid(`referencias.${idx}.relacion`)}
                        aria-describedby={getDescribedBy(`referencias.${idx}.relacion`)}
                      />
                      <label htmlFor={`ref_${idx}_relacion`}>Relación</label>
                    </div>
                  </div>
                  {errores[`referencias.${idx}.nombre`] && <p id={`referencias_${idx}_nombre_err`} className="text-red-600 text-sm mt-1">{errores[`referencias.${idx}.nombre`]}</p>}
                  {errores[`referencias.${idx}.contacto`] && <p id={`referencias_${idx}_contacto_err`} className="text-red-600 text-sm mt-1">{errores[`referencias.${idx}.contacto`]}</p>}
                  {errores[`referencias.${idx}.relacion`] && <p id={`referencias_${idx}_relacion_err`} className="text-red-600 text-sm mt-1">{errores[`referencias.${idx}.relacion`]}</p>}
                </div>
              ))}
            </div>

            <div>
              <Frt_VistaPreviaCurriculum 
                datos={form} 
                fotoPerfilUrl={fotoPerfilUrl} 
              />
            </div>
          </section>
        )}

        <div className="mt-6 flex justify-between">
          {paso > 1 ? (
            <Button 
              variant="secondary"
              onClick={anterior}
            >
              Anterior
            </Button>
          ) : (
            <div />
          )}
          
          {paso < 4 ? (
            <Button 
              variant="default"
              onClick={siguiente}
              className="bg-[#034991] hover:bg-[#023970]"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={generar}
              disabled={botonGenerarDeshabilitado}
              title={!paso4Completo ? "Completa las habilidades, idiomas, referencias y certificaciones agregadas." : undefined}
              className="bg-[#CD1719] hover:bg-[#A01315]"
            >
              {cargando ? "Generando..." : "Generar y Descargar"}
            </Button>
          )}
        </div>

        {mostrarBtnDashboard && (
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => router.visit('/dashboard')}
            >
              Ir al Dashboard
            </Button>
          </div>
        )}
      </div>
    </PpLayout>
  );
}