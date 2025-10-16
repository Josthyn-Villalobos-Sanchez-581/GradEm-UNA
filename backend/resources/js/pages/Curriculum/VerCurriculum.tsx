import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { Inertia } from "@inertiajs/inertia";
import { Button } from "@/components/ui/button";

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
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const modal = useModal();

  // Estado de navegación
  const [seccion, setSeccion] = React.useState<"curriculum" | "adjuntos">("curriculum");
  const [adjuntos, setAdjuntos] = React.useState<DocumentoAdjunto[]>([]);
  const [cargando, setCargando] = React.useState(false);
  const [docSeleccionado, setDocSeleccionado] = React.useState<DocumentoAdjunto | null>(null);

  // Mostrar mensajes flash
  React.useEffect(() => {
    if (flash?.success) modal.alerta({ titulo: "Éxito", mensaje: flash.success });
    if (flash?.error) modal.alerta({ titulo: "Error", mensaje: flash.error });
  }, [flash]);

  // Actualizar currículum
  const handleActualizar = async () => {
    const ok = await modal.confirmacion({
      titulo: "Actualizar Currículum",
      mensaje: "El currículum actual se perderá. ¿Desea continuar?",
    });
    if (!ok) return;

    const cargar = await modal.confirmacion({
      titulo: "Método de actualización",
      mensaje:
        "¿Desea cargar un nuevo archivo PDF como currículum?\n\n(Si selecciona 'Cancelar', podrá generarlo en el sistema).",
    });

    if (cargar) Inertia.get("/curriculum-cargado");
    else Inertia.get("/curriculum/generar");
  };

  // Cargar documentos adjuntos
  const cargarAdjuntos = async () => {
    setCargando(true);
    try {
      const response = await fetch("/curriculum/adjuntos");
      const data = await response.json();
      setAdjuntos(data);
    } catch {
      modal.alerta({
        titulo: "Error",
        mensaje: "No se pudieron cargar los archivos adjuntos.",
      });
    } finally {
      setCargando(false);
    }
  };

  // Cambiar de sección
  const cambiarSeccion = async (nueva: "curriculum" | "adjuntos") => {
    setSeccion(nueva);
    setDocSeleccionado(null);
    if (nueva === "adjuntos" && adjuntos.length === 0) await cargarAdjuntos();
  };

  return (
    <>
      <Head title="Gestión de Currículum" />

      <div
        className="max-w-5xl mx-auto bg-white shadow rounded-lg p-6 space-y-8"
        style={{ fontFamily: "Open Sans, sans-serif", color: "#000000" }}
      >
        {/* Encabezado principal */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-3 border-gray-200">
          <h1 className="text-3xl font-bold mb-3 md:mb-0" style={{ color: "#034991" }}>
            Mi Información Profesional
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.href = "/perfil"}
              variant="outline"
              size="default"
              className="shadow"
              style={{ backgroundColor: "#A7A7A9", color: "#FFFFFF" }}
            >
              Volver
            </Button>
            <Button
              onClick={handleActualizar}
              variant="default"
              size="default"
              className="shadow"
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

        {/* ============================= */}
        {/* 🟦 SECCIÓN: CURRÍCULUM */}
        {/* ============================= */}
        {seccion === "curriculum" && (
          <section className="pt-6">
            {!curriculum || !curriculum.rutaPublica ? (
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

        {/* ============================= */}
        {/* 🟥 SECCIÓN: DOCUMENTOS ADJUNTOS */}
        {/* ============================= */}
        {seccion === "adjuntos" && (
          <section className="pt-6">
            {cargando ? (
              <p className="text-center text-gray-500 italic">Cargando adjuntos...</p>
            ) : adjuntos.length === 0 ? (
              <p className="text-center text-gray-500 italic">
                No se encontraron documentos adjuntos.
              </p>
            ) : (
              <>
                {/* Lista de documentos */}
                <div className="grid md:grid-cols-2 gap-4">
                  {adjuntos.map((doc) => (
                    <div
                      key={doc.id_documento}
                      className={`border rounded-lg p-4 cursor-pointer hover:shadow transition ${
                        docSeleccionado?.id_documento === doc.id_documento
                          ? "border-blue-700 bg-blue-50"
                          : "border-gray-200"
                      }`}
                      onClick={() => setDocSeleccionado(doc)}
                    >
                      <p className="font-semibold text-lg text-gray-800">
                        📄 {doc.nombre_original}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Vista previa del documento seleccionado */}
                {docSeleccionado && (
                  <div className="mt-6">
                    <h3
                      className="text-lg font-semibold mb-3 text-center"
                      style={{ color: "#034991" }}
                    >
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
              </>
            )}
          </section>
        )}
      </div>
    </>
  );
}

// Layout principal
VerCurriculum.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
