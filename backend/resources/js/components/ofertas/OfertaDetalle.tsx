import React from "react";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  ChevronRight,
  Mail,
  User,
  ExternalLink,
} from "lucide-react";

interface Props {
  oferta: any;
  modo?: "preview" | "publica";
  onPostular?: () => void;
  deshabilitarPostulacion?: boolean;
}

export default function OfertaDetalle({
  oferta,
  modo = "publica",
  onPostular,
  deshabilitarPostulacion = false,
}: Props) {
  
  /* =========================
      UTILIDADES
  ========================= */
  const ubicacion = [
    oferta.pais?.nombre,
    oferta.provincia?.nombre,
    oferta.canton?.nombre,
  ].filter(Boolean).join(" · ");

  const formatearFecha = (fecha?: string) =>
    fecha ? new Date(fecha).toLocaleDateString("es-CR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }) : null;

  let requisitos: string[] = [];
  try {
    requisitos = Array.isArray(oferta.requisitos)
      ? oferta.requisitos
      : oferta.requisitos ? JSON.parse(oferta.requisitos) : [];
  } catch {
    requisitos = [];
  }

  const logoEmpresa = oferta.empresa?.usuario?.foto_perfil?.url || oferta.empresa?.logo_url || FotoXDefecto;
  const mostrarBotonPostular = modo === "publica" && typeof onPostular === "function";

  return (
    // Se eliminó min-h-screen forzado para permitir integración en contenedores más pequeños
    <div className="w-full bg-[#F8FAFC] md:min-h-screen">
      <div className="max-w-6xl mx-auto bg-white md:rounded-[2.5rem] shadow-sm md:shadow-2xl border-x md:border border-gray-100 overflow-hidden">
        
        {/* ================= HEADER MODERNO ================= */}
        <div className="relative bg-[#034991] p-6 sm:p-10 md:p-16 text-white overflow-hidden">
          {/* Elementos decorativos de marca */}
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full -mr-20 -mt-20 md:-mr-32 md:-mt-32 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 md:w-64 md:h-64 bg-[#CD1719]/20 rounded-full -ml-10 -mb-10 md:-ml-20 md:-mb-20 blur-2xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10">
            <div className="space-y-4 md:space-y-6 text-center md:text-left flex-1 w-full">
              {modo === "preview" && (
                <div className="flex justify-center md:justify-start">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#CD1719] text-[10px] md:text-[11px] font-black rounded-full shadow-xl tracking-widest animate-pulse">
                    VISTA PREVIA
                    </span>
                </div>
              )}

              <div className="space-y-3">
                {/* Título responsivo: más pequeño en móvil para evitar saltos de línea feos */}
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase italic tracking-tight leading-tight md:leading-[0.95] drop-shadow-md break-words">
                  {oferta.titulo}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 pt-2">
                  <span className="px-3 py-1 md:px-4 md:py-1.5 bg-[#CD1719] rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider">
                    {oferta.categoria || "General"}
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-100 text-xs md:text-sm font-bold bg-white/10 px-3 py-1 md:px-4 md:py-1.5 rounded-lg backdrop-blur-sm">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 text-[#CD1719]" />
                    <span className="truncate max-w-[200px] md:max-w-none">{ubicacion || "Costa Rica"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Logo de Empresa con Glassmorphism */}
            <div className="relative group shrink-0 mt-4 md:mt-0">
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#CD1719] to-[#034991] rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition duration-500 hidden md:block"></div>
              <div className="relative bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-xl flex items-center justify-center">
                <img
                  src={logoEmpresa}
                  onError={(e) => (e.currentTarget.src = FotoXDefecto)}
                  className="w-20 h-20 md:w-32 md:h-32 object-contain transition-transform duration-500 group-hover:scale-105"
                  alt="Logo"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* ================= CONTENIDO PRINCIPAL ================= */}
          {/* Padding reducido en móviles (p-6) vs desktop (p-14) */}
          <div className="flex-1 p-6 md:p-14 space-y-10 md:space-y-16 order-2 lg:order-1">
            
            {/* Descripción */}
            <section className="relative">
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="w-1.5 h-8 md:w-2 md:h-10 bg-[#CD1719] rounded-full" />
                <h2 className="text-2xl md:text-3xl font-black text-[#034991] tracking-tight">DETALLES DEL PUESTO</h2>
              </div>
              <div className="text-base md:text-lg text-gray-600 leading-relaxed font-medium whitespace-pre-line text-justify md:text-left">
                {oferta.descripcion}
              </div>
            </section>

            {/* Requisitos */}
            {requisitos.length > 0 && (
              <section className="bg-gray-50/80 p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-gray-100 relative">
                <div className="absolute top-0 right-1/2 translate-x-1/2 md:translate-x-0 md:right-10 -mt-4 bg-white px-4 py-1.5 md:px-6 md:py-2 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 whitespace-nowrap">
                  <CheckCircle2 className="text-[#CD1719] w-4 h-4 md:w-5 md:h-5" />
                  <span className="font-black text-[#034991] text-xs md:text-sm">LO QUE BUSCAMOS</span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:gap-4 mt-4 md:mt-4">
                  {requisitos.map((r, i) => (
                    <div
                      key={i}
                      className="group flex gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl border border-transparent hover:border-[#034991]/20 hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-[#034991] transition-colors mt-0.5">
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-[#034991] group-hover:text-white" />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{r}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contacto - Grid ajustado para móvil */}
            <section>
              <h3 className="text-lg md:text-xl font-black text-[#034991] mb-6 md:mb-8 tracking-widest uppercase text-center md:text-left">Información de Contacto</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Building2 className="text-[#034991] w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Empresa</p>
                    <p className="text-sm font-bold text-gray-800 break-words">{oferta.empresa?.nombre}</p>
                  </div>
                </div>

                {oferta.empresa?.correo && (
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <Mail className="text-[#CD1719] w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase">E-mail</p>
                      <a href={`mailto:${oferta.empresa.correo}`} className="text-sm font-bold text-[#034991] truncate block hover:underline">
                        {oferta.empresa.correo}
                      </a>
                    </div>
                  </div>
                )}

                {oferta.empresa?.persona_contacto && (
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      <User className="text-gray-600 w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Atención</p>
                      <p className="text-sm font-bold text-gray-800">{oferta.empresa.persona_contacto}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ================= SIDEBAR ================= */}
          {/* En móvil: order-1 (arriba) o order-3 (abajo). Lo he puesto order-1 para que vean el resumen rápido primero, o order-3 si prefieres al final. 
              Por UX suele ser mejor tener el resumen y el botón de aplicar accesibles. Aquí lo dejo como sticky lateral en desktop, y bloque estático abajo en móvil (order-3). */}
          <aside className="w-full lg:w-96 bg-[#FBFBFB] border-t lg:border-t-0 lg:border-l border-gray-100 p-6 md:p-10 order-1 lg:order-2">
            <div className="lg:sticky lg:top-8 space-y-6">
              
              {/* Tarjeta de Especificaciones */}
              <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-lg md:shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6 md:space-y-8">
                <h4 className="font-black text-[#034991] text-xs tracking-[0.2em] border-b pb-4">RESUMEN</h4>
                
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-0 lg:space-y-6">
                    {[
                    { label: "Tipo de Contrato", value: oferta.tipo_oferta, icon: Briefcase },
                    { label: "Jornada Laboral", value: oferta.horario, icon: Clock },
                    { label: "Publicado el", value: formatearFecha(oferta.fecha_publicacion), icon: Calendar },
                    ].map((item, idx) => item.value && (
                    <div key={idx} className="group">
                        <div className="flex items-center gap-2 md:gap-3 mb-1">
                        <item.icon className="w-3 h-3 md:w-4 md:h-4 text-[#CD1719]" />
                        <p className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-tighter">
                            {item.label}
                        </p>
                        </div>
                        <p className="text-xs md:text-sm font-black text-[#034991] ml-5 md:ml-7 line-clamp-2">
                        {item.value}
                        </p>
                    </div>
                    ))}
                </div>

                {/* Fecha límite destacada */}
                {oferta.fecha_limite && (
                  <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-dashed border-gray-200">
                    <div className="bg-red-50 p-4 md:p-5 rounded-2xl border border-[#CD1719]/10 text-center lg:text-left">
                      <p className="text-[10px] font-black uppercase text-[#CD1719] mb-1 tracking-widest">
                        Cierre de aplicaciones
                      </p>
                      <p className="text-base md:text-lg font-black text-gray-900 italic">
                        {formatearFecha(oferta.fecha_limite)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Acción Principal */}
              {mostrarBotonPostular && (
                <div className="sticky bottom-4 z-20 lg:static">
                    <button
                    onClick={onPostular}
                    disabled={deshabilitarPostulacion}
                    className={`group w-full py-4 md:py-6 rounded-2xl md:rounded-[2rem] flex justify-center items-center gap-3 font-black transition-all duration-300 shadow-xl lg:shadow-2xl scale-100 active:scale-95 text-sm md:text-base
                        ${deshabilitarPostulacion
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                        : "bg-[#034991] hover:bg-black text-white shadow-blue-900/20 hover:-translate-y-1"
                        }`}
                    >
                    {deshabilitarPostulacion ? (
                        <span className="flex items-center gap-2">ENVIADA <CheckCircle2 className="w-5 h-5" /></span>
                    ) : (
                        <>
                        APLICAR AHORA
                        <ExternalLink className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                    )}
                    </button>
                </div>
              )}
              
              <p className="text-center text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest px-4">
                Asegúrate de cumplir con todos los requisitos antes de aplicar
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}