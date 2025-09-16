import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import AppLayout from "@/layouts/app-layout";

interface Rol {
  id_rol: number;
  nombre_rol: string;
}

export default function Edit({ rol }: { rol: Rol }) {
  const [nombre, setNombre] = useState(rol.nombre_rol);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    Inertia.put(`/roles/${rol.id_rol}`, { nombre_rol: nombre });
  };

  return (
    <AppLayout breadcrumbs={[{ title: "Roles", href: "/roles" }, { title: "Editar", href: "#" }]}>
      <h1 className="text-xl font-bold mb-6">Editar Rol</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full md:w-1/2">
        <div className="mb-4">
          <label className="block font-semibold mb-1">Nombre del Rol</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Actualizar
        </button>
      </form>
    </AppLayout>
  );
}
