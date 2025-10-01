// backend/resources/js/components/FormularioRegistroAdmin.tsx
import React, { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Link } from "@inertiajs/react";

type Rol = "Administrador del Sistema" | "Dirección" | "Subdirección";

const tailwindStyles = `
  /* Paletas y utilidades pequeñas */
  .text-una-red { color: #CD1719; }
  .bg-una-red { background-color: #CD1719; }
  .border-una-red { border-color: #CD1719; }
  .text-una-blue { color: #034991; }
  .text-una-gray { color: #A7A7A9; }
  .text-black { color: #000000; }
  .text-una-dark-gray { color: #4B5563; }

  /* Tipografías - prioridad: Frutiger (títulos/labels), Open Sans (fallback para títulos),
     Goudy Old Style (texto extenso / inputs / párrafos) */
  :root{
    --font-title: "Frutiger", "Open Sans", Arial, sans-serif;
    --font-body: "Goudy Old Style", Georgia, "Times New Roman", serif;
  }
`;

/* estilos locales (grid, inputs, botón, estados disabled)
   Aplique font-family específicas según tu especificación */
const localStyles = `
  .form-section {
    width: 100%;
    box-sizing: border-box;
    max-width: 980px;
    margin: 0 auto;
    /* texto de lectura extensa (cuerpo) */
    font-family: var(--font-body);
  }

  /* Títulos y textos cortos: Frutiger / Open Sans */
  .section-title {
    font-family: var(--font-title);
    font-size: 1.6rem;
    font-weight: 700;
    margin-bottom: .25rem;
  }

  .section-sub {
    color: #333;
    margin-bottom: .75rem;
    font-size: .95rem;
    /* subtítulos cortos: usar font-title para consistencia visual en títulos/subtítulos */
    font-family: var(--font-title);
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media (min-width: 768px) { .form-grid { grid-template-columns: repeat(2, 1fr); } }

  .field { display: flex; flex-direction: column; }

  /* Labels son textos cortos => usar font-title */
  .label {
    font-family: var(--font-title);
    font-weight: 700;
    margin-bottom: .25rem;
    font-size: .95rem;
    color: #034991;
  }

  /* Inputs: contenidos potencialmente largos -> usar font-body (Goudy Old Style) */
  .input, .select {
    font-family: var(--font-body);
    padding: .5rem .75rem;
    border: 1px solid #A7A7A9;
    border-radius: 6px;
    font-size: .95rem;
    color: #111;
    box-sizing: border-box;
  }

  .input::placeholder { font-family: var(--font-body); color: #9CA3AF; }

  .input:focus, .select:focus {
    outline: none;
    border-color: #CD1719;
    box-shadow: 0 0 6px rgba(205,23,25,0.12);
  }

  /* Botón: texto corto => font-title */
  .btn-primary {
    font-family: var(--font-title);
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

  .error-text {
    color: #b91c1c;
    font-size: .9rem;
    margin-top: .35rem;
    min-height: 1.1rem;
    /* mensajes de error (lectura) => font-body */
    font-family: var(--font-body);
  }

  .help-text {
    color: #4B5563;
    font-size: .9rem;
    text-align: center;
    margin-top: .5rem;
    font-family: var(--font-body);
  }

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
  "Ninguna",
  "Ingeniería en Sistemas de Información",
  "Química Industrial",
  "Inglés",
  "Administración",
  "Otra",
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

  /* ================ carga dinámicas ================ */
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

  const loadCarrerasForUni = async (id_universidad: number) => {
    setLoadingCarreras(true);
    try {
      const res = await fetch(`/universidades/${id_universidad}/carreras`, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Error cargando carreras");
      const data = await res.json();
      const filtered = Array.isArray(data) ? data.filter((c: any) => allowedCarreras.includes(c.nombre)) : [];
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
        placeholder="Opcional"
      />
    );
  }

  const selectedOptionValue = (() => {
    const found = carreras.find((c) => c.nombre === form.data.carrera);
    return found ? String(found.id_carrera) : "";
  })();

  return (
    <select
      className="select input"
      value={selectedOptionValue}
      onChange={handleCarreraChange}
    >
      {carreras.map((c) => (
        <option key={c.id_carrera} value={c.id_carrera}>
          {c.nombre}
        </option>
      ))}
    </select>
  );
};


  /* ========================= VALIDACIONES EN TIEMPO REAL ========================= */
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    value = value.replace(/\s{2,}/g, " ");
    if (value.length > 100) value = value.slice(0, 100);
    form.setData("nombre_completo", value);
  };

  const handleCorreoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[0-9]/g, "");
    value = value.replace(/\s/g, "");
    if (value.length > 150) value = value.slice(0, 150);
    form.setData("correo", value);
  };

  const validarCorreo = (correo: string) => /^.+@(una\.ac\.cr|gmail\.com)$/i.test(correo);

  const handleIdentificacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    if (value.length > 12) value = value.slice(0, 12);
    form.setData("identificacion", value);
  };

const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    form.setData("telefono", value);
  };

  const validarContrasena = (pwd: string) =>
    /[a-z]/.test(pwd) &&
    /[A-Z]/.test(pwd) &&
    /\d/.test(pwd) &&
    /[$@!%?&]/.test(pwd) &&
    !/\s/.test(pwd) &&
    pwd.length >= 8 &&
    pwd.length <= 12;

  const getContrasenaError = (pwd: string) => {
    if (!pwd) return "Requerido";
    const problems: string[] = [];
    if (!/[a-z]/.test(pwd)) problems.push("una minúscula");
    if (!/[A-Z]/.test(pwd)) problems.push("una mayúscula");
    if (!/\d/.test(pwd)) problems.push("un número");
    if (!/[$@!%?&]/.test(pwd)) problems.push("un carácter especial ($ @ ! % ? &)");
    if (/\s/.test(pwd)) problems.push("no debe tener espacios");
    if (pwd.length < 8) problems.push("mínimo 8 caracteres");
    if (pwd.length > 12) problems.push("máximo 12 caracteres");
    if (problems.length === 0) return "";
    return "La contraseña debe incluir " + problems.join(", ") + ".";
  };

  /* ========================= Validación general ========================= */
  const anyTextEmpty = () => {
    const requiredText = [
      String(form.data.nombre_completo || ""),
      String(form.data.correo || ""),
      String(form.data.identificacion || ""),
      String(form.data.telefono || ""),
    ];
    return requiredText.some((s) => !s.trim());
  };

  const isFormValid = (): boolean => {
    const data = form.data as Record<string, any>;
    if (anyTextEmpty()) return false;
    if (!validarCorreo(data.correo)) return false;
    if (data.identificacion.length === 0 || data.identificacion.length > 12) return false;
    if (data.telefono.length !== 8) return false;
    if (!validarContrasena(data.contrasena)) return false;
    if (data.contrasena !== data.contrasena_confirmation) return false;
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

  const nombreError = !String(form.data.nombre_completo || "").trim() ? "Requerido" : "";
  const correoError =
    !String(form.data.correo || "").trim()
      ? "Requerido"
      : (!validarCorreo(form.data.correo) ? "Correo inválido (dominios: una.ac.cr o gmail.com)" : "");
  const identificacionError =
    !String(form.data.identificacion || "").trim()
      ? "Requerido"
      : (String(form.data.identificacion).length !== 9 ? "Debe tener 9 dígitos o 12 si es DIMEX " : "");
  const telefonoError =
    !String(form.data.telefono || "").trim()
      ? "Requerido"
      : (((form.data.telefono as string).length < 8 || (form.data.telefono as string).length > 9) ? "Teléfono inválido (8 digitos)" : "");
  const contrasenaError = getContrasenaError(String(form.data.contrasena || ""));
  const contrasenaConfirmError = form.data.contrasena && form.data.contrasena !== form.data.contrasena_confirmation ? "No coincide" : "";

  const valid = isFormValid();

  return (
    <div className="form-section">
      <style>{tailwindStyles + localStyles}</style>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="section-title text-una-red" style={{ margin: 0 }}>
            Registro — Administrador / Dirección / Subdirección
          </h2>
          <p className="section-sub">Complete los datos para crear la cuenta.</p>
        </div>
        <Link
          href={route("usuarios.index")}
          className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded"
        >
          Volver
        </Link>
      </div>

      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          {/* Nombre completo */}
          <div className="field">
            <label className="label">Nombre completo</label>
            <input
              className={`input ${fieldError("nombre_completo") ? "border-una-red" : ""}`}
              value={form.data.nombre_completo}
              onChange={handleNombreChange}
              placeholder="Ej: Juan Pérez González"
              maxLength={100}
            />
            <div className="error-text">{fieldError("nombre_completo") || nombreError}</div>
          </div>

          {/* Correo */}
          <div className="field">
            <label className="label">Correo institucional</label>
            <input
              type="email"
              className={`input ${fieldError("correo") ? "border-una-red" : ""}`}
              value={form.data.correo}
              onChange={handleCorreoChange}
              placeholder="ejemplo@una.ac.cr"
            />
            <div className="error-text">{fieldError("correo") || correoError}</div>
          </div>

          {/* Identificación */}
          <div className="field">
            <label className="label">Número de identificación</label>
            <input
              className={`input ${fieldError("identificacion") ? "border-una-red" : ""}`}
              value={form.data.identificacion}
              onChange={handleIdentificacionChange}
              placeholder="Ej: ABC123456"
              maxLength={12}
            />
            <div className="error-text">{fieldError("identificacion") || identificacionError}</div>
          </div>

          {/* Teléfono */}
          <div className="field">
            <label className="label">Teléfono de contacto</label>
            <input
              className={`input ${fieldError("telefono") ? "border-una-red" : ""}`}
              value={form.data.telefono}
              onChange={handleTelefonoChange}
              placeholder="88888888"
              maxLength={8}
            />
            <div className="error-text">{fieldError("telefono") || telefonoError}</div>
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

          {/* Contraseña */}
          <div className="field">
            <label className="label">Contraseña</label>
            <input
              type="password"
              className={`input ${fieldError("contrasena") ? "border-una-red" : ""}`}
              value={form.data.contrasena}
              onChange={(e) => form.setData("contrasena", e.target.value)}
              placeholder="8-12 caracteres, mayúscula, minúscula, número y símbolo"
            />
            <div className="error-text">{fieldError("contrasena") || contrasenaError}</div>
          </div>

          {/* Carrera */}
          <div className="field">
            <label className="label">Carrera asociada</label>
            {renderCarreraField()}
            <div className="error-text">{fieldError("carrera")}</div>
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
            <div className="error-text">{fieldError("contrasena_confirmation") || contrasenaConfirmError}</div>
          </div>

          <div className="full-row help-text">Campos con * son obligatorios. La contraseña debe tener mínimo 8 caracteres y cumplir las reglas.</div>
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
