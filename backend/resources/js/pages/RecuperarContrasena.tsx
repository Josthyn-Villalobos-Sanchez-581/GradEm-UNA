import React, { useState, FormEvent, useMemo, useEffect } from "react";
import axios from "axios";
import unaLogo from "../assets/logoUNA.png";
import grademLogo from "../assets/GradEm.png";
import { useModal } from "../hooks/useModal";

const RecuperarContrasena: React.FC = () => {
  const [correo, setCorreo] = useState<string>("");
  const [codigo, setCodigo] = useState<string>("");
  const [codigoEnviado, setCodigoEnviado] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const modal = useModal();

  const regexContrasena = useMemo(
    () =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%?&])([A-Za-z\d$@$!%?&]|[^ ]){8,15}$/,
    []
  );

  const validarContrasena = (v: string): string | undefined => {
    if (!v) return "La contraseña es obligatoria.";
    if (v.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (v.length > 15) return "La contraseña no puede superar los 15 caracteres.";
    if (!regexContrasena.test(v))
      return "Debe incluir minúscula, mayúscula, número, un carácter especial y no contener espacios.";
    return undefined;
  };

  const validarConfirmacion = (p: string, c: string): string | undefined => {
    if (!c) return "Debe confirmar la contraseña.";
    if (p !== c) return "Las contraseñas no coinciden.";
    return undefined;
  };

  const errorPassword = useMemo(() => validarContrasena(password), [password]);
  const errorConfirm = useMemo(
    () => validarConfirmacion(password, confirmPassword),
    [password, confirmPassword]
  );

  const calcularFuerza = (pass: string): number => {
    let fuerza = 0;
    if (pass.length >= 8) fuerza++;
    if (/[a-z]/.test(pass)) fuerza++;
    if (/[A-Z]/.test(pass)) fuerza++;
    if (/\d/.test(pass)) fuerza++;
    if (/[$@$!%?&]/.test(pass)) fuerza++;
    return fuerza;
  };

  const fuerza = useMemo(() => calcularFuerza(password), [password]);

  useEffect(() => {
    if (codigoEnviado && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [codigoEnviado, timeLeft]);

  const handleEnviarCodigo = async () => {
    setError("");
    setLoading(true);
    try {
      const resp = await axios.post("/recuperar/enviar-codigo", { correo });
      setCodigoEnviado(true);
      setTimeLeft(300);
      await modal.alerta({ titulo: "Proceso iniciado", mensaje: resp.data.message });
    } catch {
      await modal.alerta({
        titulo: "Atención",
        mensaje: "Hubo un problema al verificar el correo o enviar el código."
      });
      setError("Error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarContrasena = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (errorPassword || errorConfirm) {
      await modal.alerta({
        titulo: "Advertencia",
        mensaje: errorPassword || errorConfirm || "Revise los campos."
      });
      return;
    }

    const ok = await modal.confirmacion({
      titulo: "Confirmar cambio",
      mensaje: "¿Está seguro que desea cambiar la contraseña?"
    });
    if (!ok) return;

    setLoading(true);
    try {
      await axios.post("/recuperar/cambiar-contrasena", {
        correo,
        codigo,
        password,
        password_confirmation: confirmPassword,
      });
      await modal.alerta({ titulo: "Éxito", mensaje: "Contraseña cambiada con éxito" });
      window.location.href = "/login";
    } catch {
      await modal.alerta({
        titulo: "Error",
        mensaje: "El código es inválido o hubo un error al cambiar la contraseña."
      });
      setError("Error al cambiar la contraseña.");
    } finally {
      setLoading(false);
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
    borderRadius: "10px",
  };
  const formGroupStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };
  const inputWrapperStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "358px",
    marginBottom: "20px",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
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
    alignSelf: "flex-start",
  };
  const logosContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: "550px",
    marginBottom: "30px",
    padding: "0 20px",
  };
  const logoStyle: React.CSSProperties = {
    width: "40%",
    maxWidth: "180px",
    height: "auto",
  };
  const helpStyle: React.CSSProperties = { fontSize: "12px", color: "#4B5563", marginBottom: "12px" };
  const fieldErrorStyle: React.CSSProperties = { color: "red", fontSize: "12px", marginBottom: "12px" };

  const submitDisabled =
    !codigoEnviado || !!errorPassword || !!errorConfirm || !password || !confirmPassword || !codigo;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Logos arriba igual que en Login */}
        <div style={logosContainerStyle}>
          <img src={grademLogo} alt="Logo GradEm" style={logoStyle} />
          <img src={unaLogo} alt="Logo UNA" style={logoStyle} />
        </div>

        {/* Título más pequeño igual que Login */}
        <h1
          style={{
            fontFamily: "'Goudy Old Style', serif",
            fontSize: "clamp(20px, 4vw, 36px)",
            color: "#000",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          Recuperar Contraseña
        </h1>

        <form style={{ width: "100%", maxWidth: "500px" }} onSubmit={handleCambiarContrasena}>
          {/* Correo */}
          <div style={formGroupStyle}>
            <div style={inputWrapperStyle}>
              <label htmlFor="correo" style={labelStyle}>Correo Electrónico</label>
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
            </div>
            {!codigoEnviado && (
              <button
                type="button"
                onClick={handleEnviarCodigo}
                disabled={!correo || loading}
                style={{
                  width: "100%",
                  maxWidth: "358px",
                  height: "50px",
                  backgroundColor: "#CD1719",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "18px",
                  cursor: loading ? "wait" : "pointer",
                  marginBottom: "20px",
                }}
              >
                {loading ? "Procesando..." : "Enviar Código"}
              </button>
            )}
          </div>

          {/* Código + Contraseña */}
          {codigoEnviado && (
            <>
              <p style={{ fontSize: "14px", color: "#000", marginBottom: "10px" }}>
                {timeLeft > 0
                  ? `El código expirará en ${Math.floor(timeLeft / 60)}:${("0" + (timeLeft % 60)).slice(-2)}`
                  : "El código ha expirado, solicite uno nuevo."}
              </p>

              <div style={formGroupStyle}>
                <div style={inputWrapperStyle}>
                  <label htmlFor="codigo" style={labelStyle}>Código de Verificación</label>
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
              </div>

              <div style={formGroupStyle}>
                <div style={inputWrapperStyle}>
                  <label htmlFor="password" style={labelStyle}>Nueva Contraseña</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                    required
                  />
                  <p style={helpStyle}>
                    8–15 caracteres, incluir minúscula, mayúscula, número y un caracter especial ($@$!%?&).
                  </p>
                  <div style={{ height: "8px", width: "100%", background: "#ddd", borderRadius: "4px", marginBottom: "10px" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(fuerza / 5) * 100}%`,
                        background: fuerza < 3 ? "red" : fuerza === 3 ? "orange" : "green",
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                  {errorPassword && <p style={fieldErrorStyle}>{errorPassword}</p>}
                </div>
              </div>

              <div style={formGroupStyle}>
                <div style={inputWrapperStyle}>
                  <label htmlFor="confirmPassword" style={labelStyle}>Confirmar Nueva Contraseña</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={inputStyle}
                    required
                  />
                  {errorConfirm && <p style={fieldErrorStyle}>{errorConfirm}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitDisabled || loading}
                style={{
                  width: "100%",
                  maxWidth: "358px",
                  height: "50px",
                  backgroundColor: submitDisabled ? "#c7c7c7" : "#CD1719",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "18px",
                  cursor: submitDisabled ? "not-allowed" : loading ? "wait" : "pointer",
                  marginBottom: "20px",
                }}
              >
                {loading ? "Procesando..." : "Cambiar Contraseña"}
              </button>
            </>
          )}
        </form>

        {error && <p style={{ color: "red", fontSize: "14px", marginTop: "10px" }}>{error}</p>}
      </div>
    </div>
  );
};

export default RecuperarContrasena;

