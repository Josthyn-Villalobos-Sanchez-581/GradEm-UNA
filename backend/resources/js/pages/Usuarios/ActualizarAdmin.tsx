// backend/resources/js/pages/Usuarios/ActualizarAdmin.tsx
import React, { useEffect, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import PpLayout from "@/layouts/PpLayout";
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
  "Ingeniería en Sistemas de Información",
  "Química Industrial",
  "Administración",
  "Inglés",
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

  // -------------------------
  // Validaciones en tiempo real
  // -------------------------
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""); // quita números y símbolos
    value = value.replace(/\s{2,}/g, " "); // quita espacios dobles
    if (value.length > 100) value = value.slice(0, 100);
    setData("nombre_completo", value);
  };

  // Correo: **no permite números en tiempo real** y sin espacios.
  // Además al enviar verificamos dominio permitido (una.ac.cr o gmail.com).
  const handleCorreoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // quitar números y espacios en tiempo real
    value = value.replace(/[0-9]/g, "");
    value = value.replace(/\s/g, "");
    // limitar por si acaso
    if (value.length > 150) value = value.slice(0, 150);
    setData("correo", value);
  };

  const validarCorreo = (correo: string) => {
    // dominios permitidos coherentes con lo que discutimos (ajusta si necesitas otros)
    return /^.+@(una\.ac\.cr|gmail\.com)$/i.test(correo);
  };

  // Identificación: solo dígitos en tiempo real (no permite letras).
  const handleIdentificacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // solo números
    if (value.length > 9) value = value.slice(0, 9); // máximo 9 dígitos
    setData("identificacion", value);
  };

  // Teléfono: permite + al inicio y solo dígitos, máximo 12 caracteres (incluye +).
  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9+]/g, ""); // solo dígitos o +
    if (value.startsWith("+")) {
      value = "+" + value.slice(1).replace(/\+/g, ""); // solo un + al inicio
    } else {
      value = value.replace(/\+/g, "");
    }
    if (value.length > 12) value = value.slice(0, 12); // máximo 12
    setData("telefono", value);
  };

  // Contraseña: debe cumplir las reglas indicadas (si el usuario decide cambiarla).
  const validarContrasena = (pwd: string) => {
    if (!pwd) return true; // si está vacío, lo permitimos (contraseña opcional). Si prefieres obligatoria, cambia esto.
    return (
      /[a-z]/.test(pwd) && // minúscula
      /[A-Z]/.test(pwd) && // mayúscula
      /\d/.test(pwd) && // número
      /[$@!%?&]/.test(pwd) && // caracter especial obligatorio (uno de estos)
      !/\s/.test(pwd) && // no espacios
      pwd.length >= 8 &&
      pwd.length <= 12
    );
  };

  const getContrasenaError = (pwd: string) => {
    if (!pwd) return "";
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

  // -------------------------
  // Carga universidades / carreras (igual que antes)
  // -------------------------
  const loadCarrerasForUni = async (id_universidad: number) => {
    setLoadingCarreras(true);
    try {
      const res = await fetch(`/universidades/${id_universidad}/carreras`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Error cargando carreras");
      const dataRes = await res.json();
      const filtered = Array.isArray(dataRes)
        ? dataRes.filter((c: any) => allowedCarreras.includes(c.nombre))
        : [];
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
      str
        ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase()
        : "";

    const loadUnis = async () => {
      setLoadingUnis(true);
      try {
        const res = await fetch("/universidades", {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Error cargando universidades");
        const dataRes = await res.json();
        if (!mounted) return;

        const listaUnis = Array.isArray(dataRes) ? dataRes : [];
        setUniversidades(listaUnis);

        let uniActual = listaUnis.find(
          (u) =>
            normalize(u.nombre) === normalize(usuario.universidad) ||
            normalize(u.sigla) === normalize(usuario.universidad)
        );

        if (!uniActual && listaUnis.length > 0) {
          uniActual = listaUnis[0];
        }

        if (uniActual) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const found = universidades.find((u) => u.nombre === data.universidad || u.sigla === data.universidad);
    const value = found ? String(found.id_universidad) : "";
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

  // -------------------------
  // Validación general antes de enviar (y para deshabilitar botón)
  // - No permitir actualizar si hay campos de texto vacíos
  // - Identificación: exactamente 9 dígitos
  // - Correo: dominio permitido y no vacío
  // - Teléfono: no vacío y longitud entre 8 y 12 (incluye +)
  // - Contraseña: si está presente debe cumplir validarContrasena y coincidir con confirmación
  // -------------------------
  const anyTextEmpty = () => {
    // campos que son "escribibles" y deben no estar vacíos
    const requiredText = [
      String(data.nombre_completo || ""),
      String(data.correo || ""),
      String(data.identificacion || ""),
      String(data.telefono || ""),
    ];
    return requiredText.some((s) => !s.trim());
  };

  const isFormValid = () => {
    if (anyTextEmpty()) return false;
    if (!validarCorreo(data.correo)) return false;
    if ((data.identificacion || "").length !== 9) return false;
    // telefono: longitud entre 8 y 12 (incluye +)
    const telLen = (data.telefono || "").length;
    if (telLen < 8 || telLen > 12) return false;
    // password: optional, but if present must validate
    if (data.contrasena && !validarContrasena(data.contrasena)) return false;
    if (data.contrasena && data.contrasena !== data.contrasena_confirmation) return false;
    return true;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    put(route("admin.actualizar", { id: usuario.id }), { preserveScroll: true });
  };

  const nombreError = !data.nombre_completo.trim() ? "Requerido" : "";
  const correoError =
    !data.correo.trim() ? "Requerido" : (!validarCorreo(data.correo) ? "Correo inválido (dominios: @una.ac.cr o @gmail.com)" : "");
  const identificacionError =
    !data.identificacion ? "Requerido" : (data.identificacion.length !== 9 ? "Debe tener 9 dígitos" : "");
  const telefonoError =
    !data.telefono ? "Requerido" : ((data.telefono.length < 8 || data.telefono.length > 12) ? "Teléfono inválido (puede incluir extensión de pais)" : "");
  const contrasenaError = getContrasenaError(data.contrasena);
  const contrasenaConfirmError = data.contrasena && data.contrasena !== data.contrasena_confirmation ? "No coincide" : "";

  const valid = isFormValid();

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
            href={route("usuarios.index")}
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
                value={data.nombre_completo}
                onChange={handleNombreChange}
              />
              <div className="error-text">{fieldError("nombre_completo") || nombreError}</div>
            </div>

            {/* Correo */}
            <div className="field">
              <label className="label">Correo institucional</label>
              <input
                type="email"
                className={`input ${fieldError("correo") ? "border-una-red" : ""}`}
                value={data.correo}
                onChange={handleCorreoChange}
              />
              <div className="error-text">{fieldError("correo") || correoError}</div>
            </div>

            {/* Identificación */}
            <div className="field">
              <label className="label">Número de identificación</label>
              <input
                className={`input ${fieldError("identificacion") ? "border-una-red" : ""}`}
                value={data.identificacion}
                onChange={handleIdentificacionChange}
              />
              <div className="error-text">{fieldError("identificacion") || identificacionError}</div>
            </div>

            {/* Teléfono */}
            <div className="field">
              <label className="label">Teléfono de contacto</label>
              <input
                className={`input ${fieldError("telefono") ? "border-una-red" : ""}`}
                value={data.telefono}
                onChange={handleTelefonoChange}
              />
              <div className="error-text">{fieldError("telefono") || telefonoError}</div>
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


            {/* Contraseña */}
            <div className="field">
              <label className="label">Contraseña (opcional)</label>
              <input
                type="password"
                className={`input ${fieldError("contrasena") ? "border-una-red" : ""}`}
                value={data.contrasena}
                onChange={(e) => setData("contrasena", e.target.value)}
                placeholder="Dejar en blanco para no cambiar"
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
                value={data.contrasena_confirmation}
                onChange={(e) => setData("contrasena_confirmation", e.target.value)}
                placeholder="Reingrese la contraseña si la cambió"
              />
              <div className="error-text">{fieldError("contrasena_confirmation") || contrasenaConfirmError}</div>
            </div>

            <div className="full-row help-text">
              Puede dejar la contraseña en blanco si no desea cambiarla.
            </div>
          </div>

          <div className="mt-6">
            <button type="submit" className="btn-primary" disabled={processing || !valid} aria-disabled={processing || !valid}>
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
