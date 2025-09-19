// resources/js/components/FormularioRegistroAdmin.tsx
import React from "react";
import { useForm } from "@inertiajs/react";

type Rol = "Administrador del sistema" | "Dirección" | "Subdirección";

/* tu parche de clases "tailwindStyles" (colores, fonts) */  
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

/* estilos locales (grid, inputs, botón, estados disabled) */
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
    background: #CD1719; /* mantiene color pero visualmente deshabilitado */
  }

  .error-text { color: #b91c1c; font-size: .9rem; margin-top: .35rem; min-height: 1.1rem; }
  .help-text { color: #4B5563; font-size: .9rem; text-align: center; margin-top: .5rem; }

  .full-row { grid-column: 1 / -1; }
  .mb-4 { margin-bottom: 1rem; }
  .mt-6 { margin-top: 1.5rem; }
`;


const FormularioRegistroAdmin: React.FC = () => {
  const form = useForm({
    nombre_completo: "",
    correo: "",
    identificacion: "",
    telefono: "",
    rol: "Administrador" as Rol,
    universidad: "",
    carrera: "",
    contrasena: "",
    contrasena_confirmation: "",
  });

  const fieldError = (field: string) => (form.errors as Record<string, string>)[field] || "";

  // Validación local que determina si el formulario es "válido" para habilitar el botón
  const isFormValid = (): boolean => {
    const data = form.data;
    // nombre
    if (!data.nombre_completo || !data.nombre_completo.toString().trim()) return false;
    // correo
    if (!data.correo || !/^\S+@\S+\.\S+$/.test(String(data.correo))) return false;
    // identificacion: solo dígitos (permite guiones/spaces pero los elimina para validar)
    const idClean = String(data.identificacion || "").replace(/[-\s]/g, "");
    if (!idClean || !/^\d+$/.test(idClean)) return false;
    // telefono: opcional, pero si existe debe ser 8 dígitos
    const tel = String(data.telefono || "").replace(/[-\s]/g, "");
    if (tel && !/^\d{8}$/.test(tel)) return false;
    // rol y carrera
    if (data.rol === "Dirección" && !String(data.carrera || "").trim()) return false;
    // contrasena mínimo 8 y confirmación coincidente
    if (!data.contrasena || String(data.contrasena).length < 8) return false;
    if (String(data.contrasena) !== String(data.contrasena_confirmation)) return false;
    return true;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // duplicado de validaciones UX por seguridad (server también validará)
    if (!isFormValid()) {
      // no debería ocurrir si botón está deshabilitado correctamente, pero guardamos la comprobación
      return;
    }

    form.post("/registro-admin", {
      preserveScroll: true,
      onSuccess: () => {
        form.reset(
          "nombre_completo",
          "correo",
          "identificacion",
          "telefono",
          "universidad",
          "carrera",
          "contrasena",
          "contrasena_confirmation"
        );
      },
    });
  };

  const valid = isFormValid();

  return (
    <div className="form-section">
      <style>{tailwindStyles}</style>
      <style>{localStyles}</style>

      <div className="mb-4">
        <h2 className="section-title text-una-red font-open-sans">Registro — Administrador / Dirección</h2>
        <p className="section-sub">Complete los datos para crear la cuenta.</p>
      </div>

      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          {/* Nombre */}
          <div className="field">
            <label className="label">Nombre completo</label>
            <input
              className={`input ${fieldError("nombre_completo") ? "border-una-red" : ""}`}
              value={form.data.nombre_completo}
              onChange={(e) => form.setData("nombre_completo", e.target.value)}
              placeholder="Ej: Juan Pérez González"
            />
            <div className="error-text">{fieldError("nombre_completo")}</div>
          </div>

          {/* Correo */}
          <div className="field">
            <label className="label">Correo institucional</label>
            <input
              type="email"
              className={`input ${fieldError("correo") ? "border-una-red" : ""}`}
              value={form.data.correo}
              onChange={(e) => form.setData("correo", e.target.value)}
              placeholder="ejemplo@una.ac.cr"
            />
            <div className="error-text">{fieldError("correo")}</div>
          </div>

          {/* Identificación */}
          <div className="field">
            <label className="label">Número de identificación</label>
            <input
              className={`input ${fieldError("identificacion") ? "border-una-red" : ""}`}
              value={form.data.identificacion}
              onChange={(e) => form.setData("identificacion", e.target.value)}
              placeholder="Ej: 112345678"
            />
            <div className="error-text">{fieldError("identificacion")}</div>
          </div>

          {/* Teléfono */}
          <div className="field">
            <label className="label">Teléfono de contacto</label>
            <input
              className={`input ${fieldError("telefono") ? "border-una-red" : ""}`}
              value={form.data.telefono}
              onChange={(e) => form.setData("telefono", e.target.value)}
              placeholder="88888888"
            />
            <div className="error-text">{fieldError("telefono")}</div>
          </div>

          {/* Rol */}
          <div className="field">
            <label className="label">Rol asignado</label>
            <select
              className="select input"
              value={form.data.rol}
              onChange={(e) => form.setData("rol", e.target.value as Rol)}
            >
              <option value="Administrador">Administrador</option>
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
              value={form.data.universidad}
              onChange={(e) => form.setData("universidad", e.target.value)}
              placeholder="Ej: Universidad Nacional"
            />
            <div className="error-text">{fieldError("universidad")}</div>
          </div>

          {/* Carrera */}
          <div className="field">
            <label className="label">
              Carrera asociada {form.data.rol === "Dirección" && <span style={{ color: "#CD1719", fontSize: ".9rem" }}>(requerida)</span>}
            </label>
            <input
              className={`input ${fieldError("carrera") ? "border-una-red" : ""}`}
              value={form.data.carrera}
              onChange={(e) => form.setData("carrera", e.target.value)}
              placeholder="Ej: Ingeniería en Sistemas"
            />
            <div className="error-text">{fieldError("carrera")}</div>
          </div>

          {/* Contraseña */}
          <div className="field">
            <label className="label">Contraseña</label>
            <input
              type="password"
              className={`input ${fieldError("contrasena") ? "border-una-red" : ""}`}
              value={form.data.contrasena}
              onChange={(e) => form.setData("contrasena", e.target.value)}
              placeholder="Mínimo 8 caracteres"
            />
            <div className="error-text">{fieldError("contrasena")}</div>
          </div>

          {/* Confirmar contraseña */}
          <div className="field">
            <label className="label">Confirmar contraseña</label>
            <input
              type="password"
              className={`input ${fieldError("contrasena_confirmation") ? "border-una-red" : ""}`}
              value={form.data.contrasena_confirmation}
              onChange={(e) => form.setData("contrasena_confirmation", e.target.value)}
              placeholder="Reingrese la contraseña"
            />
            <div className="error-text">{fieldError("contrasena_confirmation")}</div>
          </div>

          <div className="full-row help-text">Campos con * son obligatorios. La contraseña debe tener mínimo 8 caracteres.</div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={form.processing || !valid}
            className="btn-primary"
            aria-disabled={form.processing || !valid}
            title={valid ? "Registrar" : "Complete todos los campos correctamente"}
          >
            {form.processing ? "Enviando..." : "Registrar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioRegistroAdmin;
