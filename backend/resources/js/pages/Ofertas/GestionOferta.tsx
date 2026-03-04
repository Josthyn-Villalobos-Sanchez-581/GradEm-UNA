import React, { useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import PpLayout from "@/layouts/PpLayout";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Pencil,
    User,
    MessageSquare,
    ChevronRight,
    CheckCircle2,
    XCircle,
    RotateCcw,
    ExternalLink,
    Search,
    ChevronUp,
    ChevronDown,
    LayoutDashboard
} from "lucide-react";
import OfertaCard from "@/components/ofertas/OfertaCard";
import OfertaDetalle from "@/components/ofertas/OfertaDetalle";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

/* =========================
    TIPOS E INTERFACES
========================= */
interface Usuario {
    id_usuario: number;
    nombre: string;
    correo: string;
    fotoPerfil: { url: string } | null;
    curriculum: { ruta_archivo_pdf: string } | null;
}

interface Postulacion {
    id_postulacion: number;
    mensaje: string | null;
    fecha_postulacion: string;
    estado_id: number;
    usuario: Usuario | null;
}

interface Estadisticas {
    total: number;
    espera: number;
    revision?: number;
    aceptado: number;
    negado: number;
    cancelado?: number;
}

interface Props {
    oferta: any;
    postulaciones: { data: Postulacion[] };
    estadisticas: Estadisticas;
    userPermisos?: any;
}

const columnasBase = [
    { id: 1, titulo: "Espera", color: "gray" },
    { id: 4, titulo: "En revisión", color: "blue" },
    { id: 2, titulo: "Aceptados", color: "green" },
    { id: 3, titulo: "Negados", color: "red" },
    { id: 5, titulo: "Canceladas", color: "zinc" },
];

const getStatusStyles = (id: number) => {
    switch (id) {
        case 1: return "bg-slate-100 text-slate-700 border-slate-200";
        case 4: return "bg-blue-50 text-blue-700 border-blue-100";
        case 2: return "bg-emerald-50 text-emerald-700 border-emerald-100";
        case 3: return "bg-rose-50 text-rose-700 border-rose-100";
        case 5: return "bg-zinc-50 text-zinc-700 border-zinc-100";
        default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
};

export default function GestionOferta({ oferta, postulaciones, estadisticas }: Props) {
    const [verDetalle, setVerDetalle] = useState(false);
    const [mensajeActivo, setMensajeActivo] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [mostrarInfo, setMostrarInfo] = useState(true); // Estado para colapsar info superior

    const agrupadas = useMemo(() => {
        const filtradas = postulaciones.data.filter(p =>
            p.usuario?.nombre.toLowerCase().includes(busqueda.toLowerCase())
        );
        return columnasBase.reduce((acc, col) => {
            acc[col.id] = filtradas.filter((p) => p.estado_id === col.id);
            return acc;
        }, {} as Record<number, Postulacion[]>);
    }, [postulaciones.data, busqueda]);

    const cambiarEstado = (id: number, estado: number) => {
        router.put(route("postulaciones.cambiarEstado", id), { estado_id: estado }, { preserveScroll: true });
    };

    const verPerfil = (p: Postulacion) => {
        if (!p.usuario) return;
        if (p.estado_id === 1) {
            router.put(route("postulaciones.cambiarEstado", p.id_postulacion), { estado_id: 4 }, {
                preserveScroll: true,
                onSuccess: () => router.visit(route("usuarios.ver", p.usuario!.id_usuario))
            });
        } else {
            router.visit(route("usuarios.ver", p.usuario.id_usuario));
        }
    };

    const dataGrafico = useMemo(() => [
        { name: 'Espera', value: estadisticas.espera, color: '#f97316' }, // Orange-500
        { name: 'Revisión', value: estadisticas.revision ?? 0, color: '#3b82f6' }, // Blue-500
        { name: 'Aceptados', value: estadisticas.aceptado, color: '#10b981' }, // Emerald-500
        { name: 'Negados', value: estadisticas.negado, color: '#f43f5e' }, // Rose-500
        { name: 'Cancelados', value: estadisticas.cancelado ?? 0, color: '#71717a' }, // Zinc-500
    ].filter(item => item.value > 0), [estadisticas]); // Solo mostrar los que tienen candidatos

    return (
        <TooltipProvider>
            <Head title={`Gestión - ${oferta.titulo}`} />

            <div className="max-w-[100%] mx-auto px-4 sm:px-6 py-8 bg-slate-50/30 min-h-screen">

                {/* HEADER PRINCIPAL */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost" size="icon" className="rounded-full bg-white shadow-sm hover:shadow-md transition-all"
                            onClick={() => router.visit(route("empresa.ofertas.index"))}
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Postulantes</h1>
                            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                {oferta.titulo}
                                <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-blue-600 font-bold">{postulaciones.data.length} aplicantes</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text" placeholder="Buscar por nombre de candidato..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
                                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline" className="rounded-xl shadow-sm bg-white"
                            onClick={() => setMostrarInfo(!mostrarInfo)}
                        >
                            {mostrarInfo ? <ChevronUp className="w-4 h-4 mr-2" /> : <LayoutDashboard className="w-4 h-4 mr-2" />}
                            {mostrarInfo ? "Ocultar Info" : "Ver Estadísticas"}
                        </Button>
                    </div>
                </header>

                {/* SECCIÓN SUPERIOR COLAPSABLE: Card + Estadísticas */}
                {mostrarInfo && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* Card de Oferta */}
                        <div className="lg:col-span-4 xl:col-span-3">
                            <div
                                onClick={() => setVerDetalle(!verDetalle)}
                                className="group cursor-pointer relative overflow-hidden rounded-2xl transition-all hover:ring-2 hover:ring-blue-500/50 shadow-sm"
                            >
                                <OfertaCard oferta={oferta} />
                                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                                        <ExternalLink className="w-3 h-3" /> Ver detalles
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas compactas */}
                        <div className="lg:col-span-8 xl:col-span-9 bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm flex flex-col justify-center">
                            <div className="flex justify-between items-end mb-3">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base">
                                    Resumen de la Vacante
                                    <span className="text-[10px] md:text-xs uppercase px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full tracking-wider font-bold">En vivo</span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
                                {[
                                    { label: "Total", val: estadisticas.total, color: "bg-slate-100 text-slate-600", dot: "bg-slate-300" },
                                    { label: "Espera", val: estadisticas.espera, color: "bg-orange-50 text-orange-600", dot: "bg-orange-400" },
                                    { label: "Revisión", val: estadisticas.revision ?? 0, color: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
                                    { label: "Aceptados", val: estadisticas.aceptado, color: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
                                    { label: "Negados", val: estadisticas.negado, color: "bg-rose-50 text-rose-600", dot: "bg-rose-500" },
                                    { label: "Cancelados", val: estadisticas.cancelado ?? 0, color: "bg-zinc-50 text-zinc-600", dot: "bg-zinc-400" },
                                ].map((item, idx) => {
                                    const width = estadisticas.total > 0 ? (item.val / estadisticas.total) * 100 : 0;
                                    return (
                                        <div key={idx} className="p-2 rounded-xl border border-slate-100 bg-slate-50/50">
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                                                <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-tight">{item.label}</span>
                                            </div>
                                            <div className="text-sm md:text-base font-black text-slate-800">{item.val}</div>
                                            <div className="w-full h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                                <div className={`h-full ${item.dot}`} style={{ width: `${width}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Barra segmentada */}
                            <div className="mt-4">
                                <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100 shadow-inner">
                                    {[
                                        estadisticas.espera,
                                        estadisticas.revision ?? 0,
                                        estadisticas.aceptado,
                                        estadisticas.negado,
                                        estadisticas.cancelado ?? 0
                                    ].map((val, i) => {
                                        const width = estadisticas.total > 0 ? (val / estadisticas.total) * 100 : 0;
                                        const colors = ["bg-orange-400", "bg-blue-500", "bg-emerald-500", "bg-rose-500", "bg-zinc-400"];
                                        return <div key={i} className={`transition-all duration-500 ${colors[i]}`} style={{ width: `${width}%` }} />;
                                    })}
                                </div>
                                <p className="text-[10px] md:text-xs text-slate-400 mt-1 text-center font-medium italic">
                                    Distribución visual de los {estadisticas.total} aplicantes
                                </p>
                            </div>
                        </div>
                    </div>
                )}


                {/* ÁREA DE CONTENIDO PRINCIPAL (Full Width) */}
                <div className="w-full">
                    {verDetalle ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 animate-in slide-in-from-bottom-4 duration-300">
                            <Button variant="ghost" className="mb-6 -ml-2 text-slate-500" onClick={() => setVerDetalle(false)}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Volver al tablero
                            </Button>
                            <OfertaDetalle oferta={oferta} />
                        </div>
                    ) : (
                        /* KANBAN: Adaptado para ocupar el ancho total */
                        <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-slate-200">
                            {columnasBase.map((col) => (
                                <div key={col.id} className="flex-1 min-w-[280px] max-w-[350px] flex flex-col">
                                    {/* Header Columna */}
                                    <div className={`flex items-center justify-between p-3 mb-3 rounded-xl border shadow-sm ${getStatusStyles(col.id)}`}>
                                        <span className="text-xs font-black uppercase tracking-widest">{col.titulo}</span>
                                        <span className="bg-white/60 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-sm">
                                            {agrupadas[col.id]?.length ?? 0}
                                        </span>
                                    </div>

                                    {/* Container de Postulantes */}
                                    <div className="space-y-3 min-h-[60vh] rounded-2xl bg-slate-100/40 p-2 border border-dashed border-slate-200 transition-colors">
                                        {agrupadas[col.id]?.map((p) => (
                                            <div key={p.id_postulacion} className="group bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 border-2 border-white shadow-sm overflow-hidden">
                                                        {p.usuario?.fotoPerfil?.url ? (
                                                            <img src={p.usuario.fotoPerfil.url} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold bg-slate-100">
                                                                {p.usuario?.nombre.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                                            {p.usuario?.nombre}
                                                        </h4>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                                                            Postuló: {new Date(p.fecha_postulacion).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {p.mensaje && (
                                                        <button
                                                            onClick={() => setMensajeActivo(p.mensaje)}
                                                            className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <MessageSquare className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="mt-4 flex gap-2">
                                                    <Button
                                                        size="sm" variant="secondary"
                                                        className="flex-1 h-8 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white transition-all"
                                                        onClick={() => verPerfil(p)}
                                                    >
                                                        Perfil <ChevronRight className="w-3 h-3 ml-1" />
                                                    </Button>

                                                    {p.estado_id === 4 && (
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="icon" className="h-8 w-8 bg-emerald-500 hover:bg-emerald-600 shadow-sm"
                                                                onClick={() => cambiarEstado(p.id_postulacion, 2)}
                                                            >
                                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                                            </Button>
                                                            <Button
                                                                size="icon" className="h-8 w-8 bg-rose-500 hover:bg-rose-600 shadow-sm"
                                                                onClick={() => cambiarEstado(p.id_postulacion, 3)}
                                                            >
                                                                <XCircle className="w-4 h-4 text-white" />
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {(p.estado_id === 2 || p.estado_id === 3) && (
                                                        <Button
                                                            size="icon" variant="outline" className="h-8 w-8 border-slate-200 hover:bg-blue-50 hover:border-blue-200 group/btn"
                                                            onClick={() => cambiarEstado(p.id_postulacion, 4)}
                                                        >
                                                            <RotateCcw className="w-4 h-4 text-slate-400 group-hover/btn:text-blue-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {agrupadas[col.id]?.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-10 text-slate-300 opacity-40">
                                                <User className="w-8 h-8 mb-1" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">Sin candidatos</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* MODAL DE MENSAJE (Sin cambios en lógica) */}
                {mensajeActivo && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                            <button onClick={() => setMensajeActivo(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <XCircle className="w-6 h-6 text-slate-300" />
                            </button>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-50 rounded-2xl"><MessageSquare className="w-6 h-6 text-blue-600" /></div>
                                <h3 className="text-xl font-bold text-slate-900">Mensaje de Introducción</h3>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <p className="text-slate-600 italic leading-relaxed text-sm">"{mensajeActivo}"</p>
                            </div>
                            <Button className="w-full mt-6 bg-slate-900 h-12 rounded-xl font-bold" onClick={() => setMensajeActivo(null)}>Entendido</Button>
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}

GestionOferta.layout = (page: any) => (
    <PpLayout userPermisos={page.props.userPermisos}>{page}</PpLayout>
);