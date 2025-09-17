import React, { useState, FormEvent } from "react";
import { Inertia } from "@inertiajs/inertia";
import unaLogo from "../assets/logoUNA.png";

const Login: React.FC = () => {
  const [correo, setCorreo] = useState<string>("");
  const [contrasena, setContrasena] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    Inertia.post("/login", { correo, password: contrasena }, {
      onError: (errors: any) =>
        setError(errors?.message || "Correo o contraseña incorrecta"),
      onSuccess: () => console.log("Login exitoso"),
    });
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px", // asegura márgenes en celular
  };
  
  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "650px", // límite en pantallas grandes
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
            width: "50%", // escala proporcional
            maxWidth: "220px",
            height: "auto",
            marginBottom: "30px",
          }}
        />

        {/* Título */}
        <h1
          style={{
            fontFamily: "'Goudy Old Style', serif",
            fontSize: "clamp(24px, 5vw, 48px)", // responsivo
            color: "#000000",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          Iniciar Sesión
        </h1>

        {/* Input Correo */}
        <div style={{ width: "100%" }}>
          <label htmlFor="correo" style={labelStyle}>
            Correo Electrónico
          </label>
          <input
            id="correo"
            type="email"
            placeholder="Ingrese su correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Input Contraseña */}
        <div style={{ width: "100%" }}>
          <label htmlFor="contrasena" style={labelStyle}>
            Contraseña
          </label>
          <input
            id="contrasena"
            type="password"
            placeholder="Ingrese su contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Errores */}
        {error && (
          <p style={{ color: "red", fontSize: "14px", marginBottom: "15px" }}>
            {error}
          </p>
        )}

        {/* Botón login */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            maxWidth: "358px",
            height: "60px",
            backgroundColor: "#CD1719",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "5px",
            fontSize: "20px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          Iniciar Sesión
        </button>

        {/* Links */}
        <div
          style={{
            display: "flex",
            flexDirection: "column", // en móvil quedan uno bajo otro
            gap: "10px",
            fontSize: "16px",
            textAlign: "center",
          }}
        >
          <a href="/recuperar-contrasena" style={{ color: "#034991" }}>
            ¿Olvidó su contraseña?
          </a>
          <a href="/registro" style={{ color: "#034991" }}>
            Crear Cuenta
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
