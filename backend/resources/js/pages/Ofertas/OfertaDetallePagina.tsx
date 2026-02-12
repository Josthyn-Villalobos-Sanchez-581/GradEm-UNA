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
}

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

  const onPostularClick = async () => {
    if (!tienePermiso(6)) {
      modal.alerta({
        titulo: "Acceso restringido",
        mensaje: "No cuenta con permisos para postularse.",
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
      document.getElementById("form-postulacion")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
        },
      }
    );
  };

  return (
    <>
      <Head title={`${oferta.titulo} | Detalle`} />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 text-[#000000]">
        {/* HEADER DE NAVEGACIÓN */}
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="group text-slate-500 hover:text-[#034991] font-bold transition-all p-0"
          >
            <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            Volver al listado
          </Button>
        </div>

        {/* DETALLE DE LA OFERTA */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <OfertaDetalle
              oferta={oferta}
              modo="publica"
              onPostular={onPostularClick}
              deshabilitarPostulacion={yaPostulado}
            />
          </div>
        </div>

        {/* FORMULARIO DE POSTULACIÓN */}
        {mostrarFormulario && !yaPostulado && (
          <div id="form-postulacion" className="max-w-4xl mx-auto px-6 mt-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
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
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
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
                  <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
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
                    className="w-full min-h-[180px] rounded-[1.5rem] border-2 border-slate-100 bg-slate-50 px-6 py-5 text-sm focus:outline-none focus:border-[#034991] focus:bg-white transition-all resize-none shadow-inner"
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
                      className="flex-1 sm:flex-none rounded-xl font-bold text-slate-500 px-8 h-12"
                      onClick={() => setMostrarFormulario(false)}
                    >
                      Descartar
                    </Button>

                    <Button
                      disabled={enviando}
                      onClick={enviarPostulacion}
                      className="flex-1 sm:flex-none rounded-xl bg-[#034991] hover:bg-black text-white px-10 h-12 font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
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