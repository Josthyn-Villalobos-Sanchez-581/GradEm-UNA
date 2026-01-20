import React, { useMemo, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";
import { Button } from "@/components/ui/button";

interface FotoPerfil {
    ruta_imagen: string;
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

const OfertasIndex: React.FC<Props> = ({
    ofertas,
    filtros,
    paises,
    provincias,
    cantones,
    modalidades,
    areasLaborales,
}) => {
    // ============================
    // ESTADO DE FILTROS (HU-27)
    // ============================
    const [filtrosEstado, setFiltrosEstado] = useState<FiltrosProps>({
        tipo_oferta: filtros.tipo_oferta ?? "",
        id_pais: filtros.id_pais ?? 1, // por defecto CR (si aplica)
        id_provincia: filtros.id_provincia ?? null,
        id_canton: filtros.id_canton ?? null,
        id_modalidad: filtros.id_modalidad ?? null,
        id_area_laboral: filtros.id_area_laboral ?? null,
        buscar: filtros.buscar ?? "",
    });

    const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(true);

    const provinciasFiltradas = useMemo(
        () =>
            filtrosEstado.id_pais
                ? provincias.filter((p) => p.id_pais === filtrosEstado.id_pais)
                : provincias,
        [provincias, filtrosEstado.id_pais]
    );

    const cantonesFiltrados = useMemo(
        () =>
            filtrosEstado.id_provincia
                ? cantones.filter((c) => c.id_provincia === filtrosEstado.id_provincia)
                : cantones,
        [cantones, filtrosEstado.id_provincia]
    );

    const manejarCambioFiltro = (
        campo: keyof FiltrosProps,
        valor: string | number | null
    ) => {
        setFiltrosEstado((prev) => {
            const nuevo = { ...prev, [campo]: valor };

            // Si cambia país, limpiar provincia y cantón
            if (campo === "id_pais") {
                nuevo.id_provincia = null;
                nuevo.id_canton = null;
            }

            // Si cambia provincia, limpiar cantón
            if (campo === "id_provincia") {
                nuevo.id_canton = null;
            }

            return nuevo;
        });
    };

    const aplicarFiltros = (e: React.FormEvent) => {
        e.preventDefault();

        const params: Record<string, any> = {};

        if (filtrosEstado.tipo_oferta) params.tipo_oferta = filtrosEstado.tipo_oferta;
        if (filtrosEstado.id_pais) params.id_pais = filtrosEstado.id_pais;
        if (filtrosEstado.id_provincia) params.id_provincia = filtrosEstado.id_provincia;
        if (filtrosEstado.id_canton) params.id_canton = filtrosEstado.id_canton;
        if (filtrosEstado.id_modalidad) params.id_modalidad = filtrosEstado.id_modalidad;
        if (filtrosEstado.id_area_laboral)
            params.id_area_laboral = filtrosEstado.id_area_laboral;
        if (filtrosEstado.buscar) params.buscar = filtrosEstado.buscar;

        Inertia.get("/ofertas", params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const limpiarFiltros = () => {
        setFiltrosEstado({
            tipo_oferta: "",
            id_pais: 1,
            id_provincia: null,
            id_canton: null,
            id_modalidad: null,
            id_area_laboral: null,
            buscar: "",
        });

        Inertia.get("/ofertas", {}, { preserveScroll: true });
    };

    const obtenerClaseBorde = (tipo: string) => {
        if (tipo === "empleo") return "border-l-4 border-[#034991]";
        if (tipo === "practica") return "border-l-4 border-green-600";
        return "border-l-4 border-gray-300";
    };

    const obtenerEtiquetaTipo = (tipo: string) => {
        if (tipo === "empleo") return "Empleo";
        if (tipo === "practica") return "Práctica profesional";
        return tipo;
    };

    const obtenerFotoEmpresa = (oferta: Oferta) => {
        return (
            oferta.empresa?.usuario?.fotoPerfil?.ruta_imagen ??
            "/images/empresa-default.png" 
        );
    };

    return (
        <>
            <Head title="Ofertas laborales y prácticas" />
            <div
                className="max-full w-full mx-auto px-6 py-6 text-[#000000]"
                style={{ fontFamily: "Open Sans, sans-serif" }}
            >
                {/* CARD PRINCIPAL CONTENEDOR */}
                <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 space-y-6">
                    {/* ENCABEZADO SUPERIOR */}
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-3">
                        <div>
                            <h1 className="text-2xl font-bold text-[#034991]">
                                Ofertas laborales y prácticas
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">
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

                    {/* LAYOUT: FILTROS IZQUIERDA / LISTADO DERECHA */}
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
                                            <label className="font-semibold mb-1">País</label>
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
                                            <label className="font-semibold mb-1">
                                                Provincia
                                            </label>
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
                                            <label className="font-semibold mb-1">Cantón</label>
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

                        {/* LISTADO HU-25 */}
                        <section className="flex-1">
                            <div className="pt-2 border-t border-gray-200 lg:border-none lg:pt-0">
                                {ofertas.data.length === 0 ? (
                                    <p className="text-center text-gray-500 mt-6 italic">
                                        No se encontraron ofertas con los filtros seleccionados.
                                    </p>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-4">
                                        {ofertas.data.map((oferta) => {
                                            const fotoEmpresaUrl = obtenerFotoEmpresa(oferta);

                                            return (
                                                <Link
                                                    key={oferta.id_oferta}
                                                    href={`/ofertas/${oferta.id_oferta}`}
                                                    className={`flex flex-col justify-between h-full bg-white rounded-xl shadow-sm border ${obtenerClaseBorde(
                                                        oferta.tipo_oferta
                                                    )} p-4 hover:shadow-md transition`}
                                                >
                                                    <div>
                                                        {/* Tipo y fecha */}
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span
                                                                className={`text-xs font-semibold px-2 py-1 rounded-full ${oferta.tipo_oferta === "empleo"
                                                                        ? "bg-[#034991]/10 text-[#034991]"
                                                                        : oferta.tipo_oferta ===
                                                                            "practica"
                                                                            ? "bg-green-100 text-green-700"
                                                                            : "bg-gray-100 text-gray-600"
                                                                    }`}
                                                            >
                                                                {obtenerEtiquetaTipo(
                                                                    oferta.tipo_oferta
                                                                )}
                                                            </span>

                                                            <span className="text-[11px] text-gray-500">
                                                                Publicada:{" "}
                                                                {new Date(
                                                                    oferta.fecha_publicacion
                                                                ).toLocaleDateString("es-CR")}
                                                            </span>
                                                        </div>

                                                        <h2 className="text-lg font-bold text-[#1F1E1E] mb-1 line-clamp-2">
                                                            {oferta.titulo}
                                                        </h2>

                                                        <p className="text-xs text-gray-600 mb-2">
                                                            {oferta.categoria}
                                                            {oferta.area_laboral
                                                                ? ` · ${oferta.area_laboral.nombre}`
                                                                : ""}
                                                        </p>

                                                        {/* Empresa + avatar */}
                                                        {oferta.empresa && (
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <img
                                                                    src={fotoEmpresaUrl}
                                                                    alt={oferta.empresa.nombre}
                                                                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-semibold text-gray-700">
                                                                        {oferta.empresa.nombre}
                                                                    </span>
                                                                    {oferta.empresa.usuario
                                                                        ?.nombre_completo && (
                                                                            <span className="text-[11px] text-gray-500">
                                                                                {
                                                                                    oferta.empresa
                                                                                        .usuario
                                                                                        .nombre_completo
                                                                                }
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <p className="text-sm text-gray-700 mt-1 line-clamp-3">
                                                            {oferta.descripcion}
                                                        </p>
                                                    </div>

                                                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                                                        <p>
                                                            Ubicación:{" "}
                                                            {oferta.pais
                                                                ? `${oferta.pais.nombre}${oferta.provincia
                                                                    ? `, ${oferta.provincia.nombre}`
                                                                    : ""
                                                                }${oferta.canton
                                                                    ? `, ${oferta.canton.nombre}`
                                                                    : ""
                                                                }`
                                                                : "No especificada"}
                                                        </p>
                                                        <p>
                                                            Modalidad:{" "}
                                                            {oferta.modalidad?.nombre ??
                                                                "No especificada"}{" "}
                                                            · Horario: {oferta.horario}
                                                        </p>
                                                        <p className="mt-1 text-[#CD1719] font-semibold">
                                                            Fecha límite:{" "}
                                                            {new Date(
                                                                oferta.fecha_limite
                                                            ).toLocaleDateString("es-CR")}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* PAGINACIÓN (usa links de Laravel) */}
                                {ofertas.links.length > 0 && (
                                    <div className="flex justify-center mt-6 gap-2 flex-wrap">
                                        {ofertas.links.map((link, idx) =>
                                            link.url ? (
                                                <Button
                                                    key={idx}
                                                    asChild
                                                    size="sm"
                                                    variant={
                                                        link.active ? "default" : "outline"
                                                    }
                                                    className={`px-3 py-1 text-xs rounded-full ${link.active
                                                            ? "bg-[#034991] text-white border-[#034991]"
                                                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                                                        }`}
                                                >
                                                    <Link
                                                        href={link.url}
                                                        preserveScroll
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                </Button>
                                            ) : (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 text-xs rounded-full text-gray-400 border border-gray-200"
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

(OfertasIndex as any).layout = (page: React.ReactNode & { props: Props }) => {
    const permisos = page.props?.userPermisos ?? [];
    return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};

export default OfertasIndex;
