// backend/resources/js/components/FormularioRegistroAdmin.tsx
import React, { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Link } from "@inertiajs/react";
type Rol = "Administrador del Sistema" | "Dirección" | "Subdirección";

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


interface Universidad {
  id_universidad: number;
  nombre: string;
  sigla?: string;
}

interface Carrera {
  id_carrera: number;
  nombre: string;
  id_universidad?: number;
}

const allowedCarreras = [
  "Ingeniería en Sistemas",
  "Química Industrial",
  "Administración",
  "Inglés"
];

const FormularioRegistroAdmin: React.FC = () => {
  const form = useForm({
    nombre_completo: "",
    correo: "",
    identificacion: "",
    telefono: "",
    rol: "Administrador del Sistema" as Rol,
    universidad: "",
    carrera: "",
    contrasena: "",
    contrasena_confirmation: "",
  });

  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [loadingCarreras, setLoadingCarreras] = useState(false);

  const fieldError = (field: string) => (form.errors as Record<string, any>)[field] || "";

  const labelFromNombre = (nombre: string) => {
    if (nombre === "Ingeniería en Sistemas") return "Ing. Sistemas";
    return nombre;
  };

  const loadCarrerasForUni = async (id_universidad: number) => {
    setLoadingCarreras(true);
    try {
      const res = await fetch(`/universidades/${id_universidad}/carreras`, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Error cargando carreras");
      const data = await res.json();
      const filtered = Array.isArray(data) ? data.filter(c => allowedCarreras.includes(c.nombre)) : [];
      setCarreras(filtered);
      form.setData("carrera", "");
    } catch (err) {
      console.error(err);
      setCarreras([]);
      form.setData("carrera", "");
    } finally {
      setLoadingCarreras(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadUnis = async () => {
      setLoadingUnis(true);
      try {
        const res = await fetch("/universidades", { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("Error cargando universidades");
        const data = await res.json();
        if (!mounted) return;
        setUniversidades(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          form.setData("universidad", data[0].nombre);
          await loadCarrerasForUni(data[0].id_universidad);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoadingUnis(false);
      }
    };
    loadUnis();
    return () => { mounted = false; };
  }, []);

  const handleUniChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    const selected = universidades.find((u) => u.id_universidad === selectedId);
    if (!selected) {
      form.setData("universidad", e.target.value);
      setCarreras([]);
      form.setData("carrera", "");
      return;
    }
    form.setData("universidad", selected.nombre);
    await loadCarrerasForUni(selectedId);
  };

  const handleCarreraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "") {
      form.setData("carrera", "");
      return;
    }
    const selectedId = Number(val);
    const selected = carreras.find((c) => c.id_carrera === selectedId);
    if (selected) form.setData("carrera", selected.nombre);
  };

  const isFormValid = (): boolean => {
    const data = form.data as Record<string, any>;
    if (!data.nombre_completo || !String(data.nombre_completo).trim()) return false;
    if (!data.correo || !/^\S+@\S+\.\S+$/.test(String(data.correo))) return false;
    const idClean = String(data.identificacion || "").replace(/[-\s]/g, "");
    if (!idClean || !/^\d+$/.test(idClean)) return false;
    const tel = String(data.telefono || "").replace(/[-\s]/g, "");
    if (tel && !/^\d{8}$/.test(tel)) return false;
    if (data.rol === "Dirección" && !String(data.carrera || "").trim()) return false;
    if (!data.contrasena || String(data.contrasena).length < 8) return false;
    if (String(data.contrasena) !== String(data.contrasena_confirmation)) return false;
    return true;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    form.post(route("usuarios.store"), {
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

  const renderUniversidadField = () => {
    if (loadingUnis) return <div>Cargando universidades...</div>;
    if (universidades.length === 0) {
      return (
        <input
          className="input"
          value={form.data.universidad}
          onChange={(e) => form.setData("universidad", e.target.value)}
          placeholder="Ej: Universidad Nacional"
        />
      );
    }
    const found = universidades.find((u) => u.nombre === form.data.universidad);
    const value = found ? String(found.id_universidad) : String(universidades[0].id_universidad);

    return (
      <select className="select input" value={value} onChange={handleUniChange}>
        {universidades.map((u) => (
          <option key={u.id_universidad} value={u.id_universidad}>
            {u.sigla ? `${u.sigla} — ${u.nombre}` : u.nombre}
          </option>
        ))}
      </select>
    );
  };

  const renderCarreraField = () => {
    if (loadingCarreras) return <div>Cargando carreras...</div>;
    if (carreras.length === 0) {
      return (
        <input
          className="input"
          value={form.data.carrera}
          onChange={(e) => form.setData("carrera", e.target.value)}
          placeholder="Ej: Ingeniería en Sistemas"
        />
      );
    }
    const selectedOptionValue = (() => {
      const found = carreras.find((c) => c.nombre === form.data.carrera);
      return found ? String(found.id_carrera) : "";
    })();

    return (
      <select className="select input" value={selectedOptionValue} onChange={handleCarreraChange}>
        <option value="">Ninguna</option>
        {carreras.map((c) => (
          <option key={c.id_carrera} value={c.id_carrera}>
            {labelFromNombre(c.nombre)}
          </option>
        ))}
      </select>
    );
  };

  const valid = isFormValid();

  return (
    <div className="form-section">
      <style>{tailwindStyles}</style>
      <style>{localStyles}</style>

   <div className="mb-4 flex justify-between items-center">
  <div>
    <h2 className="section-title text-una-red font-open-sans">
      Registro — Administrador / Dirección / Subdirección 
    </h2>
    <p className="section-sub">Complete los datos para crear la cuenta.</p>
  </div>

  <Link
    href={route('usuarios.index')}
    className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded"
  >
    Volver
  </Link>
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
              <option value="Administrador del Sistema">Administrador del Sistema</option>
              <option value="Dirección">Dirección</option>
              <option value="Subdirección">Subdirección</option>
            </select>
            <div className="error-text">{fieldError("rol")}</div>
          </div>
          {/* Universidad */}
          <div className="field">
            <label className="label">Universidad asociada</label>
            {renderUniversidadField()}
            <div className="error-text">{fieldError("universidad")}</div>
          </div>

          <div className="field">
            <label className="label">
              Carrera asociada {form.data.rol === "Dirección" && <span style={{ color: "#CD1719" }}>(requerida)</span>}
            </label>
            {renderCarreraField()}
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