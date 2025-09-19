import React, { useState, FormEvent } from "react";
import axios from "axios";
import { router } from "@inertiajs/react"; // 👈 Inertia router
import logoUNA from "../assets/logoUNA.png";

// Estilos personalizados de Tailwind
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

const Registro: React.FC = () => {
    const [tipoCuenta, setTipoCuenta] = useState<string>("estudiante");
    const [correo, setCorreo] = useState<string>("");
    const [codigo, setCodigo] = useState<string>("");
    const [codigoEnviado, setCodigoEnviado] = useState<boolean>(false);
    const [codigoValidado, setCodigoValidado] = useState<boolean>(false);

    // Datos del formulario
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [nombreCompleto, setNombreCompleto] = useState<string>("");
    const [anoGraduacion, setAnoGraduacion] = useState<string>("");
    const [empresaActual, setEmpresaActual] = useState<string>("");
    const [numeroIdentificacion, setNumeroIdentificacion] = useState<string>("");
    const [telefono, setTelefono] = useState<string>("");
    const [fechaNacimiento, setFechaNacimiento] = useState<string>("");
    const [genero, setGenero] = useState<string>("");
    const [estadoEmpleo, setEstadoEmpleo] = useState<string>("");
    const [estadoEstudios, setEstadoEstudios] = useState<string>("");

    const handleEnviarCodigo = async () => {
        try {
            await axios.post("/registro/enviar-codigo", { correo });
            setCodigoEnviado(true);
            alert("Código enviado al correo");
        } catch (error: any) {
            alert(error.response?.data?.message || "Error al enviar el código");
        }
    };

    const handleValidarCodigo = async () => {
        try {
            await axios.post("/registro/validar-codigo", { correo, codigo });
            setCodigoValidado(true);
            alert("Correo verificado correctamente");
        } catch (error: any) {
            alert(error.response?.data?.message || "Código incorrecto o expirado");
        }
    };

    const handleRegistro = async (e: FormEvent) => {
        e.preventDefault();
        if (!codigoValidado) {
            alert("Primero debes validar tu correo");
            return;
        }

        try {
            const userData = {
                nombre_completo: nombreCompleto,
                correo,
                password,
                password_confirmation: confirmPassword,
                tipoCuenta,
                identificacion: numeroIdentificacion,
                telefono,
                fecha_nacimiento: fechaNacimiento,
                genero,
                estado_empleo: estadoEmpleo,
                estado_estudios: estadoEstudios,
                ...(tipoCuenta === "egresado"
                    ? { ano_graduacion: anoGraduacion, empresa_actual: empresaActual }
                    : {}),
            };

            await axios.post("/registro", userData);
            alert("Registro exitoso");
        } catch (error: any) {
            alert(error.response?.data?.message || "Error en el registro");
        }
    };

    return (
        <>
            <style>{tailwindStyles}</style>
            <div className="min-h-screen flex flex-col bg-white font-open-sans">
                {/* Header */}
                <header className="bg-white shadow-md w-full py-4 px-8">
                    <a href="https://www.una.ac.cr" target="_blank" rel="noopener noreferrer">
                        <img alt="Logo UNA" className="h-16" src={logoUNA} />
                    </a>
                </header>

                {/* Main */}
                <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-lg border border-una-gray">
                        <div>
                            <h1 className="text-center text-4xl font-bold text-una-red font-open-sans">
                                Crear Cuenta
                            </h1>
                            <p className="mt-4 text-center text-lg text-gray-800 font-open-sans">
                                Complete la información a continuación para crear su cuenta.
                            </p>
                        </div>

                        {/* Selección de tipo de cuenta */}
                        <div className="flex justify-center space-x-6 mb-6">
                            {["estudiante", "egresado", "empresa"].map((tipo) => (
                                <label key={tipo} className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-una-red"
                                        value={tipo}
                                        checked={tipoCuenta === tipo}
                                        onChange={(e) => setTipoCuenta(e.target.value)}
                                    />
                                    <span className="ml-2 font-open-sans text-black capitalize">{tipo}</span>
                                </label>
                            ))}
                        </div>

                        {/* Formulario */}
                        <form className="mt-8 space-y-6" onSubmit={handleRegistro}>
                            {/* Email + Código */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-black font-open-sans">
                                    Correo electrónico institucional
                                </label>
                                <div className="mt-1 flex gap-2">
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)}
                                        className="appearance-none rounded-md w-full px-3 py-2 border border-una-gray text-gray-900 focus:ring-una-red focus:border-una-red sm:text-sm"
                                        placeholder="ejemplo@est.una.ac.cr"
                                        disabled={codigoValidado}
                                    />
                                    {!codigoEnviado && (
                                        <button
                                            type="button"
                                            onClick={handleEnviarCodigo}
                                            className="py-2 px-4 rounded-md text-white bg-una-red hover:bg-red-800 font-open-sans"
                                        >
                                            Enviar código
                                        </button>
                                    )}
                                </div>
                            </div>

                            {codigoEnviado && !codigoValidado && (
                                <div>
                                    <label htmlFor="code" className="block text-sm font-bold text-black font-open-sans">
                                        Código de Verificación
                                    </label>
                                    <div className="mt-1 flex gap-2">
                                        <input
                                            id="code"
                                            type="text"
                                            required
                                            value={codigo}
                                            onChange={(e) => setCodigo(e.target.value)}
                                            className="appearance-none rounded-md w-full px-3 py-2 border border-una-gray text-gray-900 focus:ring-una-blue focus:border-una-blue sm:text-sm"
                                            placeholder="Ingrese el código"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleValidarCodigo}
                                            className="py-2 px-4 rounded-md text-white bg-una-blue hover:bg-blue-800 font-open-sans"
                                        >
                                            Validar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Formulario Estudiante/Egresado con el formato original */}
                            {codigoValidado && tipoCuenta !== "empresa" && (
                                <div className="rounded-md -space-y-px mt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Campos normales */}
                                        {/* ... aquí van exactamente los que ya tenías en tu versión original ... */}
                                        {/* 👇 Te los copié igual al snippet que mandaste */}
                                        <div>
                                            <label htmlFor="nombreCompleto" className="block text-sm font-bold text-black font-open-sans">
                                                Nombre completo
                                            </label>
                                            <input
                                                id="nombreCompleto"
                                                type="text"
                                                required
                                                value={nombreCompleto}
                                                onChange={(e) => setNombreCompleto(e.target.value)}
                                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                                placeholder="Ej: Juan Pérez González"
                                            />
                                        </div>
                                        <div> <label htmlFor="numeroIdentificacion" className="block text-sm font-bold text-black font-open-sans"> Número de identificación </label> <input id="numeroIdentificacion" type="text" required value={numeroIdentificacion} onChange={(e) => setNumeroIdentificacion(e.target.value)} className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm" placeholder="Ej: 1-1234-5678" /> </div> <div> <label htmlFor="telefono" className="block text-sm font-bold text-black font-open-sans"> Teléfono de contacto </label> <input id="telefono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm" placeholder="Ej: 8888-8888" /> </div> <div> <label htmlFor="fechaNacimiento" className="block text-sm font-bold text-black font-open-sans"> Fecha de nacimiento </label> <input id="fechaNacimiento" type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm" /> </div> <div> <label htmlFor="genero" className="block text-sm font-bold text-black font-open-sans"> Género </label> <select id="genero" value={genero} onChange={(e) => setGenero(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-una-gray rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm" > <option value="">Seleccione...</option> <option value="femenino">Femenino</option> <option value="masculino">Masculino</option> <option value="otro">Otro</option> </select> </div> <div> <label htmlFor="estadoEmpleo" className="block text-sm font-bold text-black font-open-sans"> Estado de empleo </label> <select id="estadoEmpleo" value={estadoEmpleo} onChange={(e) => setEstadoEmpleo(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-una-gray rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm" > <option value="">Seleccione...</option> <option value="empleado">Empleado</option> <option value="desempleado">Desempleado</option> </select> </div> <div> <label htmlFor="estadoEstudios" className="block text-sm font-bold text-black font-open-sans"> Estado de estudios </label> <select id="estadoEstudios" value={estadoEstudios} onChange={(e) => setEstadoEstudios(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-una-gray rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm" > <option value="">Seleccione...</option> <option value="activo">Activo</option> <option value="pausado">Pausado</option> <option value="finalizado">Finalizado</option> </select> </div> <div className="md:col-span-2"> </div> {tipoCuenta === "egresado" && ( <> <div> <label htmlFor="anoGraduacion" className="block text-sm font-bold text-black font-open-sans"> Año de graduación </label> <input id="anoGraduacion" type="text" value={anoGraduacion} onChange={(e) => setAnoGraduacion(e.target.value)} className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm" placeholder="Año de graduación" /> </div> <div> <label htmlFor="empresaActual" className="block text-sm font-bold text-black font-open-sans"> Empresa actual </label> <input id="empresaActual" type="text" value={empresaActual} onChange={(e) => setEmpresaActual(e.target.value)} className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm" placeholder="Empresa actual" /> </div> </> )} <div> <label htmlFor="password" className="block text-sm font-bold text-black font-open-sans"> Contraseña </label> <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm" placeholder="Contraseña" /> </div> <div> <label htmlFor="confirmPassword" className="block text-sm font-bold text-black font-open-sans"> Confirmar contraseña </label> <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm" placeholder="Confirmar contraseña" /> </div>
                                    </div>
                                    <div className="mt-6">
                                        <button
                                            type="submit"
                                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-bold rounded-md text-white bg-una-red hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-una-red font-open-sans"
                                        >
                                            Registrarse
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Empresa */}
                            {codigoValidado && tipoCuenta === "empresa" && (
                                <div className="mt-6 text-center text-lg font-bold text-una-blue">
                                    ¡Correo verificado!
                                    <br />
                                    <button
                                        type="button"
                                        onClick={() => router.get("/registro-empresa")}
                                        className="text-una-red hover:underline"
                                    >
                                        Continuar al formulario de registro de empresa
                                    </button>
                                </div>
                            )}

                            {/* Login link */}
                            <div className="text-center">
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
                        </form>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-una-blue text-white text-center py-4 text-sm font-open-sans">
                    © 2024 Universidad Nacional de Costa Rica. Todos los derechos reservados.
                </footer>
            </div>
        </>
    );
};

export default Registro;
