import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import { Button } from "@/components/ui/button";
import OfertaDetalle from "@/components/ofertas/OfertaDetalle";
import { route } from "ziggy-js";
import {
    ChevronDown,
    Briefcase,
    FileText,
    MapPin,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Plus
} from "lucide-react";

/* =========================
    TIPOS
========================= */
interface FotoPerfil { url: string | null; }
interface Usuario { foto_perfil?: FotoPerfil | null; }
interface Empresa { id_empresa: number; nombre: string; usuario?: Usuario | null; }
interface SelectItem { id: number; nombre: string; id_pais?: number; id_provincia?: number; }

interface Props {
    empresa: Empresa | null;
    areasLaborales: SelectItem[];
    modalidades: SelectItem[];
    carreras: SelectItem[];
    paises: SelectItem[];
    provincias: SelectItem[];
    cantones: SelectItem[];
    userPermisos: number[];
}

type Paso = "general" | "descripcion" | "ubicacion" | "publicacion";
const pasos: Paso[] = ["general", "descripcion", "ubicacion", "publicacion"];

export default function CrearOferta({
    empresa,
    areasLaborales,
    modalidades,
    carreras,
    paises,
    provincias,
    cantones,
}: Props) {
    const [paso, setPaso] = useState<Paso>("general");
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [verPreview, setVerPreview] = useState(false);

    const [form, setForm] = useState({
        titulo: "",
        categoria: "",
        tipo_oferta: "",
        id_area_laboral: "",
        id_modalidad: "",
        descripcion: "",
        horario: "",
        id_carrera: "",
        fecha_limite: "",
        id_pais: "",
        id_provincia: "",
        id_canton: "",
        requisitos: [] as string[],
        nuevoRequisito: "",
        estado_id: "",
    });

    /* =========================
        ESTILOS REFINADOS (COLORES UNA)
    ========================= */
    const colorRojoUNA = "#CD1719";
    const colorAzulUNA = "#034991";

    const baseInput =
        "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 transition-all focus:ring-2 focus:ring-[#CD1719]/20 focus:border-[#CD1719] outline-none placeholder:text-gray-400";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
    const sectionTitle = "text-2xl font-bold text-gray-900 mb-1";

    /* =========================
        LÓGICA
    ========================= */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrores({ ...errores, [e.target.name]: "" });
    };

    const agregarRequisito = () => {
        if (!form.nuevoRequisito.trim()) return;
        setForm({
            ...form,
            requisitos: [...form.requisitos, form.nuevoRequisito],
            nuevoRequisito: "",
        });
    };

    const eliminarRequisito = (index: number) => {
        setForm({
            ...form,
            requisitos: form.requisitos.filter((_, i) => i !== index),
        });
    };

    const validarPaso = (): boolean => {
        const e: Record<string, string> = {};
        if (paso === "general") {
            if (!form.titulo) e.titulo = "Campo obligatorio";
            if (!form.categoria) e.categoria = "Campo obligatorio";
            if (!form.tipo_oferta) e.tipo_oferta = "Seleccione una opción";
            if (!form.id_area_laboral) e.id_area_laboral = "Seleccione un área";
            if (!form.id_modalidad) e.id_modalidad = "Seleccione una modalidad";
        }
        if (paso === "descripcion") {
            if (!form.descripcion) e.descripcion = "Campo obligatorio";
            if (!form.horario) e.horario = "Campo obligatorio";
        }
        if (paso === "ubicacion") {
            if (!form.id_pais) e.id_pais = "Seleccione un país";
            if (!form.id_provincia) e.id_provincia = "Seleccione una provincia";
            if (!form.id_canton) e.id_canton = "Seleccione un cantón";
            if (!form.id_carrera) e.id_carrera = "Seleccione una carrera";
        }
        if (paso === "publicacion") {
            if (!form.fecha_limite) e.fecha_limite = "Campo obligatorio";
            if (!form.estado_id) e.estado_id = "Seleccione un estado";
        }
        setErrores(e);
        return Object.keys(e).length === 0;
    };

    const siguiente = () => { if (validarPaso()) setPaso(pasos[pasos.indexOf(paso) + 1]); };
    const anterior = () => { setPaso(pasos[pasos.indexOf(paso) - 1]); };

    const submit = () => {
        if (!validarPaso()) return;
        router.post(route("empresa.ofertas.guardar"), {
            ...form,
            id_area_laboral: Number(form.id_area_laboral),
            id_modalidad: Number(form.id_modalidad),
            id_carrera: Number(form.id_carrera),
            id_pais: Number(form.id_pais),
            id_provincia: Number(form.id_provincia),
            id_canton: Number(form.id_canton),
            estado_id: Number(form.estado_id),
            requisitos: form.requisitos,
        });
    };

    return (
        <>
            <Head title="Crear oferta laboral" />

            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="grid grid-cols-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[700px]">

                    {/* SIDEBAR */}
                    <aside className="col-span-12 md:col-span-3 bg-gray-50/50 border-r border-gray-100 p-8">
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="relative p-1 bg-white rounded-full shadow-md mb-4">
                                <img
                                    src={empresa?.usuario?.foto_perfil?.url ?? FotoXDefecto}
                                    onError={(e) => (e.currentTarget.src = FotoXDefecto)}
                                    className="w-24 h-24 rounded-full object-cover border-2 border-white"
                                    alt="Logo Empresa"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                {empresa?.nombre || "Cargando empresa..."}
                            </h3>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Empresa Reclutadora</span>
                        </div>

                        <nav className="space-y-1">
                            {pasos.map((p) => {
                                const active = paso === p;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPaso(p)}
                                        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all group ${active
                                                ? "bg-red-50 text-[#CD1719] shadow-sm"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                            }`}
                                    >
                                        <div className={`mr-3 transition-colors ${active ? "text-[#CD1719]" : "text-gray-400 group-hover:text-gray-600"}`}>
                                            {p === "general" && <Briefcase className="w-5 h-5" />}
                                            {p === "descripcion" && <FileText className="w-5 h-5" />}
                                            {p === "ubicacion" && <MapPin className="w-5 h-5" />}
                                            {p === "publicacion" && <Calendar className="w-5 h-5" />}
                                        </div>
                                        <span className="capitalize">{p.replace('descripcion', 'descripción').replace('ubicacion', 'ubicación').replace('publicacion', 'publicación')}</span>
                                        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#CD1719]"></div>}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* FORMULARIO */}
                    <section className="col-span-12 md:col-span-9 p-8 md:p-12 flex flex-col">
                        <div className="flex-grow space-y-8">

                            {paso === "general" && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className={sectionTitle}>Información general</h2>
                                    <p className="text-gray-500 text-sm mb-8">Define los aspectos básicos de tu vacante.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Título de la oferta <span className="text-[#CD1719]">*</span></label>
                                            <input
                                                name="titulo"
                                                placeholder="Ej: Desarrollador Frontend Junior"
                                                className={`${baseInput} ${errores.titulo ? "border-[#CD1719] ring-red-100" : ""}`}
                                                value={form.titulo}
                                                onChange={handleChange}
                                            />
                                            {errores.titulo && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{errores.titulo}</p>}
                                        </div>

                                        <div>
                                            <label className={labelClass}>Categoría <span className="text-[#CD1719]">*</span></label>
                                            <input
                                                name="categoria"
                                                placeholder="Ej: Tecnología / Informática"
                                                className={`${baseInput} ${errores.categoria ? "border-[#CD1719] ring-red-100" : ""}`}
                                                value={form.categoria}
                                                onChange={handleChange}
                                            />
                                            {errores.categoria && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{errores.categoria}</p>}
                                        </div>

                                        <div>
                                            <label className={labelClass}>Tipo de oferta <span className="text-[#CD1719]">*</span></label>
                                            <select
                                                name="tipo_oferta"
                                                className={`${baseInput} ${errores.tipo_oferta ? "border-[#CD1719] ring-red-100" : ""}`}
                                                value={form.tipo_oferta}
                                                onChange={handleChange}
                                            >
                                                <option value="">Seleccione una opción</option>
                                                <option value="Tiempo completo">Tiempo completo</option>
                                                <option value="Medio tiempo">Medio tiempo</option>
                                                <option value="Práctica">Práctica</option>
                                            </select>
                                            {errores.tipo_oferta && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{errores.tipo_oferta}</p>}
                                        </div>

                                        <div>
                                            <label className={labelClass}>Área laboral <span className="text-[#CD1719]">*</span></label>
                                            <select
                                                name="id_area_laboral"
                                                className={`${baseInput} ${errores.id_area_laboral ? "border-[#CD1719] ring-red-100" : ""}`}
                                                value={form.id_area_laboral}
                                                onChange={handleChange}
                                            >
                                                <option value="">Seleccione un área</option>
                                                {areasLaborales.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                                            </select>
                                            {errores.id_area_laboral && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{errores.id_area_laboral}</p>}
                                        </div>

                                        <div>
                                            <label className={labelClass}>Modalidad <span className="text-[#CD1719]">*</span></label>
                                            <select
                                                name="id_modalidad"
                                                className={`${baseInput} ${errores.id_modalidad ? "border-[#CD1719] ring-red-100" : ""}`}
                                                value={form.id_modalidad}
                                                onChange={handleChange}
                                            >
                                                <option value="">Seleccione una modalidad</option>
                                                {modalidades.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                            </select>
                                            {errores.id_modalidad && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{errores.id_modalidad}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paso === "descripcion" && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                                    <div>
                                        <h2 className={sectionTitle}>Descripción y requisitos</h2>
                                        <p className="text-gray-500 text-sm mb-6">Detalla qué buscas y qué ofreces.</p>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Descripción del puesto <span className="text-[#CD1719]">*</span></label>
                                        <textarea
                                            name="descripcion"
                                            placeholder="Describa las responsabilidades y funciones del puesto"
                                            rows={6}
                                            className={`${baseInput} ${errores.descripcion ? "border-[#CD1719] ring-red-100" : ""}`}
                                            value={form.descripcion}
                                            onChange={handleChange}
                                        />
                                        {errores.descripcion && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{errores.descripcion}</p>}
                                    </div>

                                    <div>
                                        <label className={labelClass}>Requisitos del puesto</label>
                                        <div className="flex gap-2">
                                            <input
                                                name="nuevoRequisito"
                                                placeholder="Ej: Conocimiento en React"
                                                className={baseInput}
                                                value={form.nuevoRequisito}
                                                onChange={handleChange}
                                                onKeyPress={(e) => e.key === 'Enter' && agregarRequisito()}
                                            />
                                            <Button type="button" onClick={agregarRequisito} style={{ backgroundColor: colorAzulUNA }} className="hover:opacity-90 shrink-0">
                                                <Plus className="w-4 h-4 mr-1" /> Agregar
                                            </Button>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 gap-2">
                                            {form.requisitos.map((req, index) => (
                                                <div key={`req-${index}`} className="flex justify-between items-center bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl group hover:bg-white hover:border-[#CD1719]/30 transition-all">
                                                    <span className="text-sm text-gray-700">{req}</span>
                                                    <button type="button" onClick={() => eliminarRequisito(index)} className="text-gray-400 hover:text-[#CD1719] text-xs font-semibold px-2 py-1">
                                                        Eliminar
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Horario <span className="text-[#CD1719]">*</span></label>
                                        <input
                                            name="horario"
                                            placeholder="Ej: Lunes a Viernes, 8:00 AM - 5:00 PM"
                                            className={`${baseInput} ${errores.horario ? "border-[#CD1719] ring-red-100" : ""}`}
                                            value={form.horario}
                                            onChange={handleChange}
                                        />
                                        {errores.horario && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{errores.horario}</p>}
                                    </div>
                                </div>
                            )}

                            {paso === "ubicacion" && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                                    <h2 className={sectionTitle}>Ubicación y Carrera</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass}>País <span className="text-[#CD1719]">*</span></label>
                                            <select name="id_pais" className={baseInput} value={form.id_pais} onChange={handleChange}>
                                                <option value="">Seleccione un país</option>
                                                {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                            </select>
                                            {errores.id_pais && <p className="text-xs text-[#CD1719] mt-1.5">{errores.id_pais}</p>}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Provincia <span className="text-[#CD1719]">*</span></label>
                                            <select name="id_provincia" className={baseInput} value={form.id_provincia} onChange={handleChange}>
                                                <option value="">Seleccione una provincia</option>
                                                {provincias.filter(p => p.id_pais === Number(form.id_pais)).map(p => (
                                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                                ))}
                                            </select>
                                            {errores.id_provincia && <p className="text-xs text-[#CD1719] mt-1.5">{errores.id_provincia}</p>}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Cantón <span className="text-[#CD1719]">*</span></label>
                                            <select name="id_canton" className={baseInput} value={form.id_canton} onChange={handleChange}>
                                                <option value="">Seleccione un cantón</option>
                                                {cantones.filter(c => c.id_provincia === Number(form.id_provincia)).map(c => (
                                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                                ))}
                                            </select>
                                            {errores.id_canton && <p className="text-xs text-[#CD1719] mt-1.5">{errores.id_canton}</p>}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Carrera asociada <span className="text-[#CD1719]">*</span></label>
                                            <select name="id_carrera" className={baseInput} value={form.id_carrera} onChange={handleChange}>
                                                <option value="">Seleccione una carrera</option>
                                                {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                            </select>
                                            {errores.id_carrera && <p className="text-xs text-[#CD1719] mt-1.5">{errores.id_carrera}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paso === "publicacion" && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                                    <h2 className={sectionTitle}>Publicación</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass}>Fecha límite <span className="text-[#CD1719]">*</span></label>
                                            <input type="date" name="fecha_limite" className={baseInput} value={form.fecha_limite} onChange={handleChange} />
                                            {errores.fecha_limite && <p className="text-xs text-[#CD1719] mt-1.5">{errores.fecha_limite}</p>}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Estado de la publicación <span className="text-[#CD1719]">*</span></label>
                                            <select name="estado_id" className={baseInput} value={form.estado_id} onChange={handleChange}>
                                                <option value="" disabled>Seleccione el estado</option>
                                                <option value="1">Publicar inmediatamente</option>
                                                <option value="2">Guardar como borrador</option>
                                            </select>
                                            {errores.estado_id && <p className="text-xs text-[#CD1719] mt-1.5">{errores.estado_id}</p>}
                                        </div>
                                    </div>

                                    {/* ... dentro de paso === "publicacion" */}
                                    <div className="pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full border-dashed border-2 py-6 hover:bg-gray-50 transition-colors"
                                            onClick={() => setVerPreview(!verPreview)}
                                        >
                                            {verPreview ? "Ocultar vista previa del diseño" : "Ver vista previa del diseño"}
                                        </Button>

                                        {verPreview && (
                                            <div className="mt-8 animate-in fade-in zoom-in-95 duration-500">
                                                <div className="flex flex-col items-center text-gray-400 mb-4">
                                                    <ChevronDown className="w-5 h-5 animate-bounce" />
                                                    <span className="text-[10px] uppercase font-bold tracking-widest">Vista Previa</span>
                                                </div>

                                                {/* CONTENEDOR CORREGIDO: w-full y overflow-hidden son clave */}
                                                <div className="w-full overflow-x-hidden rounded-2xl border-2 border-gray-100 bg-gray-50 p-1 md:p-4">
                                                    <div className="max-w-full">
                                                        <OfertaDetalle
                                                            modo="preview"
                                                            oferta={{
                                                                titulo: form.titulo || "Título de la oferta",
                                                                categoria: form.categoria,
                                                                descripcion: form.descripcion || "Sin descripción",
                                                                horario: form.horario,
                                                                tipo_oferta: form.tipo_oferta,
                                                                requisitos: form.requisitos,
                                                                empresa: {
                                                                    nombre: empresa?.nombre,
                                                                    logo_url: empresa?.usuario?.foto_perfil?.url,
                                                                },
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* BOTONES DE NAVEGACIÓN */}
                        <div className="flex justify-between items-center pt-10 mt-8 border-t border-gray-100">
                            {paso !== "general" ? (
                                <Button variant="ghost" onClick={anterior} className="text-gray-600">
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Anterior
                                </Button>
                            ) : (
                                <div></div>
                            )}

                            {paso !== "publicacion" ? (
                                <Button
                                    onClick={siguiente}
                                    style={{ backgroundColor: colorAzulUNA }}
                                    className="hover:opacity-90 px-8 text-white"
                                >
                                    Siguiente <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={submit}
                                    style={{ backgroundColor: colorRojoUNA }}
                                    className="hover:opacity-90 px-8 shadow-lg shadow-red-200 text-white"
                                >
                                    Crear oferta laboral
                                </Button>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

CrearOferta.layout = (page: any) => (
    <PpLayout userPermisos={page.props.userPermisos}>
        {page}
    </PpLayout>
);