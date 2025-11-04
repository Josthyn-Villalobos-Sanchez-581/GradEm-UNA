import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { Inertia } from "@inertiajs/inertia";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";

interface Curriculum {
  rutaPublica?: string;
}

type TipoAdjunto = "titulo" | "certificado" | "otro";

interface DocumentoAdjunto {
  id_documento: number;
  tipo?: string; // necesario para agrupar
  nombre_original: string;
  rutaPublica: string;
  fecha_subida: string;
}

interface Props {
  curriculum: Curriculum | null;
  userPermisos: number[];
}

export default function VerCurriculum({ curriculum }: Props) {
  const modal = useModal();

  // Estados
  const [seccion, setSeccion] = useState<"curriculum" | "adjuntos">("curriculum");
  const [adjuntos, setAdjuntos] = useState<DocumentoAdjunto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [docSeleccionado, setDocSeleccionado] = useState<DocumentoAdjunto | null>(null);

  // Modal local para elegir método de actualización (solo currículum)
  const [modalMetodoAbierto, setModalMetodoAbierto] = useState(false);

  // Función para actualizar currículum
  const handleActualizar = async () => {
    const continuar = await modal.confirmacion({
      titulo: "Actualizar Currículum",
      mensaje: "El currículum actual se perderá. ¿Desea continuar?",
    });
    if (!continuar) return;
    setModalMetodoAbierto(true);
  };

  // Función para seleccionar método de actualización
  const seleccionarMetodo = (opcion: "cargar" | "generar") => {
    setModalMetodoAbierto(false);
    if (opcion === "cargar") Inertia.get("/curriculum-cargado");
    else Inertia.get("/curriculum/generar");
  };

  // Cargar adjuntos
  const cargarAdjuntos = async () => {
    setCargando(true);
    try {
      const resp = await fetch("/curriculum/adjuntos");
      const data: DocumentoAdjunto[] = await resp.json();
      setAdjuntos(data);
    } catch {
      await modal.alerta({
        titulo: "Error",
        mensaje: "No se pudieron cargar los archivos adjuntos.",
      });
    } finally {
      setCargando(false);
    }
  };

  const cambiarSeccion = async (nueva: "curriculum" | "adjuntos") => {
    setSeccion(nueva);
    setDocSeleccionado(null);
    if (nueva === "adjuntos" && adjuntos.length === 0) await cargarAdjuntos();
  };

  // Configuración de grupos por tipo
  const grupos: { tipo: TipoAdjunto; icono: string; titulo: string }[] = [
    { tipo: "titulo", icono: "🎓", titulo: "Títulos Académicos" },
    { tipo: "certificado", icono: "🏅", titulo: "Certificados" },
    { tipo: "otro", icono: "📄", titulo: "Otros Documentos" },
  ];

  return (
    <>
      <Head title="Gestión de Currículum" />
      <div className="max-w-5xl mx-auto bg-white shadow rounded-lg p-6 space-y-8">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-3 border-gray-200">
          <h1 className="text-3xl font-bold mb-3 md:mb-0" style={{ color: "#034991" }}>
            Mi Información Profesional
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={() => (window.location.href = "/perfil")}
              variant="outline"
              size="default"
              style={{ backgroundColor: "#A7A7A9", color: "#FFFFFF" }}
            >
              Volver
            </Button>

            {/* Botón dinámico según la sección */}
            {seccion === "curriculum" ? (
              <Button
                onClick={handleActualizar}
                variant="default"
                size="default"
                style={{ backgroundColor: "#034991", color: "#FFFFFF" }}
              >
                Actualizar Currículum
              </Button>
            ) : (
              <Button
                onClick={() => Inertia.get("/documentos")}
                variant="default"
                size="default"
                style={{ backgroundColor: "#034991", color: "#FFFFFF" }}
              >
                Actualizar Documentos
              </Button>
            )}
          </div>
        </div>

        {/* Navegación entre secciones */}
        <div className="flex justify-center gap-4 border-b pb-3">
          <Button
            onClick={() => cambiarSeccion("curriculum")}
            size="sm"
            variant={seccion === "curriculum" ? "default" : "outline"}
          >
            Currículum
          </Button>
          <Button
            onClick={() => cambiarSeccion("adjuntos")}
            size="sm"
            variant={seccion === "adjuntos" ? "destructive" : "outline"}
          >
            Documentos Adjuntos
          </Button>
        </div>

        {/* SECCIÓN CURRÍCULUM */}
        {seccion === "curriculum" && (
          <section className="pt-6">
            {!curriculum?.rutaPublica ? (
              <p className="text-center italic text-gray-500">
                No tienes un currículum cargado o generado en el sistema.
              </p>
            ) : (
              <div className="flex justify-center">
                <embed
                  src={curriculum.rutaPublica}
                  type="application/pdf"
                  className="w-full h-[70vh] border rounded-lg shadow-lg"
                  style={{ borderColor: "#A7A7A9" }}
                />
              </div>
            )}
          </section>
        )}

        {/* SECCIÓN DOCUMENTOS ADJUNTOS (AGRUPADOS POR TIPO) */}
        {seccion === "adjuntos" && (
          <section className="pt-6">
            <h3 className="text-2xl font-bold mb-4" style={{ color: "#034991" }}>
              Documentos Adjuntos
            </h3>

            {cargando ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "#034991" }}></div>
                <p className="ml-3 text-[#6c757d]">Cargando documentos...</p>
              </div>
            ) : adjuntos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#6c757d] text-lg">No se encontraron documentos adjuntos.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {grupos.map(({ tipo, icono, titulo }) => {
                  const docsFiltrados = adjuntos.filter(
                    (d) => (d.tipo || "").toLowerCase() === tipo
                  );

                  if (docsFiltrados.length === 0) return null;

                  return (
                    <div key={tipo} className="bg-white rounded-lg shadow-sm border p-6">
                      {/* Encabezado de la sección */}
                      <div className="flex items-center mb-4 border-b pb-2">
                        <span className="text-2xl mr-2">{icono}</span>
                        <h4 className="text-xl font-semibold" style={{ color: "#034991" }}>
                          {titulo}
                        </h4>
                      </div>

                      {/* Grid de documentos */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {docsFiltrados.map((doc) => (
                          <button
                            key={doc.id_documento}
                            onClick={() =>
                              setDocSeleccionado(
                                docSeleccionado?.id_documento === doc.id_documento ? null : doc
                              )
                            }
                            className={`text-left p-4 rounded-lg transition-all border-2 ${
                              docSeleccionado?.id_documento === doc.id_documento
                                ? "bg-blue-50 border-blue-500 shadow-md"
                                : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {doc.nombre_original}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {new Date(doc.fecha_subida).toLocaleDateString("es-CR")}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Visor embebido del documento seleccionado (del grupo actual) */}
                      {docSeleccionado &&
                        (docSeleccionado.tipo || "").toLowerCase() === tipo && (
                          <div className="border rounded-lg shadow-lg overflow-hidden">
                            <div className="bg-gray-50 p-3 border-b">
                              <h5 className="text-lg font-medium text-center" style={{ color: "#034991" }}>
                                {docSeleccionado.nombre_original}
                              </h5>
                            </div>
                            <embed
                              src={docSeleccionado.rutaPublica}
                              type="application/pdf"
                              className="w-full h-[600px]"
                            />
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      {/* ======================= */}
      {/* MODAL LOCAL: elegir método (solo para currículum) */}
      {/* ======================= */}
      {modalMetodoAbierto && seccion === "curriculum" && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={() => setModalMetodoAbierto(false)}
        >
          <div
            className="modal-contenedor"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className="modal-encabezado">
              <h3 className="modal-titulo">Método de actualización</h3>
              <button
                className="modal-cerrar"
                aria-label="Cerrar"
                onClick={() => setModalMetodoAbierto(false)}
              >
                ×
              </button>
            </header>
            <section className="modal-cuerpo">
              <p className="text-gray-700 text-center">
                Seleccione el método para actualizar su currículum:
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  style={{ backgroundColor: "#034991", color: "#FFFFFF" }}
                  onClick={() => seleccionarMetodo("cargar")}
                >
                  Cargar PDF
                </Button>
                <Button
                  style={{ backgroundColor: "#A7A7A9", color: "#FFFFFF" }}
                  onClick={() => seleccionarMetodo("generar")}
                >
                  Generar en el sistema
                </Button>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}

// Layout principal
VerCurriculum.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
