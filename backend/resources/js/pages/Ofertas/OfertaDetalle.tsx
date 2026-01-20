import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";

interface Empresa {
    id_empresa: number;
    nombre: string;
    correo: string | null;
    telefono: string | null;
    persona_contacto: string | null;
    // Campos posibles para la foto / logo de la empresa
    logo_url?: string | null;
    foto_perfil?: string | null;
}

interface Pais {
    id: number;
    nombre: string;
}

interface Provincia {
    id: number;
    nombre: string;
}

interface Canton {
    id: number;
    nombre: string;
}

interface Modalidad {
    id: number;
    nombre: string;
}

interface AreaLaboral {
    id: number;
    nombre: string;
}

interface OfertaDetalle {
    id_oferta: number;
    titulo: string;
    descripcion: string;
    requisitos: string;
    tipo_oferta: string;
    categoria: string;
    horario: string;
    fecha_limite: string;
    fecha_publicacion: string;
    empresa?: Empresa;
    pais?: Pais;
    provincia?: Provincia;
    canton?: Canton;
    modalidad?: Modalidad;
    area_laboral?: AreaLaboral;
}

interface PropsDetalle {
    oferta: OfertaDetalle;
    userPermisos: number[];
    yaPostulado?: boolean;
}

const OfertaDetallePagina: React.FC<PropsDetalle> = ({
    oferta,
    userPermisos,
    yaPostulado = false,
}) => {
    const modal = useModal();
    const [mensaje, setMensaje] = useState("");
    const [enviando, setEnviando] = useState(false);

    const tienePermiso = (idPermiso: number) =>
        Array.isArray(userPermisos) && userPermisos.includes(idPermiso);

    const etiquetaTipo =
        oferta.tipo_oferta === "empleo"
            ? "Empleo"
            : oferta.tipo_oferta === "practica"
            ? "Práctica profesional"
            : oferta.tipo_oferta;

    const claseChipTipo =
        oferta.tipo_oferta === "empleo"
            ? "bg-[#034991]/10 text-[#034991]"
            : oferta.tipo_oferta === "practica"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700";

    const ubicacionTexto = oferta.pais
        ? `${oferta.pais.nombre}${
              oferta.provincia ? `, ${oferta.provincia.nombre}` : ""
          }${oferta.canton ? `, ${oferta.canton.nombre}` : ""}`
        : "No especificada";

    // Foto / logo de la empresa (ajusta el campo si en BD se llama distinto)
    const empresaLogo =
        oferta.empresa?.logo_url ??
        oferta.empresa?.foto_perfil ??
        null;

    const manejarPostulacion = async () => {
        if (!tienePermiso(6)) {
            modal.alerta({
                titulo: "Acceso restringido",
                mensaje:
                    "No cuenta con permisos para postularse a ofertas laborales. Consulte con el administrador.",
            });
            return;
        }

        if (yaPostulado) {
            modal.alerta({
                titulo: "Ya está postulado",
                mensaje: "Ya se registró una postulación para esta oferta.",
            });
            return;
        }

        const confirmado = await modal.confirmacion({
            titulo: "Confirmar postulación",
            mensaje:
                "¿Desea enviar su postulación a esta oferta? Se utilizará la información de su perfil y currículum.",
        });

        if (!confirmado) return;

        setEnviando(true);

        Inertia.post(
            `/ofertas/${oferta.id_oferta}/postular`,
            { mensaje },
            {
                onFinish: () => setEnviando(false),
                onSuccess: () =>
                    modal.alerta({
                        titulo: "Postulación enviada",
                        mensaje: "Su postulación se ha enviado correctamente.",
                    }),
                onError: () =>
                    modal.alerta({
                        titulo: "Error",
                        mensaje: "Ocurrió un error al enviar la postulación.",
                    }),
            }
        );
    };

    return (
        <>
            <Head title={`Oferta - ${oferta.titulo}`} />
            <div
                className="max-w-5xl mx-auto px-6 py-6 text-[#000000]"
                style={{ fontFamily: "Open Sans, sans-serif" }}
            >
                <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 space-y-6">
                    {/* ENCABEZADO */}
                    <header className="border-b pb-4 mb-2 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        {/* Información principal de la oferta */}
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-2 items-center mb-3">
                                <span
                                    className={`text-xs font-semibold px-2 py-1 rounded-full ${claseChipTipo}`}
                                >
                                    {etiquetaTipo}
                                </span>

                                {oferta.modalidad && (
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                        {oferta.modalidad.nombre}
                                    </span>
                                )}

                                {oferta.area_laboral && (
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#F9D2D6] text-[#790C1C]">
                                        {oferta.area_laboral.nombre}
                                    </span>
                                )}

                                <span className="text-[11px] text-gray-500">
                                    Publicada:{" "}
                                    {new Date(oferta.fecha_publicacion).toLocaleDateString(
                                        "es-CR"
                                    )}
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold text-[#1F1E1E] mb-1">
                                {oferta.titulo}
                            </h1>

                            <p className="text-sm text-gray-700">
                                {oferta.categoria}
                                {oferta.area_laboral
                                    ? ` · ${oferta.area_laboral.nombre}`
                                    : ""}
                            </p>

                            {oferta.empresa && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Empresa:{" "}
                                    <span className="font-semibold">
                                        {oferta.empresa.nombre}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Bloque empresa + acciones */}
                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                            {/* Avatar empresa */}
                            {oferta.empresa && (
                                <div className="flex items-center gap-3">
                                    {empresaLogo ? (
                                        <img
                                            src={empresaLogo}
                                            alt={oferta.empresa.nombre}
                                            className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-[#F3F4F6] border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                                            {oferta.empresa.nombre
                                                .split(" ")
                                                .map((p) => p[0])
                                                .join("")
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </div>
                                    )}
                                    <div className="hidden md:flex flex-col text-right">
                                        <span className="text-xs text-gray-500">
                                            Oferta publicada por
                                        </span>
                                        <span className="text-sm font-semibold text-[#1F1E1E]">
                                            {oferta.empresa.nombre}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col items-end gap-2">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full"
                                >
                                    <Link href="/ofertas">← Volver al listado</Link>
                                </Button>
                                <p className="text-xs text-[#CD1719] font-semibold">
                                    Fecha límite:{" "}
                                    {new Date(oferta.fecha_limite).toLocaleDateString(
                                        "es-CR"
                                    )}
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* INFORMACIÓN GENERAL */}
                    <section className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                        <p>
                            <span className="font-semibold">Ubicación:</span>{" "}
                            {ubicacionTexto}
                        </p>
                        <p>
                            <span className="font-semibold">Horario:</span>{" "}
                            {oferta.horario}
                        </p>

                        {oferta.empresa && (
                            <>
                                <p>
                                    <span className="font-semibold">Contacto:</span>{" "}
                                    {oferta.empresa.persona_contacto ?? "No especificado"}
                                </p>
                                <p>
                                    <span className="font-semibold">Correo:</span>{" "}
                                    {oferta.empresa.correo ?? "No especificado"}
                                </p>
                                <p>
                                    <span className="font-semibold">Teléfono:</span>{" "}
                                    {oferta.empresa.telefono ?? "No especificado"}
                                </p>
                            </>
                        )}
                    </section>

                    {/* DESCRIPCIÓN */}
                    <section className="mb-4">
                        <h2 className="text-lg font-bold text-[#034991] mb-2">
                            Descripción de la oferta
                        </h2>
                        <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                            {oferta.descripcion}
                        </p>
                    </section>

                    {/* REQUISITOS */}
                    <section className="mb-4">
                        <h2 className="text-lg font-bold text-[#034991] mb-2">
                            Requisitos
                        </h2>
                        <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                            {oferta.requisitos}
                        </p>
                    </section>

                    {/* POSTULACIÓN (BOTÓN) */}
                    {tienePermiso(6) && (
                        <section className="border-t pt-4">
                            <div className="flex flex-col gap-3">
                                <h3 className="text-md font-bold text-[#034991]">
                                    Postulación a la oferta
                                </h3>
                                <p className="text-xs text-gray-600">
                                    Se utilizará la información de su perfil y currículum
                                    cargado en GradEm-UNA. Opcionalmente puede agregar un
                                    mensaje corto para la empresa.
                                </p>

                                <textarea
                                    value={mensaje}
                                    onChange={(e) => setMensaje(e.target.value)}
                                    placeholder="Mensaje opcional para la empresa (máx. 1000 caracteres)"
                                    maxLength={1000}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[90px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                />

                                <div className="flex flex-wrap gap-3 items-center">
                                    <Button
                                        type="button"
                                        disabled={enviando || yaPostulado}
                                        onClick={manejarPostulacion}
                                        className={`rounded-full px-6 text-sm font-semibold text-white ${
                                            enviando || yaPostulado
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-[#034991] hover:bg-[#023165]"
                                        }`}
                                    >
                                        {yaPostulado
                                            ? "Ya está postulado"
                                            : "Postularme a esta oferta"}
                                    </Button>

                                    {yaPostulado && (
                                        <span className="text-xs text-green-700">
                                            Ya se registró una postulación para esta oferta.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
};

(OfertaDetallePagina as any).layout = (
    page: React.ReactNode & { props: PropsDetalle }
) => {
    const permisos = page.props?.userPermisos ?? [];
    return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};

export default OfertaDetallePagina;
