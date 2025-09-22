import React, { useState, FormEvent } from "react";
import axios from "axios";
import { router } from "@inertiajs/react"; // 🔹 Import de Inertia para redirección
import unaLogo from "../assets/logoUNA.png";


const Login: React.FC = () => {
  const [correo, setCorreo] = useState<string>("");
  const [contrasena, setContrasena] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/login", { correo, password: contrasena });

      if (res.data.redirect) {
        window.location.href = res.data.redirect; // Redirige según rol
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  // ==== estilos ====
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
            flexDirection: "column",
            gap: "10px",
            fontSize: "16px",
            textAlign: "center",
          }}
        >
          {/* 🔹 Link de recuperar contraseña usando Inertia */}
          <span
            onClick={() => router.get("/recuperar")}
            style={{ color: "#034991", cursor: "pointer", textDecoration: "underline" }}
          >
            ¿Olvidó su contraseña?
          </span>

          <span
            onClick={() => router.get("/registro")}
            style={{ color: "#034991", cursor: "pointer", textDecoration: "underline" }}
          >
            Crear Cuenta
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
