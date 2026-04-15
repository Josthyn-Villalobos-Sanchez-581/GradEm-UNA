import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import axios from "axios";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { router } from "@inertiajs/react";

interface Curso {
    id_curso: number;
    titulo: string;
    descripcion?: string;
    modalidad?: {
        id_modalidad: number;
        nombre: string;
    };
    nombreInstructor?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    fecha_limite_inscripcion?: string;
    duracion?: string;
    cupos?: number;
    estado_id: number;
}

interface Props {
    cursos: Curso[];
    modalidades: { id_modalidad: number; nombre: string }[];
    userPermisos: number[];
    misInscripciones: number[];
    inscritosCount: Record<number, number>;
}

export default function MisCursosIndex(props: Props) {
    const modal = useModal();

    const [busqueda, setBusqueda] = useState("");
    const [filtroModalidad, setFiltroModalidad] = useState("todos");
    const [paginaActual, setPaginaActual] = useState(1);
    const [mostrarFiltros, setMostrarFiltros] = useState(true);
    const [cancelando, setCancelando] = useState<Set<number>>(new Set());

    const fechaVencida = (fecha?: string) => {
        if (!fecha) return false;

        const hoy = new Date();
        const limite = new Date(fecha);

        // llevar al final del día
        limite.setHours(23, 59, 59, 999);

        return hoy > limite;
    };

    const itemsPorPagina = 10;

    const normalizeText = (value?: string | null) =>
        String(value ?? "").toLowerCase();

    const displayValue = (value?: string | null) => {
        if (!value) return "NA";
        return value.trim().length ? value : "NA";
    };

    const textoFiltroValido = (valor: string, max = 100) => {
        return valor
            .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "")
            .slice(0, max);
    };

    const cursosFiltrados = (props.cursos ?? [])
        .filter((c) => c.estado_id === 1)
        .filter((c) => {
            const texto = busqueda.toLowerCase();
            return (
                normalizeText(c.titulo).includes(texto) ||
                normalizeText(c.descripcion).includes(texto)
            );
        })
        .filter((c) => {
            if (filtroModalidad !== "todos") {
                return String(c.modalidad?.id_modalidad) === filtroModalidad;
            }
            return true;
        });

    const totalPaginas = Math.ceil(cursosFiltrados.length / itemsPorPagina);

    const cursosPaginados = cursosFiltrados.slice(
        (paginaActual - 1) * itemsPorPagina,
        paginaActual * itemsPorPagina
    );

    const cambiarPagina = (pagina: number) => {
        if (pagina >= 1 && pagina <= totalPaginas) {
            setPaginaActual(pagina);
        }
    };

    const limpiarFiltros = () => {
        setBusqueda("");
        setFiltroModalidad("todos");
        setPaginaActual(1);
    };

    const cancelarInscripcion = async (curso: Curso) => {
        const confirmado = await modal.confirmacion({
            titulo: "Cancelar inscripción",
            mensaje: (
                <p>
                    ¿Deseas cancelar tu inscripción en{" "}
                    <strong>{curso.titulo}</strong>?
                </p>
            ),
            textoAceptar: "Sí, cancelar",
            textoCancelar: "No",
        });

        if (!confirmado) return;

        setCancelando((prev) => new Set(prev).add(curso.id_curso));

        try {
            await axios.post(route("cursos.cancelar", { idCurso: curso.id_curso }));

            await modal.alerta({
                titulo: "Cancelado",
                mensaje: "Tu inscripción ha sido cancelada.",
            });

            router.reload({ only: ["cursos", "misInscripciones"] });

        } catch (error: any) {
            await modal.alerta({
                titulo: "Error",
                mensaje:
                    error.response?.data?.message ??
                    "No se pudo cancelar la inscripción.",
            });
        } finally {
            setCancelando((prev) => {
                const next = new Set(prev);
                next.delete(curso.id_curso);
                return next;
            });
        }
    };

    const verDetalleCurso = async (curso: Curso) => {
        const inscritos = props.inscritosCount?.[curso.id_curso] ?? 0;
        const cuposTotales = curso.cupos ?? 0;

        await modal.alerta({
            titulo: "",
            mensaje: (
                <div className="text-left px-1">
                    {/* Cabecera Institucional: Título y Badge */}
                    <div className="relative mb-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-[#CD1719] rounded-full" />
                            <span className="text-[10px] font-black text-[#CD1719] uppercase tracking-[0.2em]">
                                Detalles del Programa
                            </span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-[#034991] leading-tight">
                            {curso.titulo}
                        </h2>
                    </div>

                    <div className="space-y-5">
                        {/* Bloque de Información General (Estilo Cards Pequeñas) */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Modalidad</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#034991]" />
                                    <p className="text-sm font-bold text-[#034991]">{displayValue(curso.modalidad?.nombre)}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Instructor</p>
                                <p className="text-sm font-bold text-slate-700 truncate">{displayValue(curso.nombreInstructor)}</p>
                            </div>
                        </div>

                        {/* Descripción: Contenedor con foco visual */}
                        <div className="bg-white border-2 border-slate-50 p-4 rounded-[1.5rem] shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                                Sobre el curso
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                {curso.descripcion || "No hay una descripción detallada disponible."}
                            </p>
                        </div>

                        {/* Banner de Cronograma: Inspirado en el footer de la card */}
                        <div className="bg-[#034991] rounded-[2rem] p-5 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
                            {/* Decoración sutil */}
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex justify-between items-end border-b border-white/10 pb-3">
                                    <div>
                                        <p className="text-[9px] font-bold text-blue-200 uppercase tracking-tighter">Duración total</p>
                                        <p className="text-lg font-black">{displayValue(curso.duracion)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-amber-400 uppercase tracking-tighter">Límite inscripción</p>
                                        <p className="text-lg font-black text-amber-50">{displayValue(curso.fecha_limite_inscripcion)}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-1">
                                    <div className="flex gap-4">
                                        <div>
                                            <p className="text-[8px] font-bold text-blue-300 uppercase">Inicio</p>
                                            <p className="text-xs font-bold">{displayValue(curso.fecha_inicio)}</p>
                                        </div>
                                        <div className="w-px h-6 bg-white/20" />
                                        <div>
                                            <p className="text-[8px] font-bold text-blue-300 uppercase">Fin</p>
                                            <p className="text-xs font-bold">{displayValue(curso.fecha_fin)}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                                        <p className="text-[8px] font-bold text-blue-200 uppercase text-center">Cupos</p>
                                        <p className="text-xs font-black text-center">
                                            {curso.cupos
                                                ? `${inscritos} / ${curso.cupos}`
                                                : "Ilimitados"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        });
    };

    return (
        <>
            <Head title="Mis Cursos" />

            <div className="w-full max-w-[1600px] mx-auto px-4 py-6 text-[#000000]" style={{ fontFamily: "Open Sans, sans-serif" }}>
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#034991]">Mis Cursos</h1>
                        <p className="text-sm text-gray-500">
                            Aquí puedes ver y gestionar tus cursos inscritos.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-sm text-gray-500">
                        <span>
                            Resultados encontrados:
                            <span className="font-semibold text-[#034991]">
                                {cursosFiltrados.length}
                            </span>
                        </span>

                        <Button
                            variant="outline"
                            onClick={() => setMostrarFiltros((prev) => !prev)}
                        >
                            {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
                        </Button>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-6">
                    {mostrarFiltros && (
                        <aside className="w-full lg:w-72 flex-shrink-0">
                            <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
                                <h2 className="text-lg font-semibold text-[#034991] border-b pb-2">Filtros de búsqueda</h2>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setPaginaActual(1);
                                    }}
                                    className="space-y-3 text-sm"
                                >
                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-1">Buscar</label>

                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                                            <input
                                                type="text"
                                                placeholder="Título o descripción"
                                                value={busqueda}
                                                onChange={(e) => {
                                                    setBusqueda(textoFiltroValido(e.target.value, 100));
                                                    setPaginaActual(1);
                                                }}
                                                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-1">Modalidad</label>
                                        <select
                                            value={filtroModalidad}
                                            onChange={(e) => {
                                                setFiltroModalidad(e.target.value);
                                                setPaginaActual(1);
                                            }}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                        >
                                            <option value="todos">Todas</option>
                                            {(props.modalidades ?? []).map((m) => (
                                                <option key={m.id_modalidad} value={m.id_modalidad}>{m.nombre}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-2 pt-2">
                                        <Button type="submit" variant="default" className="w-full bg-[#034991] hover:bg-[#023165] text-white font-semibold rounded-full">
                                            Aplicar filtros
                                        </Button>
                                        <Button type="button" variant="outline" className="w-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB] font-semibold rounded-full" onClick={limpiarFiltros}>
                                            Limpiar
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </aside>
                    )}

                    <section className="flex-1">
                        {cursosPaginados.length === 0 ? (
                            <div className="text-center text-gray-500 italic mt-6 bg-white border border-gray-200 rounded-2xl py-10 px-4">
                                No se encontraron cursos con los filtros seleccionados.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-1">
                                {cursosPaginados.map((curso) => {
                                    const cuposDisponibles = Math.max(
                                        0,
                                        (curso.cupos ?? 0) - (props.inscritosCount?.[curso.id_curso] ?? 0)
                                    );
                                    const inscritos = props.inscritosCount?.[curso.id_curso] ?? 0;

                                    const esVencida = fechaVencida(curso.fecha_limite_inscripcion);

                                    return (
                                        <article
                                            key={curso.id_curso}
                                            className="group relative flex flex-col bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-900/15 transition-all duration-500"
                                        >
                                            {/* Accent superior */}
                                            <div className={`h-2 w-full ${esVencida ? "bg-red-500" : "bg-[#034991]"}`} />

                                            <div className="p-6 flex flex-col flex-1">

                                                {/* Header */}
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <h3
                                                        onClick={() => verDetalleCurso(curso)}
                                                        className="cursor-pointer text-lg font-extrabold text-[#034991] leading-tight group-hover:text-[#CD1719] transition-colors line-clamp-2 flex-1"
                                                    >
                                                        {curso.titulo}
                                                    </h3>

                                                    {/* Estado */}
                                                    <span className="flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-700 border border-green-200">
                                                        Inscrito
                                                    </span>
                                                </div>

                                                {/* Timeline + Cupos */}
                                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4 mb-6">

                                                    {/* Fechas */}
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="text-center flex-1">
                                                            <p className="text-slate-400 font-bold uppercase text-[9px]">Inicio</p>
                                                            <p className="font-bold text-slate-800">
                                                                {displayValue(curso.fecha_inicio)}
                                                            </p>
                                                        </div>

                                                        <div className="h-8 w-px bg-slate-200 mx-2" />

                                                        <div className="text-center flex-1">
                                                            <p className="text-slate-400 font-bold uppercase text-[9px]">Finalización</p>
                                                            <p className="font-bold text-slate-800">
                                                                {displayValue(curso.fecha_fin)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Fecha límite */}
                                                    <div
                                                        className={`flex items-center justify-between p-3 rounded-xl border-2 ${esVencida
                                                            ? "bg-red-50 border-red-200"
                                                            : "bg-white border-[#034991]/20"
                                                            }`}
                                                    >
                                                        <span
                                                            className={`text-[11px] font-black uppercase ${esVencida ? "text-red-600" : "text-[#034991]"
                                                                }`}
                                                        >
                                                            Límite inscripción
                                                        </span>

                                                        <span
                                                            className={`text-sm font-black ${esVencida ? "text-red-700" : "text-[#034991]"
                                                                }`}
                                                        >
                                                            {displayValue(curso.fecha_limite_inscripcion)}
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar para Cupos */}
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-[11px] font-bold">
                                                            <span className="text-slate-500 uppercase">Inscritos</span>
                                                            <span className={cuposDisponibles > 0 ? 'text-[#034991]' : 'text-red-600'}>
                                                                {curso.cupos ? `${inscritos} de ${curso.cupos}` : 'Ilimitados'}
                                                            </span>
                                                        </div>
                                                        {curso.cupos && (
                                                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-1000 ${cuposDisponibles > 0 ? 'bg-[#034991]' : 'bg-red-500'}`}
                                                                    style={{ width: `${(inscritos / curso.cupos) * 100}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* ACCIONES */}
                                                <div className="mt-auto flex gap-2">

                                                    {/* Botón Ver Detalle */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 rounded-full border-[#034991] text-[#034991] font-bold hover:bg-[#E6F2FB] h-10"
                                                        onClick={() => verDetalleCurso(curso)}
                                                    >
                                                        Ver detalle
                                                    </Button>

                                                    {/* Botón Cancelar */}
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="flex-1 rounded-full font-bold h-10"
                                                        disabled={cancelando.has(curso.id_curso)}
                                                        onClick={() => cancelarInscripcion(curso)}
                                                    >
                                                        {cancelando.has(curso.id_curso)
                                                            ? "Cancelando..."
                                                            : "Cancelar"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                        <div className="text-sm text-gray-500 mt-6 text-center">
                            Mostrando <span className="font-medium">{cursosPaginados.length}</span> de{" "}
                            <span className="font-medium">{cursosFiltrados.length}</span> cursos
                        </div>

                        {totalPaginas > 1 && (
                            <div className="flex justify-center mt-4 space-x-2 pb-2">
                                <Button size="sm" disabled={paginaActual === 1} onClick={() => cambiarPagina(paginaActual - 1)}>
                                    Anterior
                                </Button>

                                {Array.from({ length: totalPaginas }, (_, i) => (
                                    <Button
                                        key={i + 1}
                                        size="sm"
                                        variant={paginaActual === i + 1 ? "destructive" : "outline"}
                                        onClick={() => cambiarPagina(i + 1)}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}

                                <Button size="sm" disabled={paginaActual === totalPaginas} onClick={() => cambiarPagina(paginaActual + 1)}>
                                    Siguiente
                                </Button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

MisCursosIndex.layout = (page: any) => {
    const permisos = page.props?.userPermisos ?? [];
    return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};