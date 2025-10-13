// backend/resources/js/pages/Usuarios/PerfilesUsuarios.tsx
import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import axios from "axios";
import { useModal } from "@/hooks/useModal";
import { route } from "ziggy-js";

interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  identificacion: string;
  telefono: string;
  rol: { nombre_rol: string };
  universidad?: { nombre: string };
  carrera?: { nombre: string };
  estado_id: number; // 1 = activo, 0 = inactivo
}

interface Props {
  usuarios: Usuario[];
  userPermisos: number[];
}

export default function PerfilesUsuarios(props: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(props.usuarios);
  const modal = useModal();
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  type ColumnaKey =
    | "nombre_completo"
    | "correo"
    | "identificacion"
    | "telefono"
    | "rol"
    | "universidad"
    | "carrera";

  const [columnasVisibles, setColumnasVisibles] = useState<
    Record<ColumnaKey, boolean>
  >({
    nombre_completo: true,
    correo: true,
    identificacion: true,
    telefono: true,
    rol: true,
    universidad: true,
    carrera: true,
  });

  const toggleColumna = (columna: ColumnaKey) => {
    setColumnasVisibles((prev) => ({
      ...prev,
      [columna]: !prev[columna],
    }));
  };

  // 🔍 Búsqueda y filtros
  const usuariosFiltrados = usuarios
    .filter((u) => {
      const texto = busqueda.toLowerCase();
      return (
        u.nombre_completo.toLowerCase().includes(texto) ||
        u.identificacion.toLowerCase().includes(texto) ||
        u.correo.toLowerCase().includes(texto)
      );
    })
    .filter((u) => {
      if (filtroRol !== "todos") {
        return u.rol?.nombre_rol?.toLowerCase() === filtroRol.toLowerCase();
      }
      return true;
    })
    .filter((u) => {
      if (filtroEstado === "activos") return u.estado_id === 1;
      if (filtroEstado === "inactivos") return u.estado_id !== 1;
      return true;
    });

  const totalPaginas = Math.ceil(usuariosFiltrados.length / itemsPorPagina);
  const usuariosPaginados = usuariosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const cambiarPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) setPaginaActual(pagina);
  };

  return (
    <>
      <Head title="Perfiles de Usuarios" />
      <div className="w-full p-6 text-gray-900">
        <h2 className="text-2xl font-bold mb-6 text-black">
          Visualización de Usuarios
        </h2>

        {/* 🔹 Filtros superiores */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o correo..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="border border-gray-400 text-gray-700 rounded-lg px-4 py-2 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-[#034991]/40"
          />

          {/* Selects de filtro */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filtroRol}
              onChange={(e) => {
                setFiltroRol(e.target.value);
                setPaginaActual(1);
              }}
              className="cursor-pointer border border-gray-300 rounded-lg px-3 py-2 text-gray-700 hover:border-[#034991] focus:ring-2 focus:ring-[#034991]/40 transition"
            >
              <option value="todos">Todos los roles</option>
              <option value="egresado">Egresados</option>
              <option value="estudiante">Estudiantes</option>
              <option value="empresa">Empresas</option>
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPaginaActual(1);
              }}
              className="cursor-pointer border border-gray-300 rounded-lg px-3 py-2 text-gray-700 hover:border-[#034991] focus:ring-2 focus:ring-[#034991]/40 transition"
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Solo activos</option>
              <option value="inactivos">Solo inactivos</option>
            </select>
          </div>
        </div>

        {/* 🔹 Checkboxes para columnas */}
        <div className="flex flex-wrap gap-3 bg-gray-50 border border-gray-200 p-3 rounded-lg shadow-sm mb-4">
          {(Object.entries(columnasVisibles) as [ColumnaKey, boolean][])
            .filter(([col]) => col !== "nombre_completo")
            .map(([col, visible]) => (
              <label
                key={col}
                className="flex items-center text-sm text-gray-700 cursor-pointer hover:text-[#034991] transition"
              >
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={() => toggleColumna(col)}
                  className="mr-2 accent-[#034991]"
                />
                {col
                  .replace("_", " ")
                  .replace("correo", "Correo")
                  .replace("identificacion", "Identificación")
                  .replace("telefono", "Teléfono")
                  .replace("rol", "Rol")
                  .replace("universidad", "Universidad")
                  .replace("carrera", "Carrera")}
              </label>
            ))}
        </div>

        {/* 🔹 Tabla de usuarios */}
        <div className="w-full overflow-x-auto bg-white p-6 rounded-2xl shadow">
          <table className="min-w-full border-collapse rounded-2xl overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                {columnasVisibles.nombre_completo && (
                  <th className="px-4 py-2 text-left text-gray-500">
                    Nombre completo
                  </th>
                )}
                {columnasVisibles.correo && (
                  <th className="px-4 py-2 text-left text-gray-500">Correo</th>
                )}
                {columnasVisibles.identificacion && (
                  <th className="px-4 py-2 text-left text-gray-500">
                    Identificación
                  </th>
                )}
                {columnasVisibles.telefono && (
                  <th className="px-4 py-2 text-left text-gray-500">
                    Teléfono
                  </th>
                )}
                {columnasVisibles.rol && (
                  <th className="px-4 py-2 text-left text-gray-500">Rol</th>
                )}
                {columnasVisibles.universidad && (
                  <th className="px-4 py-2 text-left text-gray-500">
                    Universidad
                  </th>
                )}
                {columnasVisibles.carrera && (
                  <th className="px-4 py-2 text-left text-gray-500">Carrera</th>
                )}
                <th className="px-4 py-2 text-center text-gray-500 min-w-[170px]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuariosPaginados.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                usuariosPaginados.map((u) => (
                  <tr key={u.id_usuario} className="border-t hover:bg-gray-50">
                    {columnasVisibles.nombre_completo && (
                      <td className="px-4 py-2">{u.nombre_completo}</td>
                    )}
                    {columnasVisibles.correo && (
                      <td className="px-4 py-2">{u.correo}</td>
                    )}
                    {columnasVisibles.identificacion && (
                      <td className="px-4 py-2">{u.identificacion}</td>
                    )}
                    {columnasVisibles.telefono && (
                      <td className="px-4 py-2">{u.telefono}</td>
                    )}
                    {columnasVisibles.rol && (
                      <td className="px-4 py-2 capitalize">{u.rol?.nombre_rol}</td>
                    )}
                    {columnasVisibles.universidad && (
                      <td className="px-4 py-2">{u.universidad?.nombre ?? "-"}</td>
                    )}
                    {columnasVisibles.carrera && (
                      <td className="px-4 py-2">{u.carrera?.nombre ?? "-"}</td>
                    )}
                    <td className="px-4 py-2 text-center flex justify-center gap-2">
                      {/* BOTÓN VER PERFIL */}
                      <Link
                        href={route("usuarios.ver", { id: u.id_usuario })}
                        onClick={async (e) => {
                          e.preventDefault();
                          try {
                            await axios.get(route("usuarios.ver", { id: u.id_usuario }));
                            window.location.href = route("usuarios.ver", {
                              id: u.id_usuario,
                            });
                          } catch (err: any) {
                            if (err.response?.status === 403) {
                              modal.alerta({
                                titulo: err.response.data.titulo || "Acceso denegado",
                                mensaje:
                                  err.response.data.mensaje ||
                                  "No tiene permiso para ver este perfil.",
                              });
                            } else {
                              console.error(err);
                              modal.alerta({
                                titulo: "Error",
                                mensaje:
                                  "Ocurrió un error al intentar acceder al perfil.",
                              });
                            }
                          }
                        }}
                        className="bg-[#034991] hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shadow font-semibold text-sm whitespace-nowrap"
                      >
                        Ver Perfil
                      </Link>

                      {/* BOTÓN ACTIVAR/INACTIVAR */}
                      <button
                        onClick={async () => {
                          const confirmado = await modal.confirmacion({
                            titulo:
                              u.estado_id === 1
                                ? "Inactivar cuenta"
                                : "Activar cuenta",
                            mensaje: `¿Desea ${
                              u.estado_id === 1 ? "inactivar" : "activar"
                            } la cuenta de ${u.nombre_completo}?`,
                          });
                          if (!confirmado) return;

                          try {
                            const res = await axios.put(
                              `/usuarios/${u.id_usuario}/toggle-estado`
                            );
                            modal.alerta({
                              titulo: "Estado actualizado",
                              mensaje: res.data.message,
                            });

                            const nuevos = usuarios.map((usr) =>
                              usr.id_usuario === u.id_usuario
                                ? { ...usr, estado_id: res.data.nuevo_estado }
                                : usr
                            );
                            setUsuarios([...nuevos]);
                          } catch {
                            modal.alerta({
                              titulo: "Error",
                              mensaje:
                                "Ocurrió un error al cambiar el estado del usuario.",
                            });
                          }
                        }}
                        className={`cursor-pointer px-3 py-1.5 rounded-lg shadow font-semibold text-sm whitespace-nowrap transition ${
                          u.estado_id === 1
                            ? "bg-[#CD1719] hover:bg-red-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {u.estado_id === 1 ? "Inactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🔹 Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="cursor-pointer px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
            >
              Anterior
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => cambiarPagina(i + 1)}
                className={`cursor-pointer px-3 py-1 rounded transition ${
                  paginaActual === i + 1
                    ? "bg-[#CD1719] text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="cursor-pointer px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </>
  );
}

PerfilesUsuarios.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
