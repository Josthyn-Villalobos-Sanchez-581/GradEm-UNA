import React, { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import axios from "axios";
import { useModal } from "@/hooks/useModal";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Eye,
  UserCog,
  Columns,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  identificacion: string;
  telefono: string;
  rol: { nombre_rol: string };
  universidad?: { nombre: string; sigla: string };
  carrera?: { nombre: string };
  estado_id: number;
}

interface Props {
  usuarios: Usuario[];
  userPermisos: number[];
  universidades: { id_universidad: number; nombre: string; sigla: string }[];
  carreras: { id_carrera: number; nombre: string }[];
}

type ColumnaKey = "nombre_completo" | "correo" | "identificacion" | "telefono" | "rol" | "universidad" | "carrera";

export default function PerfilesUsuarios(props: Props) {
  // --- ESTADOS Y LÓGICA ---
  const [usuarios, setUsuarios] = useState<Usuario[]>(props.usuarios);
  const { universidades = [], carreras = [] } = props;
  const [mostrarFiltros, setMostrarFiltros] = useState(true); // Control del Sidebar
  const modal = useModal();
  const { auth } = usePage().props as any;

  const [filtroUniversidad, setFiltroUniversidad] = useState("todos");
  const [filtroCarrera, setFiltroCarrera] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  const [columnasVisibles, setColumnasVisibles] = useState<Record<ColumnaKey | "acciones", boolean>>({
    nombre_completo: true,
    correo: true,
    identificacion: true,
    telefono: true,
    rol: true,
    universidad: true,
    carrera: true,
    acciones: true,
  });

  const toggleColumna = (columna: ColumnaKey) => {
    setColumnasVisibles((prev) => ({ ...prev, [columna]: !prev[columna] }));
  };

  const normalizeSearchText = (value?: string | null) => String(value ?? "").toLowerCase();
  const displayValue = (value?: string | number | null) => {
    if (value === null || value === undefined) return "NA";
    const stringValue = String(value).trim();
    return stringValue.length ? stringValue : "NA";
  };

  // --- FILTRADO ---
  const usuariosFiltrados = usuarios
    .filter((u) => normalizeSearchText(u.rol?.nombre_rol) !== "empresa")
    .filter((u) => {
      const texto = busqueda.toLowerCase();
      return (
        normalizeSearchText(u.nombre_completo).includes(texto) ||
        normalizeSearchText(u.identificacion).includes(texto) ||
        normalizeSearchText(u.correo).includes(texto)
      );
    })
    .filter((u) => (filtroRol !== "todos" ? normalizeSearchText(u.rol?.nombre_rol) === filtroRol.toLowerCase() : true))
    .filter((u) => {
      if (filtroEstado === "activos") return u.estado_id === 1;
      if (filtroEstado === "inactivos") return u.estado_id !== 1;
      return true;
    })
    .filter((u) => {
      if (filtroUniversidad !== "todos") {
        return normalizeSearchText(u.universidad?.sigla) === filtroUniversidad;
      }
      return true;
    })
    .filter((u) => {
      if (filtroCarrera !== "todos") {
        return normalizeSearchText(u.carrera?.nombre) === filtroCarrera;
      }
      return true;
    });


  const totalPaginas = Math.ceil(usuariosFiltrados.length / itemsPorPagina);
  const usuariosPaginados = usuariosFiltrados.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina);

  return (
    <>
      <Head title="Perfiles de Usuarios" />

      <div className="max-full w-full mx-auto px-6 py-6 text-[#000000]">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#034991] tracking-tight flex items-center gap-3">
              <Users className="size-6" />
              Directorio de Usuarios
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Gestiona y visualiza los perfiles de la plataforma.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="rounded-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB]"
          >
            <Filter className="size-4 mr-2" />
            {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
          </Button>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* SIDEBAR FILTROS */}
          {mostrarFiltros && (
            <aside className="w-full lg:w-72 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-4 shadow-sm space-y-6">

                <div>
                  <h2 className="text-lg font-semibold text-[#034991] border-b pb-2 mb-4">
                    Filtrar Usuarios
                  </h2>

                  <div className="space-y-4 text-sm">
                    {/* BÚSQUEDA */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Buscar</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Nombre, cédula o correo"
                          value={busqueda}
                          onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                          className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991] w-full outline-none"
                        />
                      </div>
                    </div>

                    {/* ROL */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Rol</label>
                      <select
                        value={filtroRol}
                        onChange={(e) => { setFiltroRol(e.target.value); setPaginaActual(1); }}
                        className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991] outline-none"
                      >
                        <option value="todos">Todos los roles</option>
                        <option value="egresado">Egresados</option>
                        <option value="estudiante">Estudiantes</option>
                      </select>
                    </div>

                    {/* ESTADO */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Estado</label>
                      <select
                        value={filtroEstado}
                        onChange={(e) => { setFiltroEstado(e.target.value); setPaginaActual(1); }}
                        className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991] outline-none"
                      >
                        <option value="todos">Todos los estados</option>
                        <option value="activos">Activos</option>
                        <option value="inactivos">Inactivos</option>
                      </select>
                    </div>

                    {/* UNIVERSIDAD */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Universidad</label>
                      <select
                        value={filtroUniversidad}
                        onChange={(e) => {
                          setFiltroUniversidad(e.target.value);
                          setPaginaActual(1);
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991] outline-none"
                      >
                        <option value="todos">Todas</option>

                        {universidades.map((u) => (
                          <option key={u.id_universidad} value={u.sigla.toLowerCase()}>
                            {u.sigla.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CARRERA */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Carrera</label>
                      <select
                        value={filtroCarrera}
                        onChange={(e) => {
                          setFiltroCarrera(e.target.value);
                          setPaginaActual(1);
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#034991] outline-none"
                      >
                        <option value="todos">Todas</option>

                        {carreras.map((c) => (
                          <option key={c.id_carrera} value={c.nombre.toLowerCase()}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* GESTIÓN DE COLUMNAS */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Columns className="size-3" /> Columnas Visibles
                  </h3>
                  <div className="space-y-2">
                    {(Object.entries(columnasVisibles) as [ColumnaKey, boolean][])
                      .filter(([col]) => col !== "nombre_completo")
                      .map(([col, visible]) => (
                        <label key={col} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={visible}
                            onChange={() => toggleColumna(col)}
                            className="rounded border-gray-300 text-[#034991] focus:ring-[#034991]"
                          />
                          <span className="text-sm text-slate-600 group-hover:text-[#034991] transition-colors capitalize">
                            {col.replace("_", " ")}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* TABLA DE CONTENIDO */}
          <section className="flex-1 min-w-0">
            <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/30">

                      {columnasVisibles.nombre_completo && (
                        <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">
                          Usuario
                        </th>
                      )}

                      {(columnasVisibles.universidad || columnasVisibles.carrera) && (
                        <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">
                          Académico
                        </th>
                      )}

                      {columnasVisibles.correo && (
                        <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">
                          Contacto
                        </th>
                      )}

                      {columnasVisibles.identificacion && (
                        <th className="p-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">
                          Identificación
                        </th>
                      )}

                      {columnasVisibles.rol && (
                        <th className="p-5 text-center font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">
                          Rol
                        </th>
                      )}

                      {columnasVisibles.acciones && (
                        <th className="p-5 text-right font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">
                          Gestión
                        </th>
                      )}

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {usuariosPaginados.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-10 text-center text-slate-400 italic">
                          No se encontraron usuarios con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      usuariosPaginados.map((u) => (
                        <tr key={u.id_usuario} className="group hover:bg-[#F4F7FA]/50 transition-all">
                          {columnasVisibles.nombre_completo && (
                            <td className="py-4 px-5">
                              <div className="flex flex-col">
                                <span className="font-extrabold text-[#034991] text-base uppercase leading-tight truncate">
                                  {displayValue(u.nombre_completo)}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">
                                </span>
                              </div>
                            </td>
                          )}
                          {(columnasVisibles.universidad || columnasVisibles.carrera) && (
                            <td className="py-4 px-5">

                              {columnasVisibles.universidad && (
                                <div className="text-sm text-slate-700 font-semibold">
                                  {displayValue(u.universidad?.sigla)}
                                </div>
                              )}

                              {columnasVisibles.carrera && (
                                <div className="text-sm text-slate-500">
                                  {displayValue(u.carrera?.nombre)}
                                </div>
                              )}

                            </td>
                          )}
                          <td className="py-4 px-5">
                            <div className="text-sm text-slate-700 font-semibold">
                              {displayValue(u.correo)}
                            </div>

                            {columnasVisibles.telefono && (
                              <div className="text-sm text-slate-500">
                                {displayValue(u.telefono)}
                              </div>
                            )}
                          </td>
                          {columnasVisibles.identificacion && (
                            <td className="py-4 px-5 text-slate-500 font-semibold">{displayValue(u.identificacion)}</td>
                          )}
                          {columnasVisibles.rol && (
                            <td className="py-4 px-5 text-center">
                              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                                {displayValue(u.rol?.nombre_rol)}
                              </span>
                            </td>
                          )}
                          {columnasVisibles.acciones && (
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="default"
                                    size="icon"
                                    title="Ver Perfil"
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      try {
                                        await axios.get(route("usuarios.ver", { id: u.id_usuario }));
                                        window.location.href = route("usuarios.ver", { id: u.id_usuario });
                                      } catch (err: any) {
                                        modal.alerta({
                                          titulo: err.response?.status === 403 ? "Acceso denegado" : "Error",
                                          mensaje: err.response?.data?.mensaje || "Error al acceder al perfil.",
                                        });
                                      }
                                    }}
                                  >
                                    <Eye className="size-5" />
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="icon"
                                    title={u.estado_id === 1 ? "Inactivar" : "Activar"}
                                    className={`${u.estado_id === 1
                                      ? "text-red-500 hover:bg-red-50"
                                      : "text-green-600 hover:bg-green-50"
                                      }`}
                                    onClick={async () => {
                                      const confirmado = await modal.confirmacion({
                                        titulo: u.estado_id === 1 ? "Inactivar cuenta" : "Activar cuenta",
                                        mensaje: `¿Desea cambiar el estado de ${u.nombre_completo}?`,
                                      });
                                      if (!confirmado) return;

                                      try {
                                        const res = await axios.put(`/usuarios/${u.id_usuario}/toggle-estado`);
                                        modal.alerta({ titulo: "Éxito", mensaje: res.data.message });

                                        setUsuarios(
                                          usuarios.map((usr) =>
                                            usr.id_usuario === u.id_usuario
                                              ? { ...usr, estado_id: res.data.nuevo_estado }
                                              : usr
                                          )
                                        );
                                      } catch {
                                        modal.alerta({ titulo: "Error", mensaje: "No se pudo actualizar." });
                                      }
                                    }}
                                  >
                                    <UserCog className="size-5" />
                                  </Button>
                                </div>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN LOCAL */}
              {totalPaginas > 1 && (
                <div className="flex justify-center items-center gap-2 py-6 border-t border-slate-50 bg-slate-50/10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual(prev => prev - 1)}
                    className="rounded-full"
                  >
                    <ChevronLeft className="size-4 mr-1" /> Anterior
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => (
                      <Button
                        key={p}
                        variant={paginaActual === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPaginaActual(p)}
                        className={`size-8 p-0 rounded-full ${paginaActual === p ? 'bg-[#034991]' : ''}`}
                      >
                        {p}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual(prev => prev + 1)}
                    className="rounded-full"
                  >
                    Siguiente <ChevronRight className="size-4 ml-1" />
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

PerfilesUsuarios.layout = (page: any) => (
  <PpLayout userPermisos={page.props.userPermisos}>
    {page}
  </PpLayout>
);