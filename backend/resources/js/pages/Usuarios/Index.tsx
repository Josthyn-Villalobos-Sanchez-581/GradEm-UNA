// backend/resources/js/pages/Usuarios/Index.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link, Head } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { useModal } from "@/hooks/useModal";
import { route } from 'ziggy-js'; 
interface UsuarioItem {
  id: number;
  nombre_completo?: string;
  correo?: string;
  identificacion?: string;
  telefono?: string;
  rol?: string;
  universidad?: string | null;
  carrera?: string | null;
  fecha_registro?: string;
  estado_id?: number; // 👈 agregado
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
  const { auth } = usePage().props as any;
  const { confirmacion, alerta } = useModal();
  const [usuarios, setUsuarios] = useState(props.users.data);
  const [searchInput, setSearchInput] = useState(props.filters?.search ?? "");
  const searchTimer = useRef<number | null>(null);
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
  const [successMessage, setSuccessMessage] = useState<string | null>(
    props.flash?.success ?? null
  );

  // 🔐 Solo roles 1 y 2 pueden activar/inactivar y eliminar
  const puedeGestionar = [1, 2].includes(auth?.user?.id_rol);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  const buscar = (search: string, page = 1) => {
    Inertia.get(
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
    }, 700);
  };

  const changePage = (page: number) => {
    if (page < 1 || page > props.users.last_page) return;
    buscar(searchInput, page);
  };

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
              onChange={(e) => onChangeSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (searchTimer.current) window.clearTimeout(searchTimer.current);
                  buscar(searchInput);
                }
              }}
              className="border border-gray-300 px-3 py-2 rounded w-full pl-10 text-black"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          {/* ✅ Selección de columnas */}
          <div className="bg-[#FFFFFF] shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-bold mb-2 text-[#034991]">Seleccionar Columnas</h2>
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
       <div className="overflow-x-auto w-full bg-white">
            <table className="table-auto border border-gray-200 w-full min-w-max">
              <thead className="bg-gray-100">
                <tr>
                  {visibleCols.includes("nombre") && <th className="px-4 py-2 border">Nombre completo</th>}
                  {visibleCols.includes("correo") && <th className="px-4 py-2 border">Correo</th>}
                  {visibleCols.includes("identificacion") && <th className="px-4 py-2 border">Identificación</th>}
                  {visibleCols.includes("telefono") && <th className="px-4 py-2 border">Teléfono</th>}
                  {visibleCols.includes("rol") && <th className="px-4 py-2 border">Rol</th>}
                  {visibleCols.includes("universidad") && <th className="px-4 py-2 border">Universidad</th>}
                  {visibleCols.includes("carrera") && <th className="px-4 py-2 border">Carrera</th>}
                  {visibleCols.includes("fecha") && <th className="px-4 py-2 border">Creado</th>}
                  {visibleCols.includes("acciones") && <th className="px-4 py-2 border">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-gray-600">
                      No hay usuarios para mostrar.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      {visibleCols.includes("nombre") && <td className="px-4 py-2 border">{u.nombre_completo ?? "-"}</td>}
                      {visibleCols.includes("correo") && <td className="px-4 py-2 border">{u.correo ?? "-"}</td>}
                      {visibleCols.includes("identificacion") && <td className="px-4 py-2 border">{u.identificacion ?? "-"}</td>}
                      {visibleCols.includes("telefono") && <td className="px-4 py-2 border">{u.telefono ?? "-"}</td>}
                      {visibleCols.includes("rol") && <td className="px-4 py-2 border">{u.rol ?? "-"}</td>}
                      {visibleCols.includes("universidad") && <td className="px-4 py-2 border">{u.universidad ?? "-"}</td>}
                      {visibleCols.includes("carrera") && <td className="px-4 py-2 border">{u.carrera ?? "-"}</td>}
                      {visibleCols.includes("fecha") && (
                        <td className="px-4 py-2 border">
                          {u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString() : "-"}
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

                          {puedeGestionar && (
                            <>
                              {/* 🔴 Activar/Inactivar */}
                              <button
                                onClick={async () => {
                                  const confirmado = await confirmacion({
                                    titulo: u.estado_id === 1 ? "Inactivar cuenta" : "Activar cuenta",
                                    mensaje: `¿Está seguro que desea ${u.estado_id === 1 ? "inactivar" : "activar"} la cuenta de ${u.nombre_completo}?`,
                                  });
                                  if (!confirmado) return;

                                  try {
                                    const res = await axios.put(`/usuarios/${u.id}/toggle-estado`);
                                    alerta({ titulo: "Estado actualizado", mensaje: res.data.message });

                                    setUsuarios((prev) =>
                                      prev.map((usr) =>
                                        usr.id === u.id ? { ...usr, estado_id: res.data.nuevo_estado } : usr
                                      )
                                    );
                                  } catch (err) {
                                    console.error(err);
                                    alerta({ titulo: "Error", mensaje: "Ocurrió un error al cambiar el estado del usuario." });
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg shadow font-semibold text-sm whitespace-nowrap ${
                                  u.estado_id === 1 ? "bg-[#CD1719] hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
                                }`}
                              >
                                {u.estado_id === 1 ? "Inactivar" : "Activar"}
                              </button>

                              {/* 🗑️ Eliminar */}
                              <button
                                onClick={async () => {
                                  const ok = await confirmacion({
                                    titulo: "Confirmar eliminación",
                                    mensaje: `¿Seguro que deseas eliminar a ${u.nombre_completo}?`,
                                    textoAceptar: "Sí, eliminar",
                                    textoCancelar: "Cancelar",
                                  });
                                  if (ok) Inertia.delete(route("admin.eliminar", { id: u.id }));
                                }}
                                className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded"
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {props.users.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Página {props.users.current_page} de {props.users.last_page} — {props.users.total} registros
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => changePage(props.users.current_page - 1)}
                  disabled={props.users.current_page === 1}
                  className="px-3 py-1 text-sm rounded bg-white border"
                >
                  &laquo; Anterior
                </button>
                <button
                  onClick={() => changePage(props.users.current_page + 1)}
                  disabled={props.users.current_page === props.users.last_page}
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
