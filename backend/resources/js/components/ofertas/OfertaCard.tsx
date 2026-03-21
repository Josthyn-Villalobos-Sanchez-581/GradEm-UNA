import React from "react";
import { Link } from "@inertiajs/react";
import { MapPin, Calendar, ArrowRight, Briefcase, GraduationCap } from "lucide-react";
import FotoXDefecto from "@/assets/FotoXDefecto.png";

/* =======================
    INTERFACES
======================= */
interface FotoPerfil {
    url: string;
}

interface UsuarioEmpresa {
    nombre_completo?: string;
    fotoPerfil?: FotoPerfil | null;
}

interface Empresa {
    nombre: string;
    usuario?: UsuarioEmpresa | null;
}

interface Modalidad {
    nombre: string;
}

interface Oferta {
    id_oferta: number;
    titulo: string;
    tipo_oferta: string;
    fecha_publicacion: string;
    fecha_limite: string;
    modalidad?: Modalidad;
    empresa?: Empresa;
}

interface Props {
    oferta: Oferta;
    href?: string;
}

/* =======================
    COMPONENTE
======================= */
export default function OfertaCard({ oferta, href }: Props) {

    const esPractica = oferta.tipo_oferta === "practica";
    const fotoEmpresa = oferta.empresa?.usuario?.fotoPerfil?.url || FotoXDefecto;

    const etiquetaTipo = esPractica
        ? "Práctica Profesional"
        : "Oferta Laboral";

    const config = esPractica
        ? {
            bgBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
            icon: <GraduationCap className="w-3.5 h-3.5" />,
            accent: "bg-emerald-500",
            shadowHover: "hover:shadow-emerald-900/10",
            textPrimary: "text-emerald-900",
            buttonBg: "bg-emerald-600",
            bgIcon: "bg-emerald-50"
        }
        : {
            bgBadge: "bg-blue-50 text-[#034991] border-blue-100",
            icon: <Briefcase className="w-3.5 h-3.5" />,
            accent: "bg-[#034991]",
            shadowHover: "hover:shadow-blue-900/10",
            textPrimary: "text-[#034991]",
            buttonBg: "bg-[#034991]",
            bgIcon: "bg-blue-50"
        };

    return (
        <Link
            href={href ?? `/ofertas/${oferta.id_oferta}`}
            className={`
            group relative block bg-white rounded-[2rem] border border-gray-100
            shadow-sm hover:shadow-2xl ${config.shadowHover}
            hover:-translate-y-2 transition-all duration-500 overflow-hidden
            min-h-[260px]
        `}
        >

            {/* Barra superior */}
            <div className={`absolute top-0 left-0 w-full h-1.5 ${config.accent} opacity-90`} />

            <div className="p-5 sm:p-6 md:p-7">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-5">

                    <span className={`
                        flex items-center gap-2 text-[10px] font-black uppercase
                        tracking-[0.15em] px-3 sm:px-4 py-1.5 rounded-full border
                        ${config.bgBadge}
                    `}>
                        {config.icon}
                        {etiquetaTipo}
                    </span>

                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 px-3 py-1 rounded-lg">
                        {new Date(oferta.fecha_publicacion).toLocaleDateString("es-CR", {
                            day: '2-digit',
                            month: 'short'
                        })}
                    </span>

                </div>

                {/* CONTENIDO */}
                <div className="flex gap-3 sm:gap-4 md:gap-5">

                    {/* LOGO */}
                    <div className="shrink-0 relative">

                        <div className={`
                            absolute inset-0 
                            ${esPractica ? "bg-emerald-500/10" : "bg-blue-500/10"}
                            rounded-full blur-md group-hover:blur-xl transition-all duration-500
                        `} />

                        <div className="
                            relative
                            w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
                            rounded-full overflow-hidden border-2 border-white
                            shadow-md bg-white
                            transition-transform duration-500
                            group-hover:scale-110
                        ">
                            <img
                                src={fotoEmpresa}
                                onError={(e) => (e.currentTarget.src = FotoXDefecto)}
                                alt={oferta.empresa?.nombre}
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>

                    </div>

                    {/* TITULO */}
                    <div className="flex-1 space-y-1">

                        <h2 className={`
                            text-base sm:text-lg md:text-xl
                            font-black ${config.textPrimary}
                            leading-[1.1]
                            uppercase italic tracking-tight
                            line-clamp-2
                            group-hover:text-[#CD1719]
                            transition-colors duration-300
                        `}>
                            {oferta.titulo}
                        </h2>

                        {oferta.empresa && (
                            <p className="text-sm font-bold text-gray-500 flex items-center gap-1.5 line-clamp-1">
                                <span className="w-4 h-[1px] bg-gray-300" />
                                {oferta.empresa.nombre}
                            </p>
                        )}

                    </div>
                </div>

                {/* DIVIDER */}
                <div className="my-5 h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />

                {/* FOOTER */}
                <div className="flex items-center justify-between gap-4">

                    <div className="space-y-3">

                        {/* Modalidad */}
                        <div className={`
                            flex items-center gap-2 text-gray-500
                            ${config.bgIcon}
                            w-fit px-3 py-1 rounded-lg
                            border border-gray-100/50
                        `}>

                            <MapPin className={`
                                w-3.5 h-3.5
                                ${esPractica ? 'text-emerald-600' : 'text-[#034991]'}
                            `} />

                            <span className="text-[11px] font-black uppercase tracking-tighter">
                                {oferta.modalidad?.nombre ?? "Presencial"}
                            </span>

                        </div>

                        {/* Fecha límite */}
                        <div className="flex items-center gap-2.5">

                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-50">
                                <Calendar className="w-3.5 h-3.5 text-[#CD1719]" />
                            </div>

                            <div className="leading-none">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em]">
                                    Límite para aplicar
                                </p>

                                <p className="text-xs font-black text-gray-800 uppercase">
                                    {new Date(oferta.fecha_limite).toLocaleDateString("es-CR", {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* BOTON */}
                    <div className={`
                        flex items-center gap-2
                        ${esPractica ? 'text-emerald-700' : 'text-[#034991]'}
                        font-black text-[10px] tracking-widest
                        group-hover:text-[#CD1719]
                        transition-colors
                    `}>

                        <span className="
                            hidden sm:inline
                            opacity-0 group-hover:opacity-100
                            -translate-x-2 group-hover:translate-x-0
                            transition-all duration-500
                        ">
                            VER DETALLE
                        </span>

                        <div className={`
                            flex items-center justify-center
                            w-10 sm:w-11 md:w-12
                            aspect-square shrink-0
                            rounded-full
                            ${config.buttonBg}
                            group-hover:bg-[#CD1719]
                            text-white shadow-lg
                            transition-all duration-300
                        `}>
                            <ArrowRight className="w-5 h-5" />
                        </div>

                    </div>

                </div>

            </div>

            {/* Decoración hover */}
            <div className={`
                absolute -bottom-12 -right-12
                w-24 h-24 rounded-full blur-2xl
                opacity-0 group-hover:opacity-100
                transition-all duration-700
                ${esPractica ? 'bg-emerald-500/10' : 'bg-[#034991]/10'}
            `} />

        </Link>
    );
}

