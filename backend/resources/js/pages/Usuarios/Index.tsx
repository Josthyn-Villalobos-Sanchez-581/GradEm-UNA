// backend/resources/js/pages/Usuarios/Index.tsx
import React, { useState, useEffect } from "react";
import { Link, Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { route } from 'ziggy-js';
import Ziggy from '@/ziggy';
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
    // if paginator: data + meta
    data?: UserItem[];
    meta?: {
      current_page?: number;
      last_page?: number;
      per_page?: number;
      total?: number;
      // previous_page_url, next_page_url if present
      links?: any[];
      path?: string;
    };
    // if not paginator, backend may send as plain array
  } | UserItem[];
  userPermisos?: number[];
  flash?: { success?: string };
}

export default function Index(props: UsuariosIndexProps) {
  // normalize users list (support paginator or plain array)
  const usersList: UserItem[] = Array.isArray(props.users)
    ? props.users
    : props.users.data ?? [];

  const paginator = !Array.isArray(props.users) ? (props.users as any).meta : null;

  const [successMessage, setSuccessMessage] = useState<string | null>(
    props.flash?.success ?? null
  );

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  return (
    <>
      <Head title="Usuarios - Administradores / Dirección / Subdirección" />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6 text-black">
        {successMessage && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded shadow">
            {successMessage}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Administradores / Dirección / Subdirección</h2>
          <Link
  href={route('admin.crear')}
  className="bg-[#2E7D32] hover:bg-green-800 text-white px-4 py-2 rounded"
>
  Crear Usuario
</Link>

          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Nombre completo</th>
                  <th className="px-4 py-2 border">Correo</th>
                  <th className="px-4 py-2 border">Identificación</th>
                  <th className="px-4 py-2 border">Teléfono</th>
                  <th className="px-4 py-2 border">Rol</th>
                  <th className="px-4 py-2 border">Universidad</th>
                  <th className="px-4 py-2 border">Carrera</th>
                  <th className="px-4 py-2 border">Creado</th>
                  <th className="px-4 py-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-gray-600">
                      No hay usuarios para mostrar.
                    </td>
                  </tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{u.nombre_completo ?? "-"}</td>
                      <td className="px-4 py-2 border">{u.correo ?? "-"}</td>
                      <td className="px-4 py-2 border">{u.identificacion ?? "-"}</td>
                      <td className="px-4 py-2 border">{u.telefono ?? "-"}</td>
                      <td className="px-4 py-2 border">{u.rol ?? "-"}</td>
                      <td className="px-4 py-2 border">{u.universidad ?? "-"}</td>
                      <td className="px-4 py-2 border">{u.carrera ?? "-"}</td>
                      <td className="px-4 py-2 border">{u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-2 border flex gap-2">

                  
<Link
  href={route('admin.editar', { id: u.id })}
  className="bg-[#0D47A1] hover:bg-blue-800 text-white px-4 py-2 rounded"
>
  Editar
</Link>
 {/* Botón Eliminar */}
  <Link
    href={route('admin.eliminar', { id: u.id })}
    method="delete"
    as="button"
    className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded"
    onClick={(e) => {
      if (!confirm('¿Seguro que deseas eliminar este usuario?')) {
        e.preventDefault();
      }
    }}
  >
    Eliminar
  </Link>
                        {/* Eliminar lo implementaremos después */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN SIMPLE si viene paginador desde Laravel */}
          {paginator && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Página {paginator.current_page} de {paginator.last_page} — {paginator.total} registros
              </div>
              <div className="flex gap-2">
                {paginator?.links?.map((link: any, idx: number) => {
                  // link: { url, label, active }
                  if (!link.url) {
                    return (
                      <span key={idx} className="px-3 py-1 text-sm text-gray-500">
                        {link.label.replace(/&laquo;|&raquo;/g, '')}
                      </span>
                    );
                  }
                  return (
                    <Link
                      key={idx}
                      href={link.url}
                      className={`px-3 py-1 text-sm rounded ${link.active ? "bg-una-red text-white" : "bg-white border"}`}
                    >
                      <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Layout dinámico como en tu ejemplo
Index.layout = (page: React.ReactNode & { props?: any }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
