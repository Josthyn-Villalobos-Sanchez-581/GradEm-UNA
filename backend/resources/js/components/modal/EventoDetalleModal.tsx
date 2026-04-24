import React from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  Calendar,
  MapPin,
  LayoutDashboard,
  Clock,
  GraduationCap,
  Users,
  Link as LinkIcon,
  Info,
} from "lucide-react";

interface Props {
  detalle: any;
  onClose: () => void;
  puedeGestionar?: boolean;
  onEditar?: (detalle: any) => void;
}

export default function EventoDetalleModal({
  detalle,
  onClose,
  puedeGestionar,
  onEditar,
}: Props) {
  if (!detalle) return null;

  const cuposTotales = detalle.cupos ?? null;
  const inscritos = detalle.inscritos_count ?? 0;
  const cuposDisponibles =
    cuposTotales !== null ? Math.max(cuposTotales - inscritos, 0) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-3xl overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="relative bg-[#034991] p-6 text-white">
          <h2 className="text-2xl font-bold">{detalle.titulo}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              {detalle.modalidad_nombre ?? "Modalidad"}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                detalle.estado_id === 1
                  ? "bg-emerald-200 text-emerald-900"
                  : "bg-amber-200 text-amber-900"
              }`}
            >
              {detalle.estado_id === 1 ? "Publicado" : "Borrador"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* COLUMNA PRINCIPAL */}
          <div className="lg:col-span-8 p-6 space-y-4 border-r border-slate-200">
            {/* Descripción */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Descripción
              </h3>
              <p className="text-sm text-slate-700">
                {detalle.descripcion || "Sin descripción."}
              </p>
            </div>

            {/* Grid de datos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ItemCard
                icon={<Calendar className="h-4 w-4" />}
                label="Fecha"
                value={detalle.fecha_evento}
              />
              <ItemCard
                icon={<Clock className="h-4 w-4" />}
                label="Hora"
                value={detalle.hora_evento}
              />
              <ItemCard
                icon={<MapPin className="h-4 w-4" />}
                label="Ubicación"
                value={
                  detalle.canton_nombre && detalle.provincia_nombre
                    ? `${detalle.canton_nombre}, ${detalle.provincia_nombre}`
                    : "No definida"
                }
                full
              />
              <ItemCard
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Modalidad"
                value={detalle.modalidad_nombre}
              />
              <ItemCard
                icon={<User className="h-4 w-4" />}
                label="Creador"
                value={detalle.creador_nombre}
              />
            </div>

            {/* Carreras */}
            {detalle.carreras?.length > 0 && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-4 w-4 text-blue-700" />
                  <h4 className="text-sm font-semibold text-blue-800">
                    Carreras dirigidas
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {detalle.carreras.map((c: string, i: number) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Roles */}
            {detalle.roles?.length > 0 && (
              <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-purple-700" />
                  <h4 className="text-sm font-semibold text-purple-800">
                    Público objetivo
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {detalle.roles.map((r: string, i: number) => (
                    <span
                      key={i}
                      className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Resumen</h3>

            <ul className="space-y-3 text-slate-700">
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-sm">
                  Cupos totales:{" "}
                  <strong className="text-slate-900">
                    {cuposTotales ?? "Ilimitado"}
                  </strong>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-sm">
                  Inscritos:{" "}
                  <strong className="text-slate-900">{inscritos}</strong>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-sm">
                  Disponibles:{" "}
                  <strong className="text-emerald-700">
                    {cuposDisponibles !== null
                      ? `${cuposDisponibles} disponibles`
                      : "Sin límite"}
                  </strong>
                </span>
              </li>
            </ul>

            {/* Info adicional */}
            {detalle.otras_observaciones && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-amber-700" />
                  <h4 className="text-sm font-semibold text-amber-800">
                    Información adicional
                  </h4>
                </div>
                {detalle.otras_observaciones.startsWith("http") ? (
                  <a
                    href={detalle.otras_observaciones}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline flex items-center gap-2 text-sm"
                  >
                    <LinkIcon className="h-4 w-4" /> Acceder
                  </a>
                ) : (
                  <p className="text-sm text-amber-900">
                    {detalle.otras_observaciones}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2 pt-2">
              {puedeGestionar && onEditar && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onEditar(detalle)}
                >
                  Editar
                </Button>
              )}
              <Button
                className="w-full bg-[#034991] hover:bg-[#023a73]"
                onClick={onClose}
              >
                Cerrar
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ============ COMPONENTE INTERNO ============ */

function ItemCard({
  icon,
  label,
  value,
  full = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
  full?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <div className="rounded-lg bg-blue-100 p-2 text-blue-600 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">
          {value ?? "No definido"}
        </p>
      </div>
    </div>
  );
}