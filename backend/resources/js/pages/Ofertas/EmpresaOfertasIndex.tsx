import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import { Briefcase, Pencil, Trash2, Eye, Search } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import ModalDetalleOferta from "@/components/modal/ModalDetalleOferta";

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

      <div className="max-w-7xl mx-auto px-6 py-6 text-black">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-red-600" />
            Mis ofertas laborales
          </h1>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setMostrarFiltros((v) => !v)}
            >
              {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>

            <Button
              onClick={() =>
                router.visit(route("empresa.ofertas.crear"))
              }
            >
              Crear oferta
            </Button>
          </div>
        </header>

        {/* LAYOUT */}
        <div className="flex gap-6">
          {/* SIDEBAR */}
          {mostrarFiltros && (
            <aside className="w-72">
              <div className="bg-gray-50 border rounded-2xl p-4 space-y-4">
                <h2 className="font-semibold text-[#034991] border-b pb-2">
                  Filtros
                </h2>

                <div>
                  <label className="font-semibold text-sm text-black">
                    Ofertas por página
                  </label>

                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setTimeout(aplicarFiltros, 0);
                    }}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2
               text-black bg-white
               focus:ring-2 focus:ring-[#034991] focus:outline-none"
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="font-semibold text-sm text-black">
                    Buscar
                  </label>

                  <div className="relative mt-1">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                    />

                    <input
                      className="w-full border rounded-lg pl-9 pr-3 py-2
                 text-black bg-white
                 focus:ring-2 focus:ring-[#034991] focus:outline-none"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar oferta..."
                    />
                  </div>
                </div>


                <div>
                  <label className="font-semibold text-sm">
                    Modalidad
                  </label>
                  <select
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    value={modalidadId}
                    onChange={(e) => setModalidadId(e.target.value)}
                  >
                    <option value="">Todas</option>
                    {modalidades.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-sm">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    value={fechaInicio}
                    onChange={(e) =>
                      setFechaInicio(e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="font-semibold text-sm">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    router.get(route("empresa.ofertas.index"))
                  }
                >
                  Limpiar filtros
                </Button>

                <Button
                  className="w-full"
                  onClick={aplicarFiltros}
                >
                  Aplicar filtros
                </Button>

              </div>
            </aside>
          )}

          {/* TABLA */}
          <section className="flex-1">
            <div className="bg-white p-6 rounded-2xl shadow border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3">Título</th>
                    <th className="p-3">Empresa</th>
                    <th className="p-3">Publicación</th>
                    <th className="p-3">Expira</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ofertas.data.map((oferta) => (
                    <tr
                      key={oferta.id_oferta}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-3">{oferta.titulo}</td>
                      <td className="p-3">
                        {oferta.empresa.nombre}
                      </td>
                      <td className="p-3">
                        {new Date(
                          oferta.fecha_publicacion
                        ).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {new Date(
                          oferta.fecha_limite
                        ).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-center space-y-2">
                        <BadgeEstado estadoId={oferta.estado_id} />
                        <div className="flex justify-center">
                          <ToggleEstado
                            activo={oferta.estado_id === 1}
                            onChange={() => cambiarEstado(oferta)}
                          />
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              router.visit(
                                route(
                                  "empresa.ofertas.editar",
                                  oferta.id_oferta
                                )
                              )
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() =>
                              eliminarOferta(oferta.id_oferta)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                          <Button
                            size="icon"
                            onClick={() =>
                              setOfertaSeleccionada(oferta)
                            }
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {ofertas.links.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {/* Botón Anterior */}
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    disabled={!ofertas.links[0].url}
                    onClick={() =>
                      ofertas.links[0].url &&
                      router.visit(ofertas.links[0].url)
                    }
                  >
                    Anterior
                  </Button>

                  {/* Páginas */}
                  {ofertas.links
                    .slice(1, -1)
                    .map((link, index) => (
                      <Button
                        key={index}
                        type="button"
                        size="sm"
                        variant={link.active ? "destructive" : "outline"}
                        disabled={!link.url}
                        onClick={() =>
                          link.url && router.visit(link.url, { preserveScroll: true, preserveState: true, })
                        }
                      >
                        {link.label}
                      </Button>
                    ))}

                  {/* Botón Siguiente */}
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    disabled={
                      !ofertas.links[ofertas.links.length - 1].url
                    }
                    onClick={() =>
                      ofertas.links[ofertas.links.length - 1].url &&
                      router.visit(
                        ofertas.links[ofertas.links.length - 1].url!
                      )
                    }
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
