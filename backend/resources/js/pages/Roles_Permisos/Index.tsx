//backend/resources/js/pages/Roles_Permisos/Index.tsx
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

  useEffect(() => {
    if (mergedFlash?.error) modal.alerta({ titulo: "Error", mensaje: mergedFlash.error });
    if (mergedFlash?.success) modal.alerta({ titulo: "Éxito", mensaje: mergedFlash.success });
    if (pageErrors?.error) modal.alerta({ titulo: "Error", mensaje: pageErrors.error });
  }, [mergedFlash, pageErrors]);

  const [rolPermisos, setRolPermisos] = useState<Record<number, number[]>>({});
  const [rolAbierto, setRolAbierto] = useState<number | null>(null);
  const [sections, setSections] = useState<string[]>(visibleSections);

  const [searchRolInput, setSearchRolInput] = useState<string>(filters.searchRol ?? "");
  const [searchPermisoInput, setSearchPermisoInput] = useState<string>(filters.searchPermiso ?? "");

  const rolTimer = useRef<number | null>(null);
  const permisoTimer = useRef<number | null>(null);

  useEffect(() => {
    const map: Record<number, number[]> = {};
    roles.data.forEach((r) => (map[r.id_rol] = r.permisos.map((p) => p.id_permiso)));
    setRolPermisos(map);
  }, [roles]);

  useEffect(() => {
    setSearchRolInput(filters.searchRol ?? "");
    setSearchPermisoInput(filters.searchPermiso ?? "");
  }, [filters.searchRol, filters.searchPermiso]);

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

  const buscar = (searchRol: string, searchPermiso: string) => {
  Inertia.get(
    "/roles_permisos",
    { 
      searchRol, 
      searchPermiso, 
      visibleSections: Array.from(new Set(sections)) // ✅ elimina duplicados
    },
    { preserveState: true, preserveScroll: true, replace: true }
  );
};

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
      if (rolTimer.current) window.clearTimeout(rolTimer.current);
      buscar(searchRolInput, searchPermisoInput);
    }
  };
  const onKeyDownSearchPermiso = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (permisoTimer.current) window.clearTimeout(permisoTimer.current);
      buscar(searchRolInput, searchPermisoInput);
    }
  };

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
        onSuccess: async () => modal.alerta({ titulo: "Éxito", mensaje: "Permisos actualizados correctamente." }),
        onError: async (errs: any) => {
          const m = extractErrorMessage(errs) ?? "Ocurrió un error al actualizar permisos.";
          modal.alerta({ titulo: "Error", mensaje: m });
        },
      }
    );
  };

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
      onSuccess: async () => modal.alerta({ titulo: "Éxito", mensaje: "Rol eliminado correctamente." }),
      onError: async (errs: any) => {
        const m = extractErrorMessage(errs) ?? "No se pudo eliminar el rol.";
        modal.alerta({ titulo: "Error", mensaje: m });
      },
    });
  };

  const eliminarPermiso = async (permisoId: number) => {
    const ok = await modal.confirmacion({ titulo: "Eliminar permiso", mensaje: "¿Desea eliminar este permiso?" });
    if (!ok) return;

    Inertia.delete(`/permisos/${permisoId}`, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: async () => modal.alerta({ titulo: "Éxito", mensaje: "Permiso eliminado correctamente." }),
      onError: async (errs: any) => {
        const m = extractErrorMessage(errs) ?? "No se pudo eliminar el permiso. Verifique si está asignado a un rol.";
        modal.alerta({ titulo: "Error", mensaje: m });
      },
    });
  };

  const cambiarPagina = (linkUrl: string | null, tipo: 'roles' | 'permisos') => {
  if (!linkUrl) return;
  Inertia.visit(linkUrl, {
    preserveState: true,
    preserveScroll: true,
    data: { 
      searchRol: searchRolInput, 
      searchPermiso: searchPermisoInput, 
      visibleSections: Array.from(new Set(sections)), // ✅ elimina duplicados
    } as any,
  });
};

  return (
    <>
      <Head title="Roles y Permisos" />
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6 text-[#000000]">
        {/* Secciones */}
        <div className="bg-[#FFFFFF] shadow rounded-lg p-4 mb-6">
          <h2 className="text-lg font-bold mb-2 text-[#034991]">Seleccionar Secciones</h2>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 text-[#000000]">
              <input type="checkbox" checked={sections.includes("roles")} onChange={() => toggleSection("roles")} />
              Roles
            </label>
            <label className="flex items-center gap-2 text-[#000000]">
              <input type="checkbox" checked={sections.includes("permisos")} onChange={() => toggleSection("permisos")} />
              Permisos
            </label>
            <label className="flex items-center gap-2 text-[#000000]">
              <input type="checkbox" checked={sections.includes("asignacion")} onChange={() => toggleSection("asignacion")} />
              Asignación de Permisos
            </label>
            <button
              className="ml-auto bg-[#034991] active:bg-[#023163] text-[#FFFFFF] px-3 py-1 rounded"
              onClick={() => setSections(["roles", "permisos", "asignacion"])}
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
              <Link href="/roles/create" className="bg-[#034991] active:bg-[#023163] text-[#FFFFFF] px-4 py-2 rounded">Agregar Rol</Link>
            </div>

            {/* Buscador Roles */}
            <div className="relative w-full mb-4">
              <input
                id="buscarRol"
                type="text"
                placeholder="Buscar Rol..."
                value={searchRolInput}
                onChange={(e) => onChangeSearchRol(e.target.value)}
                onKeyDown={onKeyDownSearchRol}
                className="border border-[#A7A7A9] px-3 py-2 rounded w-full pl-10 text-[#000000]"
              />
              <span className="absolute left-3 top-2.5 text-[#A7A7A9]" aria-hidden>🔍</span>
            </div>

            <table className="w-full table-auto border border-[#A7A7A9]">
              <thead className="bg-[#A7A7A9]">
                <tr>
                  <th className="px-4 py-2 border border-[#A7A7A9] text-[#000000]">ID</th>
                  <th className="px-4 py-2 border border-[#A7A7A9] text-[#000000]">Nombre</th>
                  <th className="px-4 py-2 border border-[#A7A7A9] text-[#000000]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.data.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-3 text-center text-[#A7A7A9]">No se encontraron roles.</td></tr>
                ) : roles.data.map((rol) => (
                  <tr key={rol.id_rol} className="hover:bg-[#A7A7A9]/20">
                    <td className="px-4 py-2 border border-[#A7A7A9]">{rol.id_rol}</td>
                    <td className="px-4 py-2 border border-[#A7A7A9]">{rol.nombre_rol}</td>
                    <td className="px-4 py-2 border border-[#A7A7A9] flex gap-2">
                      <Link href={`/roles/${rol.id_rol}/edit`} className="bg-[#034991] active:bg-[#023163] text-[#FFFFFF] px-3 py-1 rounded">Actualizar</Link>
                      <button onClick={() => eliminarRol(rol.id_rol)} className="bg-[#CD1719] active:bg-[#9e1113] text-[#FFFFFF] px-3 py-1 rounded">Eliminar</button>
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
                  onClick={() => cambiarPagina(link.url, 'roles')} // 👈 agregamos 'roles' como segundo argumento
                  className={`px-3 py-1 rounded ${link.active ? "bg-[#034991] text-[#FFFFFF]" : "bg-[#A7A7A9] text-[#000000]"}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Permisos */}
        {sections.includes("permisos") && (
          <div className="bg-[#FFFFFF] shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#034991]">Permisos</h2>
              <Link href="/permisos/create" className="bg-[#034991] active:bg-[#023163] text-[#FFFFFF] px-4 py-2 rounded">Agregar Permiso</Link>
            </div>

            {/* Buscador Permisos */}
            <div className="relative w-full mb-4">
              <input
                id="buscarPermiso"
                type="text"
                placeholder="Buscar Permiso..."
                value={searchPermisoInput}
                onChange={(e) => onChangeSearchPermiso(e.target.value)}
                onKeyDown={onKeyDownSearchPermiso}
                className="border border-[#A7A7A9] px-3 py-2 rounded w-full pl-10 text-[#000000]"
              />
              <span className="absolute left-3 top-2.5 text-[#A7A7A9]" aria-hidden>🔍</span>
            </div>

            <table className="w-full table-auto border border-[#A7A7A9]">
              <thead className="bg-[#A7A7A9]">
                <tr>
                  <th className="px-4 py-2 border border-[#A7A7A9] text-[#000000]">ID</th>
                  <th className="px-4 py-2 border border-[#A7A7A9] text-[#000000]">Nombre</th>
                  <th className="px-4 py-2 border border-[#A7A7A9] text-[#000000]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {permisos.data.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-3 text-center text-[#A7A7A9]">No se encontraron permisos.</td></tr>
                ) : permisos.data.map((permiso) => (
                  <tr key={permiso.id_permiso} className="hover:bg-[#A7A7A9]/20">
                    <td className="px-4 py-2 border border-[#A7A7A9]">{permiso.id_permiso}</td>
                    <td className="px-4 py-2 border border-[#A7A7A9]">{permiso.nombre}</td>
                    <td className="px-4 py-2 border border-[#A7A7A9] flex gap-2">
                      <Link href={`/permisos/${permiso.id_permiso}/edit`} className="bg-[#034991] active:bg-[#023163] text-[#FFFFFF] px-3 py-1 rounded">Actualizar</Link>
                      <button onClick={() => eliminarPermiso(permiso.id_permiso)} className="bg-[#CD1719] active:bg-[#9e1113] text-[#FFFFFF] px-3 py-1 rounded">Eliminar</button>
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
                  onClick={() => cambiarPagina(link.url, 'permisos')} // 👈 agregamos 'permisos' como segundo argumento
                  className={`px-3 py-1 rounded ${link.active ? "bg-[#034991] text-[#FFFFFF]" : "bg-[#A7A7A9] text-[#000000]"}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Asignación de permisos */}
        {sections.includes("asignacion") && (
          <div className="bg-[#FFFFFF] shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-[#034991]">Asignación de Permisos a Roles</h2>
            {roles.data.map((rol) => (
              <div key={rol.id_rol} className="mb-6 border-b pb-4 border-[#A7A7A9]">
                <button
                  className="w-full text-left font-semibold px-3 py-2 bg-[#A7A7A9]/40 rounded"
                  onClick={() => toggleRol(rol.id_rol)}
                >
                  {rol.nombre_rol} {rolAbierto === rol.id_rol ? "▲" : "▼"}
                </button>
                {rolAbierto === rol.id_rol && (
                  <div className="mt-2">
                    <div className="flex gap-2 mb-2">
                      <button onClick={() => seleccionarTodos(rol.id_rol)} className="px-3 py-1 bg-[#034991] active:bg-[#023163] text-[#FFFFFF] rounded">Seleccionar Todo</button>
                      <button onClick={() => deseleccionarTodos(rol.id_rol)} className="px-3 py-1 bg-[#A7A7A9] active:bg-[#7b7b7d] text-[#000000] rounded">Deseleccionar Todo</button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-80 overflow-y-auto border rounded p-2 border-[#A7A7A9]">
                      {todosPermisos.map((p) => {
                        const asignado = rolPermisos[rol.id_rol]?.includes(p.id_permiso) ?? false;
                        return (
                          <label
                            key={p.id_permiso}
                            className={`flex items-center gap-2 border border-[#A7A7A9] rounded px-2 py-1 cursor-pointer ${asignado ? "bg-[#034991]/10" : ""}`}
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
                      className="bg-[#034991] active:bg-[#023163] text-[#FFFFFF] px-4 py-1 mt-3 rounded"
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
