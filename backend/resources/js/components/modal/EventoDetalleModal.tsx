import React from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  Calendar,
  MapPin,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ArrowLeft,
  GraduationCap,
  Users,
  Link as LinkIcon,
  Info
} from "lucide-react";

/* =======================
   TIPOS
======================= */

type Color = "blue" | "purple" | "amber";

interface Props {
  detalle: any;
  onClose: () => void;
}

/* =======================
   COLORES (TIPADOS)
======================= */

const colores: Record<Color, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-800",
  purple: "bg-purple-50 border-purple-200 text-purple-800",
  amber: "bg-amber-50 border-amber-200 text-amber-800",
};

const tagColores: Record<Exclude<Color, "amber">, string> = {
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
};

/* =======================
   COMPONENTE
======================= */

export default function EventoDetalleModal({ detalle, onClose }: Props) {

  if (!detalle) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 md:p-8 text-black"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* HEADER */}
        <div className="bg-[#034991] p-5 text-white flex justify-between items-center">
          <div>
            <h2 className="font-bold text-xl">Detalles del Evento</h2>
            <p className="text-xs opacity-80">Información completa del evento</p>
          </div>

          <button
            onClick={onClose}
            className="hover:bg-white/20 rounded-full p-2"
          >
            <ArrowLeft className="w-5 h-5 rotate-90" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              {detalle.titulo}
            </h3>
            <p className="text-slate-500 mt-1">
              {detalle.descripcion || "Sin descripción"}
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Item icon={<Calendar />} label="Fecha" value={detalle.fecha_evento} />
            <Item icon={<Clock />} label="Hora" value={detalle.hora_evento} />

            <Item
              icon={<MapPin />}
              label="Ubicación"
              value={`${detalle.canton_nombre}, ${detalle.provincia_nombre}`}
              full
            />

            <Item icon={<LayoutDashboard />} label="Modalidad" value={detalle.modalidad_nombre} />
            <Item icon={<User />} label="Creador" value={detalle.creador_nombre} />

            <div className="bg-slate-50 p-4 rounded-xl border flex items-center gap-3 md:col-span-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-slate-500">Estado</p>
                <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                  detalle.estado_id === 1
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                }`}>
                  {detalle.estado_id === 1 ? "Publicado" : "Borrador"}
                </span>
              </div>
            </div>
          </div>

          {/* CARRERAS */}
          {detalle.carreras?.length > 0 && (
            <Bloque titulo="Carreras dirigidas" icon={<GraduationCap />} color="blue">
              {detalle.carreras.map((c: string, i: number) => (
                <Tag key={i} color="blue">{c}</Tag>
              ))}
            </Bloque>
          )}

          {/* ROLES */}
          {detalle.roles?.length > 0 && (
            <Bloque titulo="Público objetivo" icon={<Users />} color="purple">
              {detalle.roles.map((r: string, i: number) => (
                <Tag key={i} color="purple">{r}</Tag>
              ))}
            </Bloque>
          )}

          {/* OBS */}
          {detalle.otras_observaciones && (
            <Bloque titulo="Información adicional" icon={<Info />} color="amber">
              {detalle.otras_observaciones.startsWith("http") ? (
                <a
                  href={detalle.otras_observaciones}
                  target="_blank"
                  className="text-blue-600 underline flex items-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" /> Acceder
                </a>
              ) : (
                <p>{detalle.otras_observaciones}</p>
              )}
            </Bloque>
          )}

          <Button className="w-full bg-[#034991]" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTES INTERNOS ================= */

function Item({ icon, label, value, full = false }: any) {
  return (
    <div className={`bg-slate-50 p-4 rounded-xl border flex items-center gap-3 ${full ? "md:col-span-2" : ""}`}>
      <div className="text-[#034991] w-5 h-5">{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-semibold">{value || "No definido"}</p>
      </div>
    </div>
  );
}

function Bloque({ titulo, icon, children, color }: { titulo: string; icon: any; children: any; color: Color }) {
  return (
    <div className={`${colores[color]} rounded-xl p-4 border`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="font-semibold">{titulo}</h4>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Tag({ children, color }: { children: any; color: "blue" | "purple" }) {
  return (
    <span className={`${tagColores[color]} px-2 py-1 text-xs rounded-full`}>
      {children}
    </span>
  );
}