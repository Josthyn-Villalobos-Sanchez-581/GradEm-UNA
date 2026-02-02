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
    oferta.canton?.nombre,
    oferta.provincia?.nombre,
    oferta.pais?.nombre,
  ]
    .filter(Boolean)
    .join(", ");

  const formatearFecha = (fecha?: string) =>
    fecha
      ? new Date(fecha).toLocaleDateString("es-CR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : null;

  let requisitos: string[] = [];
  try {
    requisitos = Array.isArray(oferta.requisitos)
      ? oferta.requisitos
      : oferta.requisitos
      ? JSON.parse(oferta.requisitos)
      : [];
  } catch {
    requisitos = [];
  }

  const logoEmpresa =
    oferta.empresa?.usuario?.foto_perfil?.url ||
    oferta.empresa?.logo_url ||
    FotoXDefecto;

  /* =========================
      CONTROL BOTÓN POSTULAR
  ========================= */

  const mostrarBotonPostular =
    modo === "publica" && typeof onPostular === "function";

  /* =========================
      RENDER
  ========================= */

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-br from-[#034991] via-[#034991] to-[#023569] p-8 md:p-14 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />

        <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="space-y-6 text-center md:text-left flex-1">
            {modo === "preview" && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#CD1719] text-[10px] font-black rounded-full shadow-lg tracking-[0.2em]">
                BORRADOR
              </span>
            )}

            <h1 className="text-4xl md:text-6xl font-[900] uppercase italic tracking-tighter leading-tight">
              {oferta.titulo}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold uppercase border border-white/20">
                {oferta.categoria}
              </span>
              <span className="flex items-center gap-1 text-gray-200 text-sm font-medium">
                <MapPin className="w-4 h-4 text-[#CD1719]" />
                {oferta.provincia?.nombre || "Costa Rica"}
              </span>
            </div>
          </div>

          <div className="relative bg-white p-5 rounded-2xl shadow-2xl shrink-0">
            <img
              src={logoEmpresa}
              onError={(e) => (e.currentTarget.src = FotoXDefecto)}
              className="w-28 h-28 object-contain rounded-xl"
              alt={oferta.empresa?.nombre ?? "Empresa"}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">

        {/* ================= CONTENIDO PRINCIPAL ================= */}
        <div className="flex-1 p-8 md:p-12 space-y-12">

          {/* Descripción */}
          <section>
            <h2 className="text-2xl font-black text-[#034991] mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-[#CD1719] rounded-full" />
              DESCRIPCIÓN
            </h2>
            <div className="text-lg text-gray-700 leading-relaxed font-medium">
              {oferta.descripcion}
            </div>
          </section>

          {/* Requisitos */}
          {requisitos.length > 0 && (
            <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
              <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <CheckCircle2 className="text-[#CD1719] w-6 h-6" />
                REQUISITOS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requisitos.map((r, i) => (
                  <div
                    key={i}
                    className="flex gap-4 bg-white p-5 rounded-2xl border-l-4 border-[#034991] shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                    <span className="text-sm font-bold text-gray-700">{r}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contacto */}
          <section className="pt-6">
            <h3 className="text-2xl font-black text-[#034991] mb-8">
              CONTACTO DIRECTO
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                <Building2 className="mx-auto mb-3 text-[#034991]" />
                <p className="text-sm font-bold">{oferta.empresa?.nombre}</p>
              </div>

              {oferta.empresa?.correo && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <Mail className="mx-auto mb-3 text-[#CD1719]" />
                  <a
                    href={`mailto:${oferta.empresa.correo}`}
                    className="text-sm font-bold text-[#034991]"
                  >
                    {oferta.empresa.correo}
                  </a>
                </div>
              )}

              {oferta.empresa?.persona_contacto && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <User className="mx-auto mb-3 text-gray-600" />
                  <p className="text-sm font-bold">
                    {oferta.empresa.persona_contacto}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ================= SIDEBAR ================= */}
        <aside className="w-full lg:w-80 bg-[#FBFBFB] border-l border-gray-100 p-8 space-y-6">

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-5">
            {[
              { label: "Tipo", value: oferta.tipo_oferta, icon: Briefcase },
              { label: "Horario", value: oferta.horario, icon: Clock },
              { label: "Publicación", value: formatearFecha(oferta.fecha_publicacion), icon: Calendar },
            ].map(
              (item, idx) =>
                item.value && (
                  <div key={idx}>
                    <p className="text-[10px] font-black uppercase text-gray-400">
                      {item.label}
                    </p>
                    <p className="text-sm font-bold flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-[#034991]" />
                      {item.value}
                    </p>
                  </div>
                )
            )}
          </div>

          {oferta.fecha_limite && (
            <div className="bg-[#CD1719] text-white p-6 rounded-[2rem] shadow-lg">
              <p className="text-[10px] font-black uppercase mb-1">
                Fecha límite
              </p>
              <p className="text-xl font-black italic">
                {formatearFecha(oferta.fecha_limite)}
              </p>
            </div>
          )}

          {mostrarBotonPostular && (
            <button
              onClick={onPostular}
              disabled={deshabilitarPostulacion}
              className={`group w-full py-5 rounded-2xl flex justify-center items-center gap-3 font-black transition-all shadow-xl
                ${
                  deshabilitarPostulacion
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#034991] hover:bg-black text-white shadow-[#034991]/20"
                }`}
            >
              {deshabilitarPostulacion ? "YA POSTULADO" : "POSTULAR AHORA"}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
