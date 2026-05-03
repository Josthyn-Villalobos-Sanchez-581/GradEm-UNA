import React, { useState, useRef, useEffect } from "react";
import { Link, Head, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { usePage } from "@inertiajs/react";
import { useModal } from "@/hooks/useModal";
import { route } from 'ziggy-js';
import { Button } from "@/components/ui/button";
import fotoXDefecto from "@/assets/FotoXDefecto.png";
import axios from "axios"; 
import {
    Users,
    Filter,
    Search,
    UserPlus,
    Pencil,
    Trash2,
    UserCheck,
    UserX,
    Settings2
} from "lucide-react";

interface UsuarioItem {
    id_usuario: number;
    nombre_completo?: string;
    correo?: string;
    identificacion?: string;
    telefono?: string;
    rol?: string;
    universidad?: string | null;
    carrera?: string | null;
    fecha_registro?: string;
    estado_id?: number;
    foto_perfil?: { url: string } | null; // Asumiendo que podrías tenerlo
}

interface IndexProps {
    users: {
        data: UsuarioItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    userPermisos?: number[];
    flash?: { success?: string };
    filters?: { search?: string };
}

export default function Index(props: IndexProps) {
    const modal = useModal();
    const { auth } = usePage().props as any;
    const { confirmacion } = useModal();
    const [usuarios, setUsuarios] = useState(props.users.data);
    useEffect(() => {
    setUsuarios(props.users.data);
}, [props.users.data]);
    const [mostrarFiltros, setMostrarFiltros] = useState(true);
    const [searchInput, setSearchInput] = useState(props.filters?.search ?? "");
    const searchTimer = useRef<number | null>(null);

    const [visibleCols, setVisibleCols] = useState<string[]>([
        "nombre", "correo", "rol", "acciones"
    ]);

    const puedeGestionar = [1, 2].includes(auth?.user?.id_rol);

    // Lógica de búsqueda original
    const buscar = (search: string, page = 1) => {
        router.get(
            route("usuarios.index"),
            { search, page },
            { preserveState: true, replace: true }
        );
    };

    const onChangeSearch = (value: string) => {
        setSearchInput(value);
        if (searchTimer.current) window.clearTimeout(searchTimer.current);
        searchTimer.current = window.setTimeout(() => {
            buscar(value);
            searchTimer.current = null;
        }, 600);
    };

    const changePage = (page: number) => {
        if (page < 1 || page > props.users.last_page) return;
        buscar(searchInput, page);
    };

    // Handler para inactivar (Funcionalidad que pediste mantener)
const handleToggleEstado = (u: UsuarioItem) => {
    const accion = u.estado_id === 1 ? "inactivar" : "activar";

    modal.confirmacion({
        titulo: `${accion.charAt(0).toUpperCase() + accion.slice(1)} Usuario`,
        mensaje: `¿Estás seguro de que deseas ${accion} a ${u.nombre_completo}?`,
    }).then(async (ok) => {
        if (!ok) return;

        try {
            const response = await axios.put(
                route("usuarios.toggle-estado", { id: u.id_usuario })
            );

            modal.alerta({
                titulo: "Éxito",
                mensaje: response.data.message,
            });

            // 🔥 actualizar UI sin recargar
            setUsuarios((prev) =>
                prev.map((user) =>
                    user.id_usuario === u.id_usuario
                        ? { ...user, estado_id: response.data.nuevo_estado }
                        : user
                )
            );

        } catch (error) {
            modal.alerta({
                titulo: "Error",
                mensaje: "No se pudo cambiar el estado",
            });
        }
    });
};
const handleEliminar = (u: UsuarioItem) => {
    confirmacion({
        titulo: "Eliminar Usuario",
        mensaje: `¿Estás seguro de eliminar a ${u.nombre_completo}?`,
    }).then(async (ok) => {

        if (!ok) return;

        try {
            const response = await axios.delete(
                route("admin.eliminar", { id: u.id_usuario })
            );

        
            modal.alerta({
                titulo: "Éxito",
                mensaje: response.data.message,
            });

        } catch (error: any) {

            let mensaje =
                error.response?.data?.message ||
                "No se pudo eliminar el usuario";

           
           if (
    mensaje.includes("Integrity constraint") ||
    mensaje.includes("foreign key")
) {
    mensaje = "No se puede eliminar porque el usuario tiene registros asociados.";
}

            modal.alerta({
                titulo: "Error",
                mensaje: mensaje,
            });
        }
    });
};
    return (
        <>
            <Head title="Gestión de Usuarios" />

            <div className="max-w-full mx-auto px-6 py-6 text-slate-900">

                {/* HEADER AL ESTILO EMPRESAS */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#034991] tracking-tight flex items-center gap-3">
                            <Users className="size-7" />
                            Administración de Usuarios
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Gestiona los accesos, roles y estados de los usuarios del sistema.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                            className="rounded-xl"
                        >
                            <Filter className="size-4 mr-2" />
                            {mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}
                        </Button>

                        <Link href={route("admin.crear")}>
                            <Button className="bg-[#034991] hover:bg-[#023165] rounded-xl">
                                <UserPlus className="size-4 mr-2" />
                                Nuevo Usuario
                            </Button>
                        </Link>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* SIDEBAR DE FILTROS Y COLUMNAS */}
                    {mostrarFiltros && (
                        <aside className="w-full lg:w-72 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">

                                {/* Buscador */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Search className="size-4" /> Búsqueda
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Nombre o ID..."
                                            value={searchInput}
                                            onChange={(e) => onChangeSearch(e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl pl-4 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#034991] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                {/* Selección de Columnas (Tu funcionalidad original) */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Settings2 className="size-4" /> Columnas Visibles
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { key: "nombre", label: "Nombre" },
                                            { key: "correo", label: "Correo" },
                                            { key: "identificacion", label: "Identificación" },
                                            { key: "telefono", label: "Teléfono" },
                                            { key: "rol", label: "Rol" },
                                            { key: "fecha", label: "Registro" },
                                        ].map((col) => (
                                            <label key={col.key} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-[#034991] focus:ring-[#034991]"
                                                    checked={visibleCols.includes(col.key)}
                                                    onChange={() =>
                                                        setVisibleCols(prev =>
                                                            prev.includes(col.key)
                                                                ? prev.filter(c => c !== col.key)
                                                                : [...prev, col.key]
                                                        )
                                                    }
                                                />
                                                <span className="text-xs font-medium text-slate-600">{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* CONTENIDO DE LA TABLA */}
                    <section className="flex-1 min-w-0">
                        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-50 bg-slate-50/30">
                                            {visibleCols.includes("nombre") && (
                                                <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Usuario</th>
                                            )}
                                            {visibleCols.includes("correo") && (
                                                <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Contacto</th>
                                            )}
                                            {visibleCols.includes("rol") && (
                                                <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Rol</th>
                                            )}
                                            {visibleCols.includes("identificacion") && (
                                                <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">ID</th>
                                            )}
                                            {visibleCols.includes("acciones") && (
                                                <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] text-right">Gestión</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {usuarios.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-20 text-center text-slate-400 italic">
                                                    No se encontraron usuarios que coincidan.
                                                </td>
                                            </tr>
                                        ) : (
                                            usuarios.map((u) => (
                                                <tr key={u.id_usuario} className="group hover:bg-[#F4F7FA]/50 transition-all">

                                                    {visibleCols.includes("nombre") && (
                                                        <td className="py-3 px-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200">
                                                                    <img
                                                                        src={u.foto_perfil?.url || fotoXDefecto}
                                                                        className="w-full h-full object-cover"
                                                                        alt="Avatar"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="font-extrabold text-[#034991] text-sm uppercase leading-tight truncate">
                                                                        {u.nombre_completo}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                                                                        ID: {u.identificacion}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    )}

                                                    {visibleCols.includes("correo") && (
                                                        <td className="py-3 px-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-semibold text-slate-600">{u.correo}</span>
                                                                <span className="text-[10px] text-slate-400">{u.telefono ?? 'Sin teléfono'}</span>
                                                            </div>
                                                        </td>
                                                    )}

                                                    {visibleCols.includes("rol") && (
                                                        <td className="py-3 px-5">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                                                {u.rol}
                                                            </span>
                                                        </td>
                                                    )}

                                                    {visibleCols.includes("identificacion") && (
                                                        <td className="py-3 px-5 text-xs text-slate-500 font-mono">
                                                            {u.identificacion}
                                                        </td>
                                                    )}

                                                    {visibleCols.includes("acciones") && (
                                                        <td className="py-3 px-5 text-right">
                                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {auth?.user?.id_usuario !== u.id_usuario && puedeGestionar && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className={`${u.estado_id === 1 ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                                                        onClick={() => handleToggleEstado(u)}
                                                                        title={u.estado_id === 1 ? "Inactivar" : "Activar"}
                                                                    >
                                                                        {u.estado_id === 1 ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
                                                                    </Button>
                                                                )}

                                                                <Link href={route("admin.editar", { id: u.id_usuario })}>
                                                                    <Button variant="outline" size="icon" className="text-blue-500 hover:bg-blue-50" title="Editar">
                                                                        <Pencil className="size-4" />
                                                                    </Button>
                                                                </Link>

                                                                {auth?.user?.id_usuario !== u.id_usuario && puedeGestionar &&  (
                                                                    <Button variant="outline" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50" title="Eliminar" onClick={() => handleEliminar(u)}>
                                                                        <Trash2 className="size-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINACIÓN */}
                            {props.users.last_page > 1 && (
                                <div className="flex justify-center items-center py-6 border-t border-slate-50 gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => changePage(props.users.current_page - 1)}
                                        disabled={props.users.current_page === 1}
                                        className="text-slate-500"
                                    >
                                        Anterior
                                    </Button>

                                    <div className="flex gap-1">
                                        {Array.from({ length: props.users.last_page }, (_, i) => (
                                            <Button
                                                key={i + 1}
                                                size="sm"
                                                variant={props.users.current_page === i + 1 ? "default" : "ghost"}
                                                className={`size-8 p-0 rounded-lg ${props.users.current_page === i + 1 ? 'bg-[#034991]' : 'text-slate-400'}`}
                                                onClick={() => changePage(i + 1)}
                                            >
                                                {i + 1}
                                            </Button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => changePage(props.users.current_page + 1)}
                                        disabled={props.users.current_page === props.users.last_page}
                                        className="text-slate-500"
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

Index.layout = (page: React.ReactNode & { props?: any }) => {
    const permisos = page.props?.userPermisos ?? [];
    return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};