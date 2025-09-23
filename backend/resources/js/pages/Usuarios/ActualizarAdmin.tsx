// backend/resources/js/pages/Usuarios/ActualizarAdmin.tsx
import React, { useEffect, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import PpLayout from "@/layouts/PpLayout";
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
  "Ingeniería en Sistemas de Información",
  "Química Industrial",
  "Administración",
  "Inglés"
];

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

export default function ActualizarAdmin({ usuario, userPermisos }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    nombre_completo: usuario.nombre_completo,
    correo: usuario.correo,
    identificacion: usuario.identificacion,
    telefono: usuario.telefono ?? "",
    rol: (usuario.rol as Rol) ?? ("Administrador del Sistema" as Rol),
    universidad: usuario.universidad ?? "",
    carrera: usuario.carrera ?? "",
    contrasena: "",
    contrasena_confirmation: "",
  });

  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [loadingCarreras, setLoadingCarreras] = useState(false);

  const fieldError = (field: keyof typeof data) => {
    const v = (errors as Record<string, any>)[String(field)];
    if (!v) return "";
    return Array.isArray(v) ? v.join(", ") : String(v);
  };

  const labelFromNombre = (nombre: string) => {
    if (nombre === "Ingeniería en Sistemas") return "Ing. Sistemas";
    return nombre;
  };

  const loadCarrerasForUni = async (id_universidad: number) => {
    setLoadingCarreras(true);
    try {
      const res = await fetch(`/universidades/${id_universidad}/carreras`, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Error cargando carreras");
      const dataRes = await res.json();
      const filtered = Array.isArray(dataRes) ? dataRes.filter(c => allowedCarreras.includes(c.nombre)) : [];
      setCarreras(filtered);
    } catch (err) {
      console.error(err);
      setCarreras([]);
    } finally {
      setLoadingCarreras(false);
    }
  };

useEffect(() => {
  let mounted = true;

  const normalize = (str?: string) =>
    str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() : "";

  const loadUnis = async () => {
    setLoadingUnis(true);
    try {
      const res = await fetch("/universidades", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Error cargando universidades");
      const dataRes = await res.json();
      if (!mounted) return;

      const listaUnis = Array.isArray(dataRes) ? dataRes : [];
      setUniversidades(listaUnis);

      // Buscar por nombre o sigla normalizados
      let uniActual = listaUnis.find(
        (u) =>
          normalize(u.nombre) === normalize(usuario.universidad) ||
          normalize(u.sigla) === normalize(usuario.universidad)
      );

      if (!uniActual && listaUnis.length > 0) {
        uniActual = listaUnis[0];
      }

      if (uniActual) {
        // Guardar nombre completo para backend
        setData("universidad", uniActual.nombre);
        await loadCarrerasForUni(uniActual.id_universidad);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (mounted) setLoadingUnis(false);
    }
  };

  loadUnis();
  return () => {
    mounted = false;
  };
}, [usuario.universidad]);

  const handleUniChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedId = Number(e.target.value);
  const selected = universidades.find((u) => u.id_universidad === selectedId);
  if (!selected) {
    setData("universidad", e.target.value);
    setCarreras([]);
    setData("carrera", "");
    return;
  }
  // Guardar el nombre completo para el backend
  setData("universidad", selected.nombre);
  await loadCarrerasForUni(selectedId);
  setData("carrera", "");
};


  const handleCarreraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "") {
      setData("carrera", "");
      return;
    }
    const selectedId = Number(val);
    const selected = carreras.find((c) => c.id_carrera === selectedId);
    if (selected) setData("carrera", selected.nombre);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route("admin.actualizar", { id: usuario.id }), {
      preserveScroll: true,
    });
  };

const renderUniversidadField = () => {
  if (loadingUnis) return <div>Cargando universidades...</div>;
  if (universidades.length === 0) {
    return (
      <input
        className="input"
        value={data.universidad}
        onChange={(e) => setData("universidad", e.target.value)}
        placeholder="Ej: Universidad Nacional"
      />
    );
  }

  // Buscar por nombre o sigla para seleccionar la opción correcta
  const found = universidades.find(
    (u) =>
      u.nombre === data.universidad ||
      u.sigla === data.universidad
  );

  const value = found ? String(found.id_universidad) : "";

  return (
    <select
      className="select input"
      value={value}
      onChange={handleUniChange}
    >
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
          value={data.carrera}
          onChange={(e) => setData("carrera", e.target.value)}
          placeholder="Ej: Ingeniería en Sistemas"
        />
      );
    }
    const selectedOptionValue = (() => {
      const found = carreras.find((c) => c.nombre === data.carrera);
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

  return (
    <>
      <Head title="Actualizar Usuario Administrador/Dirección/Subdirección" />
      <div className="form-section">
        <style>{tailwindStyles}</style>
        <style>{localStyles}</style>
<div className="mb-4 flex justify-between items-center">
  <div>
    <h2 className="section-title text-una-red font-open-sans">
      Actualizar — Administrador / Dirección / Subdirección
    </h2>
    <p className="section-sub">Modifique los datos y guarde los cambios.</p>
  </div>

  <Link
    href={route('usuarios.index')}
    className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded"
  >
    Volver
  </Link>
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

            {/* Carrera */}
            <div className="field">
              <label className="label">Carrera asociada</label>
              {renderCarreraField()}
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