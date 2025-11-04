import React, { useState } from "react";
import { Link, Head } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import IconoEdicion from "@/assets/IconoEdicion.png";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import EnlacesExternos from "./EnlacesExternos";

interface FotoPerfil { ruta_imagen: string }
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
}

interface AreaLaboral { id: number; nombre: string }
interface Pais { id: number; nombre: string }
interface Provincia { id: number; nombre: string; id_pais: number }
interface Canton { id: number; nombre: string; id_provincia: number }
interface Universidad { id: number; nombre: string; sigla: string }
interface Carrera { id: number; nombre: string; id_universidad: number; area_conocimiento: string }
interface Plataforma { id_plataforma: number; tipo: string; url: string }

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
  const modal = useModal();
  const [activeTab, setActiveTab] = useState(
    rolNombre.toLowerCase() === "empresa" ? "empresa" : "datos"
  );

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

    Inertia.post("/perfil/foto/eliminar", {}, {
      onSuccess: () => modal.alerta({ titulo: "Éxito", mensaje: "Foto de perfil eliminada." }),
      onError: (errors: any) =>
        modal.alerta({ titulo: "Error", mensaje: errors.foto || "No se pudo eliminar la foto." }),
    });
  };

  // 🔹 Texto negro por defecto
  const renderValor = (valor: any) =>
    valor ? <span className="text-black">{valor}</span> : <span className="text-gray-400 italic">N/A</span>;

  // -------------------------------------------------------
  // VISTA EMPRESA
  // -------------------------------------------------------
  if (rolNombre.toLowerCase() === "empresa") {
    const secciones = [
      { id: "empresa", label: "Información de la Empresa" },
      { id: "responsable", label: "Usuario Responsable" },
      { id: "enlaces", label: "Enlaces Externos" },
    ];

    return (
      <>
        <Head title="Perfil de Empresa" />
        <div className="font-display bg-[#f5f7f8] min-h-screen flex justify-center py-10 text-black">
          <div className="bg-white rounded-xl shadow-sm w-full max-w-6xl p-8">
            <header className="flex justify-between items-center border-b pb-3 mb-8">
              <h1 className="text-2xl font-bold text-[#034991]">Perfil de Empresa</h1>
              <div className="flex gap-3">
                <Button asChild variant="secondary"><Link href="/dashboard">Volver</Link></Button>
                <Button asChild variant="default"><Link href="/perfil/editar">Editar</Link></Button>
              </div>
            </header>

            {/* Foto y acciones */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={fotoPerfilUrl}
                  className="rounded-full w-36 h-36 object-cover shadow-md mb-3"
                />
                {/* Botón de editar foto */}
                <Link
                  href="/perfil/foto"
                  title="Editar foto de perfil"
                  className="absolute -bottom-2 -right-2 flex items-center justify-center h-10 w-10 rounded-full bg-white border border-gray-300 shadow-md hover:scale-110 transition"
                >
                  <img src={IconoEdicion} alt="Editar" className="w-5 h-5" />
                </Link>
              </div>

              {/* Botón eliminar foto */}
              {usuario.fotoPerfil && (
                <button
                  onClick={eliminarFotoPerfil}
                  className="mt-4 font-heading text-[#034991] font-semibold hover:text-[#CD1719] transition"
                >
                  Borrar Foto de Perfil
                </button>
              )}

              <p className="text-2xl font-bold mt-4">{rolNombre}: {empresa?.nombre}</p>
              <p className="text-base text-gray-700">
                Usuario: {renderValor(usuario.nombre_completo)}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center flex-wrap gap-3 border-b pb-4 mb-6">
              {secciones.map(tab => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "outline" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className="font-semibold text-black"
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Paneles */}
            {activeTab === "empresa" && (
              <section>
                <h3 className="text-xl font-bold text-[#034991] mb-4">Información de la Empresa</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-black">
                  <p><strong>Nombre de la empresa:</strong> {renderValor(empresa?.nombre)}</p>
                  <p><strong>Correo:</strong> {renderValor(empresa?.correo)}</p>
                  <p><strong>Teléfono:</strong> {renderValor(empresa?.telefono)}</p>
                  <p><strong>Ubicación:</strong> {renderValor(paisActual ? `${paisActual.nombre}, ${provinciaActual?.nombre}, ${cantonActual?.nombre}` : "N/A")}</p>
                  <p><strong>Persona de contacto:</strong> {renderValor(empresa?.persona_contacto)}</p>
                </div>
              </section>
            )}

            {activeTab === "responsable" && (
              <section>
                <h3 className="text-xl font-bold text-[#034991] mb-4">Usuario Responsable</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-black">
                  <p><strong>Nombre completo:</strong> {renderValor(usuario.nombre_completo)}</p>
                  <p><strong>Identificación:</strong> {renderValor(usuario.identificacion)}</p>
                </div>
              </section>
            )}

            {activeTab === "enlaces" && (
              <section>
                <h3 className="text-xl font-bold text-[#034991] mb-4">Enlaces Externos</h3>
                <EnlacesExternos enlaces={plataformas} usuario={usuario} rolNombre={rolNombre} soloLectura={false} />
              </section>
            )}
          </div>
        </div>
      </>
    );
  }

  // -------------------------------------------------------
  // VISTA ESTUDIANTE / EGRESADO / OTROS
  // -------------------------------------------------------
  const mostrarEnlaces =
    ["egresado", "estudiante", "empresa"].includes(rolNombre.toLowerCase());

  const tabs = [
    { id: "datos", label: "Datos Personales" },
    { id: "academicos", label: "Datos Académicos" },
    ...(rolNombre.toLowerCase() === "egresado" || rolNombre.toLowerCase() === "estudiante"
      ? [{ id: "laborales", label: "Datos Laborales" }]
      : []),
    ...(mostrarEnlaces ? [{ id: "enlaces", label: "Enlaces Externos" }] : []),
  ];

  return (
    <>
      <Head title={`Perfil - ${usuario.nombre_completo}`} />
      <div className="font-display bg-[#f5f7f8] min-h-screen flex justify-center py-10 text-black">
        <div className="bg-white rounded-xl shadow-sm w-full max-w-6xl p-8">
          <header className="flex justify-between items-center border-b pb-3 mb-8">
            <h1 className="text-2xl font-bold text-[#034991]">Mi Perfil</h1>
            <div className="flex gap-3">
              <Button asChild variant="secondary"><Link href="/dashboard">Volver</Link></Button>
              <Button asChild variant="default"><Link href="/perfil/editar">Editar</Link></Button>
            </div>
          </header>

          {/* Foto y acciones */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={fotoPerfilUrl}
                className="rounded-full w-36 h-36 object-cover shadow-md mb-3"
              />
              {/* Botón de editar foto */}
              <Link
                href="/perfil/foto"
                title="Editar foto de perfil"
                className="absolute -bottom-2 -right-2 flex items-center justify-center h-10 w-10 rounded-full bg-white border border-gray-300 shadow-md hover:scale-110 transition"
              >
                <img src={IconoEdicion} alt="Editar" className="w-5 h-5" />
              </Link>
            </div>

            {/* Botón eliminar foto */}
            {usuario.fotoPerfil && (
              <button
                onClick={eliminarFotoPerfil}
                className="mt-4 font-heading text-[#034991] font-semibold hover:text-[#CD1719] transition"
              >
                Borrar Foto de Perfil
              </button>
            )}

            <p className="text-2xl font-bold mt-4">{rolNombre}: {usuario.nombre_completo}</p>
            <p className="text-gray-700">Carrera: {carreraActual?.nombre}</p>
            <p className="text-gray-700">Universidad: {universidadActual?.nombre}</p>

            {/* Nuevo botón Ver Currículum */}
            {["egresado", "estudiante"].includes(rolNombre?.toLowerCase() ?? "") && (
              <Button asChild variant="default" className="mt-3">
                <Link href="/mi-curriculum/ver">Ver Currículum</Link>
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex justify-center flex-wrap gap-3 border-b pb-4 mb-6">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "outline" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className="font-semibold text-black"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Contenido */}
          <div className="mt-6 space-y-10 text-black">
            {/* DATOS PERSONALES */}
            {activeTab === "datos" && (
              <section>
                <h3 className="text-xl font-bold text-[#034991] mb-4">Datos Personales</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <p><strong>Nombre completo:</strong> {renderValor(usuario.nombre_completo)}</p>
                  <p><strong>Identificación:</strong> {renderValor(usuario.identificacion)}</p>
                  <p><strong>Correo:</strong> {renderValor(usuario.correo)}</p>
                  <p><strong>Teléfono:</strong> {renderValor(usuario.telefono)}</p>
                  <p><strong>Fecha de nacimiento:</strong> {renderValor(usuario.fecha_nacimiento)}</p>
                  <p><strong>Género:</strong> {renderValor(usuario.genero)}</p>
                  <p><strong>Ubicación:</strong> {renderValor(paisActual ? `${paisActual.nombre}, ${provinciaActual?.nombre}, ${cantonActual?.nombre}` : "N/A")}</p>
                </div>
              </section>
            )}

            {/* DATOS ACADÉMICOS */}
            {activeTab === "academicos" && (
              <section>
                <h3 className="text-xl font-bold text-[#034991] mb-4">Datos Académicos</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <p><strong>Universidad:</strong> {renderValor(universidadActual?.nombre)}</p>
                  <p><strong>Carrera:</strong> {renderValor(carreraActual?.nombre)}</p>
                  {(rolNombre.toLowerCase() === "egresado" || rolNombre.toLowerCase() === "estudiante") && (
                    <>
                      <p><strong>Estado de estudios:</strong> {renderValor(usuario.estado_estudios)}</p>
                      <p><strong>Nivel académico:</strong> {renderValor(usuario.nivel_academico)}</p>
                      <p><strong>Año de graduación:</strong> {renderValor(usuario.anio_graduacion)}</p>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* DATOS LABORALES */}
            {(rolNombre.toLowerCase() === "egresado" || rolNombre.toLowerCase() === "estudiante") && activeTab === "laborales" && (
              <section>
                <h3 className="text-xl font-bold text-[#034991] mb-4">Datos Laborales</h3>
                <div className="grid sm:grid-cols-2 gap-4">
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
              </section>
            )}

            {/* ENLACES EXTERNOS */}
            {mostrarEnlaces && activeTab === "enlaces" && (
              <section>
                <h3 className="text-xl font-bold text-[#034991] mb-4">Enlaces a Plataformas Externas</h3>
                <EnlacesExternos enlaces={plataformas} usuario={usuario} rolNombre={rolNombre} soloLectura={false} />
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
