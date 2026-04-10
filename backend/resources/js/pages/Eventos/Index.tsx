import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import axios from "axios";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Eye,
  Trash2,
  Play,
  Plus,
  Edit3,
  Search,
  Filter,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ArrowLeft,
} from "lucide-react";

/* =======================
   Tipos
======================= */

interface Evento {
  id_evento: number;
  titulo: string;
  descripcion?: string;
  fecha_evento?: string;
  estado_id: number;

  modalidad_nombre?: string;
  canton_nombre?: string;
  provincia_nombre?: string;
  pais_nombre?: string;
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

  const itemsPorPagina = 8;

  const eventosFiltrados = eventos
    // 🔍 búsqueda
    .filter((e) =>
      e.titulo.toLowerCase().includes(busqueda.toLowerCase())
    )
    // 📌 estado
    .filter((e) => {
      if (filtroEstado === "publicado") return e.estado_id === 1;
      if (filtroEstado === "borrador") return e.estado_id !== 1;
      return true;
    });

  /* =======================
     KPIs
  ======================= */

  const totalEventos = eventosFiltrados.length;
  const publicados = eventosFiltrados.filter(e => e.estado_id === 1).length;
  const borradores = eventosFiltrados.filter(e => e.estado_id !== 1).length;

  /* =======================
     Paginación
  ======================= */

  const totalPaginas = Math.ceil(totalEventos / itemsPorPagina);

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
      await axios.delete(route("eventos.destroy", { idEvento: evento.id_evento }), {
        data: { motivo },
      });

      // 🔥 eliminar del frontend
      setEventos((prev) =>
        prev.filter((e) => e.id_evento !== evento.id_evento)
      );

      modal.alerta({
        titulo: "Evento inactivado",
        mensaje: "Correctamente",
      });
    } catch {
      modal.alerta({
        titulo: "Error",
        mensaje: "No se pudo inactivar",
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

  /* =======================
     Render
  ======================= */

  return (
    <>
      <Head title="Gestión de Eventos" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">

        {/* HEADER ESTILO CURSOS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#034991]">Gestión de Eventos</h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
              Administra los eventos, publica, edita y gestiona la logística desde un solo lugar.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">

            {/* 🔙 Volver al dashboard */}
            <Button
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
              onClick={() => {
                // 🔥 aquí va la navegación real
                // ejemplo con inertia:
                window.location.href = route("dashboard");
                // o router.visit(route("dashboard"));
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>

            {/* ➕ Agregar evento */}
            {puedeGestionar && (
              <Button className="bg-[#034991] hover:bg-[#023165]">
                <Plus className="w-4 h-4 mr-2" />
                Agregar evento
              </Button>
            )}

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* SIDEBAR FILTROS (STICKY Y ELEGANTE) */}
          <aside className="lg:col-span-3">
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
                    <label className="font-semibold mb-1 text-slate-700">Estado</label>
                    <select
                      value={filtroEstado}
                      onChange={(e) => {
                        setFiltroEstado(e.target.value);
                        setPaginaActual(1);
                      }}
                      className="bg-white text-black border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="publicado">Publicado</option>
                      <option value="borrador">Borrador</option>
                    </select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB] rounded-full"
                    onClick={() => {
                      setBusqueda("");
                      setFiltroEstado("todos");
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="lg:col-span-9 space-y-6">

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
            <div className="grid md:grid-cols-2 gap-4">
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
                      <Button size="sm" variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700" onClick={() => setDetalle(evento)}>
                        <Eye className="w-3.5 mr-1" /> Ver
                      </Button>

                      {puedeGestionar && (
                        <>
                          {evento.estado_id !== 1 && (
                            <Button size="sm" onClick={() => publicarEvento(evento)}>
                              <Play className="w-3 mr-1" /> Publicar
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="border-slate-300">
                            <Edit3 className="w-3.5 mr-1" /> Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => inactivarEvento(evento)}>
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

            {/* PAGINACIÓN ESTILO CURSOS */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
              <Button
                variant="ghost"
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="hover:bg-slate-100"
              >
                Anterior
              </Button>

              <span className="text-sm font-medium text-slate-600">
                Página <span className="text-[#034991]">{paginaActual}</span> de {totalPaginas || 1}
              </span>

              <Button
                variant="ghost"
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPaginas || totalPaginas === 0}
                className="hover:bg-slate-100"
              >
                Siguiente
              </Button>
            </div>
          </main>
        </div>
      </div>

      {/* MODAL DETALLE (OVERLAY ESTILO CURSOS) */}
      {detalle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#034991] p-4 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">Detalles del Evento</h2>
              <button onClick={() => setDetalle(null)} className="hover:bg-white/20 rounded-full p-1">
                <ArrowLeft className="w-5 h-5 rotate-90" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{detalle.titulo}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{detalle.descripcion || 'Sin descripción detallada.'}</p>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-[#034991]" />
                  <span><strong>Fecha:</strong> {detalle.fecha_evento}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span><strong>Ubicación:</strong> {detalle.canton_nombre}, {detalle.provincia_nombre}, {detalle.pais_nombre}</span>
                </div>
              </div>

              <Button className="mt-8 w-full bg-[#034991]" onClick={() => setDetalle(null)}>
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

EventosIndex.layout = (page: any) => (
  <PpLayout userPermisos={page.props.userPermisos}>
    {page}
  </PpLayout>
);