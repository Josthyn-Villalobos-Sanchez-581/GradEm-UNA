import React from "react";
import { Head, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import {
    ArrowLeft,
    Building2,
    Phone,
    MapPin,
    User,
    IdCard,
    Mail,
    Briefcase
} from "lucide-react";

/* =========================
TIPOS
========================= */

interface FotoPerfil {
    url?: string | null;
}

interface Usuario {
    nombre_completo: string;
    identificacion: string;
    foto_perfil?: FotoPerfil | null;
    foto_url?: string | null;
}


interface Oferta {
    id_oferta: number;
    titulo: string;
}

interface Empresa {
    id_empresa: number;
    nombre: string;
    correo: string;
    telefono: string;
    persona_contacto: string;
    ubicacion?: string | null;
    usuario?: Usuario;
    ofertas?: Oferta[];
}

interface Props {
    empresa: Empresa;
    userPermisos: number[];
}

/* =========================
COMPONENTE
========================= */

export default function VerEmpresa({ empresa }: Props) {

    const foto =
        empresa.usuario?.foto_perfil?.url ||
        FotoXDefecto;


    console.log(empresa.usuario);

    return (
        <>
            <Head title={`Empresa - ${empresa.nombre}`} />

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#034991] flex items-center gap-2">
                            <Building2 className="size-6" />
                            Perfil de Empresa
                        </h1>

                        <p className="text-slate-500 text-sm mt-1">
                            Información de la empresa y ofertas publicadas.
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => router.visit(route("empresas.index"))}
                    >
                        <ArrowLeft className="size-4 mr-2" />
                        Volver
                    </Button>
                </header>

                <div className="grid grid-cols-12 gap-6">

                    {/* SIDEBAR EMPRESA */}
                    <aside className="col-span-12 md:col-span-4 lg:col-span-3">

                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">

                            {/* FOTO */}
                            <div className="flex flex-col items-center text-center">

                                <div className="relative p-1 bg-white rounded-full shadow-md mb-4">
                                    <img
                                        src={foto}
                                        onError={(e) => (e.currentTarget.src = FotoXDefecto)}
                                        className="w-32 h-32 rounded-full object-cover border-2 border-white"
                                    />
                                </div>

                                <h2 className="text-lg font-bold text-gray-900">
                                    {empresa.nombre}
                                </h2>

                                <span className="text-xs text-gray-500 uppercase tracking-wider">
                                    Empresa
                                </span>

                            </div>

                            {/* INFORMACIÓN */}
                            <div className="mt-6 space-y-3 text-sm">

                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail className="size-4" />
                                    {empresa.correo}
                                </div>

                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone className="size-4" />
                                    {empresa.telefono}
                                </div>

                                <div className="flex items-center gap-3 text-gray-600">
                                    <User className="size-4" />
                                    Responsable: {empresa.persona_contacto}
                                </div>

                                <div className="flex items-center gap-3 text-gray-600">
                                    <IdCard className="size-4" />
                                    ID: {empresa.usuario?.identificacion}
                                </div>

                                {empresa.ubicacion && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <MapPin className="size-4" />
                                        {empresa.ubicacion}
                                    </div>
                                )}

                            </div>

                        </div>

                    </aside>

                    {/* OFERTAS */}
                    <section className="col-span-12 md:col-span-8 lg:col-span-9">

                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">

                            <div className="flex items-center gap-2 mb-6">
                                <Briefcase className="size-5 text-[#034991]" />
                                <h2 className="text-lg font-semibold text-[#034991]">
                                    Ofertas publicadas
                                </h2>
                            </div>

                            {empresa.ofertas && empresa.ofertas.length > 0 ? (

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                                    {empresa.ofertas.map((oferta) => (

                                        <div
                                            key={oferta.id_oferta}
                                            className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                                        >

                                            <h3 className="font-semibold text-gray-900 text-sm">
                                                {oferta.titulo}
                                            </h3>

                                            <Button
                                                variant="ghost"
                                                className="mt-3 text-xs"
                                                onClick={() =>
                                                    router.visit(
                                                        route("ofertas.mostrar", oferta.id_oferta)
                                                    )
                                                }
                                            >
                                                Ver oferta
                                            </Button>

                                        </div>

                                    ))}

                                </div>

                            ) : (

                                <div className="text-center py-10">

                                    <Briefcase className="size-10 text-gray-300 mx-auto mb-3" />

                                    <p className="text-gray-400 text-sm">
                                        Esta empresa aún no ha publicado ofertas.
                                    </p>

                                </div>

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

(VerEmpresa as any).layout = (page: any) => (
    <PpLayout userPermisos={page.props.userPermisos}>
        {page}
    </PpLayout>
);
