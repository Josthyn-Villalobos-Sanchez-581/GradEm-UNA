// backend/resources/js/pages/Roles_Permisos/Index.tsx
import React, { useEffect, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";

interface Permiso {
  id_permiso: number;
  nombre: string;
}

interface Rol {
  id_rol: number;
  nombre_rol: string;
  permisos: Permiso[];
}

interface RolesPermisosIndexProps {
  roles: Rol[];
  permisos: Permiso[];
  todosPermisos: Permiso[];
  userPermisos: number[];
  flash?: { success?: string; error?: string };
  errors?: { error?: string };
}

export default function Index(props: RolesPermisosIndexProps) {
  const { roles, permisos, todosPermisos, userPermisos, flash, errors } = props;
  const modal = useModal();

  // 🔹 Mostrar mensajes del backend en modales
  useEffect(() => {
    if (flash?.error) modal.alerta({ titulo: "Error", mensaje: flash.error });
    if (flash?.success) modal.alerta({ titulo: "Éxito", mensaje: flash.success });
    if (errors?.error) modal.alerta({ titulo: "Error", mensaje: errors.error });
  }, [flash, errors]);

  // Estados de asignación
  const [rolPermisos, setRolPermisos] = useState<Record<number, number[]>>({});
  const [rolAbierto, setRolAbierto] = useState<number | null>(null);

  // Estados de filtros
  const [searchRol, setSearchRol] = useState("");
  const [searchPermiso, setSearchPermiso] = useState("");

  // Paginación cliente
  const [rolPage, setRolPage] = useState(1);
  const [permisoPage, setPermisoPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Secciones visibles
  const [sections, setSections] = useState<string[]>(["roles", "permisos", "asignacion"]);

  // Mapear permisos por rol
  useEffect(() => {
    const map: Record<number, number[]> = {};
    roles.forEach((r) => (map[r.id_rol] = r.permisos.map((p) => p.id_permiso)));
    setRolPermisos(map);
  }, [roles]);

  // Filtros locales
  const filteredRoles = roles.filter((r) =>
    r.nombre_rol.toLowerCase().includes(searchRol.toLowerCase())
  );
  const filteredPermisos = permisos.filter((p) =>
    p.nombre.toLowerCase().includes(searchPermiso.toLowerCase())
  );

  // Paginación con slice()
  const paginatedRoles = filteredRoles.slice(
    (rolPage - 1) * itemsPerPage,
    rolPage * itemsPerPage
  );
  const paginatedPermisos = filteredPermisos.slice(
    (permisoPage - 1) * itemsPerPage,
    permisoPage * itemsPerPage
  );

  const totalPagesRoles = Math.ceil(filteredRoles.length / itemsPerPage);
  const totalPagesPermisos = Math.ceil(filteredPermisos.length / itemsPerPage);

  // Funciones de permisos
  const togglePermiso = (rolId: number, permisoId: number) =>
    setRolPermisos((prev) => {
      const current = prev[rolId] ?? [];
      return {
        ...prev,
        [rolId]: current.includes(permisoId)
          ? current.filter((id) => id !== permisoId)
          : [...current, permisoId],
      };
    });

  const seleccionarTodos = (rolId: number) =>
    setRolPermisos((prev) => ({
      ...prev,
      [rolId]: todosPermisos.map((p) => p.id_permiso),
    }));

  const deseleccionarTodos = (rolId: number) =>
    setRolPermisos((prev) => ({
      ...prev,
      [rolId]: [],
    }));

  const guardarPermisos = async (rolId: number) => {
    const asignados = rolPermisos[rolId] ?? [];
    if (asignados.length === 0) {
      await modal.alerta({
        titulo: "Error",
        mensaje: "Debe asignar al menos un permiso al rol.",
      });
      return;
    }
    const ok = await modal.confirmacion({
      titulo: "Confirmar cambios",
      mensaje: `Se asignarán ${asignados.length} permisos al rol. ¿Desea continuar?`,
    });
    if (!ok) return;
    Inertia.post(`/roles/${rolId}/permisos`, { permisos: asignados }, {
      preserveState: true,
      preserveScroll: true,
      onError: (pageErrors) => {
        const mensaje = pageErrors?.error ?? "No se pudo actualizar permisos.";
        modal.alerta({ titulo: "Error", mensaje });
      },
      onSuccess: () => {
        modal.alerta({ titulo: "Éxito", mensaje: "Permisos actualizados correctamente." });
      },
    });
  };

  const eliminarRol = async (rolId: number) => {
    const ok = await modal.confirmacion({
      titulo: "Eliminar rol",
      mensaje: "¿Está seguro que desea eliminar este rol? Esta acción no se puede deshacer.",
    });
    if (!ok) return;
    Inertia.delete(`/roles/${rolId}`, {
      preserveState: true,
      preserveScroll: true,
      onError: (pageErrors) => {
        const mensaje = pageErrors?.error ?? "No se pudo eliminar el rol.";
        modal.alerta({ titulo: "Error", mensaje });
      },
      onSuccess: () => {
        modal.alerta({ titulo: "Éxito", mensaje: "Rol eliminado correctamente." });
      },
    });
  };

  const eliminarPermiso = async (permisoId: number) => {
    const asignado = roles.some(
      (rol) => rolPermisos[rol.id_rol]?.includes(permisoId)
    );
    if (asignado) {
      modal.alerta({
        titulo: "Error",
        mensaje: "No se puede eliminar este permiso porque está asignado a uno o más roles.",
      });
      return;
    }
    const ok = await modal.confirmacion({
      titulo: "Eliminar permiso",
      mensaje: "¿Está seguro que desea eliminar este permiso? Esta acción no se puede deshacer.",
    });
    if (!ok) return;
    Inertia.delete(`/permisos/${permisoId}`, {
      preserveState: true,
      preserveScroll: true,
      onError: (pageErrors) => {
        const mensaje = pageErrors?.error ?? "No se pudo eliminar el permiso.";
        modal.alerta({ titulo: "Error", mensaje });
      },
      onSuccess: () => {
        modal.alerta({ titulo: "Éxito", mensaje: "Permiso eliminado correctamente." });
      },
    });
  };

  const toggleSection = (section: string) =>
    setSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );

  return (
    <>
      <Head title="Roles y Permisos" />
      <div
        className="max-w-7xl mx-auto px-6 py-6 space-y-6 text-[#000000]"
        style={{ fontFamily: "Open Sans, sans-serif" }}
      >
        {/* ========================================= */}
        {/* Selección de Secciones */}
        {/* ========================================= */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 mb-6">
          {/* Encabezado */}
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-2xl font-bold text-[#034991]">Seleccionar Secciones</h2>
            <button
              onClick={async () => {
                const confirmar = await modal.confirmacion({
                  titulo: "Mostrar todas las secciones",
                  mensaje: "¿Desea mostrar todas las secciones disponibles?",
                });
                if (confirmar) setSections(["roles", "permisos", "asignacion"]);
              }}
              className="bg-[#034991] hover:bg-[#023366] text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Mostrar Todo
            </button>
          </div>

          {/* Cuerpo */}
          <div className="flex flex-wrap gap-5 items-center">
            {[
              { id: "roles", label: "Roles" },
              { id: "permisos", label: "Permisos" },
              { id: "asignacion", label: "Asignación de Permisos" },
            ].map((sec) => (
              <label
                key={sec.id}
                className={`flex items-center gap-3 px-4 py-2 border rounded-lg cursor-pointer select-none transition-colors ${sections.includes(sec.id)
                    ? "bg-[#BEE3F8] border-[#034991] text-[#000000]"
                    : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={sections.includes(sec.id)}
                  onChange={async () => {
                    // Evita desmarcar todas las secciones
                    if (sections.length === 1 && sections.includes(sec.id)) {
                      await modal.alerta({
                        titulo: "Acción no permitida",
                        mensaje:
                          "Debe mantener al menos una sección seleccionada para continuar.",
                      });
                      return;
                    }
                    toggleSection(sec.id);
                  }}
                  className="w-4 h-4 accent-[#034991]"
                />
                <span className="font-medium">{sec.label}</span>
              </label>
            ))}
          </div>
        </div>;


        {/* ========================================= */}
        {/* Roles */}
        {/* ========================================= */}
        {sections.includes("roles") && (
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
            {/* Encabezado */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-2xl font-bold text-[#034991]">Gestión de Roles</h2>
              <Link
                href="/roles/create"
                className="bg-[#034991] hover:bg-[#023366] text-white px-5 py-2 rounded-lg font-semibold transition-colors"
              >
                + Agregar Rol
              </Link>
            </div>

            {/* Barra de búsqueda y configuración */}
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <input
                type="text"
                placeholder="🔍 Buscar rol..."
                value={searchRol}
                onChange={(e) => {
                  setSearchRol(e.target.value);
                  setRolPage(1);
                }}
                className="border border-gray-300 px-4 py-2 rounded-lg w-64 shadow-sm focus:ring-2 focus:ring-[#034991] focus:outline-none"
              />
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setRolPage(1);
                  setPermisoPage(1);
                }}
                className="border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#034991] focus:outline-none"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} por página
                  </option>
                ))}
              </select>
            </div>

            {/* Tabla de roles */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-[#A7A7A9] text-white uppercase text-sm">
                  <tr>
                    <th className="px-5 py-3 font-semibold">ID</th>
                    <th className="px-5 py-3 font-semibold">Nombre</th>
                    <th className="px-5 py-3 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRoles.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-gray-500">
                        No se encontraron roles.
                      </td>
                    </tr>
                  ) : (
                    paginatedRoles.map((rol) => (
                      <tr
                        key={rol.id_rol}
                        className="hover:bg-[#E8EEF7] transition-colors border-b last:border-none"
                      >
                        <td className="px-5 py-3">{rol.id_rol}</td>
                        <td className="px-5 py-3 font-medium text-gray-800">
                          {rol.nombre_rol}
                        </td>
                        <td className="px-5 py-3 flex justify-center gap-3">
                          <Link
                            href={`/roles/${rol.id_rol}/edit`}
                            className="bg-[#034991] hover:bg-[#023366] text-white px-4 py-1.5 rounded-lg transition-colors"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => eliminarRol(rol.id_rol)}
                            className="bg-[#CD1719] hover:bg-[#a31314] text-white px-4 py-1.5 rounded-lg transition-colors"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex justify-center gap-2 mt-5">
              {Array.from({ length: totalPagesRoles }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setRolPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${rolPage === page
                    ? "bg-[#034991] text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}


        {/* ========================================= */}
        {/* Permisos */}
        {/* ========================================= */}
        {sections.includes("permisos") && (
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
            {/* Encabezado */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-2xl font-bold text-[#034991]">Gestión de Permisos</h2>
              <Link
                href="/permisos/create"
                className="bg-[#034991] hover:bg-[#023366] text-white px-5 py-2 rounded-lg font-semibold transition-colors"
              >
                + Agregar Permiso
              </Link>
            </div>

            {/* Barra de búsqueda y configuración */}
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <input
                type="text"
                placeholder="🔍 Buscar permiso..."
                value={searchPermiso}
                onChange={(e) => {
                  setSearchPermiso(e.target.value);
                  setPermisoPage(1);
                }}
                className="border border-gray-300 px-4 py-2 rounded-lg w-64 shadow-sm focus:ring-2 focus:ring-[#034991] focus:outline-none"
              />
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setRolPage(1);
                  setPermisoPage(1);
                }}
                className="border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#034991] focus:outline-none"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} por página
                  </option>
                ))}
              </select>
            </div>

            {/* Tabla de permisos */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-[#A7A7A9] text-white uppercase text-sm">
                  <tr>
                    <th className="px-5 py-3 font-semibold">ID</th>
                    <th className="px-5 py-3 font-semibold">Nombre</th>
                    <th className="px-5 py-3 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPermisos.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-gray-500">
                        No se encontraron permisos.
                      </td>
                    </tr>
                  ) : (
                    paginatedPermisos.map((permiso) => (
                      <tr
                        key={permiso.id_permiso}
                        className="hover:bg-[#E8EEF7] transition-colors border-b last:border-none"
                      >
                        <td className="px-5 py-3">{permiso.id_permiso}</td>
                        <td className="px-5 py-3 font-medium text-gray-800">
                          {permiso.nombre}
                        </td>
                        <td className="px-5 py-3 flex justify-center gap-3">
                          <Link
                            href={`/permisos/${permiso.id_permiso}/edit`}
                            className="bg-[#034991] hover:bg-[#023366] text-white px-4 py-1.5 rounded-lg transition-colors"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => eliminarPermiso(permiso.id_permiso)}
                            className="bg-[#CD1719] hover:bg-[#a31314] text-white px-4 py-1.5 rounded-lg transition-colors"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex justify-center gap-2 mt-5">
              {Array.from({ length: totalPagesPermisos }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPermisoPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${permisoPage === page
                    ? "bg-[#034991] text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}


        {/* ========================================= */}
        {/* Asignación de permisos */}
        {/* ========================================= */}
        {sections.includes("asignacion") && (
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-[#034991] mb-6 border-b-2 border-[#A7A7A9] pb-2">
              Asignación de Permisos a Roles
            </h2>

            {roles.map((rol) => (
              <div
                key={rol.id_rol}
                className="mb-4 rounded-lg border border-gray-200 bg-gray-50 hover:shadow-md transition-shadow duration-300"
              >
                {/* Encabezado del rol */}
                <button
                  className="w-full flex justify-between items-center px-4 py-3 font-semibold text-[#034991] bg-gray-200 hover:bg-[#034991] hover:text-white rounded-t-lg transition-colors"
                  onClick={() => setRolAbierto((prev) => (prev === rol.id_rol ? null : rol.id_rol))}
                >
                  <span>{rol.nombre_rol}</span>
                  <span className="text-xl">{rolAbierto === rol.id_rol ? "▲" : "▼"}</span>
                </button>

                {/* Permisos asignados */}
                {rolAbierto === rol.id_rol && (
                  <div className="p-4 bg-white rounded-b-lg">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                        onClick={() => seleccionarTodos(rol.id_rol)}
                        className="px-4 py-1.5 text-sm font-medium bg-[#034991] text-white rounded hover:bg-[#023366] transition-colors"
                      >
                        Seleccionar Todo
                      </button>
                      <button
                        onClick={() => deseleccionarTodos(rol.id_rol)}
                        className="px-4 py-1.5 text-sm font-medium bg-[#A7A7A9] text-black rounded hover:bg-gray-400 transition-colors"
                      >
                        Deseleccionar Todo
                      </button>
                    </div>

                    <div
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border rounded"
                      style={{ fontFamily: "Open Sans, sans-serif" }}
                    >
                      {todosPermisos.map((p) => {
                        const asignado = rolPermisos[rol.id_rol]?.includes(p.id_permiso) ?? false;
                        return (
                          <label
                            key={p.id_permiso}
                            className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm transition-colors ${asignado
                              ? "bg-[#BEE3F8] border-[#034991] text-[#000000]"
                              : "bg-gray-100 hover:bg-gray-200"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={!!asignado}
                              onChange={() => togglePermiso(rol.id_rol, p.id_permiso)}
                              className="accent-[#034991] w-4 h-4"
                            />
                            <span className="truncate">{p.nombre}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => guardarPermisos(rol.id_rol)}
                        className="bg-[#CD1719] text-white px-5 py-2 rounded font-semibold hover:bg-[#a31314] transition-all"
                      >
                        Guardar Permisos
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

Index.layout = (page: React.ReactNode & { props: RolesPermisosIndexProps }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
