import React from "react";
import { Link } from "@inertiajs/react";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

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

    const fotoEmpresa = oferta.empresa?.usuario?.fotoPerfil?.url;

    const etiquetaTipo = esPractica
        ? "Práctica profesional"
        : "Oferta de empleo";

    const estilosTipo = esPractica
        ? {
            badge: "bg-green-100 text-green-700 border-green-200",
            barra: "bg-green-600",
            boton: "bg-green-600 group-hover:bg-green-700",
        }
        : {
            badge: "bg-blue-100 text-[#034991] border-[#034991]/30",
            barra: "bg-[#034991]",
            boton: "bg-[#034991] group-hover:bg-[#023a74]",
        };

console.log("Foto perfil:", oferta.empresa?.usuario?.fotoPerfil);

    return (
        <Link
            href={href ?? `/ofertas/${oferta.id_oferta}`}
            className="
        group relative block bg-white rounded-2xl
        border border-gray-200
        shadow-sm hover:shadow-xl
        hover:-translate-y-1
        transition-all duration-300
        overflow-hidden
      "
        >
            {/* Barra lateral identificadora */}
            <div className={`absolute left-0 top-0 h-full w-1.5 ${estilosTipo.barra}`} />

            {/* HEADER */}
            <div className="flex justify-between items-start px-5 pt-5">
                <span
                    className={`
            text-[10px] uppercase tracking-widest font-black
            px-3 py-1 rounded-full border
            ${estilosTipo.badge}
          `}
                >
                    {etiquetaTipo}
                </span>

                <span className="text-[11px] text-gray-400 font-medium">
                    Publicada:{" "}
                    {new Date(oferta.fecha_publicacion).toLocaleDateString("es-CR")}
                </span>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="flex gap-4 px-5 pt-4">
                {/* Logo empresa */}
                {oferta.empresa && (
                    <img
                        src={fotoEmpresa}
                        alt={oferta.empresa?.nombre}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm"
                    />
                )}

                <div className="flex-1">
                    <h2
                        className="
              text-lg font-black text-gray-900
              leading-tight line-clamp-2
              group-hover:text-[#CD1719]
              transition-colors
            "
                    >
                        {oferta.titulo}
                    </h2>

                    {oferta.empresa && (
                        <p className="text-sm font-semibold text-[#034991] mt-1">
                            {oferta.empresa.nombre}
                        </p>
                    )}
                </div>
            </div>

            <div className="h-px bg-gray-100 my-4 mx-5" />

            {/* FOOTER */}
            <div className="flex items-center justify-between px-5 pb-5">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-semibold">
                            {oferta.modalidad?.nombre ?? "Modalidad no definida"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-[#CD1719]">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-tight">
                            Límite:{" "}
                            {new Date(oferta.fecha_limite).toLocaleDateString("es-CR")}
                        </span>
                    </div>
                </div>

                {/* CTA visual */}
                <div
                    className={`
            p-2 rounded-xl text-white shadow-sm
            transition-all duration-300
            opacity-0 group-hover:opacity-100
            ${estilosTipo.boton}
          `}
                >
                    <ArrowRight className="w-5 h-5" />
                </div>
            </div>
        </Link>
    );
}
