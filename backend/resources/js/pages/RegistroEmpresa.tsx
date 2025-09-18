import React, { useState, FormEvent } from "react";
import axios from "axios";
import logoUNA from "../assets/logoUNA.png";

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

const RegistroEmpresa: React.FC = () => {
    const [nombreEmpresa, setNombreEmpresa] = useState<string>("");
    const [cedulaJuridica, setCedulaJuridica] = useState<string>("");
    const [telefono, setTelefono] = useState<string>("");
    const [correo, setCorreo] = useState<string>(""); // Asumimos que este campo se llena desde el registro principal
    const [ubicacion, setUbicacion] = useState<string>("");
    const [descripcion, setDescripcion] = useState<string>("");

    const handleRegistroEmpresa = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const registroData = {
                nombre_empresa: nombreEmpresa,
                cedula_juridica: cedulaJuridica,
                telefono,
                correo,
                ubicacion,
                descripcion
            };

            await axios.post("/registro-empresa", registroData);
            alert("Registro de empresa exitoso");
        } catch (error: any) {
            alert(error.response?.data?.message || "Error en el registro");
        }
    };

    return (
        <>
            <style>{tailwindStyles}</style>
            <div className="min-h-screen flex flex-col bg-white font-open-sans">
                <header className="bg-white shadow-md w-full py-4 px-8">
                    <a href="https://www.una.ac.cr" target="_blank" rel="noopener noreferrer">
                        <img alt="Logo UNA" className="h-16" src={logoUNA} />
                    </a>
                </header>
                <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-lg border border-una-gray">
                        <div>
                            <h1 className="text-center text-4xl font-bold text-una-red font-open-sans">
                                Registro de Empresa
                            </h1>
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
                                    </div>
                                    <div>
                                        <label htmlFor="cedula-juridica" className="block text-sm font-bold text-black font-open-sans">
                                            Cédula Jurídica
                                        </label>
                                        <input
                                            id="cedula-juridica"
                                            name="cedula-juridica"
                                            type="text"
                                            required
                                            value={cedulaJuridica}
                                            onChange={(e) => setCedulaJuridica(e.target.value)}
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                            placeholder="Cédula Jurídica"
                                        />
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
                                    </div>
                                    <div className="md:col-span-2">
                                        <label htmlFor="ubicacion" className="block text-sm font-bold text-black font-open-sans">
                                            Ubicación de la empresa
                                        </label>
                                        <input
                                            id="ubicacion"
                                            name="ubicacion"
                                            type="text"
                                            required
                                            value={ubicacion}
                                            onChange={(e) => setUbicacion(e.target.value)}
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                            placeholder="Ubicación de la empresa"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label htmlFor="descripcion" className="block text-sm font-bold text-black font-open-sans">
                                            Descripción de la empresa
                                        </label>
                                        <textarea
                                            id="descripcion"
                                            name="descripcion"
                                            required
                                            value={descripcion}
                                            onChange={(e) => setDescripcion(e.target.value)}
                                            rows={4}
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                            placeholder="Breve descripción de la empresa y sus servicios."
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
                            </div>
                        </form>
                    </div>
                </main>
                <footer className="bg-una-blue text-white text-center py-4">
                    © 2024 Universidad Nacional de Costa Rica. Todos los derechos reservados.
                </footer>
            </div>
        </>
    );
};

export default RegistroEmpresa;