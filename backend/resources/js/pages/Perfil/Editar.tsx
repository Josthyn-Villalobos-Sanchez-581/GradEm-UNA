import React, { useState } from "react";
import { Link, Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { route } from 'ziggy-js';
import { router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";//para usar el botn definido como componente


interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  identificacion: string;
  telefono: string;
  fecha_nacimiento: string;
  genero: string;
  estado_empleo: string;
  estado_estudios: string;
  anio_graduacion: number | null;
  nivel_academico: string | null;
  tiempo_conseguir_empleo: number | null;
  area_laboral_id: number | null;
  id_canton: number | null;
  salario_promedio: string | null;
  tipo_empleo: string | null;
  id_universidad: number | null;
  id_carrera: number | null;
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

interface AreaLaboral {
  id: number;
  nombre: string;
}

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
  area_conocimiento: string;
}

interface Props {
  usuario: Usuario;
  areaLaborales: AreaLaboral[];
  paises: Pais[];
  provincias: Provincia[];
  cantones: Canton[];
  universidades: Universidad[];
  carreras: Carrera[];
  userPermisos: number[];
  rolNombre: string;
  empresa?: Empresa | null;
}

export default function Editar({
  usuario,
  empresa,
  areaLaborales,
  paises,
  provincias,
  cantones,
  universidades,
  carreras,
  userPermisos,
  rolNombre,
}: Props) {
  const [formData, setFormData] = useState<Usuario>(usuario);
  const modal = useModal();
  const [empresaData, setEmpresaData] = useState<Empresa | null>(
  empresa ? { ...empresa, id_canton: usuario.id_canton } : null
);
  const cantonActual = cantones.find((c) => c.id === usuario.id_canton);
  const provinciaActual = cantonActual
    ? provincias.find((p) => p.id === cantonActual.id_provincia)
    : null;
  const paisActual = provinciaActual
    ? paises.find((pa) => pa.id === provinciaActual.id_pais)
    : null;

  const universidadActual = universidades.find((u) => u.id === usuario.id_universidad);

  const [selectedUniversidad, setSelectedUniversidad] = useState<number | null>(
    universidadActual?.id ?? null
  );
  const [selectedPais, setSelectedPais] = useState<number | null>(paisActual?.id ?? null);
  const [selectedProvincia, setSelectedProvincia] = useState<number | null>(
    provinciaActual?.id ?? null
  );
  

  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  const [erroresEmpresa, setErroresEmpresa] = useState<{ [key: string]: string }>({});

  const validarCampoEmpresa = (name: string, value: string) => {
    let error = "";

    // Nombre de empresa: obligatorio, permite letras, números y algunos símbolos
    if (name === "nombre") {
      if (!value.trim()) error = "El nombre de la empresa es obligatorio.";
      else if (!/^[\w\s\d.,()\-]+$/.test(value))
        error = "Nombre de empresa inválido.";
    }

    if (name === "id_pais") {
      if (!value) error = "Debe seleccionar un país.";
    }

      if (name === "id_provincia") { 
      if (!value) error = "Debe seleccionar una provincia.";
    }
    
      if (name === "id_canton") {
      if (!value) error = "Debe seleccionar un cantón.";
    }
    setErroresEmpresa((prev) => ({ ...prev, [name]: error }));
  };


  const validarCampo = (name: string, value: string) => {//validaciones de los campos
  let error = "";
  const currentYear = new Date().getFullYear();

  if (["genero", "id_pais", "id_provincia", "id_canton", "id_universidad", "id_carrera"].includes(name)) {
    if (!value) {
      const etiquetas: Record<string, string> = {
        genero: "género",
        id_pais: "país",
        id_provincia: "provincia",
        id_canton: "cantón",
        id_universidad: "universidad",
        id_carrera: "carrera",
      };
      error = `Debe seleccionar ${etiquetas[name]}.`;
    }}

  if (name === "nombre_completo" || name === "persona_contacto") {
    if (!value.trim()) error = "El nombre es obligatorio.";
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(value))
      error = "El nombre solo puede contener letras y espacios.";
  }

  if (name === "correo" || name === "empresa_correo") {
    if (!value.trim()) error = "El correo es obligatorio.";
    else if (!/^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value))
      error = "Ingrese un correo válido.";
  }

  if (name === "identificacion" || name === "empresa_identificacion") {
    if (!/^[a-zA-Z0-9]{5,20}$/.test(value)) {
      error = "La identificación debe ser alfanumérica y tener entre 5 y 20 caracteres.";
    }
  }

  if (name === "telefono" || name === "empresa_telefono") {
    if (!/^\d{8}$/.test(value)) {
      error = "El teléfono debe ser de exactamente 8 dígitos numéricos.";
    }
  }

  if (name === "fecha_nacimiento") {
    if (!value) error = "Debe ingresar su fecha de nacimiento.";
    else {
      const year = new Date(value).getFullYear();
      if (year > currentYear - 16) error = "Debe tener al menos 16 años.";
      if (year < currentYear - 100) error = "La edad no puede superar los 100 años.";
    }
  }

  if (name === "estado_estudios") {
    if (!value) error = "Debe seleccionar su estado de estudios.";
  }

  if (name === "nivel_academico") {
    if (rolNombre?.toLowerCase() === "egresado" && !value) {
      error = "Debe seleccionar un nivel académico.";
    }
  }

  if (name === "anio_graduacion") {
    const year = Number(value);
    if (rolNombre?.toLowerCase() === "egresado") {
      if (!year) {
        error = "Debe ingresar el año de graduación.";
      } else if (year < 2007 || year > currentYear) {
        error = `El año debe estar entre 2007 y ${currentYear}.`;
      }
    }
  }

  if (name === "estado_empleo") {
    if (!value) error = "Debe seleccionar su estado de empleo.";
  }

  // Validaciones específicas si es empleado
  if (formData.estado_empleo?.toLowerCase() === "empleado") {
    if (name === "tiempo_conseguir_empleo" && !value)
      error = "Debe indicar los meses para conseguir empleo.";
    if (name === "area_laboral_id" && !value)
      error = "Debe seleccionar un área laboral.";
    if (name === "salario_promedio" && !value)
      error = "Debe seleccionar un rango salarial.";
    if (name === "tipo_empleo" && !value)
      error = "Debe seleccionar un tipo de empleo.";
  }

  if (rolNombre?.toLowerCase() === "egresado") {
    if (name === "nivel_academico" && !value)
      error = "Debe seleccionar el nivel académico alcanzado.";
    if (name === "anio_graduacion" && !value)
      error = "Debe indicar el año de graduación.";
  }

  setErrores((prev) => ({ ...prev, [name]: error }));
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  let newValue: string | number | null = value;

  // Validar en el momento
  validarCampo(name, value);

  // Normalizar valores numéricos
  if (
    ["anio_graduacion", "tiempo_conseguir_empleo", "area_laboral_id", "id_canton", "id_carrera"].includes(
      name
    )
  ) {
    newValue = value === "" ? null : Number(value);
  }

  if (newValue === "") newValue = null;

  // Si cambia a desempleado, reseteamos campos laborales + limpiamos errores
  if (name === "estado_empleo" && value.toLowerCase() === "desempleado") {
    setFormData({
      ...formData,
      estado_empleo: value,
      tiempo_conseguir_empleo: null,
      area_laboral_id: null,
      salario_promedio: null,
      tipo_empleo: null,
    });

    setErrores((prev) => {
      const nuevos = { ...prev };
      delete nuevos["tiempo_conseguir_empleo"];
      delete nuevos["area_laboral_id"];
      delete nuevos["salario_promedio"];
      delete nuevos["tipo_empleo"];
      return nuevos;
    });

    return;
  }

  setFormData({ ...formData, [name]: newValue });
};


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const erroresExistentesEmpresa = Object.values(erroresEmpresa).some((msg) => msg);
  const erroresExistentesUsuario = Object.values(errores).some((msg) => msg);
  

  // Si es empresa, enviar datos distintos
  if (rolNombre?.toLowerCase() === "empresa") {
    // 1. Validar campos de empresa y usuario si hay errores
    if (!empresaData?.id_canton) {
      await modal.alerta({
        titulo: "Campos incompletos",
        mensaje: "Debe seleccionar un cantón antes de enviar el formulario.",
      });
      return; // Detener envío
    }
    if (erroresExistentesEmpresa || erroresExistentesUsuario) {
    await modal.alerta({
      titulo: "Errores en el formulario",
      mensaje: "Por favor corrija los campos de la empresa antes de continuar.",
    });
    return; // Detener envío
  }
    const ok = await modal.confirmacion({
      titulo: "Confirmar cambios",
      mensaje: "¿Desea guardar los cambios de la empresa?",
    });
    if (!ok) return;

    router.put(
      route("perfil.update"),
      {
        // Campos del usuario
        id_usuario: formData.id_usuario,
        nombre_completo: formData.nombre_completo,
        identificacion: formData.identificacion,
        id_pais: empresaData?.id_pais ?? null,
        id_provincia: empresaData?.id_provincia ?? null,
        id_canton: empresaData?.id_canton ?? null,

        // Campos de empresa
        empresa_nombre: empresaData?.nombre ?? "",
        empresa_correo: empresaData?.correo ?? "",
        empresa_telefono: empresaData?.telefono ?? "",
        empresa_persona_contacto: empresaData?.persona_contacto ?? "",
      },
      {
        preserveScroll: true,
        onSuccess: async () => {
        await modal.alerta({
          titulo: "Actualización exitosa",
          mensaje: "Datos de la empresa actualizados correctamente.",
        });
        window.location.href = route("perfil.index");
      },
        onError: (errors) => {
          console.error("Errores de validación:", errors);
          modal.alerta({
            titulo: "Error al actualizar",
            mensaje: "Por favor revise los campos e intente nuevamente.",
          });
        },
      }
    );
      return;
  }
  // 1. Definir campos obligatorios base
  let camposObligatorios: string[] = [
    "nombre_completo",
    "correo",
    "identificacion",
    "telefono",
    "fecha_nacimiento",
    "genero",
    "id_canton",
    "id_universidad",
    "id_carrera",
  ];

  if (["estudiante", "egresado"].includes(rolNombre?.toLowerCase() ?? "")) {
    camposObligatorios.push("estado_estudios", "estado_empleo");
  }

  // Nivel académico y año graduacion obligatorio si es Graduado
  if (rolNombre?.toLowerCase() === "egresado") {
    camposObligatorios.push("nivel_academico", "anio_graduacion");
  }

  // Campos extra si es empleado
  if (formData.estado_empleo?.toLowerCase() === "empleado") {
    camposObligatorios.push(
      "tiempo_conseguir_empleo",
      "area_laboral_id",
      "salario_promedio",
      "tipo_empleo"
    );
  }

  // 2. Revisar campos vacíos
  const camposVacios = camposObligatorios.filter((campo) => {
    const valor = (formData as any)[campo];
    return valor === null || valor === "" || valor === undefined;
  });

  if (camposVacios.length > 0) {
    await modal.alerta({
      titulo: "Campos incompletos",
      mensaje: "Aún no se han llenado algunos campos obligatorios.",
    });
    return;
  }


  // 3. Revalidar todos los campos antes de enviar
  if (Object.values(errores).some((msg) => msg)) {
    await modal.alerta({
        titulo: "Errores en el formulario",
        mensaje: "Por favor corrija los campos antes de continuar.",
    });

    return;
  }

  // 4. Confirmación modal
    const ok = await modal.confirmacion({
      titulo: "Confirmar cambios",
      mensaje: "¿Está seguro que desea guardar los cambios en su perfil?",
    });
    if (!ok) return;

    // 5. Envío con Inertia y mensaje de éxito
    router.put(route("perfil.update"), { ...formData }, {
      preserveScroll: true,
      onSuccess: async () => {
        await modal.alerta({
          titulo: "Actualización exitosa",
          mensaje: "Sus datos se han actualizado correctamente.",
        });
        window.location.href = route("perfil.index"); // redirige solo al aceptar el modal
      },
      onError: (errors) => {
        console.error("Errores de validación:", errors);
        modal.alerta({
          titulo: "Error de validación",
          mensaje: "Por favor revise los campos e intente nuevamente.",
        });
      },
    });

};
  return (
    <>
      {/* ======= SI ES EMPRESA ======= */}
    {rolNombre?.toLowerCase() === "empresa" ? (
      <>
        <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6 text-black">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Editar empresa</h2>
            {/* Botón Volver */}
            <Button asChild variant="secondary">
              <Link href="/perfil">Volver</Link>
            </Button>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Datos personales reducidos */}
            <div>
              <h3 className="text-lg font-semibold mb-2 border-b pb-1">Datos personales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label>Nombre completo</label>
                    <input
                      type="text"
                      name="nombre_completo"
                      value={formData.nombre_completo ?? ""}
                      onChange={handleChange}
                      onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                      className={`border p-1 rounded w-full text-sm ${
                      errores.nombre_completo ? "border-red-500" : "border-gray-300"
                    }`}
                    />
                    {errores.nombre_completo && (
                      <span className="text-red-500 text-xs">{errores.nombre_completo}</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label>Identificación</label>
                    <input
                      type="text"
                      name="identificacion"
                      value={formData.identificacion ?? ""}
                      onChange={handleChange}
                      onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                      className={`border p-1 rounded w-full text-sm ${
                      errores.identificacion ? "border-red-500" : "border-gray-300"
                    }`}
                    />
                    {errores.identificacion && (
                      <span className="text-red-500 text-xs">{errores.identificacion}</span>
                    )}
                  </div>
                </div>
            </div>

            {/* Datos de la empresa */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 border-b pb-1">Datos de la empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre empresa */}
                <div className="flex flex-col">
                  <label>Nombre de la empresa</label>
                  <input
                    type="text"
                    name="nombre"
                    value={empresaData?.nombre ?? ""}
                    onChange={(e) =>
                      setEmpresaData({ ...empresaData!, nombre: e.target.value })
                    }
                    onBlur={(e) => validarCampoEmpresa(e.target.name, e.target.value)}
                    className={`border p-1 rounded w-full text-sm ${
                      erroresEmpresa.nombre ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {erroresEmpresa.nombre && <span className="text-red-500 text-xs">{erroresEmpresa.nombre}</span>}
                </div>

                {/* Correo */}
                <div className="flex flex-col">
                  <label>Correo de contacto</label>
                  <input
                    type="email"
                    name="correo"
                    value={empresaData?.correo ?? ""}
                    onChange={(e) =>
                      setEmpresaData({ ...empresaData!, correo: e.target.value })
                    }
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`border p-1 rounded w-full text-sm ${
                      errores.correo ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errores.correo && (
                    <span className="text-red-500 text-xs">{errores.correo}</span>
                  )}
                </div>

                {/* Teléfono */}
                <div className="flex flex-col">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={empresaData?.telefono ?? ""}
                    onChange={(e) => {
                      const soloNumeros = e.target.value.replace(/\D/g, ""); //elimina todo lo que no sea dígito
                      setEmpresaData({ ...empresaData!, telefono: soloNumeros });
                    }}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    maxLength={8}
                    inputMode="numeric" //muestra teclado numérico en móviles
                    className={`border p-1 rounded w-full text-sm ${
                      errores.telefono ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errores.telefono && (
                    <span className="text-red-500 text-xs">{errores.telefono}</span>
                  )}
                </div>

                {/* Persona de contacto */}
                <div className="flex flex-col">
                  <label>Persona de contacto</label>
                  <input
                    type="text"
                    name="persona_contacto"
                    value={empresaData?.persona_contacto ?? ""}
                    onChange={(e) =>
                      setEmpresaData({ ...empresaData!, persona_contacto: e.target.value })
                    }
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`border p-1 rounded w-full text-sm ${
                      errores.persona_contacto ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errores.persona_contacto && (
                    <span className="text-red-500 text-xs">{errores.persona_contacto}</span>
                  )}
                </div>

                {/* País */}
                <div className="flex flex-col">
                  <label className="text-sm">País</label>
                  <select
                    name="id_pais"
                    value={selectedPais ?? ""}
                    onChange={(e) => {
                      const paisId = e.target.value ? Number(e.target.value) : null;
                      setSelectedPais(paisId);
                      setSelectedProvincia(null);
                      setEmpresaData({ ...empresaData!, id_canton: null });
                      validarCampoEmpresa("id_pais", e.target.value);
                    }}
                    className={`border p-1 rounded w-full text-sm ${
                      erroresEmpresa.id_pais ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccione país</option>
                    {paises.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                  {erroresEmpresa.id_pais && (
                    <span className="text-red-500 text-xs">{erroresEmpresa.id_pais}</span>
                  )}
                </div>

                {/* Provincia */}
                <div className="flex flex-col">
                  <label className="text-sm">Provincia</label>
                  <select
                    name="id_provincia"
                    value={selectedProvincia ?? ""}
                    onChange={(e) => {
                      const provinciaId = e.target.value ? Number(e.target.value) : null;
                      setSelectedProvincia(provinciaId);
                      setEmpresaData({ ...empresaData!, id_canton: null });
                      validarCampoEmpresa("id_provincia", e.target.value);
                    }}
                    disabled={!selectedPais}
                    className={`border p-1 rounded w-full text-sm ${
                      erroresEmpresa.id_provincia ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccione provincia</option>
                    {provincias
                      .filter((p) => p.id_pais === selectedPais)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                  </select>
                  {erroresEmpresa.id_provincia && (
                    <span className="text-red-500 text-xs">{erroresEmpresa.id_provincia}</span>
                  )}
                </div>

                {/* Cantón */}
                <div className="flex flex-col">
                  <label className="text-sm">Cantón</label>
                  <select
                    name="id_canton"
                    value={empresaData?.id_canton ?? ""}
                    onChange={(e) => {
                      const cantonId = e.target.value ? Number(e.target.value) : null;
                      setEmpresaData({ ...empresaData!, id_canton: cantonId });
                      validarCampoEmpresa("id_canton", e.target.value);
                    }}
                    onBlur={(e) => validarCampoEmpresa("id_canton", e.target.value)}
                    disabled={!selectedProvincia}
                    className={`border p-1 rounded w-full text-sm ${
                      erroresEmpresa.id_canton ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccione cantón</option>
                    {cantones
                      .filter((c) => c.id_provincia === selectedProvincia)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                  </select>

                  {erroresEmpresa.id_canton && (
                    <span className="text-red-500 text-xs">{erroresEmpresa.id_canton}</span>
                  )}
                </div>

              </div>
            </div>

            {/* Botón general centrado */}
            <div className="mt-6 flex justify-center">
              <Button type="submit" variant="default" size="default" onClick={handleSubmit}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </div>
      </>
    ) : (
      /* Formulario normal para estudiante/egresado/etc */
      <>
        <Head title="Editar Perfil" />
        <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6 text-black">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Editar mi perfil</h2>
            <Button asChild variant="secondary">
              <Link href="/perfil">Volver</Link>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">
            {/* ================= DATOS PERSONALES ================= */}
            <div>
              <h3 className="text-lg font-semibold mb-2 border-b pb-1">
                Datos personales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="flex flex-col">
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={formData.nombre_completo ?? ""}
                    onChange={handleChange}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`border p-1 rounded w-full text-sm ${
                      errores.nombre_completo ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errores.nombre_completo && (
                    <span className="text-red-500 text-xs">{errores.nombre_completo}</span>
                  )}
                </div>

                {/* Correo */}
                <div className="flex flex-col">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo ?? ""}
                    onChange={handleChange}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`border p-1 rounded w-full text-sm ${
                      errores.correo ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errores.correo && (
                    <span className="text-red-500 text-xs">{errores.correo}</span>
                  )}
                </div>

                {/* Identificación */}
                <div className="flex flex-col">
                  <label>Identificación</label>
                  <input
                    type="text"
                    name="identificacion"
                    value={formData.identificacion ?? ""}
                    onChange={handleChange}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`border p-1 rounded w-full text-sm ${
                      errores.identificacion ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errores.identificacion && (
                    <span className="text-red-500 text-xs">{errores.identificacion}</span>
                  )}
                </div>

                {/* Teléfono */}
                <div className="flex flex-col">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono ?? ""}
                    onChange={(e) => {
                      //Permite solo números eliminando cualquier otro carácter
                      const soloNumeros = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, telefono: soloNumeros });
                    }}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    maxLength={8} // límite de 8 dígitos
                    inputMode="numeric" // teclado numérico en móviles
                    className={`border p-1 rounded w-full text-sm ${
                      errores.telefono ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errores.telefono && (
                    <span className="text-red-500 text-xs">{errores.telefono}</span>
                  )}
                </div>

                {/* Fecha nacimiento */}
                <div className="flex flex-col">
                  <label className="text-sm">Fecha de nacimiento</label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento ?? ""}
                    onChange={handleChange}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`border p-1 rounded w-full text-sm ${
                      errores.fecha_nacimiento ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errores.fecha_nacimiento && (
                    <span className="text-red-500 text-xs">{errores.fecha_nacimiento}</span>
                  )}
                </div>

                {/* Género */}
                <div className="flex flex-col">
                  <label className="text-sm">Género</label>
                  <select
                    name="genero"
                    value={formData.genero ?? ""}
                    onChange={handleChange}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    className={`border p-1 rounded w-full text-sm ${
                      errores.genero ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccione género</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                  {errores.genero && (
                    <span className="text-red-500 text-xs">{errores.genero}</span>
                  )}
                </div>

                {/* País */}
                <div className="flex flex-col">
                  <label className="text-sm">País</label>
                  <select
                    name="id_pais"
                    value={selectedPais ?? ""}
                    onChange={(e) => {
                      const paisId = e.target.value ? Number(e.target.value) : null;
                      setSelectedPais(paisId);
                      setSelectedProvincia(null);
                      setFormData({ ...formData, id_canton: null });
                      validarCampo("id_pais", e.target.value);
                    }}
                    className={`border p-1 rounded w-full text-sm ${
                      errores.id_pais ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccione país</option>
                    {paises.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                  {errores.id_pais && (
                    <span className="text-red-500 text-xs">{errores.id_pais}</span>
                  )}
                </div>

                {/* Provincia */}
                <div className="flex flex-col">
                  <label className="text-sm">Provincia</label>
                  <select
                    name="id_provincia"
                    value={selectedProvincia ?? ""}
                    onChange={(e) => {
                      const provinciaId = e.target.value ? Number(e.target.value) : null;
                      setSelectedProvincia(provinciaId);
                      setFormData({ ...formData, id_canton: null });
                      validarCampo("id_provincia", e.target.value);
                    }}
                    disabled={!selectedPais}
                    className={`border p-1 rounded w-full text-sm ${
                      errores.id_provincia ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccione provincia</option>
                    {provincias
                      .filter((p) => p.id_pais === selectedPais)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                  </select>
                  {errores.id_provincia && (
                    <span className="text-red-500 text-xs">{errores.id_provincia}</span>
                  )}
                </div>

                {/* Cantón */}
                <div className="flex flex-col">
                  <label className="text-sm">Cantón</label>
                  <select
                    name="id_canton"
                    value={formData.id_canton ?? ""}
                    onChange={handleChange}
                    onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                    disabled={!selectedProvincia}
                    className={`border p-1 rounded w-full text-sm ${
                      errores.id_canton ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccione cantón</option>
                    {cantones
                      .filter((c) => c.id_provincia === selectedProvincia)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                  </select>
                  {errores.id_canton && (
                    <span className="text-red-500 text-xs">{errores.id_canton}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ================= DATOS ACADÉMICOS ================= */}
            <div>
              <h3 className="text-lg font-semibold mb-2 border-b pb-1">
                Datos académicos
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Estado, nivel y año — solo si es estudiante o egresado */}
                {["egresado", "estudiante"].includes(rolNombre?.toLowerCase() ?? "") && (
                  <>
                    {/* Estado de estudios — solo visible si el rol es EGRESADO */}
                    {["egresado", "estudiante"].includes(rolNombre?.toLowerCase() ?? "") && (
                      <div className="flex flex-col">
                        <label className="text-sm">Estado de estudios</label>
                        <select
                          name="estado_estudios"
                          value={formData.estado_estudios ?? ""}
                          onChange={handleChange}
                          onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                          className={`border p-1 rounded w-full text-sm ${
                            errores.estado_estudios ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Seleccione estado</option>
                          <option value="activo">Activo</option>
                          <option value="pausado">Pausado</option>
                          <option value="finalizado">Finalizado</option>
                        </select>
                        {errores.estado_estudios && (
                          <span className="text-red-500 text-xs">{errores.estado_estudios}</span>
                        )}
                      </div>
                    )}

                    {/* Nivel académico y año — solo egresado */}
                    {rolNombre?.toLowerCase() === "egresado" && (
                      <>
                        <div className="flex flex-col">
                          <label className="text-sm">Nivel académico alcanzado</label>
                          <select
                            name="nivel_academico"
                            value={formData.nivel_academico ?? ""}
                            onChange={handleChange}
                            className={`border p-1 rounded w-full text-sm ${
                              errores.nivel_academico ? "border-red-500" : "border-gray-300"
                            }`}
                          >
                            <option value="">Seleccione nivel académico</option>
                            <option value="Diplomado">Diplomado</option>
                            <option value="Bachillerato">Bachillerato</option>
                            <option value="Licenciatura">Licenciatura</option>
                            <option value="Maestría">Maestría</option>
                            <option value="Doctorado">Doctorado</option>
                          </select>
                        </div>

                        <div className="flex flex-col">
                          <label className="text-sm">Año de graduación</label>
                          <input
                            type="number"
                            name="anio_graduacion"
                            value={formData.anio_graduacion ?? ""}
                            onChange={handleChange}
                            min={2007}
                            max={new Date().getFullYear()}
                            className={`border p-1 rounded w-full text-sm ${
                              errores.anio_graduacion ? "border-red-500" : "border-gray-300"
                            }`}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Universidad y carrera — visibles para todos, excepto empresa */}
                {rolNombre?.toLowerCase() !== "empresa" && (
                  <>
                    {/* Universidad */}
                    <div className="flex flex-col">
                      <label className="text-sm">Universidad</label>
                      <select
                        name="id_universidad"
                        value={selectedUniversidad ?? ""}
                        onChange={(e) => {
                          const uniId = e.target.value ? Number(e.target.value) : null;
                          setSelectedUniversidad(uniId);
                          setFormData({ ...formData, id_carrera: null, id_universidad: uniId });
                          validarCampo("id_universidad", e.target.value);
                        }}
                        className={`border p-1 rounded w-full text-sm ${
                          errores.id_universidad ? "border-red-500" : "border-gray-300"
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
                        <span className="text-red-500 text-xs">{errores.id_universidad}</span>
                      )}
                    </div>

                    {/* Carrera */}
                    <div className="flex flex-col">
                      <label className="text-sm">Carrera</label>
                      <select
                        name="id_carrera"
                        value={formData.id_carrera ?? ""}
                        onChange={handleChange}
                        onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                        disabled={!selectedUniversidad}
                        className={`border p-1 rounded w-full text-sm ${
                          errores.id_carrera ? "border-red-500" : "border-gray-300"
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
                      {errores.id_carrera && (
                        <span className="text-red-500 text-xs">{errores.id_carrera}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ================= DATOS LABORALES ================= */}
            {["egresado", "estudiante"].includes(rolNombre?.toLowerCase() ?? "") && (
              <div>
                <h3 className="text-lg font-semibold mb-2 border-b pb-1">
                  Datos laborales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Estado empleo */}
                  <div className="flex flex-col">
                    <label className="text-sm">Estado de empleo</label>
                    <select
                      name="estado_empleo"
                      value={formData.estado_empleo ?? ""}
                      onChange={handleChange}
                      onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                      className={`border p-1 rounded w-full text-sm ${
                        errores.estado_empleo ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Seleccione estado de empleo</option>
                      <option value="empleado">Empleado</option>
                      <option value="desempleado">Desempleado</option>
                    </select>
                    {errores.estado_empleo && (
                      <span className="text-red-500 text-xs">{errores.estado_empleo}</span>
                    )}
                  </div>

                  {/* Campos adicionales si es empleado */}
                  {formData.estado_empleo?.toLowerCase() === "empleado" && (
                    <>
                    <div className="flex flex-col">
                        <label className="text-sm">Meses para conseguir empleo</label>
                        <input
                          type="number"
                          name="tiempo_conseguir_empleo"
                          value={formData.tiempo_conseguir_empleo ?? ""}
                          onChange={handleChange}
                          onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                          min={0}
                          className={`border p-1 rounded w-full text-sm ${
                            errores.tiempo_conseguir_empleo ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errores.tiempo_conseguir_empleo && (
                          <span className="text-red-500 text-xs">
                            {errores.tiempo_conseguir_empleo}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-sm">Área laboral</label>
                        <select
                          name="area_laboral_id"
                          value={formData.area_laboral_id ?? ""}
                          onChange={handleChange}
                          onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                          className={`border p-1 rounded w-full text-sm ${
                            errores.area_laboral_id ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Seleccione área laboral</option>
                          {areaLaborales.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.nombre}
                            </option>
                          ))}
                        </select>
                        {errores.area_laboral_id && (
                          <span className="text-red-500 text-xs">{errores.area_laboral_id}</span>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-sm">Rango salarial</label>
                        <select
                          name="salario_promedio"
                          value={formData.salario_promedio ?? ""}
                          onChange={handleChange}
                          onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                          className={`border p-1 rounded w-full text-sm ${
                            errores.salario_promedio ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Seleccione rango salarial</option>
                          <option value="<300000">Menor a ₡300,000</option>
                          <option value="300000-600000">₡300,000 - ₡600,000</option>
                          <option value="600000-1000000">₡600,000 - ₡1,000,000</option>
                          <option value=">1000000">Mayor a ₡1,000,000</option>
                        </select>
                        {errores.salario_promedio && (
                          <span className="text-red-500 text-xs">{errores.salario_promedio}</span>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-sm">Tipo de empleo</label>
                        <select
                          name="tipo_empleo"
                          value={formData.tipo_empleo ?? ""}
                          onChange={handleChange}
                          onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                          className={`border p-1 rounded w-full text-sm ${
                            errores.tipo_empleo ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Seleccione tipo de empleo</option>
                          <option value="Tiempo completo">Tiempo completo</option>
                          <option value="Medio tiempo">Medio tiempo</option>
                          <option value="Temporal">Temporal</option>
                          <option value="Independiente">Independiente</option>
                          <option value="Práctica">Práctica</option>
                        </select>
                        {errores.tipo_empleo && (
                          <span className="text-red-500 text-xs">{errores.tipo_empleo}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Botón general centrado */}
            <div className="mt-6 flex justify-center">
              <Button type="submit" variant="default" size="default" onClick={handleSubmit}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </div>

      </>
    )}
    </>
  )}
  

Editar.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
