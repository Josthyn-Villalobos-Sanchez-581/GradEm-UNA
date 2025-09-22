import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal"; // MOD: importar el modal

interface Props {
  permiso: { id_permiso: number; nombre: string };
  userPermisos: number[];
}

export default function Edit({ permiso, userPermisos }: Props) {
  const [nombre, setNombre] = useState(permiso.nombre);
  const modal = useModal(); // MOD: usar el modal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // MOD: Confirmación antes de actualizar el permiso
    const ok = await modal.confirmacion({
      titulo: "Confirmar actualización",
      mensaje: "¿Está seguro que desea actualizar este permiso?",
    });
    if (!ok) return;

    Inertia.put(`/permisos/${permiso.id_permiso}`, { nombre });
  };

  return (
    <>
      <Head title="Editar Permiso" />
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6 text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Editar Permiso</h2>
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
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del permiso"
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

