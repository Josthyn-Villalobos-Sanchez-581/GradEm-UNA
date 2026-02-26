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
    Search
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
   TIPOS
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
}

interface Props {
    oferta: any;
    postulaciones: {
        data: Postulacion[];
    };
    estadisticas: Estadisticas;
    userPermisos?: any;
}

/* =========================
   CONFIG KANBAN
========================= */

const columnasBase = [
    { id: 1, titulo: "Espera", color: "gray" },
    { id: 4, titulo: "En revisión", color: "blue" },
    { id: 2, titulo: "Aceptados", color: "green" },
    { id: 3, titulo: "Negados", color: "red" },
];

const getStatusStyles = (id: number) => {
    switch (id) {
        case 1: return "bg-slate-100 text-slate-700 border-slate-200";
        case 4: return "bg-blue-50 text-blue-700 border-blue-100";
        case 2: return "bg-emerald-50 text-emerald-700 border-emerald-100";
        case 3: return "bg-rose-50 text-rose-700 border-rose-100";
        default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
};

/* =========================
   COMPONENTE PRINCIPAL
========================= */

export default function GestionOferta({ oferta, postulaciones, estadisticas }: Props) {
    const [verDetalle, setVerDetalle] = useState(false);
    const [mensajeActivo, setMensajeActivo] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");

    // Filtrado y Agrupación
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
        router.put(
            route("postulaciones.cambiarEstado", id),
            { estado_id: estado },
            { preserveScroll: true }
        );
    };

    const verPerfil = (p: Postulacion) => {
        if (!p.usuario) return;

        // Si está en espera, mover a "En revisión" automáticamente al ver
        if (p.estado_id === 1) {
            router.put(
                route("postulaciones.cambiarEstado", p.id_postulacion),
                { estado_id: 4 },
                {
                    preserveScroll: true,
                    onSuccess: () => router.visit(route("usuarios.ver", p.usuario!.id_usuario))
                }
            );
        } else {
            router.visit(route("usuarios.ver", p.usuario.id_usuario));
        }
    };

    return (
        <TooltipProvider>
            <Head title={`Gestión - ${oferta.titulo}`} />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">

                {/* HEADER SUPERIOR */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-white hover:shadow-md transition-all"
                            onClick={() => router.visit(route("empresa.ofertas.index"))}
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Gestión de Postulantes
                            </h1>
                            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                {oferta.titulo}
                                <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-blue-600">{postulaciones.data.length} aplicantes</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar candidato..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            className="rounded-xl shadow-sm bg-white"
                            onClick={() => router.visit(route("empresa.ofertas.editar", oferta.id_oferta))}
                        >
                            <Pencil className="w-4 h-4 mr-2 text-slate-500" />
                            Editar Oferta
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* PANEL LATERAL IZQUIERDO (Info Oferta) */}
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="sticky top-6 space-y-6">
                            <div
                                onClick={() => setVerDetalle(!verDetalle)}
                                className="group cursor-pointer relative overflow-hidden rounded-2xl transition-all hover:ring-2 hover:ring-blue-500/50"
                            >
                                <OfertaCard oferta={oferta} />
                                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                                        <ExternalLink className="w-3 h-3" /> Ver detalles
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
    <h3 className="font-bold text-slate-900 mb-2 flex items-center justify-between">
        Estadísticas
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tiempo Real</span>
    </h3>

    {/* GRÁFICO DE BARRA SEGMENTADA */}
    <div className="mb-6">
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100 shadow-inner">
            <div 
                className="bg-orange-400 transition-all duration-500 shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)]" 
                style={{ width: `${(estadisticas.espera / estadisticas.total) * 100}%` }}
            />
            <div 
                className="bg-blue-500 transition-all duration-500 shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)]" 
                style={{ width: `${((estadisticas.revision ?? 0) / estadisticas.total) * 100}%` }}
            />
            <div 
                className="bg-emerald-500 transition-all duration-500 shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)]" 
                style={{ width: `${(estadisticas.aceptado / estadisticas.total) * 100}%` }}
            />
            <div 
                className="bg-rose-500 transition-all duration-500" 
                style={{ width: `${(estadisticas.negado / estadisticas.total) * 100}%` }}
            />
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center font-medium italic">
            Distribución visual de los {estadisticas.total} aplicantes
        </p>
    </div>

    {/* LISTADO DE DATOS */}
    <div className="space-y-4">
        {[
            { label: "Total Aplicantes", val: estadisticas.total, color: "bg-slate-100 text-slate-600", dot: "bg-slate-300" },
            { label: "En Espera", val: estadisticas.espera, color: "bg-orange-50 text-orange-600", dot: "bg-orange-400" },
            { label: "En Revisión", val: estadisticas.revision ?? 0, color: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
            { label: "Aceptados", val: estadisticas.aceptado, color: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
            { label: "Descartados", val: estadisticas.negado, color: "bg-rose-50 text-rose-600", dot: "bg-rose-500" },
        ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center group">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.dot} group-hover:scale-125 transition-transform`} />
                    <span className="text-sm text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
                        {item.label}
                    </span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg min-w-[32px] text-center ${item.color}`}>
                    {item.val}
                </span>
            </div>
        ))}
    </div>
</div>
                        </div>
                    </aside>

                    {/* ÁREA KANBAN / DETALLE */}
                    <main className="lg:col-span-9">
                        {verDetalle ? (
                            <div className="bg-white border border-slate-200 rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-4">
                                <Button
                                    variant="ghost"
                                    className="mb-6 -ml-2 text-slate-500"
                                    onClick={() => setVerDetalle(false)}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver al flujo
                                </Button>
                                <OfertaDetalle oferta={oferta} />
                            </div>
                        ) : (
                            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                                {columnasBase.map((col) => (
                                    <div
                                        key={col.id}
                                        className="w-[300px] shrink-0 flex flex-col"
                                    >
                                        {/* HEADER COLUMNA */}
                                        <div className={`flex items-center justify-between p-3 mb-4 rounded-xl border ${getStatusStyles(col.id)}`}>
                                            <span className="text-sm font-bold uppercase tracking-wide">{col.titulo}</span>
                                            <span className="bg-white/50 px-2 py-0.5 rounded-md text-xs font-black">
                                                {agrupadas[col.id]?.length ?? 0}
                                            </span>
                                        </div>

                                        {/* CONTENEDOR DE CARDS */}
                                        <div className="space-y-3 min-h-[500px] rounded-2xl bg-slate-50/50 p-2 border border-dashed border-slate-200">
                                            {agrupadas[col.id]?.map((p) => (
                                                <div
                                                    key={p.id_postulacion}
                                                    className="group bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 border-2 border-white shadow-sm overflow-hidden">
                                                            {p.usuario?.fotoPerfil?.url ? (
                                                                <img src={p.usuario.fotoPerfil.url} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                                                    {p.usuario?.nombre.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-bold text-slate-900 truncate">
                                                                {p.usuario?.nombre}
                                                            </h4>
                                                            <p className="text-[11px] text-slate-400 font-medium">
                                                                Postuló el {new Date(p.fecha_postulacion).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        {p.mensaje && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        onClick={() => setMensajeActivo(p.mensaje)}
                                                                        className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                                    >
                                                                        <MessageSquare className="w-4 h-4" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Ver mensaje</TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>

                                                    <div className="mt-4 flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            className="flex-1 h-8 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-900 hover:bg-blue-600 hover:text-white transition-all duration-200"
                                                            onClick={() => verPerfil(p)}
                                                        >
                                                            Perfil <ChevronRight className="w-3 h-3 ml-1" />
                                                        </Button>

                                                        {/* ACCIONES DINÁMICAS SEGÚN ESTADO */}
                                                        {p.estado_id === 4 && (
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="icon"
                                                                    className="h-8 w-8 bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-200"
                                                                    onClick={() => cambiarEstado(p.id_postulacion, 2)}
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    className="h-8 w-8 bg-rose-500 hover:bg-rose-600 shadow-sm shadow-rose-200"
                                                                    onClick={() => cambiarEstado(p.id_postulacion, 3)}
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {(p.estado_id === 2 || p.estado_id === 3) && (
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-8 w-8 border-slate-200 hover:bg-slate-50"
                                                                onClick={() => cambiarEstado(p.id_postulacion, 4)}
                                                            >
                                                                <RotateCcw className="w-4 h-4 text-slate-400" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            {agrupadas[col.id]?.length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                                                    <User className="w-8 h-8 mb-2 opacity-20" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Vacío</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>

                {/* MODAL DE MENSAJE PERSONALIZADO */}
                {mensajeActivo && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
                        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                            <button
                                onClick={() => setMensajeActivo(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-slate-300" />
                            </button>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <MessageSquare className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Mensaje de Introducción</h3>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <p className="text-slate-600 italic leading-relaxed text-sm">
                                    "{mensajeActivo}"
                                </p>
                            </div>
                            <Button
                                className="w-full mt-6 bg-slate-900 h-12 rounded-xl font-bold"
                                onClick={() => setMensajeActivo(null)}
                            >
                                Entendido
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}

/* =========================
   LAYOUT
========================= */

(GestionOferta as any).layout = (page: any) => (
    <PpLayout userPermisos={page.props.userPermisos}>
        {page}
    </PpLayout>
);