import React from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import { useModal } from "@/hooks/useModal";

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
  const modal = useModal();

  // Ubicación
  const cantonActual = cantones.find(c => c.id === usuario.id_canton);
  const provinciaActual = cantonActual ? provincias.find(p => p.id === cantonActual.id_provincia) : null;
  const paisActual = provinciaActual ? paises.find(pa => pa.id === provinciaActual.id_pais) : null;

  // Universidad y carrera
  const universidadActual = universidades.find(u => u.id === usuario.id_universidad);
  const carreraActual = carreras.find(c => c.id === usuario.id_carrera);

  // Foto de perfil
  const fotoPerfilUrl = usuario.fotoPerfil?.ruta_imagen || FotoXDefecto;

  // Función para eliminar la foto de perfil
  const eliminarFotoPerfil = async () => {
    const confirm = await modal.confirmacion({
      titulo: "Confirmar eliminación",
      mensaje: "¿Está seguro que desea eliminar su foto de perfil?",
    });
    if (!confirm) return;

    Inertia.post("/perfil/foto/eliminar", {}, {
      onSuccess: () => {
        modal.alerta({ titulo: "Éxito", mensaje: "Foto de perfil eliminada." });
      },
      onError: (errors: any) => {
        modal.alerta({ titulo: "Error", mensaje: errors.foto || "No se pudo eliminar la foto." });
      },
    });
  };

  return (
    <>
      <Head title="Mi Perfil" />
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6 text-gray-900">
        {/* Mensajes flash */}
        {flash?.success && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded-lg">
            {flash.success}
          </div>
        )}
        {flash?.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded-lg">
            {flash.error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sección Foto de Perfil */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="h-40 w-40 md:h-48 md:w-48 overflow-hidden rounded-lg border border-gray-300 shadow-sm">
              <img src={fotoPerfilUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Link
                href="/perfil/foto"
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow text-center"
              >
                Actualizar Foto
              </Link>
              {usuario.fotoPerfil && (
                <button
                  onClick={eliminarFotoPerfil}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow text-center"
                >
                  Eliminar Foto
                </button>
              )}
            </div>
          </div>

          {/* Sección Datos del Usuario */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
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
            <p>
              <strong>Ubicación:</strong>{" "}
              {paisActual && provinciaActual && cantonActual
                ? `${paisActual.nombre} - ${provinciaActual.nombre} - ${cantonActual.nombre}`
                : "N/A"}
            </p>
            <p><strong>Salario Promedio:</strong> {usuario.salario_promedio ?? "N/A"}</p>
            <p><strong>Tipo Empleo:</strong> {usuario.tipo_empleo ?? "N/A"}</p>

            {/* Botón Editar Perfil */}
            <Link
              href="/perfil/editar"
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow col-span-2 text-center mt-3 md:mt-0"
            >
              Editar Perfil
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

Index.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
