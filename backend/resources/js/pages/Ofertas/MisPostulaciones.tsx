import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { Button } from "@/components/ui/button";
import OfertaCard from "@/components/ofertas/OfertaCard";
import { useModal } from "@/hooks/useModal";
import { Search } from "lucide-react";
import { route } from "ziggy-js";

/* =======================
   INTERFACES
======================= */

interface LinkPaginacion {
    url: string | null;
    label: string;
    active: boolean;
}

interface Oferta {
    id_oferta: number;
    titulo: string;
    descripcion: string;
    tipo_oferta: string;
    categoria: string;
    horario: string;
    fecha_limite: string;
    fecha_publicacion: string;
}

interface Postulacion {
    id_postulacion: number;
    mensaje: string | null;
    fecha_postulacion: string;
    estado_id: number;
    oferta: Oferta;
}

interface PaginacionPostulaciones {
    data: Postulacion[];
    links: LinkPaginacion[];
    total: number;
}

interface Props {
    postulaciones: PaginacionPostulaciones;
    filtros: {
        buscar?: string;
        estado_id?: number;
        tipo_oferta?: string;
    };
    userPermisos: number[];
}

const estadoTexto = (estado: number) => {
    switch (estado) {
        case 1:
            return { texto: "En espera", color: "bg-yellow-100 text-yellow-700" };
        case 4:
            return { texto: "En revisión", color: "bg-blue-100 text-blue-700" };
        case 2:
            return { texto: "Aceptado", color: "bg-green-100 text-green-700" };
        case 3:
            return { texto: "Rechazado", color: "bg-red-100 text-red-700" };
        case 5:
            return { texto: "Cancelado", color: "bg-gray-200 text-gray-700" };
        default:
            return { texto: "Desconocido", color: "bg-gray-100 text-gray-600" };
    }
};

const MisPostulaciones: React.FC<Props> = ({
    postulaciones,
    filtros,
}) => {

    const [buscar, setBuscar] = useState(filtros.buscar ?? "");
    const [estado, setEstado] = useState<string>(
        filtros.estado_id ? String(filtros.estado_id) : ""
    );
    const [mostrarFiltros, setMostrarFiltros] = useState(true);
    const modal = useModal();

    const [tipoOferta, setTipoOferta] = useState<string>(
        filtros.tipo_oferta ?? ""
    );

    const aplicarFiltros = (e: React.FormEvent) => {
        e.preventDefault();

        router.get("/misPostulaciones", {
            buscar,
            estado_id: estado,
            tipo_oferta: tipoOferta
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const limpiarFiltros = () => {
        setBuscar("");
        setEstado("");
        setTipoOferta("");
        router.get("/misPostulaciones");
    };

    const cancelarPostulacion = async (id: number) => {

        const ok = await modal.confirmacion({
            titulo: "Cancelar postulación",
            mensaje: "¿Deseas cancelar esta postulación? Esta acción no se puede deshacer."
        });

        if (!ok) return;

        router.patch(
            route("postulaciones.cancelar", id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    modal.alerta({
                        titulo: "Postulación cancelada",
                        mensaje: "La postulación fue cancelada correctamente.",

                    });
                },
                onError: () => {
                    modal.alerta({
                        titulo: "Error",
                        mensaje: "No fue posible cancelar la postulación.",

                    });
                }
            }
        );
    };

    return (
        <>
            <Head title="Mis Postulaciones" />

            <div className="w-full px-6 py-6 text-black">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#034991]">
                            Mis postulaciones
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Aquí puedes ver el estado de todas las ofertas a las que te has inscrito.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-sm text-gray-500">
                        <span>
                            Resultados encontrados:{" "}
                            <span className="font-semibold text-[#034991]">
                                {postulaciones.total}
                            </span>
                        </span>

                        {/* Botón para mostrar/ocultar filtros */}
                        <Button
                            type="button"
                            variant="outline"
                            size="default"
                            onClick={() => setMostrarFiltros((prev) => !prev)}
                        >
                            {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
                        </Button>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* SIDEBAR FILTROS */}
                    {mostrarFiltros && (
                        <aside className="w-full lg:w-72 flex-shrink-0">
                            <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
                                <h2 className="text-lg font-semibold text-[#034991] border-b pb-2">
                                    Filtros de búsqueda
                                </h2>

                                <form onSubmit={aplicarFiltros} className="space-y-3 text-sm">

                                    {/* BUSCAR */}
                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-1">Buscar</label>

                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                                            <input
                                                type="text"
                                                value={buscar}
                                                onChange={(e) => setBuscar(e.target.value)}
                                                placeholder="Título de la oferta..."
                                                className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991] w-full"
                                            />
                                        </div>
                                    </div>


                                    {/* ESTADO */}
                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-1">Estado</label>
                                        <select
                                            value={estado}
                                            onChange={(e) => setEstado(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                        >
                                            <option value="">Todos</option>
                                            <option value="1">En espera</option>
                                            <option value="4">En revisión</option>
                                            <option value="2">Aceptado</option>
                                            <option value="3">Rechazado</option>
                                            <option value="5">Cancelado</option>
                                        </select>
                                    </div>

                                    {/* TIPO DE OFERTA */}
                                    <div className="flex flex-col">
                                        <label className="font-semibold mb-1">Tipo de oferta</label>

                                        <select
                                            value={tipoOferta}
                                            onChange={(e) => setTipoOferta(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                                        >
                                            <option value="">Todos</option>
                                            <option value="empleo">Oferta laboral</option>
                                            <option value="practica">Práctica profesional</option>
                                        </select>
                                    </div>

                                    {/* BOTONES */}
                                    <div className="flex flex-col gap-2 pt-2">
                                        <Button
                                            type="submit"
                                            className="w-full bg-[#034991] hover:bg-[#023165] text-white font-semibold rounded-full"
                                        >
                                            Aplicar filtros
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB] font-semibold rounded-full"
                                            onClick={limpiarFiltros}
                                        >
                                            Limpiar
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </aside>
                    )}

                    {/* LISTADO */}
                    <section className="flex-1">

                        {postulaciones.data.length === 0 ? (
                            <p className="text-center text-gray-500 italic mt-6">
                                No tienes postulaciones registradas.
                            </p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-4">
                                {postulaciones.data.map(post => {
                                    const estadoVisual = estadoTexto(post.estado_id);

                                    return (
                                        <div key={post.id_postulacion} className="flex flex-col">
                                            <OfertaCard
                                                oferta={post.oferta}
                                                href={`/ofertas/${post.oferta.id_oferta}`}
                                            />

                                            <div className="mt-3 border-t border-gray-100 pt-3 flex items-center justify-between px-2">

                                                {/* IZQUIERDA */}
                                                <div className="flex items-center gap-3">

                                                    {/* Estado */}
                                                    <Button
                                                        size="sm"
                                                        variant="static"
                                                        title="Estado de la postulación"
                                                        className={`h-8 px-4 text-sm rounded-full font-semibold flex items-center justify-center ${estadoVisual.color}`}
                                                    >
                                                        {estadoVisual.texto}
                                                    </Button>

                                                    {/* Fecha de postulación */}
                                                    <span
                                                        
                                                        title="Fecha de postulación"
                                                        className="text-[14px] text-gray-400 font-medium"
                                                    >
                                                        Postulado: {new Date(post.fecha_postulacion).toLocaleDateString("es-CR")}
                                                    </span>

                                                </div>

                                                {/* BOTÓN CANCELAR */}
                                                {(post.estado_id === 1 || post.estado_id === 4) && (
                                                    <Button
                                                        title="Cancelar postulación"
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => cancelarPostulacion(post.id_postulacion)}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                )}

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                    </section>
                </div>

                {/* PAGINACIÓN */}
                {postulaciones.links.length > 0 && (
                    <div className="flex justify-center mt-6 space-x-2 pb-6">

                        {/* ANTERIOR */}
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            disabled={!postulaciones.links[0]?.url}
                            onClick={() => {
                                const url = postulaciones.links[0]?.url;
                                if (!url) return;

                                router.visit(url, {
                                    preserveScroll: true,
                                    preserveState: true,
                                });
                            }}
                        >
                            Anterior
                        </Button>

                        {/* BOTONES NUMÉRICOS */}
                        {postulaciones.links
                            .filter(
                                (link) =>
                                    link.label !== "&laquo; Previous" &&
                                    link.label !== "Next &raquo;"
                            )
                            .map((link, index) => (
                                <Button
                                    key={index}
                                    type="button"
                                    size="sm"
                                    variant={link.active ? "destructive" : "outline"}
                                    disabled={!link.url}
                                    onClick={() => {
                                        if (!link.url) return;

                                        router.visit(link.url, {
                                            preserveScroll: true,
                                            preserveState: true,
                                        });
                                    }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}

                        {/* SIGUIENTE */}
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            disabled={!postulaciones.links[postulaciones.links.length - 1]?.url}
                            onClick={() => {
                                const url =
                                    postulaciones.links[postulaciones.links.length - 1]?.url;
                                if (!url) return;

                                router.visit(url, {
                                    preserveScroll: true,
                                    preserveState: true,
                                });
                            }}
                        >
                            Siguiente
                        </Button>

                    </div>
                )}
            </div>
        </>
    );
};

(MisPostulaciones as any).layout = (page: any) => (
    <PpLayout userPermisos={page.props.userPermisos}>
        {page}
    </PpLayout>
);

export default MisPostulaciones;
