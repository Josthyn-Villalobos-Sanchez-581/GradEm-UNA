// resources/js/pages/Frt_FormularioGeneracionCurriculum.tsx

import React, { useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
import PpLayout from '../layouts/PpLayout';
import { validarPaso, ErrorMapa } from '../components/Frt_ValidacionClienteGeneracionCurriculum';
import { postGenerarCurriculum } from '../services/curriculumService';
import Frt_VistaPreviaCurriculum from '../pages/Frt_VistaPreviaCurriculum';
import { useModal } from '../hooks/useModal'; // 🟢 Integración modal

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
  [key: string]: any; // Add this line
};

type UsuarioActual = { id_usuario:number; nombre_completo:string; correo:string; telefono?:string };
// ===========================================================

export default function Frt_FormularioGeneracionCurriculum() {
  // Traemos userPermisos desde Inertia para que PpLayout filtre el menú
  const page = usePage<{ auth: { user?: any }, userPermisos?: number[] }>();
  const userPermisos = page.props.userPermisos ?? [];

  // 🟢 modal hook (alerta y confirmacion)
  const modal = useModal();

  const usuario: UsuarioActual | null = page.props.auth?.user
    ? {
        id_usuario: page.props.auth.user.id_usuario,
        nombre_completo: page.props.auth.user.nombre_completo,
        correo: page.props.auth.user.correo,
        telefono: page.props.auth.user.telefono,
      }
    : null;

  // Prefill tipado
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
    referencias: []
  }), [usuario]);

  const [form, setForm] = useState<FormCV>(prefill);
  const [paso, setPaso] = useState<number>(1);
  const [errores, setErrores] = useState<ErrorMapa>({});
  const [rutaPdf, setRutaPdf] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false); // 🟢 estado de carga

  // ================== Helpers ==================
  // Helper para setear campos por path "a.b.c"
  function setCampo(path: string, value: any) {
    setForm(prevForm => {
      const newForm = {...prevForm};
      let current: any = newForm;
      const parts = path.split('.');
      
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;

      // Si es una fecha de educación, validar
      if (path.startsWith('educaciones.') && (path.endsWith('fecha_inicio') || path.endsWith('fecha_fin'))) {
        const [, indexStr] = path.split('.');
        const index = parseInt(indexStr);
        const nuevosErrores = validarFechasEducacion(newForm.educaciones[index], index);
        setErrores(prev => ({ ...prev, ...nuevosErrores }));
      }

      // Si es una fecha de experiencia, validar
      if (path.startsWith('experiencias.') && (path.endsWith('periodo_inicio') || path.endsWith('periodo_fin'))) {
        const [, indexStr] = path.split('.');
        const index = parseInt(indexStr);
        const nuevosErrores = validarFechasExperiencia(newForm.experiencias[index], index);
        setErrores(prev => ({ ...prev, ...nuevosErrores }));
      }

      return newForm;
    });
  }

  // Solo dígitos y longitud máxima
  function solo8Digitos(valor: string) {
    return valor.replace(/\D/g, '').slice(0, 8);
  }

  // Validación local CR (8 dígitos) para teléfonos de DP y Referencias
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

  // 🟢 Manejo central de errores de API (incluye 422)
  const manejarErrorApi = async (error: any) => {
    if (error?.response?.status === 422) {
      setErrores(error.response.data?.errors ?? {});
      return;
    }
    await modal.alerta({
      titulo: "Error",
      mensaje: error?.response?.data?.message || "Ocurrió un error al procesar la solicitud.",
    });
  };

  // Eliminar un elemento de un arreglo del formulario (con confirmación)
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
    // Validación existente + validación local de teléfonos
    const eBase = validarPaso(form, paso);
    const eTel = validarTelefonosLocales(form, paso);
    const e = { ...eBase, ...eTel };
    setErrores(e);
    if (Object.keys(e).length === 0) setPaso(paso + 1);
  }

  function anterior() { setPaso(paso - 1); }

  async function generar() {
    // Validación existente + validación teléfonos del paso actual (4) y de DP
    const eBase = validarPaso(form, paso);
    const eTelPaso = validarTelefonosLocales(form, paso);
    // Fuerza revisar también DP por si el usuario cambió atrás y vino directo a generar
    const eTelDP = validarTelefonosLocales(form, 1);
    const e = { ...eBase, ...eTelPaso, ...eTelDP };

    setErrores(e);
    if (Object.keys(e).length > 0) {
      await modal.alerta({
        titulo: "Validación",
        mensaje: "Revisa los campos marcados antes de continuar.",
      });
      return;
    }

    try {
      setCargando(true);
      const resp = await postGenerarCurriculum(form); // ⬅️ Usa servicio con CSRF + withCredentials
      if (resp.ok) {
        setRutaPdf(resp.rutaPublica);
        await modal.alerta({
          titulo: "Éxito",
          mensaje: resp.mensaje || "Tu currículum ha sido generado correctamente.",
        });
      } else {
        await modal.alerta({
          titulo: "Error",
          mensaje: resp.mensaje || "No fue posible generar el currículum.",
        });
      }
    } catch (error: any) {
      await manejarErrorApi(error);
    } finally {
      setCargando(false);
    }
  }

  // Datos Personales
  const validacionesDatosPersonales = {
    nombreCompleto: {
      required: true,
      minLength: 5,
      maxLength: 255,
      pattern: /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+$/,  // Solo letras y espacios
    },
    
    correo: {
      required: true,
      pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
      maxLength: 255
    },
    
    telefono: {
      required: false,
      pattern: /^[0-9]{8}$/,  // Exactamente 8 dígitos para CR
    }
  }

  // Educación
  const validacionesEducacion = {
    institucion: {
      required: true,
      minLength: 3,
      maxLength: 255,
      pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()-]+$/
    },
    
    titulo: {
      required: true,
      minLength: 3,
      maxLength: 255,
      pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()-]+$/
    },
    
    fecha_inicio: {
      required: false,
      validate: (value: string) => {
        if (!value) return true;
        const date = new Date(value);
        return date <= new Date(); // No fechas futuras
      }
    },
    
    fecha_fin: {
      required: false,
      validate: (value: string, { fecha_inicio }: any) => {
        if (!value) return true;
        if (!fecha_inicio) return true;
        return new Date(value) >= new Date(fecha_inicio);
      }
    }
  }

  // Experiencia
  const validacionesExperiencia = {
    empresa: {
      required: true,
      minLength: 3,
      maxLength: 255,
      pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()-]+$/
    },
    
    puesto: {
      required: true,
      minLength: 3,
      maxLength: 255,
      pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()-]+$/
    },
    
    funciones: {
      required: false,
      maxLength: 1000
    },
    
    periodo_inicio: {
      required: false,
      validate: (value: string) => {
        if (!value) return true;
        return new Date(value) <= new Date();
      }
    },
    
    periodo_fin: {
      required: false,
      validate: (value: string, { periodo_inicio }: any) => {
        if (!value) return true;
        if (!periodo_inicio) return true;
        return new Date(value) >= new Date(periodo_inicio);
      }
    }
  }

  // Habilidades
  const validacionesHabilidad = {
    descripcion: {
      required: true,
      minLength: 3,
      maxLength: 255,
      pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()-]+$/
    }
  }

  // Idiomas
  const validacionesIdioma = {
    nombre: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+$/
    },
    
    nivel: {
      required: true,
      validate: (value: string) => {
        return ['A1','A2','B1','B2','C1','C2','Nativo'].includes(value);
      }
    }
  }

  // Referencias
  const validacionesReferencia = {
    nombre: {
      required: true,
      minLength: 5,
      maxLength: 255,
      pattern: /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+$/
    },
    
    contacto: {
      required: true,
      pattern: /^[0-9]{8}$/  // Teléfono CR
    },
    
    relacion: {
      required: false,
      maxLength: 255,
      pattern: /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,()-]+$/
    }
  }

  // Validar fechas de educación
  function validarFechasEducacion(educacion: Educacion, index: number): ErrorMapa {
    const errores: ErrorMapa = {};
    const hoy = new Date();
    const fechaMinima = new Date('1960-01-01');

    // Validar fecha de inicio
    if (educacion.fecha_inicio) {
      const fechaInicio = new Date(educacion.fecha_inicio);
      
      if (fechaInicio > hoy) {
        errores[`educaciones.${index}.fecha_inicio`] = 'La fecha no puede ser mayor a hoy';
      }
      
      if (fechaInicio < fechaMinima) {
        errores[`educaciones.${index}.fecha_inicio`] = 'La fecha no puede ser anterior a 1960';
      }
    }

    // Validar fecha de fin
    if (educacion.fecha_fin) {
      const fechaFin = new Date(educacion.fecha_fin);
      const fechaInicio = educacion.fecha_inicio ? new Date(educacion.fecha_inicio) : null;

      if (fechaFin > hoy) {
        errores[`educaciones.${index}.fecha_fin`] = 'La fecha no puede ser mayor a hoy';
      }

      if (fechaInicio && fechaFin < fechaInicio) {
        errores[`educaciones.${index}.fecha_fin`] = 'La fecha de fin no puede ser anterior a la fecha de inicio';
      }
    }

    return errores;
  }

  // Validar fechas de experiencia
  function validarFechasExperiencia(experiencia: Experiencia, index: number): ErrorMapa {
    const errores: ErrorMapa = {};
    const hoy = new Date();
    const fechaMinima = new Date('1960-01-01');

    // Validar periodo de inicio
    if (experiencia.periodo_inicio) {
      const fechaInicio = new Date(experiencia.periodo_inicio);
      
      if (fechaInicio > hoy) {
        errores[`experiencias.${index}.periodo_inicio`] = 'La fecha no puede ser mayor a hoy';
      }
      
      if (fechaInicio < fechaMinima) {
        errores[`experiencias.${index}.periodo_inicio`] = 'La fecha no puede ser anterior a 1960';
      }
    }

    // Validar periodo de fin
    if (experiencia.periodo_fin) {
      const fechaFin = new Date(experiencia.periodo_fin);
      const fechaInicio = experiencia.periodo_inicio ? new Date(experiencia.periodo_inicio) : null;

      if (fechaFin > hoy) {
        errores[`experiencias.${index}.periodo_fin`] = 'La fecha no puede ser mayor a hoy';
      }

      if (fechaInicio && fechaFin < fechaInicio) {
        errores[`experiencias.${index}.periodo_fin`] = 'La fecha de fin no puede ser anterior a la fecha de inicio';
      }
    }

    return errores;
  }

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
            <div>
              <label className="block">Nombre completo</label>
              <input
                className="border p-2 w-full"
                value={form.datosPersonales.nombreCompleto}
                onChange={e=>setCampo('datosPersonales.nombreCompleto', e.target.value)}
              />
              {errores['datosPersonales.nombreCompleto'] && <p className="text-red-600 text-sm">{errores['datosPersonales.nombreCompleto']}</p>}
            </div>
            <div>
              <label className="block">Correo</label>
              <input
                className="border p-2 w-full"
                value={form.datosPersonales.correo}
                onChange={e=>setCampo('datosPersonales.correo', e.target.value)}
              />
              {errores['datosPersonales.correo'] && <p className="text-red-600 text-sm">{errores['datosPersonales.correo']}</p>}
            </div>
            <div>
              <label className="block">Teléfono (CR, 8 dígitos)</label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{8}"
                maxLength={8}
                className="border p-2 w-full"
                placeholder="Ej: 88889999"
                value={form.datosPersonales.telefono}
                onChange={(e)=>{
                  const limpio = solo8Digitos(e.target.value);
                  setCampo('datosPersonales.telefono', limpio);
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Debe contener exactamente 8 dígitos (Costa Rica).</p>
              {errores['datosPersonales.telefono'] && <p className="text-red-600 text-sm">{errores['datosPersonales.telefono']}</p>}
            </div>
            <div className="col-span-2">
              <label className="block">Resumen profesional</label>
              <textarea
                className="border p-2 w-full"
                value={form.resumenProfesional}
                onChange={e=>setCampo('resumenProfesional', e.target.value)}
              />
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
              <div key={i} className="mb-3 border rounded-lg p-3">
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
                  <input className="border p-2 w-full" placeholder="Institución" value={ed.institucion}
                    onChange={e=>setCampo(`educaciones.${i}.institucion`, e.target.value)} />
                  <input className="border p-2 w-full" placeholder="Título" value={ed.titulo}
                    onChange={e=>setCampo(`educaciones.${i}.titulo`, e.target.value)} />
                  <input className="border p-2 w-full" type="date" min="1960-01-01" max={new Date().toISOString().split('T')[0]} value={ed.fecha_inicio ?? ''}
                    onChange={e=>setCampo(`educaciones.${i}.fecha_inicio`, e.target.value)} />
                  <input className="border p-2 w-full" type="date" min={ed.fecha_inicio ?? '1960-01-01'} max={new Date().toISOString().split('T')[0]} value={ed.fecha_fin ?? ''}
                    onChange={e=>setCampo(`educaciones.${i}.fecha_fin`, e.target.value)} />
                </div>

                {errores[`educaciones.${i}.institucion`] && <p className="text-red-600 text-sm mt-2">{errores[`educaciones.${i}.institucion`]}</p>}
                {errores[`educaciones.${i}.titulo`] && <p className="text-red-600 text-sm">{errores[`educaciones.${i}.titulo`]}</p>}
                {errores[`educaciones.${i}.fecha_inicio`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errores[`educaciones.${i}.fecha_inicio`]}
                  </p>
                )}
                {errores[`educaciones.${i}.fecha_fin`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errores[`educaciones.${i}.fecha_fin`]}
                  </p>
                )}
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
              <div key={i} className="mb-3 border rounded-lg p-3">
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
                  <input className="border p-2 w-full" placeholder="Empresa" value={ex.empresa}
                    onChange={e=>setCampo(`experiencias.${i}.empresa`, e.target.value)} />
                  <input className="border p-2 w-full" placeholder="Puesto" value={ex.puesto}
                    onChange={e=>setCampo(`experiencias.${i}.puesto`, e.target.value)} />
                  <input 
                    className="border p-2 w-full" 
                    type="date" 
                    min="1960-01-01" 
                    max={new Date().toISOString().split('T')[0]}
                    value={ex.periodo_inicio ?? ''} 
                    onChange={e=>setCampo(`experiencias.${i}.periodo_inicio`, e.target.value)} 
                  />
                  <input 
                    className="border p-2 w-full" 
                    type="date"
                    min={ex.periodo_inicio ?? '1960-01-01'}
                    max={new Date().toISOString().split('T')[0]}
                    value={ex.periodo_fin ?? ''} 
                    onChange={e=>setCampo(`experiencias.${i}.periodo_fin`, e.target.value)} 
                  />
                  <input className="border p-2 w-full col-span-5" placeholder="Funciones" value={ex.funciones ?? ''}
                    onChange={e=>setCampo(`experiencias.${i}.funciones`, e.target.value)} />
                </div>

                {errores[`experiencias.${i}.empresa`] && <p className="text-red-600 text-sm mt-2">{errores[`experiencias.${i}.empresa`]}</p>}
                {errores[`experiencias.${i}.puesto`] && <p className="text-red-600 text-sm">{errores[`experiencias.${i}.puesto`]}</p>}
                {errores[`experiencias.${i}.periodo_inicio`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errores[`experiencias.${i}.periodo_inicio`]}
                  </p>
                )}
                {errores[`experiencias.${i}.periodo_fin`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errores[`experiencias.${i}.periodo_fin`]}
                  </p>
                )}
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
                  <input
                    className="border p-2 w-full"
                    placeholder="Descripción"
                    value={h.descripcion}
                    onChange={e=>setCampo(`habilidades.${i}.descripcion`, e.target.value)}
                  />
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
                <div key={idx} className="mb-2 border rounded-lg p-3">
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
                    <input
                      className="border p-2 w-full col-span-2"
                      placeholder="Idioma (p. ej. Español, Inglés)"
                      value={i2.nombre}
                      onChange={e=>setCampo(`idiomas.${idx}.nombre`, e.target.value)}
                    />
                    <select
                      className="border p-2 w-full"
                      value={i2.nivel}
                      onChange={e=>setCampo(`idiomas.${idx}.nivel`, e.target.value)}
                    >
                      <option value="">Nivel (MCER)</option>
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                      <option value="C2">C2</option>
                      <option value="Nativo">Nativo</option>
                    </select>
                  </div>
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
                <div key={idx} className="mb-2 border rounded-lg p-3">
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
                    <input
                      className="border p-2 w-full"
                      placeholder="Nombre"
                      value={r.nombre}
                      onChange={e=>setCampo(`referencias.${idx}.nombre`, e.target.value)}
                    />
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{8}"
                      maxLength={8}
                      className="border p-2 w-full"
                      placeholder="Teléfono (8 dígitos)"
                      value={r.contacto}
                      onChange={(e)=>{
                        const limpio = solo8Digitos(e.target.value);
                        setCampo(`referencias.${idx}.contacto`, limpio);
                      }}
                    />
                    <input
                      className="border p-2 w-full"
                      placeholder="Relación"
                      value={r.relacion}
                      onChange={e=>setCampo(`referencias.${idx}.relacion`, e.target.value)}
                    />
                  </div>
                  {errores[`referencias.${idx}.contacto`] && <p className="text-red-600 text-sm mt-1">{errores[`referencias.${idx}.contacto`]}</p>}
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
              disabled={cargando}
            >
              {cargando ? "Generando..." : "Generar y Descargar"}
            </button>
          )}
        </div>

        {rutaPdf && (
          <div className="mt-3">
            <a className="text-[#034991] underline" href={rutaPdf} target="_blank" rel="noreferrer">Descargar PDF</a>
          </div>
        )}
      </div>
    </PpLayout>
  );
}
