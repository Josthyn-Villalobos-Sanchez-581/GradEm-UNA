import React from "react";
import { Inertia } from "@inertiajs/inertia";
import AppLayout from "@/layouts/app-layout";

// Interfaces
interface Permiso {
  id_permiso: number;
  nombre: string;
}

interface Rol {
  id_rol: number;
  nombre_rol: string;
  permisos: Permiso[];
}

interface IndexProps {
  roles: Rol[];
  permisos: Permiso[];
}

export default function Index({ roles, permisos }: IndexProps) {
  const handleAssign = (rolId: number, permisosSeleccionados: number[]) => {
    Inertia.post(`/roles/${rolId}/permisos`, { permisos: permisosSeleccionados });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: "/dashboard" },
        { title: "Administración", href: "/admin" },
      ]}
    >
      <h1 className="text-xl font-bold mb-6">Gestión de Roles y Permisos</h1>

      {/* ================== ROLES ================== */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Roles</h2>
        <ul className="space-y-4">
          {roles.map((rol) => (
            <li key={rol.id_rol} className="p-4 border rounded bg-white shadow">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">{rol.nombre_rol}</h3>
                <div className="flex gap-2">
                  <a
                    href={`/roles/${rol.id_rol}/edit`}
                    className="bg-yellow-400 px-2 py-1 rounded"
                  >
                    Editar
                  </a>
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar rol?")) {
                        Inertia.delete(`/roles/${rol.id_rol}`);
                      }
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Permisos asignados */}
              <div className="mt-3">
                <p className="font-semibold">Permisos actuales:</p>
                <ul className="list-disc ml-6">
                  {rol.permisos.length > 0 ? (
                    rol.permisos.map((p) => (
                      <li key={p.id_permiso}>{p.nombre}</li>
                    ))
                  ) : (
                    <li className="italic">Sin permisos asignados</li>
                  )}
                </ul>
              </div>

              {/* Asignación de permisos */}
              <div className="mt-3">
                <p className="font-semibold">Asignar permisos:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {permisos.map((permiso) => (
                    <label key={permiso.id_permiso} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rol.permisos.some(
                          (p) => p.id_permiso === permiso.id_permiso
                        )}
                        onChange={(e) => {
                          let nuevosPermisos = rol.permisos.map((p) => p.id_permiso);
                          if (e.target.checked) {
                            nuevosPermisos.push(permiso.id_permiso);
                          } else {
                            nuevosPermisos = nuevosPermisos.filter(
                              (id) => id !== permiso.id_permiso
                            );
                          }
                          handleAssign(rol.id_rol, nuevosPermisos);
                        }}
                      />
                      {permiso.nombre}
                    </label>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ================== PERMISOS ================== */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Permisos</h2>
        <ul className="space-y-2">
          {permisos.map((permiso) => (
            <li
              key={permiso.id_permiso}
              className="p-3 border rounded flex justify-between items-center bg-white shadow"
            >
              {permiso.nombre}
              <div className="flex gap-2">
                <a
                  href={`/permisos/${permiso.id_permiso}/edit`}
                  className="bg-yellow-400 px-2 py-1 rounded"
                >
                  Editar
                </a>
                <button
                  onClick={() => {
                    if (confirm("¿Eliminar permiso?")) {
                      Inertia.delete(`/permisos/${permiso.id_permiso}`);
                    }
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </AppLayout>
  );
}
