import React from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import IconoEdicion from "@/assets/IconoEdicion.png";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
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
  empresa?: Empresa | null;
  areaLaborales: AreaLaboral[];
  paises: Pais[];
  provincias: Provincia[];
  cantones: Canton[];
  universidades: Universidad[];
  carreras: Carrera[];
  userPermisos: number[];
  plataformas: Plataforma[];
  rolNombre: string;
}

export default function Index({
  usuario,
  empresa,
  areaLaborales,
  paises,
  provincias,
  cantones,
  universidades,
  carreras,
  plataformas,
  rolNombre,
}: Props) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const modal = useModal();

  const cantonActual = cantones.find(c => c.id === usuario.id_canton);
  const provinciaActual = cantonActual ? provincias.find(p => p.id === cantonActual.id_provincia) : null;
  const paisActual = provinciaActual ? paises.find(pa => pa.id === provinciaActual.id_pais) : null;

  const universidadActual = universidades.find(u => u.id === usuario.id_universidad);
  const carreraActual = carreras.find(c => c.id === usuario.id_carrera);

  const fotoPerfilUrl = usuario.fotoPerfil?.ruta_imagen || FotoXDefecto;

  // 🔹 Eliminar foto de perfil
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
        onSuccess: () => modal.alerta({ titulo: "Éxito", mensaje: "Foto de perfil eliminada." }),
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
      <Head title={`Perfil - ${usuario.nombre_completo}`} />

      {/* Fondo celeste global */}
      <div className="font-display bg-[#f5f7f8] min-h-screen flex justify-center items-start py-10">
        {/* Contenedor blanco principal */}
        <div className="bg-white rounded-xl shadow-sm w-full max-w-6xl p-10">
          {/* 🔹 Header */}
          <header className="flex justify-between items-center border-b pb-3 mb-8">
            <div className="flex items-center gap-3 text-[#034991]">
              <div className="text-[#CD1719]">
                <svg fill="currentColor" viewBox="0 0 48 48" className="w-6 h-6">
                  <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" />
                </svg>
              </div>
              <h1 className="text-lg font-heading font-bold">Mi Perfil</h1>
            </div>

            <div className="flex space-x-4">
              <Button asChild variant="outline">
                <Link href="/dashboard">Volver</Link>
              </Button>

              <Button asChild variant="default">
                <Link href="/perfil/editar">Editar Perfil</Link>
              </Button>
            </div>
          </header>

          {/* 🔹 Foto y acciones */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative">
              <img
                src={fotoPerfilUrl}
                alt="Foto de perfil"
                className="rounded-full w-36 h-36 ring-4 ring-white shadow-md object-cover"
              />
              {/* Icono de edición */}
              <Link
                href="/perfil/foto"
                title="Editar foto de perfil"
                className="absolute -bottom-2 -right-2 flex items-center justify-center h-10 w-10 rounded-full bg-white border border-gray-300 shadow-md hover:scale-110 transition"
              >
                <img src={IconoEdicion} alt="Editar foto" className="w-5 h-5" />
              </Link>
            </div>

            {/* Botón de borrar */}
            {usuario.fotoPerfil && (
              <button
                onClick={eliminarFotoPerfil}
                className="mt-4 font-heading text-[#034991] font-semibold hover:text-[#CD1719] cursor-pointer transition"
              >
                Borrar Foto de Perfil
              </button>
            )}

            <p className="mt-4 text-2xl font-bold text-[#000000]">{usuario.nombre_completo}</p>
          </div>

          {/* 🔹 Datos según rol */}
          <div className="space-y-12 font-heading text-[#000000]">
            {/* EMPRESA */}
            {rolNombre.toLowerCase() === "empresa" ? (
              <>
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold border-b pb-3 border-gray-200 text-[#034991]">
                    Información de la Empresa
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <p><strong>Nombre:</strong> {renderValor(empresa?.nombre)}</p>
                    <p><strong>Correo:</strong> {renderValor(empresa?.correo)}</p>
                    <p><strong>Teléfono:</strong> {renderValor(empresa?.telefono)}</p>
                    <p><strong>Persona de contacto:</strong> {renderValor(empresa?.persona_contacto)}</p>
                    <p className="sm:col-span-2">
                      <strong>Ubicación:</strong>{" "}
                      {paisActual && provinciaActual && cantonActual
                        ? `${paisActual.nombre} - ${provinciaActual.nombre} - ${cantonActual.nombre}`
                        : "N/A"}
                    </p>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold border-b pb-3 border-gray-200 text-[#034991]">
                    Usuario Responsable
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <p><strong>Nombre completo:</strong> {renderValor(usuario.nombre_completo)}</p>
                    <p><strong>Identificación:</strong> {renderValor(usuario.identificacion)}</p>
                  </div>
                </section>
              </>
            ) : (
              <>
                <div className="flex-1">
                  {/* Datos personales */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Datos personales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p><strong>Nombre:</strong> {renderValor(usuario.nombre_completo)}</p>
                      <p><strong>Correo:</strong> {renderValor(usuario.correo)}</p>
                      <p><strong>Identificación:</strong> {renderValor(usuario.identificacion)}</p>
                      <p><strong>Teléfono:</strong> {renderValor(usuario.telefono)}</p>
                      <p><strong>Fecha de Nacimiento:</strong> {renderValor(usuario.fecha_nacimiento)}</p>
                      <p><strong>Género:</strong> {renderValor(usuario.genero)}</p>
                    </div>
                  </div>

                  {/* Datos académicos */}
                  {["egresado", "estudiante"].includes(rolNombre.toLowerCase()) ? (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Datos académicos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p><strong>Universidad:</strong> {renderValor(universidadActual?.nombre)}</p>
                        <p><strong>Carrera:</strong> {renderValor(carreraActual?.nombre)}</p>
                        <p><strong>Estado de estudios:</strong> {renderValor(usuario.estado_estudios)}</p>
                        <p><strong>Nivel académico:</strong> {renderValor(usuario.nivel_academico)}</p>
                        <p><strong>Año de graduación:</strong> {renderValor(usuario.anio_graduacion)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Datos académicos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p><strong>Universidad:</strong> {renderValor(universidadActual?.nombre)}</p>
                        <p><strong>Carrera:</strong> {renderValor(carreraActual?.nombre)}</p>
                      </div>
                    </div>
                  )}

                  {/* Datos laborales */}
                  {["egresado", "estudiante"].includes(rolNombre.toLowerCase()) && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Datos laborales</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p><strong>Estado de empleo:</strong> {renderValor(usuario.estado_empleo)}</p>
                        {usuario.estado_empleo?.toLowerCase() === "empleado" && (
                          <>
                            <p><strong>Tiempo para conseguir empleo:</strong> {renderValor(usuario.tiempo_conseguir_empleo)}</p>
                            <p><strong>Área laboral:</strong> {renderValor(areaLaborales.find(a => a.id === usuario.area_laboral_id)?.nombre)}</p>
                            <p><strong>Salario promedio:</strong> {renderValor(usuario.salario_promedio)}</p>
                            <p><strong>Tipo de empleo:</strong> {renderValor(usuario.tipo_empleo)}</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ubicación */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Ubicación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p>
                        <strong>Ubicación:</strong>{" "}
                        {paisActual && provinciaActual && cantonActual
                          ? `${paisActual.nombre} - ${provinciaActual.nombre} - ${cantonActual.nombre}`
                          : <span className="text-gray-400 italic">N/A</span>}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 🔹 Enlaces Externos */}
            {(rolNombre.toLowerCase() === "empresa" || ["egresado", "estudiante"].includes(rolNombre.toLowerCase())) && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold border-b pb-3 border-gray-200 text-[#034991]">
                  Enlaces a Plataformas Externas
                </h2>
                <EnlacesExternos
                  key={usuario.id_usuario}
                  enlaces={plataformas || []}
                  usuario={usuario}
                  rolNombre={rolNombre} 
                  soloLectura={false}
                />
              </section>
            )}
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
