import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { route } from "ziggy-js";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import IconoEdicion from "@/assets/IconoEdicion.png";
import { Inertia } from "@inertiajs/inertia";
import CorreoVerificacion from "@/pages/Perfil/CorreoVerificacion";
import axios from "axios";


// ----------------------------------------------------
// INTERFACES 
// ----------------------------------------------------
interface Pais {
  id: number;
  nombre: string;
}

interface Provincia {
  id: number;
  nombre: string;
  id_pais: number;
}

interface Canton {
  id: number;
  nombre: string;
  id_provincia: number;
}

interface Universidad {
  id: number;
  nombre: string;
  sigla: string;
}

interface Carrera {
  id: number;
  nombre: string;
  id_universidad: number;
}

interface FotoPerfil { ruta_imagen: string }

interface UsuarioAdministrador {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  identificacion: string;
  telefono: string;
  fecha_nacimiento: string;
  genero: string;
  id_pais: number | null;
  id_provincia: number | null;
  id_canton: number | null;
  id_universidad: number | null;
  id_carrera: number | null; // OPCIONAL
  fotoPerfil?: FotoPerfil | null;
}

interface Props {
  usuario: UsuarioAdministrador;
  paises: Pais[];
  provincias: Provincia[];
  cantones: Canton[];
  universidades: Universidad[];
  carreras: Carrera[];
}

// ----------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------
export default function EditarAdministrador({
  usuario,
  paises,
  provincias,
  cantones,
  universidades,
  carreras,
}: Props) {
  const modal = useModal();

  const [formData, setFormData] = useState<UsuarioAdministrador>(usuario);
  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [activeSection, setActiveSection] = useState<'personales' | 'residencia' | 'academicos' | 'correo'>('personales');
  const [selectedPais, setSelectedPais] = useState<number | null>(usuario.id_pais);
  const [selectedProvincia, setSelectedProvincia] = useState<number | null>(usuario.id_provincia);
  const [selectedCanton, setSelectedCanton] = useState<number | null>(usuario.id_canton);

  // 📸 Lógica de la Foto de Perfil
  const fotoPerfilUrl = usuario.fotoPerfil?.ruta_imagen || FotoXDefecto;

  const eliminarFotoPerfil = async () => {
    const confirm = await modal.confirmacion({
      titulo: "Confirmar eliminación",
      mensaje: "¿Está seguro que desea eliminar su foto de perfil?",
    });
    if (!confirm) return;

    Inertia.post("/perfil/foto/eliminar", {}, {
      onSuccess: () => modal.alerta({ titulo: "Éxito", mensaje: "Foto de perfil eliminada." }),
      onError: (errors: any) =>
        modal.alerta({ titulo: "Error", mensaje: errors.foto || "No se pudo eliminar la foto." }),
    });
  };
  // 📸 Fin Lógica Foto de Perfil


  // PRECARGAR PAIS → PROVINCIA → CANTÓN CORRECTAMENTE
  useEffect(() => {
    if (usuario.id_canton) {
      const canton = cantones.find(c => c.id === usuario.id_canton);
      const provincia = canton ? provincias.find(p => p.id === canton.id_provincia) : null;
      const pais = provincia ? paises.find(pa => pa.id === provincia.id_pais) : null;

      setSelectedPais(pais?.id ?? null);
      setSelectedProvincia(provincia?.id ?? null);
      setSelectedCanton(usuario.id_canton);

      setFormData(prev => ({
        ...prev,
        id_pais: pais?.id ?? null,
        id_provincia: provincia?.id ?? null,
        id_canton: usuario.id_canton,
      }));
    }
  }, [usuario, paises, provincias, cantones]);
  const [selectedUniversidad, setSelectedUniversidad] = useState<number | null>(
    usuario.id_universidad
  );

  /* ============================================================
   VALIDACIÓN DE IDENTIFICACIÓN EN BACKEND (DEBOUNCE)
============================================================ */
  useEffect(() => {

    // Solo verificar si cambió la identificación real
    if (formData.identificacion === usuario.identificacion) {
      setErrores(prev => ({ ...prev, identificacion: "" }));
      return;
    }

    // Si falla la validación local → no llamar backend
    const errorLocal = validarCampo("identificacion", formData.identificacion);
    if (errorLocal) return;

    const timer = setTimeout(async () => {
      try {
        const resp = await axios.post("/perfil/verificar-identificacion", {
          identificacion: formData.identificacion
        });

        if (resp.data.existe) {
          setErrores(prev => ({
            ...prev,
            identificacion: "La identificación ya existe en el sistema."
          }));
        } else {
          setErrores(prev => ({ ...prev, identificacion: "" }));
        }

      } catch (e) {
        console.error("Error validando identificación", e);
      }
    }, 600);

    return () => clearTimeout(timer);

  }, [formData.identificacion]);


  /* ============================================================
    VALIDACIÓN
  ============================================================ */
  const validarCampo = (name: string, value: string | number | null) => {
    let error = "";
    const currentYear = new Date().getFullYear();
    const strValue = String(value || "");

    if (name === "nombre_completo") {
      if (!value) error = "El nombre es obligatorio.";
      else if (strValue.length > 80) error = "Máximo 80 caracteres.";
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(strValue))
        error = "Solo letras y espacios.";
    }

    if (name === "correo") {
      if (!value) {
        error = "El correo es obligatorio.";
      } else if (strValue.length > 100) {
        error = "Máximo 100 caracteres.";
      } else if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/i.test(strValue)) {
        // Validación de formato de correo genérica
        error = "Formato de correo inválido.";
      }
    }

    if (name === "identificacion") {
      if (!/^(?=.*\d)[A-Za-z0-9]{5,12}$/.test(strValue)) {
        error = "Identificación alfanumérica (5-12 caracteres) y debe incluir números.";
      }
    }

    if (name === "telefono") {
      if (!/^\d{8}$/.test(strValue)) error = "Debe tener exactamente 8 números.";
    }

    if (name === "fecha_nacimiento") {
      const year = new Date(strValue).getFullYear();
      if (!value) error = "Campo obligatorio.";
      else if (year > currentYear - 16) error = "Debe tener al menos 16 años.";
      else if (year < currentYear - 100) error = "Fecha no válida.";
    }

    if (["genero", "id_pais", "id_provincia", "id_canton", "id_universidad"].includes(name)) {
      if (!value) error = "Este campo es obligatorio.";
    }

    // Carrera NO es obligatoria — no se valida si está vacía
    if (name === "id_carrera") {
      error = "";
    }

    setErrores((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  /* ============================================================
    HANDLE CHANGE
  ============================================================ */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    let newValue: string | number | null = value;

    // Normalizar teléfono
    if (name === "telefono") {
      value = value.replace(/\D/g, "").slice(0, 8);
      newValue = value;
    }

    // Normalizar identificación
    if (name === "identificacion") {
      value = value.replace(/[^A-Za-z0-9]/g, "").slice(0, 12);
      newValue = value;
    }

    // Normalizar a número si es un campo ID y es un string vacío
    if (["id_pais", "id_provincia", "id_canton", "id_universidad", "id_carrera"].includes(name)) {
      newValue = value === "" ? null : Number(value);
    }

    setFormData({ ...formData, [name]: newValue });
    validarCampo(name, newValue);
  };

  /* ============================================================
    SUBMIT
  ============================================================ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ CORRECCIÓN: Declarar 'hayErrores' y 'nuevosErrores' localmente.
    let hayErrores = false;
    const nuevosErrores: { [key: string]: string } = {};

    // Campos a validar (excluir fotoPerfil)
    const camposAValidar = Object.keys(formData).filter(
      (key) => key !== "fotoPerfil" && key !== "id_usuario"
    ) as (keyof UsuarioAdministrador)[];

    // 1. Recorrer los campos y ejecutar la validación
    camposAValidar.forEach((key) => {
      const val = formData[key];
      // ✅ CORRECCIÓN: Casting de tipo para satisfacer a TypeScript
      const error = validarCampo(key, val as string | number | null);
      if (error) {
        hayErrores = true;
        nuevosErrores[key] = error;
      }
    });

    // 2. Actualizar el estado de errores una única vez.
    setErrores(nuevosErrores);

    // Si hay errores → detener y notificar con modal
    if (hayErrores) {
      await modal.alerta({
        titulo: "Errores de validación",
        mensaje: "Debe corregir los campos marcados en rojo antes de continuar.",
      });

      // Opcional: mover a la sección del primer error
      const primerCampoConError = camposAValidar.find(key => nuevosErrores[key]);
      if (primerCampoConError) {
        if (["nombre_completo", "correo", "identificacion", "telefono", "fecha_nacimiento", "genero"].includes(primerCampoConError)) {
          setActiveSection('personales');
        } else if (["id_pais", "id_provincia", "id_canton"].includes(primerCampoConError)) {
          setActiveSection('residencia');
        } else if (["id_universidad", "id_carrera"].includes(primerCampoConError)) {
          setActiveSection('academicos');
        }
      }

      return;
    }

    // Si no hay errores, confirmar la acción
    const ok = await modal.confirmacion({
      titulo: "Confirmar cambios",
      mensaje: "¿Desea guardar los cambios del usuario administrador?",
    });

    if (!ok) return;

    // Se excluye 'fotoPerfil' antes de enviar
    const { fotoPerfil, ...dataToSend } = formData;

    router.put(route("perfil.update"), dataToSend, {
      preserveScroll: true,
      onSuccess: async () => {
        await modal.alerta({
          titulo: "Actualización exitosa",
          mensaje: "Los datos se han actualizado correctamente.",
        });
        // Redirigir a la vista del perfil después del éxito
        window.location.href = route("perfil.index");
      },
      onError: async (backendErrors: any) => {
        // Mostrar errores de validación de backend con el modal
        const errorMsg = Object.values(backendErrors).flat().join(" ");
        await modal.alerta({
          titulo: "Error al guardar",
          mensaje: errorMsg || "Hubo un error al actualizar los datos. Revise el formulario.",
        });
        setErrores(backendErrors); // establecer errores del backend para marcar los campos
      }
    });
  };

  /* ============================================================
    RENDER
  ============================================================ */

  return (
    <>
      <Head title="Editar Usuario Administrador" />

      {/* BOTÓN VOLVER (Fuera del contenedor principal si el layout lo permite) */}
      <div className="max-w-6xl mx-auto mb-4">
        <Button asChild variant="ghost" className="text-gray-600 hover:text-red-500">
          <Link href="/perfil">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al Perfil
          </Link>
        </Button>
      </div>

      {/* CONTENEDOR PRINCIPAL ASIMÉTRICO (30% / 70%) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-white shadow-lg rounded-xl">
        {/* ---------------------------------------------------- */}
        {/* 1. COLUMNA IZQUIERDA (30%) - NAVEGACIÓN Y FOTO */}
        {/* ---------------------------------------------------- */}
        <div className="md:col-span-4 lg:col-span-3 border-r pr-6 text-black">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Perfil</h2>

          {/* 📸 FOTO Y ACCIONES DE PERFIL - REEMPLAZO DEL BLOQUE ANTERIOR */}
          <div className="flex flex-col items-start pb-6 border-b border-gray-200 mb-6 text-black">
            <div className="relative">
              <img
                src={fotoPerfilUrl}
                alt="Foto de Perfil"
                className="rounded-full w-24 h-24 object-cover shadow-md mb-3 border-2 border-red-500"
              />
              {/* Botón de editar foto */}
              <Link
                href={route("perfil.foto.mostrar")} // Se asume que esta ruta existe para subir la foto
                title="Editar foto de perfil"
                className="absolute -bottom-1 -right-1 flex items-center justify-center h-8 w-8 rounded-full bg-white border border-gray-300 shadow-md hover:scale-110 transition"
              >
                <img src={IconoEdicion} alt="Editar" className="w-4 h-4" />
              </Link>
            </div>

            {/* Botón eliminar foto */}
            {usuario.fotoPerfil && (
              <button
                type="button" // Es importante para evitar submits de formulario
                onClick={eliminarFotoPerfil}
                className="mt-2 text-sm text-red-600 font-semibold hover:text-red-800 transition"
              >
                Borrar Foto de Perfil
              </button>
            )}
            {/* 📸 FIN FOTO Y ACCIONES DE PERFIL */}

            <p className="text-lg font-semibold text-gray-800 mt-4">{formData.nombre_completo}</p>
            <p className="text-sm text-gray-500">Administrador</p>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex flex-col space-y-2">
            <SectionLink
              title="Datos Personales"
              active={activeSection === 'personales'}
              onClick={() => setActiveSection('personales')}
            />
            <SectionLink
              title="Cambio de correo"
              active={activeSection === 'correo'}
              onClick={() => setActiveSection('correo')}
            />
            <SectionLink
              title="Lugar de Residencia"
              active={activeSection === 'residencia'}
              onClick={() => setActiveSection('residencia')}
            />
            <SectionLink
              title="Datos Académicos"
              active={activeSection === 'academicos'}
              onClick={() => setActiveSection('academicos')}
            />
          </nav>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 2. COLUMNA DERECHA (70%) - CONTENIDO DEL FORMULARIO */}
        {/* ---------------------------------------------------- */}
        <div className="md:col-span-8 lg:col-span-9 text-black">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Título de la Sección Activa y Botón de Guardar */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700">
                {activeSection === 'personales' && 'Datos Personales'}
                {activeSection === 'correo' && 'Cambiar correo electrónico'}
                {activeSection === 'residencia' && 'Lugar de Residencia'}
                {activeSection === 'academicos' && 'Datos Académicos'}
              </h3>
              <Button type="submit" variant="default">
                Guardar
              </Button>
            </div>

            {/* Renderizado Condicional de Secciones */}

            {/* DATOS PERSONALES */}
            {activeSection === 'personales' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Nombre completo */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Nombre completo</label>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleChange}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    maxLength={80}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.nombre_completo ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errores.nombre_completo && (
                    <span className="text-red-500 text-xs mt-1">{errores.nombre_completo}</span>
                  )}
                </div>

                {/* Correo */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    maxLength={100}
                    onChange={handleChange}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.correo ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errores.correo && (
                    <span className="text-red-500 text-xs mt-1">{errores.correo}</span>
                  )}
                </div>

                {/* Identificación */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Identificación</label>
                  <input
                    type="text"
                    name="identificacion"
                    value={formData.identificacion}
                    maxLength={12}
                    onChange={handleChange}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.identificacion ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errores.identificacion && (
                    <span className="text-red-500 text-xs mt-1">{errores.identificacion}</span>
                  )}
                </div>

                {/* Teléfono */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    maxLength={8}
                    onChange={handleChange}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.telefono ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errores.telefono && (
                    <span className="text-red-500 text-xs mt-1">{errores.telefono}</span>
                  )}
                </div>

                {/* Fecha de Nacimiento */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.fecha_nacimiento ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errores.fecha_nacimiento && (
                    <span className="text-red-500 text-xs mt-1">{errores.fecha_nacimiento}</span>
                  )}
                </div>

                {/* Género */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Género</label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.genero ? "border-red-500" : "border-gray-300"
                      }`}
                  >
                    <option value="">Seleccione género</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                  {errores.genero && (
                    <span className="text-red-500 text-xs mt-1">{errores.genero}</span>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'correo' && (
              <div className="max-w-lg">
                <CorreoVerificacion
                  correoInicial={formData.correo}
                  onCorreoVerificado={(nuevoCorreo) => {
                    setFormData(prev => ({ ...prev, correo: nuevoCorreo }));
                    setErrores(prev => ({ ...prev, correo: "" })); // Limpia error en caso de existir
                  }}
                />
              </div>
            )}

            {/* LUGAR DE RESIDENCIA */}
            {activeSection === 'residencia' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

                {/* País */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">País</label>
                  <select
                    name="id_pais"
                    value={selectedPais ?? ""}
                    onChange={(e) => {
                      const id = e.target.value ? Number(e.target.value) : null;
                      setSelectedPais(id);
                      setSelectedProvincia(null);
                      setSelectedCanton(null);
                      setFormData(prev => ({
                        ...prev,
                        id_pais: id,
                        id_provincia: null,
                        id_canton: null
                      }));
                      validarCampo("id_pais", id);
                    }}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.id_pais ? "border-red-500" : "border-gray-300"
                      }`}
                  >
                    <option value="">Seleccione</option>
                    {paises.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                  {errores.id_pais && (
                    <span className="text-xs text-red-500 mt-1">{errores.id_pais}</span>
                  )}
                </div>

                {/* Provincia */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Provincia</label>
                  <select
                    name="id_provincia"
                    value={selectedProvincia ?? ""}
                    disabled={!selectedPais}
                    onChange={(e) => {
                      const id = e.target.value ? Number(e.target.value) : null;
                      setSelectedProvincia(id);
                      setSelectedCanton(null);
                      setFormData(prev => ({ ...prev, id_provincia: id, id_canton: null }));
                      validarCampo("id_provincia", id);
                    }}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.id_provincia ? "border-red-500" : "border-gray-300"
                      }`}
                  >
                    <option value="">Seleccione</option>
                    {provincias
                      .filter((p) => p.id_pais === selectedPais)
                      .map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                  </select>
                  {errores.id_provincia && (
                    <span className="text-xs text-red-500 mt-1">{errores.id_provincia}</span>
                  )}
                </div>

                {/* Cantón */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Cantón</label>
                  <select
                    name="id_canton"
                    value={selectedCanton ?? ""}
                    disabled={!selectedProvincia}
                    onChange={(e) => {
                      const id = e.target.value ? Number(e.target.value) : null;
                      setSelectedCanton(id);
                      setFormData({ ...formData, id_canton: id });
                      validarCampo("id_canton", id);
                    }}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.id_canton ? "border-red-500" : "border-gray-300"
                      }`}
                  >
                    <option value="">Seleccione</option>
                    {cantones
                      .filter((c) => c.id_provincia === selectedProvincia)
                      .map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                  </select>
                  {errores.id_canton && (
                    <span className="text-xs text-red-500 mt-1">{errores.id_canton}</span>
                  )}
                </div>
              </div>
            )}

            {/* DATOS ACADÉMICOS */}
            {activeSection === 'academicos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

                {/* Universidad */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Universidad</label>
                  <select
                    name="id_universidad"
                    value={selectedUniversidad ?? ""}
                    onChange={(e) => {
                      const id = e.target.value ? Number(e.target.value) : null;
                      setSelectedUniversidad(id);
                      setFormData({ ...formData, id_universidad: id, id_carrera: null });
                      validarCampo("id_universidad", id);
                    }}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.id_universidad ? "border-red-500" : "border-gray-300"
                      }`}
                  >
                    <option value="">Seleccione universidad</option>
                    {universidades.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} ({u.sigla})
                      </option>
                    ))}
                  </select>
                  {errores.id_universidad && (
                    <span className="text-red-500 text-xs mt-1">{errores.id_universidad}</span>
                  )}
                </div>

                {/* Carrera — OPCIONAL */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Carrera (opcional)</label>
                  <select
                    name="id_carrera"
                    value={formData.id_carrera ?? ""}
                    disabled={!selectedUniversidad}
                    onChange={handleChange}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.id_carrera ? "border-red-500" : "border-gray-300"
                      }`}
                  >
                    <option value="">Seleccione carrera</option>
                    {carreras
                      .filter((c) => c.id_universidad === selectedUniversidad)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                  </select>
                  {/* No hay mensaje de error para id_carrera ya que no es obligatorio */}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

// ----------------------------------------------------
// COMPONENTE AUXILIAR SectionLink
// ----------------------------------------------------
const SectionLink = ({ title, active, onClick }: { title: string, active: boolean, onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
   flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
    ${active
        ? 'bg-red-100 text-red-700 font-bold border-l-4 border-red-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
      }
  `}
  >
    {title}
  </button>
);

// ----------------------------------------------------
// LAYOUT
// ----------------------------------------------------
EditarAdministrador.layout = (page: any) => {
  return <PpLayout userPermisos={page.props.userPermisos}>{page}</PpLayout>;
};