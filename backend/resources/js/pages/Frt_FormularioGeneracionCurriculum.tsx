import React, { useMemo, useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import PpLayout from '../layouts/PpLayout';
import { validarPaso, ErrorMapa } from '../components/Frt_ValidacionClienteGeneracionCurriculum';
import { postGenerarCurriculum } from '../services/curriculumService';
import { useModal } from '../hooks/useModal';
import FotoXDefecto from '../assets/FotoXDefecto.png';
import { Button } from "@/components/ui/button";
import ModalVistaPreviaCurriculum from '../components/modal/ModalVistaPreviaCurriculum';

import type { FormCV, Educacion, Experiencia, Funcion, Habilidad, Idioma, Referencia, Certificacion } from '../types/curriculum';

// ================== Constantes ==================
const FECHA_MINIMA_CURRICULUM = '1960-01-01';
const MAX_FUNCIONES_POR_EXPERIENCIA = 10;

// ================== Definición de Tipos ==================
type UsuarioActual = {
  id_usuario: number;
  nombre_completo: string;
  cedula?:  string;
  correo:  string;
  telefono?: string;
  fotoPerfil?: { ruta_imagen: string } | null;
};

interface PageProps {
  auth: { 
    user?:  {
      id_usuario: number;
      nombre_completo: string;
      cedula?: string;
      correo: string;
      telefono:  string;
      fotoPerfil?: { ruta_imagen: string } | null;
    } 
  };
  userPermisos?:  number[];
  usuario?:  UsuarioActual;
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
  return `${baseUrl}${url. startsWith('/') ? '' : '/'}${url}`;
}

// ================== Definición de Reglas de Validación ==================
type Regla = {
  required?:  boolean;
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
  const v = (typeof valor === 'string') ? valor. trim() : valor;

  if (reglas.required && (v === undefined || v === null || v === '')) {
    return `Campo requerido: ${etiqueta}`;
  }
  if (v !== undefined && v !== null && v !== '') {
    if (reglas.minLength !== undefined && typeof v === 'string' && v.length < reglas.minLength) {
      return `Debe tener al menos ${reglas. minLength} caracteres. `;
    }
    if (reglas.maxLength !== undefined && typeof v === 'string' && v.length > reglas.maxLength) {
      return `Debe tener como máximo ${reglas.maxLength} caracteres.`;
    }
    if (reglas.pattern && typeof v === 'string' && ! reglas.pattern.test(v)) {
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
    required:  true, 
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/, 
    maxLength: 255 
  },
  telefono: { 
    required:  false, 
    pattern: /^[0-9]{8}$/ 
  }
};

const validacionesEducacion = {
  tipo: { 
    required: true, 
    validate: (value: unknown) => {
      if (! value || typeof value !== 'string') return 'Debe seleccionar un tipo de educación';
      return ['Título', 'Certificación', 'Curso', 'Diplomado', 'Técnico']. includes(value) || 'Tipo de educación inválido';
    }
  },
  institucion: { 
    required:  true, 
    minLength: 3, 
    maxLength: 150,  
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()\-'"]+$/ 
  },
  titulo: { 
    required: true, 
    minLength: 3, 
    maxLength:  150, 
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()\-'"]+$/ 
  },
  fecha_fin: { 
    required: true, 
    validate: (value: unknown) => {
      if (!value || typeof value !== 'string') return true;
      const fechaFin = new Date(value);
      const hoy = new Date();
      
      if (fechaFin > hoy) return 'La fecha no puede ser futura';
      if (fechaFin < new Date(FECHA_MINIMA_CURRICULUM)) return `La fecha no puede ser anterior a ${FECHA_MINIMA_CURRICULUM}`;
      
      return true;
    }
  }
};

// ⭐ NUEVO: Validaciones para certificaciones
const validacionesCertificacion = {
  nombre: {
    required: true,
    minLength: 3,
    maxLength: 150
  },
  institucion: {
    required: false,
    minLength: 3,
    maxLength: 150
  },
  fecha_obtencion: {
    required: false,
    validate: (valor: unknown) => {
      if (!valor || typeof valor !== 'string') return true;
      const fecha = new Date(valor);
      const hoy = new Date();
      return fecha <= hoy || 'La fecha no puede ser futura';
    }
  }
};

const validacionesExperiencia = {
  empresa: { 
    required: true, 
    minLength: 2,    
    maxLength: 120,    
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()&'"\-–—]+$/ 
  },
  puesto: { 
    required:  true, 
    minLength:  3, 
    maxLength: 100,   
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()&/\-–—'"]+$/ 
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
    validate:  (value: unknown, ctx:  unknown) => {
      if (!value || typeof value !== 'string') return true;
      const fechaFin = new Date(value);
      const hoy = new Date();
      
      if (fechaFin > hoy) return 'La fecha no puede ser futura';
      
      const contextObj = ctx as { periodo_inicio?:  string };
      if (contextObj?.periodo_inicio) {
        const fechaInicio = new Date(contextObj.periodo_inicio);
        if (fechaFin < fechaInicio) return 'La fecha de fin no puede ser anterior a la fecha de inicio';
      }
      return true;
    }
  }
};

const validacionesFuncion = {
  descripcion: { 
    required:  false, 
    minLength: 10,  
    maxLength: 150,  
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()&/'\-–—%: ;°]+$/ 
  }
};

const validacionesHabilidad = {
  descripcion: { 
    required:  false, 
    minLength:  2,    
    maxLength: 60,   
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()&/+#'\-\.]+$/ 
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
    required:  false, 
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
  correo: { 
    required: false, 
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/, 
    maxLength: 255 
  },
  relacion: { 
    required:  false, 
    maxLength: 50, 
    pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()'-]+$/ 
  }
};

// ===========================================================

export default function Frt_FormularioGeneracionCurriculum() {
  const page = usePage<PageProps>();
  const userPermisos = page.props. userPermisos ??  [];

  const modal = useModal();

  const usuario:  UsuarioActual | null = page.props.usuario || (page.props.auth?.user
    ? {
        id_usuario: page. props.auth.user.id_usuario,
        nombre_completo: page.props.auth.user.nombre_completo,
        cedula: page.props.auth.user.cedula,
        correo: page.props.auth.user.correo,
        telefono: page.props.auth.user.telefono,
        fotoPerfil: page.props.auth.user.fotoPerfil || null,
      }
    : null);

  const prefill:  FormCV = useMemo(() => ({
    usuarioId: usuario?.id_usuario ??  0,
    datosPersonales: {
      nombreCompleto: usuario?.nombre_completo ?? '',
      correo: usuario?.correo ?? '',
      telefono: usuario?.telefono ?? '',
      linkedin: '',   // ⭐ NUEVO
      github: ''      // ⭐ NUEVO
    },
    resumenProfesional: '',
    educaciones: [],
    experiencias: [],
    
    // ⭐ MODIFICADO: Separación de habilidades
    habilidadesTecnicas: [],   // ⭐ NUEVO
    habilidadesBlandas: [],     // ⭐ NUEVO
    
    // ⭐ NUEVO: Certificaciones
    certificaciones: [],        // ⭐ NUEVO
    
    idiomas: [],
    incluirFotoPerfil: false,
  }), [usuario]);

  const [form, setForm] = useState<FormCV>(prefill);
  const [paso, setPaso] = useState<number>(1);
  const [errores, setErrores] = useState<ErrorMapa>({});
  const [cargando, setCargando] = useState<boolean>(false);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState<boolean>(false);

  // ✅ Validación consolidada para todos los campos
  const formularioCompleto = useMemo(() => {
    const habilidadesTecnicasOk = form.habilidadesTecnicas.length === 0 || form.habilidadesTecnicas.every(h => {
      const desc = (h.descripcion ?? '').trim();
      return desc && desc.length >= 2 && desc.length <= 40;
    });

    const habilidadesBlandasOk = form.habilidadesBlandas.length === 0 || form.habilidadesBlandas.every(h => {
      const desc = (h.descripcion ?? '').trim();
      return desc && desc.length >= 2 && desc.length <= 40;
    });

    const idiomasOk = form.idiomas.length === 0 || form.idiomas.every(i => {
      const nombre = (i.nombre ?? '').trim();
      const nivel = (i.nivel ?? '').trim();
      return nombre && nombre.length >= 2 && nombre.length <= 15 && nivel;
    });

    return habilidadesTecnicasOk && habilidadesBlandasOk && idiomasOk;
  }, [
    form.habilidadesTecnicas,
    form.habilidadesBlandas,
    form.idiomas,
    ...form.habilidadesTecnicas.map(h => h.descripcion),
    ...form.habilidadesBlandas.map(h => h.descripcion),
    ...form.idiomas.map(i => `${i.nombre}|${i.nivel}`)
  ]);

  const botonGenerarDeshabilitado = cargando || ! formularioCompleto;

  // ================== Helpers ==================
  function setCampo(path: string, value: unknown) {
    setForm(prevForm => {
      const newForm = { ... prevForm };
      let current:  Record<string, unknown> = newForm;
      const parts = path.split('.');
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]] as Record<string, unknown>;
      }
      current[parts[parts.length - 1]] = value;

      if (path. startsWith('educaciones.') && path.endsWith('fecha_fin')) {
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
      const tel = formActual.datosPersonales.telefono?. trim();
      if (tel && !regexTelefono.test(tel)) {
        errs['datosPersonales.telefono'] = 'El teléfono debe tener exactamente 8 dígitos (Costa Rica).';
      }
    }

    if (pasoActual === 3) {
      formActual.experiencias.forEach((exp, expIdx) => {
        exp.referencias?. forEach((r, refIdx) => {
          const c = r.contacto?.trim();
          if (c && !regexTelefono.test(c)) {
            errs[`experiencias.${expIdx}.referencias.${refIdx}.contacto`] = 'Debe contener exactamente 8 dígitos (CR).';
          }
        });
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
      let msg = validarCampoSegunReglas(edu.tipo, validacionesEducacion. tipo, 'Tipo de educación');
      if (msg) errs[`educaciones.${i}.tipo`] = msg;

      msg = validarCampoSegunReglas(edu.institucion, validacionesEducacion. institucion, 'Institución');
      if (msg) errs[`educaciones.${i}.institucion`] = msg;

      msg = validarCampoSegunReglas(edu. titulo, validacionesEducacion. titulo, 'Título');
      if (msg) errs[`educaciones.${i}.titulo`] = msg;

      msg = validarCampoSegunReglas(edu.fecha_fin, validacionesEducacion.fecha_fin, 'Fecha finalización');
      if (msg) errs[`educaciones.${i}.fecha_fin`] = msg;
    });

    // EXPERIENCIA
    formActual.experiencias.forEach((exp, i) => {
      let msg = validarCampoSegunReglas(exp.empresa, validacionesExperiencia.empresa, 'Empresa');
      if (msg) errs[`experiencias.${i}.empresa`] = msg;

      msg = validarCampoSegunReglas(exp. puesto, validacionesExperiencia.puesto, 'Puesto');
      if (msg) errs[`experiencias.${i}.puesto`] = msg;

      msg = validarCampoSegunReglas(exp.periodo_inicio, validacionesExperiencia.periodo_inicio, 'Fecha inicio');
      if (msg) errs[`experiencias.${i}.periodo_inicio`] = msg;

      if (!exp.trabajando_actualmente) {
        msg = validarCampoSegunReglas(
          exp.periodo_fin,
          validacionesExperiencia. periodo_fin,
          'Fecha fin',
          { periodo_inicio: exp.periodo_inicio }
        );
        if (msg) errs[`experiencias.${i}.periodo_fin`] = msg;
      }

      // Validar funciones
      if (! exp.funciones || exp.funciones.length === 0) {
        errs[`experiencias.${i}.funciones`] = 'Agrega al menos una función para esta experiencia';
      } else {
        exp.funciones.forEach((func, fIdx) => {
          const desc = (func.descripcion ?? '').trim();
          
          if (! desc) {
            errs[`experiencias.${i}.funciones. ${fIdx}.descripcion`] = 'Completa la función o elimínala';
          } else {
            const msgFunc = validarCampoSegunReglas(desc, validacionesFuncion. descripcion, 'Función');
            if (msgFunc) errs[`experiencias.${i}.funciones.${fIdx}. descripcion`] = msgFunc;
          }
        });
      }

      // Validar referencias
      if (exp.referencias && exp.referencias.length > 0) {
        exp.referencias.forEach((ref, rIdx) => {
          const nom = (ref.nombre ?? '').trim();
          const tel = (ref.contacto ?? '').trim();
          const email = (ref.correo ?? '').trim();
          const rel = (ref.relacion ?? '').trim();
          const tieneAlgunValor = nom || tel || email || rel;

          if (tieneAlgunValor) {
            if (!nom) {
              errs[`experiencias.${i}.referencias.${rIdx}.nombre`] = 'Completa el nombre o elimina esta referencia';
            } else {
              const msgNom = validarCampoSegunReglas(nom, validacionesReferencia.nombre, 'Nombre');
              if (msgNom) errs[`experiencias.${i}.referencias. ${rIdx}.nombre`] = msgNom;
            }

            if (!tel) {
              errs[`experiencias.${i}.referencias.${rIdx}. contacto`] = 'Completa el teléfono o elimina esta referencia';
            } else {
              const msgTel = validarCampoSegunReglas(tel, validacionesReferencia.contacto, 'Teléfono');
              if (msgTel) errs[`experiencias.${i}.referencias.${rIdx}.contacto`] = msgTel;
            }

            if (email) {
              const msgEmail = validarCampoSegunReglas(email, validacionesReferencia.correo, 'Correo');
              if (msgEmail) errs[`experiencias.${i}.referencias.${rIdx}.correo`] = msgEmail;
            }

            if (! rel) {
              errs[`experiencias.${i}.referencias.${rIdx}.relacion`] = 'Completa la relación o elimina esta referencia';
            } else {
              const msgRel = validarCampoSegunReglas(rel, validacionesReferencia. relacion, 'Relación');
              if (msgRel) errs[`experiencias.${i}.referencias.${rIdx}.relacion`] = msgRel;
            }
          }
        });
      }
    });

    // HABILIDADES TÉCNICAS
    formActual.habilidadesTecnicas?.forEach((h, i) => {
      const desc = (h.descripcion ?? '').trim();
      
      if (formActual.habilidadesTecnicas.length > 0 && !desc) {
        errs[`habilidadesTecnicas.${i}.descripcion`] = 'Completa la habilidad o elimínala';
      } else if (desc) {
        const msg = validarCampoSegunReglas(desc, validacionesHabilidad.descripcion, 'Descripción de habilidad técnica');
        if (msg) errs[`habilidadesTecnicas.${i}.descripcion`] = msg;
      }
    });

    // HABILIDADES BLANDAS
    formActual.habilidadesBlandas?.forEach((h, i) => {
      const desc = (h.descripcion ?? '').trim();
      
      if (formActual.habilidadesBlandas.length > 0 && !desc) {
        errs[`habilidadesBlandas.${i}.descripcion`] = 'Completa la competencia o elimínala';
      } else if (desc) {
        const msg = validarCampoSegunReglas(desc, validacionesHabilidad.descripcion, 'Descripción de competencia');
        if (msg) errs[`habilidadesBlandas.${i}.descripcion`] = msg;
      }
    });

    // IDIOMAS
    formActual.idiomas. forEach((id, i) => {
      const nom = (id.nombre ?? '').trim();
      const niv = (id.nivel ?? '').trim();
      const tieneAlgunValor = nom || niv;

      if (tieneAlgunValor) {
        if (!nom) {
          errs[`idiomas.${i}.nombre`] = 'Completa el nombre del idioma o elimina esta fila';
        } else {
          const msgNom = validarCampoSegunReglas(nom, validacionesIdioma. nombre, 'Nombre del idioma');
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

    return errs;
  }

  // ================== FUNCIÓN:  Validación centralizada ==================
  function validarFormularioCompleto(pasoActual?:  number): ErrorMapa {
    const pasoAValidar = pasoActual ?? paso;
    const eBase = validarPaso(form, pasoAValidar);
    const eTel = validarTelefonosLocales(form, pasoAValidar);
    const eFechas = recolectarErroresFechas(form);
    const eColecciones = validarColecciones(form);

    const e:  ErrorMapa = { ...eBase, ...eTel, ...eFechas, ...eColecciones };

    // Validar resumen profesional (Paso 1)
    if (pasoAValidar === 1 || pasoAValidar === 3) {
      if (!(form.resumenProfesional ??  '').trim()) {
        e['resumenProfesional'] = 'Campo requerido:  Resumen profesional';
      } else if ((form.resumenProfesional ?? '').length > 1000) {
        e['resumenProfesional'] = 'Máximo 1000 caracteres.';
      }
    }

    // Validar datos personales
    if (pasoAValidar === 1 || pasoAValidar === 3) {
      let msg = validarCampoSegunReglas(
        form.datosPersonales. nombreCompleto,
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
        if (msg) e['datosPersonales. telefono'] = msg;
      }
    }

    return e;
  }

  // ================== Manejo de Errores API Mejorado ==================
  const manejarErrorApi = async (error: unknown) => {
    const axiosError = error as {
      response?:  {
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
        setErrores(formatearErroresConEtiquetas(axiosError.response.data?. errors));
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
    } else if (axiosError. request) {
      await modal.alerta({
        titulo: "Error de conexión",
        mensaje: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
      });
    } else {
      await modal.alerta({
        titulo: "Error inesperado",
        mensaje:  "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
      });
    }
  };

  async function removeArrayItem(
    key: 'educaciones' | 'experiencias' | 'habilidades' | 'idiomas',
    idx: number
  ) {
    const continuar = await modal.confirmacion({
      titulo: "Confirmar eliminación",
      mensaje: "¿Deseas eliminar este elemento? ",
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

  async function removeFuncion(expIdx: number, funcIdx: number) {
    const continuar = await modal.confirmacion({
      titulo: "Confirmar eliminación",
      mensaje: "¿Deseas eliminar esta función? ",
      textoAceptar: "Eliminar",
      textoCancelar: "Cancelar",
    });
    if (!continuar) return;

    setForm(prev => {
      const copia = JSON.parse(JSON.stringify(prev)) as FormCV;
      copia.experiencias[expIdx].funciones. splice(funcIdx, 1);
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
    const erroresFormateados = formatearErroresConEtiquetas(validarFormularioCompleto(3));
    setErrores(erroresFormateados);

    if (Object.keys(erroresFormateados).length > 0) {
      await modal.alerta({
        titulo: "Validación",
        mensaje: "Revisa los campos marcados antes de continuar.",
      });
      return;
    }

    try {
      setCargando(true);
      
      const formParaEnviar = {
        ...form,
        experiencias: form.experiencias.map(exp => ({
          ...exp,
          funciones: exp.funciones
            .map(f => f.descripcion.trim())
            .filter(desc => desc.length > 0)
            .join('; ')
        }))
      };
      
      const resp = await postGenerarCurriculum(formParaEnviar);
      if (resp.rutaPublica) {
        // ✅ Corregido: quitar el espacio antes de .pdf
        descargarArchivo(getAbsoluteUrl(resp.rutaPublica), 'curriculum.pdf');
        
        await modal.alerta({
          titulo: "¡Currículum generado!",
          mensaje: "Tu currículum se ha descargado correctamente.",
        });
      } else {
        throw new Error("No se pudo generar el PDF");
      }
    } catch (error: unknown) {
      await manejarErrorApi(error);
    } finally {
      setCargando(false);
    }
  }

  function validarFechasEducacion(educacion:  Educacion, index: number): ErrorMapa {
    const errores: ErrorMapa = {};
    const hoy = new Date();
    const fechaMinima = new Date(FECHA_MINIMA_CURRICULUM);

    if (educacion. fecha_fin) {
      const fechaFin = new Date(educacion. fecha_fin);
      if (fechaFin > hoy) errores[`educaciones.${index}.fecha_fin`] = 'La fecha no puede ser mayor a hoy';
      if (fechaFin < fechaMinima) errores[`educaciones.${index}.fecha_fin`] = `La fecha no puede ser anterior a ${FECHA_MINIMA_CURRICULUM}`;
    }
    return errores;
  }

  function validarFechasExperiencia(experiencia:  Experiencia, index: number): ErrorMapa {
    const errores: ErrorMapa = {};
    const hoy = new Date();
    const fechaMinima = new Date(FECHA_MINIMA_CURRICULUM);

    if (experiencia.periodo_inicio) {
      const fechaInicio = new Date(experiencia. periodo_inicio);
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

  const etiquetasCampo:  Record<string, string> = {
    'datosPersonales.nombreCompleto':  'Nombre completo',
    'datosPersonales.correo': 'Correo electrónico',
    'datosPersonales.telefono': 'Teléfono',
    resumenProfesional: 'Resumen profesional',
    'educaciones.tipo': 'Tipo de educación',
    'educaciones.institucion': 'Institución',
    'educaciones.titulo': 'Título obtenido',
    'educaciones.fecha_fin': 'Fecha finalización',
    'experiencias.empresa': 'Empresa',
    'experiencias.puesto': 'Puesto',
    'experiencias.periodo_inicio': 'Fecha inicio',
    'experiencias.periodo_fin': 'Fecha fin',
    'experiencias.funciones': 'Funciones',
    'experiencias.funciones.descripcion': 'Función',
    'experiencias.referencias. nombre': 'Nombre',
    'experiencias.referencias. contacto': 'Teléfono',
    'experiencias.referencias.correo': 'Correo',
    'experiencias.referencias. relacion': 'Relación',
    'habilidades.descripcion': 'Descripción de habilidad',
    'idiomas.nombre': 'Nombre del idioma',
    'idiomas.nivel': 'Nivel',
  };

  function obtenerEtiquetaDeClave(clave: string): string {
    const claveNormalizada = clave.replace(/\.\d+/g, '. ').replace(/\.$/, '');
    if (etiquetasCampo[claveNormalizada]) return etiquetasCampo[claveNormalizada];
    const partes = clave.split('.');
    const ultima = partes[partes.length - 1] ??  clave;
    return ultima.replace(/[_-]/g, ' ').replace(/\b\w/g, letra => letra.toUpperCase());
  }

  function formatearErroresConEtiquetas(errores:  ErrorMapa | Record<string, string[]> = {}): ErrorMapa {
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
  const getDescribedBy = (key: string) => (errores[key] ? `${key. replace(/[^\w-]/g, '_')}_err` : undefined);

  const fotoPerfilUrl = usuario?.fotoPerfil?. ruta_imagen
    ? getAbsoluteUrl(usuario. fotoPerfil.ruta_imagen)
    : FotoXDefecto;

  return (
    <PpLayout userPermisos={userPermisos}>
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#034991] transition-colors duration-200 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver al Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[#034991]">Generación de Currículum</h1>
        <div className="w-[180px]"></div>
      </div>

      {/* Banner con información del usuario */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#034991] rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {usuario?.fotoPerfil?.ruta_imagen ?  (
                <img
                  src={fotoPerfilUrl}
                  alt="Foto de perfil"
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="bg-[#034991] text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl shadow-md border-4 border-white">
                  {usuario?.nombre_completo?. split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?? '}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Creando currículum para: </p>
              <p className="text-xl font-bold text-gray-900 mt-1">{usuario?.nombre_completo || 'Usuario'}</p>
              <p className="text-sm text-gray-600 mt-0.5">{usuario?.correo || ''}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#034991]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Cédula</p>
              <p className="text-base font-bold text-gray-900">
                {usuario?.cedula || 'No disponible'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 text-gray-900">
        {/* Indicador de pasos */}
        <div className="flex items-center justify-between mb-6">
          {[
            { num: 1, label: 'Datos Personales' },
            { num: 2, label: 'Educación' },
            { num: 3, label: 'Experiencia' },
            { num: 4, label: 'Certificaciones y Habilidades' }
          ].map((p) => (
            <div key={p.num} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  paso === p.num
                    ? 'bg-[#034991] text-white'
                    : paso > p.num
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {paso > p.num ? '✓' : p.num}
              </div>
              <span className="ml-2 text-sm font-medium">{p.label}</span>
            </div>
          ))}
        </div>

        {/* PASO 1: Perfil Profesional */}
        {paso === 1 && (
          <section className="grid grid-cols-2 gap-4">
            {/* Nombre completo */}
            <div className="float-label-input">
              <input
                id="dp_nombreCompleto"
                className="peer"
                placeholder=" "
                value={form.datosPersonales.nombreCompleto}
                onChange={e => setCampo('datosPersonales. nombreCompleto', e.target. value)}
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
                onChange={e => setCampo('datosPersonales.correo', e. target.value)}
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

            {/* LinkedIn */}
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
                <span className="text-xs text-gray-500 ml-2">(Opcional - Recomendado para ATS)</span>
              </label>
              <input
                id="linkedin"
                type="text"
                placeholder="https://linkedin.com/in/tu-perfil"
                value={form.datosPersonales.linkedin || ''}
                onChange={(e) => setForm({
                  ...form,
                  datosPersonales: {
                    ...form.datosPersonales,
                    linkedin: e.target.value
                  }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores['datosPersonales.linkedin'] ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errores['datosPersonales.linkedin'] && (
                <p className="text-red-500 text-xs mt-1">{errores['datosPersonales.linkedin']}</p>
              )}
            </div>

            {/* GitHub */}
            <div>
              <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
                GitHub
                <span className="text-xs text-gray-500 ml-2">(Opcional - Ideal para roles técnicos)</span>
              </label>
              <input
                id="github"
                type="text"
                placeholder="https://github.com/tu-usuario"
                value={form.datosPersonales.github || ''}
                onChange={(e) => setForm({
                  ...form,
                  datosPersonales: {
                    ...form.datosPersonales,
                    github: e.target.value
                  }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores['datosPersonales.github'] ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errores['datosPersonales.github'] && (
                <p className="text-red-500 text-xs mt-1">{errores['datosPersonales.github']}</p>
              )}
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
                      checked={!! form.incluirFotoPerfil}
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
                      : "No tienes una foto de perfil configurada.  Se usará una imagen por defecto."}
                  </p>
                  {! usuario?.fotoPerfil?.ruta_imagen && (
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
                className={`peer ${(form.resumenProfesional ??  '').trim() ? 'has-value' : ''}`}
                placeholder=" "
                maxLength={1000}
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

        {/* PASO 2: Formación Académica */}
        {paso === 2 && (
          <section>
            <Button
              variant="outline"
              onClick={() => {
                setForm(prev => ({
                  ...prev,
                  educaciones: [...prev.educaciones, { tipo: '', institucion: '', titulo: '', fecha_fin: '' }]
                }));
              }}
              className="mb-2"
            >
              + Agregar educación ({form.educaciones.length})
            </Button>

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

                <div className="grid grid-cols-1 gap-3">
                  {/* Tipo de Educación */}
                  <div className="float-label-input">
                    <select
                      id={`ed_${i}_tipo`}
                      className={`peer ${ed.tipo ? 'has-value' :  ''}`}
                      value={ed.tipo}
                      onChange={e => setCampo(`educaciones.${i}.tipo`, e.target.value)}
                      aria-invalid={getAriaInvalid(`educaciones.${i}.tipo`)}
                      aria-describedby={getDescribedBy(`educaciones.${i}.tipo`)}
                    >
                      <option value="">Seleccione un tipo...</option>
                      <option value="Título">Título</option>
                      <option value="Diplomado">Diplomado</option>
                      <option value="Bachillerato">Bachillerato</option>
                      <option value="Bachillerato Universitario">Bachillerato Universitario</option>
                      <option value="Licenciatura">Licenciatura</option>
                      <option value="Maestría">Maestría</option>
                    </select>
                    <label htmlFor={`ed_${i}_tipo`}>Tipo de educación</label>
                    {errores[`educaciones.${i}.tipo`] && (
                      <p id={`educaciones_${i}_tipo_err`} className="text-red-600 text-sm mt-1">
                        {errores[`educaciones.${i}.tipo`]}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
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
                        maxLength={150}
                      />
                      <label htmlFor={`ed_${i}_institucion`}>Institución</label>
                      {errores[`educaciones.${i}.institucion`] && (
                        <p id={`educaciones_${i}_institucion_err`} className="text-red-600 text-sm mt-1">
                          {errores[`educaciones.${i}.institucion`]}
                        </p>
                      )}
                    </div>

                    {/* Fecha finalización */}
                    <div className="float-label-input">
                      <input
                        id={`ed_${i}_fecha_fin`}
                        className={`peer ${ed.fecha_fin ? 'has-value' : ''}`}
                        type="date"
                        placeholder=" "
                        min={FECHA_MINIMA_CURRICULUM}
                        max={new Date().toISOString().split('T')[0]}
                        value={ed.fecha_fin ??  ''}
                        onChange={e => setCampo(`educaciones.${i}.fecha_fin`, e.target.value)}
                        aria-invalid={getAriaInvalid(`educaciones.${i}.fecha_fin`)}
                        aria-describedby={getDescribedBy(`educaciones.${i}.fecha_fin`)}
                      />
                      <label htmlFor={`ed_${i}_fecha_fin`}>Fecha finalización</label>
                      {errores[`educaciones.${i}.fecha_fin`] && (
                        <p id={`educaciones_${i}_fecha_fin_err`} className="text-red-600 text-sm mt-1">
                          {errores[`educaciones.${i}.fecha_fin`]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Título obtenido - Campo ancho completo */}
                  <div className="float-label-input">
                    <input
                      id={`ed_${i}_titulo`}
                      className={`peer ${ed.titulo ? 'has-value' : ''}`}
                      placeholder=" "
                      value={ed.titulo}
                      onChange={e => setCampo(`educaciones.${i}.titulo`, e.target.value)}
                      aria-invalid={getAriaInvalid(`educaciones.${i}.titulo`)}
                      aria-describedby={getDescribedBy(`educaciones.${i}.titulo`)}
                      maxLength={150}
                    />
                    <label htmlFor={`ed_${i}_titulo`}>Título obtenido</label>
                    {errores[`educaciones.${i}.titulo`] && (
                      <p id={`educaciones_${i}_titulo_err`} className="text-red-600 text-sm mt-1">
                        {errores[`educaciones.${i}.titulo`]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* PASO 3: Experiencia Profesional */}
        {paso === 3 && (
          <section>
            <Button
              variant="outline"
              onClick={() => {
                setForm(prev => ({
                  ...prev,
                  experiencias: [...prev.experiencias, {
                    empresa: '',
                    puesto:  '',
                    periodo_inicio: '',
                    periodo_fin: '',
                    funciones: [],
                    referencias: []
                  }]
                }));
              }}
              className="mb-2"
            >
              + Agregar experiencia laboral ({form.experiencias.length})
            </Button>

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
                      className={`peer ${ex.empresa ? 'has-value' :  ''}`}
                      placeholder=" "
                      value={ex. empresa}
                      onChange={e => setCampo(`experiencias.${i}.empresa`, e.target.value)}
                      aria-invalid={getAriaInvalid(`experiencias.${i}.empresa`)}
                      aria-describedby={getDescribedBy(`experiencias.${i}.empresa`)}
                      maxLength={120}
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
                      maxLength={100}
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
                      disabled={ex.trabajando_actualmente ?? false}
                    />
                    <label htmlFor={`ex_${i}_periodo_fin`}>Fecha fin</label>
                  </div>
                </div>

                {/* Checkbox: Trabajo actualmente aquí */}
                <div className="flex items-center gap-2 mb-3">
                  <input
                    id={`ex_${i}_trabajando_actualmente`}
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    checked={ex.trabajando_actualmente ?? false}
                    onChange={e => {
                      const trabajandoActualmente = e.target.checked;
                      setCampo(`experiencias.${i}.trabajando_actualmente`, trabajandoActualmente);
                      if (trabajandoActualmente) {
                        setCampo(`experiencias.${i}.periodo_fin`, '');
                      }
                    }}
                  />
                  <label 
                    htmlFor={`ex_${i}_trabajando_actualmente`}
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Trabajo actualmente aquí
                  </label>
                </div>

                {/* Sección de Funciones */}
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">
                      Funciones del puesto
                    </label>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        const nuevasFunciones = [... (ex.funciones || []), { descripcion: '' }];
                        setCampo(`experiencias.${i}.funciones`, nuevasFunciones);
                      }}
                      disabled={(ex.funciones?. length || 0) >= MAX_FUNCIONES_POR_EXPERIENCIA}
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
                            aria-invalid={getAriaInvalid(`experiencias.${i}.funciones. ${fIdx}. descripcion`)}
                            aria-describedby={getDescribedBy(`experiencias.${i}.funciones.${fIdx}. descripcion`)}
                            maxLength={250}
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

                  {(! ex.funciones || ex.funciones.length === 0) && (
                    <p className="text-sm text-gray-500 italic">
                      No hay funciones agregadas.  Haz clic en "+ Agregar función" para comenzar.
                    </p>
                  )}

                  {errores[`experiencias.${i}.funciones`] && (
                    <p id={`experiencias_${i}_funciones_err`} className="text-red-600 text-sm mt-2">
                      {errores[`experiencias.${i}.funciones`]}
                    </p>
                  )}
                </div>

                {/* Sección de Referencias */}
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">
                      Referencias de esta experiencia
                    </label>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        const nuevasReferencias = [...(ex. referencias || []), { nombre: '', contacto: '', correo: '', relacion: '' }];
                        setCampo(`experiencias.${i}.referencias`, nuevasReferencias);
                      }}
                      disabled={(ex.referencias?.length || 0) >= 3}
                      title={(ex. referencias?.length || 0) >= 3 
                        ? 'Máximo 3 referencias por experiencia' 
                        :  'Agregar referencia'}
                      className="text-xs"
                    >
                      + Agregar referencia ({ex.referencias?.length || 0}/3)
                    </Button>
                  </div>

                  {(! ex.referencias || ex.referencias. length === 0) ? (
                    <p className="text-sm text-gray-500 italic">
                      No hay referencias agregadas para esta experiencia. Son opcionales.
                    </p>
                  ) : (
                    ex.referencias.map((ref, rIdx) => (
                      <div key={rIdx} className="mb-3 p-3 bg-white rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Referencia {rIdx + 1}</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              const continuar = await modal.confirmacion({
                                titulo: "Confirmar eliminación",
                                mensaje: "¿Deseas eliminar esta referencia?",
                                textoAceptar: "Eliminar",
                                textoCancelar: "Cancelar",
                              });
                              if (! continuar) return;

                              setForm(prev => {
                                const copia = JSON.parse(JSON.stringify(prev)) as FormCV;
                                copia.experiencias[i].referencias. splice(rIdx, 1);
                                return copia;
                              });
                            }}
                            aria-label={`Eliminar referencia ${rIdx + 1}`}
                          >
                            Eliminar
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {/* Nombre */}
                          <div className="float-label-input">
                            <input
                              id={`exp_${i}_ref_${rIdx}_nombre`}
                              className={`peer ${ref.nombre ? 'has-value' : ''}`}
                              placeholder=" "
                              maxLength={80}
                              value={ref. nombre}
                              onChange={e => {
                                const nuevasReferencias = [...ex. referencias];
                                nuevasReferencias[rIdx] = { ... nuevasReferencias[rIdx], nombre: e.target.value };
                                setCampo(`experiencias.${i}.referencias`, nuevasReferencias);
                              }}
                              aria-invalid={getAriaInvalid(`experiencias.${i}.referencias.${rIdx}.nombre`)}
                              aria-describedby={getDescribedBy(`experiencias.${i}.referencias.${rIdx}.nombre`)}
                            />
                            <label htmlFor={`exp_${i}_ref_${rIdx}_nombre`}>Nombre completo</label>
                            {errores[`experiencias.${i}.referencias.${rIdx}.nombre`] && (
                              <p id={`experiencias_${i}_referencias_${rIdx}_nombre_err`} className="text-red-600 text-xs mt-1">
                                {errores[`experiencias.${i}.referencias.${rIdx}.nombre`]}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Teléfono */}
                            <div className="float-label-input">
                              <input
                                id={`exp_${i}_ref_${rIdx}_contacto`}
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]{8}"
                                maxLength={8}
                                className={`peer ${ref.contacto ? 'has-value' :  ''}`}
                                placeholder=" "
                                value={ref. contacto}
                                onChange={(e) => {
                                  const limpio = solo8Digitos(e.target.value);
                                  const nuevasReferencias = [...ex.referencias];
                                  nuevasReferencias[rIdx] = { ...nuevasReferencias[rIdx], contacto: limpio };
                                  setCampo(`experiencias.${i}.referencias`, nuevasReferencias);
                                }}
                                aria-invalid={getAriaInvalid(`experiencias.${i}.referencias.${rIdx}.contacto`)}
                                aria-describedby={getDescribedBy(`experiencias.${i}.referencias.${rIdx}.contacto`)}
                              />
                              <label htmlFor={`exp_${i}_ref_${rIdx}_contacto`}>Teléfono (8 dígitos)</label>
                              {errores[`experiencias.${i}.referencias. ${rIdx}.contacto`] && (
                                <p id={`experiencias_${i}_referencias_${rIdx}_contacto_err`} className="text-red-600 text-xs mt-1">
                                  {errores[`experiencias.${i}.referencias.${rIdx}. contacto`]}
                                </p>
                              )}
                            </div>

                            {/* Correo */}
                            <div className="float-label-input">
                              <input
                                id={`exp_${i}_ref_${rIdx}_correo`}
                                type="email"
                                className={`peer ${ref.correo ? 'has-value' : ''}`}
                                placeholder=" "
                                maxLength={255}
                                value={ref. correo || ''}
                                onChange={e => {
                                  const nuevasReferencias = [...ex. referencias];
                                  nuevasReferencias[rIdx] = { ...nuevasReferencias[rIdx], correo: e. target.value };
                                  setCampo(`experiencias.${i}.referencias`, nuevasReferencias);
                                }}
                                aria-invalid={getAriaInvalid(`experiencias.${i}.referencias.${rIdx}. correo`)}
                                aria-describedby={getDescribedBy(`experiencias.${i}.referencias.${rIdx}.correo`)}
                              />
                              <label htmlFor={`exp_${i}_ref_${rIdx}_correo`}>Correo (opcional)</label>
                              {errores[`experiencias.${i}.referencias.${rIdx}.correo`] && (
                                <p id={`experiencias_${i}_referencias_${rIdx}_correo_err`} className="text-red-600 text-xs mt-1">
                                  {errores[`experiencias.${i}.referencias.${rIdx}.correo`]}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Relación */}
                          <div className="float-label-input">
                            <input
                              id={`exp_${i}_ref_${rIdx}_relacion`}
                              className={`peer ${ref.relacion ? 'has-value' : ''}`}
                              placeholder=" "
                              maxLength={50}
                              value={ref. relacion}
                              onChange={e => {
                                const nuevasReferencias = [...ex.referencias];
                                nuevasReferencias[rIdx] = { ...nuevasReferencias[rIdx], relacion: e.target.value };
                                setCampo(`experiencias.${i}.referencias`, nuevasReferencias);
                              }}
                              aria-invalid={getAriaInvalid(`experiencias.${i}.referencias.${rIdx}.relacion`)}
                              aria-describedby={getDescribedBy(`experiencias.${i}.referencias.${rIdx}.relacion`)}
                            />
                            <label htmlFor={`exp_${i}_ref_${rIdx}_relacion`}>Relación (ej:  Supervisor, Jefe directo)</label>
                            {errores[`experiencias.${i}.referencias.${rIdx}.relacion`] && (
                              <p id={`experiencias_${i}_referencias_${rIdx}_relacion_err`} className="text-red-600 text-xs mt-1">
                                {errores[`experiencias.${i}.referencias.${rIdx}.relacion`]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
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

        {/* PASO 4: Certificaciones y Habilidades */}
        {paso === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Paso 4: Certificaciones y Habilidades</h3>
              <p className="text-sm text-gray-600 mb-4">
                Las certificaciones son clave para sistemas ATS. Separaremos habilidades técnicas de competencias blandas.
              </p>
            </div>

            {/* ⭐ CERTIFICACIONES */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Certificaciones y Cursos</h4>
                <Button
                  type="button"
                  onClick={() => {
                    setForm({
                      ...form,
                      certificaciones: [...form.certificaciones, { nombre: '', institucion: '', fecha_obtencion: '' }]
                    });
                  }}
                  className="text-sm"
                >
                  + Agregar Certificación
                </Button>
              </div>

              {form.certificaciones.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay certificaciones agregadas</p>
              ) : (
                <div className="space-y-4">
                  {form.certificaciones.map((cert, index) => (
                    <div key={index} className="bg-white p-4 rounded border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-semibold text-gray-700">Certificación {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const nuevas = form.certificaciones.filter((_, i) => i !== index);
                            setForm({ ...form, certificaciones: nuevas });
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Nombre de la certificación */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de la certificación *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: AWS Solutions Architect, Scrum Master, etc."
                            value={cert.nombre}
                            onChange={(e) => {
                              const nuevas = [...form.certificaciones];
                              nuevas[index].nombre = e.target.value;
                              setForm({ ...form, certificaciones: nuevas });
                            }}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errores[`certificaciones.${index}.nombre`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errores[`certificaciones.${index}.nombre`] && (
                            <p className="text-red-500 text-xs mt-1">{errores[`certificaciones.${index}.nombre`]}</p>
                          )}
                        </div>

                        {/* Institución */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Institución emisora
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Amazon Web Services, Scrum Alliance"
                            value={cert.institucion || ''}
                            onChange={(e) => {
                              const nuevas = [...form.certificaciones];
                              nuevas[index].institucion = e.target.value;
                              setForm({ ...form, certificaciones: nuevas });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        {/* Fecha de obtención */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de obtención
                          </label>
                          <input
                            type="date"
                            value={cert.fecha_obtencion || ''}
                            onChange={(e) => {
                              const nuevas = [...form.certificaciones];
                              nuevas[index].fecha_obtencion = e.target.value;
                              setForm({ ...form, certificaciones: nuevas });
                            }}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errores[`certificaciones.${index}.fecha_obtencion`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errores[`certificaciones.${index}.fecha_obtencion`] && (
                            <p className="text-red-500 text-xs mt-1">{errores[`certificaciones.${index}.fecha_obtencion`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ⭐ HABILIDADES TÉCNICAS */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Habilidades Técnicas</h4>
                  <p className="text-xs text-gray-600">Lenguajes, frameworks, herramientas, tecnologías</p>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setForm({
                      ...form,
                      habilidadesTecnicas: [...form.habilidadesTecnicas, { descripcion: '' }]
                    });
                  }}
                  className="text-sm"
                >
                  + Agregar
                </Button>
              </div>

              {form.habilidadesTecnicas.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay habilidades técnicas agregadas</p>
              ) : (
                <div className="space-y-2">
                  {form.habilidadesTecnicas.map((hab, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ej: React, TypeScript, Laravel, Docker"
                        value={hab.descripcion}
                        onChange={(e) => {
                          const nuevas = [...form.habilidadesTecnicas];
                          nuevas[index].descripcion = e.target.value;
                          setForm({ ...form, habilidadesTecnicas: nuevas });
                        }}
                        className={`flex-1 px-3 py-2 border rounded-md ${
                          errores[`habilidadesTecnicas.${index}.descripcion`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nuevas = form.habilidadesTecnicas.filter((_, i) => i !== index);
                          setForm({ ...form, habilidadesTecnicas: nuevas });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ⭐ HABILIDADES BLANDAS */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Competencias Profesionales (Habilidades Blandas)</h4>
                  <p className="text-xs text-gray-600">Liderazgo, trabajo en equipo, comunicación, etc.</p>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setForm({
                      ...form,
                      habilidadesBlandas: [...form.habilidadesBlandas, { descripcion: '' }]
                    });
                  }}
                  className="text-sm"
                >
                  + Agregar
                </Button>
              </div>

              {form.habilidadesBlandas.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay competencias agregadas</p>
              ) : (
                <div className="space-y-2">
                  {form.habilidadesBlandas.map((hab, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ej: Liderazgo de equipos, Resolución de conflictos"
                        value={hab.descripcion}
                        onChange={(e) => {
                          const nuevas = [...form.habilidadesBlandas];
                          nuevas[index].descripcion = e.target.value;
                          setForm({ ...form, habilidadesBlandas: nuevas });
                        }}
                        className={`flex-1 px-3 py-2 border rounded-md ${
                          errores[`habilidadesBlandas.${index}.descripcion`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nuevas = form.habilidadesBlandas.filter((_, i) => i !== index);
                          setForm({ ...form, habilidadesBlandas: nuevas });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Idiomas */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Idiomas</h4>
                <Button
                  type="button"
                  onClick={() => {
                    setForm({
                      ...form,
                      idiomas: [...form.idiomas, { nombre: '', nivel: '' }]
                    });
                  }}
                  className="text-sm"
                >
                  + Agregar Idioma
                </Button>
              </div>

              {form.idiomas.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay idiomas agregados</p>
              ) : (
                <div className="space-y-3">
                  {form.idiomas.map((idioma, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <input
                        type="text"
                        placeholder="Ej: Inglés, Español"
                        value={idioma.nombre}
                        onChange={(e) => {
                          const nuevos = [...form.idiomas];
                          nuevos[index].nombre = e.target.value;
                          setForm({ ...form, idiomas: nuevos });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <select
                        value={idioma.nivel}
                        onChange={(e) => {
                          const nuevos = [...form.idiomas];
                          nuevos[index].nivel = e.target.value as any;
                          setForm({ ...form, idiomas: nuevos });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Selecciona nivel</option>
                        <option value="A1">A1 - Básico</option>
                        <option value="A2">A2 - Elemental</option>
                        <option value="B1">B1 - Intermedio</option>
                        <option value="B2">B2 - Intermedio Alto</option>
                        <option value="C1">C1 - Avanzado</option>
                        <option value="C2">C2 - Maestría</option>
                        <option value="Nativo">Nativo</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const nuevos = form.idiomas.filter((_, i) => i !== index);
                          setForm({ ...form, idiomas: nuevos });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="mt-6 flex justify-between">
          {paso > 1 ?  (
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
              className="bg-[#034991] hover: bg-[#023970]"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={generar}
              disabled={botonGenerarDeshabilitado}
              title={! formularioCompleto ? "Completa las habilidades e idiomas agregados." : undefined}
              className="bg-[#CD1719] hover:bg-[#A01315]"
            >
              {cargando ? "Generando..." : "Generar y Descargar"}
            </Button>
          )}
        </div>

        {/* Botón flotante de Vista Previa */}
        <button
          onClick={() => setMostrarVistaPrevia(true)}
          className="fixed bottom-6 right-6 bg-[#034991] hover:bg-[#023970] text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl z-40 group"
          title="Ver vista previa del currículum"
          aria-label="Abrir vista previa del currículum"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-7 w-7 transition-transform group-hover:rotate-12" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
            />
          </svg>
          
          {/* Tooltip */}
          <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <span className="bg-gray-900 text-white text-xs rounded py-1 px-3 whitespace-nowrap">
              Vista Previa
            </span>
          </span>
        </button>

        {/* Modal de Vista Previa */}
        <ModalVistaPreviaCurriculum
          isOpen={mostrarVistaPrevia}
          onClose={() => setMostrarVistaPrevia(false)}
          datos={form}
          fotoPerfilUrl={fotoPerfilUrl}
        />
      </div>
    </PpLayout>
  );
}