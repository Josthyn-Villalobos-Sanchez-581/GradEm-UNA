import React, { useEffect, useRef, useState } from "react";
import { useForm, router } from "@inertiajs/react";
import unaLogo from "../assets/logoUNA.png";
import grademLogo from "../assets/GradEm.png";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";


const Login: React.FC = () => {
  const [error, setError] = useState<string>("");
  const [mostrarOpcionForzar, setMostrarOpcionForzar] = useState<boolean>(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);
  const [redirect, setRedirect] = useState<string | null>(null);

  const correoInputRef = useRef<HTMLInputElement>(null);
  const contrasenaInputRef = useRef<HTMLInputElement>(null);

  const [mostrarPassword, setMostrarPassword] = useState<boolean>(false);

  const { data, setData, post, processing, errors } = useForm({
    correo: '',
    password: '',
    force: false,
    redirect: '',
  });

  // Lee el parámetro redirect de la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectParam = params.get('redirect');
    if (redirectParam) {
      setRedirect(redirectParam);
      setData('redirect', redirectParam);
    }
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

  const intentarLogin = (forzar: boolean = false) => {
    setError("");
    setMostrarOpcionForzar(false);

    router.post('/login',
      {
        ...data,
        force: forzar
      },
      {

        preserveScroll: true,

        onError: (backendErrors) => {

          setError("");
          setMostrarOpcionForzar(false);
          setCooldownSeconds(null);

          if (backendErrors.force_required) {
            setError(backendErrors.force_required);
            setMostrarOpcionForzar(true);
          }
          else if (backendErrors.lockout) {
            setError(backendErrors.lockout);
            const retryAfter = Number(backendErrors.retry_after) || 60;
            setCooldownSeconds(retryAfter);
          }
          else {
            if (backendErrors.correo) {
              setError(backendErrors.correo);
            }
            else if (backendErrors.password) {
              setError(backendErrors.password);
            }
            else if (backendErrors.message) {
              setError(backendErrors.message);
            }
            else {
              setError("Error al iniciar sesión. Verifique sus credenciales.");
            }
          }

        },

        onSuccess: () => {

          setData((prev) => ({
            ...prev,
            password: ''
          }));

          setError("");
          setMostrarOpcionForzar(false);
          setCooldownSeconds(null);
        }

      }
    );
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
          <div style={{ ...inputWrapperStyle, position: "relative" }}>
            <label htmlFor="correo" style={labelStyle}>
              Correo electrónico
            </label>

            <Mail
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "42px",
                color: "#034991",
              }}
            />

            <input
              id="correo"
              type="email"
              placeholder="Ingrese su correo"
              value={data.correo}
              onChange={(e) => setData('correo', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  contrasenaInputRef.current?.focus();
                }
              }}
              ref={correoInputRef}
              style={{
                ...inputStyle,
                paddingLeft: "40px",
              }}
            />
          </div>
        </div>


        <div style={formGroupStyle}>
          <div style={{ ...inputWrapperStyle, position: "relative" }}>
            <label htmlFor="contrasena" style={labelStyle}>
              Contraseña
            </label>

            <Lock
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "42px",
                color: "#034991",
              }}
            />

            <input
              id="contrasena"
              type={mostrarPassword ? "text" : "password"}
              placeholder="Ingrese su contraseña"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  intentarLogin();
                }
              }}
              ref={contrasenaInputRef}
              style={{
                ...inputStyle,
                paddingLeft: "40px",
                paddingRight: "40px",
              }}
            />

            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "42px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {mostrarPassword ? (
                <EyeOff size={18} color="#034991" />
              ) : (
                <Eye size={18} color="#034991" />
              )}
            </button>
          </div>
        </div>


        {error && <p style={{ color: "red", fontSize: "14px", marginBottom: "15px" }}>{error}</p>}

        {errors.correo && <p style={{ color: "red", fontSize: "14px", marginBottom: "15px" }}>{errors.correo}</p>}
        {errors.password && <p style={{ color: "red", fontSize: "14px", marginBottom: "15px" }}>{errors.password}</p>}

        <Button
          type="button"
          variant="destructive"
          size="default"
          className="w-full max-w-[358px] h-14 mb-5"
          onClick={() => intentarLogin()}
          disabled={processing || estaEnCooldown}
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
            disabled={processing || estaEnCooldown}
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
              disabled={processing || estaEnCooldown}
            >
              <span onClick={() => router.get("/recuperar")} style={{ cursor: "pointer" }}>
                ¿Olvidó su contraseña?
              </span>
            </Button>
            <Button
              asChild
              variant="link"
              size="default"
              disabled={processing || estaEnCooldown}
            >
              <span
                onClick={() =>
                  router.get(
                    redirect
                      ? "/registro?redirect=" + encodeURIComponent(redirect)
                      : "/registro"
                  )
                }
                style={{ cursor: "pointer" }}
              >
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

