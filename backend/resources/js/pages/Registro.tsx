import React, { useState, FormEvent } from "react";
import axios from "axios"; // 👈 usamos axios en lugar de Inertia

const Registro: React.FC = () => {
  const [tipoCuenta, setTipoCuenta] = useState<string>("estudiante");
  const [correo, setCorreo] = useState<string>("");
  const [codigo, setCodigo] = useState<string>("");
  const [codigoEnviado, setCodigoEnviado] = useState<boolean>(false);
  const [codigoValidado, setCodigoValidado] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [nombreCompleto, setNombreCompleto] = useState<string>("");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    color: "#000000",
    backgroundColor: "#FFFFFF",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    color: "#000000",
    fontWeight: "bold",
    display: "block",
    marginBottom: "5px",
  };

  // Enviar código
  const handleEnviarCodigo = async () => {
    try {
      await axios.post("/registro/enviar-codigo", { correo });
      setCodigoEnviado(true);
      alert("Código enviado al correo");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al enviar el código");
    }
  };

  // Validar código
  const handleValidarCodigo = async () => {
    try {
      await axios.post("/registro/validar-codigo", { correo, codigo });
      setCodigoValidado(true);
      alert("Correo verificado correctamente");
    } catch (error: any) {
      alert(error.response?.data?.message || "Código incorrecto o expirado");
    }
  };

  // Registro final
  const handleRegistro = async (e: FormEvent) => {
    e.preventDefault();
    if (!codigoValidado) {
      alert("Primero debes validar tu correo");
      return;
    }
    try {
      await axios.post("/registro", {
        nombre_completo: nombreCompleto,
        correo,
        password,
        password_confirmation: confirmPassword,
        tipoCuenta,
      });
      alert("Registro exitoso");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error en el registro");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "700px",
          backgroundColor: "#F6F6F6",
          padding: "40px",
          borderRadius: "10px",
        }}
      >
        <h1 style={{ fontSize: "36px", marginBottom: "20px", color: "#000000" }}>
          Crear Cuenta
        </h1>

        {/* Selección tipo de cuenta */}
        <div style={{ marginBottom: "20px", color: "#000000" }}>
          <label>
            <input
              type="radio"
              value="estudiante"
              checked={tipoCuenta === "estudiante"}
              onChange={(e) => setTipoCuenta(e.target.value)}
            />
            Estudiante
          </label>
          <label style={{ marginLeft: "20px" }}>
            <input
              type="radio"
              value="egresado"
              checked={tipoCuenta === "egresado"}
              onChange={(e) => setTipoCuenta(e.target.value)}
            />
            Egresado
          </label>
        </div>

        {/* Correo y validación */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            style={inputStyle}
          />

          {!codigoEnviado && (
            <button
              onClick={handleEnviarCodigo}
              style={{
                padding: "10px 20px",
                marginTop: "10px",
                backgroundColor: "#CD1719",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Enviar código
            </button>
          )}
        </div>

        {codigoEnviado && !codigoValidado && (
          <div>
            <input
              type="text"
              placeholder="Ingrese el código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={handleValidarCodigo}
              style={{
                padding: "10px 20px",
                marginTop: "10px",
                backgroundColor: "#CD1719",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Validar código
            </button>
          </div>
        )}

        {/* Si el correo ya fue validado */}
        {codigoValidado && (
          <form onSubmit={handleRegistro}>
            <label style={labelStyle}>Nombre completo</label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>Confirmar contraseña</label>
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />

            {/* Campos específicos */}
            {tipoCuenta === "estudiante" ? (
              <div>
                <input
                  type="text"
                  placeholder="Carné estudiantil"
                  style={inputStyle}
                />
                <input type="text" placeholder="Carrera" style={inputStyle} />
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Año de graduación"
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Empresa actual"
                  style={inputStyle}
                />
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "#CD1719",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                fontSize: "18px",
                marginTop: "10px",
                cursor: "pointer",
              }}
            >
              Registrarse
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Registro;
