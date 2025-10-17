// backend/resources/js/pages/Roles_Permisos/Index.tsx
import React, { useEffect, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";


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
            <Button
              variant="default"
              size="default"
              onClick={async () => {
                const confirmar = await modal.confirmacion({
                  titulo: "Mostrar todas las secciones",
                  mensaje: "¿Desea mostrar todas las secciones disponibles?",
                });
                if (confirmar) setSections(["roles", "permisos", "asignacion"]);
              }}
              className="bg-[#034991] hover:bg-[#023b73] text-white font-semibold rounded-full px-5 py-2 transition-all duration-200"
            >
              + Mostrar Todo
            </Button>
          </div>

          {/* Cuerpo */}
          <div className="flex flex-wrap gap-4 items-center justify-start">
            {[
              { id: "roles", label: "Roles" },
              { id: "permisos", label: "Permisos" },
              { id: "asignacion", label: "Asignación de Permisos" },
            ].map((sec) => {
              const activo = sections.includes(sec.id);
              return (
                <label
                  key={sec.id}
                  className={`flex items-center gap-3 px-5 py-2 rounded-full border-2 cursor-pointer select-none transition-all duration-200 
            ${activo
                      ? "bg-white border-[#034991] text-[#034991]"
                      : "bg-white border-gray-300 text-gray-700 hover:border-[#034991]/70"
                    }`}
                >
                  {/* Checkbox circular refinado */}
                  <div
                    className={`relative flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200 
              ${activo
                        ? "border-[#034991] bg-[#034991]"
                        : "border-[#034991] bg-white"
                      }`}
                  >
                    {activo && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="white"
                        className="w-3 h-3"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.292a1 1 0 0 1 0 1.416l-7.5 7.5a1 1 0 0 1-1.416 0l-3.5-3.5a1 1 0 0 1 1.416-1.416L8.5 11.086l6.792-6.794a1 1 0 0 1 1.412 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={async () => {
                      if (sections.length === 1 && activo) {
                        await modal.alerta({
                          titulo: "Acción no permitida",
                          mensaje:
                            "Debe mantener al menos una sección seleccionada para continuar.",
                        });
                        return;
                      }
                      toggleSection(sec.id);
                    }}
                    className="hidden"
                  />

                  <span className="font-medium text-sm">{sec.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ========================================= */}
        {/* Roles */}
        {/* ========================================= */}
        {sections.includes("roles") && (
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
            {/* Encabezado */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-2xl font-bold text-[#034991]">Gestión de Roles</h2>
              <Button asChild variant="default" size="default">
                <Link href="/roles/create">+ Agregar Rol</Link>
              </Button>
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

            {/* 🔹 Tabla de Roles con formato uniforme */}
            <div className="w-full overflow-x-auto bg-white p-6 rounded-2xl shadow border border-black">
              <table className="min-w-full border-separate border-spacing-[0px] rounded-2xl overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-500 border border-gray-300 first:rounded-tl-2xl">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-gray-500 border border-gray-300">
                      Nombre del Rol
                    </th>
                    <th className="px-4 py-2 text-center text-gray-500 border border-gray-300 last:rounded-tr-2xl">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRoles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-4 text-gray-500 italic border border-gray-300 rounded-b-2xl"
                      >
                        No se encontraron roles.
                      </td>
                    </tr>
                  ) : (
                    paginatedRoles.map((rol, idx) => (
                      <tr
                        key={rol.id_rol}
                        className={`hover:bg-gray-50 ${idx === paginatedRoles.length - 1 ? "last-row" : ""
                          }`}
                      >
                        <td
                          className={`px-4 py-2 border border-gray-300 ${idx === paginatedRoles.length - 1 ? "rounded-bl-2xl" : ""
                            }`}
                        >
                          {rol.id_rol}
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          {rol.nombre_rol}
                        </td>
                        <td
                          className={`px-4 py-2 text-center border border-gray-300 ${idx === paginatedRoles.length - 1 ? "rounded-br-2xl" : ""
                            }`}
                        >
                          <div className="flex justify-center gap-2">
                            <Button asChild variant="default" size="sm" className="font-semibold">
                              <Link href={`/roles/${rol.id_rol}/edit`}>Editar</Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="font-semibold"
                              onClick={() => eliminarRol(rol.id_rol)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 🔹 Paginación de Roles */}
            {totalPagesRoles > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                <Button
                  type="button"
                  onClick={() => setRolPage(rolPage - 1)}
                  disabled={rolPage === 1}
                  variant="default"
                  size="sm"
                >
                  Anterior
                </Button>

                {Array.from({ length: totalPagesRoles }, (_, i) => (
                  <Button
                    key={i + 1}
                    type="button"
                    onClick={() => setRolPage(i + 1)}
                    size="sm"
                    variant={rolPage === i + 1 ? "destructive" : "outline"}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  type="button"
                  onClick={() => setRolPage(rolPage + 1)}
                  disabled={rolPage === totalPagesRoles}
                  variant="default"
                  size="sm"
                >
                  Siguiente
                </Button>
              </div>
            )}
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
              <Button asChild variant="default" size="default">
                <Link href="/permisos/create">+ Agregar Permiso</Link>
              </Button>
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

            {/* 🔹 Tabla de Permisos con formato uniforme */}
            <div className="w-full overflow-x-auto bg-white p-6 rounded-2xl shadow border border-black">
              <table className="min-w-full border-separate border-spacing-[0px] rounded-2xl overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-500 border border-gray-300 first:rounded-tl-2xl">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-gray-500 border border-gray-300">
                      Nombre del Permiso
                    </th>
                    <th className="px-4 py-2 text-center text-gray-500 border border-gray-300 last:rounded-tr-2xl">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPermisos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-4 text-gray-500 italic border border-gray-300 rounded-b-2xl"
                      >
                        No se encontraron permisos.
                      </td>
                    </tr>
                  ) : (
                    paginatedPermisos.map((permiso, idx) => (
                      <tr
                        key={permiso.id_permiso}
                        className={`hover:bg-gray-50 ${idx === paginatedPermisos.length - 1 ? "last-row" : ""
                          }`}
                      >
                        <td
                          className={`px-4 py-2 border border-gray-300 ${idx === paginatedPermisos.length - 1 ? "rounded-bl-2xl" : ""
                            }`}
                        >
                          {permiso.id_permiso}
                        </td>
                        <td className="px-4 py-2 border border-gray-300">{permiso.nombre}</td>
                        <td
                          className={`px-4 py-2 text-center border border-gray-300 ${idx === paginatedPermisos.length - 1 ? "rounded-br-2xl" : ""
                            }`}
                        >
                          <div className="flex justify-center gap-2">
                            <Button asChild variant="default" size="sm" className="font-semibold">
                              <Link href={`/permisos/${permiso.id_permiso}/edit`}>Editar</Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="font-semibold"
                              onClick={() => eliminarPermiso(permiso.id_permiso)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 🔹 Paginación de Permisos */}
            {totalPagesPermisos > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                <Button
                  type="button"
                  onClick={() => setPermisoPage(permisoPage - 1)}
                  disabled={permisoPage === 1}
                  variant="default"
                  size="sm"
                >
                  Anterior
                </Button>

                {Array.from({ length: totalPagesPermisos }, (_, i) => (
                  <Button
                    key={i + 1}
                    type="button"
                    onClick={() => setPermisoPage(i + 1)}
                    size="sm"
                    variant={permisoPage === i + 1 ? "destructive" : "outline"}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  type="button"
                  onClick={() => setPermisoPage(permisoPage + 1)}
                  disabled={permisoPage === totalPagesPermisos}
                  variant="default"
                  size="sm"
                >
                  Siguiente
                </Button>
              </div>
            )}

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
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full flex justify-between items-center text-[#034991] hover:bg-[#034991] hover:text-white rounded-t-lg"
                  onClick={() => setRolAbierto((prev) => (prev === rol.id_rol ? null : rol.id_rol))}
                >
                  <span>{rol.nombre_rol}</span>
                  <span className="text-xl">{rolAbierto === rol.id_rol ? "▲" : "▼"}</span>
                </Button>


                {/* Permisos asignados */}
                {rolAbierto === rol.id_rol && (
                  <div className="p-4 bg-white rounded-b-lg">
                    {/* Botones de acción */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => seleccionarTodos(rol.id_rol)}
                        className="bg-[#034991] hover:bg-[#023b73] text-white font-semibold rounded-full transition-all duration-200"
                      >
                        Seleccionar Todo
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deseleccionarTodos(rol.id_rol)}
                        className="text-[#034991] border-[#034991] hover:bg-[#E6F2FB] rounded-full transition-all duration-200"
                      >
                        Deseleccionar Todo
                      </Button>
                    </div>

                    {/* Lista de permisos */}
                    <div
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg"
                      style={{ fontFamily: "Open Sans, sans-serif" }}
                    >
                      {todosPermisos.map((p) => {
                        const asignado = rolPermisos[rol.id_rol]?.includes(p.id_permiso) ?? false;
                        return (
                          <label
                            key={p.id_permiso}
                            className={`flex items-center gap-3 px-4 py-2 rounded-full border-2 cursor-pointer text-sm transition-all duration-200
              ${asignado
                                ? "bg-white border-[#034991] text-[#034991]"
                                : "bg-white border-gray-300 text-gray-700 hover:border-[#034991]/70"
                              }`}
                          >
                            {/* Checkbox circular refinado */}
                            <div
                              className={`relative flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200 
                ${asignado
                                  ? "border-[#034991] bg-[#034991]"
                                  : "border-[#034991] bg-white"
                                }`}
                            >
                              {asignado && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="white"
                                  className="w-3 h-3"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.704 5.292a1 1 0 0 1 0 1.416l-7.5 7.5a1 1 0 0 1-1.416 0l-3.5-3.5a1 1 0 0 1 1.416-1.416L8.5 11.086l6.792-6.794a1 1 0 0 1 1.412 0Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>

                            <input
                              type="checkbox"
                              checked={!!asignado}
                              onChange={() => togglePermiso(rol.id_rol, p.id_permiso)}
                              className="hidden"
                            />

                            <span className="truncate font-medium">{p.nombre}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Botón guardar */}
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="default"
                        size="default"
                        onClick={() => guardarPermisos(rol.id_rol)}
                        className="rounded-full font-semibold"
                      >
                        Guardar Permisos
                      </Button>
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
