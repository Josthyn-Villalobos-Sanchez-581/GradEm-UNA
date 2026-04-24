import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import axios from "axios";
import EventoDetalleModal from "@/components/modal/EventoDetalleModal";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import {
  Search,
  Calendar,
  MapPin,
  Filter,
  FilterX,
  ArrowLeft,
  Users,
  CalendarCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";

// =======================
// TIPOS
// =======================

interface Evento {
  id_evento: number;
  titulo: string;
  descripcion?: string;
  fecha_evento?: string;
  hora_evento?: string;
  estado_id: number;

  modalidad_nombre?: string;
  canton_nombre?: string;
  provincia_nombre?: string;
  pais_nombre?: string;

  cupos?: number;
  inscritos_count?: number;
}

interface Props {
  eventos: Evento[];
  modalidades: { id_modalidad: number; nombre: string }[];
  userPermisos: number[];
  misInscripciones: number[];
}

// =======================
// COMPONENTE
// =======================

export default function EventosInscripcionIndex(props: Props) {
  const modal = useModal();

  const [eventos, setEventos] = useState<Evento[]>(props.eventos);
  const [detalle, setDetalle] = useState<Evento | null>(null);
  const [misInscripciones, setMisInscripciones] = useState<Set<number>>(
    new Set(props.misInscripciones ?? [])
  );
  const [inscribiendose, setInscribiendose] = useState<Set<number>>(new Set());

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("todos");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);

  const itemsPorPagina = 9;

  // =======================
  // FILTROS
  // =======================

  const eventosFiltrados = eventos
    .filter((e) =>
      e.titulo.toLowerCase().includes(busqueda.toLowerCase())
    )
    .filter((e) => {
      if (filtroModalidad === "todos") return true;
      return e.modalidad_nombre === filtroModalidad;
    })
    .filter((e) => {
      if (!filtroFecha) return true;
      return e.fecha_evento && e.fecha_evento >= filtroFecha;
    })
    .filter((e) => {
      if (!e.fecha_evento) return true;
      return new Date(e.fecha_evento) >= new Date();
    })
    .filter((e) => {
      if (!soloDisponibles) return true;

      const inscritos = e.inscritos_count ?? 0;
      const sinCupos = e.cupos != null && inscritos >= e.cupos;
      const yaInscrito = misInscripciones.has(e.id_evento);

      return !sinCupos && !yaInscrito;
    });

  const totalPaginas = Math.ceil(eventosFiltrados.length / itemsPorPagina);

  const eventosPaginados = eventosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  // =======================
  // KPIs
  // =======================

  const totalEventos = eventosFiltrados.length;
  const misEventosCount = eventosFiltrados.filter((e) =>
    misInscripciones.has(e.id_evento)
  ).length;
  const disponibles = eventosFiltrados.filter((e) => {
    if (!e.cupos) return true;
    return (e.inscritos_count ?? 0) < e.cupos;
  }).length;

  // =======================
  // INSCRIPCIÓN
  // =======================

  const inscribirse = async (evento: Evento) => {
    const confirmado = await modal.confirmacion({
      titulo: "Inscribirse al evento",
      contenido: (
        <p>
          ¿Deseas inscribirte a <strong>{evento.titulo}</strong>?
        </p>
      ),
    });

    if (!confirmado) return;

    // VALIDAR CUPOS ANTES DE ENVIAR
    if (evento.cupos && (evento.inscritos_count ?? 0) >= evento.cupos) {
      modal.alerta({
        titulo: "Sin cupos",
        mensaje: "Este evento ya está lleno",
      });
      return;
    }

    setInscribiendose((prev) => new Set(prev).add(evento.id_evento));

    try {
      // 🔥 CAMBIO AQUÍ
      const res = await axios.post(
        route("eventos.inscribirse", { idEvento: evento.id_evento })
      );

      // marcar como inscrito
      setMisInscripciones((prev) => new Set(prev).add(evento.id_evento));

      // 🔥 ACTUALIZAR EVENTO DESDE BACKEND
      setEventos((prev) =>
        prev.map((e) =>
          e.id_evento === evento.id_evento
            ? {
              ...e,
              inscritos_count: res.data.evento.inscritos_count,
            }
            : e
        )
      );

      modal.alerta({
        titulo: "Éxito",
        mensaje: "Te has inscrito correctamente",
      });
    } catch (error: any) {
      modal.alerta({
        titulo: "Error",
        mensaje:
          error?.response?.data?.message ??
          error?.message ??
          "Error inesperado",
      });
    } finally {
      setInscribiendose((prev) => {
        const next = new Set(prev);
        next.delete(evento.id_evento);
        return next;
      });
    }
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroModalidad("todos");
    setFiltroFecha("");
    setSoloDisponibles(false);
    setPaginaActual(1);
  };

  // =======================
  // RENDER
  // =======================

  return (
    <>
      <Head title="Inscripción a Eventos" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#034991]">
              Eventos Disponibles
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Explorá y registrate en los eventos activos de la universidad.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              className="h-10 rounded-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB]"
              onClick={() => (window.location.href = route("dashboard"))}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>

            <Button
              variant="outline"
              className="h-10 rounded-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB]"
              onClick={() => setMostrarFiltros((prev) => !prev)}
            >
              {mostrarFiltros ? (
                <>
                  <FilterX className="w-4 h-4 mr-2" />
                  Ocultar filtros
                </>
              ) : (
                <>
                  <Filter className="w-4 h-4 mr-2" />
                  Mostrar filtros
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* SIDEBAR FILTROS */}
          {mostrarFiltros && (
            <aside className="lg:col-span-3">
              <div className="sticky top-6">
                <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
                  <h2 className="text-lg font-semibold text-[#034991] border-b pb-2 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filtros
                  </h2>

                  <div className="space-y-4 text-sm">

                    {/* Búsqueda */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1 text-slate-700">
                        Buscar
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          placeholder="Título del evento..."
                          value={busqueda}
                          onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPaginaActual(1);
                          }}
                          className="w-full pl-9 bg-white text-black border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Modalidad */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1 text-slate-700">
                        Modalidad
                      </label>
                      <select
                        value={filtroModalidad}
                        onChange={(e) => {
                          setFiltroModalidad(e.target.value);
                          setPaginaActual(1);
                        }}
                        className="bg-white text-black border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="todos">Todas</option>
                        {props.modalidades.map((m) => (
                          <option key={m.id_modalidad} value={m.nombre}>
                            {m.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fecha desde */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1 text-slate-700">
                        Fecha desde
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={filtroFecha}
                        onChange={(e) => {
                          setFiltroFecha(e.target.value);
                          setPaginaActual(1);
                        }}
                        className="bg-white text-black border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    {/* Solo disponibles */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="soloDisponibles"
                        checked={soloDisponibles}
                        onChange={(e) => {
                          setSoloDisponibles(e.target.checked);
                          setPaginaActual(1);
                        }}
                        className="w-4 h-4 accent-[#034991]"
                      />
                      <label
                        htmlFor="soloDisponibles"
                        className="font-semibold text-slate-700 cursor-pointer"
                      >
                        Solo con cupos disponibles
                      </label>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB] rounded-full"
                      onClick={limpiarFiltros}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* MAIN */}
          <main
            className={`${mostrarFiltros ? "lg:col-span-9" : "lg:col-span-12"
              } space-y-4`}
          >
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                    Total eventos
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {totalEventos}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                    Mis inscripciones
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {misEventosCount}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                <div className="rounded-xl bg-amber-100 p-2 text-amber-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                    Con cupos disponibles
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {disponibles}
                  </p>
                </div>
              </div>
            </div>

            {/* GRID DE EVENTOS */}
            <div
              className={`grid grid-cols-1 ${mostrarFiltros
                  ? "md:grid-cols-2"
                  : "md:grid-cols-2 lg:grid-cols-3"
                } gap-4`}
            >
              {eventosPaginados.length > 0 ? (
                eventosPaginados.map((evento) => {
                  const inscritos = evento.inscritos_count ?? 0;
                  const porcentaje = evento.cupos
                    ? Math.min((inscritos / evento.cupos) * 100, 100)
                    : 0;
                  const yaInscrito = misInscripciones.has(evento.id_evento);
                  const lleno =
                    evento.cupos != null && inscritos >= evento.cupos;

                  return (
                    <div
                      key={evento.id_evento}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 flex flex-col"
                    >
                      {/* Título y badge */}
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="font-bold text-lg text-slate-800 line-clamp-1">
                          {evento.titulo}
                        </h2>
                        {yaInscrito && (
                          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 shrink-0 ml-2">
                            Inscrito
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {evento.descripcion}
                      </p>

                      {/* Modalidad */}
                      {evento.modalidad_nombre && (
                        <span className="inline-block mb-3 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold w-fit">
                          {evento.modalidad_nombre}
                        </span>
                      )}

                      {/* PROGRESO CUPOS */}
                      {evento.cupos != null && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Inscritos</span>
                            <span>
                              {inscritos} / {evento.cupos}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full">
                            <div
                              className={`h-2 rounded-full ${lleno ? "bg-red-400" : "bg-[#034991]"
                                }`}
                              style={{
                                width: `${porcentaje}%`,
                              }}
                            />
                          </div>
                          {lleno && (
                            <p className="text-[11px] text-red-500 mt-1 font-semibold">
                              Cupos agotados
                            </p>
                          )}
                        </div>
                      )}
                      {evento.cupos == null && (
                        <p className="text-xs text-slate-400 mb-3">
                          Cupos no definidos
                        </p>
                      )}
                      {/* FECHA Y UBICACIÓN */}
                      <div className="text-xs text-gray-600 mb-4 space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>
                            {evento.fecha_evento ?? "Fecha por definir"}
                            {evento.hora_evento && ` — ${evento.hora_evento}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {[
                              evento.canton_nombre,
                              evento.provincia_nombre,
                              evento.pais_nombre,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      </div>

                      {/* BOTONES */}
                      <div className="mt-auto flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700"
                          onClick={async () => {
                            try {
                              const res = await axios.get(
                                route(
                                  "eventos.inscripcion.show",
                                  evento.id_evento
                                )
                              );
                              if (res.data.success)
                                setDetalle(res.data.evento);
                            } catch {
                              modal.alerta({
                                titulo: "Error",
                                mensaje:
                                  "No se pudo cargar el detalle del evento",
                              });
                            }
                          }}
                        >
                          Ver
                        </Button>

                        {!yaInscrito && !lleno && (
                          <Button
                            size="sm"
                            className="bg-[#034991] hover:bg-[#023165] text-white"
                            disabled={inscribiendose.has(evento.id_evento)}
                            onClick={() => inscribirse(evento)}
                          >
                            {inscribiendose.has(evento.id_evento)
                              ? "Procesando..."
                              : "Inscribirme"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500 py-10">
                  No se encontraron eventos con los filtros aplicados.
                </div>
              )}
            </div>

            {/* PAGINACIÓN */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-slate-500 text-sm bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                Mostrando {eventosPaginados.length} de{" "}
                {eventosFiltrados.length} eventos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPaginaActual((p) => p - 1)}
                  disabled={paginaActual === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center px-4 font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg h-8 shadow-sm">
                  {paginaActual} / {totalPaginas || 1}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPaginaActual((p) => p + 1)}
                  disabled={
                    paginaActual === totalPaginas || totalPaginas === 0
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </main>
        </div>

        {/* MODAL DETALLE */}
        {detalle && (
          <EventoDetalleModal
            detalle={detalle}
            onClose={() => setDetalle(null)}
          />
        )}
      </div>
    </>
  );
}

EventosInscripcionIndex.layout = (page: any) => {
  return (
    <PpLayout userPermisos={page.props.userPermisos}>{page}</PpLayout>
  );
};