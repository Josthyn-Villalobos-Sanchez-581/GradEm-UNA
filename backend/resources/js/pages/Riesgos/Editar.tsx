import React, { useState, useMemo } from "react";
import { Head, router, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import {
    ArrowLeft, FileText, BarChart4, Target,
    ChevronRight, ChevronLeft, CheckCircle2
} from "lucide-react";

/* =========================
   TIPOS
========================= */
interface Riesgo {
    id_riesgo: number;
    tipo_riesgo: string;
    descripcion: string;
    probabilidad: number;
    impacto: number;
    responsables: string; // Viene como string desde el backend
    estrategia: string;
    accion_mitigacion: string;
    plan_contingencia: string;
}

interface Props {
    riesgo: Riesgo;
}

export default function EditarRiesgoMatriz({ riesgo }: Props) {
    const [paso, setPaso] = useState(1);

    // Inicializamos el formulario convirtiendo el string de responsables en array
    const [form, setForm] = useState({
        ...riesgo,
        responsables: riesgo.responsables ? riesgo.responsables.split(", ") : [] as string[],
    });

    const [errores, setErrores] = useState<Record<string, string>>({});

    const opcionesResponsables = [
        "Equipo Desarrollador",
        "Líder Técnico",
        "Empresa",
        "Product Owner"
    ];

    const toggleResponsable = (opcion: string) => {
        if (opcion === "TODOS") {
            setForm(prev => ({ ...prev, responsables: ["TODOS"] }));
            return;
        }

        let nuevos = [...form.responsables.filter(r => r !== "TODOS")];
        if (nuevos.includes(opcion)) {
            nuevos = nuevos.filter(r => r !== opcion);
        } else {
            nuevos.push(opcion);
        }
        setForm(prev => ({ ...prev, responsables: nuevos }));
    };

    const magnitud = useMemo(() => form.probabilidad * form.impacto, [form.probabilidad, form.impacto]);

    const obtenerConfigNivel = (v: number) => {
        if (v >= 12) return { label: "CRÍTICO", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
        if (v >= 8) return { label: "ALTO", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
        if (v >= 4) return { label: "MEDIO", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
        return { label: "BAJO", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    };

    const config = obtenerConfigNivel(magnitud);

    const validarPaso = (p: number) => {
        let e: Record<string, string> = {};
        if (p === 1) {
            if (!form.tipo_riesgo) e.tipo_riesgo = "El tipo es obligatorio";
            if (!form.descripcion) e.descripcion = "La descripción es obligatoria";
            if (form.responsables.length === 0) e.responsables = "Seleccione al menos uno";
        }
        if (p === 3) {
            if (!form.accion_mitigacion) e.accion_mitigacion = "Campo obligatorio";
            if (!form.plan_contingencia) e.plan_contingencia = "Campo obligatorio";
        }
        setErrores(e);
        return Object.keys(e).length === 0;
    };

    const siguiente = () => {
        if (validarPaso(paso)) setPaso(paso + 1);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validarPaso(3)) {
            const dataFinal = {
                ...form,
                responsables: form.responsables.join(", "),
                magnitud: magnitud
            };
            router.put(route("riesgos.update", riesgo.id_riesgo), dataFinal);
        }
    };

    return (
        <div className="min-h-screen bg-[#F1F5F9] py-12 px-4 font-sans">
            <Head title={`Editar Riesgo #${riesgo.id_riesgo}`} />

            <div className="max-w-2xl mx-auto">
                <Link
                    href={route("riesgos.index")}
                    className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
                >
                    <ArrowLeft className="size-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    VOLVER A LA MATRIZ
                </Link>

                {/* HEADER PROFESIONAL */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-black tracking-tight uppercase">Editar Riesgo</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">ID de Registro: {riesgo.id_riesgo}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border-2 ${config.border} ${config.bg} text-center`}>
                        <p className="text-[9px] font-black text-black opacity-50 uppercase">Riesgo Calculado</p>
                        <p className={`text-sm font-black ${config.color}`}>{config.label} ({magnitud})</p>
                    </div>
                </div>

                {/* STEPPER INDICATOR */}
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${paso >= i ? 'bg-black' : 'bg-slate-300'}`} />
                    ))}
                </div>

                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-300/50 border border-slate-200 overflow-hidden">
                    <form onSubmit={submit} className="p-8 md:p-10">

                        {/* PASO 1: IDENTIFICACIÓN */}
                        {paso === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="text-black size-5" />
                                    <h2 className="text-lg font-bold text-black italic">1. Identificación del Riesgo</h2>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-black uppercase">Tipo de Riesgo</label>
                                    <input
                                        value={form.tipo_riesgo}
                                        onChange={e => setForm({ ...form, tipo_riesgo: e.target.value })}
                                        className="w-full border-b-2 border-slate-200 p-3 focus:border-black outline-none font-medium text-black transition-all"
                                    />
                                    <span className="text-red-600 text-[10px] font-bold">{errores.tipo_riesgo}</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-black uppercase">Descripción</label>
                                    <textarea
                                        value={form.descripcion}
                                        onChange={e => setForm({ ...form, descripcion: e.target.value })}
                                        rows={2}
                                        className="w-full border-b-2 border-slate-200 p-3 focus:border-black outline-none font-medium text-black transition-all resize-none"
                                    />
                                    <span className="text-red-600 text-[10px] font-bold">{errores.descripcion}</span>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-black uppercase">Responsables</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleResponsable("TODOS")}
                                            className={`p-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${form.responsables.includes("TODOS") ? 'border-black bg-black text-white' : 'border-slate-100 bg-slate-50 text-black'}`}
                                        >
                                            TODOS
                                        </button>
                                        {opcionesResponsables.map(opt => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => toggleResponsable(opt)}
                                                className={`p-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${form.responsables.includes(opt) ? 'border-black bg-black text-white' : 'border-slate-100 bg-slate-50 text-black'}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                    {errores.responsables && <p className="text-red-600 text-[10px] font-bold uppercase">{errores.responsables}</p>}
                                </div>
                            </div>
                        )}

                        {/* PASO 2: EVALUACIÓN */}
                        {paso === 2 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                                <div className="flex items-center gap-2">
                                    <BarChart4 className="text-black size-5" />
                                    <h2 className="text-lg font-bold text-black italic">2. Análisis Cuantitativo</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-[11px] font-black text-black uppercase tracking-widest">Probabilidad (1-4)</label>
                                            <span className="bg-black text-white text-xl px-4 py-1 rounded-lg font-black">{form.probabilidad}</span>
                                        </div>
                                        <input
                                            type="range" min="1" max="4" step="1"
                                            value={form.probabilidad}
                                            onChange={e => setForm({ ...form, probabilidad: parseInt(e.target.value) })}
                                            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
                                        />
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-[11px] font-black text-black uppercase tracking-widest">Impacto (1-4)</label>
                                            <span className="bg-black text-white text-xl px-4 py-1 rounded-lg font-black">{form.impacto}</span>
                                        </div>
                                        <input
                                            type="range" min="1" max="4" step="1"
                                            value={form.impacto}
                                            onChange={e => setForm({ ...form, impacto: parseInt(e.target.value) })}
                                            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PASO 3: MITIGACIÓN */}
                        {paso === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Target className="text-black size-5" />
                                    <h2 className="text-lg font-bold text-black italic">3. Plan de Mitigación</h2>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-black uppercase">Estrategia</label>
                                    <select
                                        value={form.estrategia}
                                        onChange={e => setForm({ ...form, estrategia: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-black text-black text-xs uppercase outline-none focus:border-black transition-all"
                                    >
                                        <option value="Mitigar">🛡️ Mitigar el riesgo</option>
                                        <option value="Evitar">🚫 Evitar la actividad</option>
                                        <option value="Transferir">🔄 Transferir a terceros</option>
                                        <option value="Aceptar">✅ Aceptar condición</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-black uppercase">Acción para Mitigar</label>
                                    <input
                                        value={form.accion_mitigacion}
                                        onChange={e => setForm({ ...form, accion_mitigacion: e.target.value })}
                                        className="w-full border-b-2 border-slate-200 p-3 focus:border-black outline-none font-medium text-black transition-all"
                                    />
                                    <span className="text-red-600 text-[10px] font-bold">{errores.accion_mitigacion}</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-black uppercase italic">Plan de Contingencia</label>
                                    <textarea
                                        value={form.plan_contingencia}
                                        onChange={e => setForm({ ...form, plan_contingencia: e.target.value })}
                                        rows={2}
                                        className="w-full bg-black/5 rounded-xl border-2 border-transparent p-4 focus:border-black outline-none font-medium text-black transition-all resize-none"
                                    />
                                    <span className="text-red-600 text-[10px] font-bold">{errores.plan_contingencia}</span>
                                </div>
                            </div>
                        )}

                        {/* NAVEGACIÓN */}
                        <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-100">
                            {paso > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setPaso(paso - 1)}
                                    className="flex items-center text-[11px] font-black text-slate-400 hover:text-black uppercase tracking-widest transition-colors"
                                >
                                    <ChevronLeft className="size-4 mr-1" /> Atrás
                                </button>
                            ) : (
                                <Link href={route("riesgos.index")} className="text-[11px] font-black text-slate-400 hover:text-red-600 uppercase tracking-widest transition-colors">Cancelar Edición</Link>
                            )}

                            {paso < 3 ? (
                                <Button
                                    type="button"
                                    onClick={siguiente}
                                    className="bg-black hover:bg-slate-800 text-white px-8 py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-2"
                                >
                                    Siguiente <ChevronRight className="size-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={submit}
                                    className="bg-black hover:bg-slate-800 text-white px-10 py-7 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-2"
                                >
                                    Guardar Cambios <CheckCircle2 className="size-5" />
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}