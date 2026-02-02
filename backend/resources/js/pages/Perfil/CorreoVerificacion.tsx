import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";

interface Props {
    correoInicial: string;
    onCorreoVerificado: (correo: string) => void;
}

const CorreoVerificacion: React.FC<Props> = ({ correoInicial, onCorreoVerificado }) => {
    const modal = useModal();

    /* ============================
       ESTADOS
    ============================ */
    const [correo, setCorreo] = useState<string>(correoInicial);
    const [correoEditado, setCorreoEditado] = useState<boolean>(false);
    const [correoValido, setCorreoValido] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [correoVerificando, setCorreoVerificando] = useState<boolean>(false);


    const [errorCorreo, setErrorCorreo] = useState<string>("");

    const [codigo, setCodigo] = useState<string>("");
    const [codigoEnviado, setCodigoEnviado] = useState<boolean>(false);
    const [codigoVerificado, setCodigoVerificado] = useState<boolean>(false);

    const [timeLeft, setTimeLeft] = useState<number>(0);

    const [delayCambioCorreo, setDelayCambioCorreo] = useState<number>(0); // 5 seg tras cambiar correo
    const [codigoFueEnviadoAntes, setCodigoFueEnviadoAntes] = useState<boolean>(false);


    const [bloqueado, setBloqueado] = useState<boolean>(false);
    const [bloqueoTime, setBloqueoTime] = useState<number>(0);

    const [reenviarCount, setReenviarCount] = useState<number>(0);

    /* ============================
       VALIDAR FORMATO
    ============================ */
    const validarCorreoFormato = (value: string) => {
        const correoStr = value.trim();

        if (!correoStr) return "El correo es obligatorio.";
        if (correoStr.length > 100) return "Máximo 100 caracteres.";
        if (!/^[\w.%+-]+@([\w-]+\.)+[A-Za-z]{2,}$/i.test(correoStr))
            return "Formato de correo inválido.";

        return "";
    };

    /* ============================
       VALIDACIÓN BACKEND (DEBOUNCE)
    ============================ */
    useEffect(() => {
        if (correo === correoInicial) {
            setCorreoEditado(false);
            setCorreoValido(true);
            setErrorCorreo("");
            setCodigoEnviado(false);
            setCodigoVerificado(false);
            setCorreoVerificando(false);
            return;
        }

        setCorreoEditado(true);
        setCodigoEnviado(false);
        setCodigoVerificado(false);

        // Ahora SIEMPRE esperar 5 segundos
        setDelayCambioCorreo(5);

        setCorreoVerificando(true);

        const timer = setTimeout(async () => {
            const err = validarCorreoFormato(correo);

            if (err) {
                setCorreoValido(false);
                setErrorCorreo(err);
                setCorreoVerificando(false);
                return;
            }

            const resp = await axios.post("/perfil/verificar-correo", { correo });

            if (resp.data.existe) {
                setCorreoValido(false);
                setErrorCorreo("Este correo ya está registrado.");
            } else {
                setCorreoValido(true);
                setErrorCorreo("");
            }

            setCorreoVerificando(false);

        }, 600);

        return () => clearTimeout(timer);

    }, [correo]);




    /* ============================
       TIMERS
    ============================ */
    useEffect(() => {
        if (codigoEnviado && timeLeft > 0) {
            const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [codigoEnviado, timeLeft]);

    useEffect(() => {
        if (delayCambioCorreo > 0) {
            const t = setTimeout(() => setDelayCambioCorreo(s => s - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [delayCambioCorreo]);

    useEffect(() => {
        if (bloqueado && bloqueoTime > 0) {
            const t = setTimeout(() => setBloqueoTime(s => s - 1), 1000);
            return () => clearTimeout(t);
        } else if (bloqueado && bloqueoTime === 0) {
            setBloqueado(false);
            setReenviarCount(0);
        }
    }, [bloqueado, bloqueoTime]);


    /* ============================
       ENVIAR CÓDIGO
    ============================ */
    const handleEnviarCodigo = async () => {
        const MAX_REINTENTOS = 3; // Permitir 3 intentos fallidos antes de bloquear por 5 minutos

        // 1. Verificar bloqueo por límite de reintentos
        if (bloqueado) {
            await modal.alerta({
                titulo: "Bloqueo de seguridad",
                mensaje: `Ha excedido el límite de reintentos. Debe esperar ${Math.ceil(bloqueoTime / 60)} minutos para volver a intentarlo.`
            });
            return;
        }

        // *** Guard Clause for Race Condition ***
        if (loading || !correoValido || correoVerificando || delayCambioCorreo > 0 || errorCorreo) {
            console.warn("Intento de envío bloqueado por estado inválido.");

            // Si el correo es inválido, mostramos el error de forma proactiva
            if (!correoValido && errorCorreo) {
                await modal.alerta({
                    titulo: "Correo inválido o duplicado",
                    mensaje: errorCorreo
                });
            }
            return;
        }

        setLoading(true);

        try {
            const resp = await axios.post("/perfil/enviar-codigo-correo", { correo });

            setCodigo("");
            setCodigoEnviado(true);
            setTimeLeft(300);

            // Si el envío fue exitoso, reseteamos el contador de fallos
            setReenviarCount(0);
            setCodigoFueEnviadoAntes(true);

            // Resetear el delay tras el envío exitoso
            setDelayCambioCorreo(0);

            await modal.alerta({
                titulo: "Código enviado",
                mensaje: resp.data.message || "Se ha enviado el código a su correo electrónico."
            });

        } catch (err: any) {

            // 2. Aumentar el contador de fallos y aplicar bloqueo si es necesario
            const newCount = reenviarCount + 1;
            setReenviarCount(newCount);

            if (newCount >= MAX_REINTENTOS) {
                setBloqueado(true);
                setBloqueoTime(300); // Bloqueo de 5 minutos
            }

            // *** Extracción de error del JSON del backend (solicitado por el usuario) ***
            // Buscamos 'error' o 'message' en la respuesta del backend
            const backendError = err.response?.data?.error || err.response?.data?.message;
            const errorMessage = backendError || "Error desconocido al intentar enviar el código.";

            await modal.alerta({
                titulo: "No se puede enviar",
                mensaje: errorMessage
            });

            // Si el error del backend fue duplicación, actualizamos el estado para deshabilitar el botón
            // En un caso real, el backend debería devolver un código 409 o un campo 'existe: true' con el error.
            if (errorMessage.toLowerCase().includes("duplicado") || errorMessage.toLowerCase().includes("registrado")) {
                setCorreoValido(false);
                setErrorCorreo(errorMessage);
            }

        } finally {
            setLoading(false);
        }
    };



    /* ============================
       VALIDAR CÓDIGO
    ============================ */
    const handleValidarCodigo = async () => {
        if (isSendButtonDisabled) return;        // evita doble submit
        setLoading(true);

        try {
            const resp = await axios.post("/perfil/validar-codigo-correo", { codigo });

            setCodigoVerificado(true);
            setCodigoEnviado(false);

            await modal.alerta({
                titulo: "Éxito",
                mensaje: "Correo verificado correctamente. Recuerde guardar los cambios.",
            });

            onCorreoVerificado(resp.data.correoVerificado);
        } catch (e: any) {
            await modal.alerta({
                titulo: "Error",
                mensaje: e.response?.data?.error || "Código incorrecto.",
            });
        } finally {
            setLoading(false);
        }
    };

    const isSendButtonDisabled =
        loading ||
        bloqueado || // Deshabilitar si está bloqueado por demasiados reintentos fallidos
        delayCambioCorreo > 0 ||
        correoVerificando || // SIEMPRE deshabilitar si la verificación asíncrona está corriendo
        !correoValido;


    /* ============================
       UI
    ============================ */
    return (
        <div className="flex flex-col gap-4 text-black">

            {/* TITULO + AYUDA */}
            <div className="flex items-center gap-3">
                <label className="font-bold text-lg">Correo electrónico</label>

                <div className="relative group cursor-pointer">
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-300 text-black font-bold shadow">
                        ?
                    </div>

                    <div className="absolute left-9 top-0 hidden group-hover:block bg-gray-900 text-white text-sm rounded px-3 py-2 shadow-xl w-64 z-50">
                        Para actualizar su correo, primero debe verificarlo mediante un código de confirmación y luego guardar los cambios.
                    </div>
                </div>
            </div>

            {/* CAMPO CORREO */}
            <input
                type="email"
                value={correo}
                readOnly={codigoVerificado}
                onChange={(e) => setCorreo(e.target.value)}
                maxLength={100}
                className="border p-2 rounded text-black shadow-sm"
            />

            {!correoValido && correoEditado && (
                <p className="text-red-600 text-sm">{errorCorreo}</p>
            )}

            {/* MENSAJE VERIFICADO */}
            {codigoVerificado && (
                <p className="text-green-700 font-semibold text-sm animate-fadeIn">
                    ✓ Correo verificado. No olvide guardar los cambios.
                </p>
            )}

            {/* BOTONES DE ENVÍO */}
            {correoEditado && correoValido && !codigoVerificado && (
                <div className="flex items-center gap-3">

                    {/* Enviar Código */}
                    {!codigoEnviado && (
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isSendButtonDisabled}
                            onClick={handleEnviarCodigo}
                        >
                            {loading ? "Procesando..." :
                                delayCambioCorreo > 0 ? `Espere ${delayCambioCorreo}s` : "Enviar código"}
                        </Button>
                    )}

                    {/* Reenviar solo cuando expira */}
                    {codigoEnviado && timeLeft <= 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={loading}
                            onClick={handleEnviarCodigo}
                        >
                            {loading ? "Procesando..." : "Reenviar código"}
                        </Button>
                    )}
                </div>
            )}

            {/* BLOQUE DE CÓDIGO */}
            {codigoEnviado && timeLeft > 0 && (
                <div className="flex flex-col gap-2 animate-fadeIn">

                    <p className="text-black text-sm">
                        Código válido por: {Math.floor(timeLeft / 60)}:
                        {("0" + (timeLeft % 60)).slice(-2)}
                    </p>

                    <input
                        type="text"
                        placeholder="Código"
                        value={codigo}
                        maxLength={6}
                        onChange={(e) => setCodigo(e.target.value)}
                        className="border p-2 rounded text-black"
                    />

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleValidarCodigo}
                        disabled={isSendButtonDisabled || codigoVerificado || loading}
                    >
                        {loading ? "Validando..." : "Validar código"}
                    </Button>
                </div>
            )}

            {/* BLOQUEO DE 5 MIN */}
            {bloqueado && (
                <p className="text-red-600 text-sm font-semibold animate-pulse">
                    Ha alcanzado el límite de reenvíos. Espere {Math.floor(bloqueoTime / 60)}:
                    {("0" + (bloqueoTime % 60)).slice(-2)} para intentarlo nuevamente.
                </p>
            )}
        </div>
    );
};

export default CorreoVerificacion;
