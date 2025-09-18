import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";

interface Props {
  rol: { id_rol: number; nombre_rol: string };
  userPermisos: number[];
}

export default function Edit({ rol, userPermisos }: Props) {
  const [nombreRol, setNombreRol] = useState(rol.nombre_rol);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    Inertia.put(`/roles/${rol.id_rol}`, { nombre_rol: nombreRol });
  };

  return (
    <>
      <Head title="Editar Rol" />
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6 text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Editar Rol</h2>
          <Link
            href="/roles_permisos"
            className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded"
          >
            Volver
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={nombreRol}
            onChange={(e) => setNombreRol(e.target.value)}
            placeholder="Nombre del rol"
            className="border p-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-[#0D47A1] hover:bg-blue-800 text-white px-4 py-2 rounded"
          >
            Actualizar
          </button>
        </form>
      </div>
    </>
  );
}

Edit.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
