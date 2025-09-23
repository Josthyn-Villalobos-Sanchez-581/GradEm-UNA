import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import { router } from "@inertiajs/react"; // 👈 Inertia router
import logoUNA from "../assets/logoUNA.png";
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

    const [errors, setErrors] = useState<any>({});
    const [successMessage, setSuccessMessage] = useState<string>("");
    
    const modal = useModal(); // MOD: usar el modal

    // Sincronizar el estado interno si la prop 'correo' cambia
    useEffect(() => {
    setCorreo(propCorreo || "");
}, [propCorreo]);

    const handleRegistroEmpresa = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage("");

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
                            {/* Logo UNA centrado */}
                            <div className="flex justify-center mb-6">
                                <a href="https://www.una.ac.cr" target="_blank" rel="noopener noreferrer">
                                    <img alt="Logo UNA" className="h-20" src={logoUNA} />
                                </a>
                            </div>
                        <div>
                            <h1
                                style={{
                                    fontFamily: "'Goudy Old Style', serif",
                                    fontSize: "clamp(24px, 5vw, 48px)",
                                    color: "#000000",
                                    marginBottom: "30px",
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
                                            onChange={(e) => setNombreEmpresa(e.target.value)}
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                            placeholder="Nombre de la Empresa"
                                        />
                                        {errors.nombre && (
                                            <p className="mt-1 text-sm text-red-600">{errors.nombre[0]}</p>
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
                                            onChange={(e) => setPersonaContacto(e.target.value)}
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                            placeholder="Nombre del Contacto"
                                        />
                                        {errors.persona_contacto && (
                                            <p className="mt-1 text-sm text-red-600">{errors.persona_contacto[0]}</p>
                                        )}
                                    </div>
                                    <div>
                                    <label
                                        htmlFor="identificacion"
                                        className="block text-sm font-bold text-black font-open-sans"
                                    >
                                        Identificación del Encargado
                                    </label>
                                    <input
                                        id="identificacion"
                                        name="identificacion"
                                        type="text"
                                        required
                                        value={identificacion}
                                        onChange={(e) => setIdentificacion(e.target.value)}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                        placeholder="Ej: 1-1234-5678"
                                    />
                                    {errors.identificacion && (
                                            <p className="mt-1 text-sm text-red-600">{errors.identificacion[0]}</p>
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
                                            onChange={(e) => setTelefono(e.target.value)}
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                            placeholder="Teléfono"
                                        />
                                        {errors.telefono && (
                                            <p className="mt-1 text-sm text-red-600">{errors.telefono[0]}</p>
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
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                            placeholder="ejemplo@empresa.com"
                                            onChange={(e) => setCorreo(e.target.value)}
                                        />
                                        {errors.correo && (
                                            <p className="mt-1 text-sm text-red-600">{errors.correo[0]}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-bold text-black font-open-sans">
                                            Contraseña
                                        </label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                            placeholder="Mínimo 8 caracteres"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-sm font-bold text-black font-open-sans">
                                            Confirmar Contraseña
                                        </label>
                                        <input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type="password"
                                            required
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                            placeholder="Repite la contraseña"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-una-red hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-una-red font-open-sans"
                                    >
                                        Registrar Empresa
                                    </button>
                                </div>
                                <div className="text-center mt-6">
                                <p className="text-md text-gray-800 font-open-sans">
                                    ¿Ya tiene una cuenta?
                                    <button
                                        type="button"
                                        onClick={() => router.visit("/login")}
                                        className="font-medium text-una-blue hover:text-blue-700 ml-1"
                                    >
                                        Iniciar sesión
                                    </button>
                                </p>
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
