import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";

interface Props {
  userPermisos: number[];
}

export default function Create({ userPermisos }: Props) {
  const [nombre, setNombre] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    Inertia.post("/permisos", { nombre });
  };

  return (
    <>
      <Head title="Crear Permiso" />
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6 text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Crear Permiso</h2>
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
