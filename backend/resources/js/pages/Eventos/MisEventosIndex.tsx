import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import axios from "axios";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  Filter,
  FilterX,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  LayoutDashboard,
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
  cupos?: number;
  modalidad_nombre?: string;
  canton_nombre?: string;
  provincia_nombre?: string;
  pais_nombre?: string;
  fecha_inscripcion?: string;
  inscritos_count?: number;
}

interface Props {
  eventos: Evento[];
  modalidades: { id_modalidad: number; nombre: string }[];
  userPermisos: number[];
}

// =======================
// COMPONENTE
// =======================

export default function MisEventosIndex(props: Props) {
  const modal = useModal();

  const [eventos, setEventos] = useState<Evento[]>(props.eventos);
  const [cancelando, setCancelando] = useState<Set<number>>(new Set());
  const [ocultosManual, setOcultosManual] = useState<Set<number>>(new Set());
  const [detalle, setDetalle] = useState<Evento | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("todos");
  const [ocultarFinalizados, setOcultarFinalizados] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);

  const itemsPorPagina = 9;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const eventoPasado = (fecha?: string) => {
    if (!fecha) return false;
    return new Date(fecha) < hoy;
  };

  // =======================
  // FILTROS
  // =======================

  const eventosFiltrados = eventos
   .filter((e) => !ocultosManual.has(e.id_evento))
    .filter((e) =>
      e.titulo.toLowerCase().includes(busqueda.toLowerCase())
    )
    .filter((e) => {
      if (filtroModalidad === "todos") return true;
      return e.modalidad_nombre === filtroModalidad;
    })
    .filter((e) => {
      if (!ocultarFinalizados) return true;
      return !eventoPasado(e.fecha_evento);
    });

  const totalPaginas = Math.ceil(eventosFiltrados.length / itemsPorPagina);

  const eventosPaginados = eventosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  // =======================
  // KPIs
  // =======================

  const totalInscritos = eventos.filter((e) => !ocultosManual.has(e.id_evento)).length;
  const proximos = eventos.filter((e) => !ocultosManual.has(e.id_evento) && !eventoPasado(e.fecha_evento)).length;
  const pasados = eventos.filter((e) => !ocultosManual.has(e.id_evento) && eventoPasado(e.fecha_evento)).length;

  // =======================
  // VER DETALLE
  // =======================

  const verDetalle = async (evento: Evento) => {
    try {
      const res = await axios.get(
        route("eventos.inscripcion.show", evento.id_evento)
      );
      if (res.data.success) {
        setDetalle(res.data.evento);
      }
    } catch {
      modal.alerta({
        titulo: "Error",
        mensaje: "No se pudo cargar el detalle del evento.",
      });
    }
  };

  // =======================
  // CANCELAR
  // =======================

  const cancelarInscripcion = async (evento: Evento) => {
    if (eventoPasado(evento.fecha_evento)) {
      modal.alerta({
        titulo: "No permitido",
        mensaje: "No podés cancelar la inscripción a un evento que ya pasó.",
      });
      return;
    }

    const confirmado = await modal.confirmacion({
      titulo: "Cancelar inscripción",
      contenido: (
        <p>
          ¿Deseas cancelar tu inscripción a{" "}
          <strong>{evento.titulo}</strong>?
        </p>
      ),
      textoAceptar: "Sí, cancelar",
      textoCancelar: "No",
    });

    if (!confirmado) return;

    setCancelando((prev) => new Set(prev).add(evento.id_evento));

    try {
      await axios.post(
        route("eventos.cancelar", { idEvento: evento.id_evento })
      );

      setEventos((prev) =>
        prev.filter((e) => e.id_evento !== evento.id_evento)
      );

      modal.alerta({
        titulo: "Inscripción cancelada",
        mensaje: "Tu inscripción fue cancelada correctamente.",
      });
    } catch (error: any) {
      modal.alerta({
        titulo: "Error",
        mensaje:
          error.response?.data?.message ??
          "No se pudo cancelar la inscripción.",
      });
    } finally {
      setCancelando((prev) => {
        const next = new Set(prev);
        next.delete(evento.id_evento);
        return next;
      });
    }
  };

  // =======================
  // OCULTAR MANUAL
  // =======================

  const ocultarEvento = (idEvento: number) => {
    setOcultosManual((prev) => new Set(prev).add(idEvento));
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroModalidad("todos");
    setOcultarFinalizados(false);
    setOcultosManual(new Set());
    setPaginaActual(1);
  
  };

  // =======================
  // RENDER
  // =======================

  return (
    <>
      <Head title="Mis Eventos" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#034991]">Mis Eventos</h1>
            <p className="text-sm text-slate-500 font-medium">
              Eventos en los que estás inscrito.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              className="h-10 rounded-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB]"
              onClick={() => router.visit(route("eventos.inscripcion.index"))}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Inscribirse a Eventos
            </Button>

            <Button
              variant="outline"
              className="h-10 rounded-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB]"
              onClick={() => setMostrarFiltros((prev) => !prev)}
            >
              {mostrarFiltros ? (
                <><FilterX className="w-4 h-4 mr-2" />Ocultar filtros</>
              ) : (
                <><Filter className="w-4 h-4 mr-2" />Mostrar filtros</>
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

                    <div className="flex flex-col">
                      <label className="font-semibold mb-1 text-slate-700">Buscar</label>
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

                    <div className="flex flex-col">
                      <label className="font-semibold mb-1 text-slate-700">Modalidad</label>
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

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="ocultarFinalizados"
                        checked={ocultarFinalizados}
                        onChange={(e) => {
                          setOcultarFinalizados(e.target.checked);
                          setPaginaActual(1);
                        }}
                        className="w-4 h-4 accent-[#034991] cursor-pointer"
                      />
                      <label
                        htmlFor="ocultarFinalizados"
                        className="font-semibold text-slate-700 cursor-pointer select-none"
                      >
                        Ocultar eventos finalizados
                      </label>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB] rounded-full"
                      onClick={limpiarFiltros}
                    >
                      Limpiar filtros
                    </Button>
                    {ocultosManual.size > 0 && (
  <Button
    className="w-full bg-[#034991] hover:bg-[#023165] text-white rounded-full"
    onClick={() => {
      setOcultosManual(new Set());
      setPaginaActual(1);
    }}
  >
    Mostrar eventos ocultos
  </Button>
)}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* MAIN */}
          <main className={`${mostrarFiltros ? "lg:col-span-9" : "lg:col-span-12"} space-y-4`}>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Total inscripciones</p>
                  <p className="text-2xl font-bold text-slate-900">{totalInscritos}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Próximos</p>
                  <p className="text-2xl font-bold text-slate-900">{proximos}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                <div className="rounded-xl bg-slate-100 p-2 text-slate-500">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Ya realizados</p>
                  <p className="text-2xl font-bold text-slate-900">{pasados}</p>
                </div>
              </div>
            </div>

            {/* GRID DE EVENTOS */}
            <div className={`grid grid-cols-1 ${mostrarFiltros ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"} gap-3`}>
              {eventosPaginados.length > 0 ? (
                eventosPaginados.map((evento) => {
                  const pasado = eventoPasado(evento.fecha_evento);

                  return (
                    <div
                      key={evento.id_evento}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                    >
                      <div>
                        {/* Título y badge */}
                        <div className="flex justify-between items-start mb-2">
                          <h2 className="font-bold text-lg text-slate-800 line-clamp-1">
                            {evento.titulo}
                          </h2>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0 ml-2 ${
                            pasado
                              ? "bg-slate-100 text-slate-500"
                              : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {pasado ? "Realizado" : "Próximo"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                          {evento.descripcion ?? "Sin descripción disponible."}
                        </p>

                        {evento.modalidad_nombre && (
                          <span className="inline-block mb-3 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold w-fit">
                            {evento.modalidad_nombre}
                          </span>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            {evento.fecha_evento ?? "Por definir"}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            <span className="truncate">
                              {[evento.canton_nombre, evento.provincia_nombre]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                          {evento.hora_evento && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              {evento.hora_evento}
                            </div>
                          )}
                          {evento.fecha_inscripcion && (
                            <div className="flex items-center gap-1 text-slate-400 col-span-2">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>
                                Inscrito el{" "}
                                {new Date(evento.fecha_inscripcion).toLocaleDateString("es-CR")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* BOTONES — misma estructura que gestión */}
                     <div className="mt-auto pt-4 border-t flex gap-2 flex-wrap">

  {/* Botón Ver */}
  <button
    title="Ver detalle del evento"
    onClick={() => verDetalle(evento)}
    className="flex-1 flex items-center justify-center gap-1.5 rounded-full border-2 border-[#034991] text-[#034991] hover:bg-[#034991] hover:text-white transition-all py-2 text-sm font-semibold"
  >
    <Eye className="w-4 h-4" />
    <span>Ver</span>
  </button>

  {/* Botón Cancelar */}
  {!pasado ? (
    <button
      title="Cancelar tu inscripción a este evento"
      disabled={cancelando.has(evento.id_evento)}
      onClick={() => cancelarInscripcion(evento)}
      className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white transition-all py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {cancelando.has(evento.id_evento) ? (
        <span>Procesando...</span>
      ) : (
        <>
          <XCircle className="w-4 h-4" />
          <span>Cancelar</span>
        </>
      )}
    </button>
  ) : (
    <button
      title="No mostrar más este evento en la lista"
      onClick={() => ocultarEvento(evento.id_evento)}
      className="flex-1 flex items-center justify-center gap-1.5 rounded-full border-2 border-[#034991] text-[#034991] hover:bg-[#034991] hover:text-white transition-all duration-200 py-2 text-sm font-semibold"
    >
      <EyeOff className="w-4 h-4" />
      <span>No mostrar</span>
    </button>
  )}
</div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500 py-10">
                  {eventos.length === 0
                    ? "Aún no estás inscrito en ningún evento."
                    : "No se encontraron eventos con los filtros aplicados."}
                </div>
              )}
            </div>

            {/* PAGINACIÓN */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-slate-500 text-sm bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                Mostrando {eventosPaginados.length} de {eventosFiltrados.length} eventos
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
                  disabled={paginaActual === totalPaginas || totalPaginas === 0}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* MODAL DETALLE — mismo estilo que gestión de eventos */}
      {detalle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 text-black">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

            <div className="bg-[#034991] p-4 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">Detalles del Evento</h2>
              <button
                onClick={() => setDetalle(null)}
                className="hover:bg-white/20 rounded-full p-1"
              >
                <ArrowLeft className="w-5 h-5 rotate-90" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <h3 className="text-2xl font-bold text-slate-800">
                {detalle.titulo}
              </h3>

              <p className="text-slate-600 leading-relaxed">
                {detalle.descripcion || "Sin descripción detallada."}
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#034991]" />
                  <span>
                    <strong>Fecha:</strong> {detalle.fecha_evento || "No definida"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>
                    <strong>Hora:</strong> {detalle.hora_evento || "No definida"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span>
                    <strong>Ubicación:</strong>{" "}
                    {[detalle.canton_nombre, detalle.provincia_nombre, detalle.pais_nombre]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>

                {detalle.modalidad_nombre && (
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-5 h-5 text-blue-500" />
                    <span>
                      <strong>Modalidad:</strong> {detalle.modalidad_nombre}
                    </span>
                  </div>
                )}

                {detalle.cupos != null && (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>
                      <strong>Cupos:</strong> {detalle.inscritos_count ?? 0} / {detalle.cupos}
                    </span>
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-[#034991] hover:bg-[#023165]"
                onClick={() => setDetalle(null)}
              >
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

MisEventosIndex.layout = (page: any) => {
  return (
    <PpLayout userPermisos={page.props.userPermisos}>{page}</PpLayout>
  );
};