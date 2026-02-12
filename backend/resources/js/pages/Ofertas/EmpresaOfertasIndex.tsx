import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import { Briefcase, Pencil, Trash2, Eye, Search } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import ModalDetalleOferta from "@/components/modal/ModalDetalleOferta";
import { Filter, Users, Building2, ChevronLeft, ChevronRight, Plus } from "lucide-react";

/* =========================
   TIPOS
========================= */

interface Modalidad {
  id: number;
  nombre: string;
}

interface Empresa {
  nombre: string;
}

interface Oferta {
  id_oferta: number;
  titulo: string;
  fecha_publicacion: string;
  fecha_limite: string;
  estado_id: number;
  tipo_oferta: string;
  empresa: Empresa;
  modalidad?: Modalidad;

  postulaciones_count?: number;
}

interface Props {
  ofertas: {
    data: Oferta[];
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
  };
  modalidades: Modalidad[];
  filtros?: {
    buscar?: string;
    id_modalidad?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  };
  userPermisos: number[];
}


/* =========================
   TOGGLE ESTADO
========================= */

const ToggleEstado = ({
  activo,
  onChange,
}: {
  activo: boolean;
  onChange: () => void;
}) => (
  <button
    onClick={onChange}
    className={`w-12 h-6 flex items-center rounded-full p-1 transition ${activo ? "bg-green-500" : "bg-gray-400"
      }`}
    title={activo ? "Publicada" : "Borrador"}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow transition ${activo ? "translate-x-6" : ""
        }`}
    />
  </button>
);

const BadgeEstado = ({ estadoId }: { estadoId: number }) => {
  if (estadoId === 1) {
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
        Publicada
      </span>
    );
  }

  if (estadoId === 2) {
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
        Borrador
      </span>
    );
  }

  return null;
};

/* =========================
   COMPONENTE
========================= */

export default function EmpresaOfertasIndex({
  ofertas,
  modalidades,
  filtros,
}: Props) {
  const modal = useModal();

  /* =========================
     ESTADOS FILTROS (sin romper UI)
  ========================= */
  const [search, setSearch] = useState(filtros?.buscar ?? "");
  const [modalidadId, setModalidadId] = useState<string>(
    filtros?.id_modalidad
      ? String(filtros.id_modalidad)
      : ""
  );
  const [fechaInicio, setFechaInicio] = useState(
    filtros?.fecha_inicio ?? ""
  );
  const [fechaFin, setFechaFin] = useState(
    filtros?.fecha_fin ?? ""
  );
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  const [ofertaSeleccionada, setOfertaSeleccionada] =
    useState<Oferta | null>(null);

  /* =========================
     APLICAR FILTROS (BACKEND)
  ========================= */
  const aplicarFiltros = () => {
    router.get(
      route("empresa.ofertas.index"),
      {
        buscar: search || undefined,
        id_modalidad: modalidadId !== "" ? Number(modalidadId) : undefined,
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
        per_page: perPage,
      },
      {
        preserveScroll: true,
        preserveState: true,
        replace: true,
      }
    );
  };

  const [perPage, setPerPage] = useState(
    (filtros as any)?.per_page ?? 10
  );

  /* =========================
     ACCIONES
  ========================= */
  const eliminarOferta = async (id: number) => {
    const ok = await modal.confirmacion({
      titulo: "Desactivar oferta",
      mensaje: "¿Desea desactivar esta oferta?",
    });

    if (!ok) return;

    router.delete(route("empresa.ofertas.eliminar", id), {
      preserveScroll: true,
    });
  };

  const cambiarEstado = (oferta: Oferta) => {
    router.put(
      route("empresa.ofertas.cambiarEstado", oferta.id_oferta),
      {
        estado_id: oferta.estado_id === 1 ? 2 : 1,
      },
      {
        preserveScroll: true,
      }
    );
  };

  /* =========================
      RENDER
  ========================= */
  return (
    <>
      <Head title="Mis ofertas laborales" />

      <div className="max-full w-full mx-auto px-6 py-6 text-[#000000]">

        {/* HEADER PRINCIPAL */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#034991] tracking-tight flex items-center gap-3">
                Ofertas laborales y prácticas
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Gestiona tus publicaciones y revisa el estado de los aplicantes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-full border-[#034991] text-[#034991] hover:bg-blue-50 px-6 font-bold text-xs"
                onClick={() => setMostrarFiltros((v) => !v)}
              >
                {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
              </Button>

              <Button
                className="rounded-full bg-[#034991] hover:bg-[#023870] text-white px-6 font-bold text-xs shadow-md transition-all"
                onClick={() => router.visit(route("empresa.ofertas.crear"))}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear oferta
              </Button>
            </div>
          </header>

          <div className="flex flex-col lg:flex-row gap-8">

            {/* SIDEBAR DE FILTROS (Estilo igual a tu imagen) */}
            {mostrarFiltros && (
              <aside className="w-full lg:w-80">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6">
                  <h2 className="font-bold text-[#034991] text-lg mb-6 flex items-center gap-2">
                    Filtros de búsqueda
                  </h2>

                  <div className="space-y-5">
                    {/* BUSCADOR */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Buscar</label>
                      <input
                        className="w-full bg-[#f8fafc] border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#034991]/20 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Título, descripción..."
                      />
                    </div>

                    {/* MODALIDAD (SELECT ESTILO IMAGEN) */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Modalidad</label>
                      <select
                        className="w-full bg-[#f8fafc] border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#034991]/20 outline-none appearance-none"
                        value={modalidadId}
                        onChange={(e) => setModalidadId(e.target.value)}
                      >
                        <option value="">Todas</option>
                        {modalidades.map((m) => (
                          <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                      </select>
                    </div>

                    {/* FECHAS */}
                    <div className="grid grid-cols-1 gap-4 pt-2">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 italic">Fecha Inicio</label>
                        <input
                          type="date"
                          className="w-full bg-[#f8fafc] border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600"
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 italic">Fecha Fin</label>
                        <input
                          type="date"
                          className="w-full bg-[#f8fafc] border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600"
                          value={fechaFin}
                          onChange={(e) => setFechaFin(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 space-y-3">
                    <Button
                      className="w-full bg-[#034991] hover:bg-[#023870] text-white rounded-full py-6 font-bold shadow-lg"
                      onClick={aplicarFiltros}
                    >
                      Aplicar filtros
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-[#034991] hover:bg-blue-50 rounded-full font-bold underline"
                      onClick={() => router.get(route("empresa.ofertas.index"))}
                    >
                      Limpiar
                    </Button>
                  </div>
                </div>
              </aside>
            )}

            {/* LISTADO TIPO TABLA PERO CON ESTILO DE TARJETAS */}
            {/* LISTADO TIPO TABLA COMPACTO */}
            <section className="flex-1 min-w-0">
              <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-50 bg-slate-50/30">
                        {/* Reducimos el padding de p-8 a p-5 */}
                        <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Puesto de Trabajo</th>
                        <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] text-center">Postulantes</th>
                        <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] text-center">Estado</th>
                        <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] text-right">Gestión</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                      {ofertas.data.map((oferta) => (
                        <tr
                          key={oferta.id_oferta}
                          onClick={() => router.visit(route("empresa.ofertas.gestion", oferta.id_oferta))}
                          className="group hover:bg-[#F4F7FA]/50 transition-all cursor-pointer"
                        >
                          {/* Celda principal: Reducida de p-8 a py-3 px-5 */}
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-4">
                              {/* Icono de edificio más pequeño: de w-16 a w-12 */}
                              <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                                <Building2 className="w-6 h-6 text-slate-300" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-extrabold text-[#034991] text-base uppercase leading-tight group-hover:underline decoration-2 underline-offset-2">
                                  {oferta.titulo}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">
                                  — {oferta.empresa?.nombre}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-5 text-center">
                            <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-[#034991] rounded-lg font-black text-[10px] border border-blue-100">
                              <Users className="w-3.5 h-3.5 mr-1.5" />
                              {oferta.postulaciones_count ?? 0}
                            </div>
                          </td>

                          <td className="py-3 px-5 text-center">
                            <div className="flex flex-col items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <BadgeEstado estadoId={oferta.estado_id} />
                              <ToggleEstado
                                activo={oferta.estado_id === 1}
                                onChange={() => cambiarEstado(oferta)}
                              />
                            </div>
                          </td>

                          <td className="py-3 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              {/* Botones de acción más compactos: de h-11 a h-9 */}
                              <Button
                                size="icon"
                                className="h-9 w-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#034991] hover:text-white transition-all shadow-none"
                                onClick={() => router.visit(route("empresa.ofertas.editar", oferta.id_oferta))}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                size="icon"
                                className="h-9 w-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white transition-all shadow-none"
                                onClick={() => eliminarOferta(oferta.id_oferta)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                size="icon"
                                className="h-9 w-9 rounded-xl bg-[#034991] text-white hover:bg-[#023870] shadow-sm transition-all"
                                onClick={() => setOfertaSeleccionada(oferta)}
                              >
                                <ChevronRight className="w-5 h-5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación más delgada: p-10 a p-6 */}
                {ofertas.links.length > 3 && (
                  <div className="p-6 bg-white border-t border-slate-50 flex justify-center items-center gap-2">
                    {ofertas.links.map((link, index) => (
                      <Button
                        key={index}
                        variant={link.active ? "default" : "ghost"}
                        className={`h-8 min-w-[32px] rounded-lg font-bold text-xs ${link.active ? "bg-[#034991] text-white" : "text-slate-400"
                          }`}
                        disabled={!link.url}
                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true, preserveState: true })}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

      {ofertaSeleccionada && (
        <ModalDetalleOferta
          oferta={ofertaSeleccionada}
          onClose={() => setOfertaSeleccionada(null)}
        />
      )}
    </>
  );
}

/* =========================
   LAYOUT
========================= */
(EmpresaOfertasIndex as any).layout = (page: any) => (
  <PpLayout userPermisos={page.props.userPermisos}>
    {page}
  </PpLayout>
);
