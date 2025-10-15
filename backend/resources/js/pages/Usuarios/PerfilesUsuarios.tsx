// backend/resources/js/pages/Usuarios/PerfilesUsuarios.tsx
import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import axios from "axios";
import { useModal } from "@/hooks/useModal";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";

interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  identificacion: string;
  telefono: string;
  rol: { nombre_rol: string };
  universidad?: { nombre: string };
  carrera?: { nombre: string };
  estado_id: number;
  empresa?: {
    telefono?: string;
  };
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
        <div className="w-full overflow-x-auto bg-white p-6 rounded-2xl shadow border border-black">
          <table className="min-w-full border-separate border-spacing-[0px] rounded-2xl overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                {columnasVisibles.nombre_completo && (
                  <th className="px-4 py-2 text-left text-gray-500 border border-gray-300 first:rounded-tl-2xl">
                    Nombre completo
                  </th>
                )}
                {columnasVisibles.correo && (
                  <th className="px-4 py-2 text-left text-gray-500 border border-gray-300">
                    Correo
                  </th>
                )}
                {columnasVisibles.identificacion && (
                  <th className="px-4 py-2 text-left text-gray-500 border border-gray-300">
                    Identificación
                  </th>
                )}
                {columnasVisibles.telefono && (
                  <th className="px-4 py-2 text-left text-gray-500 border border-gray-300">
                    Teléfono
                  </th>
                )}
                {columnasVisibles.rol && (
                  <th className="px-4 py-2 text-left text-gray-500 border border-gray-300">
                    Rol
                  </th>
                )}
                {columnasVisibles.universidad && (
                  <th className="px-4 py-2 text-left text-gray-500 border border-gray-300">
                    Universidad
                  </th>
                )}
                {columnasVisibles.carrera && (
                  <th className="px-4 py-2 text-left text-gray-500 border border-gray-300 last:rounded-tr-2xl">
                    Carrera
                  </th>
                )}
                <th className="px-4 py-2 text-center text-gray-500 border border-gray-300 min-w-[170px] last:rounded-tr-2xl">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {usuariosPaginados.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-4 text-gray-500 italic border border-gray-300 rounded-b-2xl"
                  >
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                usuariosPaginados.map((u, idx) => (
                  <tr
                    key={u.id_usuario}
                    className={`hover:bg-gray-50 ${
                      idx === usuariosPaginados.length - 1 ? "last-row" : ""
                    }`}
                  >
                    {columnasVisibles.nombre_completo && (
                      <td
                        className={`px-4 py-2 border border-gray-300 ${
                          idx === usuariosPaginados.length - 1
                            ? "rounded-bl-2xl"
                            : ""
                        }`}
                      >
                        {u.nombre_completo}
                      </td>
                    )}
                    {columnasVisibles.correo && (
                      <td className="px-4 py-2 border border-gray-300">{u.correo}</td>
                    )}
                    {columnasVisibles.identificacion && (
                      <td className="px-4 py-2 border border-gray-300">{u.identificacion}</td>
                    )}
                    {columnasVisibles.telefono && (
                      <td className="px-4 py-2 border border-gray-300">
                        {u.rol?.nombre_rol?.toLowerCase() === "empresa"
                          ? u.empresa?.telefono ?? "-"
                          : u.telefono ?? "-"}
                      </td>
                    )}
                    {columnasVisibles.rol && (
                      <td className="px-4 py-2 capitalize border border-gray-300">
                        {u.rol?.nombre_rol}
                      </td>
                    )}
                    {columnasVisibles.universidad && (
                      <td className="px-4 py-2 border border-gray-300">
                        {u.universidad?.nombre ?? "-"}
                      </td>
                    )}
                    {columnasVisibles.carrera && (
                      <td className="px-4 py-2 border border-gray-300">
                        {u.carrera?.nombre ?? "-"}
                      </td>
                    )}

                    {/* Celda Acciones */}
                    <td
                      className={`px-4 py-2 text-center border border-gray-300 ${
                        idx === usuariosPaginados.length - 1 ? "rounded-br-2xl" : ""
                      }`}
                    >
                      <div className="flex justify-center gap-2">
                        <Link href={route("usuarios.ver", { id: u.id_usuario })}>
                          <Button
                            variant="default"
                            size="sm"
                            className="font-semibold"
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                await axios.get(route("usuarios.ver", { id: u.id_usuario }));
                                window.location.href = route("usuarios.ver", { id: u.id_usuario });
                              } catch (err: any) {
                                if (err.response?.status === 403) {
                                  modal.alerta({
                                    titulo: err.response.data.titulo || "Acceso denegado",
                                    mensaje:
                                      err.response.data.mensaje ||
                                      "No tiene permiso para ver este perfil.",
                                  });
                                } else {
                                  modal.alerta({
                                    titulo: "Error",
                                    mensaje: "Ocurrió un error al intentar acceder al perfil.",
                                  });
                                }
                              }
                            }}
                          >
                            Ver Perfil
                          </Button>
                        </Link>

                        <Button
                          variant={u.estado_id === 1 ? "destructive" : "secondary"}
                          size="sm"
                          className="font-semibold"
                          onClick={async () => {
                            const confirmado = await modal.confirmacion({
                              titulo:
                                u.estado_id === 1 ? "Inactivar cuenta" : "Activar cuenta",
                              mensaje: `¿Desea ${
                                u.estado_id === 1 ? "inactivar" : "activar"
                              } la cuenta de ${u.nombre_completo}?`,
                            });
                            if (!confirmado) return;

                            try {
                              const res = await axios.put(`/usuarios/${u.id_usuario}/toggle-estado`);
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
                                mensaje: "Ocurrió un error al cambiar el estado del usuario.",
                              });
                            }
                          }}
                        >
                          {u.estado_id === 1 ? "Inactivar" : "Activar"}
                        </Button>
                      </div>
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
            {/* Botón Anterior */}
            <Button
              type="button"
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              variant="default"
              className={`px-4 py-2 font-semibold text-white bg-[#034991] hover:bg-[#02336e] rounded shadow transition ${
                paginaActual === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Anterior
            </Button>

            {/* Botones numéricos */}
            {Array.from({ length: totalPaginas }, (_, i) => (
              <Button
                key={i + 1}
                type="button"
                onClick={() => cambiarPagina(i + 1)}
                variant="default"
                className={`px-4 py-2 font-semibold rounded shadow transition ${
                  paginaActual === i + 1
                    ? "bg-[#CD1719] text-white hover:bg-[#b31214]"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </Button>
            ))}

            {/* Botón Siguiente */}
            <Button
              type="button"
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              variant="default"
              className={`px-4 py-2 font-semibold text-white bg-[#034991] hover:bg-[#02336e] rounded shadow transition ${
                paginaActual === totalPaginas ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Siguiente
            </Button>
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
