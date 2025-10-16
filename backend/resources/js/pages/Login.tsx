import React, { useState, FormEvent } from "react";
import axios from "axios";
import { router } from "@inertiajs/react"; // Import de Inertia para redirección
import unaLogo from "../assets/logoUNA.png";
import grademLogo from "../assets/GradEm.png";
import { Button } from "@/components/ui/button";//para usar el botn definido como componente


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
    const errores = err.response?.data?.errors;
  if (errores) {
    // Forzar a que TypeScript entienda que es un array de strings
    const primerError = (Object.values(errores)[0] as string[])[0];
      setError(primerError);
    } else {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    }
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
 // 🆕 Estilo para centrar los inputs y limitar su ancho
 const formGroupStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center", // Centra los inputs y labels
 };
 const inputWrapperStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "358px", // Mismo ancho que el botón para centrar y reducir
  marginBottom: "20px",
 };
 const inputStyle: React.CSSProperties = {
  width: "100%", // Se ajusta al maxWidth del contenedor padre (inputWrapperStyle)
  height: "50px",
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
  fontSize: "16px",
  color: "#000000",
  fontWeight: "bold",
  alignSelf: "flex-start", // Alinea el label a la izquierda dentro del inputWrapper
 };
 // 🆕 Nuevo estilo para el contenedor de logos
 const logosContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between", // Espacio entre los logos
  alignItems: "center",
  width: "100%",
  maxWidth: "550px", // Limita el ancho del contenedor de logos
  marginBottom: "30px",
  padding: "0 20px", // Padding horizontal para que no se peguen a los bordes
  boxSizing: "border-box",
 };
 const logoStyle: React.CSSProperties = {
  width: "40%", // Ajuste para que quepan ambos
  maxWidth: "180px", // Un poco menos de lo anterior para que quepan dos
  height: "auto",
 };
 return (
  <div style={containerStyle}>
   <div style={cardStyle}>
    {/* 🆕 Contenedor de Logos */}
    <div style={logosContainerStyle}>
     {/* 🆕 Logo GradEm (Izquierda) */}
     <img
      src={grademLogo}
      alt="Logo GradEm"
      style={logoStyle}
     />
     {/* Logo UNA (Derecha) */}
     <img
      src={unaLogo}
      alt="Logo UNA"
      style={logoStyle}
     />
    </div>
    {/* Título */}
    <h1
     style={{
      fontFamily: "'Goudy Old Style', serif",
      // 🆕 Título más pequeño
      fontSize: "clamp(20px, 4vw, 36px)",
      color: "#000000",
      marginBottom: "30px",
      textAlign: "center",
     }}
    >
     Iniciar Sesión
    </h1>
    {/* Input Correo - 🆕 Usando formGroupStyle para centrar */}
    <div style={formGroupStyle}>
     <div style={inputWrapperStyle}>
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
    </div>
    {/* Input Contraseña - 🆕 Usando formGroupStyle para centrar */}
    <div style={formGroupStyle}>
     <div style={inputWrapperStyle}>
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
    </div>
    {/* Errores */}
    {error && (
     <p style={{ color: "red", fontSize: "14px", marginBottom: "15px" }}>
      {error}
     </p>
    )}
    {/* Botón login - Centrado por cardStyle, pero el ancho está limitado por maxWidth */}
    <Button
      type="button"
      variant="destructive"
      size="default"
      className="w-full max-w-[358px] h-14 mb-5"
      onClick={handleLogin}
    >
      Iniciar Sesión
    </Button>
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
      {/* Links */}
      <div className="flex flex-col gap-2 text-center text-base">
        <Button asChild variant="link" size="default">
          <span
            onClick={() => router.get("/recuperar")}
            style={{ cursor: "pointer" }}
          >
            ¿Olvidó su contraseña?
          </span>
        </Button>
        <Button asChild variant="link" size="default">
          <span
            onClick={() => router.get("/registro")}
            style={{ cursor: "pointer" }}
          >
            Crear Cuenta
          </span>
        </Button>
      </div>
    </div>
   </div>
  </div>
 );
};

export default Login;
