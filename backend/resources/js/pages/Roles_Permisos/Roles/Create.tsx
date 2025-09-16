import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import AppLayout from "@/layouts/app-layout";

export default function Create() {
  const [nombre, setNombre] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    Inertia.post("/roles", { nombre_rol: nombre });
  };

  return (
    <AppLayout breadcrumbs={[{ title: "Roles", href: "/roles" }, { title: "Crear", href: "#" }]}>
      <h1 className="text-xl font-bold mb-6">Crear Rol</h1>
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
          Guardar
        </button>
      </form>
    </AppLayout>
  );
}
