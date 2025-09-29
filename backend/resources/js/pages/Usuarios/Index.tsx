// backend/resources/js/pages/Usuarios/Index.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link, Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { route } from "ziggy-js";
import { useModal } from "@/hooks/useModal";
import { Inertia } from "@inertiajs/inertia";

interface UserItem {
  id: number;
  nombre_completo?: string;
  correo?: string;
  identificacion?: string;
  telefono?: string;
  rol?: string;
  universidad?: string | null;
  carrera?: string | null;
  fecha_registro?: string;
}

interface UsuariosIndexProps {
  users: {
    data?: UserItem[];
    meta?: any;
  } | UserItem[];
  userPermisos?: number[];
  flash?: { success?: string };
}

export default function Index(props: UsuariosIndexProps) {
  const { confirmacion } = useModal();

  // 🔧 Normalizamos lista de usuarios
  const usersList: UserItem[] = Array.isArray(props.users)
    ? props.users
    : props.users.data ?? [];

  // 🔎 Estado buscador
  const [searchInput, setSearchInput] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<UserItem[]>(usersList);
  const searchTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!searchInput) {
      setFilteredUsers(usersList);
      return;
    }
    const lower = searchInput.toLowerCase();
    const res = usersList.filter(
      (u) =>
        u.identificacion?.toLowerCase().includes(lower) ||
        u.nombre_completo?.toLowerCase().includes(lower)
    );
    setFilteredUsers(res);
  }, [usersList, searchInput]);

  // 📄 Paginación client-side
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 🎨 Estado para columnas visibles
  const [visibleCols, setVisibleCols] = useState<string[]>([
    "nombre",
    "correo",
    "identificacion",
    "telefono",
    "rol",
    "universidad",
    "carrera",
    "fecha",
    "acciones",
  ]);

  // ⚡ Mensajes flash
  const [successMessage, setSuccessMessage] = useState<string | null>(
    props.flash?.success ?? null
  );
  useEffect(() => {
    if (props.flash?.success) {
      setSuccessMessage(props.flash.success);
      props.flash.success = undefined;
    }
  }, []);
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  return (
    <>
      <Head title="Usuarios - Administradores / Dirección / Subdirección" />
      <div className="max-w-none w-full px-6 py-6 space-y-6 text-black">
        {successMessage && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded shadow">
            {successMessage}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#034991]">
              Administradores / Dirección / Subdirección
            </h2>
            <Link
              href={route("admin.crear")}
              className="bg-[#034991] hover:bg-[#0563c1] text-white px-4 py-2 rounded"
            >
              Crear Usuario
            </Link>
          </div>

          {/* 🔎 Buscador */}
          <div className="relative w-full mb-6">
            <input
              type="text"
              placeholder="Buscar por identificación o nombre..."
              value={searchInput}
              onChange={(e) => {
                const value = e.target.value;
                if (searchTimer.current) window.clearTimeout(searchTimer.current);
                searchTimer.current = window.setTimeout(() => {
                  setSearchInput(value);
                  setCurrentPage(1);
                }, 500);
              }}
              className="border border-gray-300 px-3 py-2 rounded w-full pl-10 text-black"
            />
            <span
              className="absolute left-3 top-2.5 text-gray-400"
              aria-hidden
            >
              🔍
            </span>
          </div>

          {/* ✅ Seleccionar Columnas */}
          <div className="bg-[#FFFFFF] shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-bold mb-2 text-[#034991]">
              Seleccionar Columnas
            </h2>
            <div className="flex flex-wrap gap-4 items-center">
              {[
                { key: "nombre", label: "Nombre completo" },
                { key: "correo", label: "Correo" },
                { key: "identificacion", label: "Identificación" },
                { key: "telefono", label: "Teléfono" },
                { key: "rol", label: "Rol" },
                { key: "universidad", label: "Universidad" },
                { key: "carrera", label: "Carrera" },
                { key: "fecha", label: "Creado" },
                { key: "acciones", label: "Acciones" },
              ].map((col) => (
                <label key={col.key} className="flex items-center gap-2 text-black">
                  <input
                    type="checkbox"
                    checked={visibleCols.includes(col.key)}
                    onChange={() =>
                      setVisibleCols((prev) =>
                        prev.includes(col.key)
                          ? prev.filter((c) => c !== col.key)
                          : [...prev, col.key]
                      )
                    }
                  />
                  {col.label}
                </label>
              ))}
              <button
  className="ml-auto bg-[#034991] hover:bg-[#0563c1] active:bg-[#023163] text-white px-3 py-1 rounded"
  onClick={() =>
    setVisibleCols([
      "nombre",
      "correo",
      "identificacion",
      "telefono",
      "rol",
      "universidad",
      "carrera",
      "fecha",
      "acciones",
    ])
  }
>
  Mostrar Todo
</button>

            </div>
          </div>

          {/* 📊 Tabla */}
          <div className="overflow-x-auto w-full">
            <table className="table-auto border border-gray-200 w-full min-w-max">
              <thead className="bg-gray-100">
                <tr>
                  {visibleCols.includes("nombre") && (
                    <th className="px-4 py-2 border">Nombre completo</th>
                  )}
                  {visibleCols.includes("correo") && (
                    <th className="px-4 py-2 border">Correo</th>
                  )}
                  {visibleCols.includes("identificacion") && (
                    <th className="px-4 py-2 border">Identificación</th>
                  )}
                  {visibleCols.includes("telefono") && (
                    <th className="px-4 py-2 border">Teléfono</th>
                  )}
                  {visibleCols.includes("rol") && (
                    <th className="px-4 py-2 border">Rol</th>
                  )}
                  {visibleCols.includes("universidad") && (
                    <th className="px-4 py-2 border">Universidad</th>
                  )}
                  {visibleCols.includes("carrera") && (
                    <th className="px-4 py-2 border">Carrera</th>
                  )}
                  {visibleCols.includes("fecha") && (
                    <th className="px-4 py-2 border">Creado</th>
                  )}
                  {visibleCols.includes("acciones") && (
                    <th className="px-4 py-2 border">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-gray-600">
                      No hay usuarios para mostrar.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      {visibleCols.includes("nombre") && (
                        <td className="px-4 py-2 border whitespace-normal break-words">
                          {u.nombre_completo ?? "-"}
                        </td>
                      )}
                      {visibleCols.includes("correo") && (
                        <td className="px-4 py-2 border">{u.correo ?? "-"}</td>
                      )}
                      {visibleCols.includes("identificacion") && (
                        <td className="px-4 py-2 border whitespace-normal break-words">
                          {u.identificacion ?? "-"}
                        </td>
                      )}
                      {visibleCols.includes("telefono") && (
                        <td className="px-4 py-2 border">{u.telefono ?? "-"}</td>
                      )}
                      {visibleCols.includes("rol") && (
                        <td className="px-4 py-2 border">{u.rol ?? "-"}</td>
                      )}
                      {visibleCols.includes("universidad") && (
                        <td className="px-4 py-2 border whitespace-normal break-words">
                          {u.universidad ?? "-"}
                        </td>
                      )}
                      {visibleCols.includes("carrera") && (
                        <td className="px-4 py-2 border whitespace-normal break-words">
                          {u.carrera ?? "-"}
                        </td>
                      )}
                      {visibleCols.includes("fecha") && (
                        <td className="px-4 py-2 border">
                          {u.fecha_registro
                            ? new Date(u.fecha_registro).toLocaleDateString()
                            : "-"}
                        </td>
                      )}
                      {visibleCols.includes("acciones") && (
                        <td className="px-4 py-2 border flex gap-2">
                          <Link
                            href={route("admin.editar", { id: u.id })}
                            className="bg-[#0D47A1] hover:bg-blue-800 text-white px-4 py-2 rounded"
                          >
                            Editar
                          </Link>
                          <Link
                            key={u.id}
                            href={route("admin.eliminar", { id: u.id })}
                            method="delete"
                            as="button"
                            className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded"
                            onClick={async (e) => {
                              e.preventDefault();
                              const ok = await confirmacion({
                                titulo: "Confirmar eliminación",
                                mensaje: "¿Seguro que deseas eliminar este usuario?",
                                textoAceptar: "Sí, eliminar",
                                textoCancelar: "Cancelar",
                              });
                              if (ok) {
                                Inertia.delete(route("admin.eliminar", { id: u.id }));
                              }
                            }}
                          >
                            Eliminar
                          </Link>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 📄 Paginación client-side */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages} — {filteredUsers.length} registros
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm rounded bg-white border"
                >
                  &laquo; Anterior
                </button>
                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm rounded bg-white border"
                >
                  Siguiente &raquo;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Layout dinámico
Index.layout = (page: React.ReactNode & { props?: any }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
