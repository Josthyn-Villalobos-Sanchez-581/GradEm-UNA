import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";

interface Props {
    correoInicial: string;
    onCorreoVerificado: (correo: string) => void;
}

const CorreoVerificacion: React.FC<Props> = ({ correoInicial, onCorreoVerificado }) => {
    const [correo, setCorreo] = useState<string>(correoInicial);
    const [correoValido, setCorreoValido] = useState<boolean>(true);
    const [correoEditado, setCorreoEditado] = useState<boolean>(false);

    const [errorCorreo, setErrorCorreo] = useState<string>("");

    const [codigo, setCodigo] = useState<string>("");

    const [codigoEnviado, setCodigoEnviado] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [bloqueado, setBloqueado] = useState<boolean>(false);
    const [bloqueoTime, setBloqueoTime] = useState<number>(0);
    const [reenviarCount, setReenviarCount] = useState<number>(0);

    const modal = useModal();

    /* =====================================================
        VALIDACIÓN DE CORREO (sin restricciones de dominios)
    ====================================================== */
    const validarCorreoFormato = (value: string) => {
        const correoStr = value.trim();

        if (!correoStr) return "El correo es obligatorio.";
        if (correoStr.length > 100) return "Máximo 100 caracteres.";
        if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/i.test(correoStr))
            return "Formato de correo inválido.";

        return "";
    };

    /* =====================================================
        (1) DEBOUNCE PARA VALIDAR CORREO EN BACKEND
    ====================================================== */
    useEffect(() => {
        if (correo === correoInicial) {
            setCorreoEditado(false);
            setCorreoValido(true);
            setErrorCorreo("");
            return;
        }

        setCorreoEditado(true);

        const timer = setTimeout(async () => {
            const errorFormato = validarCorreoFormato(correo);

            if (errorFormato) {
                setCorreoValido(false);
                setErrorCorreo(errorFormato);
                return;
            }

            const resp = await axios.post("/perfil/verificar-correo", { correo });

            if (resp.data.existe) {
                setCorreoValido(false);
                setErrorCorreo("Este correo ya está registrado en el sistema.");
            } else {
                setCorreoValido(true);
                setErrorCorreo("");
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [correo]);

    /* =====================================================
        (2) TIMERS
    ====================================================== */
    useEffect(() => {
        if (codigoEnviado && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [codigoEnviado, timeLeft]);

    useEffect(() => {
        if (bloqueado && bloqueoTime > 0) {
            const timer = setTimeout(() => setBloqueoTime(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else if (bloqueado && bloqueoTime === 0) {
            setBloqueado(false);
            setReenviarCount(0);
        }
    }, [bloqueado, bloqueoTime]);

    /* =====================================================
        (3) ENVIAR CÓDIGO
    ====================================================== */
    const handleEnviarCodigo = async () => {
        if (bloqueado) {
            return modal.alerta({
                titulo: "Bloqueado",
                mensaje: `Debe esperar ${bloqueoTime}s antes de reintentar.`,
            });
        }

        const errorFormato = validarCorreoFormato(correo);
        if (errorFormato) {
            return modal.alerta({
                titulo: "Correo inválido",
                mensaje: errorFormato,
            });
        }

        if (!correoValido) {
            return modal.alerta({
                titulo: "Correo no válido",
                mensaje: errorCorreo,
            });
        }

        setCodigo("");

        if (reenviarCount >= 3) {
            setBloqueado(true);
            setBloqueoTime(300);
            return modal.alerta({
                titulo: "Límite alcanzado",
                mensaje: "Espere 5 minutos para volver a enviar el código.",
            });
        }

        const resp = await axios.post("/perfil/enviar-codigo-correo", { correo });

        setCodigoEnviado(true);
        setTimeLeft(300);
        setReenviarCount(r => r + 1);

        modal.alerta({
            titulo: "Código enviado",
            mensaje: resp.data.message,
        });
    };

    /* =====================================================
        (4) VALIDAR CÓDIGO
    ====================================================== */
    const handleValidarCodigo = async () => {
        try {
            const resp = await axios.post("/perfil/validar-codigo-correo", { codigo });

            modal.alerta({
                titulo: "Éxito",
                mensaje: "Correo verificado correctamente.",
            });

            onCorreoVerificado(resp.data.correoVerificado);
        } catch (e: any) {
            modal.alerta({
                titulo: "Error",
                mensaje: e.response?.data?.error || "Código incorrecto.",
            });
        }
    };

    /* =====================================================
        RENDER
    ====================================================== */
    return (
        <div className="flex flex-col gap-4 text-black">

            {/* CAMPO CORREO + TOOLTIP */}
            <div className="flex items-center gap-3">
                <label className="font-bold text-lg">Correo electrónico</label>

                <div className="relative group cursor-pointer">
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#D1D1D1] text-black text-sm font-bold shadow">
                        ?
                    </div>

                    <div className="absolute left-8 top-0 hidden group-hover:block bg-gray-900 text-white text-base rounded px-4 py-3 shadow-xl w-72 z-50">
                        Para actualizar su correo electrónico, primero debe verificarlo mediante un código de confirmación y luego guardar los cambios realizados.
                    </div>
                </div>
            </div>

            <input
                type="email"
                value={correo}
                onChange={e => setCorreo(e.target.value)} 
                maxLength={100}
                className="border p-2 rounded text-black"
            />

            {!correoValido && correoEditado && (
                <p className="text-red-600 text-sm">{errorCorreo}</p>
            )}

            {/* BOTÓN ENVIAR CÓDIGO */}
            {correoEditado && correoValido && !codigoEnviado && (
                <Button
                    type="button"
                    variant="destructive"
                    className="w-52"
                    onClick={handleEnviarCodigo}
                >
                    Enviar código
                </Button>
            )}

            {/* BLOQUE DE VERIFICACIÓN */}
            {codigoEnviado && (
                <div className="flex flex-col gap-2">

                    {timeLeft > 0 ? (
                        <p className="text-black">
                            Código válido por: {Math.floor(timeLeft / 60)}:
                            {("0" + (timeLeft % 60)).slice(-2)}
                        </p>
                    ) : (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleEnviarCodigo}
                        >
                            Reenviar código
                        </Button>
                    )}

                    <input
                        type="text"
                        placeholder="Código"
                        value={codigo}
                        onChange={e => setCodigo(e.target.value)}
                        className="border p-2 rounded text-black"
                    />

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleValidarCodigo}
                    >
                        Validar código
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CorreoVerificacion;
