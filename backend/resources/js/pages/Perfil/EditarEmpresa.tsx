// EditarEmpresa.tsx
import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { route } from "ziggy-js";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import IconoEdicion from "@/assets/IconoEdicion.png";
import { Inertia } from "@inertiajs/inertia";
import axios from "axios";
import CorreoVerificacion from "@/pages/Perfil/CorreoVerificacion";


// -------------------------
// INTERFACES
// -------------------------
interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  identificacion: string;
  telefono: string;
  correo?: string;
  fecha_nacimiento?: string;
  genero?: string;
  id_pais?: number | null;
  id_provincia?: number | null;
  id_canton?: number | null;
  id_universidad?: number | null;
  id_carrera?: number | null;
  fotoPerfil?: { ruta_imagen: string } | null;
}

interface Empresa {
  id_empresa: number;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  persona_contacto: string | null;
  usuario_id: number;
  id_pais?: number | null;
  id_provincia?: number | null;
  id_canton?: number | null;
}

interface Pais { id: number; nombre: string }
interface Provincia { id: number; nombre: string; id_pais: number }
interface Canton { id: number; nombre: string; id_provincia: number }

interface Props {
  usuario: Usuario;
  empresa?: Empresa | null | undefined;
  paises: Pais[];
  provincias: Provincia[];
  cantones: Canton[];
  userPermisos?: number[];
  rolNombre?: string;
}

// -------------------------
// CONSTANTS (limits)
// -------------------------
const MAX_NAME = 80;   // nombres: persona / empresa / persona_contacto
const MAX_EMAIL = 100; // correos

// -------------------------
// COMPONENT
// -------------------------
export default function EditarEmpresa({
  usuario,
  empresa,
  paises,
  provincias,
  cantones,
}: Props) {
  const modal = useModal();

  // ------------------------------------------------
  // formData (usuario) + empresaData (empresa)
  // ------------------------------------------------
  const [formData, setFormData] = useState<Usuario>({
    ...usuario,
    // ensure fields exist
    nombre_completo: usuario?.nombre_completo ?? "",
    identificacion: usuario?.identificacion ?? "",
    telefono: usuario?.telefono ?? "",
    correo: usuario?.correo ?? "",
    fotoPerfil: usuario?.fotoPerfil ?? null,
  });

  const [empresaData, setEmpresaData] = useState<Empresa | null>(
    empresa
      ? {
        ...empresa,
        nombre: empresa.nombre ?? "",
        correo: empresa.correo ?? "",
        telefono: empresa.telefono ?? "",
        persona_contacto: empresa.persona_contacto ?? "",
        id_canton: empresa.id_canton ?? usuario.id_canton ?? null,
      }
      : {
        id_empresa: 0,
        nombre: "",
        correo: "",
        telefono: "",
        persona_contacto: "",
        usuario_id: usuario.id_usuario,
        id_pais: usuario.id_pais ?? null,
        id_provincia: usuario.id_provincia ?? null,
        id_canton: usuario.id_canton ?? null,
      }
  );


  // precarga selects
  const cantonActual = cantones.find((c) => c.id === empresaData?.id_canton);
  const provinciaActual = cantonActual
    ? provincias.find((p) => p.id === cantonActual.id_provincia)
    : null;
  const paisActual = provinciaActual ? paises.find((pa) => pa.id === provinciaActual.id_pais) : null;

  const [selectedPais, setSelectedPais] = useState<number | null>(paisActual?.id ?? null);
  const [selectedProvincia, setSelectedProvincia] = useState<number | null>(provinciaActual?.id ?? null);
  const [selectedCanton, setSelectedCanton] = useState<number | null>(empresaData?.id_canton ?? null);

  // foto perfil url
  const fotoPerfilUrl = formData.fotoPerfil?.ruta_imagen || FotoXDefecto;

  // errores para campos (usuario y empresa)
  const [erroresUsuario, setErroresUsuario] = useState<{ [key: string]: string }>({});
  const [erroresEmpresa, setErroresEmpresa] = useState<{ [key: string]: string }>({});

  // sección activa para mostrar / ocultar secciones
  const [seccionActiva, setSeccionActiva] = useState<"representante" | "empresa" | "ubicacion" | "correo">("representante");

  // ------------------------------------------------
  // Foto - eliminar
  // ------------------------------------------------
  const eliminarFotoPerfil = async () => {
    const confirm = await modal.confirmacion({
      titulo: "Confirmar eliminación",
      mensaje: "¿Está seguro que desea eliminar su foto de perfil?",
    });
    if (!confirm) return;

    Inertia.post("/perfil/foto/eliminar", {}, {
      onSuccess: async () => {
        await modal.alerta({ titulo: "Éxito", mensaje: "Foto de perfil eliminada." });
        setFormData(prev => ({ ...prev, fotoPerfil: null }));
      },
      onError: (errors: any) =>
        modal.alerta({ titulo: "Error", mensaje: errors.foto || "No se pudo eliminar la foto." }),
    });
  };

  // ------------------------------------------------
  // useEffect: precargar selects si viene información
  // ------------------------------------------------
  useEffect(() => {
    if (empresaData?.id_canton) {
      const canton = cantones.find((c) => c.id === empresaData.id_canton) ?? null;
      const provincia = canton ? provincias.find((p) => p.id === canton.id_provincia) ?? null : null;
      const pais = provincia ? paises.find(pa => pa.id === provincia.id_pais) ?? null : null;

      setSelectedPais(pais?.id ?? null);
      setSelectedProvincia(provincia?.id ?? null);
      setSelectedCanton(empresaData.id_canton ?? null);

      setEmpresaData(prev => prev ? ({
        ...prev,
        id_pais: pais?.id ?? null,
        id_provincia: provincia?.id ?? null,
        id_canton: empresaData.id_canton ?? null,
      }) : prev);
    }
  }, [empresaData?.id_canton, paises, provincias, cantones]);

  useEffect(() => {

    // Solo verificar si cambió la identificación real
    if (formData.identificacion === usuario.identificacion) {
      setErroresUsuario(prev => ({ ...prev, identificacion: "" }));
      return;
    }

    // Si falla la validación local → no llamar backend
    const errorLocal = validarUsuario("identificacion", formData.identificacion);
    if (errorLocal) return;

    const timer = setTimeout(async () => {
      try {
        const resp = await axios.post("/perfil/verificar-identificacion", {
          identificacion: formData.identificacion
        });

        if (resp.data.existe) {
          setErroresUsuario(prev => ({
            ...prev,
            identificacion: "La identificación ya existe en el sistema."
          }));
        } else {
          setErroresUsuario(prev => ({ ...prev, identificacion: "" }));
        }

      } catch (e) {
        console.error("Error validando identificación", e);
      }
    }, 600);

    return () => clearTimeout(timer);

  }, [formData.identificacion]);

  // ------------------------------------------------
  // VALIDACIONES (basadas en tu código original, adaptadas a limites)
  // ------------------------------------------------
  const validarUsuario = (name: string, value: string) => {
    let error = "";
    const v = String(value ?? "");

    if (name === "nombre_completo") {
      if (!v.trim()) error = "El nombre es obligatorio.";
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(v)) error = "Solo se permiten letras y espacios.";
      else if (v.length > MAX_NAME) error = `Máximo ${MAX_NAME} caracteres.`;
    }

    if (name === "identificacion") {
      if (!/^(?=.*\d)[A-Za-z0-9]{5,12}$/.test(v)) {
        error = "Identificación alfanumérica (5-12 caracteres) y debe incluir números.";
      }
    }

    setErroresUsuario(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const validarEmpresa = (name: string, value: string | number | null) => {
    let error = "";
    const valStr = String(value ?? "");

    if (name === "nombre") {
      if (!valStr.trim()) error = "El nombre de la empresa es obligatorio.";
      else if (valStr.length > MAX_NAME) error = `Máximo ${MAX_NAME} caracteres.`;
    }

    if (name === "correo") {
      const val = String(value ?? "");
      if (!val.trim()) error = "El correo es obligatorio.";
      else if (val.length > MAX_EMAIL) error = `Máximo ${MAX_EMAIL} caracteres.`;
      else if (!/^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(val)) error = "Correo inválido.";
    }

    if (name === "telefono") {
      const v = String(value ?? "");
      if (v && !/^\d{8}$/.test(v)) error = "Teléfono inválido (8 dígitos).";
    }

    if (name === "persona_contacto") {
      const v = String(value ?? "");
      if (!v.trim()) error = "Campo obligatorio.";
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(v)) error = "Solo letras y espacios.";
      else if (v.length > MAX_NAME) error = `Máximo ${MAX_NAME} caracteres.`;
    }

    if (["id_pais", "id_provincia", "id_canton"].includes(name)) {
      if (!value) error = "Campo obligatorio.";
    }

    setErroresEmpresa(prev => ({ ...prev, [name]: error }));
    return error;
  };

  // ------------------------------------------------
  // HANDLE CHANGE (usuario)
  // - enforce limits so extra chars never appear
  // ------------------------------------------------
  const handleChangeUsuario = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    let value = (e.target as HTMLInputElement).value ?? "";

    if (name === "nombre_completo") {
      if (value.length > MAX_NAME) value = value.slice(0, MAX_NAME);
    }

    if (name === "correo") {
      if (value.length > MAX_EMAIL) value = value.slice(0, MAX_EMAIL);
    }

    if (name === "identificacion") {
      value = value.replace(/[^A-Za-z0-9]/g, "").slice(0, 12);
    }

    validarUsuario(name, String(value));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ------------------------------------------------
  // HANDLE CHANGE (empresa)
  // - enforce limits so extra chars never appear
  // ------------------------------------------------
  const handleChangeEmpresa = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    let value = (e.target as HTMLInputElement).value ?? "";

    // SELECTS numéricos
    if (["id_pais", "id_provincia", "id_canton"].includes(name)) {
      const n = value ? Number(value) : null;

      validarEmpresa(name, n);

      if (name === "id_pais") {
        setSelectedPais(n);
        setSelectedProvincia(null);
        setSelectedCanton(null);

        setEmpresaData(prev => prev ? ({
          ...prev,
          id_pais: n,
          id_provincia: null,
          id_canton: null
        }) : prev);
      }

      if (name === "id_provincia") {
        setSelectedProvincia(n);
        setSelectedCanton(null);

        setEmpresaData(prev => prev ? ({
          ...prev,
          id_provincia: n,
          id_canton: null
        }) : prev);
      }

      if (name === "id_canton") {
        setSelectedCanton(n);
        setEmpresaData(prev => prev ? ({
          ...prev,
          id_canton: n
        }) : prev);
      }

      return;
    }

    // LIMITE DE CARACTERES
    if (name === "nombre" || name === "persona_contacto") {
      if (value.length > MAX_NAME) value = value.slice(0, MAX_NAME);
    }

    if (name === "correo") {
      if (value.length > MAX_EMAIL) value = value.slice(0, MAX_EMAIL);
    }

    if (name === "telefono") {
      value = value.replace(/\D/g, "").slice(0, 8);
    }

    validarEmpresa(name, value);

    setEmpresaData(prev => prev ? ({
      ...prev,
      [name]: value
    }) : prev);
  };


  // ------------------------------------------------
  // SUBMIT
  // ------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Revalidar usuario
    const nuevosErroresUsuario: { [key: string]: string } = {};
    let usuarioTieneErrores = false;

    ["nombre_completo", "identificacion", "telefono"].forEach((k) => {
      const val = (formData as any)[k] ?? "";
      const err = validarUsuario(k, String(val));
      if (err) {
        usuarioTieneErrores = true;
        nuevosErroresUsuario[k] = err;
      }
    });
    setErroresUsuario(nuevosErroresUsuario);

    // Revalidar empresa
    const nuevosErroresEmpresa: { [key: string]: string } = {};
    let empresaTieneErrores = false;

    const camposEmpresa = ["nombre", "correo", "telefono", "persona_contacto", "id_pais", "id_provincia", "id_canton"];
    camposEmpresa.forEach((k) => {
      const val = (empresaData as any)[k];
      const err = validarEmpresa(k, val);
      if (err) {
        empresaTieneErrores = true;
        nuevosErroresEmpresa[k] = err;
      }
    });
    setErroresEmpresa(nuevosErroresEmpresa);

    if (usuarioTieneErrores || empresaTieneErrores) {
      await modal.alerta({
        titulo: "Errores encontrados",
        mensaje: "Revise los campos marcados en rojo.",
      });
      return;
    }

    const ok = await modal.confirmacion({
      titulo: "Confirmar cambios",
      mensaje: "¿Desea guardar los cambios?",
    });

    if (!ok) return;

    // payload: combine usuario + empresaData
    const payload = {
      ...formData,

      empresa_nombre: empresaData?.nombre ?? null,
      empresa_correo: empresaData?.correo ?? null,
      empresa_telefono: empresaData?.telefono ?? null,
      empresa_persona_contacto: empresaData?.persona_contacto ?? null,

      id_canton: empresaData?.id_canton ?? formData.id_canton ?? null,
    };

    // Limpiar campos que vienen desde empresaData
    const {
      nombre: _nombre,
      correo: _correo,
      telefono: _telefono,
      persona_contacto: _persona_contacto,
      ...cleanPayload
    } = {
      ...formData,
      ...empresaData,
      empresa_nombre: empresaData?.nombre ?? null,
      empresa_correo: empresaData?.correo ?? null,
      empresa_telefono: empresaData?.telefono ?? null,
      empresa_persona_contacto: empresaData?.persona_contacto ?? null,
      id_canton: empresaData?.id_canton ?? formData.id_canton ?? null,
    };

    //Quitar fotoPerfil del envío
    const { fotoPerfil, ...dataToSend } = cleanPayload;

    router.put(
      route("perfil.update"),
      { ...dataToSend },
      {
        preserveScroll: true,
        onSuccess: async () => {
          await modal.alerta({
            titulo: "Actualización exitosa",
            mensaje: "Sus datos se han actualizado correctamente.",
          });
          window.location.href = route("perfil.index");
        },
        onError: async (backendErrors: any) => {
          const errorMsg = Object.values(backendErrors || {}).flat?.().join?.(" ") ?? "Hubo un error al actualizar los datos.";
          await modal.alerta({
            titulo: "Error al guardar",
            mensaje: errorMsg,
          });
          if (backendErrors && typeof backendErrors === "object") {
            const us: any = {};
            const em: any = {};
            Object.entries(backendErrors).forEach(([k, v]) => {
              if (["nombre_completo", "identificacion", "telefono"].includes(k)) us[k] = (v as any).join ? (v as any).join(" ") : String(v);
              else em[k] = (v as any).join ? (v as any).join(" ") : String(v);
            });
            setErroresUsuario(prev => ({ ...prev, ...us }));
            setErroresEmpresa(prev => ({ ...prev, ...em }));
          }
        }
      }
    );
  };

  // ------------------------------------------------
  // UI: SectionLink component
  // ------------------------------------------------
  const SectionLink = ({ title, id }: { title: string; id: "representante" | "empresa" | "ubicacion" | "correo" }) => (
    <button
      type="button"
      onClick={() => setSeccionActiva(id)}
      className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${seccionActiva === id ? "bg-red-100 text-red-700 font-bold border-l-4 border-red-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
        }`}
    >
      {title}
    </button>
  );

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------
  return (
    <>
      <Head title="Editar empresa" />

      <div className="max-w-6xl mx-auto mb-4">
        <Button asChild variant="ghost" className="text-gray-600 hover:text-red-500">
          <Link href="/perfil">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Perfil
          </Link>
        </Button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-white shadow-lg rounded-xl text-black">
        {/* Left column: sidebar + foto */}
        <div className="md:col-span-4 lg:col-span-3 border-r pr-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Perfil</h2>

          <div className="flex flex-col items-start pb-6 border-b border-gray-200 mb-6">
            <div className="relative">
              <img src={fotoPerfilUrl} alt="Foto de Perfil" className="rounded-full w-24 h-24 object-cover shadow-md mb-3 border-2 border-red-500" />
              <Link
                href={route("perfil.foto.mostrar")}
                title="Editar foto de perfil"
                className="absolute -bottom-1 -right-1 flex items-center justify-center h-8 w-8 rounded-full bg-white border border-gray-300 shadow-md hover:scale-110 transition"
              >
                <img src={IconoEdicion} alt="Editar" className="w-4 h-4" />
              </Link>
            </div>

            {formData.fotoPerfil && (
              <button type="button" onClick={eliminarFotoPerfil} className="mt-2 text-sm text-red-600 font-semibold hover:text-red-800 transition">
                Borrar Foto de Perfil
              </button>
            )}

            <p className="text-2xl font-bold mt-4"> Empresa: {empresa?.nombre}</p>
            <p className="text-base text-gray-700">
              Usuario: {usuario.nombre_completo}</p>
          </div>

          <nav className="flex flex-col space-y-2">
            <SectionLink title="Datos del representante" id="representante" />
            <SectionLink title="Correo de verificación" id="correo" />
            <SectionLink title="Datos de la empresa" id="empresa" />
            <SectionLink title="Ubicación" id="ubicacion" />
          </nav>
        </div>

        {/* Right column: form sections */}
        <div className="md:col-span-8 lg:col-span-9">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700">Editar empresa</h3>
              <Button type="submit" variant="default">Guardar cambios</Button>
            </div>

            {/* Sección: Datos del representante */}
            {seccionActiva === "representante" && (
              <div>
                <h4 className="text-lg font-semibold mb-2">Datos personales del representante</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label>Nombre completo</label>
                    <input
                      type="text"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={handleChangeUsuario}
                      onBlur={(e) => validarUsuario(e.target.name, e.target.value)}
                      className={`border p-2 rounded ${erroresUsuario.nombre_completo ? "border-red-500" : "border-gray-300"}`}
                      maxLength={MAX_NAME}
                    />
                    {erroresUsuario.nombre_completo && <span className="text-red-500 text-xs">{erroresUsuario.nombre_completo}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label>Identificación</label>
                    <input
                      type="text"
                      name="identificacion"
                      value={formData.identificacion}
                      onChange={handleChangeUsuario}
                      onBlur={(e) => validarUsuario(e.target.name, e.target.value)}
                      className={`border p-2 rounded ${erroresUsuario.identificacion ? "border-red-500" : "border-gray-300"}`}
                      maxLength={12}
                    />
                    {erroresUsuario.identificacion && <span className="text-red-500 text-xs">{erroresUsuario.identificacion}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Datos de la empresa */}
            {seccionActiva === "empresa" && (
              <div>
                <h4 className="text-lg font-semibold mb-2">Datos de la empresa</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label>Nombre de la empresa</label>
                    <input
                      type="text"
                      name="nombre"
                      value={empresaData?.nombre ?? ""}
                      onChange={handleChangeEmpresa}
                      onBlur={(e) => validarEmpresa("nombre", e.target.value)}
                      className={`border p-2 rounded ${erroresEmpresa.nombre ? "border-red-500" : "border-gray-300"}`}
                      maxLength={MAX_NAME}
                    />
                    {erroresEmpresa.nombre && <span className="text-red-500 text-xs">{erroresEmpresa.nombre}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label>Correo de contacto</label>
                    <input
                      type="email"
                      name="correo"
                      value={empresaData?.correo ?? ""}
                      onChange={handleChangeEmpresa}
                      onBlur={(e) => validarEmpresa("correo", e.target.value)}
                      className={`border p-2 rounded ${erroresEmpresa.correo ? "border-red-500" : "border-gray-300"}`}
                      maxLength={MAX_EMAIL}
                    />
                    {erroresEmpresa.correo && <span className="text-red-500 text-xs">{erroresEmpresa.correo}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label>Teléfono de empresa</label>
                    <input
                      type="text"
                      name="telefono"
                      value={empresaData?.telefono ?? ""}
                      onChange={handleChangeEmpresa}
                      onBlur={(e) => validarEmpresa("telefono", e.target.value)}
                      className={`border p-2 rounded ${erroresEmpresa.telefono ? "border-red-500" : "border-gray-300"}`}
                      maxLength={8}
                    />
                    {erroresEmpresa.telefono && <span className="text-red-500 text-xs">{erroresEmpresa.telefono}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label>Persona de contacto</label>
                    <input
                      type="text"
                      name="persona_contacto"
                      value={empresaData?.persona_contacto ?? ""}
                      onChange={handleChangeEmpresa}
                      onBlur={(e) => validarEmpresa("persona_contacto", e.target.value)}
                      className={`border p-2 rounded ${erroresEmpresa.persona_contacto ? "border-red-500" : "border-gray-300"}`}
                      maxLength={MAX_NAME}
                    />
                    {erroresEmpresa.persona_contacto && <span className="text-red-500 text-xs">{erroresEmpresa.persona_contacto}</span>}
                  </div>
                </div>
              </div>
            )}

            {seccionActiva === 'correo' && (
              <div className="max-w-lg">
                <CorreoVerificacion
                  correoInicial={formData.correo ?? ""}  
                  onCorreoVerificado={(nuevoCorreo) => {
                    setFormData(prev => ({ ...prev, correo: nuevoCorreo }));
                    setErroresEmpresa(prev => ({ ...prev, correo: "" }));
                  }}
                />
              </div>
            )}

            {/* Sección: Ubicación de la empresa */}
            {seccionActiva === "ubicacion" && (
              <div>
                <h4 className="text-lg font-semibold mb-2">Ubicación de la empresa</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label>País</label>
                    <select
                      name="id_pais"
                      value={selectedPais ?? ""}
                      onChange={(e) => handleChangeEmpresa(e as any)}
                      onBlur={(e) => validarEmpresa("id_pais", e.target.value)}
                      className={`border p-2 rounded ${erroresEmpresa.id_pais ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Seleccione país</option>
                      {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    {erroresEmpresa.id_pais && <span className="text-red-500 text-xs">{erroresEmpresa.id_pais}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label>Provincia</label>
                    <select
                      name="id_provincia"
                      value={selectedProvincia ?? ""}
                      disabled={!selectedPais}
                      onChange={(e) => handleChangeEmpresa(e as any)}
                      onBlur={(e) => validarEmpresa("id_provincia", e.target.value)}
                      className={`border p-2 rounded ${erroresEmpresa.id_provincia ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Seleccione provincia</option>
                      {provincias.filter(p => p.id_pais === selectedPais).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    {erroresEmpresa.id_provincia && <span className="text-red-500 text-xs">{erroresEmpresa.id_provincia}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label>Cantón</label>
                    <select
                      name="id_canton"
                      value={selectedCanton ?? ""}
                      disabled={!selectedProvincia}
                      onChange={(e) => handleChangeEmpresa(e as any)}
                      onBlur={(e) => validarEmpresa("id_canton", e.target.value)}
                      className={`border p-2 rounded ${erroresEmpresa.id_canton ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Seleccione cantón</option>
                      {cantones.filter(c => c.id_provincia === selectedProvincia).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                    {erroresEmpresa.id_canton && <span className="text-red-500 text-xs">{erroresEmpresa.id_canton}</span>}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

// Layout
(EditarEmpresa as any).layout = (page: any) => <PpLayout userPermisos={page.props.userPermisos}>{page}</PpLayout>;
