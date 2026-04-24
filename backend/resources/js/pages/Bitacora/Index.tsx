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

    operaciones: string[];

    estadisticas: {
        total: number;
        hoy: number;
        por_operacion: Record<string, number>;
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
const coloresBadge: Record<string, string> = {
    crear: "bg-green-100 text-green-700",
    actualizar: "bg-yellow-100 text-yellow-800",
    eliminar: "bg-red-100 text-red-700",
    estado: "bg-blue-100 text-blue-700",
    asignar: "bg-purple-100 text-purple-700",
    desasignar: "bg-pink-100 text-pink-700",
    otros: "bg-gray-100 text-gray-700",
};

const BadgeOperacion = ({ operacion }: { operacion: string }) => {
    const base = "px-3 py-1 text-xs font-semibold rounded-full";
    const color = coloresBadge[operacion.toLowerCase()] || "bg-gray-100 text-gray-700";

    return (
        <span className={`${base} ${color}`}>
            {operacion.toUpperCase()}
        </span>
    );
};

/* =========================
   COMPONENTE
========================= */
export default function BitacoraIndex({ bitacora, estadisticas, filtros, operaciones }: Props) {

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

        if (!validarFechas()) return;

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

    const validarFechas = (): boolean => {
        if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
            alert("La fecha fin no puede ser menor que la fecha inicio");
            return false;
        }
        return true;
    };

    const LIMITE_BUSQUEDA = 100;

    /* =========================
       RENDER
    ========================= */
    return (
        <>
            <Head title="Bitácora del sistema" />

            <div className="max-full w-full mx-auto px-6 py-6 text-[#000]">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
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

                {/* SIDEBAR */}
                <div className="flex justify-end mb-3">
                    <div className="flex flex-col items-end gap-2">

                        {/* TÍTULO */}
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                            Estadísticas
                        </span>

                        {/* CONTENEDOR PÍLDORAS */}
                        <div className="flex flex-wrap justify-end gap-2">

                            {/* TOTAL */}
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold text-xs shadow-sm">
                                <span className="uppercase opacity-70">
                                    Total
                                </span>

                                <span className="bg-white/70 px-2 py-0.5 rounded-full font-bold">
                                    {estadisticas.total}
                                </span>
                            </div>

                            {/* HOY */}
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs shadow-sm">
                                <span className="uppercase opacity-70">
                                    Hoy
                                </span>

                                <span className="bg-white/70 px-2 py-0.5 rounded-full font-bold">
                                    {estadisticas.hoy}
                                </span>
                            </div>

                            {/* DINÁMICOS */}
                            {Object.entries(estadisticas.por_operacion).map(([op, total]) => {
                                const estilos = {
                                    crear: "bg-green-100 text-green-800",
                                    actualizar: "bg-yellow-100 text-yellow-800",
                                    eliminar: "bg-red-100 text-red-800",
                                    estado: "bg-blue-100 text-blue-800",
                                    asignar: "bg-purple-100 text-purple-800",
                                    desasignar: "bg-pink-100 text-pink-800",
                                    otros: "bg-gray-100 text-gray-800",
                                } as const;

                                const estilo = estilos[op as keyof typeof estilos] || estilos.otros;

                                return (
                                    <div
                                        key={op}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-xs shadow-sm ${estilo}`}
                                    >
                                        <span className="uppercase opacity-70">
                                            {op}
                                        </span>

                                        <span className="bg-white/70 px-2 py-0.5 rounded-full font-bold">
                                            {total}
                                        </span>
                                    </div>
                                );
                            })}

                        </div>
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
                                                maxLength={LIMITE_BUSQUEDA}
                                                onChange={(e) => {
                                                    const valor = e.target.value;

                                                    if (valor.length <= LIMITE_BUSQUEDA) {
                                                        setBusqueda(valor);
                                                    }
                                                }}
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
                                            {operaciones.map((op) => {
                                                const valor = op.toLowerCase();

                                                return (
                                                    <option key={op} value={valor}>
                                                        {op.toUpperCase()}
                                                    </option>
                                                );
                                            })}
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
                                                    max={fechaFin || undefined}
                                                    onChange={(e) => setFechaInicio(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991]"
                                                />
                                            </div>

                                            <div>
                                                <span className="text-xs text-slate-500">Fecha fin</span>
                                                <input
                                                    type="date"
                                                    value={fechaFin}
                                                    min={fechaInicio || undefined}
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