import React, { useState, useEffect } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";

interface RolesPermisosIndexProps {
  roles: {
    id_rol: number;
    nombre_rol: string;
    permisos: { id_permiso: number; nombre: string }[];
  }[];
  permisos: { id_permiso: number; nombre: string }[];
  userPermisos: number[];
  flash?: { success?: string };
}

export default function Index({
  roles,
  permisos,
  userPermisos,
  flash,
}: RolesPermisosIndexProps) {
  const [rolPermisos, setRolPermisos] = useState(() => {
    const map: Record<number, number[]> = {};
    roles.forEach((rol) => {
      map[rol.id_rol] = rol.permisos.map((p) => p.id_permiso);
    });
    return map;
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(
    flash?.success ?? null
  );

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const togglePermiso = (rolId: number, permisoId: number) => {
    setRolPermisos((prev) => {
      const current = prev[rolId] || [];
      const updated = current.includes(permisoId)
        ? current.filter((id) => id !== permisoId)
        : [...current, permisoId];
      return { ...prev, [rolId]: updated };
    });
  };

  const guardarPermisos = (rolId: number) => {
    Inertia.post(`/roles/${rolId}/permisos`, { permisos: rolPermisos[rolId] });
  };

  return (
    <>
      <Head title="Roles y Permisos" />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {successMessage && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded shadow transition-opacity duration-500">
            {successMessage}
          </div>
        )}

        {/* TABLA ROLES */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Roles</h2>
            <Link
              href="/roles/create"
              className="bg-[#2E7D32] hover:bg-green-800 text-white px-4 py-2 rounded"
            >
              Agregar Rol
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Nombre</th>
                  <th className="px-4 py-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((rol) => (
                  <tr key={rol.id_rol} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{rol.id_rol}</td>
                    <td className="px-4 py-2 border">{rol.nombre_rol}</td>
                    <td className="px-4 py-2 border flex gap-2">
                      <Link
                        href={`/roles/${rol.id_rol}/edit`}
                        className="bg-[#0D47A1] hover:bg-blue-800 text-white px-3 py-1 rounded"
                      >
                        Actualizar
                      </Link>
                      <button
                        onClick={() => Inertia.delete(`/roles/${rol.id_rol}`)}
                        className="bg-[#B71C1C] hover:bg-red-800 text-white px-3 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLA PERMISOS */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Permisos</h2>
            <Link
              href="/permisos/create"
              className="bg-[#2E7D32] hover:bg-green-800 text-white px-4 py-2 rounded"
            >
              Agregar Permiso
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Nombre</th>
                  <th className="px-4 py-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {permisos.map((permiso) => (
                  <tr key={permiso.id_permiso} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{permiso.id_permiso}</td>
                    <td className="px-4 py-2 border">{permiso.nombre}</td>
                    <td className="px-4 py-2 border flex gap-2">
                      <Link
                        href={`/permisos/${permiso.id_permiso}/edit`}
                        className="bg-[#0D47A1] hover:bg-blue-800 text-white px-3 py-1 rounded"
                      >
                        Actualizar
                      </Link>
                      <button
                        onClick={() =>
                          Inertia.delete(`/permisos/${permiso.id_permiso}`)
                        }
                        className="bg-[#B71C1C] hover:bg-red-800 text-white px-3 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROLES-PERMISOS */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            Asignación de Permisos a Roles
          </h2>
          {roles.map((rol) => (
            <div key={rol.id_rol} className="mb-6 border-b pb-4">
              <h3 className="font-semibold mb-2">{rol.nombre_rol}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {permisos.map((permiso) => (
                  <label
                    key={permiso.id_permiso}
                    className="flex items-center gap-2 border rounded px-2 py-1 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={rolPermisos[rol.id_rol]?.includes(
                        permiso.id_permiso
                      )}
                      onChange={() =>
                        togglePermiso(rol.id_rol, permiso.id_permiso)
                      }
                    />
                    <span>{permiso.nombre}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={() => guardarPermisos(rol.id_rol)}
                className="bg-[#0D47A1] hover:bg-blue-800 text-white px-4 py-1 mt-3 rounded"
              >
                Guardar Permisos
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Layout dinámico
Index.layout = (page: React.ReactNode & { props: RolesPermisosIndexProps }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
