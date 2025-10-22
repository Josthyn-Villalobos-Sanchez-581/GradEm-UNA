import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import unaLogo from "../assets/logoUNA.png";
import grademLogo from "../assets/GradEm.png";
import { Button } from "@/components/ui/button";

const Login: React.FC = () => {
  const [correo, setCorreo] = useState<string>("");
  const [contrasena, setContrasena] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [mostrarOpcionForzar, setMostrarOpcionForzar] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);

  const correoInputRef = useRef<HTMLInputElement>(null);
  const contrasenaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    axios.get("/sanctum/csrf-cookie").catch(() => console.warn("No se pudo generar la cookie CSRF"));
  }, []);

  useEffect(() => {
    if (cooldownSeconds === null) {
      return;
    }

    if (cooldownSeconds <= 0) {
      setCooldownSeconds(null);
      setError("");
      return;
    }

    setError(`Cuenta bloqueada por intentos fallidos. Puede intentar de nuevo en ${cooldownSeconds}s.`);

    const timeoutId = window.setTimeout(() => {
      setCooldownSeconds((prev) => {
        if (prev === null) return null;
        const siguiente = prev - 1;
        return siguiente <= 0 ? 0 : siguiente;
      });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [cooldownSeconds]);

  const estaEnCooldown = cooldownSeconds !== null && cooldownSeconds > 0;

  const intentarLogin = async (forzar = false) => {
    if (estaEnCooldown) {
      setError(`Debe esperar ${cooldownSeconds}s antes de volver a intentar iniciar sesión.`);
      return;
    }

    setError("");
    setMostrarOpcionForzar(false);
    setIsSubmitting(true);

    try {
      await axios.get("/sanctum/csrf-cookie");

      const res = await axios.post("/login", { correo, password: contrasena, force: forzar });
      if (res.data.redirect) {
        window.location.href = res.data.redirect;
      }
    } catch (err: any) {
      const respuesta = err.response;
      const userFriendlyMessage = err.userFriendlyMessage ?? respuesta?.data?.message;

      if (respuesta?.status === 423 && respuesta?.data?.requiresForce) {
        setError(userFriendlyMessage || "La cuenta ya tiene una sesión activa.");
        setMostrarOpcionForzar(true);
      } else if (respuesta?.status === 423 && respuesta?.data?.code === "too_many_attempts") {
        const retryAfterRaw = Number(respuesta?.data?.retryAfter);
        const segundos = Number.isFinite(retryAfterRaw) && retryAfterRaw > 0 ? Math.floor(retryAfterRaw) : 60;
        setCooldownSeconds(segundos);
        setError(
          userFriendlyMessage ||
          `Cuenta bloqueada por intentos fallidos. Puede intentar de nuevo en ${segundos}s.`
        );
      } else if (respuesta?.status === 419) {
        setError(
          userFriendlyMessage ||
          "La sesión fue invalidada. Posiblemente otra persona inició sesión con esta cuenta. Recargue la página e intente de nuevo."
        );
      } else {
        const errores = respuesta?.data?.errors;
        if (errores) {
          const primerError = (Object.values(errores)[0] as string[])[0];
          setError(primerError);
        } else {
          setError(respuesta?.data?.message || "Error al iniciar sesión.");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
    boxSizing: "border-box",
  };

  const logoStyle: React.CSSProperties = {
    width: "40%",
    maxWidth: "180px",
    height: "auto",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={logosContainerStyle}>
          <img src={grademLogo} alt="Logo GradEm" style={logoStyle} />
          <img src={unaLogo} alt="Logo UNA" style={logoStyle} />
        </div>

        <h1
          style={{
            fontFamily: "'Goudy Old Style', serif",
            fontSize: "clamp(20px, 4vw, 36px)",
            color: "#000000",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          Iniciar sesión
        </h1>

        <div style={formGroupStyle}>
          <div style={inputWrapperStyle}>
            <label htmlFor="correo" style={labelStyle}>
              Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              placeholder="Ingrese su correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  contrasenaInputRef.current?.focus();
                }
              }}
              ref={correoInputRef}
              style={inputStyle}
            />
          </div>
        </div>

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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  intentarLogin();
                }
              }}
              ref={contrasenaInputRef}
              style={inputStyle}
            />
          </div>
        </div>

        {error && <p style={{ color: "red", fontSize: "14px", marginBottom: "15px" }}>{error}</p>}

        <Button
          type="button"
          variant="destructive"
          size="default"
          className="w-full max-w-[358px] h-14 mb-5"
          onClick={() => intentarLogin()}
          disabled={isSubmitting || estaEnCooldown}
        >
          Iniciar sesión
        </Button>

        {mostrarOpcionForzar && (
          <Button
            type="button"
            variant="secondary"
            size="default"
            className="w-full max-w-[358px] h-14 mb-5"
            onClick={() => intentarLogin(true)}
            disabled={isSubmitting || estaEnCooldown}
          >
            Cerrar otras sesiones e ingresar
          </Button>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            fontSize: "16px",
            textAlign: "center",
          }}
        >
          <div className="flex flex-col gap-2 text-center text-base">
            <Button
              asChild
              variant="link"
              size="default"
              disabled={isSubmitting || estaEnCooldown}
            >
              <span onClick={() => router.get("/recuperar")} style={{ cursor: "pointer" }}>
                ¿Olvidó su contraseña?
              </span>
            </Button>
            <Button
              asChild
              variant="link"
              size="default"
              disabled={isSubmitting || estaEnCooldown}
            >
              <span onClick={() => router.get("/registro")} style={{ cursor: "pointer" }}>
                Crear cuenta
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

