// resources/js/pages/Frt_FormularioGeneracionCurriculum.tsx

import React, { useMemo, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import PpLayout from '../layouts/PpLayout';
import { validarPaso, ErrorMapa } from '../components/Frt_ValidacionClienteGeneracionCurriculum';
import { postGenerarCurriculum } from '../services/curriculumService';
import Frt_VistaPreviaCurriculum from '../pages/Frt_VistaPreviaCurriculum';
import { useModal } from '../hooks/useModal';
import FotoXDefecto from '../assets/FotoXDefecto.png'; // NUEVO: imagen por defecto

// ================== Tipos ==================
type Educacion = {
  institucion: string;
  titulo: string;
  fecha_inicio?: string;
  fecha_fin?: string;
};

type Experiencia = {
  empresa: string;
  puesto: string;
  periodo_inicio?: string;
  periodo_fin?: string;
  funciones?: string;
};

type Habilidad = { descripcion: string };

type Idioma = {
  nombre: string;
  nivel: '' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Nativo';
};

type Referencia = { nombre: string; contacto: string; relacion: string };

type FormCV = {
  usuarioId: number;
  datosPersonales: {
    nombreCompleto: string;
    correo: string;
    telefono: string;
  };
  resumenProfesional: string;
  educaciones: Educacion[];
  experiencias: Experiencia[];
  habilidades: Habilidad[];
  idiomas: Idioma[];
  referencias: Referencia[];
  incluirFotoPerfil?: boolean; // NUEVO: bandera para incluir foto
  [key: string]: any;
};

type UsuarioActual = {
  id_usuario:number;
  nombre_completo:string;
  correo:string;
  telefono?:string;
  fotoPerfil?: { ruta_imagen: string } | null; // NUEVO: foto de perfil
};

// NUEVO: Tipado de props de página
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
  usuario?: UsuarioActual; // Nuevo campo
  [key: string]: unknown; // <- requerido por Inertia PageProps
}
// ===========================================================

// ================== Utilidades locales (sin diálogos nativos) ==================
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
// ==============================================================================

export default function Frt_FormularioGeneracionCurriculum() {
  const page = usePage<PageProps>();
  const userPermisos = page.props.userPermisos ?? [];

  const modal = useModal();

  // Actualizado: preferir page.props.usuario y luego caer a auth.user
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
    incluirFotoPerfil: false, // NUEVO: valor por defecto
  }), [usuario]);

  const [form, setForm] = useState<FormCV>(prefill);
  const [paso, setPaso] = useState<number>(1);
  const [errores, setErrores] = useState<ErrorMapa>({});
  const [rutaPdf, setRutaPdf] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [mostrarBtnDashboard, setMostrarBtnDashboard] = useState<boolean>(false);

  const paso4Completo = useMemo(() => {
    const habilidadesOk = form.habilidades.every(h => {
      const desc = (h.descripcion ?? '').trim();
      return desc && desc.length <= 20;
    });
    const idiomasOk = form.idiomas.every(i => {
      const nombre = (i.nombre ?? '').trim();
      const nivel = (i.nivel ?? '').trim();
      return nombre && nombre.length <= 15 && nivel;
    });
    const referenciasOk = form.referencias.every(r => {
      const nombre = (r.nombre ?? '').trim();
      const contacto = solo8Digitos(r.contacto ?? '');
      const relacion = (r.relacion ?? '').trim();
      return (
        nombre && nombre.length <= 30 &&
        contacto.length === 8 &&
        relacion && relacion.length <= 30
      );
    });
    return habilidadesOk && idiomasOk && referenciasOk;
  }, [form]); // <- antes: [form.habilidades, form.idiomas, form.referencias]

  const botonGenerarDeshabilitado = cargando || !paso4Completo;

  // ================== Helpers ==================
  function setCampo(path: string, value: any) {
    setForm(prevForm => {
      const newForm = {...prevForm};
      let current: any = newForm;
      const parts = path.split('.');
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
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

  // === NUEVO: utilidades para validar por reglas declarativas ===
  type Regla = {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    // validate(value, ctx): boolean => true OK, false o string => error
    validate?: (value: any, ctx?: any) => boolean | string;
  };

  function validarCampoSegunReglas(
    valor: any,
    reglas: Regla,
    etiqueta: string,
    ctx?: any
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

  function recolectarErroresFechas(formActual: FormCV): ErrorMapa {
    const errs: ErrorMapa = {};
    formActual.educaciones.forEach((e,i)=>Object.assign(errs, validarFechasEducacion(e,i)));
    formActual.experiencias.forEach((e,i)=>Object.assign(errs, validarFechasExperiencia(e,i)));
    return errs;
  }

  function validarColecciones(formActual: FormCV): ErrorMapa {
    const errs: ErrorMapa = {};

    // EDUCACIÓN - validar en paso 2
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

    // EXPERIENCIA - validar en paso 3
    formActual.experiencias.forEach((exp, i) => {
      let msg = validarCampoSegunReglas(exp.empresa, validacionesExperiencia.empresa, 'Empresa');
      if (msg) errs[`experiencias.${i}.empresa`] = msg;

      msg = validarCampoSegunReglas(exp.puesto, validacionesExperiencia.puesto, 'Puesto');
      if (msg) errs[`experiencias.${i}.puesto`] = msg;

      if (exp.funciones) {
        msg = validarCampoSegunReglas(exp.funciones, validacionesExperiencia.funciones, 'Funciones');
        if (msg) errs[`experiencias.${i}.funciones`] = msg;
      }

      // Validar SIEMPRE fechas de experiencia (requeridas)
      msg = validarCampoSegunReglas(exp.periodo_inicio, validacionesExperiencia.periodo_inicio, 'Fecha inicio');
      if (msg) errs[`experiencias.${i}.periodo_inicio`] = msg;

      msg = validarCampoSegunReglas(
        exp.periodo_fin,
        validacionesExperiencia.periodo_fin,
        'Fecha fin',
        { periodo_inicio: exp.periodo_inicio }
      );
      if (msg) errs[`experiencias.${i}.periodo_fin`] = msg;
    });

    // HABILIDADES (solo si hay texto)
    formActual.habilidades.forEach((h, i) => {
      const desc = (h.descripcion ?? '').trim();
      if (desc) {
        const msg = validarCampoSegunReglas(desc, validacionesHabilidad.descripcion, 'Descripción de habilidad');
        if (msg) errs[`habilidades.${i}.descripcion`] = msg;
      }
    });

    // IDIOMAS (solo si usuario escribe nombre o selecciona nivel)
    formActual.idiomas.forEach((id, i) => {
      const nom = (id.nombre ?? '').trim();
      const niv = (id.nivel ?? '').trim();

      if (nom) {
        const msgNom = validarCampoSegunReglas(nom, validacionesIdioma.nombre, 'Nombre del idioma');
        if (msgNom) errs[`idiomas.${i}.nombre`] = msgNom;
      }
      if (niv) {
        const msgNiv = validarCampoSegunReglas(niv, { validate: validacionesIdioma.nivel.validate }, 'Nivel');
        if (msgNiv) errs[`idiomas.${i}.nivel`] = msgNiv;
      }
    });

    // REFERENCIAS (solo si se escribe algo en la fila)
    formActual.referencias.forEach((r, i) => {
      const nom = (r.nombre ?? '').trim();
      const tel = (r.contacto ?? '').trim();
      const rel = (r.relacion ?? '').trim();

      if (nom) {
        const msgNom = validarCampoSegunReglas(nom, validacionesReferencia.nombre, 'Nombre');
        if (msgNom) errs[`referencias.${i}.nombre`] = msgNom;
      }
      if (tel) {
        const msgTel = validarCampoSegunReglas(tel, validacionesReferencia.contacto, 'Teléfono');
        if (msgTel) errs[`referencias.${i}.contacto`] = msgTel;
      }
      if (rel) {
        const msgRel = validarCampoSegunReglas(rel, validacionesReferencia.relacion, 'Relación');
        if (msgRel) errs[`referencias.${i}.relacion`] = msgRel;
      }
    });

    return errs;
  }

  const manejarErrorApi = async (error: any) => {
    if (error?.response?.status === 422) {
      setErrores(formatearErroresConEtiquetas(error.response.data?.errors));
      return;
    }
    await modal.alerta({
      titulo: "Error",
      mensaje: error?.response?.data?.message || "Ocurrió un error al procesar la solicitud.",
    });
  };

  async function removeArrayItem(
    key: 'educaciones' | 'experiencias' | 'habilidades' | 'idiomas' | 'referencias',
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
      const copia = structuredClone(prev) as FormCV;
      (copia[key] as any[]).splice(idx, 1);
      return copia;
    });
  }

  async function siguiente() {
    const eBase = validarPaso(form, paso);
    const eTel = validarTelefonosLocales(form, paso);
    const eFechas = recolectarErroresFechas(form);
    const eColecciones = validarColecciones(form);
    const e: ErrorMapa = { ...eBase, ...eTel, ...eFechas, ...eColecciones };

    if (paso === 1) {
      if (!(form.resumenProfesional ?? '').trim()) {
        e['resumenProfesional'] = 'Campo requerido: Resumen profesional';
      } else if ((form.resumenProfesional ?? '').length > 600) {
        e['resumenProfesional'] = 'Máximo 600 caracteres.';
      }
      // Datos personales: validación explícita según reglas
      let msg = validarCampoSegunReglas(form.datosPersonales.nombreCompleto, validacionesDatosPersonales.nombreCompleto, 'Nombre completo');
      if (msg) e['datosPersonales.nombreCompleto'] = msg;

      msg = validarCampoSegunReglas(form.datosPersonales.correo, validacionesDatosPersonales.correo, 'Correo electrónico');
      if (msg) e['datosPersonales.correo'] = msg;

      if ((form.datosPersonales.telefono ?? '').trim()) {
        msg = validarCampoSegunReglas(form.datosPersonales.telefono, validacionesDatosPersonales.telefono, 'Teléfono');
        if (msg) e['datosPersonales.telefono'] = msg;
      }
    }

    const erroresFormateados = formatearErroresConEtiquetas(e);
    setErrores(erroresFormateados);
    if (Object.keys(erroresFormateados).length === 0) setPaso(paso + 1);
  }

  function anterior() { setPaso(paso - 1); }

  async function generar() {
    const eBase = validarPaso(form, paso);
    const eTelPaso = validarTelefonosLocales(form, paso);
    const eTelDP = validarTelefonosLocales(form, 1);
    const eFechas = recolectarErroresFechas(form);
    const eColecciones = validarColecciones(form);

    const e: ErrorMapa = { ...eBase, ...eTelPaso, ...eTelDP, ...eFechas, ...eColecciones };

    if (!(form.resumenProfesional ?? '').trim()) {
      e['resumenProfesional'] = 'Campo requerido: Resumen profesional';
    } else if ((form.resumenProfesional ?? '').length > 600) {
      e['resumenProfesional'] = 'Máximo 600 caracteres.';
    }

    // Datos personales
    let msg = validarCampoSegunReglas(form.datosPersonales.nombreCompleto, validacionesDatosPersonales.nombreCompleto, 'Nombre completo');
    if (msg) e['datosPersonales.nombreCompleto'] = msg;

    msg = validarCampoSegunReglas(form.datosPersonales.correo, validacionesDatosPersonales.correo, 'Correo electrónico');
    if (msg) e['datosPersonales.correo'] = msg;

    if ((form.datosPersonales.telefono ?? '').trim()) {
      msg = validarCampoSegunReglas(form.datosPersonales.telefono, validacionesDatosPersonales.telefono, 'Teléfono');
      if (msg) e['datosPersonales.telefono'] = msg;
    }

    const erroresFormateados = formatearErroresConEtiquetas(e);
    setErrores(erroresFormateados);

    // Debug rápido:
    console.log('Errores al generar:', erroresFormateados);

    if (Object.keys(erroresFormateados).length > 0) {
      await modal.alerta({
        titulo: "Validación",
        mensaje: "Revisa los campos marcados antes de continuar.",
      });
      return;
    }

    // Antes de generar, resetea el botón de Dashboard
    setMostrarBtnDashboard(false);

    try {
      setCargando(true);
      const resp = await postGenerarCurriculum(form);
      if (resp.rutaPublica) {
        setRutaPdf(resp.rutaPublica);
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
        // Tras la elección, mostrar el botón para volver al Dashboard
        setMostrarBtnDashboard(true);
      } else {
        throw new Error("No se pudo generar el PDF");
      }
    } catch (error: any) {
      await manejarErrorApi(error);
    } finally {
      setCargando(false);
    }
  }

  // === VALIDACIONES ACTUALIZADAS ===
  const validacionesDatosPersonales = {
    // permite letras, espacios, acentos, apóstrofos y guiones
    nombreCompleto: { required: true, minLength: 5, maxLength: 30, pattern: /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s'-]+$/ },
    // TLD 2–24
    correo: { required: true, pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,24}$/, maxLength: 255 },
    telefono: { required: false, pattern: /^[0-9]{8}$/ }
  };

  const validacionesEducacion = {
    institucion: { required: true, minLength: 3, maxLength: 50, pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()'-]+$/ },
    titulo: { required: true, minLength: 3, maxLength: 50, pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()'-]+$/ },
    fecha_inicio: { required: true, validate: (value: string) => !value || new Date(value) <= new Date() },
    fecha_fin: { required: true, validate: (value: string, { fecha_inicio }: any) => !value || !fecha_inicio || new Date(value) >= new Date(fecha_inicio) }
  };

  const validacionesExperiencia = {
    empresa: { required: true, minLength: 3, maxLength: 30, pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()'-]+$/ },
    puesto: { required: true, minLength: 3, maxLength: 30, pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()'-]+$/ },
    funciones: { required: false, maxLength: 150 },
    // Ahora son requeridas
    periodo_inicio: { required: true, validate: (value: string) => !value || new Date(value) <= new Date() },
    periodo_fin: { required: true, validate: (value: string, { periodo_inicio }: any) => !value || !periodo_inicio || new Date(value) >= new Date(periodo_inicio) }
  };

// === VALIDACIONES (OPCIONAL) ===
const validacionesHabilidad = {
  // ya NO es required, pero mantiene min/max/pattern cuando hay valor
  descripcion: { required: false, minLength: 3, maxLength: 20, pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()'-]+$/ }
};

const validacionesIdioma = {
  // ambos opcionales; si se escribe nombre, valida; si se elige nivel, debe estar en el set
  nombre: { required: false, minLength: 2, maxLength: 15, pattern: /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+$/ },
  nivel:  { required: false, validate: (value: string) => ['A1','A2','B1','B2','C1','C2','Nativo'].includes(value) }
};

// relación/telefono/nombre OPCIONALES; si vienen, se validan (tel: 8 dígitos)
const validacionesReferencia = {
  nombre:   { required: false, minLength: 5, maxLength: 30, pattern: /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s'-]+$/ },
  contacto: { required: false, pattern: /^[0-9]{8}$/ },
  relacion: { required: false, maxLength: 30, pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()'-]+$/ }
};


  function validarFechasEducacion(educacion: Educacion, index: number): ErrorMapa {
    const errores: ErrorMapa = {};
    const hoy = new Date();
    const fechaMinima = new Date('1960-01-01');

    if (educacion.fecha_inicio) {
      const fechaInicio = new Date(educacion.fecha_inicio);
      if (fechaInicio > hoy) errores[`educaciones.${index}.fecha_inicio`] = 'La fecha no puede ser mayor a hoy';
      if (fechaInicio < fechaMinima) errores[`educaciones.${index}.fecha_inicio`] = 'La fecha no puede ser anterior a 1960';
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
    const fechaMinima = new Date('1960-01-01');

    if (experiencia.periodo_inicio) {
      const fechaInicio = new Date(experiencia.periodo_inicio);
      if (fechaInicio > hoy) errores[`experiencias.${index}.periodo_inicio`] = 'La fecha no puede ser mayor a hoy';
      if (fechaInicio < fechaMinima) errores[`experiencias.${index}.periodo_inicio`] = 'La fecha no puede ser anterior a 1960';
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
    'habilidades.descripcion': 'Descripción de habilidad',
    'idiomas.nombre': 'Nombre del idioma',
    'idiomas.nivel': 'Nivel',
    'referencias.nombre': 'Nombre',
    'referencias.contacto': 'Teléfono',
    'referencias.relacion': 'Relación',
  };

  function obtenerEtiquetaDeClave(clave: string): string {
    const claveNormalizada = clave.replace(/\.\d+/g, '.').replace(/\.$/, '');
    if (etiquetasCampo[claveNormalizada]) return etiquetasCampo[claveNormalizada];
    const partes = clave.split('.');
    const ultima = partes[partes.length - 1] ?? clave;
    return ultima.replace(/[_-]/g, ' ').replace(/\b\w/g, letra => letra.toUpperCase());
  }

  function formatearErroresConEtiquetas(errores: ErrorMapa = {}): ErrorMapa {
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
  const getDescribedBy = (key: string) => (errores[key] ? `${key.replace(/[^\w-]/g,'_')}_err` : undefined);

  // NUEVO: resolver URL de foto (absoluta o por defecto)
  const fotoPerfilUrl = usuario?.fotoPerfil?.ruta_imagen
    ? getAbsoluteUrl(usuario.fotoPerfil.ruta_imagen)
    : FotoXDefecto;

  return (
    <PpLayout
      userPermisos={userPermisos}
      breadcrumbs={[
        { title: 'Inicio', href: '/' },
        { title: 'Currículum', href: '/curriculum' },
        { title: 'Generar CV', href: '/curriculum/generar' },
      ]}
    >
      <h1 className="text-2xl font-bold text-[#034991] mb-4">Generación de Currículum</h1>

      <div className="max-w-6xl mx-auto p-4 text-gray-900">
        <ol className="flex gap-2 mb-4 text-sm">
          {[1,2,3,4].map(n => (
            <li key={n} className={`px-3 py-1 rounded-full ${paso===n?'bg-[#034991] text-white':'bg-gray-200'}`}>Paso {n}</li>
          ))}
        </ol>

        {paso===1 && (
          <section className="grid grid-cols-2 gap-4">
            {/* Nombre completo */}
            <div className="float-label-input">
              <input
                id="dp_nombreCompleto"
                className="peer"
                placeholder=" "
                value={form.datosPersonales.nombreCompleto}
                onChange={e=>setCampo('datosPersonales.nombreCompleto', e.target.value)}
                aria-invalid={getAriaInvalid('datosPersonales.nombreCompleto')}
                aria-describedby={getDescribedBy('datosPersonales.nombreCompleto')}
                maxLength={30}
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
                onChange={e=>setCampo('datosPersonales.correo', e.target.value)}
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
                className={`peer ${form.datosPersonales.telefono ? 'has-value':''}`}
                placeholder=" "
                value={form.datosPersonales.telefono}
                onChange={(e)=>{
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

            {/* NUEVO: Foto de Perfil */}
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
                onChange={e=>setCampo('resumenProfesional', e.target.value)}
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

        {paso===2 && (
          <section>
            <button
              type="button"
              className="mb-2 px-3 py-1 border rounded"
              onClick={()=>{
                setForm(prev => ({
                  ...prev,
                  educaciones:[...prev.educaciones, {institucion:'', titulo:'', fecha_inicio:'', fecha_fin:''}]
                }));
              }}
            >
              + Agregar educación
            </button>

            {form.educaciones.map((ed, i)=>(
              <div key={i} className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Educación {i+1}</span>
                  <button
                    type="button"
                    className="text-red-700 hover:text-white border border-red-700 hover:bg-red-700 text-xs px-2 py-1 rounded"
                    onClick={() => removeArrayItem('educaciones', i)}
                  >
                    Eliminar
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {/* Institución */}
                  <div className="float-label-input">
                    <input
                      id={`ed_${i}_institucion`}
                      className={`peer ${ed.institucion ? 'has-value' : ''}`}
                      placeholder=" "
                      value={ed.institucion}
                      onChange={e=>setCampo(`educaciones.${i}.institucion`, e.target.value)}
                      aria-invalid={getAriaInvalid(`educaciones.${i}.institucion`)}
                      aria-describedby={getDescribedBy(`educaciones.${i}.institucion`)}
                      maxLength={50}
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
                      onChange={e=>setCampo(`educaciones.${i}.titulo`, e.target.value)}
                      aria-invalid={getAriaInvalid(`educaciones.${i}.titulo`)}
                      aria-describedby={getDescribedBy(`educaciones.${i}.titulo`)}
                      maxLength={50}
                    />
                    <label htmlFor={`ed_${i}_titulo`}>Título</label>
                  </div>

                  {/* Fecha inicio */}
                  <div className="float-label-input">
                    <input
                      id={`ed_${i}_fecha_inicio`}
                      className={`peer ${ed.fecha_inicio ? 'has-value':''}`}
                      type="date"
                      placeholder=" "
                      min="1960-01-01"
                      max={new Date().toISOString().split('T')[0]}
                      value={ed.fecha_inicio ?? ''}
                      onChange={e=>setCampo(`educaciones.${i}.fecha_inicio`, e.target.value)}
                      aria-invalid={getAriaInvalid(`educaciones.${i}.fecha_inicio`)}
                      aria-describedby={getDescribedBy(`educaciones.${i}.fecha_inicio`)}
                    />
                    <label htmlFor={`ed_${i}_fecha_inicio`}>Fecha inicio</label>
                  </div>

                  {/* Fecha fin */}
                  <div className="float-label-input">
                    <input
                      id={`ed_${i}_fecha_fin`}
                      className={`peer ${ed.fecha_fin ? 'has-value':''}`}
                      type="date"
                      placeholder=" "
                      min={ed.fecha_inicio ?? '1960-01-01'}
                      max={new Date().toISOString().split('T')[0]}
                      value={ed.fecha_fin ?? ''}
                      onChange={e=>setCampo(`educaciones.${i}.fecha_fin`, e.target.value)}
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

        {paso===3 && (
          <section>
            <button
              type="button"
              className="mb-2 px-3 py-1 border rounded"
              onClick={()=>{
                setForm(prev => ({
                  ...prev,
                  experiencias:[...prev.experiencias, {empresa:'', puesto:'', periodo_inicio:'', periodo_fin:'', funciones:''}]
                }));
              }}
            >
              + Agregar experiencia
            </button>

            {form.experiencias.map((ex, i)=>(
              <div key={i} className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Experiencia {i+1}</span>
                  <button
                    type="button"
                    className="text-red-700 hover:text-white border border-red-700 hover:bg-red-700 text-xs px-2 py-1 rounded"
                    onClick={() => removeArrayItem('experiencias', i)}
                  >
                    Eliminar
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {/* Empresa */}
                  <div className="float-label-input">
                    <input
                      id={`ex_${i}_empresa`}
                      className={`peer ${ex.empresa ? 'has-value' : ''}`}
                      placeholder=" "
                      value={ex.empresa}
                      onChange={e=>setCampo(`experiencias.${i}.empresa`, e.target.value)}
                      aria-invalid={getAriaInvalid(`experiencias.${i}.empresa`)}
                      aria-describedby={getDescribedBy(`experiencias.${i}.empresa`)}
                      maxLength={30}
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
                      onChange={e=>setCampo(`experiencias.${i}.puesto`, e.target.value)}
                      aria-invalid={getAriaInvalid(`experiencias.${i}.puesto`)}
                      aria-describedby={getDescribedBy(`experiencias.${i}.puesto`)}
                      maxLength={30}
                    />
                    <label htmlFor={`ex_${i}_puesto`}>Puesto</label>
                  </div>

                  {/* Fecha inicio */}
                  <div className="float-label-input">
                    <input
                      id={`ex_${i}_periodo_inicio`}
                      className={`peer ${ex.periodo_inicio ? 'has-value':''}`}
                      type="date"
                      placeholder=" "
                      min="1960-01-01"
                      max={new Date().toISOString().split('T')[0]}
                      value={ex.periodo_inicio ?? ''}
                      onChange={e=>setCampo(`experiencias.${i}.periodo_inicio`, e.target.value)}
                      aria-invalid={getAriaInvalid(`experiencias.${i}.periodo_inicio`)}
                      aria-describedby={getDescribedBy(`experiencias.${i}.periodo_inicio`)}
                    />
                    <label htmlFor={`ex_${i}_periodo_inicio`}>Fecha inicio</label>
                  </div>

                  {/* Fecha fin */}
                  <div className="float-label-input">
                    <input
                      id={`ex_${i}_periodo_fin`}
                      className={`peer ${ex.periodo_fin ? 'has-value':''}`}
                      type="date"
                      placeholder=" "
                      min={ex.periodo_inicio ?? '1960-01-01'}
                      max={new Date().toISOString().split('T')[0]}
                      value={ex.periodo_fin ?? ''}
                      onChange={e=>setCampo(`experiencias.${i}.periodo_fin`, e.target.value)}
                      aria-invalid={getAriaInvalid(`experiencias.${i}.periodo_fin`)}
                      aria-describedby={getDescribedBy(`experiencias.${i}.periodo_fin`)}
                    />
                    <label htmlFor={`ex_${i}_periodo_fin`}>Fecha fin</label>
                  </div>

                  {/* Funciones */}
                  <div className="float-label-input col-span-5">
                    <input
                      id={`ex_${i}_funciones`}
                      className={`peer ${ex.funciones ? 'has-value' : ''}`}
                      placeholder=" "
                      value={ex.funciones ?? ''}
                      onChange={e=>setCampo(`experiencias.${i}.funciones`, e.target.value)}
                      aria-invalid={getAriaInvalid(`experiencias.${i}.funciones`)}
                      aria-describedby={getDescribedBy(`experiencias.${i}.funciones`)}
                      maxLength={150}
                    />
                    <label htmlFor={`ex_${i}_funciones`}>Funciones</label>
                  </div>
                </div>

                {/* Errores */}
                {errores[`experiencias.${i}.empresa`] && <p id={`experiencias_${i}_empresa_err`} className="text-red-600 text-sm mt-2">{errores[`experiencias.${i}.empresa`]}</p>}
                {errores[`experiencias.${i}.puesto`] && <p id={`experiencias_${i}_puesto_err`} className="text-red-600 text-sm">{errores[`experiencias.${i}.puesto`]}</p>}
                {errores[`experiencias.${i}.periodo_inicio`] && <p id={`experiencias_${i}_periodo_inicio_err`} className="text-red-600 text-sm">{errores[`experiencias.${i}.periodo_inicio`]}</p>}
                {errores[`experiencias.${i}.periodo_fin`] && <p id={`experiencias_${i}_periodo_fin_err`} className="text-red-600 text-sm">{errores[`experiencias.${i}.periodo_fin`]}</p>}
                {errores[`experiencias.${i}.funciones`] && <p id={`experiencias_${i}_funciones_err`} className="text-red-600 text-sm">{errores[`experiencias.${i}.funciones`]}</p>}
              </div>
            ))}
          </section>
        )}

        {paso===4 && (
          <section className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-[#034991] mb-1">Habilidades</h3>
              <button
                type="button"
                className="mb-2 px-3 py-1 border rounded"
                onClick={()=>{
                  setForm(prev => ({...prev, habilidades:[...prev.habilidades, {descripcion:''}]}));
                }}
              >
                + Habilidad
              </button>
              {form.habilidades.map((h,i)=>(
                <div key={i} className="flex gap-2 mb-2">
                  <div className="float-label-input w-full">
                    <input
                      id={`hab_${i}_descripcion`}
                      className="peer"
                      placeholder=" "
                      maxLength={20}
                      value={h.descripcion}
                      onChange={e=>setCampo(`habilidades.${i}.descripcion`, e.target.value)}
                      aria-invalid={getAriaInvalid(`habilidades.${i}.descripcion`)}
                      aria-describedby={getDescribedBy(`habilidades.${i}.descripcion`)}
                    />
                    <label htmlFor={`hab_${i}_descripcion`}>Descripción de habilidad</label>
                  </div>
                  <button
                    type="button"
                    className="text-red-700 hover:text-white border border-red-700 hover:bg-red-700 text-xs px-2 py-1 rounded whitespace-nowrap"
                    onClick={() => removeArrayItem('habilidades', i)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}

              <h3 className="font-bold text-[#034991] mt-4 mb-1">Idiomas</h3>
              <button
                type="button"
                className="mb-2 px-3 py-1 border rounded"
                onClick={()=>{
                  setForm(prev => ({...prev, idiomas:[...prev.idiomas, { nombre:'', nivel:'' }]}));
                }}
              >
                + Idioma
              </button>

              {form.idiomas.map((i2,idx)=>(
                <div key={idx} className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Idioma {idx+1}</span>
                    <button
                      type="button"
                      className="text-red-700 hover:text-white border border-red-700 hover:bg-red-700 text-xs px-2 py-1 rounded"
                      onClick={() => removeArrayItem('idiomas', idx)}
                    >
                      Eliminar
                    </button>
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
                        onChange={e=>setCampo(`idiomas.${idx}.nombre`, e.target.value)}
                        aria-invalid={getAriaInvalid(`idiomas.${idx}.nombre`)}
                        aria-describedby={getDescribedBy(`idiomas.${idx}.nombre`)}
                      />
                      <label htmlFor={`idioma_${idx}_nombre`}>Nombre del idioma</label>
                    </div>

                    {/* Nivel */}
                    <div className="float-label-input">
                      <select
                        id={`idioma_${idx}_nivel`}
                        className={`peer ${i2.nivel ? 'has-value':''}`}
                        value={i2.nivel}
                        onChange={e=>setCampo(`idiomas.${idx}.nivel`, e.target.value)}
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
              <button
                type="button"
                className="mb-2 px-3 py-1 border rounded"
                onClick={()=>{
                  setForm(prev => ({...prev, referencias:[...prev.referencias, {nombre:'', contacto:'', relacion:''}]}));
                }}
              >
                + Referencia
              </button>
              {form.referencias.map((r,idx)=>(
                <div key={idx} className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Referencia {idx+1}</span>
                    <button
                      type="button"
                      className="text-red-700 hover:text-white border border-red-700 hover:bg-red-700 text-xs px-2 py-1 rounded"
                      onClick={() => removeArrayItem('referencias', idx)}
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Nombre */}
                    <div className="float-label-input">
                      <input
                        id={`ref_${idx}_nombre`}
                        className="peer"
                        placeholder=" "
                        maxLength={30}
                        value={r.nombre}
                        onChange={e=>setCampo(`referencias.${idx}.nombre`, e.target.value)}
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
                        className={`peer ${r.contacto ? 'has-value':''}`}
                        placeholder=" "
                        value={r.contacto}
                        onChange={(e)=>{
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
                        maxLength={30}
                        value={r.relacion}
                        onChange={e=>setCampo(`referencias.${idx}.relacion`, e.target.value)}
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
              <Frt_VistaPreviaCurriculum datos={form} />
            </div>
          </section>
        )}

        <div className="mt-6 flex justify-between">
          {paso>1 ? <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={anterior}>Anterior</button> : <div/>}
          {paso<4 ? (
            <button type="button" className="px-4 py-2 bg-[#034991] text-white rounded" onClick={siguiente}>Siguiente</button>
          ) : (
            <button
              type="button"
              className="px-4 py-2 bg-[#CD1719] text-white rounded disabled:opacity-60"
              onClick={generar}
              disabled={botonGenerarDeshabilitado}
              title={!paso4Completo ? "Completa las habilidades, idiomas y referencias agregadas." : undefined}
            >
              {cargando ? "Generando..." : "Generar y Descargar"}
            </button>
          )}
        </div>

        {rutaPdf && !mostrarBtnDashboard && (
          <div className="mt-3">
            <a className="text-[#034991] underline" href={rutaPdf} target="_blank" rel="noreferrer">Descargar PDF</a>
          </div>
        )}

        {mostrarBtnDashboard && (
          <div className="mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-800 text-white rounded"
              onClick={() => router.visit('/dashboard')}
            >
              Ir al Dashboard
            </button>
          </div>
        )}
      </div>
    </PpLayout>
  );
}
