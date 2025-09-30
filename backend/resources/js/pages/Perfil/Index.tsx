import React from "react";
import { Link, Head, usePage } from "@inertiajs/react";
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

export default function Index({
  usuario,
  areaLaborales,
  paises,
  provincias,
  cantones,
  universidades,
  carreras,
}: Props) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

  const cantonActual = cantones.find((c) => c.id === usuario.id_canton);
  const provinciaActual = cantonActual
    ? provincias.find((p) => p.id === cantonActual.id_provincia)
    : null;
  const paisActual = provinciaActual
    ? paises.find((pa) => pa.id === provinciaActual.id_pais)
    : null;

  const universidadActual = universidades.find((u) => u.id === usuario.id_universidad);
  const carreraActual = carreras.find((c) => c.id === usuario.id_carrera);

  const renderValor = (valor: any) =>
    valor ? <span>{valor}</span> : <span className="text-gray-400 italic">N/A</span>;

  return (
    <>
      <Head title="Mi Perfil" />
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6 text-black">
        {/* Avisos flash */}
        {flash?.success && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded">
            {flash.success}
          </div>
        )}
        {flash?.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded">
            {flash.error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
          <Link
            href="/dashboard"
            className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded"
          >
            Volver
          </Link>
        </div>

        {/* Datos personales */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
            Datos personales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong className="text-gray-700">Nombre:</strong> {renderValor(usuario.nombre_completo)}</p>
            <p><strong className="text-gray-700">Correo:</strong> {renderValor(usuario.correo)}</p>
            <p><strong className="text-gray-700">Identificación:</strong> {renderValor(usuario.identificacion)}</p>
            <p><strong className="text-gray-700">Teléfono:</strong> {renderValor(usuario.telefono)}</p>
            <p><strong className="text-gray-700">Fecha de Nacimiento:</strong> {renderValor(usuario.fecha_nacimiento)}</p>
            <p><strong className="text-gray-700">Género:</strong> {renderValor(usuario.genero)}</p>
          </div>
        </div>

        {/* Datos académicos */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
            Datos académicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong className="text-gray-700">Estado de estudios:</strong> {renderValor(usuario.estado_estudios)}</p>
            <p><strong className="text-gray-700">Nivel académico:</strong> {renderValor(usuario.nivel_academico)}</p>
            <p><strong className="text-gray-700">Año de graduación:</strong> {renderValor(usuario.anio_graduacion)}</p>
            <p><strong className="text-gray-700">Universidad:</strong> {renderValor(universidadActual?.nombre)}</p>
            <p><strong className="text-gray-700">Carrera:</strong> {renderValor(carreraActual?.nombre)}</p>
          </div>
        </div>

        {/* Datos laborales */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
            Datos laborales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong className="text-gray-700">Estado de empleo:</strong> {renderValor(usuario.estado_empleo)}</p>
            {usuario.estado_empleo?.toLowerCase() === "empleado" && (
              <>
                <p><strong className="text-gray-700">Tiempo para conseguir empleo:</strong> {renderValor(usuario.tiempo_conseguir_empleo)}</p>
                <p><strong className="text-gray-700">Área laboral:</strong> {renderValor(areaLaborales.find((a) => a.id === usuario.area_laboral_id)?.nombre)}</p>
                <p><strong className="text-gray-700">Salario promedio:</strong> {renderValor(usuario.salario_promedio)}</p>
                <p><strong className="text-gray-700">Tipo de empleo:</strong> {renderValor(usuario.tipo_empleo)}</p>
              </>
            )}
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
            Ubicación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong className="text-gray-700">Ubicación:</strong>{" "}
              {paisActual && provinciaActual && cantonActual
                ? `${paisActual.nombre} - ${provinciaActual.nombre} - ${cantonActual.nombre}`
                : <span className="text-gray-400 italic">N/A</span>}
            </p>
          </div>
        </div>

        {/* Botón editar */}
        <div className="mt-6">
          <Link
            href="/perfil/editar"
            className="bg-[#034991] hover:bg-[#0563c1] text-white px-4 py-2 rounded col-span-2 text-center block"
          >
            Editar Perfil
          </Link>
        </div>
      </div>
    </>
  );
}

Index.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
