import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { Inertia } from "@inertiajs/inertia";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";

interface Curriculum {
  rutaPublica?: string;
}

interface DocumentoAdjunto {
  id_documento: number;
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

  // Modal local para elegir método de actualización
  const [modalMetodoAbierto, setModalMetodoAbierto] = useState(false);

  // Función para actualizar currículum
  const handleActualizar = async () => {
    // Confirmación usando modal del sistema
    const continuar = await modal.confirmacion({
      titulo: "Actualizar Currículum",
      mensaje: "El currículum actual se perderá. ¿Desea continuar?",
    });
    if (!continuar) return;

    // Abrir modal local para seleccionar método
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
      const response = await fetch("/curriculum/adjuntos");
      const data = await response.json();
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
              onClick={() => window.location.href = "/perfil"}
              variant="outline"
              size="default"
              style={{ backgroundColor: "#A7A7A9", color: "#FFFFFF" }}
            >
              Volver
            </Button>
            <Button
              onClick={handleActualizar}
              variant="default"
              size="default"
              style={{ backgroundColor: "#034991" }}
            >
              Actualizar Currículum
            </Button>
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

        {/* SECCIÓN DOCUMENTOS ADJUNTOS */}
        {seccion === "adjuntos" && (
          <section className="pt-6">
            {cargando ? (
              <p className="text-center text-gray-500 italic">Cargando adjuntos...</p>
            ) : adjuntos.length === 0 ? (
              <p className="text-center text-gray-500 italic">No se encontraron documentos adjuntos.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {adjuntos.map((doc) => (
                  <div
                    key={doc.id_documento}
                    className={`border rounded-lg p-4 cursor-pointer hover:shadow transition ${docSeleccionado?.id_documento === doc.id_documento
                        ? "border-blue-700 bg-blue-50"
                        : "border-gray-200"
                      }`}
                    onClick={() => setDocSeleccionado(doc)}
                  >
                    <p className="font-semibold text-lg text-gray-800">📄 {doc.nombre_original}</p>
                  </div>
                ))}
              </div>
            )}
            {docSeleccionado && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-center" style={{ color: "#034991" }}>
                  Visualizando: {docSeleccionado.nombre_original}
                </h3>
                <div className="flex justify-center">
                  <embed
                    src={docSeleccionado.rutaPublica}
                    type="application/pdf"
                    className="w-full h-[70vh] border rounded-lg shadow-lg"
                    style={{ borderColor: "#A7A7A9" }}
                  />
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* ======================= */}
      {/* MODAL LOCAL: elegir método */}
      {/* ======================= */}
      {modalMetodoAbierto && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={() => setModalMetodoAbierto(false)} // cerrar al click en el fondo
        >
          <div
            className="modal-contenedor"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()} // evitar cierre al click dentro
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
