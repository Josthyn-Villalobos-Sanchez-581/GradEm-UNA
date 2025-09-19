// backend/resources/js/pages/Usuarios/ActualizarAdmin.tsx
// backend/resources/js/pages/Usuarios/ActualizarAdmin.tsx
import React from "react";
import { Head, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import Ziggy from '@/ziggy';
import PpLayout from "@/layouts/PpLayout";
import ZiggyConfig from '@/ziggy';
type Rol = "Administrador del sistema" | "Dirección" | "Subdirección";

interface Props {
  usuario: {
    id: number;
    nombre_completo: string;
    correo: string;
    identificacion: string;
    telefono?: string;
    rol: string;
    universidad?: string;
    carrera?: string;
  };
  userPermisos?: number[];
}

const tailwindStyles = `
  .font-open-sans { font-family: 'Open Sans', sans-serif; }
  .text-una-red { color: #CD1719; }
  .bg-una-red { background-color: #CD1719; }
  .border-una-red { border-color: #CD1719; }
  .text-una-blue { color: #034991; }
  .bg-una-blue { background-color: #034991; }
  .text-una-gray { color: #A7A7A9; }
  .bg-una-gray { background-color: #A7A7A9; }
  .border-una-gray { border-color: #A7A7A9; }
  .text-black { color: #000000; }
  .text-una-dark-gray { color: #4B5563; }
`;

const localStyles = `
  .form-section { width: 100%; font-family: 'Open Sans', sans-serif; box-sizing: border-box; max-width: 980px; }
  .section-title { font-family: 'Goudy Old Style', serif; font-size: 1.6rem; font-weight: 700; margin-bottom: .25rem; }
  .section-sub { color: #333; margin-bottom: .75rem; }
  .form-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
  @media (min-width: 768px) { .form-grid { grid-template-columns: repeat(2, 1fr); } }
  .field { display: flex; flex-direction: column; }
  .label { font-weight: 700; margin-bottom: .25rem; font-size: .95rem; color: #034991; }
  .input, .select {
    padding: .5rem .75rem;
    border: 1px solid #A7A7A9;
    border-radius: 6px;
    font-size: .95rem;
    color: #111;
    box-sizing: border-box;
  }
  .input:focus, .select:focus {
    outline: none;
    border-color: #CD1719;
    box-shadow: 0 0 6px rgba(205,23,25,0.12);
  }
  .btn-primary {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: .75rem;
    background: #CD1719;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    font-size: 1rem;
    box-sizing: border-box;
    min-height: 44px;
    white-space: nowrap;
  }
  .btn-primary[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
    background: #CD1719;
  }
  .error-text { color: #b91c1c; font-size: .9rem; margin-top: .35rem; min-height: 1.1rem; }
  .help-text { color: #4B5563; font-size: .9rem; text-align: center; margin-top: .5rem; }
  .full-row { grid-column: 1 / -1; }
  .mb-4 { margin-bottom: 1rem; }
  .mt-6 { margin-top: 1.5rem; }
`;

export default function ActualizarAdmin({ usuario, userPermisos }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    nombre_completo: usuario.nombre_completo,
    correo: usuario.correo,
    identificacion: usuario.identificacion,
    telefono: usuario.telefono ?? "",
    rol: usuario.rol as Rol,
    universidad: usuario.universidad ?? "",
    carrera: usuario.carrera ?? "",
    contrasena: "",
    contrasena_confirmation: "",
  });

  const fieldError = (field: keyof typeof data) => errors[field] || "";

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
   put(route('admin.actualizar', { id: usuario.id }));
  };


  return (
    <>
      <Head title="Actualizar Usuario Administrador/Dirección/Subdirección" />
      <div className="form-section">
        <style>{tailwindStyles}</style>
        <style>{localStyles}</style>

        <div className="mb-4">
          <h2 className="section-title text-una-red font-open-sans">Actualizar — Administrador / Dirección</h2>
          <p className="section-sub">Modifique los datos y guarde los cambios.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {/* Nombre */}
            <div className="field">
              <label className="label">Nombre completo</label>
              <input
                className={`input ${fieldError("nombre_completo") ? "border-una-red" : ""}`}
                value={data.nombre_completo}
                onChange={(e) => setData("nombre_completo", e.target.value)}
              />
              <div className="error-text">{fieldError("nombre_completo")}</div>
            </div>

            {/* Correo */}
            <div className="field">
              <label className="label">Correo institucional</label>
              <input
                type="email"
                className={`input ${fieldError("correo") ? "border-una-red" : ""}`}
                value={data.correo}
                onChange={(e) => setData("correo", e.target.value)}
              />
              <div className="error-text">{fieldError("correo")}</div>
            </div>

            {/* Identificación */}
            <div className="field">
              <label className="label">Número de identificación</label>
              <input
                className={`input ${fieldError("identificacion") ? "border-una-red" : ""}`}
                value={data.identificacion}
                onChange={(e) => setData("identificacion", e.target.value)}
              />
              <div className="error-text">{fieldError("identificacion")}</div>
            </div>

            {/* Teléfono */}
            <div className="field">
              <label className="label">Teléfono de contacto</label>
              <input
                className={`input ${fieldError("telefono") ? "border-una-red" : ""}`}
                value={data.telefono}
                onChange={(e) => setData("telefono", e.target.value)}
              />
              <div className="error-text">{fieldError("telefono")}</div>
            </div>

            {/* Rol */}
            <div className="field">
              <label className="label">Rol asignado</label>
              <select
                className="select input"
                value={data.rol}
                onChange={(e) => setData("rol", e.target.value as Rol)}
              >
                <option value="Administrador del sistema">Administrador</option>
                <option value="Dirección">Dirección</option>
                <option value="Subdirección">Subdirección</option>
              </select>
              <div className="error-text">{fieldError("rol")}</div>
            </div>

            {/* Universidad */}
            <div className="field">
              <label className="label">Universidad asociada</label>
              <input
                className="input"
                value={data.universidad}
                onChange={(e) => setData("universidad", e.target.value)}
              />
              <div className="error-text">{fieldError("universidad")}</div>
            </div>

            {/* Carrera */}
            <div className="field">
              <label className="label">Carrera asociada</label>
              <input
                className={`input ${fieldError("carrera") ? "border-una-red" : ""}`}
                value={data.carrera}
                onChange={(e) => setData("carrera", e.target.value)}
              />
              <div className="error-text">{fieldError("carrera")}</div>
            </div>

            {/* Contraseña (opcional) */}
            <div className="field">
              <label className="label">Contraseña (opcional)</label>
              <input
                type="password"
                className={`input ${fieldError("contrasena") ? "border-una-red" : ""}`}
                value={data.contrasena}
                onChange={(e) => setData("contrasena", e.target.value)}
                placeholder="Dejar en blanco para no cambiar"
              />
              <div className="error-text">{fieldError("contrasena")}</div>
            </div>

            {/* Confirmar contraseña (opcional) */}
            <div className="field">
              <label className="label">Carrera asociada</label>
              <input
                className={`input ${fieldError("carrera") ? "border-una-red" : ""}`}
                value={data.carrera}
                onChange={(e) => setData("carrera", e.target.value)}
              />
              <div className="error-text">{fieldError("carrera")}</div>
            </div>

            {/* Contraseña (opcional) */}
            <div className="field">
              <label className="label">Contraseña (opcional)</label>
              <input
                type="password"
                className={`input ${fieldError("contrasena") ? "border-una-red" : ""}`}
                value={data.contrasena}
                onChange={(e) => setData("contrasena", e.target.value)}
                placeholder="Dejar en blanco para no cambiar"
              />
              <div className="error-text">{fieldError("contrasena")}</div>
            </div>

            {/* Confirmar contraseña (opcional) */}
            <div className="field">
              <label className="label">Confirmar contraseña</label>
              <input
                type="password"
                className={`input ${fieldError("contrasena_confirmation") ? "border-una-red" : ""}`}
                value={data.contrasena_confirmation}
                onChange={(e) => setData("contrasena_confirmation", e.target.value)}
                placeholder="Reingrese la contraseña si la cambió"
              />
              <div className="error-text">{fieldError("contrasena_confirmation")}</div>
            </div>

            <div className="full-row help-text">
              Puede dejar la contraseña en blanco si no desea cambiarla.
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="btn-primary"
              aria-disabled={processing}
            >
              {processing ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

ActualizarAdmin.layout = (page: React.ReactNode & { props?: any }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};