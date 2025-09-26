import React, { useEffect, useState, useRef } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";

interface Permiso { id_permiso: number; nombre: string }
interface Rol { id_rol: number; nombre_rol: string; permisos: Permiso[] }
interface LinkItem { url: string | null; label: string; active: boolean }

interface Paginated<T> { data: T[]; links: LinkItem[] }

interface RolesPermisosIndexProps {
  roles: Paginated<Rol>;
  permisos: Paginated<Permiso>;
  todosPermisos: Permiso[];
  userPermisos: number[];
  filters: { searchRol?: string; searchPermiso?: string };
  visibleSections?: string[];
  flash?: { success?: string; error?: string };
  errors?: { error?: string };
}

function extractErrorMessage(errs: any): string | null {
  if (!errs) return null;
  if (typeof errs === "string") return errs;
  if (errs.error) return errs.error;
  if (errs.message) return errs.message;
  // validation style: { field: ["msg"] }
  for (const k in errs) {
    const v = errs[k];
    if (Array.isArray(v) && v.length) return v[0];
    if (typeof v === "string") return v;
  }
  return null;
}

export default function Index(props: RolesPermisosIndexProps) {
  const {
    roles,
    permisos,
    todosPermisos,
    userPermisos,
    filters = {},
    visibleSections = ["roles", "permisos", "asignacion"],
    flash,
    errors: propsErrors,
  } = props;

  const page = usePage().props as any;
  const pageFlash = page?.flash ?? {};
  const pageErrors = page?.errors ?? propsErrors ?? {};

  const mergedFlash = { ...pageFlash, ...flash };

  const modal = useModal();

  // 🔹 Mostrar mensajes globales con el modal
  useEffect(() => {
    if (mergedFlash?.error) {
      modal.alerta({ titulo: "Error", mensaje: mergedFlash.error });
    }
    if (mergedFlash?.success) {
      modal.alerta({ titulo: "Éxito", mensaje: mergedFlash.success });
    }
    if (pageErrors?.error) {
      modal.alerta({ titulo: "Error", mensaje: pageErrors.error });
    }
  }, [mergedFlash, pageErrors]);

  // state
  const [rolPermisos, setRolPermisos] = useState<Record<number, number[]>>({});
  const [rolAbierto, setRolAbierto] = useState<number | null>(null);
  const [sections, setSections] = useState<string[]>(visibleSections);

  // controlled search inputs
  const [searchRolInput, setSearchRolInput] = useState<string>(filters.searchRol ?? "");
  const [searchPermisoInput, setSearchPermisoInput] = useState<string>(filters.searchPermiso ?? "");

  // debounce refs
  const rolTimer = useRef<number | null>(null);
  const permisoTimer = useRef<number | null>(null);

  // mapear permisos por rol al recibir roles
  useEffect(() => {
    const map: Record<number, number[]> = {};
    roles.data.forEach((r) => (map[r.id_rol] = r.permisos.map((p) => p.id_permiso)));
    setRolPermisos(map);
  }, [roles]);

  // sincronizar inputs si filters vienen desde servidor
  useEffect(() => {
    setSearchRolInput(filters.searchRol ?? "");
    setSearchPermisoInput(filters.searchPermiso ?? "");
  }, [filters.searchRol, filters.searchPermiso]);

  // UI helpers
  const togglePermiso = (rolId: number, permisoId: number) =>
    setRolPermisos((prev) => {
      const current = prev[rolId] ?? [];
      return {
        ...prev,
        [rolId]: current.includes(permisoId) ? current.filter((id) => id !== permisoId) : [...current, permisoId],
      };
    });

  const seleccionarTodos = (rolId: number) =>
    setRolPermisos((prev) => ({ ...prev, [rolId]: todosPermisos.map((p) => p.id_permiso) }));

  const deseleccionarTodos = (rolId: number) =>
    setRolPermisos((prev) => ({ ...prev, [rolId]: [] }));

  const toggleRol = (rolId: number) => setRolAbierto((prev) => (prev === rolId ? null : rolId));

  const toggleSection = (section: string) =>
    setSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]));

  // BUSCAR (envía ambos filtros y las secciones visibles)
  const buscar = (searchRol: string, searchPermiso: string) => {
    Inertia.get(
      "/roles_permisos",
      { searchRol, searchPermiso, visibleSections: sections },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  // debounce handlers
  const onChangeSearchRol = (value: string) => {
    setSearchRolInput(value);
    if (rolTimer.current) window.clearTimeout(rolTimer.current);
    rolTimer.current = window.setTimeout(() => {
      buscar(value, searchPermisoInput);
      rolTimer.current = null;
    }, 500);
  };

  const onChangeSearchPermiso = (value: string) => {
    setSearchPermisoInput(value);
    if (permisoTimer.current) window.clearTimeout(permisoTimer.current);
    permisoTimer.current = window.setTimeout(() => {
      buscar(searchRolInput, value);
      permisoTimer.current = null;
    }, 500);
  };

  const onKeyDownSearchRol = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (rolTimer.current) { window.clearTimeout(rolTimer.current); rolTimer.current = null; }
      buscar(searchRolInput, searchPermisoInput);
    }
  };
  const onKeyDownSearchPermiso = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (permisoTimer.current) { window.clearTimeout(permisoTimer.current); permisoTimer.current = null; }
      buscar(searchRolInput, searchPermisoInput);
    }
  };

  // Guardar permisos asignados a un rol
  const guardarPermisos = async (rolId: number) => {
    const asignados = rolPermisos[rolId] ?? [];
    if (asignados.length === 0) {
      await modal.alerta({ titulo: "Error", mensaje: "Debe asignar al menos un permiso al rol." });
      return;
    }
    const ok = await modal.confirmacion({
      titulo: "Confirmar cambios",
      mensaje: `Se asignarán ${asignados.length} permisos al rol. ¿Desea continuar?`,
    });
    if (!ok) return;

    Inertia.post(
      `/roles/${rolId}/permisos`,
      { permisos: asignados },
      {
        preserveState: true,
        preserveScroll: true,
        onSuccess: async () => {
          await modal.alerta({ titulo: "Éxito", mensaje: "Permisos actualizados correctamente." });
        },
        onError: async (errs: any) => {
          const m = extractErrorMessage(errs) ?? "Ocurrió un error al actualizar permisos.";
          await modal.alerta({ titulo: "Error", mensaje: m });
        },
      }
    );
  };

  // Eliminar rol
  const eliminarRol = async (rolId: number) => {
    const permisosAsignados = rolPermisos[rolId]?.length ?? 0;
    let mensaje = "¿Desea eliminar este rol?";
    if (permisosAsignados > 0) {
      mensaje = `Este rol tiene ${permisosAsignados} permisos asignados. Al eliminarlo, todos los permisos serán desasignados. ¿Desea continuar?`;
    }
    const ok = await modal.confirmacion({ titulo: "Eliminar rol", mensaje });
    if (!ok) return;

    Inertia.delete(`/roles/${rolId}`, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: async () => {
        await modal.alerta({ titulo: "Éxito", mensaje: "Rol eliminado correctamente." });
      },
      onError: async (errs: any) => {
        const m = extractErrorMessage(errs) ?? "No se pudo eliminar el rol.";
        await modal.alerta({ titulo: "Error", mensaje: m });
      },
    });
  };

  // Eliminar permiso (captura error y lo muestra en modal)
  const eliminarPermiso = async (permisoId: number) => {
    const ok = await modal.confirmacion({ titulo: "Eliminar permiso", mensaje: "¿Desea eliminar este permiso?" });
    if (!ok) return;

    Inertia.delete(`/permisos/${permisoId}`, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: async () => {
        await modal.alerta({ titulo: "Éxito", mensaje: "Permiso eliminado correctamente." });
      },
      onError: async (errs: any) => {
        const m = extractErrorMessage(errs) ?? "No se pudo eliminar el permiso. Verifique si está asignado a un rol.";
        await modal.alerta({ titulo: "Error", mensaje: m });
      },
    });
  };

  // Paginación (usa link.url generado por backend)
  const cambiarPagina = (linkUrl: string | null) => {
    if (!linkUrl) return;
    Inertia.visit(linkUrl, {
      preserveState: true,
      preserveScroll: true,
      data: { searchRol: searchRolInput, searchPermiso: searchPermisoInput, visibleSections: sections } as any,
    });
  };

  return (
    <>
      <Head title="Roles y Permisos" />
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6 text-black">
        {/* Secciones */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <h2 className="text-lg font-bold mb-2">Seleccionar Secciones</h2>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sections.includes("roles")} onChange={() => toggleSection("roles")} />
              Roles
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sections.includes("permisos")} onChange={() => toggleSection("permisos")} />
              Permisos
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sections.includes("asignacion")} onChange={() => toggleSection("asignacion")} />
              Asignación de Permisos
            </label>
            <button className="ml-auto bg-[#034991] hover:bg-[#0563c1] text-white px-3 py-1 rounded" onClick={() => setSections(["roles", "permisos", "asignacion"])}>
              Mostrar Todo
            </button>
          </div>
        </div>

        {/* Mensajes globales (texto plano de respaldo) */}
        {mergedFlash?.success && <div className="bg-green-50 text-green-800 p-3 rounded">{mergedFlash.success}</div>}
        {mergedFlash?.error && <div className="bg-red-50 text-red-800 p-3 rounded">{mergedFlash.error}</div>}
        {pageErrors?.error && <div className="bg-red-50 text-red-800 p-3 rounded">{pageErrors.error}</div>}

        {/* Roles */}
        {sections.includes("roles") && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Roles</h2>
              <Link href="/roles/create" className="bg-[#034991] hover:bg-[#0563c1] text-white px-4 py-2 rounded">Agregar Rol</Link>
            </div>

            {/* Buscador Roles */}
            <div className="relative w-full mb-4">
              <label htmlFor="buscarRol" className="sr-only">Buscar Rol</label>
              <input
                id="buscarRol"
                type="text"
                placeholder="Buscar Rol..."
                value={searchRolInput}
                onChange={(e) => onChangeSearchRol(e.target.value)}
                onKeyDown={onKeyDownSearchRol}
                className="border px-3 py-2 rounded w-full pl-10"
              />
              <span className="absolute left-3 top-2.5 text-gray-400" aria-hidden>🔍</span>
            </div>

            <table className="w-full table-auto border border-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Nombre</th>
                  <th className="px-4 py-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.data.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-3 text-center text-gray-500">No se encontraron roles.</td></tr>
                ) : roles.data.map((rol) => (
                  <tr key={rol.id_rol} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{rol.id_rol}</td>
                    <td className="px-4 py-2 border">{rol.nombre_rol}</td>
                    <td className="px-4 py-2 border flex gap-2">
                      <Link href={`/roles/${rol.id_rol}/edit`} className="bg-[#0D47A1] hover:bg-blue-800 text-white px-3 py-1 rounded">Actualizar</Link>
                      <button onClick={() => eliminarRol(rol.id_rol)} className="bg-[#B71C1C] hover:bg-red-800 text-white px-3 py-1 rounded">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* paginacion roles */}
            <div className="flex gap-2 mt-3">
              {roles.links.map((link, i) => (
                <button
                  key={i}
                  disabled={!link.url}
                  onClick={() => cambiarPagina(link.url)}
                  className={`px-3 py-1 rounded ${link.active ? "bg-[#034991] text-white" : "bg-gray-200"}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Permisos */}
        {sections.includes("permisos") && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Permisos</h2>
              <Link href="/permisos/create" className="bg-[#034991] hover:bg-[#0563c1] text-white px-4 py-2 rounded">Agregar Permiso</Link>
            </div>

            {/* Buscador Permisos */}
            <div className="relative w-full mb-4">
              <label htmlFor="buscarPermiso" className="sr-only">Buscar Permiso</label>
              <input
                id="buscarPermiso"
                type="text"
                placeholder="Buscar Permiso..."
                value={searchPermisoInput}
                onChange={(e) => onChangeSearchPermiso(e.target.value)}
                onKeyDown={onKeyDownSearchPermiso}
                className="border px-3 py-2 rounded w-full pl-10"
              />
              <span className="absolute left-3 top-2.5 text-gray-400" aria-hidden>🔍</span>
            </div>

            <table className="w-full table-auto border border-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Nombre</th>
                  <th className="px-4 py-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {permisos.data.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-3 text-center text-gray-500">No se encontraron permisos.</td></tr>
                ) : permisos.data.map((permiso) => (
                  <tr key={permiso.id_permiso} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{permiso.id_permiso}</td>
                    <td className="px-4 py-2 border">{permiso.nombre}</td>
                    <td className="px-4 py-2 border flex gap-2">
                      <Link href={`/permisos/${permiso.id_permiso}/edit`} className="bg-[#0D47A1] hover:bg-blue-800 text-white px-3 py-1 rounded">Actualizar</Link>
                      <button onClick={() => eliminarPermiso(permiso.id_permiso)} className="bg-[#B71C1C] hover:bg-red-800 text-white px-3 py-1 rounded">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* paginacion permisos */}
            <div className="flex gap-2 mt-3">
              {permisos.links.map((link, i) => (
                <button
                  key={i}
                  disabled={!link.url}
                  onClick={() => cambiarPagina(link.url)}
                  className={`px-3 py-1 rounded ${link.active ? "bg-[#034991] text-white" : "bg-gray-200"}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Asignación de permisos */}
        {sections.includes("asignacion") && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Asignación de Permisos a Roles</h2>
            {roles.data.map((rol) => (
              <div key={rol.id_rol} className="mb-6 border-b pb-4">
                <button className="w-full text-left font-semibold px-3 py-2 bg-gray-100 rounded" onClick={() => toggleRol(rol.id_rol)}>
                  {rol.nombre_rol} {rolAbierto === rol.id_rol ? "▲" : "▼"}
                </button>
                {rolAbierto === rol.id_rol && (
                  <div className="mt-2">
                    <div className="flex gap-2 mb-2">
                      <button onClick={() => seleccionarTodos(rol.id_rol)} className="px-3 py-1 bg-blue-600 text-white rounded">Seleccionar Todo</button>
                      <button onClick={() => deseleccionarTodos(rol.id_rol)} className="px-3 py-1 bg-gray-300 rounded">Deseleccionar Todo</button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-80 overflow-y-auto border rounded p-2">
                      {todosPermisos.map((p) => {
                        const asignado = rolPermisos[rol.id_rol]?.includes(p.id_permiso) ?? false;
                        return (
                          <label key={p.id_permiso} className={`flex items-center gap-2 border rounded px-2 py-1 cursor-pointer ${asignado ? "bg-blue-50" : ""}`}>
                            <input type="checkbox" checked={!!asignado} onChange={() => togglePermiso(rol.id_rol, p.id_permiso)} />
                            <span>{p.nombre}</span>
                          </label>
                        );
                      })}
                    </div>

                    <button onClick={() => guardarPermisos(rol.id_rol)} className="bg-[#0D47A1] hover:bg-blue-800 text-white px-4 py-1 mt-3 rounded">Guardar Permisos</button>
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
