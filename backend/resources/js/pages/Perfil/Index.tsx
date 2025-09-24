import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal"; // MOD: importar el modal

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


export default function Index({ usuario, areaLaborales, paises, provincias, cantones, universidades, carreras, userPermisos }: Props) {
  const [formData, setFormData] = useState<Usuario>(usuario);
  const [editando, setEditando] = useState(false);
  const modal = useModal(); // MOD: usar el modal

  // --- Derivar país y provincia actuales en base al id_canton ---
  const cantonActual = cantones.find(c => c.id === usuario.id_canton);
  const provinciaActual = cantonActual ? provincias.find(p => p.id === cantonActual.id_provincia) : null;
  const paisActual = provinciaActual ? paises.find(pa => pa.id === provinciaActual.id_pais) : null;

  const universidadActual = universidades.find(u => u.id === usuario.id_universidad);
  const carreraActual = carreras.find(c => c.id === usuario.id_carrera);

  const [selectedUniversidad, setSelectedUniversidad] = useState<number | null>(universidadActual?.id ?? null);


  const [selectedPais, setSelectedPais] = useState<number | null>(paisActual?.id ?? null);
  const [selectedProvincia, setSelectedProvincia] = useState<number | null>(provinciaActual?.id ?? null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  let newValue: string | number | null = value;

  // Validaciones personalizadas
  if (name === "identificacion") {
    if (!/^\d{0,9}$/.test(value)) return; // máximo 8 dígitos
  }

  if (name === "nombre_completo") {
    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]*$/.test(value)) return; // solo letras y espacios
  }

  if (name === "telefono") {
    if (!/^\d{0,8}$/.test(value)) return; // máximo 8 dígitos
  }

  if (name === "anio_graduacion") {
    const year = Number(value);
    const currentYear = new Date().getFullYear();
    if (year && (year < 2007 || year > currentYear)) return;
  }

  if (["anio_graduacion", "tiempo_conseguir_empleo", "area_laboral_id", "id_canton", "id_carrera"].includes(name)) { 
    newValue = value === "" ? null : Number(value);
  }

  if (newValue === "") newValue = null;

  setFormData({ ...formData, [name]: newValue });
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // MOD: Confirmación antes de guardar cambios
    const ok = await modal.confirmacion({
      titulo: "Confirmar cambios",
      mensaje: "¿Está seguro que desea guardar los cambios en su perfil?"
    });
    if (!ok) return;

    const dataToSend = { ...formData };
    Inertia.put(`/perfil/${usuario.id_usuario}`, dataToSend, {
      onSuccess: () => setEditando(false),
    });
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

        {!editando ? (
          // Vista solo lectura, aca mostramos la informacion del perfil y opcion para poder editar
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Nombre:</strong> {usuario.nombre_completo}</p>
            <p><strong>Correo:</strong> {usuario.correo}</p>
            <p><strong>Identificación:</strong> {usuario.identificacion}</p>
            <p><strong>Teléfono:</strong> {usuario.telefono ?? "N/A"}</p>
            <p><strong>Fecha Nacimiento:</strong> {usuario.fecha_nacimiento ?? "N/A"}</p>
            <p><strong>Género:</strong> {usuario.genero ?? "N/A"}</p>
            <p><strong>Universidad:</strong> {universidadActual?.nombre ?? "N/A"}</p>
            <p><strong>Carrera:</strong> {carreraActual?.nombre ?? "N/A"}</p>
            <p><strong>Estado Estudios:</strong> {usuario.estado_estudios ?? "N/A"}</p>
            <p><strong>Año Graduación:</strong> {usuario.anio_graduacion ?? "N/A"}</p>
            <p><strong>Nivel Académico:</strong> {usuario.nivel_academico ?? "N/A"}</p>
            <p><strong>Estado Empleo:</strong> {usuario.estado_empleo ?? "N/A"}</p>
            <p><strong>Tiempo para conseguir empleo:</strong> {usuario.tiempo_conseguir_empleo ?? "N/A"}</p>
            <p><strong>Área Laboral:</strong> {areaLaborales.find(a => a.id === usuario.area_laboral_id)?.nombre ?? "N/A"}</p>
            <p><strong>Ubicación:</strong> {
              paisActual && provinciaActual && cantonActual
                ? `${paisActual.nombre} - ${provinciaActual.nombre} - ${cantonActual.nombre}`
                : "N/A"
            }</p>
            <p><strong>Salario Promedio:</strong> {usuario.salario_promedio ?? "N/A"}</p>
            <p><strong>Tipo Empleo:</strong> {usuario.tipo_empleo ?? "N/A"}</p>

            <button
              onClick={() => setEditando(true)}
              className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded col-span-2"
            >
              Editar Perfil
            </button>
          </div>
        ) : (
          // Formulario de edición
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="nombre_completo"
              value={formData.nombre_completo ?? ""}
              onChange={handleChange}
              placeholder="Nombre completo"
              pattern="^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$"
              title="El nombre solo puede contener letras y espacios"
              className="border p-2 rounded w-full"
            />

            <input
              type="email"
              name="correo"
              value={formData.correo ?? ""}
              onChange={handleChange}
              placeholder="Correo"
              className="border p-2 rounded w-full"
            />

            <input
              type="text"
              name="identificacion"
              value={formData.identificacion ?? ""}
              onChange={handleChange}
              placeholder="Identificación"
              pattern="^\d{9}$"
              title="La identificación debe tener exactamente 9 dígitos"
              className="border p-2 rounded w-full"
            />

            
            <input
              type="text"
              name="telefono"
              value={formData.telefono ?? ""}
              onChange={handleChange}
              placeholder="Teléfono"
              pattern="^\d{8}$"
              title="El teléfono debe tener exactamente 8 dígitos"
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
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>

            <input
              type="number"
              name="anio_graduacion"
              value={formData.anio_graduacion ?? ""}
              onChange={handleChange}
              placeholder="Año de graduación"
              min={2007}
              max={new Date().getFullYear()}
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

            {/* Select universidad */}
            <select
              value={selectedUniversidad ?? ""}
              onChange={(e) => {
                const uniId = e.target.value ? Number(e.target.value) : null;
                setSelectedUniversidad(uniId);
                setFormData({ ...formData, id_carrera: null, id_universidad: uniId });
              }}
              className="border p-2 rounded w-full"
            >
              <option value="">Seleccione universidad</option>
              {universidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} ({u.sigla})
                </option>
              ))}
            </select>

            {/* Select carrera */}
            <select
              name="id_carrera"
              value={formData.id_carrera ?? ""}
              onChange={handleChange}
              disabled={!selectedUniversidad}
              className="border p-2 rounded w-full"
            >
              <option value="">Seleccione carrera</option>
              {carreras
                .filter((c) => c.id_universidad === selectedUniversidad)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} - {c.area_conocimiento}
                  </option>
                ))}
            </select>


            <select
              name="estado_empleo"
              value={formData.estado_empleo ?? ""}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Seleccione estado de empleo</option>
              <option value="empleado">Empleado</option>
              <option value="desempleado">Desempleado</option>
            </select>

            {formData.estado_empleo?.toLowerCase() === "empleado" && (
              <>
                <input
                  type="number"
                  name="tiempo_conseguir_empleo"
                  value={formData.tiempo_conseguir_empleo ?? ""}
                  onChange={handleChange}
                  placeholder="Meses para conseguir empleo"
                  min={0}
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

  {/* Select país */}
            <select
              value={selectedPais ?? ""}
              onChange={(e) => {
                const paisId = e.target.value ? Number(e.target.value) : null;
                setSelectedPais(paisId);
                setSelectedProvincia(null);
                setFormData({ ...formData, id_canton: null });
              }}
              className="border p-2 rounded w-full"
            >
              <option value="">Seleccione país</option>
              {paises.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>

            {/* Select provincia */}
            <select
              value={selectedProvincia ?? ""}
              onChange={(e) => {
                const provinciaId = e.target.value ? Number(e.target.value) : null;
                setSelectedProvincia(provinciaId);
                setFormData({ ...formData, id_canton: null });
              }}
              disabled={!selectedPais}
              className="border p-2 rounded w-full"
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

            {/* Select cantón */}
            <select
              name="id_canton"
              value={formData.id_canton ?? ""}
              onChange={handleChange}
              disabled={!selectedProvincia}
              className="border p-2 rounded w-full"
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

            {/* Botones */}
            <button
              type="submit"
              className="bg-[#034991] hover:bg-[#0563c1]   text-white px-4 py-2 rounded col-span-2"
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded col-span-2"
            >
              Cancelar
            </button>
          </form>
        )}
      </div>
    </>
  );
}

// Layout dinámico
Index.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};