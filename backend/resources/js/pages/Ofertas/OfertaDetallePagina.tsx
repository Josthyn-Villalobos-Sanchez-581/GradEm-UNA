import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import OfertaDetalle from "@/components/ofertas/OfertaDetalle";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Send, ShieldCheck, Info } from "lucide-react";

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
  estadoPostulacion?: number;
  tieneCV: boolean;
}

const OfertaDetallePagina: React.FC<PropsDetalle> = ({
  oferta,
  userPermisos,
  yaPostulado = false,
  estadoPostulacion,
  tieneCV,
}) => {
  const modal = useModal();
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  const tienePermiso = (id: number) =>
    Array.isArray(userPermisos) && userPermisos.includes(id);

  const onPostularClick = async () => {

    if (!tienePermiso(6)) {
      modal.alerta({
        titulo: "Acceso restringido",
        mensaje: "No cuenta con permisos para postularse.",
      });
      return;
    }

    if (!tieneCV) {
      modal.alerta({
        titulo: "Currículum requerido",
        mensaje: "Debes registrar o adjuntar tu currículum antes de postularte.",
      });
      return;
    }

    if (yaPostulado && estadoPostulacion !== 5) {
      modal.alerta({
        titulo: "Ya postulado",
        mensaje: "Usted ya se postuló a esta oferta.",
      });
      return;
    }

    setVistaActual("postulacion");
  };

  const enviarPostulacion = async () => {
    const confirmar = await modal.confirmacion({
      titulo: "Confirmar postulación",
      mensaje: "¿Desea enviar su postulación a esta oferta?",
    });

    if (!confirmar) return;
    setEnviando(true);

    router.post(
      `/ofertas/${oferta.id_oferta}/postular`,
      { mensaje },
      {
        onFinish: () => setEnviando(false),

        onSuccess: () => {
          modal.alerta({
            titulo: "¡Éxito!",
            mensaje: "Tu postulación ha sido enviada.",
          });

          router.visit(`/ofertas/${oferta.id_oferta}`);
        },
      }
    );
  };

  const [vistaActual, setVistaActual] = useState<"detalle" | "postulacion">("detalle");

  return (
    <>
      <Head title={`${oferta.titulo} | Detalle`} />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 text-[#000000]">
        <Head title={`${oferta.titulo} | Detalle`} />
        {/* HEADER PRINCIPAL */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#034991] tracking-tight flex items-center gap-3">
              {oferta.titulo}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Detalles completos de la oferta laboral o práctica profesional.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                if (vistaActual === "postulacion") {
                  setVistaActual("detalle");
                } else {
                  window.history.back();
                }
              }}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {vistaActual === "postulacion" ? "Volver al detalle" : "Volver al listado"}
            </Button>
          </div>
        </header>

        {/* Indicador de scroll */}
        {vistaActual === "detalle" && (
          <div className="flex flex-col items-center mb-6">
            <span className="text-sm text-slate-500 uppercase tracking-widest mb-2">
              Desliza hacia abajo
            </span>
            <div className="animate-bounce">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}

        {/* DETALLE DE LA OFERTA */}
        {vistaActual === "detalle" && (
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
              <OfertaDetalle
                oferta={oferta}
                modo="publica"
                onPostular={onPostularClick}
                deshabilitarPostulacion={yaPostulado && estadoPostulacion !== 5}
              />
            </div>
          </div>
        )}

        {/* FORMULARIO DE POSTULACIÓN */}
        {vistaActual === "postulacion" && (
          <div id="form-postulacion" className="max-w-6xl mx-auto px-6 mt-2">
            <div className="bg-white rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5 overflow-hidden">

              {/* Encabezado del Formulario */}
              <div className="bg-[#034991] p-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Finalizar Postulación</h3>
                    <p className="text-blue-100/80 text-xs font-medium uppercase tracking-widest mt-1">
                      Estás aplicando a: <span className="text-white font-bold">{oferta.titulo}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-12 space-y-10">
                {/* Panel Informativo Estilo Card */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex gap-4">
                      <ShieldCheck className="w-6 h-6 text-[#034991] shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">Privacidad Asegurada</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Tu CV y datos de contacto se compartirán únicamente con el reclutador de esta vacante.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <div className="flex gap-4">
                      <Info className="w-6 h-6 text-[#034991] shrink-0" />
                      <div>
                        <h4 className="font-bold text-[#034991] text-sm mb-1">Consejo Profesional</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Un mensaje breve explicando por qué eres ideal para el puesto aumenta tus chances.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Textarea */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                      Mensaje de presentación
                    </label>
                    <span className={`text-[10px] font-bold ${mensaje.length > 900 ? 'text-red-500' : 'text-slate-400'}`}>
                      {mensaje.length} / 1000 caracteres
                    </span>
                  </div>

                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    maxLength={1000}
                    placeholder="Escribe aquí un breve mensaje para la empresa..."
                    className="w-full min-h-[130px] rounded-[1.5rem] border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm focus:outline-none focus:border-[#034991] focus:bg-white transition-all resize-none shadow-inner"
                  />
                </div>

                {/* Footer del Formulario */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-medium max-w-[300px] text-center sm:text-left">
                    Al hacer clic en enviar, confirmas que la información en tu perfil está actualizada.
                  </p>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      onClick={() => setVistaActual("detalle")}
                    >
                      Descartar
                    </Button>

                    <Button
                      disabled={enviando}
                      variant="default"
                      onClick={enviarPostulacion}
                    >
                      {enviando ? "Procesando..." : "Enviar Postulación"}
                      {!enviando && <Send className="w-4 h-4 ml-2" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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