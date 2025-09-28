import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";

interface Props {
  userPermisos: number[];
}

export default function Create({ userPermisos }: Props) {
  const [nombre, setNombre] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const modal = useModal();

  const validate = (value: string) => {
    if (!value.trim()) return "El nombre del permiso no puede estar vacío";
    if (value.length < 3) return "El nombre del permiso debe tener al menos 3 caracteres";
    if (value.length > 50) return "El nombre del permiso no puede exceder 50 caracteres";
    if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) return "Solo se permiten letras y espacios";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNombre(value);
    setErrorNombre(validate(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate(nombre);
    if (error) {
      setErrorNombre(error);
      return;
    }

    const ok = await modal.confirmacion({
      titulo: "Confirmar creación",
      mensaje: `¿Está seguro que desea crear el permiso "${nombre}"?`,
    });
    if (!ok) return;

    setSubmitting(true);
    Inertia.post("/permisos", { nombre }, {
      onFinish: () => setSubmitting(false)
    });
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label htmlFor="nombre" className="font-medium">Nombre del permiso</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={handleChange}
            placeholder="Ingrese el nombre del permiso"
            className={`border p-2 rounded w-full ${errorNombre ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
            disabled={submitting}
          />
          {errorNombre && <p className="text-red-500 text-sm">{errorNombre}</p>}
          <p className="text-gray-500 text-sm">Debe tener entre 3 y 50 caracteres, solo letras y espacios.</p>
          <button
            type="submit"
            disabled={!!errorNombre || submitting || !nombre.trim()}
            className={`bg-[#034991] hover:bg-[#0563c1] text-white px-4 py-2 rounded mt-2 ${(!nombre.trim() || errorNombre || submitting) ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {submitting ? "Creando..." : "Crear"}
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
