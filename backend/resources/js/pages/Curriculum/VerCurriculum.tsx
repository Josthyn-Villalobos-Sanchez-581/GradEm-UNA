// backend/resources/js/pages/Curriculum/VerCurriculum.tsx
import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { Inertia } from "@inertiajs/inertia";

interface Curriculum {
  rutaPublica?: string;
}

interface Props {
  curriculum: Curriculum | null;
  userPermisos: number[];
}

export default function VerCurriculum({ curriculum }: Props) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const modal = useModal();

  // Mostrar mensajes flash con modal estándar
  React.useEffect(() => {
    if (flash?.success) {
      modal.alerta({ titulo: "Éxito", mensaje: flash.success });
    }
    if (flash?.error) {
      modal.alerta({ titulo: "Error", mensaje: flash.error });
    }
  }, [flash]);

  const handleActualizar = async () => {
    // Primer aviso
    const ok = await modal.confirmacion({
      titulo: "Actualizar Currículum",
      mensaje: "El currículum actual se perderá. ¿Desea continuar?",
    });

    if (!ok) return;

    // Segundo paso: preguntar por método de actualización
    const cargar = await modal.confirmacion({
      titulo: "Método de actualización",
      mensaje: "¿Desea cargar un nuevo archivo PDF como currículum?\n\n(Si selecciona 'Cancelar', podrá generarlo en el sistema).",
    });

    if (cargar) {
      Inertia.get("/curriculum-cargado");
    } else {
      Inertia.get("/curriculum/generar");
    }
  };

  return (
    <>
      <Head title="Mi Currículum">
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6"
        style={{ fontFamily: "Open Sans, sans-serif", color: "#000000" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-200">
          <h2 className="text-2xl font-bold" style={{ color: "#034991" }}>
            Mi Currículum
          </h2>
          <div className="flex gap-3">
            <Link
              href="/perfil"
              className="px-4 py-2 rounded shadow text-white font-semibold transition"
              style={{ backgroundColor: "#A7A7A9" }}
            >
              Volver
            </Link>
            <button
              type="button"
              onClick={handleActualizar}
              className="px-4 py-2 rounded shadow font-semibold transition text-white"
              style={{ backgroundColor: "#034991" }}
            >
              Actualizar Currículum
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex flex-col gap-6">
          {!curriculum || !curriculum.rutaPublica ? (
            <p className="text-center italic" style={{ color: "#A7A7A9" }}>
              No tienes un currículum cargado o generado en el sistema.
            </p>
          ) : (
            <div className="flex justify-center">
              <embed
                src={curriculum.rutaPublica}
                type="application/pdf"
                className="w-full h-[85vh] border rounded-lg shadow-lg"
                style={{ borderColor: "#A7A7A9" }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Layout principal
VerCurriculum.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
