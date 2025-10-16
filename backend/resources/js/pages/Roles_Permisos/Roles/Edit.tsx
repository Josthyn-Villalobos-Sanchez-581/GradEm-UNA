import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";


interface Props {
  rol: { id_rol: number; nombre_rol: string };
  userPermisos: number[];
}

export default function Edit({ rol, userPermisos }: Props) {
  const [nombreRol, setNombreRol] = useState(rol.nombre_rol);
  const [errorNombre, setErrorNombre] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const modal = useModal();

  const validate = (value: string) => {
    if (!value.trim()) return "El nombre del rol no puede estar vacío";
    if (value.length < 3) return "El nombre del rol debe tener al menos 3 caracteres";
    if (value.length > 50) return "El nombre del rol no puede exceder 50 caracteres";
    if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) return "Solo se permiten letras y espacios";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNombreRol(value);
    setErrorNombre(validate(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate(nombreRol);
    if (error) {
      setErrorNombre(error);
      return;
    }

    const ok = await modal.confirmacion({
      titulo: "Confirmar actualización",
      mensaje: `¿Está seguro que desea actualizar el rol a "${nombreRol}"?`,
    });
    if (!ok) return;

    setSubmitting(true);
    Inertia.put(`/roles/${rol.id_rol}`, { nombre_rol: nombreRol }, {
      onFinish: () => setSubmitting(false)
    });
  };

  return (
    <>
      <Head title="Editar Rol" />
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6 text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Editar Rol</h2>
          {/* Botón Volver */}
          <Button asChild variant="secondary">
            <Link href="/roles_permisos">Volver</Link>
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label htmlFor="nombreRol" className="font-medium">Nombre del rol</label>
          <input
            id="nombreRol"
            type="text"
            value={nombreRol}
            onChange={handleChange}
            placeholder="Ingrese el nombre del rol"
            className={`border p-2 rounded w-full ${errorNombre ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
            disabled={submitting}
          />
          {errorNombre && <p className="text-red-500 text-sm">{errorNombre}</p>}
          <p className="text-gray-500 text-sm">Debe tener entre 3 y 50 caracteres, solo letras y espacios.</p>
          <Button
            type="submit"
            variant="default"
            size="default"
            disabled={!!errorNombre || submitting || !nombreRol.trim()}
            className="mt-2"
          >
            {submitting ? "Actualizando..." : "Actualizar"}
          </Button>
        </form>
      </div>
    </>
  );
}

Edit.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
