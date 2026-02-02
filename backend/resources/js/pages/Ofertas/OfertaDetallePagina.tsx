import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import OfertaDetalle from "@/components/ofertas/OfertaDetalle";
import { Button } from "@/components/ui/button";

/* =====================
   TIPOS
===================== */

interface OfertaDetalleTipo {
  id_oferta: number;
  titulo: string;
  descripcion: string;
  requisitos: string | string[];
  tipo_oferta: string;
  categoria: string;
  horario: string;
  fecha_limite: string;
  fecha_publicacion: string;
  empresa?: any;
}

interface PropsDetalle {
  oferta: OfertaDetalleTipo;
  userPermisos: number[];
  yaPostulado?: boolean;
}

/* =====================
   COMPONENTE
===================== */

const OfertaDetallePagina: React.FC<PropsDetalle> = ({
  oferta,
  userPermisos,
  yaPostulado = false,
}) => {
  const modal = useModal();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  const tienePermiso = (id: number) =>
    Array.isArray(userPermisos) && userPermisos.includes(id);

  /* =====================
     CLICK POSTULAR
  ===================== */
  const onPostularClick = async () => {
    if (!tienePermiso(6)) {
      modal.alerta({
        titulo: "Acceso restringido",
        mensaje: "No cuenta con permisos para postularse a ofertas laborales.",
      });
      return;
    }

    if (yaPostulado) {
      modal.alerta({
        titulo: "Ya postulado",
        mensaje: "Usted ya se postuló a esta oferta.",
      });
      return;
    }

    setMostrarFormulario(true);

    setTimeout(() => {
      document
        .getElementById("form-postulacion")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  /* =====================
     ENVIAR POSTULACIÓN
  ===================== */
  const enviarPostulacion = async () => {
    const confirmar = await modal.confirmacion({
      titulo: "Confirmar postulación",
      mensaje: "¿Desea enviar su postulación a esta oferta?",
    });

    if (!confirmar) return;

    setEnviando(true);

    Inertia.post(
      `/ofertas/${oferta.id_oferta}/postular`,
      { mensaje },
      {
        onFinish: () => setEnviando(false),
        onSuccess: () => {
          modal.alerta({
            titulo: "Postulación enviada",
            mensaje: "Su postulación se envió correctamente.",
          });
        },
        onError: () => {
          modal.alerta({
            titulo: "Error",
            mensaje: "Ocurrió un error al enviar la postulación.",
          });
        },
      }
    );
  };

  /* =====================
     RENDER
  ===================== */
  return (
    <>
      <Head title={`Oferta - ${oferta.titulo}`} />

      {/* 🔹 DETALLE DE LA OFERTA */}
      <OfertaDetalle
        oferta={oferta}
        modo="publica"
        onPostular={onPostularClick}
        deshabilitarPostulacion={yaPostulado}
      />

      {/* 🔹 FORMULARIO DE POSTULACIÓN */}
      {mostrarFormulario && !yaPostulado && (
        <div
          id="form-postulacion"
          className="max-w-5xl mx-auto px-6 py-10"
        >
          <div className="bg-white rounded-[2rem] border border-gray-200 shadow-lg p-8 space-y-6">
            <h3 className="text-2xl font-black text-[#034991]">
              Postulación a la oferta
            </h3>

            <p className="text-sm text-gray-600">
              Puede agregar un mensaje opcional para la empresa (máx. 1000
              caracteres).
            </p>

            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              maxLength={1000}
              placeholder="Escriba su mensaje aquí..."
              className="w-full min-h-[140px] rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
            />

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </Button>

              <Button
                disabled={enviando}
                onClick={enviarPostulacion}
                className="bg-[#034991] hover:bg-black"
              >
                {enviando ? "Enviando..." : "Enviar postulación"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* =====================
   LAYOUT
===================== */
(OfertaDetallePagina as any).layout = (
  page: React.ReactNode & { props: PropsDetalle }
) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};

export default OfertaDetallePagina;
