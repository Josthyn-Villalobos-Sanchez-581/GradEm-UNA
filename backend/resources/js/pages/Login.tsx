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
      onError: (errors: any) => setError(errors?.message || "Correo o contraseña incorrecta"),
      onSuccess: () => console.log("Login exitoso")
    });
  };

  const inputStyle = {
    width: "516px",
    height: "62px",
    marginBottom: "30px",
    padding: "10px",
    fontSize: "18px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    backgroundColor: "#FFFFFF",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontSize: "16px",
    color: "#000000",
    fontWeight: "bold"
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "650px", height: "850px", backgroundColor: "#F6F6F6", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", boxSizing: "border-box", borderRadius: "10px" }}>
        <img src={unaLogo} alt="Logo UNA" width="220" height="120" style={{ marginBottom: "40px" }} />
        <h1 style={{ fontFamily: "'Goudy Old Style', serif", fontSize: "54px", color: "#000000", marginBottom: "50px" }}>Iniciar Sesión</h1>

        <div style={{ width: "100%" }}>
          <label htmlFor="correo" style={labelStyle}>Correo Electrónico</label>
          <input 
            id="correo"
            type="email" 
            placeholder="Ingrese su correo" 
            value={correo} 
            onChange={(e) => setCorreo(e.target.value)} 
            style={inputStyle} 
          />
        </div>

        <div style={{ width: "100%" }}>
          <label htmlFor="contrasena" style={labelStyle}>Contraseña</label>
          <input 
            id="contrasena"
            type="password" 
            placeholder="Ingrese su contraseña" 
            value={contrasena} 
            onChange={(e) => setContrasena(e.target.value)} 
            style={inputStyle} 
          />
        </div>

        {error && <p style={{ color: "red", fontSize: "16px" }}>{error}</p>}

        <button 
          onClick={handleLogin} 
          style={{ width: "358px", height: "83px", backgroundColor: "#CD1719", color: "#FFFFFF", border: "none", borderRadius: "5px", fontSize: "28px", cursor: "pointer", marginBottom: "30px" }}
        >
          Iniciar Sesión
        </button>

        <div style={{ display: "flex", gap: "20px", fontSize: "18px" }}>
          <a href="/recuperar-contrasena" style={{ color: "#034991" }}>¿Olvidó su contraseña?</a>
          <a href="/crear-cuenta" style={{ color: "#034991" }}>Crear Cuenta</a>
        </div>
      </div>
    </div>
  );
};

export default Login;


