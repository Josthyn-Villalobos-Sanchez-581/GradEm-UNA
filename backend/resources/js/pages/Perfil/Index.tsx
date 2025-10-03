import React from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import { useModal } from "@/hooks/useModal";
// backend/resources/js/pages/Perfil/Index.tsx
// 👇 importa tu componente de enlaces externos
import EnlacesExternos from "./EnlacesExternos";

interface FotoPerfil {
  ruta_imagen: string;
}

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
  fotoPerfil?: FotoPerfil | null;
}

interface AreaLaboral { id: number; nombre: string }
interface Pais { id: number; nombre: string }
interface Provincia { id: number; nombre: string; id_pais: number }
interface Canton { id: number; nombre: string; id_provincia: number }
interface Universidad { id: number; nombre: string; sigla: string }
interface Carrera { id: number; nombre: string; id_universidad: number; area_conocimiento: string }

interface Plataforma {
  id_plataforma: number;
  tipo: string;
  url: string;
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
  plataformas: Plataforma[];
}

export default function Index({
  usuario,
  areaLaborales,
  paises,
  provincias,
  cantones,
  universidades,
  carreras,
  plataformas,
}: Props) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const modal = useModal();

  const cantonActual = cantones.find(c => c.id === usuario.id_canton);
  const provinciaActual = cantonActual ? provincias.find(p => p.id === cantonActual.id_provincia) : null;
  const paisActual = provinciaActual ? paises.find(pa => pa.id === provinciaActual.id_pais) : null;

  const universidadActual = universidades.find(u => u.id === usuario.id_universidad);
  const carreraActual = carreras.find(c => c.id === usuario.id_carrera);

  const fotoPerfilUrl = usuario.fotoPerfil?.ruta_imagen || FotoXDefecto;

  // Eliminar foto de perfil
  const eliminarFotoPerfil = async () => {
    const confirm = await modal.confirmacion({
      titulo: "Confirmar eliminación",
      mensaje: "¿Está seguro que desea eliminar su foto de perfil?",
    });
    if (!confirm) return;

    Inertia.post(
      "/perfil/foto/eliminar",
      {},
      {
        onSuccess: () =>
          modal.alerta({ titulo: "Éxito", mensaje: "Foto de perfil eliminada." }),
        onError: (errors: any) =>
          modal.alerta({
            titulo: "Error",
            mensaje: errors.foto || "No se pudo eliminar la foto.",
          }),
      }
    );
  };

  const renderValor = (valor: any) =>
    valor ? <span>{valor}</span> : <span className="text-gray-400 italic">N/A</span>;

  return (
    <>
      <Head title="Mi Perfil" />

      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6 text-black">
        {/* Flash messages */}
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

        {/* Foto de Perfil */}
        <div className="flex flex-col md:flex-row gap-6 mb-6 items-center md:items-start">
          <div className="h-40 w-40 md:h-48 md:w-48 overflow-hidden rounded-lg border border-gray-300 shadow-sm">
            <img
              src={fotoPerfilUrl}
              alt="Foto de perfil"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/perfil/foto"
              className="bg-[#034991] hover:bg-[#02336e] text-white font-semibold px-4 py-2 rounded shadow text-center"
            >
              Actualizar Foto
            </Link>
            {usuario.fotoPerfil && (
              <button
                onClick={eliminarFotoPerfil}
                className="bg-[#CD1719] hover:bg-[#a21514] text-white font-semibold px-4 py-2 rounded shadow text-center"
              >
                Eliminar Foto
              </button>
            )}
          </div>
        </div>

        {/* Datos personales */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
            Datos personales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>Nombre:</strong> {renderValor(usuario.nombre_completo)}
            </p>
            <p>
              <strong>Correo:</strong> {renderValor(usuario.correo)}
            </p>
            <p>
              <strong>Identificación:</strong> {renderValor(usuario.identificacion)}
            </p>
            <p>
              <strong>Teléfono:</strong> {renderValor(usuario.telefono)}
            </p>
            <p>
              <strong>Fecha de Nacimiento:</strong> {renderValor(usuario.fecha_nacimiento)}
            </p>
            <p>
              <strong>Género:</strong> {renderValor(usuario.genero)}
            </p>
          </div>
        </div>

        {/* Datos académicos */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
            Datos académicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>Estado de estudios:</strong> {renderValor(usuario.estado_estudios)}
            </p>
            <p>
              <strong>Nivel académico:</strong> {renderValor(usuario.nivel_academico)}
            </p>
            <p>
              <strong>Año de graduación:</strong> {renderValor(usuario.anio_graduacion)}
            </p>
            <p>
              <strong>Universidad:</strong> {renderValor(universidadActual?.nombre)}
            </p>
            <p>
              <strong>Carrera:</strong> {renderValor(carreraActual?.nombre)}
            </p>
          </div>
        </div>

        {/* Datos laborales */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
            Datos laborales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>Estado de empleo:</strong> {renderValor(usuario.estado_empleo)}
            </p>
            {usuario.estado_empleo?.toLowerCase() === "empleado" && (
              <>
                <p>
                  <strong>Tiempo para conseguir empleo:</strong>{" "}
                  {renderValor(usuario.tiempo_conseguir_empleo)}
                </p>
                <p>
                  <strong>Área laboral:</strong>{" "}
                  {renderValor(
                    areaLaborales.find((a) => a.id === usuario.area_laboral_id)?.nombre
                  )}
                </p>
                <p>
                  <strong>Salario promedio:</strong>{" "}
                  {renderValor(usuario.salario_promedio)}
                </p>
                <p>
                  <strong>Tipo de empleo:</strong> {renderValor(usuario.tipo_empleo)}
                </p>
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
              <strong>Ubicación:</strong>{" "}
              {paisActual && provinciaActual && cantonActual ? (
                `${paisActual.nombre} - ${provinciaActual.nombre} - ${cantonActual.nombre}`
              ) : (
                <span className="text-gray-400 italic">N/A</span>
              )}
            </p>
          </div>
        </div>

        {/* 🔗 Enlaces a plataformas externas */}
        <EnlacesExternos enlaces={plataformas} usuario={usuario} />

        {/* Botón Editar Perfil */}
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
