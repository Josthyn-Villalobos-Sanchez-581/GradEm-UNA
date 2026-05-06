import React, { useState, useMemo } from "react";
import { Head, router, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import {
    Filter, Plus, Pencil, Trash2, Search,
    AlertTriangle, ShieldCheck, BarChart3,
    AlertCircle, CheckCircle2, X
} from "lucide-react";
import { useModal } from "@/hooks/useModal";

/* =========================
   TIPOS
========================= */
interface Riesgo {
    id_riesgo: number;
    tipo_riesgo: string;
    descripcion: string;
    probabilidad: number;
    impacto: number;
    responsable: string;

    estrategia?: string;
    accion_mitigacion?: string;
    plan_contingencia?: string;
}

interface Props {
    riesgos: { data: Riesgo[] };
    filtros?: {
        tipo_riesgo?: string;
        responsable?: string;
        nivel?: string;
        orden_por?: string;
        direccion?: string;
    };
}

/* =========================
   COMPONENTES DE APOYO
========================= */

// Tarjetas de Resumen (KPIs)
const StatCard = ({ title, count, icon: Icon, colorClass, borderClass }: any) => (
    <div className={`bg-white border-l-4 ${borderClass} shadow-sm rounded-xl p-5 flex items-center justify-between`}>
        <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{count}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon className="size-6" />
        </div>
    </div>
);

const BadgeNivel = ({ nivel }: { nivel: number }) => {
    let config = {
        label: "Bajo",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500"
    };

    if (nivel >= 15) {
        config = { label: "Crítico", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" };
    } else if (nivel >= 8) {
        config = { label: "Medio", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" };
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}>
            <span className={`size-1.5 rounded-full ${config.dot}`} />
            {config.label} ({nivel})
        </span>
    );
};

/* =========================
   COMPONENTE PRINCIPAL
========================= */
export default function RiesgosIndex({ riesgos, filtros }: Props) {
    const modal = useModal();
    const [search, setSearch] = useState(filtros?.tipo_riesgo ?? "");
    const [responsable, setResponsable] = useState(filtros?.responsable ?? "");
    const [nivel, setNivel] = useState(filtros?.nivel ?? "");
    const [mostrarFiltros, setMostrarFiltros] = useState(true);

    // Cálculos para el resumen
    const stats = useMemo(() => {
        const data = riesgos.data;
        return {
            total: data.length,
            criticos: data.filter(r => (r.probabilidad * r.impacto) >= 15).length,
            medios: data.filter(r => (r.probabilidad * r.impacto) >= 8 && (r.probabilidad * r.impacto) < 15).length,
            bajos: data.filter(r => (r.probabilidad * r.impacto) < 8).length,
        };
    }, [riesgos.data]);

    const [ordenPor, setOrdenPor] = useState(filtros?.orden_por ?? "Nivel");
    const [direccion, setDireccion] = useState(filtros?.direccion ?? "Asc");

    const aplicarFiltros = () => {
        router.get(route("riesgos.index"), {
            tipo_riesgo: search || undefined,
            responsable: responsable || undefined,
            nivel: nivel || undefined,
            orden_por: ordenPor,
            direccion: direccion,
        }, { preserveState: true, replace: true });
    };

    const limpiarFiltros = () => {
        setSearch("");
        setResponsable("");
        setNivel("");
        router.get(route("riesgos.index"));
    };

    const eliminar = async (id: number) => {
        const ok = await modal.confirmacion({
            titulo: "Eliminar Riesgo",
            mensaje: "¿Estás seguro? Esta acción no se puede deshacer.",
        });
        if (ok) router.delete(route("riesgos.destroy", id));
    };

    // Dentro de RiesgosIndex
    const [riesgoSeleccionado, setRiesgoSeleccionado] = useState<Riesgo | null>(null);
    const [verDetalles, setVerDetalles] = useState(false);

    const handleOpenDetails = (r: Riesgo) => {
        setRiesgoSeleccionado(r);
        setVerDetalles(true);
    };

    const opcionesResponsables = [
        "Equipo Desarrollador",
        "Líder Técnico",
        "Empresa",
        "Product Owner"
    ];



    const ModalDetalles = ({ riesgo, abierto, alCerrar }: { riesgo: Riesgo | null, abierto: boolean, alCerrar: () => void }) => {
        if (!riesgo) return null;

        const magnitud = riesgo.probabilidad * riesgo.impacto;

        return (
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${abierto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Overlay: Al hacer clic aquí se cierra */}
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={alCerrar} />

                <div className={`bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative transform transition-all duration-300 ${abierto ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                    {/* Botón X Superior Derecha */}
                    <button
                        onClick={alCerrar}
                        className="absolute top-6 right-6 z-10 p-2 bg-white/80 hover:bg-rose-50 rounded-full transition-all group border border-gray-100 shadow-sm"
                    >
                        <X className="size-5 text-gray-400 group-hover:text-rose-500" />
                    </button>

                    {/* Header */}
                    <div className="bg-gray-50 px-8 py-8 border-b border-gray-100">
                        <div className="pr-10"> {/* Espacio para la X */}
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">{riesgo.tipo_riesgo}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-tighter">ID: {riesgo.id_riesgo}</span>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Análisis de Gestión Operativa</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">

                        {/* Panel de Métricas (Probabilidad, Impacto, Magnitud) */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Probabilidad</label>
                                <span className="text-xl font-black text-gray-700">{riesgo.probabilidad}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Impacto</label>
                                <span className="text-xl font-black text-gray-700">{riesgo.impacto}</span>
                            </div>
                            <div className="bg-gray-900 p-4 rounded-2xl shadow-lg shadow-gray-200 text-center transform scale-105">
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Magnitud</label>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-xl font-black text-white">{magnitud}</span>
                                    <BadgeNivel nivel={magnitud} />
                                </div>
                            </div>
                        </div>

                        {/* Responsable */}
                        <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black text-white shadow-md shadow-blue-200">
                                    {riesgo.responsable?.substring(0, 2).toUpperCase() || "??"}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-blue-400 uppercase block">Responsable Asignado</label>
                                    <span className="text-sm font-bold text-blue-900">{riesgo.responsable || "Sin asignar"}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <label className="text-[10px] font-black text-blue-400 uppercase block">Estrategia</label>
                                <span className="text-xs font-black text-gray-900 uppercase tracking-tighter">{riesgo.estrategia || "No definida"}</span>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción del Escenario</label>
                            <p className="text-gray-600 leading-relaxed bg-white border border-gray-100 p-5 rounded-2xl text-sm italic shadow-sm">
                                "{riesgo.descripcion}"
                            </p>
                        </div>

                        {/* Cuadrícula de Planes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 border border-emerald-100 rounded-[2rem] bg-emerald-50/30 relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-3 text-emerald-700">
                                    <ShieldCheck className="size-4" />
                                    <span className="text-xs font-black uppercase">Plan de Mitigación</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-snug relative z-10">
                                    {riesgo.accion_mitigacion || "No se ha redactado una acción preventiva para este riesgo."}
                                </p>
                                <ShieldCheck className="absolute -bottom-2 -right-2 size-16 text-emerald-100/50 -rotate-12" />
                            </div>

                            <div className="p-5 border border-rose-100 rounded-[2rem] bg-rose-50/30 relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-3 text-rose-700">
                                    <AlertCircle className="size-4" />
                                    <span className="text-xs font-black uppercase">Plan de Contingencia</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-snug relative z-10">
                                    {riesgo.plan_contingencia || "No se ha definido un plan de respuesta inmediata."}
                                </p>
                                <AlertCircle className="absolute -bottom-2 -right-2 size-16 text-rose-100/50 -rotate-12" />
                            </div>
                        </div>
                    </div>

                    {/* Footer decorativo */}
                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={alCerrar}
                            className="px-6 py-2 bg-white border border-gray-200 text-gray-900 text-xs font-black uppercase rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            Cerrar Registro
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-12">
            <Head title="Matriz de Riesgos" />

            {/* HEADER SUPERIOR */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-600 p-2 rounded-lg shadow-blue-200 shadow-lg">
                                <ShieldCheck className="size-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-900 tracking-tight">
                                    Matriz de Riesgos Operacionales
                                </h1>
                                <p className="text-gray-500 text-xs font-medium">Gestión estratégica y mitigación de amenazas</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                                className={`rounded-lg border-gray-300 ${mostrarFiltros ? 'bg-gray-100' : ''}`}
                            >
                                <Filter className="size-4 mr-2" />
                                Filtros
                            </Button>
                            <Button asChild className="bg-gray-900 hover:bg-black text-white rounded-lg shadow-sm">
                                <Link href={route("riesgos.create")}>
                                    <Plus className="size-4 mr-2" />
                                    Nuevo Riesgo
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

                {/* GRID DE RESUMEN (KPIs) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Riesgos"
                        count={stats.total}
                        icon={BarChart3}
                        colorClass="bg-blue-50 text-blue-600"
                        borderClass="border-blue-500"
                    />
                    <StatCard
                        title="Nivel Crítico"
                        count={stats.criticos}
                        icon={AlertTriangle}
                        colorClass="bg-rose-50 text-rose-600"
                        borderClass="border-rose-500"
                    />
                    <StatCard
                        title="Nivel Medio"
                        count={stats.medios}
                        icon={AlertCircle}
                        colorClass="bg-amber-50 text-amber-600"
                        borderClass="border-amber-500"
                    />
                    <StatCard
                        title="Bajo Control"
                        count={stats.bajos}
                        icon={CheckCircle2}
                        colorClass="bg-emerald-50 text-emerald-600"
                        borderClass="border-emerald-500"
                    />
                </div>

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* BARRA LATERAL DE FILTROS (Colapsable) */}
                    {mostrarFiltros && (
                        <aside className="w-full lg:w-80 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-bold text-gray-900">Refinar Búsqueda</h2>
                                    <button onClick={() => setMostrarFiltros(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="size-4" />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    {/* Tipo de Riesgo */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Riesgo</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Ej: Seguridad..."
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Responsable (Select dinámico) */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Responsable</label>
                                        <select
                                            value={responsable}
                                            onChange={(e) => setResponsable(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-900 appearance-none cursor-pointer"
                                        >
                                            <option value="" className="text-gray-400">Seleccionar responsable...</option>
                                            {opcionesResponsables.map((opcion) => (
                                                <option key={opcion} value={opcion}>
                                                    {opcion}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Prioridad */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Prioridad</label>
                                        <select
                                            value={nivel}
                                            onChange={(e) => setNivel(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-900 appearance-none cursor-pointer"
                                        >
                                            <option value="">Todos los niveles</option>
                                            <option value="bajo">Bajo</option>
                                            <option value="medio">Medio</option>
                                            <option value="alto">Alto (Crítico)</option>
                                        </select>
                                    </div>

                                    {/* ORDENAR POR */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                            Ordenar por
                                        </label>
                                        <select
                                            value={ordenPor}
                                            onChange={(e) => setOrdenPor(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-900 appearance-none cursor-pointer"
                                        >
                                            <option value="fecha">Fecha</option>
                                            <option value="nivel">Nivel de riesgo</option>
                                            <option value="tipo">Tipo (A-Z)</option>
                                        </select>
                                    </div>

                                    {/* DIRECCIÓN */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                            Dirección
                                        </label>
                                        <select
                                            value={direccion}
                                            onChange={(e) => setDireccion(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-900 appearance-none cursor-pointer"
                                        >
                                            <option value="asc">Ascendente</option>
                                            <option value="desc">Descendente</option>
                                        </select>
                                    </div>

                                    <div className="pt-4 flex flex-col gap-2">
                                        <Button onClick={aplicarFiltros} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 shadow-md transition-all active:scale-[0.98]">
                                            Aplicar Filtros
                                        </Button>
                                        <Button variant="ghost" onClick={limpiarFiltros} className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl">
                                            Restablecer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* TABLA DE RIESGOS */}
                    <section className="flex-1">
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                Riesgo Identificado
                                            </th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">
                                                Magnitud
                                            </th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                Responsable
                                            </th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {riesgos.data.length > 0 ? (
                                            riesgos.data.map((r) => (
                                                <tr
                                                    key={r.id_riesgo}
                                                    onClick={() => handleOpenDetails(r)}
                                                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-gray-900 text-sm">
                                                                {r.tipo_riesgo}
                                                            </span>
                                                            <span className="text-xs text-gray-500 line-clamp-1 max-w-[300px]">
                                                                {r.descripcion}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <BadgeNivel nivel={r.probabilidad * r.impacto} />
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                                                                {r.responsable ? r.responsable.substring(0, 2).toUpperCase() : "??"}
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-700">
                                                                {r.responsable || "Sin asignar"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                                onClick={() => router.visit(route("riesgos.edit", r.id_riesgo))}
                                                            >
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                                                                onClick={() => eliminar(r.id_riesgo)}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <ShieldCheck className="size-16 text-gray-100 mb-4" />
                                                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
                                                            No hay riesgos que mostrar
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <ModalDetalles
                riesgo={riesgoSeleccionado}
                abierto={verDetalles}
                alCerrar={() => setVerDetalles(false)}
            />
        </div>
    );
}