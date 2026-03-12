import React, { useMemo, useState } from "react";
import { Head } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { Button } from "@/components/ui/button";
import OfertaCard from "@/components/ofertas/OfertaCard";

/* =======================
   INTERFACES
======================= */

interface FotoPerfil {
    url: string;
}

interface UsuarioEmpresa {
    id_usuario: number;
    nombre_completo?: string;
    fotoPerfil?: FotoPerfil | null;
}

interface Empresa {
    id_empresa: number;
    nombre: string;
    usuario?: UsuarioEmpresa | null;
}

interface Pais {
    id: number;
    nombre: string;
}

interface Provincia {
    id: number;
    nombre: string;
    id_pais: number;
}

interface Canton {
    id: number;
    nombre: string;
    id_provincia: number;
}

interface Modalidad {
    id: number;
    nombre: string;
}

interface AreaLaboral {
    id: number;
    nombre: string;
}

interface Oferta {
    id_oferta: number;
    titulo: string;
    descripcion: string;
    tipo_oferta: string;
    categoria: string;
    horario: string;
    fecha_limite: string;
    fecha_publicacion: string;
    empresa?: Empresa;
    pais?: Pais;
    provincia?: Provincia;
    canton?: Canton;
    modalidad?: Modalidad;
    area_laboral?: AreaLaboral;
}

interface LinkPaginacion {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginacionOfertas {
    data: Oferta[];
    links: LinkPaginacion[];
    total: number;
}

interface FiltrosProps {
    tipo_oferta?: string | null;
    id_pais?: number | null;
    id_provincia?: number | null;
    id_canton?: number | null;
    id_modalidad?: number | null;
    id_area_laboral?: number | null;
    buscar?: string | null;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    ordenar_por?: string | null;
    direccion?: string | null;
}

interface Props {
    ofertas: PaginacionOfertas;
    filtros: FiltrosProps;
    paises: Pais[];
    provincias: Provincia[];
    cantones: Canton[];
    modalidades: Modalidad[];
    areasLaborales: AreaLaboral[];
    userPermisos: number[];
}

/* =======================
   COMPONENTE
======================= */

const OfertasIndex: React.FC<Props> = ({
    ofertas,
    filtros,
    paises,
    provincias,
    cantones,
    modalidades,
    areasLaborales,
}) => {
    const [filtrosEstado, setFiltrosEstado] = useState<FiltrosProps>({
        tipo_oferta: filtros.tipo_oferta ?? "",
        id_pais: filtros.id_pais ?? null,
        id_provincia: filtros.id_provincia ?? null,
        id_canton: filtros.id_canton ?? null,
        id_modalidad: filtros.id_modalidad ?? null,
        id_area_laboral: filtros.id_area_laboral ?? null,
        buscar: filtros.buscar ?? "",
        fecha_inicio: filtros.fecha_inicio ?? "",
        fecha_fin: filtros.fecha_fin ?? "",
        ordenar_por: filtros.ordenar_por ?? "fecha_publicacion",
        direccion: filtros.direccion ?? "desc",
    });

    const [mostrarFiltros, setMostrarFiltros] = useState(true);

    const provinciasFiltradas = useMemo(
        () =>
            filtrosEstado.id_pais
                ? provincias.filter(p => p.id_pais === filtrosEstado.id_pais)
                : provincias,
        [provincias, filtrosEstado.id_pais]
    );

    const cantonesFiltrados = useMemo(
        () =>
            filtrosEstado.id_provincia
                ? cantones.filter(c => c.id_provincia === filtrosEstado.id_provincia)
                : cantones,
        [cantones, filtrosEstado.id_provincia]
    );

    const manejarCambioFiltro = (
        campo: keyof FiltrosProps,
        valor: string | number | null
    ) => {
        setFiltrosEstado(prev => {
            const nuevo = { ...prev, [campo]: valor };

            if (campo === "id_pais") {
                nuevo.id_provincia = null;
                nuevo.id_canton = null;
            }

            if (campo === "id_provincia") {
                nuevo.id_canton = null;
            }

            return nuevo;
        });
    };

    const aplicarFiltros = (e: React.FormEvent) => {
        e.preventDefault();

        const params: Record<string, any> = {};

        Object.entries(filtrosEstado).forEach(([key, value]) => {
            if (value !== null && value !== "") {
                params[key] = value;
            }
        });

        router.get("/ofertas", params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const limpiarFiltros = () => {
        setFiltrosEstado({
            tipo_oferta: "",
            id_pais: null,
            id_provincia: null,
            id_canton: null,
            id_modalidad: null,
            id_area_laboral: null,
            buscar: "",
            fecha_inicio: "",
            fecha_fin: "",
        });

        router.get("/ofertas", {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Ofertas laborales y prácticas" />
            <div
                className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 text-[#000000]"
                style={{ fontFamily: "Open Sans, sans-serif" }}
            >
                {/* CARD PRINCIPAL CONTENEDOR */}
                {/* ENCABEZADO SUPERIOR */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#034991] tracking-tight flex items-center gap-3">
                            Ofertas laborales y prácticas
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Explora oportunidades de empleo y prácticas profesionales según tu
                            perfil e intereses.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-sm text-gray-500">
                        <span>
                            Resultados encontrados:{" "}
                            <span className="font-semibold text-[#034991]">
                                {ofertas.total}
                            </span>
                        </span>

                        {/* Botón para mostrar/ocultar filtros */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB]"
                            onClick={() => setMostrarFiltros((prev) => !prev)}
                        >
                            {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
                        </Button>
                    </div>
                </header>
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* SIDEBAR FILTROS */}
                    {mostrarFiltros && (
                        <aside className="w-full lg:w-72 flex-shrink-0">
                            <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
                                <h2 className="text-lg font-semibold text-[#034991] border-b pb-2">
                                    Filtros de búsqueda
                                </h2>

                                <form
                                    onSubmit={aplicarFiltros}
                                    className="space-y-3 text-sm"
                                >
                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-1">Buscar</label>
                                        <input
                                            type="text"
                                            value={filtrosEstado.buscar ?? ""}
                                            onChange={(e) =>
                                                manejarCambioFiltro("buscar", e.target.value)
                                            }
                                            placeholder="Título, descripción..."
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-1">
                                            Tipo de oferta
                                        </label>
                                        <select
                                            value={filtrosEstado.tipo_oferta ?? ""}
                                            onChange={(e) =>
                                                manejarCambioFiltro(
                                                    "tipo_oferta",
                                                    e.target.value === ""
                                                        ? ""
                                                        : e.target.value
                                                )
                                            }
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                        >
                                            <option value="">Todas</option>
                                            <option value="empleo">Empleo</option>
                                            <option value="practica">
                                                Práctica profesional
                                            </option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-2">Ubicación</label>
                                        <span className="text-xs text-slate-500 mb-1">País</span>
                                        <select
                                            value={filtrosEstado.id_pais ?? ""}
                                            onChange={(e) =>
                                                manejarCambioFiltro(
                                                    "id_pais",
                                                    e.target.value === ""
                                                        ? null
                                                        : Number(e.target.value)
                                                )
                                            }
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                        >
                                            <option value="">Todos</option>
                                            {paises.map((pais) => (
                                                <option key={pais.id} value={pais.id}>
                                                    {pais.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500 mb-1">Provincia</span>
                                        <select
                                            value={filtrosEstado.id_provincia ?? ""}
                                            onChange={(e) =>
                                                manejarCambioFiltro(
                                                    "id_provincia",
                                                    e.target.value === ""
                                                        ? null
                                                        : Number(e.target.value)
                                                )
                                            }
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                        >
                                            <option value="">Todas</option>
                                            {provinciasFiltradas.map((prov) => (
                                                <option key={prov.id} value={prov.id}>
                                                    {prov.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500 mb-1">Cantón</span>
                                        <select
                                            value={filtrosEstado.id_canton ?? ""}
                                            onChange={(e) =>
                                                manejarCambioFiltro(
                                                    "id_canton",
                                                    e.target.value === ""
                                                        ? null
                                                        : Number(e.target.value)
                                                )
                                            }
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                        >
                                            <option value="">Todos</option>
                                            {cantonesFiltrados.map((canton) => (
                                                <option key={canton.id} value={canton.id}>
                                                    {canton.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-1">Modalidad</label>
                                        <select
                                            value={filtrosEstado.id_modalidad ?? ""}
                                            onChange={(e) =>
                                                manejarCambioFiltro(
                                                    "id_modalidad",
                                                    e.target.value === ""
                                                        ? null
                                                        : Number(e.target.value)
                                                )
                                            }
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                        >
                                            <option value="">Todas</option>
                                            {modalidades.map((mod) => (
                                                <option key={mod.id} value={mod.id}>
                                                    {mod.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-1">
                                            Área laboral
                                        </label>
                                        <select
                                            value={filtrosEstado.id_area_laboral ?? ""}
                                            onChange={(e) =>
                                                manejarCambioFiltro(
                                                    "id_area_laboral",
                                                    e.target.value === ""
                                                        ? null
                                                        : Number(e.target.value)
                                                )
                                            }
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                        >
                                            <option value="">Todas</option>
                                            {areasLaborales.map((area) => (
                                                <option key={area.id} value={area.id}>
                                                    {area.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-2">Fecha publicación</label>

                                        <span className="text-xs text-slate-500 mb-1">Fecha inicio</span>
                                        <input
                                            type="date"
                                            value={filtrosEstado.fecha_inicio ?? ""}
                                            onChange={(e) =>
                                                manejarCambioFiltro("fecha_inicio", e.target.value)
                                            }
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500 mb-1">Fecha fin</span>
                                        <input
                                            type="date"
                                            value={filtrosEstado.fecha_fin ?? ""}
                                            onChange={(e) =>
                                                manejarCambioFiltro("fecha_fin", e.target.value)
                                            }
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-1">Ordenar por</label>

                                        <select
                                            value={`${filtrosEstado.ordenar_por}_${filtrosEstado.direccion}`}
                                            onChange={(e) => {
                                                const valor = e.target.value;
                                                const dir = valor.endsWith("_asc") ? "asc" : "desc";
                                                const campo = valor.replace(/_(asc|desc)$/, "");

                                                setFiltrosEstado(prev => ({
                                                    ...prev,
                                                    ordenar_por: campo,
                                                    direccion: dir
                                                }));
                                            }}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                        >
                                            <option value="fecha_publicacion_desc">
                                                Más recientes
                                            </option>

                                            <option value="fecha_publicacion_asc">
                                                Más antiguos
                                            </option>

                                            <option value="fecha_limite_desc">
                                                Fecha límite más lejana
                                            </option>

                                            <option value="fecha_limite_asc">
                                                Fecha límite más próxima
                                            </option>

                                            <option value="titulo_asc">
                                                Título A → Z
                                            </option>

                                            <option value="titulo_desc">
                                                Título Z → A
                                            </option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-2 pt-2">
                                        <Button
                                            type="submit"
                                            variant="default"
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

                    {/* LISTADO */}
                    <section className="flex-1">
                        {ofertas.data.length === 0 ? (
                            <p className="text-center text-gray-500 italic mt-6">
                                No se encontraron ofertas.
                            </p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-4">
                                {ofertas.data.map(oferta => (
                                    <OfertaCard
                                        key={oferta.id_oferta}
                                        oferta={oferta}
                                        href={`/ofertas/${oferta.id_oferta}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* PAGINACIÓN */}
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

                                {/* BOTONES NUMÉRICOS */}
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
                    </section>
                </div>
            </div>
        </>
    );
};

(OfertasIndex as any).layout = (page: React.ReactNode & { props: Props }) => {
    return <PpLayout userPermisos={page.props.userPermisos}>{page}</PpLayout>;
};

export default OfertasIndex;
