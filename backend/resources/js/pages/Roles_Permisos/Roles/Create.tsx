import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal"; // MOD: importar el modal

interface Props {
  userPermisos: number[];
}

export default function Create({ userPermisos }: Props) {
  const [nombreRol, setNombreRol] = useState("");
  const modal = useModal(); // MOD: usar el modal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // MOD: Confirmación antes de crear el rol
    const ok = await modal.confirmacion({
      titulo: "Confirmar creación",
      mensaje: "¿Está seguro que desea crear este rol?"
    });
    if (!ok) return;

    Inertia.post("/roles", { nombre_rol: nombreRol });
  };

  return (
    <>
      <Head title="Crear Rol" />
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6 text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Crear Rol</h2>
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
            className="bg-[#2E7D32] hover:bg-green-800 text-white px-4 py-2 rounded"
          >
            Crear
          </button>
        </form>
      </div>
    </>
  );
}

Create.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
