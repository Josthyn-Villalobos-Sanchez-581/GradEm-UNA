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
        {/* Selección de secciones */}
        <div className="bg-[#FFFFFF] shadow rounded-lg p-4 mb-6">
          <h2 className="text-lg font-bold mb-2 text-[#034991]">Seleccionar Secciones</h2>
          <div className="flex gap-4 items-center flex-wrap">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sections.includes("roles")}
                onChange={() => toggleSection("roles")}
              />
              Roles
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sections.includes("permisos")}
                onChange={() => toggleSection("permisos")}
              />
              Permisos
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sections.includes("asignacion")}
                onChange={() => toggleSection("asignacion")}
              />
              Asignación de Permisos
            </label>
            <button
              onClick={() => setSections(["roles", "permisos", "asignacion"])}
              className="ml-auto bg-[#034991] text-[#FFFFFF] px-3 py-1 rounded hover:bg-[#023163]"
            >
              Mostrar Todo
            </button>
          </div>
        </div>


        {/* Roles */}
        {sections.includes("roles") && (
          <div className="bg-[#FFFFFF] shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#034991]">Roles</h2>
              <Link
                href="/roles/create"
                className="bg-[#034991] text-[#FFFFFF] px-4 py-2 rounded hover:bg-[#023163]"
              >
                Agregar Rol
              </Link>
            </div>
            <div className="flex items-center justify-between mb-4 gap-4">
              <input
                type="text"
                placeholder="Buscar Rol..."
                value={searchRol}
                onChange={(e) => {
                  setSearchRol(e.target.value);
                  setRolPage(1);
                }}
                className="border px-3 py-2 rounded w-64"
              />
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setRolPage(1);
                  setPermisoPage(1);
                }}
                className="border px-2 py-2 rounded"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} por página
                  </option>
                ))}
              </select>
            </div>
            <table className="w-full border rounded-lg">
              <thead className="bg-[#A7A7A9] text-[#FFFFFF]">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRoles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-3">
                      No se encontraron roles
                    </td>
                  </tr>
                ) : (
                  paginatedRoles.map((rol) => (
                    <tr key={rol.id_rol} className="hover:bg-[#A7A7A9]">
                      <td className="px-4 py-2">{rol.id_rol}</td>
                      <td className="px-4 py-2">{rol.nombre_rol}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <Link
                          href={`/roles/${rol.id_rol}/edit`}
                          className="bg-[#034991] text-[#FFFFFF] px-3 py-1 rounded"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => eliminarRol(rol.id_rol)}
                          className="bg-[#CD1719] text-[#FFFFFF] px-3 py-1 rounded"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex gap-2 mt-3">
              {Array.from({ length: totalPagesRoles }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setRolPage(page)}
                  className={`px-3 py-1 rounded ${rolPage === page ? "bg-[#034991] text-[#FFFFFF]" : "bg-[#A7A7A9] text-[#000000]"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Permisos */}
        {sections.includes("permisos") && (
          <div className="bg-[#FFFFFF] shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#034991]">Permisos</h2>
              <Link
                href="/permisos/create"
                className="bg-[#034991] text-[#FFFFFF] px-4 py-2 rounded hover:bg-[#023163]"
              >
                Agregar Permiso
              </Link>
            </div>
            <div className="flex items-center justify-between mb-4 gap-4">
              <input
                type="text"
                placeholder="Buscar Permiso..."
                value={searchPermiso}
                onChange={(e) => {
                  setSearchPermiso(e.target.value);
                  setPermisoPage(1);
                }}
                className="border px-3 py-2 rounded w-64"
              />
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setRolPage(1);
                  setPermisoPage(1);
                }}
                className="border px-2 py-2 rounded"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} por página
                  </option>
                ))}
              </select>
            </div>
            <table className="w-full border rounded-lg">
              <thead className="bg-[#A7A7A9] text-[#FFFFFF]">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPermisos.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-3">
                      No se encontraron permisos
                    </td>
                  </tr>
                ) : (
                  paginatedPermisos.map((permiso) => (
                    <tr key={permiso.id_permiso} className="hover:bg-[#A7A7A9]">
                      <td className="px-4 py-2">{permiso.id_permiso}</td>
                      <td className="px-4 py-2">{permiso.nombre}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <Link
                          href={`/permisos/${permiso.id_permiso}/edit`}
                          className="bg-[#034991] text-[#FFFFFF] px-3 py-1 rounded"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => eliminarPermiso(permiso.id_permiso)}
                          className="bg-[#CD1719] text-[#FFFFFF] px-3 py-1 rounded"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex gap-2 mt-3">
              {Array.from({ length: totalPagesPermisos }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPermisoPage(page)}
                  className={`px-3 py-1 rounded ${permisoPage === page ? "bg-[#034991] text-[#FFFFFF]" : "bg-[#A7A7A9] text-[#000000]"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Asignación de permisos */}
        {sections.includes("asignacion") && (
          <div className="bg-[#FFFFFF] shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-[#034991]">Asignación de Permisos a Roles</h2>
            {roles.map((rol) => (
              <div key={rol.id_rol} className="mb-6 border-b pb-4">
                <button
                  className="w-full text-left font-semibold px-3 py-2 bg-[#A7A7A9] text-[#000000] rounded"
                  onClick={() => setRolAbierto((prev) => (prev === rol.id_rol ? null : rol.id_rol))}
                >
                  {rol.nombre_rol} {rolAbierto === rol.id_rol ? "▲" : "▼"}
                </button>
                {rolAbierto === rol.id_rol && (
                  <div className="mt-2">
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => seleccionarTodos(rol.id_rol)}
                        className="px-3 py-1 bg-[#034991] text-[#FFFFFF] rounded"
                      >
                        Seleccionar Todo
                      </button>
                      <button
                        onClick={() => deseleccionarTodos(rol.id_rol)}
                        className="px-3 py-1 bg-[#A7A7A9] text-[#000000] rounded"
                      >
                        Deseleccionar Todo
                      </button>
                    </div>
                    <div
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto border rounded p-2"
                      style={{ fontFamily: "Open Sans, sans-serif" }}
                    >
                      {todosPermisos.map((p) => {
                        const asignado =
                          rolPermisos[rol.id_rol]?.includes(p.id_permiso) ?? false;
                        return (
                          <label
                            key={p.id_permiso}
                            className={`flex items-center gap-2 border rounded px-2 py-1 cursor-pointer ${asignado ? "bg-[#BEE3F8] text-[#000000]" : ""
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={!!asignado}
                              onChange={() => togglePermiso(rol.id_rol, p.id_permiso)}
                            />
                            <span>{p.nombre}</span>
                          </label>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => guardarPermisos(rol.id_rol)}
                      className="bg-[#034991] text-[#FFFFFF] px-4 py-1 mt-3 rounded"
                    >
                      Guardar Permisos
                    </button>
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
