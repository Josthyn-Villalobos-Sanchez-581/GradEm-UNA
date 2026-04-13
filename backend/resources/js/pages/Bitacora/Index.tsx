import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import { Filter, Search } from "lucide-react";

/* =========================
   TIPOS
========================= */
interface Bitacora {
    id_cambio: number;
    tabla_afectada: string;
    operacion: string;
    nombre_usuario?: string;
    fecha_cambio: string;
    descripcion_cambio: string;
}

interface Props {
    bitacora: {
        data: Bitacora[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };

    estadisticas: {
        total: number;
        insert: number;
        update: number;
        delete: number;
        hoy: number;
        otros: number;
    };

    filtros: {
        busqueda?: string;
        tabla_afectada?: string;
        operacion?: string;
        fecha_inicio?: string;
        fecha_fin?: string;
        por_pagina?: number;
    };

    userPermisos: number[];
}

/* =========================
   BADGE OPERACIÓN
========================= */
const BadgeOperacion = ({ operacion }: { operacion: string }) => {
    const base = "px-3 py-1 text-xs font-semibold rounded-full";

    switch (operacion) {
        case "crear":
            return <span className={`${base} bg-green-100 text-green-700`}>CREAR</span>;

        case "actualizar":
            return <span className={`${base} bg-yellow-100 text-yellow-800`}>ACTUALIZAR</span>;

        case "eliminar":
            return <span className={`${base} bg-red-100 text-red-700`}>ELIMINAR</span>;

        case "estado":
            return <span className={`${base} bg-blue-100 text-blue-700`}>ESTADO</span>;

        case "asignar":
            return <span className={`${base} bg-purple-100 text-purple-700`}>ASIGNAR</span>;

        case "desasignar":
            return <span className={`${base} bg-pink-100 text-pink-700`}>DESASIGNAR</span>;

        default:
            return <span className={`${base} bg-gray-100`}>{operacion}</span>;
    }
};

/* =========================
   COMPONENTE
========================= */
export default function BitacoraIndex({ bitacora, estadisticas, filtros }: Props) {

    const data = bitacora.data;
    const links = bitacora.links;

    const [busqueda, setBusqueda] = useState(filtros.busqueda ?? "");
    const [tabla, setTabla] = useState(filtros.tabla_afectada ?? "");
    const [operacion, setOperacion] = useState(filtros.operacion ?? "");
    const [fechaInicio, setFechaInicio] = useState(filtros.fecha_inicio ?? "");
    const [fechaFin, setFechaFin] = useState(filtros.fecha_fin ?? "");
    const [mostrarFiltros, setMostrarFiltros] = useState(true);
    const [porPagina, setPorPagina] = useState(filtros.por_pagina ?? 10);

    /* =========================
       FILTROS
    ========================= */
    const aplicarFiltros = () => {
        router.get(
            route("auditoria.bitacora.index"),
            {
                busqueda: busqueda || undefined,
                tabla_afectada: tabla || undefined,
                operacion: operacion || undefined,
                fecha_inicio: fechaInicio || undefined,
                fecha_fin: fechaFin || undefined,
                por_pagina: porPagina || 10,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const limpiarFiltros = () => {
        router.get(route("auditoria.bitacora.index"));
    };

    /* =========================
       RENDER
    ========================= */
    return (
        <>
            <Head title="Bitácora del sistema" />

            <div className="max-full w-full mx-auto px-6 py-6 text-[#000]">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#034991] tracking-tight flex items-center gap-3">
                            Bitácora del sistema
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Auditoría completa de cambios del sistema.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                const params = new URLSearchParams({
                                    busqueda: busqueda || "",
                                    tabla_afectada: tabla || "",
                                    operacion: operacion || "",
                                    fecha_inicio: fechaInicio || "",
                                    fecha_fin: fechaFin || "",
                                });

                                window.open(route("auditoria.bitacora.pdf") + "?" + params.toString(), "_blank");
                            }}
                        >
                            Descargar PDF
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setMostrarFiltros((prev) => !prev)}
                        >
                            <Filter className="size-4" />
                            {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
                        </Button>
                    </div>
                </header>

                {/* =========================
                ESTADÍSTICAS
                ========================= */}
                {/* =========================
    ESTADÍSTICAS
========================= */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">

                    {/* TOTAL */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-xs text-slate-400 uppercase font-bold">Total</p>
                        <p className="text-2xl font-extrabold text-[#034991]">
                            {estadisticas.total}
                        </p>
                    </div>

                    {/* CREAR */}
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                        <p className="text-xs text-green-600 uppercase font-bold">Crear</p>
                        <p className="text-2xl font-extrabold text-green-700">
                            {estadisticas.insert}
                        </p>
                    </div>

                    {/* ACTUALIZAR */}
                    <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
                        <p className="text-xs text-yellow-600 uppercase font-bold">Actualizar</p>
                        <p className="text-2xl font-extrabold text-yellow-700">
                            {estadisticas.update}
                        </p>
                    </div>

                    {/* ELIMINAR */}
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                        <p className="text-xs text-red-600 uppercase font-bold">Eliminar</p>
                        <p className="text-2xl font-extrabold text-red-700">
                            {estadisticas.delete}
                        </p>
                    </div>

                    {/* OTROS */}
                    <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
                        <p className="text-xs text-purple-600 uppercase font-bold">Otros</p>
                        <p className="text-2xl font-extrabold text-purple-700">
                            {estadisticas.otros}
                        </p>
                    </div>

                    {/* HOY */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                        <p className="text-xs text-blue-600 uppercase font-bold">Hoy</p>
                        <p className="text-2xl font-extrabold text-blue-700">
                            {estadisticas.hoy}
                        </p>
                    </div>

                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* SIDEBAR */}
                    {mostrarFiltros && (
                        <aside className="w-full lg:w-72 flex-shrink-0">
                            <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">

                                <h2 className="text-lg font-semibold text-[#034991] border-b pb-2">
                                    Filtrar bitácora
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
                                                value={busqueda}
                                                onChange={(e) => setBusqueda(e.target.value)}
                                                placeholder="Tabla, usuario o descripción..."
                                                className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991] w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* OPERACIÓN */}
                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-1">Operación</label>
                                        <select
                                            value={operacion}
                                            onChange={(e) => setOperacion(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991]"
                                        >
                                            <option value="">Todas</option>
                                            <option value="crear">Crear</option>
                                            <option value="actualizar">Actualizar</option>
                                            <option value="eliminar">Eliminar</option>
                                            <option value="estado">Estado</option>
                                            <option value="asignar">Asignar</option>
                                            <option value="desasignar">Desasignar</option>
                                        </select>
                                    </div>

                                    {/* FECHAS */}
                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-2">Rango de fechas</label>

                                        <div className="flex flex-col gap-2">

                                            <div>
                                                <span className="text-xs text-slate-500">Fecha inicio</span>
                                                <input
                                                    type="date"
                                                    value={fechaInicio}
                                                    onChange={(e) => setFechaInicio(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991]"
                                                />
                                            </div>

                                            <div>
                                                <span className="text-xs text-slate-500">Fecha fin</span>
                                                <input
                                                    type="date"
                                                    value={fechaFin}
                                                    onChange={(e) => setFechaFin(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991]"
                                                />
                                            </div>

                                        </div>
                                    </div>

                                    {/* POR PÁGINA */}
                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-1">Registros por página</label>
                                        <select
                                            value={porPagina}
                                            onChange={(e) => setPorPagina(Number(e.target.value))}
                                            className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991]"
                                        >
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

                    {/* TABLA */}
                    <section className="flex-1">
                        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">

                                    <thead>
                                        <tr className="border-b border-slate-50 bg-slate-50/30">
                                            <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Tabla</th>
                                            <th className="p-5 text-center font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Operación</th>
                                            <th className="p-5 text-center font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Usuario</th>
                                            <th className="p-5 text-center font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Fecha</th>
                                            <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Descripción</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-50">
                                        {data.map((item) => (
                                            <tr
                                                key={item.id_cambio}
                                                className="group hover:bg-[#F4F7FA]/50 transition-all"
                                            >
                                                <td className="py-3 px-5 font-extrabold text-[#034991] uppercase">
                                                    {item.tabla_afectada}
                                                </td>

                                                <td className="py-3 px-5 text-center">
                                                    <BadgeOperacion operacion={item.operacion} />
                                                </td>

                                                <td className="py-3 px-5 text-center text-xs font-semibold text-slate-500">
                                                    {item.nombre_usuario || "Sistema"}
                                                </td>

                                                <td className="py-3 px-5 text-center text-xs font-semibold text-slate-500">
                                                    {new Date(item.fecha_cambio).toLocaleString()}
                                                </td>

                                                <td className="py-3 px-5 text-sm text-slate-600 max-w-xs truncate">
                                                    {item.descripcion_cambio}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>

                            {/* PAGINACIÓN */}
                            {links.length > 0 && (
                                <div className="flex justify-center mt-6 space-x-2 pb-6">

                                    <Button
                                        variant="default"
                                        size="sm"
                                        disabled={!links[0]?.url}
                                        onClick={() => {
                                            const url = links[0]?.url;
                                            if (!url) return;

                                            router.visit(url, {
                                                preserveScroll: true,
                                                preserveState: true,
                                            });
                                        }}
                                    >
                                        Anterior
                                    </Button>

                                    {links
                                        .filter(link =>
                                            link.label !== "&laquo; Previous" &&
                                            link.label !== "Next &raquo;"
                                        )
                                        .map((link, index) => (
                                            <Button
                                                key={index}
                                                size="sm"
                                                variant={link.active ? "destructive" : "outline"}
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url, {
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                })}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}

                                    <Button
                                        variant="default"
                                        size="sm"
                                        disabled={!links[links.length - 1]?.url}
                                        onClick={() => {
                                            const url = links[links.length - 1]?.url;
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
        </>
    );
}

/* =========================
   LAYOUT
========================= */
(BitacoraIndex as any).layout = (page: any) => (
    <PpLayout userPermisos={page.props.userPermisos}>
        {page}
    </PpLayout>
);