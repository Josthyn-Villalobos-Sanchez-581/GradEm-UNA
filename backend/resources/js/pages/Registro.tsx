import React, { useState, useEffect, FormEvent, useMemo } from "react";
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
    // Campos nuevos
    const [nivelAcademico, setNivelAcademico] = useState<string>("");
    const [anioGraduacion, setAnioGraduacion] = useState<string>("");

    // Ubicación
    const [paises, setPaises] = useState<any[]>([]);
    const [provincias, setProvincias] = useState<any[]>([]);
    const [cantones, setCantones] = useState<any[]>([]);

    const [pais, setPais] = useState<string>("");
    const [provincia, setProvincia] = useState<string>("");
    const [canton, setCanton] = useState<string>("");

    const [universidades, setUniversidades] = useState<any[]>([]);
    const [carreras, setCarreras] = useState<any[]>([]);
    const [universidad, setUniversidad] = useState('');
    const [carrera, setCarrera] = useState('');

    // Datos de empleo (si es empleado)
    const [tiempoConseguirEmpleo, setTiempoConseguirEmpleo] = useState<string>("");
    const [areaLaboral, setAreaLaboral] = useState<string>("");
    const [salarioPromedio, setSalarioPromedio] = useState<string>("");
    const [tipoEmpleo, setTipoEmpleo] = useState<string>("");

    useEffect(() => {
    axios.get("/ubicaciones/paises").then((res) => setPaises(res.data));
    }, []);

    useEffect(() => {
    if (pais) {
        axios.get(`/ubicaciones/provincias/${pais}`).then((res) => setProvincias(res.data));
    } else {
        setProvincias([]);
        setProvincia("");
    }
    }, [pais]);

    useEffect(() => {
    if (provincia) {
        axios.get(`/ubicaciones/cantones/${provincia}`).then((res) => setCantones(res.data));
    } else {
        setCantones([]);
        setCanton("");
    }
    }, [provincia]);


    useEffect(() => {
    fetch("/universidades")
        .then((res) => res.json())
        .then((data) => setUniversidades(data));
    }, []);

    useEffect(() => {
    if (universidad) {
        fetch(`/universidades/${universidad}/carreras`)
        .then((res) => res.json())
        .then((data) => setCarreras(data));
    } else {
        setCarreras([]);
    }
    }, [universidad]);

    // MOD: Regex de contraseña idéntico al backend (8–15, minúscula, mayúscula, número, carácter especial, sin espacios)
    const regexContrasena = useMemo(
        () =>
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%?&])([A-Za-z\d$@$!%?&]|[^ ]){8,15}$/,
        []
    );

    // MOD: Validadores en español
    function validarContrasena(valor: string): string | undefined {
        if (!valor) return "La contraseña es obligatoria.";
        if (valor.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
        if (valor.length > 15) return "La contraseña no puede superar los 15 caracteres.";
        if (!regexContrasena.test(valor))
            return "Debe incluir minúscula, mayúscula, número, un carácter especial ($ @ $ ! % ? &) y no contener espacios.";
        return undefined;
    }

    // MOD: Validación de confirmación
    function validarConfirmacion(pass: string, confirm: string): string | undefined {
        if (!confirm) return "Debe confirmar la contraseña.";
        if (pass !== confirm) return "Las contraseñas no coinciden.";
        return undefined;
    }

    // MOD: Errores calculados en tiempo real
    const errorPassword = useMemo(() => validarContrasena(password), [password]);
    const errorConfirm = useMemo(() => validarConfirmacion(password, confirmPassword), [password, confirmPassword]);

    // MOD: Formulario válido (para deshabilitar submit)
    const formularioValido =
        codigoValidado &&
        !errorPassword &&
        !errorConfirm &&
        password.length > 0 &&
        confirmPassword.length > 0 &&
        nombreCompleto.length > 0 &&
        numeroIdentificacion.length > 0;

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

        // MOD: Cortafuegos de validación en cliente antes de enviar
        if (errorPassword || errorConfirm) {
            alert(errorPassword || errorConfirm);
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
                id_universidad: universidad,
                id_carrera: carrera,
                estado_empleo: estadoEmpleo,
                estado_estudios: estadoEstudios,
                nivel_academico: nivelAcademico,
                anio_graduacion: anioGraduacion ? parseInt(anioGraduacion, 10) : null,
                id_canton: canton || null,
                ...(estadoEmpleo === "empleado"
                    ? {
                        tiempo_conseguir_empleo: tiempoConseguirEmpleo,
                        area_laboral_id: areaLaboral,
                        salario_promedio: salarioPromedio,
                        tipo_empleo: tipoEmpleo,
                    }
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
                        {["estudiante_egresado", "empresa"].map((tipo) => (
                        <label key={tipo} className="inline-flex items-center">
                            <input
                            type="radio"
                            className="form-radio text-una-red"
                            value={tipo}
                            checked={tipoCuenta === tipo}
                            onChange={(e) => setTipoCuenta(e.target.value)}
                            />
                            <span className="ml-2 font-open-sans text-black">
                            {tipo === "estudiante_egresado" ? "Estudiante/Egresado" : "Empresa"}
                            </span>
                        </label>
                        ))}

                        {/* Formulario */}
                        <form className="mt-8 space-y-6" onSubmit={handleRegistro}>
                            {/* Email + Código */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-black font-open-sans">
                                    Correo electrónico
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
                                        {/* Campos normales (sin cambios de tu snippet) */}
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
                                        <div>
                                            <label htmlFor="numeroIdentificacion" className="block text-sm font-bold text-black font-open-sans">
                                                Número de identificación
                                            </label>
                                            <input
                                                id="numeroIdentificacion"
                                                type="text"
                                                required
                                                value={numeroIdentificacion}
                                                onChange={(e) => setNumeroIdentificacion(e.target.value)}
                                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                                placeholder="Ej: 1-1234-5678"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="telefono" className="block text-sm font-bold text-black font-open-sans">
                                                Teléfono de contacto
                                            </label>
                                            <input
                                                id="telefono"
                                                type="tel"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value)}
                                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                                placeholder="Ej: 8888-8888"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="fechaNacimiento" className="block text-sm font-bold text-black font-open-sans">
                                                Fecha de nacimiento
                                            </label>
                                            <input
                                                id="fechaNacimiento"
                                                type="date"
                                                value={fechaNacimiento}
                                                onChange={(e) => setFechaNacimiento(e.target.value)}
                                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="genero" className="block text-sm font-bold text-black font-open-sans">
                                                Género
                                            </label>
                                            <select
                                                id="genero"
                                                value={genero}
                                                onChange={(e) => setGenero(e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-una-gray rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                            >
                                                <option value="">Seleccione...</option>
                                                <option value="femenino">Femenino</option>
                                                <option value="masculino">Masculino</option>
                                                <option value="otro">Otro</option>
                                            </select>
                                        </div>
                                        {/* Ubicación */}
                                        <div>
                                        <label htmlFor="pais" className="block text-sm font-bold text-black font-open-sans">
                                            País
                                        </label>
                                        <select
                                            id="pais"
                                            value={pais}
                                            onChange={(e) => setPais(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-una-gray rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                        >
                                            <option value="">Seleccione...</option>
                                            {paises.map((p) => (
                                            <option key={p.id_pais} value={p.id_pais}>
                                                {p.nombre}
                                            </option>
                                            ))}
                                        </select>
                                        </div>

                                        <div>
                                        <label htmlFor="provincia" className="block text-sm font-bold text-black font-open-sans">
                                            Provincia
                                        </label>
                                        <select
                                            id="provincia"
                                            value={provincia}
                                            onChange={(e) => setProvincia(e.target.value)}
                                            disabled={!pais}
                                            className="mt-1 block w-full px-3 py-2 border border-una-gray rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm disabled:bg-gray-100"
                                        >
                                            <option value="">Seleccione...</option>
                                            {provincias.map((pr) => (
                                            <option key={pr.id_provincia} value={pr.id_provincia}>
                                                {pr.nombre}
                                            </option>
                                            ))}
                                        </select>
                                        </div>

                                        <div>
                                        <label htmlFor="canton" className="block text-sm font-bold text-black font-open-sans">
                                            Cantón
                                        </label>
                                        <select
                                            id="canton"
                                            value={canton}
                                            onChange={(e) => setCanton(e.target.value)}
                                            disabled={!provincia}
                                            className="mt-1 block w-full px-3 py-2 border border-una-gray rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm disabled:bg-gray-100"
                                        >
                                            <option value="">Seleccione...</option>
                                            {cantones.map((c) => (
                                            <option key={c.id_canton} value={c.id_canton}>
                                                {c.nombre}
                                            </option>
                                            ))}
                                        </select>
                                        </div>
                                        {/* Universidad */}
                                        <div>
                                        <label htmlFor="universidad" className="block text-sm font-bold text-black font-open-sans">
                                            Universidad
                                        </label>
                                        <select
                                            id="universidad"
                                            value={universidad}
                                            onChange={(e) => setUniversidad(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-una-gray rounded-md shadow-sm text-una-dark-gray 
                                                    focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                        >
                                            <option value="">Seleccione...</option>
                                            {universidades.map((u) => (
                                            <option key={u.id_universidad} value={u.id_universidad}>
                                                {u.nombre}
                                            </option>
                                            ))}
                                        </select>
                                        </div>

                                        {/* Carrera */}
                                        <div>
                                        <label htmlFor="carrera" className="block text-sm font-bold text-black font-open-sans">
                                            Carrera
                                        </label>
                                        <select
                                            id="carrera"
                                            value={carrera}
                                            onChange={(e) => setCarrera(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-una-gray rounded-md shadow-sm text-una-dark-gray 
                                                    focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                        >
                                            <option value="">Seleccione...</option>
                                            {carreras.map((c) => (
                                            <option key={c.id_carrera} value={c.id_carrera}>
                                                {c.nombre}
                                            </option>
                                            ))}
                                        </select>
                                        </div>
                                        {/* Estado de empleo */}
                                        <div>
                                        <label
                                            htmlFor="estadoEmpleo"
                                            className="block text-sm font-bold text-black font-open-sans"
                                        >
                                            Estado de empleo
                                        </label>
                                        <select
                                            id="estadoEmpleo"
                                            value={estadoEmpleo}
                                            onChange={(e) => setEstadoEmpleo(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-una-gray rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="empleado">Empleado</option>
                                            <option value="desempleado">Desempleado</option>
                                        </select>
                                        </div>

                                        {/* 👇 Campos extra solo si el usuario selecciona "empleado" */}
                                        {estadoEmpleo === "empleado" && (
                                        <>
                                            <div>
                                            <label
                                                htmlFor="tiempoConseguirEmpleo"
                                                className="block text-sm font-bold text-black font-open-sans"
                                            >
                                                Meses para conseguir trabajo
                                            </label>
                                            <input
                                                id="tiempoConseguirEmpleo"
                                                type="number"
                                                value={tiempoConseguirEmpleo}
                                                onChange={(e) => setTiempoConseguirEmpleo(e.target.value)}
                                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                                placeholder="Ej: 6"
                                            />
                                            </div>

                                            <div>
                                            <label
                                                htmlFor="areaLaboral"
                                                className="block text-sm font-bold text-black font-open-sans"
                                            >
                                                Área laboral
                                            </label>
                                            <select
                                                id="areaLaboral"
                                                value={areaLaboral}
                                                onChange={(e) => setAreaLaboral(e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-una-gray rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                            >
                                                <option value="">Seleccione...</option>
                                                <option value="1">Tecnología</option>
                                                <option value="2">Educación</option>
                                                <option value="3">Salud</option>
                                                <option value="4">Industria</option>
                                                <option value="5">Administración</option>
                                                <option value="6">Idiomas</option>
                                                <option value="7">Otra</option>
                                            </select>
                                            </div>

                                            <div>
                                            <label
                                                htmlFor="salarioPromedio"
                                                className="block text-sm font-bold text-black font-open-sans"
                                            >
                                                Salario promedio
                                            </label>
                                            <input
                                                id="salarioPromedio"
                                                type="text"
                                                value={salarioPromedio}
                                                onChange={(e) => setSalarioPromedio(e.target.value)}
                                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                                placeholder="Ej: ₡500,000"
                                            />
                                            </div>

                                            <div>
                                            <label
                                                htmlFor="tipoEmpleo"
                                                className="block text-sm font-bold text-black font-open-sans"
                                            >
                                                Tipo de empleo
                                            </label>
                                            <input
                                                id="tipoEmpleo"
                                                type="text"
                                                value={tipoEmpleo}
                                                onChange={(e) => setTipoEmpleo(e.target.value)}
                                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                                placeholder="Tiempo completo / Medio tiempo"
                                            />
                                            </div>
                                        </>
                                        )}
                                        {/* Estado de estudios */}
                                        <div>
                                        <label
                                            htmlFor="estadoEstudios"
                                            className="block text-sm font-bold text-black font-open-sans"
                                        >
                                            Estado de estudios
                                        </label>
                                        <select
                                            id="estadoEstudios"
                                            value={estadoEstudios}
                                            onChange={(e) => setEstadoEstudios(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-una-gray rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="activo">Activo</option>
                                            <option value="pausado">Pausado</option>
                                            <option value="finalizado">Finalizado</option>
                                        </select>
                                        </div>

                                        {/* 👇 Campos extra si selecciona "finalizado" */}
                                        {estadoEstudios === "finalizado" && (
                                        <>
                                            <div>
                                            <label
                                                htmlFor="nivelAcademico"
                                                className="block text-sm font-bold text-black font-open-sans"
                                            >
                                                Nivel académico
                                            </label>
                                            <select
                                                id="nivelAcademico"
                                                value={nivelAcademico}
                                                onChange={(e) => setNivelAcademico(e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-una-gray rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                            >
                                                <option value="">Seleccione...</option>
                                                <option value="Diplomado">Diplomado</option>
                                                <option value="Bachillerato">Bachillerato</option>
                                                <option value="Licenciatura">Licenciatura</option>
                                                <option value="Maestria">Maestría</option>
                                                <option value="Doctorado">Doctorado</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                            </div>

                                            <div>
                                            <label
                                                htmlFor="anioGraduacion"
                                                className="block text-sm font-bold text-black font-open-sans"
                                            >
                                                Año de graduación
                                            </label>
                                            <input
                                                id="anioGraduacion"
                                                type="number"
                                                value={anioGraduacion}
                                                onChange={(e) => setAnioGraduacion(e.target.value)}
                                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                                placeholder="Ej: 2024"
                                            />
                                            </div>
                                        </>
                                        )}

                                        {/* Año de graduación solo si aplica */}
                                        {["Diplomado", "Licenciatura", "Otra"].includes(nivelAcademico) && (
                                        <div>
                                            <label htmlFor="anioGraduacion" className="block text-sm font-bold text-black font-open-sans">
                                            Año de graduación
                                            </label>
                                            <input
                                            id="anioGraduacion"
                                            type="text"
                                            value={anioGraduacion}
                                            onChange={(e) => setAnioGraduacion(e.target.value)}
                                            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                            placeholder="Ej: 2024"
                                            />
                                        </div>
                                        )}

                                        {/* MOD: Campo Contraseña con ayuda y error */}
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-bold text-black font-open-sans">
                                                Contraseña
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                                placeholder="Contraseña"
                                            />
                                            <p className="mt-1 text-xs text-black">
                                                {/* MOD: Texto guía de política */}
                                                Debe tener 8–15 caracteres, incluir minúscula, mayúscula, número y uno
                                                de estos caracteres: $ @ $ ! % ? &. Sin espacios.
                                            </p>
                                            {errorPassword && (
                                                <p className="mt-1 text-sm text-black">
                                                    {/* MOD: Mensaje de error de contraseña */}
                                                    {errorPassword}
                                                </p>
                                            )}
                                        </div>

                                        {/* MOD: Confirmación de contraseña con error */}
                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-black font-open-sans">
                                                Confirmar contraseña
                                            </label>
                                            <input
                                                id="confirmPassword"
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-una-gray placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm"
                                                placeholder="Confirmar contraseña"
                                            />
                                            {errorConfirm && (
                                                <p className="mt-1 text-sm text-black">
                                                    {/* MOD: Mensaje de error de confirmación */}
                                                    {errorConfirm}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="submit"
                                            // MOD: Deshabilitar envío si el formulario no es válido
                                            disabled={!formularioValido}
                                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-bold rounded-md text-white bg-una-red hover:bg-red-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-una-red font-open-sans"
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
