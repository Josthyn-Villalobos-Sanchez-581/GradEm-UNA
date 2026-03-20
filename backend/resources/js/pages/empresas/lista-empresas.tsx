import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { Button } from "@/components/ui/button";
import fotoXDefecto from "@/assets/FotoXDefecto.png";
import { route } from "ziggy-js";
import {
    Eye,
    Building2,
    Filter,
    Search
} from "lucide-react";

interface FotoPerfil {
    url: string | null;
}

interface Usuario {
    nombre_completo: string;
    correo: string;
    foto_perfil?: FotoPerfil | null;
}

interface Empresa {
    id_empresa: number;
    nombre: string;
    correo: string;
    telefono: string;
    persona_contacto: string;
    usuario?: Usuario | null;
}

interface Props {
    empresas: {
        data: Empresa[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };

    filtros?: {
        buscar?: string;
        per_page?: number;
    };

    userPermisos: number[];
}

export default function ListaEmpresas({ empresas, filtros }: Props) {

    const [mostrarFiltros, setMostrarFiltros] = useState(true);
    const [search, setSearch] = useState(filtros?.buscar ?? "");
    const [perPage, setPerPage] = useState(filtros?.per_page ?? 10);

    const aplicarFiltros = () => {
        router.get(
            route("empresas.index"),
            {
                buscar: search || undefined,
                per_page: perPage
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true
            }
        );
    };

    const limpiarFiltros = () => {
        setSearch("");
        router.get(route("empresas.index"));
    };

    return (
        <>
            <Head title="Empresas registradas" />

            <div className="max-full w-full mx-auto px-6 py-6 text-[#000000]">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

                    <div>
                        <h1 className="text-2xl font-bold text-[#034991] tracking-tight flex items-center gap-3">
                            <Building2 className="size-6" />
                            Empresas registradas
                        </h1>

                        <p className="text-slate-500 text-sm mt-1">
                            Consulta las empresas registradas en la plataforma.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    >
                        <Filter className="size-4" />
                        {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
                    </Button>

                </header>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* SIDEBAR FILTROS */}
                    {mostrarFiltros && (
                        <aside className="w-full lg:w-72 flex-shrink-0">

                            <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">

                                <h2 className="text-lg font-semibold text-[#034991] border-b pb-2">
                                    Filtrar empresas
                                </h2>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        aplicarFiltros();
                                    }}
                                    className="space-y-3 text-sm"
                                >

                                    {/* BUSCAR */}
                                    <div className="flex flex-col">

                                        <label className="font-semibold mb-1">
                                            Buscar
                                        </label>

                                        <div className="relative">

                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Nombre de empresa..."
                                                className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991] w-full"
                                            />

                                        </div>
                                    </div>

                                    {/* PER PAGE */}
                                    <div className="flex flex-col">

                                        <label className="font-semibold mb-1">
                                            Empresas por página
                                        </label>

                                        <select
                                            value={perPage}
                                            onChange={(e) => setPerPage(Number(e.target.value))}
                                            className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991]"
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
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

                    {/* TABLA */}
                    <section className="flex-1 min-w-0">

                        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">

                            <div className="overflow-x-auto">

                                <table className="w-full text-sm text-left border-collapse">

                                    <thead>
                                        <tr className="border-b border-slate-50 bg-slate-50/30">

                                            <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">
                                                Empresa
                                            </th>

                                            <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">
                                                Correo
                                            </th>

                                            <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">
                                                Teléfono
                                            </th>

                                            <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">
                                                Contacto
                                            </th>

                                            <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] text-right">
                                                Gestión
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-50">

                                        {empresas.data.map((empresa) => (

                                            <tr
                                                key={empresa.id_empresa}
                                                className="group hover:bg-[#F4F7FA]/50 transition-all"
                                            >

                                                <td className="py-3 px-5">
                                                    <div className="flex items-center gap-4">

                                                        <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-200 group-hover:scale-105 transition-transform bg-white">
                                                            <img
                                                                src={empresa.usuario?.foto_perfil?.url || fotoXDefecto}
                                                                onError={(e) => {
                                                                    e.currentTarget.onerror = null;
                                                                    e.currentTarget.src = fotoXDefecto;
                                                                }}
                                                                className="w-full h-full object-cover rounded-full"
                                                                alt="Logo empresa"
                                                            />
                                                        </div>

                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-extrabold text-[#034991] text-base uppercase leading-tight truncate">
                                                                {empresa.nombre}
                                                            </span>

                                                            <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">
                                                                — {empresa.persona_contacto}
                                                            </span>
                                                        </div>

                                                    </div>
                                                </td>


                                                <td className="py-3 px-5 text-xs font-semibold text-slate-500">
                                                    {empresa.correo}
                                                </td>

                                                <td className="py-3 px-5">
                                                    {empresa.telefono}
                                                </td>

                                                <td className="py-3 px-5">
                                                    {empresa.persona_contacto}
                                                </td>

                                                <td className="py-3 px-5 text-right">

                                                    <Button
                                                        variant="default"
                                                        size="icon"
                                                        title="Ver Empresa"
                                                        onClick={() =>
                                                            router.visit(
                                                                route("empresas.ver", empresa.id_empresa)
                                                            )
                                                        }
                                                    >
                                                        <Eye className="size-5" />
                                                    </Button>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>
                                </table>

                            </div>

                            {/* PAGINACIÓN */}
                            {empresas.links.length > 0 && (
                                <div className="flex justify-center mt-6 space-x-2 pb-6">

                                    {/* ANTERIOR */}
                                    <Button
                                        type="button"
                                        variant="default"
                                        size="sm"
                                        disabled={!empresas.links[0]?.url}
                                        onClick={() => {
                                            const url = empresas.links[0]?.url;
                                            if (!url) return;

                                            router.visit(url, {
                                                preserveScroll: true,
                                                preserveState: true,
                                            });
                                        }}
                                    >
                                        Anterior
                                    </Button>

                                    {/* NUMÉRICOS */}
                                    {empresas.links
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
                                        disabled={!empresas.links[empresas.links.length - 1]?.url}
                                        onClick={() => {
                                            const url =
                                                empresas.links[empresas.links.length - 1]?.url;

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

                    </section>

                </div>
            </div>
        </>
    );
}

(ListaEmpresas as any).layout = (page: any) => (
    <PpLayout userPermisos={page.props.userPermisos}>
        {page}
    </PpLayout>
);
