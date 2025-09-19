import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";

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
  salario_promedio: string | null; // ahora string, no number
  tipo_empleo: string | null;
}

interface AreaLaboral {
  id: number;
  nombre: string;
}

interface Ubicacion {
  id: number;
  pais: string;
  provincia: string;
  canton: string;
}

interface Props {
  usuario: Usuario;
  areaLaborales: AreaLaboral[];
  ubicaciones: Ubicacion[];
  userPermisos: number[];
}

export default function Index({ usuario, areaLaborales, ubicaciones, userPermisos }: Props) {
  const [formData, setFormData] = useState<Usuario>(usuario);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue: string | number | null = value;

    // Convertir valores de número de string a number o null
    if (name === 'anio_graduacion' || name === 'tiempo_conseguir_empleo' || name === 'area_laboral_id' || name === 'ubicacion_id') {
      newValue = value === "" ? null : Number(value);
    }
    
    // Convertir el string vacío de los select a null para campos string opcionales
    if (newValue === "") {
        newValue = null;
    }

    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Solución para el error de tipado: crear una copia del objeto
    // para que TypeScript no se queje por la falta de un "index signature".
    const dataToSend = { ...formData };

    // Se envían los datos ya formateados a Inertia.
    Inertia.put(`/perfil/${usuario.id_usuario}`, dataToSend);
  };

  return (
    <>
      <Head title="Mi Perfil" />
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6 text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Mi Perfil</h2>
          <Link
            href="/dashboard"
            className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded"
          >
            Volver
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Datos básicos */}
          <input
            type="text"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            placeholder="Nombre completo"
            className="border p-2 rounded w-full"
          />

          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            placeholder="Correo"
            className="border p-2 rounded w-full"
          />

          <input
            type="text"
            name="identificacion"
            value={formData.identificacion}
            onChange={handleChange}
            placeholder="Identificación"
            className="border p-2 rounded w-full"
          />

          <input
            type="text"
            name="telefono"
            value={formData.telefono ?? ""}
            onChange={handleChange}
            placeholder="Teléfono"
            className="border p-2 rounded w-full"
          />

          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento ?? ""}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />

          <select
            name="genero"
            value={formData.genero ?? ""}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Seleccione género</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>

          <input
            type="number"
            name="anio_graduacion"
            value={formData.anio_graduacion ?? ""}
            onChange={handleChange}
            placeholder="Año de graduación"
            className="border p-2 rounded w-full"
          />
          
          <select
            name="estado_estudios"
            value={formData.estado_estudios ?? ""}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Seleccione estado de estudios</option>
            <option value="Graduado">Graduado</option>
            <option value="Estudiando">Estudiando</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Otro">Otro</option>
          </select>

          <select
            name="nivel_academico"
            value={formData.nivel_academico ?? ""}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Nivel Académico</option>
            <option value="Diplomado">Diplomado</option>
            <option value="Bachillerato">Bachillerato</option>
            <option value="Licenciatura">Licenciatura</option>
            <option value="Maestría">Maestría</option>
            <option value="Doctorado">Doctorado</option>
          </select>

          {/* Estado de empleo */}
          <select
            name="estado_empleo"
            value={formData.estado_empleo ?? ""}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Seleccione estado de empleo</option>
            <option value="Empleado">Empleado</option>
            <option value="Desempleado">Desempleado</option>
          </select>

          {/* Campos condicionales solo si es empleado */}
          {formData.estado_empleo === "Empleado" && (
            <>
              <input
                type="number"
                name="tiempo_conseguir_empleo"
                value={formData.tiempo_conseguir_empleo ?? ""}
                onChange={handleChange}
                placeholder="Meses para conseguir empleo"
                className="border p-2 rounded w-full"
              />

              <select
                name="area_laboral_id"
                value={formData.area_laboral_id ?? ""}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              >
                <option value="">Seleccione área laboral</option>
                {areaLaborales.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>

              <select
                name="salario_promedio"
                value={formData.salario_promedio ?? ""}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              >
                <option value="">Seleccione rango salarial</option>
                <option value="<300000">Menor a ₡300,000</option>
                <option value="300000-600000">₡300,000 - ₡600,000</option>
                <option value="600000-1000000">₡600,000 - ₡1,000,000</option>
                <option value=">1000000">Mayor a ₡1,000,000</option>
              </select>

              <select
                name="tipo_empleo"
                value={formData.tipo_empleo ?? ""}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              >
                <option value="">Tipo de empleo</option>
                <option value="Tiempo completo">Tiempo completo</option>
                <option value="Medio tiempo">Medio tiempo</option>
                <option value="Temporal">Temporal</option>
                <option value="Independiente">Independiente</option>
                <option value="Práctica">Práctica</option>
              </select>
            </>
          )}

          {/* Ubicación */}
          <select
            name="id_canton"
            value={formData.id_canton ?? ""}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Seleccione ubicación</option>
            {ubicaciones.map((u) => (
              <option key={u.id} value={u.id}>
                {u.pais} - {u.provincia} - {u.canton}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-[#0D47A1] hover:bg-blue-800 text-white px-4 py-2 rounded col-span-2"
          >
            Actualizar Perfil
          </button>
        </form>
      </div>
    </>
  );
}

// Layout dinámico
Index.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
