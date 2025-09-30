import React, { useState, FormEvent, useEffect, useMemo} from "react";
import axios from "axios";
import { router } from "@inertiajs/react"; // 👈 Inertia router
import logoUNA from "../assets/logoUNA.png";
import grademLogo from "../assets/GradEm.png";
import { useModal } from "../hooks/useModal";

// Aquí agregamos los estilos personalizados de Tailwind
const tailwindStyles = `
    .font-open-sans { font-family: 'Open Sans', sans-serif; }
    .text-una-red { color: #CD1719; }
    .bg-una-red { background-color: #CD1719; }
    .border-una-red { border-color: #CD1719; }
    .text-una-blue { color: #034991; }
    .bg-una-blue { background-color: #034991; }
    .text-una-gray { color: #A7A7A9; }
    .bg-una-gray { background-color: #A7A7A9; }
    .border-una-gray { border-color: #A7A7A9; }
    .text-black { color: #000000; }
    .text-una-dark-gray { color: #4B5563; }
`;

// Estilos para los contenedores de logos
const logosContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
  marginBottom: "20px",
};

const logoStyle: React.CSSProperties = {
  height: "60px",
  objectFit: "contain",
};

interface RegistroEmpresaProps {
    correo: string;
}

const RegistroEmpresa: React.FC<RegistroEmpresaProps> = ({ correo: propCorreo }) => {
    // Inicializamos el estado del correo con la prop que se recibe
    const [correo, setCorreo] = useState<string>("");
    const [nombreEmpresa, setNombreEmpresa] = useState<string>("");
    const [telefono, setTelefono] = useState<string>("");
    const [personaContacto, setPersonaContacto] = useState<string>("");
    const [identificacion, setIdentificacion] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");

    // Validaciones en tiempo real
    function validarNombreEmpresa(valor: string): string | undefined {
        const v = (valor || '').trim();
        if (!v) return 'El nombre de la empresa es obligatorio.';
        if (v.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
        if (v.length > 100) return 'El nombre no puede superar los 100 caracteres.';
        if (!/^[\p{L}\s]+$/u.test(v)) return 'El nombre solo puede contener letras y espacios.';
        return undefined;
    }
    function validarCorreo(valor: string): string | undefined {
        if (!valor) return 'El correo es obligatorio.';
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(valor)) return 'Debe ingresar un correo válido.';
        return undefined;
    }
    function validarTelefono(valor: string): string | undefined {
        if (!valor) return 'El teléfono es obligatorio.';
        if (!/^[0-9]{8,20}$/.test(valor)) return 'El teléfono debe contener entre 8 y 20 dígitos numéricos.';
        return undefined;
    }
    function validarPersonaContacto(valor: string): string | undefined {
        const v = (valor || '').trim();
        if (!v) return 'Debe ingresar el nombre de la persona de contacto.';
        if (v.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
        if (v.length > 100) return 'El nombre no puede superar los 100 caracteres.';
        if (!/^[\p{L}\s]+$/u.test(v)) return 'El nombre solo puede contener letras y espacios.';
        return undefined;
    }
    function validarIdentificacion(valor: string): string | undefined {
        if (!valor) return 'La identificación es obligatoria.';
        if (valor.length < 8) return 'La identificación debe tener al menos 8 caracteres.';
        if (!/^[0-9]{8,20}$/.test(valor)) return 'La identificación debe contener entre 8 y 20 dígitos numéricos.';
        return undefined;
    }

    // MOD: Regex de contraseña idéntico al backend (8–15, minúscula, mayúscula, número, carácter especial, sin espacios)
        const regexContrasena = useMemo(
            () =>
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%?&])([A-Za-z\d$@$!%?&]|[^ ]){8,15}$/,
            []
        );

    function validarPassword(valor: string): string | undefined {
        if (!valor) return 'Debe ingresar una contraseña.';
        if (valor.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
        if (!/[A-Z]/.test(valor)) return 'Debe contener al menos una letra mayúscula.';
        if (!/[a-z]/.test(valor)) return 'Debe contener al menos una letra minúscula.';
        if (!/\d/.test(valor)) return 'Debe contener al menos un número.';
        if (!regexContrasena.test(valor)) return 'Debe contener al menos un carácter especial.';
        return undefined;
    }
    function validarPasswordConfirm(pass: string, confirm: string): string | undefined {
        if (!confirm) return 'Debe confirmar la contraseña.';
        if (pass !== confirm) return 'Las contraseñas no coinciden.';
        return undefined;
    }

    // Errores en tiempo real
    const errorNombreEmpresa = validarNombreEmpresa(nombreEmpresa);
    const errorCorreo = validarCorreo(correo);
    const errorTelefono = validarTelefono(telefono);
    const errorPersonaContacto = validarPersonaContacto(personaContacto);
    const errorIdentificacion = validarIdentificacion(identificacion);
    const errorPassword = validarPassword(password);
    const errorPasswordConfirm = validarPasswordConfirm(password, passwordConfirmation);

    const [errors, setErrors] = useState<any>({});
    const [successMessage, setSuccessMessage] = useState<string>("");
    
    const modal = useModal(); // MOD: usar el modal

    // Sincronizar el estado interno si la prop 'correo' cambia
    useEffect(() => {
    setCorreo(propCorreo || "");
}, [propCorreo]);

    useEffect(() => {
    // Verifica si el usuario tiene algo en localStorage (o sessionStorage) indicando que ya validó correo
    const correoValidado = sessionStorage.getItem("correo_validado_empresa");

    if (!correoValidado) {
        // 🔹 Si no está validado, redirigir a login
        router.get("/login");
    }
    }, []);

    const handleRegistroEmpresa = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage("");

        // Validación frontend antes de enviar
        if (errorNombreEmpresa || errorCorreo || errorTelefono || errorPersonaContacto || errorIdentificacion || errorPassword || errorPasswordConfirm) {
            setErrors({
                nombre: errorNombreEmpresa ? [errorNombreEmpresa] : undefined,
                correo: errorCorreo ? [errorCorreo] : undefined,
                telefono: errorTelefono ? [errorTelefono] : undefined,
                persona_contacto: errorPersonaContacto ? [errorPersonaContacto] : undefined,
                identificacion: errorIdentificacion ? [errorIdentificacion] : undefined,
                password: errorPassword ? [errorPassword] : undefined,
                password_confirmation: errorPasswordConfirm ? [errorPasswordConfirm] : undefined,
            });
            return;
        }

        try {
            const registroData = {
                nombre: nombreEmpresa,
                correo,
                telefono,
                persona_contacto: personaContacto,
                identificacion,
                password: password,
                password_confirmation: passwordConfirmation,
            };

            const response = await axios.post("/registro-empresa", registroData);

            // Solo mostrar modal si no hubo error
            await modal.alerta({
                titulo: "Éxito",
                mensaje: response.data.message || "Registro de empresa exitoso",
            });

            // 🔹 Limpiar flag de validación
            sessionStorage.removeItem("correo_validado_empresa");

            // 🔹 Redirigir al login
            router.get("/login");

            // 🔹 Limpiar campos
            setNombreEmpresa("");
            setCorreo("");
            setTelefono("");
            setPersonaContacto("");
            setIdentificacion("");
            setPassword("");
            setPasswordConfirmation("");
        } catch (error: any) {
            if (error.response?.status === 422) {
                // Errores de validación
                setErrors(error.response.data.errors);
            } else {
                await modal.alerta({
                    titulo: "Error",
                    mensaje: error.response?.data?.message || "Error en el registro",
                });
            }
        }
    };

    return (
        <>
            <style>{tailwindStyles}</style>
            <div className="min-h-screen flex flex-col bg-white font-open-sans">
                <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="w-full max-w-2xl flex flex-col items-center p-8 rounded-lg"
                        style={{
                        backgroundColor: "#F6F6F6",
                        borderRadius: "10px",
                        padding: "30px 20px",
                        }}>
                            {/* Logos GradEm + UNA */}
                            <div style={logosContainerStyle}>
                            <img src={grademLogo} alt="Logo GradEm" style={logoStyle} />
                            <a href="https://www.una.ac.cr" target="_blank" rel="noopener noreferrer">
                                <img src={logoUNA} alt="Logo UNA" style={logoStyle} />
                            </a>
                            </div>
                        <div>
                            <h1
                                style={{
                                    fontFamily: "'Goudy Old Style', serif",
                                    fontSize: "clamp(20px, 4vw, 36px)", // 🔹 Más pequeño
                                    color: "#000000",
                                    marginBottom: "20px",
                                    textAlign: "center",
                                }}
                            >
                                Registro de Empresa
                            </h1>
                            <p className="mt-4 text-center text-lg text-gray-800 font-open-sans">
                                Complete la información de su empresa para crear la cuenta.
                            </p>
                        </div>
                        <form className="mt-8 space-y-6" onSubmit={handleRegistroEmpresa}>
                            <div className="rounded-md -space-y-px">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="nombre-empresa" className="block text-sm font-bold text-black font-open-sans">
                                            Nombre de la Empresa
                                        </label>
                                        <input
                                            id="nombre-empresa"
                                            name="nombre-empresa"
                                            type="text"
                                            required
                                            value={nombreEmpresa}
                                            onChange={(e) => {
                                                setNombreEmpresa(e.target.value);
                                                setErrors((prev: any) => {
                                                    const err = validarNombreEmpresa(e.target.value);
                                                    if (err) return { ...prev, nombre: [err] };
                                                    const { nombre, ...rest } = prev;
                                                    return rest;
                                                });
                                            }}
                                            className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${(errors as any).nombre ? 'border-red-500' : 'border-una-gray'} placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                            placeholder="Nombre de la Empresa"
                                            aria-invalid={!!(errors as any).nombre}
                                            aria-describedby={(errors as any).nombre ? 'nombre-error' : undefined}
                                        />
                                        {(errors as any).nombre && (
                                            <p id="nombre-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive">{(errors as any).nombre[0]}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="persona-contacto" className="block text-sm font-bold text-black font-open-sans">
                                            Persona de Contacto
                                        </label>
                                        <input
                                            id="persona-contacto"
                                            name="persona-contacto"
                                            type="text"
                                            required
                                            value={personaContacto}
                                            onChange={(e) => {
                                                setPersonaContacto(e.target.value);
                                                setErrors((prev: any) => {
                                                    const err = validarPersonaContacto(e.target.value);
                                                    if (err) return { ...prev, persona_contacto: [err] };
                                                    const { persona_contacto, ...rest } = prev;
                                                    return rest;
                                                });
                                            }}
                                            className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${(errors as any).persona_contacto ? 'border-red-500' : 'border-una-gray'} placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                            placeholder="Nombre del Contacto"
                                            aria-invalid={!!(errors as any).persona_contacto}
                                            aria-describedby={(errors as any).persona_contacto ? 'persona-contacto-error' : undefined}
                                        />
                                        {(errors as any).persona_contacto && (
                                            <p id="persona-contacto-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive">{(errors as any).persona_contacto[0]}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="identificacion" className="block text-sm font-bold text-black font-open-sans">
                                            Identificación del Encargado
                                        </label>
                                        <input
                                            id="identificacion"
                                            name="identificacion"
                                            type="text"
                                            required
                                            value={identificacion}
                                            onChange={(e) => {
                                                setIdentificacion(e.target.value);
                                                setErrors((prev: any) => {
                                                    const err = validarIdentificacion(e.target.value);
                                                    if (err) return { ...prev, identificacion: [err] };
                                                    const { identificacion, ...rest } = prev;
                                                    return rest;
                                                });
                                            }}
                                            className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${(errors as any).identificacion ? 'border-red-500' : 'border-una-gray'} placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                            placeholder="Ej: 12345678"
                                            aria-invalid={!!(errors as any).identificacion}
                                            aria-describedby={(errors as any).identificacion ? 'identificacion-error' : undefined}
                                        />
                                        {(errors as any).identificacion && (
                                            <p id="identificacion-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive">{(errors as any).identificacion[0]}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="telefono" className="block text-sm font-bold text-black font-open-sans">
                                            Teléfono
                                        </label>
                                        <input
                                            id="telefono"
                                            name="telefono"
                                            type="tel"
                                            required
                                            value={telefono}
                                            onChange={(e) => {
                                                setTelefono(e.target.value);
                                                setErrors((prev: any) => {
                                                    const err = validarTelefono(e.target.value);
                                                    if (err) return { ...prev, telefono: [err] };
                                                    const { telefono, ...rest } = prev;
                                                    return rest;
                                                });
                                            }}
                                            className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${(errors as any).telefono ? 'border-red-500' : 'border-una-gray'} placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                            placeholder="Teléfono"
                                            aria-invalid={!!(errors as any).telefono}
                                            aria-describedby={(errors as any).telefono ? 'telefono-error' : undefined}
                                        />
                                        {(errors as any).telefono && (
                                            <p id="telefono-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive">{(errors as any).telefono[0]}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="correo" className="block text-sm font-bold text-black font-open-sans">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            id="correo"
                                            name="correo"
                                            type="email"
                                            required
                                            value={correo}
                                            onChange={(e) => {
                                                setCorreo(e.target.value);
                                                setErrors((prev: any) => {
                                                    const err = validarCorreo(e.target.value);
                                                    if (err) return { ...prev, correo: [err] };
                                                    const { correo, ...rest } = prev;
                                                    return rest;
                                                });
                                            }}
                                            className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${(errors as any).correo ? 'border-red-500' : 'border-una-gray'} placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                            placeholder="ejemplo@empresa.com"
                                            aria-invalid={!!(errors as any).correo}
                                            aria-describedby={(errors as any).correo ? 'correo-error' : undefined}
                                        />
                                        {(errors as any).correo && (
                                            <p id="correo-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive">{(errors as any).correo[0]}</p>
                                        )}
                                    </div>
                                    {/* Contraseña y Confirmar Contraseña en la misma fila */}
                                    <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <label htmlFor="password" className="block text-sm font-bold text-black font-open-sans">
                                                Contraseña
                                            </label>
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    setErrors((prev: any) => {
                                                        const err = validarPassword(e.target.value);
                                                        if (err) return { ...prev, password: [err] };
                                                        const { password, ...rest } = prev;
                                                        return rest;
                                                    });
                                                }}
                                                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${(errors as any).password ? 'border-red-500' : 'border-una-gray'} placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                                placeholder="Contraseña"
                                                aria-invalid={!!(errors as any).password}
                                                aria-describedby={(errors as any).password ? 'password-error' : undefined}
                                            />
                                            {(errors as any).password && (
                                                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive">{(errors as any).password[0]}</p>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="password_confirmation" className="block text-sm font-bold text-black font-open-sans">
                                                Confirmar Contraseña
                                            </label>
                                            <input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                required
                                                value={passwordConfirmation}
                                                onChange={(e) => {
                                                    setPasswordConfirmation(e.target.value);
                                                    setErrors((prev: any) => {
                                                        const err = validarPasswordConfirm(password, e.target.value);
                                                        if (err) return { ...prev, password_confirmation: [err] };
                                                        const { password_confirmation, ...rest } = prev;
                                                        return rest;
                                                    });
                                                }}
                                                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${(errors as any).password_confirmation ? 'border-red-500' : 'border-una-gray'} placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                                placeholder="Repite la contraseña"
                                                aria-invalid={!!(errors as any).password_confirmation}
                                                aria-describedby={(errors as any).password_confirmation ? 'password-confirmation-error' : undefined}
                                            />
                                            {(errors as any).password_confirmation && (
                                                <p id="password-confirmation-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive">{(errors as any).password_confirmation[0]}</p>
                                            )}
                                        </div>
                                    </div>
                                    {/* Ayuda de requisitos de contraseña */}
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-gray-500 mt-1">
                                            La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y uno de estos caracteres: $ @ ! % ? &. Sin espacios.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-una-red hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-una-red font-open-sans"
                                        disabled={Boolean(errorNombreEmpresa || errorCorreo || errorTelefono || errorPersonaContacto || errorIdentificacion || errorPassword || errorPasswordConfirm)}
                                    >
                                        Registrar Empresa
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </main>
                {/* Footer */}
            <footer className="bg-white border-t text-center p-4 text-gray-500 text-sm">
                Sistema de Gestión © 2025 - Universidad Nacional
            </footer>
            </div>
        </>
    );
};

export default RegistroEmpresa;
