import React, { useState, FormEvent } from "react";
import axios from "axios";
import unaLogo from "../assets/logoUNA.png";

const RecuperarContrasena: React.FC = () => {
  const [correo, setCorreo] = useState<string>("");
  const [codigo, setCodigo] = useState<string>("");
  const [codigoEnviado, setCodigoEnviado] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Enviar código
  const handleEnviarCodigo = async () => {
    setError("");
    try {
      await axios.post("/recuperar/enviar-codigo", { correo });
      setCodigoEnviado(true);
      alert("Código enviado al correo");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al enviar el código");
    }
  };

  // Cambiar contraseña
  const handleCambiarContrasena = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("/recuperar/cambiar-contrasena", {
        correo,
        codigo,
        password,
        password_confirmation: confirmPassword,
      });
      alert("Contraseña cambiada con éxito");
      window.location.href = "/login";
    } catch (err: any) {
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
    marginBottom: "20px",
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
          Ingrese su correo institucional para recibir un código de recuperación.
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
              </div>

              <button
                type="submit"
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
                Cambiar Contraseña
              </button>
            </>
          )}
        </form>

        {/* Errores */}
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
