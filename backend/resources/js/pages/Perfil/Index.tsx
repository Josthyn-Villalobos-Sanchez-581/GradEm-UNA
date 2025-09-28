import React, { useEffect } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";



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
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;//mostrar mensajes despues de editar
  const cantonActual = cantones.find((c) => c.id === usuario.id_canton);
  const provinciaActual = cantonActual
    ? provincias.find((p) => p.id === cantonActual.id_provincia)
    : null;
  const paisActual = provinciaActual
    ? paises.find((pa) => pa.id === provinciaActual.id_pais)
    : null;

  const universidadActual = universidades.find((u) => u.id === usuario.id_universidad);
  const carreraActual = carreras.find((c) => c.id === usuario.id_carrera);

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Mi Perfil</h2>
          <Link
            href="/dashboard"
            className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded"
          >
            Volver
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p>
            <strong>Nombre:</strong> {usuario.nombre_completo}
          </p>
          <p>
            <strong>Correo:</strong> {usuario.correo}
          </p>
          <p>
            <strong>Identificación:</strong> {usuario.identificacion}
          </p>
          <p>
            <strong>Teléfono:</strong> {usuario.telefono ?? "N/A"}
          </p>
          <p>
            <strong>Fecha Nacimiento:</strong> {usuario.fecha_nacimiento ?? "N/A"}
          </p>
          <p>
            <strong>Género:</strong> {usuario.genero ?? "N/A"}
          </p>
          <p>
            <strong>Universidad:</strong> {universidadActual?.nombre ?? "N/A"}
          </p>
          <p>
            <strong>Carrera:</strong> {carreraActual?.nombre ?? "N/A"}
          </p>
          <p>
            <strong>Estado Estudios:</strong> {usuario.estado_estudios ?? "N/A"}
          </p>
          <p>
            <strong>Año Graduación:</strong> {usuario.anio_graduacion ?? "N/A"}
          </p>
          <p>
            <strong>Nivel Académico:</strong> {usuario.nivel_academico ?? "N/A"}
          </p>
          <p>
            <strong>Estado Empleo:</strong> {usuario.estado_empleo ?? "N/A"}
          </p>
          <p>
            <strong>Tiempo para conseguir empleo:</strong>{" "}
            {usuario.tiempo_conseguir_empleo ?? "N/A"}
          </p>
          <p>
            <strong>Área Laboral:</strong>{" "}
            {areaLaborales.find((a) => a.id === usuario.area_laboral_id)?.nombre ?? "N/A"}
          </p>
          <p>
            <strong>Ubicación:</strong>{" "}
            {paisActual && provinciaActual && cantonActual
              ? `${paisActual.nombre} - ${provinciaActual.nombre} - ${cantonActual.nombre}`
              : "N/A"}
          </p>
          <p>
            <strong>Salario Promedio:</strong> {usuario.salario_promedio ?? "N/A"}
          </p>
          <p>
            <strong>Tipo Empleo:</strong> {usuario.tipo_empleo ?? "N/A"}
          </p>

          <Link
            href="/perfil/editar"
            className="bg-[#034991] hover:bg-[#0563c1] text-white px-4 py-2 rounded col-span-2 text-center"
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
