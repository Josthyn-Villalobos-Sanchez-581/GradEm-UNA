import React, { useState } from "react";
import { Head, router, Link } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import { useModal } from "@/hooks/useModal";
import ModalOferta from "@/components/modal/ModalOferta";
import { Filter, Users, Building2, ChevronLeft, ChevronRight, Plus, Briefcase, Pencil, Trash2, Eye, Search } from "lucide-react";
import { useEffect } from "react";
import fotoXDefecto from "@/assets/FotoXDefecto.png";


/* =========================
   TIPOS
========================= */

interface FotoPerfil {
  url: string | null;
}

interface Usuario {
  foto_perfil?: FotoPerfil | null;
}

interface Empresa {
  nombre: string;
  usuario?: Usuario | null;
}

interface Oferta {
  id_oferta: number;
  titulo: string;
  fecha_publicacion: string;
  fecha_limite: string;
  estado_id: number;
  tipo_oferta: string;
  empresa: Empresa;

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
  filtros?: {
    buscar?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: number | string;
    per_page?: number;
  };
  userPermisos: number[];
}


/* =========================
   TOGGLE ESTADO
========================= */

const tieneInscritos = (oferta: Oferta) => {
  return (oferta.postulaciones_count ?? 0) > 0;
};

const ToggleEstado = ({
  activo,
  onChange,
  disabled = false,
  tooltip,
}: {
  activo: boolean;
  onChange: () => void;
  disabled?: boolean;
  tooltip: string;
}) => (
  <button
    onClick={!disabled ? onChange : undefined}
    disabled={disabled}
    className={`w-12 h-6 flex items-center rounded-full p-1 transition 
      ${activo ? "bg-green-500" : "bg-gray-400"} 
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    `}
    title={tooltip}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow transition ${activo ? "translate-x-6" : ""
        }`}
    />
  </button>
);

const obtenerTooltipEstado = (oferta: Oferta): string => {
  if (oferta.estado_id === 4) {
    return "Oferta vencida";
  }

  if (tieneInscritos(oferta)) {
    return "No se puede cambiar el estado porque tiene postulantes";
  }

  return oferta.estado_id === 1
    ? "Publicada"
    : "Borrador";
};

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

  if (estadoId === 4) {
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-300 text-gray-700">
        Vencida
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
  filtros,
}: Props) {
  const modal = useModal();

  /* =========================
     ESTADOS FILTROS (sin romper UI)
  ========================= */
  const [search, setSearch] = useState(filtros?.buscar ?? "");
  const [fechaInicio, setFechaInicio] = useState(
    filtros?.fecha_inicio ?? ""
  );
  const [fechaFin, setFechaFin] = useState(
    filtros?.fecha_fin ?? ""
  );
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  const [ofertaSeleccionada, setOfertaSeleccionada] =
    useState<Oferta | null>(null);

  const [perPage, setPerPage] = useState(
    (filtros as any)?.per_page ?? 10
  );

  /* =========================
     APLICAR FILTROS (BACKEND)
  ========================= */
  const aplicarFiltros = () => {
    router.get(
      route("empresa.ofertas.index"),
      {
        buscar: search || undefined,
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
        estado: estado !== "" ? Number(estado) : undefined,
        per_page: perPage,
      },
      {
        preserveScroll: true,
        preserveState: true,
        replace: true,
      }
    );
  };

  const [estado, setEstado] = useState(
    (filtros as any)?.estado
      ? String((filtros as any).estado)
      : ""
  );

  const limpiarFiltros = () => {
    setSearch("");
    setFechaInicio("");
    setFechaFin("");
    setEstado("");

    router.get(route("empresa.ofertas.index"));
  };


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
    const nuevoEstado = oferta.estado_id === 1 ? 2 : 1;

    // 1️⃣ Actualización visual inmediata
    setOfertasLocal((prev) =>
      prev.map((o) =>
        o.id_oferta === oferta.id_oferta
          ? { ...o, estado_id: nuevoEstado }
          : o
      )
    );

    // 2️⃣ Petición al backend
    router.put(
      route("empresa.ofertas.cambiarEstado", oferta.id_oferta),
      { estado_id: nuevoEstado },
      {
        preserveScroll: true,
        onError: () => {
          // 3️⃣ Si falla, revertimos
          setOfertasLocal((prev) =>
            prev.map((o) =>
              o.id_oferta === oferta.id_oferta
                ? { ...o, estado_id: oferta.estado_id }
                : o
            )
          );
        },
      }
    );
  };

  const [ofertasLocal, setOfertasLocal] = useState(ofertas.data);

  useEffect(() => {
    setOfertasLocal(ofertas.data);
  }, [ofertas.data]);

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
              onClick={() => setMostrarFiltros((prev) => !prev)}

            >
              <Filter className="size-4" />
              {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>

            <Button asChild variant="default">
              <Link href={route("empresa.ofertas.crear")}>
                <Plus className="size-5" />
                <span className="ml-2">Crear oferta</span>
              </Link>
            </Button>

          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* SIDEBAR DE FILTROS (Estilo igual a tu imagen) */}
          {mostrarFiltros && (
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
                <h2 className="text-lg font-semibold text-[#034991] border-b pb-2">
                  Filtrar publicaciones
                </h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    aplicarFiltros();
                  }}
                  className="space-y-3 text-sm"
                >

                  {/* BUSCAR */}
                  <div className="flex flex-col">
                    <label className="font-semibold mb-1">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Título de la oferta..."
                        className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991] w-full"
                      />
                    </div>
                  </div>

                  {/* ESTADO */}
                  <div className="flex flex-col">
                    <label className="font-semibold mb-1">Estado</label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991]"
                    >
                      <option value="">Todos</option>
                      <option value="1">Publicada</option>
                      <option value="2">Borrador</option>
                    </select>
                  </div>

                  {/* FECHA PUBLICACIÓN */}
                  <div className="flex flex-col">
                    <label className="font-semibold mb-2">Fecha publicación</label>

                    <div className="flex flex-col gap-2">

                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 mb-1">Fecha inicio</span>
                        <input
                          type="date"
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991]"
                        />
                      </div>

                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 mb-1">Fecha fin</span>
                        <input
                          type="date"
                          value={fechaFin}
                          onChange={(e) => setFechaFin(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991]"
                        />
                      </div>

                    </div>
                  </div>

                  {/* POR PÁGINA */}
                  <div className="flex flex-col">
                    <label className="font-semibold mb-1">Ofertas por página</label>
                    <select
                      value={perPage}
                      onChange={(e) => setPerPage(Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991]"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  {/* BOTONES */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-[#034991] hover:bg-[#023165] text-white font-semibold rounded-full"
                    >
                      Aplicar filtros
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB] font-semibold rounded-full"
                      onClick={limpiarFiltros}
                    >
                      Limpiar
                    </Button>
                  </div>
                </form>
              </div>
            </aside>
          )}

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
                      <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] text-center">Fecha creación</th>
                      <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] text-center">Fecha límite</th>
                      <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] text-right">Gestión</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50">
                    {ofertasLocal.map((oferta) => (
                      <tr
                        key={oferta.id_oferta}
                        title="Gestionar oferta"
                        onClick={() => router.visit(route("empresa.ofertas.gestion", oferta.id_oferta))}
                        className="group hover:bg-[#F4F7FA]/50 transition-all cursor-pointer"
                      >
                        {/* Celda principal: Reducida de p-8 a py-3 px-5 */}
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-4">
                            {/* Icono de edificio más pequeño: de w-16 a w-12 */}
                            <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-200 group-hover:scale-105 transition-transform bg-white">
                              <img
                                src={oferta.empresa?.usuario?.foto_perfil?.url || fotoXDefecto}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = fotoXDefecto;
                                }}
                                className="w-full h-full object-cover rounded-full"
                                alt="Logo empresa"
                              />
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
                              disabled={oferta.estado_id === 4 || tieneInscritos(oferta)}
                              tooltip={obtenerTooltipEstado(oferta)}
                            />
                          </div>
                        </td>

                        <td className="py-3 px-5 text-center text-xs font-semibold text-slate-500">
                          {new Date(oferta.fecha_publicacion).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-5 text-center text-xs font-bold text-red-600">
                          {new Date(oferta.fecha_limite).toLocaleDateString()}
                        </td>

                        {/* Botones de acción más compactos: de h-11 a h-9 */}
                        <td className="py-3 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">

                            {/* EDITAR */}
                            <Button
                              variant="outline"
                              size="icon"
                              title="Editar"
                              onClick={() => router.visit(route("empresa.ofertas.editar", oferta.id_oferta))}
                            >
                              <Pencil className="size-4" />
                            </Button>

                            {/* ELIMINAR */}
                            <Button
                              variant="destructive"
                              size="icon"
                              title="Eliminar"
                              onClick={() => eliminarOferta(oferta.id_oferta)}
                            >
                              <Trash2 className="size-4" />
                            </Button>

                            {/* DETALLE / GESTIÓN */}
                            <Button
                              variant="default"
                              size="icon"
                              title="Ver detalle"
                              onClick={() => setOfertaSeleccionada(oferta)}
                            >
                              <Eye className="size-5" />
                            </Button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación más delgada: p-10 a p-6 */}
              {ofertas.links.length > 0 && (
                <div className="flex justify-center mt-6 space-x-2 pb-6">
                  {/* ANTERIOR */}
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={!ofertas.links[0]?.url}
                    onClick={() => {
                      const url = ofertas.links[0]?.url;
                      if (!url) return;

                      router.visit(url, {
                        preserveScroll: true,
                        preserveState: true,
                      });
                    }}
                  >
                    Anterior
                  </Button>

                  {/* NUMÉRICOS */}
                  {ofertas.links
                    .filter(
                      (link) =>
                        link.label !== "&laquo; Previous" &&
                        link.label !== "Next &raquo;"
                    )
                    .map((link, index) => (
                      <Button
                        key={index}
                        type="button"
                        size="sm"
                        variant={link.active ? "destructive" : "outline"}
                        disabled={!link.url}
                        onClick={() => {
                          if (!link.url) return;

                          router.visit(link.url, {
                            preserveScroll: true,
                            preserveState: true,
                          });
                        }}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}

                  {/* SIGUIENTE */}
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={!ofertas.links[ofertas.links.length - 1]?.url}
                    onClick={() => {
                      const url =
                        ofertas.links[ofertas.links.length - 1]?.url;
                      if (!url) return;

                      router.visit(url, {
                        preserveScroll: true,
                        preserveState: true,
                      });
                    }}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {ofertaSeleccionada && (
        <ModalOferta
          tipo="detalle"
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
