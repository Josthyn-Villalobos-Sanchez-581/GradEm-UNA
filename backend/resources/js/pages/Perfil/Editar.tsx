import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { route } from 'ziggy-js';
import { router } from '@inertiajs/react';



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
}

export default function Editar({
  usuario,
  areaLaborales,
  paises,
  provincias,
  cantones,
  universidades,
  carreras,
  userPermisos,
}: Props) {
  const [formData, setFormData] = useState<Usuario>(usuario);
  const modal = useModal();

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

  const validarCampo = (name: string, value: string) => {
    let error = "";
    const currentYear = new Date().getFullYear();

    if (name === "nombre_completo") {
      if (!value.trim()) error = "El nombre es obligatorio.";
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(value))
        error = "El nombre solo puede contener letras y espacios.";
    }

    if (name === "correo") {
      if (!value.trim()) error = "El correo es obligatorio.";
      else if (!/^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value))
        error = "Ingrese un correo válido.";
    }

    if (name === "identificacion") {
      if (!/^\d{9}$/.test(value))
        error = "La identificación debe tener exactamente 9 dígitos.";
    }

    if (name === "telefono") {
      if (!/^\+\d{8,15}$/.test(value))
        error =
          "El teléfono debe incluir extensión internacional (+) y entre 8 y 15 dígitos.";
    }

    if (name === "fecha_nacimiento") {
      if (!value) error = "Debe ingresar su fecha de nacimiento.";
      else {
        const year = new Date(value).getFullYear();
        if (year > currentYear - 16) error = "Debe tener al menos 16 años.";
        if (year < currentYear - 100) error = "La edad no puede superar los 100 años.";
        if (year.toString().length !== 4)
          error = "El año de nacimiento debe tener 4 cifras.";
      }
    }

    if (name === "anio_graduacion") {
      const year = Number(value);
      if (formData.nivel_academico && !year)
        error = "Debe ingresar el año de graduación.";
      else if (year && (year < 2007 || year > currentYear))
        error = `El año debe estar entre 2007 y ${currentYear}.`;
    }

    setErrores((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue: string | number | null = value;

    // Validar el campo en el momento
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

    // Si cambia el estado de empleo a desempleado, resetear campos relacionados
    if (name === "estado_empleo" && value.toLowerCase() === "desempleado") {
        setFormData({
            ...formData,
            estado_empleo: value,
            tiempo_conseguir_empleo: null,
            area_laboral_id: null,
            salario_promedio: null,
            tipo_empleo: null,
        });
        return;
    }

    setFormData({ ...formData, [name]: newValue });
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1. Revalidar todos los campos antes de enviar
  if (Object.values(errores).some((msg) => msg)) {
    await modal.alerta({
        titulo: "Errores en el formulario",
        mensaje: "Por favor corrija los campos marcados en rojo antes de continuar.",
    });

    return;
  }

  // 2. Confirmación modal
    const ok = await modal.confirmacion({
      titulo: "Confirmar cambios",
      mensaje: "¿Está seguro que desea guardar los cambios en su perfil?",
    });
    if (!ok) return;

    // 3. Envío con Inertia y mensaje de éxito
   router.put(route("perfil.update"), { ...formData }, {
  preserveScroll: true,
  onSuccess: () => {
    window.location.href = route("perfil.index"); // redirección tradicional
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
    <Head title="Editar Perfil" />
    <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6 text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Editar mi perfil</h2>
        <Link
          href="/perfil"
          className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded"
        >
          Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="flex flex-col">
          <label>Nombre completo</label>
          <input
            type="text"
            name="nombre_completo"
            value={formData.nombre_completo ?? ""}
            onChange={handleChange}
            onBlur={(e) => validarCampo(e.target.name, e.target.value)}
            className="border p-1 rounded w-full text-sm"
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
            className="border p-1 rounded w-full text-sm"
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
            className="border p-1 rounded w-full text-sm"
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
            onChange={handleChange}
            onBlur={(e) => validarCampo(e.target.name, e.target.value)}
            className="border p-1 rounded w-full text-sm"
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
            className="border p-1 rounded w-full text-sm"
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
            className="border p-1 rounded w-full text-sm"
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

        {/* Año de graduación */}
        <div className="flex flex-col">
          <label className="text-sm">Año de graduación</label>
          <input
            type="number"
            name="anio_graduacion"
            value={formData.anio_graduacion ?? ""}
            onChange={handleChange}
            onBlur={(e) => validarCampo(e.target.name, e.target.value)}
            min={2007}
            max={new Date().getFullYear()}
            className="border p-1 rounded w-full text-sm"
          />
          {errores.anio_graduacion && (
            <span className="text-red-500 text-xs">{errores.anio_graduacion}</span>
          )}
        </div>

        {/* Estado estudios */}
        <div className="flex flex-col">
          <label className="text-sm">Estado de estudios</label>
          <select
            name="estado_estudios"
            value={formData.estado_estudios ?? ""}
            onChange={handleChange}
            onBlur={(e) => validarCampo(e.target.name, e.target.value)}
            className="border p-1 rounded w-full text-sm"
          >
            <option value="">Seleccione estado</option>
            <option value="Graduado">Graduado</option>
            <option value="Estudiando">Estudiando</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Otro">Otro</option>
          </select>
          {errores.estado_estudios && (
            <span className="text-red-500 text-xs">{errores.estado_estudios}</span>
          )}
        </div>

        {/* Nivel académico */}
        <div className="flex flex-col">
          <label className="text-sm">Nivel académico</label>
          <select
            name="nivel_academico"
            value={formData.nivel_academico ?? ""}
            onChange={handleChange}
            onBlur={(e) => validarCampo(e.target.name, e.target.value)}
            className="border p-1 rounded w-full text-sm"
          >
            <option value="">Seleccione nivel académico</option>
            <option value="Diplomado">Diplomado</option>
            <option value="Bachillerato">Bachillerato</option>
            <option value="Licenciatura">Licenciatura</option>
            <option value="Maestría">Maestría</option>
            <option value="Doctorado">Doctorado</option>
          </select>
          {errores.nivel_academico && (
            <span className="text-red-500 text-xs">{errores.nivel_academico}</span>
          )}
        </div>

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
            className="border p-1 rounded w-full text-sm"
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
            className="border p-1 rounded w-full text-sm"
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

        {/* Estado empleo */}
        <div className="flex flex-col">
          <label className="text-sm">Estado de empleo</label>
          <select
            name="estado_empleo"
            value={formData.estado_empleo ?? ""}
            onChange={handleChange}
            onBlur={(e) => validarCampo(e.target.name, e.target.value)}
            className="border p-1 rounded w-full text-sm"
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
                className="border p-1 rounded w-full text-sm"
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
                className="border p-1 rounded w-full text-sm"
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
                className="border p-1 rounded w-full text-sm"
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
                className="border p-1 rounded w-full text-sm"
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
            className="border p-1 rounded w-full text-sm"
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
            className="border p-1 rounded w-full text-sm"
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
            className="border p-1 rounded w-full text-sm"
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

          {/* Botón */}
          <button
            type="submit"
            className="bg-[#034991] hover:bg-[#0563c1] text-white px-3 py-1 rounded col-span-2"
          >
            Guardar cambios
          </button>
        </form>
      </div>
    </>
  );
}

Editar.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
