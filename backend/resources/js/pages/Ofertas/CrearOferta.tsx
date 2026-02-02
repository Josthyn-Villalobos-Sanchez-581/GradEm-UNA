import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import { Button } from "@/components/ui/button";
import OfertaDetalle from "@/components/ofertas/OfertaDetalle";
import { route } from "ziggy-js";
import { ChevronDown } from "lucide-react";
import {
    Briefcase,
    FileText,
    MapPin,
    Calendar,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";

/* =========================
   TIPOS
========================= */

interface FotoPerfil {
    url: string | null;
}

interface Usuario {
    foto_perfil?: FotoPerfil | null;
}

interface Empresa {
    id_empresa: number;
    nombre: string;
    usuario?: Usuario | null;
}

interface SelectItem {
    id: number;
    nombre: string;
    id_pais?: number;
    id_provincia?: number;
}

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

/* =========================
   COMPONENTE
========================= */

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
       ESTILOS
    ========================= */

    const baseInput =
        "w-full rounded-lg border border-gray-300 px-3 py-2 text-black placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500";

    const labelClass = "text-sm font-medium text-black";
    const sectionTitle = "text-xl font-semibold text-black";

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrores({ ...errores, [e.target.name]: "" });
    };

    /* =========================
       REQUISITOS
    ========================= */

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

    /* =========================
       VALIDACIÓN
    ========================= */

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

    /* =========================
       NAVEGACIÓN
    ========================= */

    const siguiente = () => {
        if (!validarPaso()) return;
        setPaso(pasos[pasos.indexOf(paso) + 1]);
    };

    const anterior = () => {
        setPaso(pasos[pasos.indexOf(paso) - 1]);
    };

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

    const [verPreview, setVerPreview] = useState(false);

    /* =========================
       RENDER
    ========================= */

    return (
        <>
            <Head title="Crear oferta laboral" />

            <div className="px-6">
                <div className="grid grid-cols-12 bg-white rounded-xl shadow-xl p-6 gap-6">

                    {/* SIDEBAR */}
                    <aside className="col-span-3 border-r pr-4">
                        <div className="flex flex-col items-center mb-6">
                            <img
                                src={empresa?.usuario?.foto_perfil?.url ?? FotoXDefecto}
                                onError={(e) => (e.currentTarget.src = FotoXDefecto)}
                                className="w-24 h-24 rounded-full object-cover"
                            />
                            <p className="mt-2 font-semibold text-black">
                                {empresa?.nombre}
                            </p>
                        </div>

                        <nav className="space-y-3 text-sm">
                            {pasos.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPaso(p)}
                                    className={`flex items-center w-full text-left ${paso === p ? "text-red-600 font-semibold" : "text-black"
                                        }`}
                                >
                                    {p === "general" && <Briefcase className="w-4 mr-2" />}
                                    {p === "descripcion" && <FileText className="w-4 mr-2" />}
                                    {p === "ubicacion" && <MapPin className="w-4 mr-2" />}
                                    {p === "publicacion" && <Calendar className="w-4 mr-2" />}
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* FORMULARIO */}
                    <section className="col-span-9 space-y-6">

                        {paso === "general" && (
                            <>
                                <h2 className={sectionTitle}>Información general</h2>

                                <div>
                                    <label className={labelClass}>
                                        Título de la oferta <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        name="titulo"
                                        placeholder="Ej: Desarrollador Frontend Junior"
                                        className={`${baseInput} ${errores.titulo ? "border-red-500" : ""}`}
                                        value={form.titulo}
                                        onChange={handleChange}
                                    />
                                    {errores.titulo && <p className="text-sm text-red-600 mt-1">{errores.titulo}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Categoría <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        name="categoria"
                                        placeholder="Ej: Tecnología / Informática"
                                        className={`${baseInput} ${errores.categoria ? "border-red-500" : ""}`}
                                        value={form.categoria}
                                        onChange={handleChange}
                                    />
                                    {errores.categoria && <p className="text-sm text-red-600 mt-1">{errores.categoria}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Tipo de oferta <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        name="tipo_oferta"
                                        className={`${baseInput} ${errores.tipo_oferta ? "border-red-500" : ""}`}
                                        value={form.tipo_oferta}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione una opción</option>
                                        <option value="Tiempo completo">Tiempo completo</option>
                                        <option value="Medio tiempo">Medio tiempo</option>
                                        <option value="Práctica">Práctica</option>
                                    </select>
                                    {errores.tipo_oferta && <p className="text-sm text-red-600 mt-1">{errores.tipo_oferta}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Área laboral <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        name="id_area_laboral"
                                        className={`${baseInput} ${errores.id_area_laboral ? "border-red-500" : ""}`}
                                        value={form.id_area_laboral}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione un área</option>
                                        {areasLaborales.map(a => (
                                            <option key={a.id} value={a.id}>{a.nombre}</option>
                                        ))}
                                    </select>
                                    {errores.id_area_laboral && <p className="text-sm text-red-600 mt-1">{errores.id_area_laboral}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Modalidad <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        name="id_modalidad"
                                        className={`${baseInput} ${errores.id_modalidad ? "border-red-500" : ""}`}
                                        value={form.id_modalidad}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione una modalidad</option>
                                        {modalidades.map(m => (
                                            <option key={m.id} value={m.id}>{m.nombre}</option>
                                        ))}
                                    </select>
                                    {errores.id_modalidad && <p className="text-sm text-red-600 mt-1">{errores.id_modalidad}</p>}
                                </div>
                            </>
                        )}

                        {paso === "descripcion" && (
                            <>
                                <h2 className={sectionTitle}>Descripción y requisitos</h2>

                                {/* DESCRIPCIÓN */}
                                <div>
                                    <label className={labelClass}>
                                        Descripción del puesto <span className="text-red-600">*</span>
                                    </label>
                                    <textarea
                                        name="descripcion"
                                        placeholder="Describa las responsabilidades y funciones del puesto"
                                        rows={4}
                                        className={`${baseInput} ${errores.descripcion ? "border-red-500" : ""}`}
                                        value={form.descripcion}
                                        onChange={handleChange}
                                    />
                                    {errores.descripcion && (
                                        <p className="text-sm text-red-600 mt-1">{errores.descripcion}</p>
                                    )}
                                </div>

                                {/* REQUISITOS */}
                                <div>
                                    <label className={labelClass}>
                                        Requisitos del puesto
                                    </label>

                                    <div className="flex gap-2">
                                        <input
                                            name="nuevoRequisito"
                                            placeholder="Ej: Conocimiento en React"
                                            className={baseInput}
                                            value={form.nuevoRequisito}
                                            onChange={handleChange}
                                        />
                                        <Button type="button" onClick={agregarRequisito}>
                                            Agregar
                                        </Button>
                                    </div>

                                    {/* LISTA */}
                                    <ul className="mt-3 space-y-2">
                                        {form.requisitos.map((req, index) => (
                                            <li
                                                key={index}
                                                className="flex justify-between items-center bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-red-400 transition"
                                            >
                                                <span className="text-gray-800">{req}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarRequisito(index)}
                                                    className="text-red-600 text-sm"
                                                >
                                                    Eliminar
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* HORARIO */}
                                <div>
                                    <label className={labelClass}>
                                        Horario <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        name="horario"
                                        placeholder="Ej: Lunes a Viernes, 8:00 AM - 5:00 PM"
                                        className={`${baseInput} ${errores.horario ? "border-red-500" : ""}`}
                                        value={form.horario}
                                        onChange={handleChange}
                                    />
                                    {errores.horario && (
                                        <p className="text-sm text-red-600 mt-1">{errores.horario}</p>
                                    )}
                                </div>
                            </>
                        )}


                        {paso === "ubicacion" && (
                            <>
                                <h2 className={sectionTitle}>Ubicación</h2>

                                <div>
                                    <label className={labelClass}>País <span className="text-red-600">*</span></label>
                                    <select
                                        name="id_pais"
                                        className={`${baseInput} ${errores.id_pais ? "border-red-500" : ""}`}
                                        value={form.id_pais}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione un país</option>
                                        {paises.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                    {errores.id_pais && <p className="text-sm text-red-600 mt-1">{errores.id_pais}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Provincia <span className="text-red-600">*</span></label>
                                    <select
                                        name="id_provincia"
                                        className={`${baseInput} ${errores.id_provincia ? "border-red-500" : ""}`}
                                        value={form.id_provincia}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione una provincia</option>
                                        {provincias.filter(p => p.id_pais === Number(form.id_pais)).map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                    {errores.id_provincia && <p className="text-sm text-red-600 mt-1">{errores.id_provincia}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Cantón <span className="text-red-600">*</span></label>
                                    <select
                                        name="id_canton"
                                        className={`${baseInput} ${errores.id_canton ? "border-red-500" : ""}`}
                                        value={form.id_canton}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione un cantón</option>
                                        {cantones.filter(c => c.id_provincia === Number(form.id_provincia)).map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                    {errores.id_canton && <p className="text-sm text-red-600 mt-1">{errores.id_canton}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Carrera asociada <span className="text-red-600">*</span></label>
                                    <select
                                        name="id_carrera"
                                        className={`${baseInput} ${errores.id_carrera ? "border-red-500" : ""}`}
                                        value={form.id_carrera}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione una carrera</option>
                                        {carreras.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                    {errores.id_carrera && <p className="text-sm text-red-600 mt-1">{errores.id_carrera}</p>}
                                </div>
                            </>
                        )}

                        {paso === "publicacion" && (
                            <>
                                <h2 className={sectionTitle}>Publicación</h2>

                                <div>
                                    <label className={labelClass}>Fecha límite <span className="text-red-600">*</span></label>
                                    <input
                                        type="date"
                                        name="fecha_limite"
                                        className={`${baseInput} ${errores.fecha_limite ? "border-red-500" : ""}`}
                                        value={form.fecha_limite}
                                        onChange={handleChange}
                                    />
                                    {errores.fecha_limite && <p className="text-sm text-red-600 mt-1">{errores.fecha_limite}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Estado de la publicación <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        name="estado_id"
                                        className={`${baseInput} ${errores.estado_id ? "border-red-500" : ""}`}
                                        value={form.estado_id}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled>
                                            Seleccione el estado de la publicación
                                        </option>
                                        <option value="1">Publicar inmediatamente</option>
                                        <option value="2">Guardar como borrador</option>
                                    </select>
                                    {errores.estado_id && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errores.estado_id}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setVerPreview(!verPreview)}
                                >
                                    {verPreview ? "Ocultar previsualización" : "Ver previsualización"}
                                </Button>

                                {verPreview && (
                                    <div className="flex flex-col items-center my-6 animate-bounce text-gray-500">
                                        <ChevronDown className="w-6 h-6" />
                                        <span className="text-sm">Desplázate hacia abajo para continuar</span>
                                    </div>
                                )}

                                {verPreview && (
                                    <div className="mt-6">
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
                                )}


                            </>
                        )}

                        {/* BOTONES DE NAVEGACIÓN */}
                        <div className="flex justify-between pt-6">
                            {paso !== "general" && (
                                <Button variant="outline" onClick={anterior}>
                                    <ChevronLeft className="w-4 mr-1" />
                                    Anterior
                                </Button>
                            )}

                            {paso !== "publicacion" ? (
                                <Button onClick={siguiente}>
                                    Siguiente
                                    <ChevronRight className="w-4 ml-1" />
                                </Button>
                            ) : (
                                <Button onClick={submit}>
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

/* =========================
   LAYOUT
========================= */

(CrearOferta as any).layout = (page: any) => (
    <PpLayout userPermisos={page.props.userPermisos}>
        {page}
    </PpLayout>
);
