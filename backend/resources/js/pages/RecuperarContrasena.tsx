import React, { useState, FormEvent, useMemo } from "react";
import axios from "axios";
import unaLogo from "../assets/logoUNA.png";
import { useModal } from "../hooks/useModal";

const RecuperarContrasena: React.FC = () => {
  const [correo, setCorreo] = useState<string>("");
  const [codigo, setCodigo] = useState<string>("");
  const [codigoEnviado, setCodigoEnviado] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const modal = useModal(); // MOD: usar el modal

  // MOD: Regex idéntico al backend (8–15, minúscula, mayúscula, número, carácter especial, sin espacios)
  const regexContrasena = useMemo(
    () =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%?&])([A-Za-z\d$@$!%?&]|[^ ]){8,15}$/,
    []
  );

  // MOD: Validadores en español
  const validarContrasena = (v: string): string | undefined => {
    if (!v) return "La contraseña es obligatoria.";
    if (v.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (v.length > 15) return "La contraseña no puede superar los 15 caracteres.";
    if (!regexContrasena.test(v))
      return "Debe incluir minúscula, mayúscula, número, un carácter especial ($ @ $ ! % ? &) y no contener espacios.";
    return undefined;
  };

  // MOD: Validación de confirmación
  const validarConfirmacion = (p: string, c: string): string | undefined => {
    if (!c) return "Debe confirmar la contraseña.";
    if (p !== c) return "Las contraseñas no coinciden.";
    return undefined;
    };

  // MOD: Errores calculados en tiempo real
  const errorPassword = useMemo(() => validarContrasena(password), [password]);
  const errorConfirm  = useMemo(() => validarConfirmacion(password, confirmPassword), [password, confirmPassword]);

  // Enviar código
  const handleEnviarCodigo = async () => {
    setError("");
    try {
      await axios.post("/recuperar/enviar-codigo", { correo });
      setCodigoEnviado(true);
      await modal.alerta({ titulo: "Éxito", mensaje: "Código enviado al correo" }); // MOD
    } catch (err: any) {
      await modal.alerta({ titulo: "Error", mensaje: err.response?.data?.message || "Error al enviar el código" }); // MOD
      setError(err.response?.data?.message || "Error al enviar el código");
    }
  };

  // Cambiar contraseña
  const handleCambiarContrasena = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // MOD: Cortafuegos de validación en cliente antes de enviar
    if (errorPassword || errorConfirm) {
      await modal.alerta({ titulo: "Advertencia", mensaje: errorPassword || errorConfirm || "Revise los campos." });
      setError(errorPassword || errorConfirm || "Revise los campos.");
      return;
    }

    // MOD: Confirmación antes de cambiar la contraseña
    const ok = await modal.confirmacion({
      titulo: "Confirmar cambio",
      mensaje: "¿Está seguro que desea cambiar la contraseña?"
    });
    if (!ok) return;

    try {
      await axios.post("/recuperar/cambiar-contrasena", {
        correo,
        codigo,
        password,
        password_confirmation: confirmPassword, // MOD: nombre compatible con 'confirmed' en backend
      });
      await modal.alerta({ titulo: "Éxito", mensaje: "Contraseña cambiada con éxito" }); // MOD
      window.location.href = "/login";
    } catch (err: any) {
      await modal.alerta({ titulo: "Error", mensaje: err.response?.data?.message || "Error al cambiar la contraseña" }); // MOD
      setError(err.response?.data?.message || "Error al cambiar la contraseña");
    }
  };

  // ==== estilos iguales al login ====
  const containerStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "650px",
    backgroundColor: "#F6F6F6",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "30px 20px",
    boxSizing: "border-box",
    borderRadius: "10px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "50px",
    marginBottom: "8px", // MOD: espacio más corto para mostrar mensaje de error debajo
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box",
    color: "#000000",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "5px",
    fontSize: "14px",
    color: "#000000",
    fontWeight: "bold",
  };

  // MOD: estilos para ayuda y error de campo
  const helpStyle: React.CSSProperties = { fontSize: "12px", color: "#4B5563", marginBottom: "12px" };
  const fieldErrorStyle: React.CSSProperties = { color: "red", fontSize: "12px", marginBottom: "12px" };

  // MOD: desactivar submit si hay errores o campos vacíos
  const submitDisabled =
    !codigoEnviado ||
    !!errorPassword ||
    !!errorConfirm ||
    !password ||
    !confirmPassword ||
    !codigo;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Logo */}
        <img
          src={unaLogo}
          alt="Logo UNA"
          style={{
            width: "50%",
            maxWidth: "220px",
            height: "auto",
            marginBottom: "30px",
          }}
        />

        {/* Título */}
        <h1
          style={{
            fontFamily: "'Goudy Old Style', serif",
            fontSize: "clamp(24px, 5vw, 48px)",
            color: "#000000",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          Recuperar Contraseña
        </h1>

        {/* Descripción */}
        <p
          style={{
            marginBottom: "20px",
            fontSize: "16px",
            textAlign: "center",
            color: "#000000",
          }}
        >
          Ingrese su correo para recibir un código de recuperación.
        </p>

        <form
          style={{ width: "100%", maxWidth: "500px" }}
          onSubmit={handleCambiarContrasena}
        >
          {/* Correo */}
          <div style={{ width: "100%" }}>
            <label htmlFor="correo" style={labelStyle}>
              Correo Electrónico
            </label>
            <input
              id="correo"
              type="email"
              placeholder="ejemplo@est.una.ac.cr"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              style={inputStyle}
              disabled={codigoEnviado}
              required
            />
            {!codigoEnviado && (
              <button
                type="button"
                onClick={handleEnviarCodigo}
                style={{
                  width: "100%",
                  height: "50px",
                  backgroundColor: "#CD1719",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "18px",
                  cursor: "pointer",
                  marginBottom: "20px",
                }}
              >
                Enviar Código
              </button>
            )}
          </div>

          {/* Código + Nueva contraseña */}
          {codigoEnviado && (
            <>
              <div style={{ width: "100%" }}>
                <label htmlFor="codigo" style={labelStyle}>
                  Código de Verificación
                </label>
                <input
                  id="codigo"
                  type="text"
                  placeholder="Ingrese el código recibido"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ width: "100%" }}>
                <label htmlFor="password" style={labelStyle}>
                  Nueva Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  required
                />
                {/* MOD: texto guía de la política */}
                <p style={helpStyle}>
                  8–15 caracteres, incluir minúscula, mayúscula, número y un caracter especial ($@$!%?&). Sin espacios.
                </p>
                {/* MOD: error de contraseña */}
                {errorPassword && <p style={fieldErrorStyle}>{errorPassword}</p>}
              </div>

              <div style={{ width: "100%" }}>
                <label htmlFor="confirmPassword" style={labelStyle}>
                  Confirmar Nueva Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  required
                />
                {/* MOD: error de confirmación */}
                {errorConfirm && <p style={fieldErrorStyle}>{errorConfirm}</p>}
              </div>

              <button
                type="submit"
                // MOD: deshabilitar si la validación no pasa
                disabled={submitDisabled}
                style={{
                  width: "100%",
                  height: "50px",
                  backgroundColor: submitDisabled ? "#c7c7c7" : "#CD1719", // MOD: feedback visual
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "18px",
                  cursor: submitDisabled ? "not-allowed" : "pointer",
                  marginBottom: "20px",
                }}
              >
                Cambiar Contraseña
              </button>
            </>
          )}
        </form>

        {/* Errores globales */}
        {error && (
          <p style={{ color: "red", fontSize: "14px", marginTop: "10px" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default RecuperarContrasena;
