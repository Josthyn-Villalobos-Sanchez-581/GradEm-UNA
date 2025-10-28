// backend/resources/js/pages/Usuarios/VerPerfil.tsx

import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import PpLayout from "@/layouts/PpLayout";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import EnlacesExternos from "@/pages/Perfil/EnlacesExternos";

interface FotoPerfil {
  ruta_imagen: string;
}
interface Curriculum {
  id_curriculum: number;
  ruta_archivo_pdf: string;
}
interface DocumentoAdjunto {
  id_documento: number;
  nombre_original: string;
  rutaPublica: string;
  fecha_subida: string;
}
interface Universidad {
  nombre: string;
}
interface Carrera {
  nombre: string;
}
interface Plataforma {
  id_plataforma: number;
  tipo: string;
  url: string;
}
interface AreaLaboral {
  nombre_area: string;
}
interface Empresa {
  id_empresa?: number;
  nombre?: string;
  correo?: string;
  telefono?: string;
  persona_contacto?: string;
}

interface Ubicacion {
  pais?: string | null;
  provincia?: string | null;
  canton?: string | null;
}

interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  identificacion: string;
  telefono: string;
  fecha_nacimiento?: string;
  genero?: string;
  estado_empleo?: string;
  estado_estudios?: string;
  anio_graduacion?: number | null;
  nivel_academico?: string | null;
  tiempo_conseguir_empleo?: number | null;
  areaLaboral?: AreaLaboral | null;
  salario_promedio?: string | null;
  tipo_empleo?: string | null;
  universidad?: Universidad | null;
  carrera?: Carrera | null;
  fotoPerfil?: FotoPerfil | null;
  curriculum?: Curriculum | null;
  tiene_adjuntos?: boolean;
  rol?: { nombre_rol: string };
  empresa?: Empresa | null;
  ubicacion?: Ubicacion | null;
}

interface Props {
  usuario: Usuario;
  plataformas: Plataforma[];
  userPermisos: number[];
}

export default function VerPerfil({ usuario, plataformas = [] }: Props) {
  const [activeTab, setActiveTab] = useState<string>("");
  const [mostrarCV, setMostrarCV] = useState(false);
  const [cargandoAdjuntos, setCargandoAdjuntos] = useState(false);
  const [adjuntos, setAdjuntos] = useState<DocumentoAdjunto[]>([]);
  const [docSeleccionado, setDocSeleccionado] = useState<DocumentoAdjunto | null>(null);
  const modal = useModal();

  const fotoPerfilUrl = usuario.fotoPerfil?.ruta_imagen || FotoXDefecto;

  const renderValor = (valor: any) =>
    valor ? (
      <span className="text-black">{valor}</span>
    ) : (
      <span className="text-[#A7A7A9] italic">N/A</span>
    );

  // Función auxiliar: verifica si todos los valores de un conjunto están vacíos
  const isEmptySection = (valores: any[]) =>
    valores.every(
      (v) =>
        v === null ||
        v === undefined ||
        v === "" ||
        (typeof v === "object" && Object.values(v || {}).every((x) => !x))
    );

  useEffect(() => {
    // Determinar pestaña inicial
    if (usuario.rol?.nombre_rol?.toLowerCase() === "empresa") {
      setActiveTab("empresa");
    } else {
      setActiveTab("datos");
    }
  }, []);

  // -------------------- VISTA EMPRESA --------------------
  if (usuario.rol?.nombre_rol?.toLowerCase() === "empresa") {
    const seccionesEmpresa = [
      { id: "empresa", label: "Información de la Empresa" },
      { id: "responsable", label: "Usuario Responsable" },
      ...(plataformas.length > 0 ? [{ id: "enlaces", label: "Enlaces Externos" }] : []),
    ];

    return (
      <>
        <Head title="Perfil de Empresa" />
        <div
          className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-6 text-black"
          style={{ fontFamily: "Open Sans, sans-serif" }}
        >
          {/* Encabezado */}
          <div className="flex justify-between items-center border-b pb-3 mb-6">
            <h2 className="text-2xl font-bold text-[#034991]">Perfil de Empresa</h2>
            <Button asChild variant="secondary">
              <Link href="/usuarios/perfiles">Volver</Link>
            </Button>
          </div>

          {/* Encabezado visual */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-md mb-3">
              <img src={fotoPerfilUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
            </div>
            <p className="text-2xl font-bold">{usuario.empresa?.nombre}</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 border-b pb-4 mb-6">
            {seccionesEmpresa.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "outline" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className="font-semibold"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Paneles */}
          <div className="mt-6">
            {activeTab === "empresa" && (
              <div>
                <h3 className="text-2xl font-bold mb-4 text-[#034991]">Información de la Empresa</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <p><strong>Correo:</strong> {renderValor(usuario.empresa?.correo)}</p>
                  <p><strong>Teléfono:</strong> {renderValor(usuario.empresa?.telefono)}</p>
                  <p><strong>Ubicación:</strong> {renderValor(
                    usuario.ubicacion
                      ? `${usuario.ubicacion.canton || "N/A"}, ${usuario.ubicacion.provincia || "N/A"}, ${usuario.ubicacion.pais || "N/A"}`
                      : "N/A"
                  )}</p>
                  <p><strong>Persona de contacto:</strong> {renderValor(usuario.empresa?.persona_contacto)}</p>
                </div>
              </div>
            )}

            {activeTab === "responsable" && (
              <div>
                <h3 className="text-2xl font-bold mb-4 text-[#034991]">Usuario Responsable</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <p><strong>Nombre completo:</strong> {renderValor(usuario.nombre_completo)}</p>
                  <p><strong>Identificación:</strong> {renderValor(usuario.identificacion)}</p>
                </div>
              </div>
            )}

            {activeTab === "enlaces" && plataformas.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4 text-[#034991]">Enlaces Externos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plataformas.map((p) => (
                    <div key={p.id_plataforma}>
                      <p className="font-semibold">{p.tipo}</p>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:text-[#034991] underline underline-offset-2"
                      >
                        {p.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // -------------------- VISTA ESTUDIANTE / EGRESADO --------------------
  const tabs = [
    !isEmptySection([
      usuario.correo,
      usuario.telefono,
      usuario.identificacion,
      usuario.fecha_nacimiento,
      usuario.genero,
    ]) && { id: "datos", label: "Datos Personales" },
    !isEmptySection([
      usuario.estado_estudios,
      usuario.nivel_academico,
      usuario.anio_graduacion,
      usuario.universidad,
      usuario.carrera,
    ]) && { id: "academicos", label: "Datos Académicos" },
    !isEmptySection([
      usuario.estado_empleo,
      usuario.tiempo_conseguir_empleo,
      usuario.areaLaboral,
      usuario.salario_promedio,
      usuario.tipo_empleo,
    ]) && { id: "laborales", label: "Datos Laborales" },
    usuario.curriculum && { id: "cv", label: "Currículum" },
    usuario.tiene_adjuntos && { id: "adjuntos", label: "Documentos Adjuntos" },
    plataformas.length > 0 && { id: "enlaces", label: "Enlaces Externos" },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <>
      <Head title={`Perfil de ${usuario.nombre_completo}`} />
      <div
        className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-6 text-black"
        style={{ fontFamily: "Open Sans, sans-serif" }}
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="text-2xl font-bold text-[#034991]">Gestión de Perfil</h2>
          <Button asChild variant="secondary">
            <Link href="/usuarios/perfiles">Volver</Link>
          </Button>
        </div>

        {/* Imagen y nombre */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden shadow-md mb-3">
            <img src={fotoPerfilUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
          </div>
          <p className="text-3xl font-bold text-black">{usuario.nombre_completo}</p>
          <p className="text-lg text-[#6c757d]">{usuario.carrera?.nombre || "N/A"}</p>
          <p className="text-base text-[#6c757d]">{usuario.universidad?.nombre || "N/A"}</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 border-b pb-4 mb-6">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "outline" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="font-semibold"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Paneles */}
        <div className="mt-6">
          {/* Datos personales */}
          {activeTab === "datos" && (
            <section>
              <h3 className="text-2xl font-bold mb-4 text-[#034991]">Datos Personales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p><strong>Nombre completo:</strong> {renderValor(usuario.nombre_completo)}</p>
                <p><strong>Identificación:</strong> {renderValor(usuario.identificacion)}</p>
                <p><strong>Correo:</strong> {renderValor(usuario.correo)}</p>
                <p><strong>Teléfono:</strong> {renderValor(usuario.telefono)}</p>
                <p><strong>Fecha de nacimiento:</strong> {renderValor(usuario.fecha_nacimiento)}</p>
                <p><strong>Género:</strong> {renderValor(usuario.genero)}</p>
                <p><strong>Ubicación:</strong> {renderValor(
                  usuario.ubicacion
                    ? `${usuario.ubicacion.canton || "N/A"}, ${usuario.ubicacion.provincia || "N/A"}, ${usuario.ubicacion.pais || "N/A"}`
                    : "N/A"
                )}</p>
              </div>
            </section>
          )}

          {/* Datos académicos */}
          {activeTab === "academicos" && (
            <section>
              <h3 className="text-2xl font-bold mb-4 text-[#034991]">Datos Académicos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p><strong>Universidad:</strong> {renderValor(usuario.universidad?.nombre)}</p>
                <p><strong>Carrera:</strong> {renderValor(usuario.carrera?.nombre)}</p>
                <p><strong>Estado de estudios:</strong> {renderValor(usuario.estado_estudios)}</p>
                <p><strong>Nivel académico:</strong> {renderValor(usuario.nivel_academico)}</p>
                <p><strong>Año de graduación:</strong> {renderValor(usuario.anio_graduacion)}</p>
              </div>
            </section>
          )}

          {/* Datos laborales */}
          {activeTab === "laborales" && (
            <section>
              <h3 className="text-2xl font-bold mb-4 text-[#034991]">Datos Laborales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p><strong>Estado de empleo:</strong> {renderValor(usuario.estado_empleo)}</p>
                <p><strong>Área laboral:</strong> {renderValor(usuario.areaLaboral?.nombre_area)}</p>
                <p><strong>Tipo de empleo:</strong> {renderValor(usuario.tipo_empleo)}</p>
                <p><strong>Salario promedio:</strong> {renderValor(usuario.salario_promedio)}</p>
                <p><strong>Tiempo para conseguir empleo:</strong> {renderValor(usuario.tiempo_conseguir_empleo)}</p>
              </div>
            </section>
          )}

          {/* Currículum */}
          {activeTab === "cv" && (
            <section>
              <h3 className="text-2xl font-bold mb-4 text-[#034991]">Currículum</h3>
              {usuario.curriculum?.ruta_archivo_pdf ? (
                <embed
                  src={usuario.curriculum.ruta_archivo_pdf}
                  type="application/pdf"
                  className="w-full h-[600px] border rounded-lg shadow-md"
                />
              ) : (
                <p className="text-[#A7A7A9] italic text-center">No hay currículum disponible.</p>
              )}
            </section>
          )}

          {/* Documentos Adjuntos */}
          {activeTab === "adjuntos" && (
            <section>
              <h3 className="text-2xl font-bold mb-4 text-[#034991]">Documentos Adjuntos</h3>
              {usuario.tiene_adjuntos ? (
                cargandoAdjuntos ? (
                  <p className="text-[#A7A7A9] italic text-center">Cargando documentos...</p>
                ) : adjuntos.length === 0 ? (
                  <p className="text-[#A7A7A9] italic text-center">No se encontraron documentos adjuntos.</p>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      {adjuntos.map((doc) => (
                        <div
                          key={doc.id_documento}
                          className={`p-4 border rounded-lg cursor-pointer transition ${docSeleccionado?.id_documento === doc.id_documento
                            ? "bg-blue-50 border-blue-600"
                            : "hover:shadow"
                            }`}
                          onClick={() => setDocSeleccionado(doc)}
                        >
                          📄 {doc.nombre_original}
                        </div>
                      ))}
                    </div>
                    {docSeleccionado && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-center text-[#034991] mb-2">
                          Visualizando: {docSeleccionado.nombre_original}
                        </h4>
                        <embed
                          src={docSeleccionado.rutaPublica}
                          type="application/pdf"
                          className="w-full h-[70vh] border rounded-lg shadow-md"
                        />
                      </div>
                    )}
                  </>
                )
              ) : (
                <p className="text-[#A7A7A9] italic text-center">No hay documentos adjuntos.</p>
              )}
            </section>
          )}

          {/* Enlaces externos */}
          {activeTab === "enlaces" && plataformas.length > 0 && (
            <section>
              <h3 className="text-2xl font-bold mb-4 text-[#034991]">Enlaces Externos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plataformas.map((p) => (
                  <div key={p.id_plataforma}>
                    <p className="font-semibold">{p.tipo}</p>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black hover:text-[#034991] underline underline-offset-2"
                    >
                      {p.url}
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

// ✅ Layout principal
VerPerfil.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
