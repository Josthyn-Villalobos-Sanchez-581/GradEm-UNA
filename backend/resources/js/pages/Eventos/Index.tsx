import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import axios from "axios";
import EventoDetalleModal from "@/components/modal/EventoDetalleModal";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import {
  User,
  Calendar,
  MapPin,
  Eye,
  Trash2,
  Play,
  Plus,
  Edit3,
  Search,
  Filter,
  FilterX,
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
   Tipos
======================= */

interface Evento {
  id_evento: number;
  titulo: string;
  descripcion?: string;
  fecha_evento?: string;
  hora_evento?: string;
  estado_id: number;

  usuario_id?: number;
  creador_nombre?: string;

  modalidad_nombre?: string;
  canton_nombre?: string;
  provincia_nombre?: string;
  pais_nombre?: string;

  // NUEVOS
  otras_observaciones?: string;
  carreras?: string[];
  roles?: string[];
}

interface Props {
  eventos: Evento[];
  userPermisos: number[];
}

/* =======================
   Componente
======================= */

export default function EventosIndex(props: Props) {
  const [eventos, setEventos] = useState<Evento[]>(props.eventos);
  const modal = useModal();
  const { auth } = usePage().props as any;

  const puedeGestionar = [1, 2, 3].includes(auth?.user?.id_rol);

  /* =======================
     Filtros
  ======================= */

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroModalidad, setFiltroModalidad] = useState("todas");
  const [filtroCreador, setFiltroCreador] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(true);


  const itemsPorPagina = 8;

  const eventosFiltrados = eventos
    // búsqueda
    .filter((e) =>
      e.titulo.toLowerCase().includes(busqueda.toLowerCase())
    )

    // estado
    .filter((e) => {
      if (filtroEstado === "publicado") return e.estado_id === 1;
      if (filtroEstado === "borrador") return e.estado_id !== 1;
      return true;
    })

    // modalidad
    .filter((e) => {
      if (filtroModalidad === "todas") return true;
      return e.modalidad_nombre === filtroModalidad;
    })

    // creador (tipo búsqueda)
    .filter((e) =>
      e.creador_nombre
        ?.toLowerCase()
        .includes(filtroCreador.toLowerCase())
    );

  /* =======================
     KPIs
  ======================= */

  const totalEventos = eventosFiltrados.length;
  const publicados = eventosFiltrados.filter(e => e.estado_id === 1).length;
  const borradores = eventosFiltrados.filter(e => e.estado_id !== 1).length;

  /* =======================
     Paginación
  ======================= */

  const totalPaginas = Math.ceil(eventosFiltrados.length / itemsPorPagina);

  const eventosPaginados = eventosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  /* =======================
     Acciones
  ======================= */

  const inactivarEvento = async (evento: Evento) => {
    let motivo = "";

    const confirmado = await modal.confirmacion({
      titulo: "Inactivar evento",
      contenido: (
        <div>
          <p>
            ¿Seguro que deseas inactivar <strong>{evento.titulo}</strong>?
          </p>
          <textarea
            className="border p-2 w-full mt-2"
            onChange={(e) => (motivo = e.target.value)}
          />
        </div>
      ),
    });

    if (!confirmado) return;

    if (motivo.length < 10) {
      modal.alerta({
        titulo: "Motivo inválido",
        mensaje: "Debe tener mínimo 10 caracteres",
      });
      return;
    }

    try {
      await axios.put(
        route("eventos.estado", evento.id_evento),
        { motivo }
      );

      // eliminar del frontend
      setEventos((prev) =>
        prev.filter((e) => e.id_evento !== evento.id_evento)
      );

      modal.alerta({
        titulo: "Evento inactivado",
        mensaje: "Correctamente",
      });
    } catch (error: any) {
      console.log("ERROR COMPLETO:", error);
      console.log("RESPONSE:", error.response);
      console.log("DATA:", error.response?.data);

      modal.alerta({
        titulo: "Error",
        mensaje:
          error.response?.data?.message ??
          error.message ??
          "Error desconocido",
      });
    }
  };

  const publicarEvento = async (evento: Evento) => {
    try {
      await axios.put(route("eventos.publicar", { idEvento: evento.id_evento }));

      setEventos((prev) =>
        prev.map((e) =>
          e.id_evento === evento.id_evento
            ? { ...e, estado_id: 1 }
            : e
        )
      );

      modal.alerta({
        titulo: "Publicado",
        mensaje: "Evento publicado correctamente",
      });
    } catch (error: any) {
      modal.alerta({
        titulo: "Error",
        mensaje: error.response?.data?.message ?? "No se pudo publicar",
      });
    }
  };

  const [detalle, setDetalle] = useState<Evento | null>(null);

  const modalidadesUnicas = Array.from(
    new Set(eventos.map(e => e.modalidad_nombre).filter(Boolean))
  );
  /* =======================
     Render
  ======================= */

  return (
    <>
      <Head title="Gestión de Eventos" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">

        {/* HEADER ESTILO CURSOS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">

          {/* IZQUIERDA */}
          <div>
            <h1 className="text-2xl font-bold text-[#034991]">
              Gestión de Eventos
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Administra los eventos, publica, edita y gestiona la logística.
            </p>
          </div>

          {/* DERECHA */}
          <div className="flex items-center gap-3 flex-wrap">

            <Button
              variant="outline"
              className="h-10 rounded-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB]"
              onClick={() => window.location.href = route("dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>

            <Button
              variant="outline"
              className="h-10 rounded-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB]"
              onClick={() => setMostrarFiltros(prev => !prev)}
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

            {puedeGestionar && (
              <Button className="h-10 rounded-full bg-[#034991] hover:bg-[#023165]">
                <Plus className="w-4 h-4 mr-2" />
                Agregar evento
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* SIDEBAR SOLO SI mostrarFiltros */}
          {mostrarFiltros && (
            <aside className="lg:col-span-3 transition-all duration-300">
              <div className="sticky top-6">
                <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">

                  <h2 className="text-lg font-semibold text-[#034991] border-b pb-2 flex items-center gap-2">

                    <Filter className="w-4 h-4" /> Filtros de eventos

                  </h2>

                  <div className="space-y-4 text-sm">

                    <div className="flex flex-col">
                      <label className="font-semibold mb-1 text-slate-700">Buscar</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input placeholder="Título del evento..."
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
                      <label className="font-semibold mb-1 text-slate-700">Estado</label>
                      <select value={filtroEstado}
                        onChange={(e) => {
                          setFiltroEstado(e.target.value);
                          setPaginaActual(1);
                        }}
                        className="bg-white text-black border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none" >
                        <option value="todos">Todos los estados</option>
                        <option value="publicado">Publicado</option>
                        <option value="borrador">Borrador</option>
                      </select>
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
                        <option value="todas">Todas</option>
                        {modalidadesUnicas.map((m, index) => (
                          <option key={index} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="font-semibold mb-1 text-slate-700">Creador</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          placeholder="Nombre del creador..."
                          value={filtroCreador}
                          onChange={(e) => {
                            setFiltroCreador(e.target.value);
                            setPaginaActual(1);
                          }}
                          className="w-full pl-9 bg-white text-black border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      title="Quitar filtros"
                      className="w-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB] rounded-full"
                      onClick={() => {
                        setBusqueda("");
                        setFiltroEstado("todos");
                        setFiltroModalidad("todas");
                        setFiltroCreador("");
                      }}
                    >
                      Limpiar filtros

                    </Button>

                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* MAIN DINÁMICO */}
          <main className={`${mostrarFiltros ? "lg:col-span-9" : "lg:col-span-12"} space-y-4 transition-all duration-300`}>


            {/* KPIs ESTILO CURSOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Total Eventos</p>
                  <p className="text-2xl font-bold text-slate-900">{totalEventos}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Publicados</p>
                  <p className="text-2xl font-bold text-slate-900">{publicados}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                <div className="rounded-xl bg-amber-100 p-2 text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Borradores</p>
                  <p className="text-2xl font-bold text-slate-900">{borradores}</p>
                </div>
              </div>
            </div>

            {/* LISTA DE EVENTOS (CARD REFORZADA) */}
            <div
              className={`grid grid-cols-1 ${mostrarFiltros
                ? "md:grid-cols-2"
                : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
                } gap-3`}
            >
              {eventosPaginados.length > 0 ? (
                eventosPaginados.map((evento) => (
                  <div key={evento.id_evento} className="bg-white border border-slate-200 hover:border-blue-300 transition-colors p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="font-bold text-lg text-slate-800 line-clamp-1">{evento.titulo}</h2>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${evento.estado_id === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {evento.estado_id === 1 ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {evento.descripcion ?? "Sin descripción disponible para este evento."}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          {evento.fecha_evento || 'Por definir'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          <span className="truncate">{evento.canton_nombre}, {evento.provincia_nombre}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t flex gap-2 flex-wrap">
                      {evento.estado_id === 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-[#034991] hover:bg-blue-50"
                          onClick={() => router.visit(route("eventos.inscritos", { idEvento: evento.id_evento }))}
                        >
                          <User className="w-3 h-3 mr-1" /> Inscritos
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="secondary"
                        title="Ver evento"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700"
                        onClick={async () => {
                          try {
                            const res = await axios.get(route("eventos.show", evento.id_evento));

                            if (res.data.success) {
                              setDetalle(res.data.evento);
                            }
                          } catch (error) {
                            modal.alerta({
                              titulo: "Error",
                              mensaje: "No se pudo cargar el detalle del evento",
                            });
                          }
                        }}
                      >
                        <Eye className="w-3.5 mr-1" /> Ver
                      </Button>

                      {puedeGestionar && (
                        <>
                          {evento.estado_id !== 1 && (
                            <Button size="sm" title="Publicar evento" onClick={() => publicarEvento(evento)}>
                              <Play className="w-3 mr-1" /> Publicar
                            </Button>
                          )}
                          <Button size="sm" variant="outline" title="Editar evento" className="border-slate-300">
                            <Edit3 className="w-3.5 mr-1" /> Editar
                          </Button>
                          <Button size="sm" variant="destructive" title="Inactivar evento" onClick={() => inactivarEvento(evento)}>
                            <Trash2 className="w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed">
                  <p className="text-slate-400">No se encontraron eventos con los filtros aplicados.</p>
                </div>
              )}
            </div>

            {/* PAGINACIÓN ESTILO  */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-slate-500 text-sm bg-slate-50 p-3 rounded-xl border border-slate-200">

              {/* IZQUIERDA */}
              <div>
                Mostrando {eventosPaginados.length} de {eventosFiltrados.length} eventos
              </div>

              {/* DERECHA */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPaginaActual(paginaActual - 1)}
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
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas || totalPaginas === 0}
                >
                  Siguiente
                </Button>
              </div>

            </div>
          </main>
        </div >
      </div >

      {/* MODAL DETALLE (OVERLAY ESTILO CURSOS) */}
      {
        <EventoDetalleModal
          detalle={detalle}
          onClose={() => setDetalle(null)}
        />
      }
    </>
  );
}

EventosIndex.layout = (page: any) => (
  <PpLayout userPermisos={page.props.userPermisos}>
    {page}
  </PpLayout>
);