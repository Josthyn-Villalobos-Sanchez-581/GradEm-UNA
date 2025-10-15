import React, { useState, useEffect, FormEvent, useMemo } from "react";
import axios from "axios";
import { router } from "@inertiajs/react"; // 👈 Inertia router
import logoUNA from "../assets/logoUNA.png";
import grademLogo from "../assets/GradEm.png";
import { useModal } from "../hooks/useModal";


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

const Registro: React.FC = () => {
    const [tipoCuenta, setTipoCuenta] = useState<string>("");
    const [correo, setCorreo] = useState<string>("");
    const [codigo, setCodigo] = useState<string>("");
    const [codigoEnviado, setCodigoEnviado] = useState<boolean>(false);
    const [codigoValidado, setCodigoValidado] = useState<boolean>(false);
    const [correoValido, setCorreoValido] = useState<boolean>(true);

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

    // --- Validaciones en tiempo real ---
    // Identificación: required|numeric|digits_between:8,12
    function validarIdentificacion(valor: string): string | undefined {
        const v = (valor || '').trim();
        if (!v) return 'La identificación es obligatoria.';
        if (!/^[0-9]+$/.test(v)) return 'La identificación debe ser un número.';
        if (v.length < 8 || v.length > 12) return 'La identificación debe tener entre 8 y 12 dígitos.';
        return undefined;
    }

    // Teléfono: nullable|numeric|digits_between:8,15
    function validarTelefono(valor: string): string | undefined {
        const v = (valor || '').trim();
        if (!v) return undefined; // nullable
        if (!/^[0-9]+$/.test(v)) return 'El teléfono debe contener solo números.';
        if (v.length < 8 || v.length > 15) return 'El teléfono debe tener entre 8 y 15 dígitos.';
        return undefined;
    }

    // Fecha de nacimiento: nullable|date|before:today
    function validarFechaNacimiento(valor: string): string | undefined {
        if (!valor) return undefined; // nullable
        const hoy = new Date();
        const fecha = new Date(valor);
        if (isNaN(fecha.getTime())) return 'Fecha inválida.';
        if (fecha >= hoy) return 'La fecha de nacimiento debe ser anterior a hoy.';
        return undefined;
    }

    // Género: nullable|string|max:20|in:masculino,femenino,otro
    function validarGenero(valor: string): string | undefined {
        if (!valor) return undefined;
        if (!["masculino", "femenino", "otro"].includes(valor)) return 'Debe seleccionar una opción válida en género.';
        return undefined;
    }

    // Estado empleo: nullable|string|max:50|in:empleado,desempleado
    function validarEstadoEmpleo(valor: string): string | undefined {
        if (!valor) return undefined;
        if (!["empleado", "desempleado"].includes(valor)) return 'Debe ser empleado o desempleado.';
        return undefined;
    }

    // Estado estudios: nullable|string|max:50|in:activo,pausado,finalizado
    function validarEstadoEstudios(valor: string): string | undefined {
        if (!valor) return undefined;
        if (!["activo", "pausado", "finalizado"].includes(valor)) return 'Debe ser activo, pausado o finalizado.';
        return undefined;
    }

    // Nivel académico: nullable|string|max:50 (solo longitud)
    function validarNivelAcademico(valor: string): string | undefined {
        if (!valor) return undefined;
        if (valor.length > 50) return 'El nivel académico no puede superar 50 caracteres.';
        return undefined;
    }

    // Año graduación: nullable|digits:4|integer|min:2007|max:año_actual
    function validarAnioGraduacion(valor: string): string | undefined {
        if (!valor) return undefined;
        if (!/^[0-9]{4}$/.test(valor)) return 'El año de graduación debe tener 4 dígitos.';
        const n = parseInt(valor, 10);
        const anioActual = new Date().getFullYear();
        if (n < 2007) return 'El año de graduación no puede ser antes de 2007.';
        if (n > anioActual) return `El año de graduación no puede ser después de ${anioActual}.`;
        return undefined;
    }

    // Tiempo conseguir empleo: requerido si empleado, solo números, máximo 3 dígitos, rango 0-120
    function validarTiempoConseguirEmpleo(valor: string, estadoEmpleo: string): string | undefined {
        if (estadoEmpleo === "empleado" && (!valor || valor.trim() === "")) {
            return "Este campo es obligatorio si está empleado.";
        }
        if (valor && !/^[0-9]{1,3}$/.test(valor)) return "Solo números, máximo 3 dígitos.";
        const n = parseInt(valor, 10);
        if (valor && (n < 0 || n > 120)) return "El tiempo debe estar entre 0 y 120 meses.";
        return undefined;
    }

    // Salario promedio: requerido si empleado, debe coincidir con una opción válida
    function validarSalarioPromedio(valor: string, estadoEmpleo: string): string | undefined {
        const opcionesValidas = ["<300000", "300000-600000", "600000-1000000", ">1000000"];
        if (estadoEmpleo === "empleado" && (!valor || valor === "")) {
            return "Debe seleccionar un rango salarial.";
        }
        if (valor && !opcionesValidas.includes(valor)) {
            return "Debe seleccionar un rango salarial válido.";
        }
        return undefined;
    }

    // Tipo de empleo: requerido si empleado, debe coincidir con una opción válida
    function validarTipoEmpleo(valor: string, estadoEmpleo: string): string | undefined {
        const opcionesValidas = ["Tiempo completo", "Medio tiempo", "Temporal", "Independiente", "Práctica"];
        if (estadoEmpleo === "empleado" && (!valor || valor === "")) {
            return "Debe seleccionar un tipo de empleo.";
        }
        if (valor && !opcionesValidas.includes(valor)) {
            return "Debe seleccionar un tipo de empleo válido.";
        }
        return undefined;
    }

    // Área laboral: requerida si empleado
    function validarAreaLaboral(valor: string, estadoEmpleo: string): string | undefined {
        if (estadoEmpleo === "empleado" && (!valor || valor.trim() === "")) {
            return "Debe seleccionar un área laboral.";
        }
        return undefined;
    }

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

    const [errors, setErrors] = useState<any>({});
    const modal = useModal();

    const nameRegex = useMemo(() => {
    // Intentamos usar Unicode property escapes; si no son soportadas, usamos fallback
    try {
        return new RegExp('^[\\p{L}\\s]+$', 'u');
    } catch {
        return /^[A-Za-zÀ-ÿ\s]+$/;
    }
    }, []);

    /** Valida y devuelve mensaje de error (string) o undefined si es válido */
    function validarNombreCompletoValor(valor: string): string | undefined {
    const v = (valor || '').trim();

    if (!v) return 'El nombre es obligatorio.';
    if (v.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    if (v.length > 100) return 'El nombre no puede superar los 100 caracteres.';
    if (!nameRegex.test(v)) return 'El nombre solo puede contener letras y espacios.';
    return undefined;
    }

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
            return "Debe incluir minúscula, mayúscula, número, un carácter especial ($ @ ! % ? &) y no contener espacios.";
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
    const errorIdentificacion = useMemo(() => validarIdentificacion(numeroIdentificacion), [numeroIdentificacion]);
    const errorTelefono = useMemo(() => validarTelefono(telefono), [telefono]);
    const errorFechaNacimiento = useMemo(() => validarFechaNacimiento(fechaNacimiento), [fechaNacimiento]);
    const errorGenero = useMemo(() => validarGenero(genero), [genero]);
    const errorEstadoEmpleo = useMemo(() => validarEstadoEmpleo(estadoEmpleo), [estadoEmpleo]);
    const errorEstadoEstudios = useMemo(() => validarEstadoEstudios(estadoEstudios), [estadoEstudios]);
    const errorNivelAcademico = useMemo(() => validarNivelAcademico(nivelAcademico), [nivelAcademico]);
    const errorAnioGraduacion = useMemo(() => validarAnioGraduacion(anioGraduacion), [anioGraduacion]);
    const errorTiempoConseguirEmpleo = useMemo(() => validarTiempoConseguirEmpleo(tiempoConseguirEmpleo, estadoEmpleo), [tiempoConseguirEmpleo, estadoEmpleo]);
    const errorSalarioPromedio = useMemo(() => validarSalarioPromedio(salarioPromedio, estadoEmpleo), [salarioPromedio, estadoEmpleo]);
    const errorTipoEmpleo = useMemo(() => validarTipoEmpleo(tipoEmpleo, estadoEmpleo), [tipoEmpleo, estadoEmpleo]);
    const errorAreaLaboral = useMemo(() => validarAreaLaboral(areaLaboral, estadoEmpleo),[areaLaboral, estadoEmpleo]);

    // MOD: Formulario válido (para deshabilitar submit)
    const formularioValidoBase =
        codigoValidado &&
        !errorPassword &&
        !errorConfirm &&
        !errorIdentificacion &&
        !errorTelefono &&
        !errorFechaNacimiento &&
        !errorGenero &&
        !errorEstadoEmpleo &&
        !errorEstadoEstudios &&
        !errorTiempoConseguirEmpleo &&
        !errorSalarioPromedio &&
        !errorTipoEmpleo &&
        password.length > 0 &&
        confirmPassword.length > 0 &&
        nombreCompleto.length > 0 &&
        numeroIdentificacion.length > 0;
        (
        estadoEmpleo !== "empleado" ||
        (
            tiempoConseguirEmpleo.length > 0 &&
            salarioPromedio.length > 0 &&
            tipoEmpleo.length > 0 &&
            areaLaboral.length > 0
        )
        );

        const formularioValido = formularioValidoBase && (
            // Si es egresado, nivel académico y año de graduación son obligatorios y deben ser válidos
            tipoCuenta === 'egresado'
                ? (!errorNivelAcademico && !errorAnioGraduacion && nivelAcademico.length > 0 && anioGraduacion.length > 0)
                : true
        );

    const verificarCorreo = async (email: string) => {
        try {
            const response = await axios.post("/verificar-correo", { correo: email });
            if (response.data.exists) {
                setCorreoValido(false);
                setErrors((prev: any) => ({ ...prev, correo: ["Este correo ya está registrado"] }));
            } else {
                setCorreoValido(true);
                setErrors((prev: any) => ({ ...prev, correo: undefined }));
            }
        } catch (error) {
            // Opcional: manejar error de red
        }
    };

    const handleCorreoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setCorreo(e.target.value);
        if (e.target.value) {
            await verificarCorreo(e.target.value);
        }
    };

    const handleEnviarCodigo = async () => {
        try {
            await axios.post("/registro/enviar-codigo", { correo });
            setCodigoEnviado(true);
            await modal.alerta({ titulo: "Éxito", mensaje: "Código enviado al correo" });
        } catch (error: any) {
            await modal.alerta({ titulo: "Error", mensaje: error.response?.data?.message || "Error al enviar el código" });
        }
    };

    const handleValidarCodigo = async () => {
        // Validar que se haya seleccionado tipoCuenta
        if (!tipoCuenta) {
            await modal.alerta({ titulo: "Advertencia", mensaje: "Debes seleccionar una opción de tipo de cuenta antes de validar el correo." });
            return;
        }
        try {
            await axios.post("/registro/validar-codigo", { correo, codigo });
            setCodigoValidado(true);
            await modal.alerta({ titulo: "Éxito", mensaje: "Correo verificado correctamente" });
        } catch (error: any) {
            await modal.alerta({ titulo: "Error", mensaje: error.response?.data?.message || "Código incorrecto o expirado" });
        }
    };

    const handleRegistro = async (e: FormEvent) => {
        e.preventDefault();
         setErrors({});
        if (!codigoValidado) {
            await modal.alerta({ titulo: "Advertencia", mensaje: "Primero debes validar tu correo" });
            return;
        }

        if (errorPassword || errorConfirm) {
            await modal.alerta({ titulo: "Advertencia", mensaje: errorPassword || errorConfirm });
            return;
        }

        // Validación adicional: si es egresado, aseguramos que nivel y año estén completos y válidos
        if (tipoCuenta === 'egresado') {
            if (!nivelAcademico || !anioGraduacion) {
                await modal.alerta({ titulo: "Advertencia", mensaje: "Para egresados, el nivel académico y el año de graduación son obligatorios." });
                return;
            }
            if (errorNivelAcademico || errorAnioGraduacion) {
                await modal.alerta({ titulo: "Advertencia", mensaje: errorNivelAcademico || errorAnioGraduacion });
                return;
            }
        }

        try {
            const userData = {
                nombre_completo: nombreCompleto,
                correo,
                password,
                password_confirmation: confirmPassword,
                tipoCuenta,
                identificacion: numeroIdentificacion,
                // Enviar null en lugar de cadena vacía para campos opcionales
                telefono: telefono || null,
                fecha_nacimiento: fechaNacimiento || null,
                genero: genero || null,
                id_universidad: universidad || null,
                id_carrera: carrera || null,
                estado_empleo: estadoEmpleo || null,
                estado_estudios: estadoEstudios || null,
                ...(tipoCuenta === 'egresado' ? {
                    nivel_academico: nivelAcademico || null,
                    anio_graduacion: anioGraduacion ? parseInt(anioGraduacion, 10) : null,
                } : {}),
                id_canton: canton || null,
                ...(estadoEmpleo === "empleado"
                    ? {
                        tiempo_conseguir_empleo: tiempoConseguirEmpleo || null,
                        area_laboral_id: areaLaboral || null,
                        salario_promedio: salarioPromedio || null,
                        tipo_empleo: tipoEmpleo || null,
                    }
                    : {}),
            };

        // Solo mostrar modal si todo salió bien
        const response = await axios.post("/registro", userData);
        try {
            await modal.alerta({
                titulo: "Éxito",
                mensaje: response.data.message || "Registro exitoso",
            });
        } catch (mErr) {
            // Si el modal falla inesperadamente, logueamos y continuamos con redirección
            // eslint-disable-next-line no-console
            console.error('Modal alerta falló tras registro:', mErr);
        }

        // 🔹 Redirigir después de cerrar el modal
        try {
            // Intentamos usar Inertia (mejor UX). Si falla, caemos a window.location
            router.get("/login");
        } catch (navErr) {
            // Fallback robusto: navegación completa
            // eslint-disable-next-line no-console
            console.error('Inertia navigation failed, falling back to full redirect', navErr);
            window.location.href = '/login';
        }

        // 🔹 limpiar formulario
        setNombreCompleto("");
        setCorreo("");
        setPassword("");
        setConfirmPassword("");
        setNumeroIdentificacion("");
        setTelefono("");
        setFechaNacimiento("");
        setGenero("");
        setUniversidad("");
        setCarrera("");
        setEstadoEmpleo("");
        setEstadoEstudios("");
        setNivelAcademico("");
        setAnioGraduacion("");
        setCanton("");
        setTiempoConseguirEmpleo("");
        setAreaLaboral("");
        setSalarioPromedio("");
        setTipoEmpleo("");
    } catch (error: any) {
        if (error.response?.status === 422) {
            // Laravel devolvió errores de validación. Aseguramos un objeto por defecto.
            const serverErrors = error.response.data.errors || {};
            // Log completo para debugging (Network ya lo muestra, pero útil aquí)
            // eslint-disable-next-line no-console
            console.warn('Registro: errores del servidor 422', error.response.data);
            setErrors(serverErrors);
            // Mostrar el primer error en modal para feedback inmediato
            const firstError = (Object.values(serverErrors as any)[0] as any)?.[0] || 'Errores de validación';
            try { await modal.alerta({ titulo: 'Advertencia', mensaje: firstError }); } catch {}
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
                {/* Main */}
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
                                Crear Cuenta
                            </h1>
                            <p className="mt-4 text-center text-lg text-gray-800 font-open-sans">
                                Complete la información a continuación para crear su cuenta.
                            </p>
                            <p className="mt-4 text-center text-lg text-gray-800 font-open-sans">
                                Seleccione la opción de cuenta a crear:
                            </p>
                        </div>

                        {/* 🔹 Selección de tipo de cuenta separada */}
                        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-4 mb-6">
                        {[
                            { tipo: "estudiante", label: "Estudiante" },
                            { tipo: "egresado", label: "Egresado" },
                            { tipo: "empresa", label: "Empresa" },
                        ].map(({ tipo, label }) => (
                            <button
                            key={tipo}
                            type="button"
                            onClick={() => {
                                setTipoCuenta(tipo);

                                // Comportamiento por defecto según tipo de cuenta
                                if (tipo === "egresado") {
                                    // Egresado: estado de estudios finalizado y bloqueado
                                    setEstadoEstudios("finalizado");
                                    // dejar los campos de egresado para que el usuario los complete
                                } else if (tipo === "estudiante") {
                                    // Estudiante: estado de estudios por defecto activo (editable)
                                    setEstadoEstudios("activo");
                                    // Limpiar campos exclusivos de egresado
                                    setNivelAcademico("");
                                    setAnioGraduacion("");
                                } else {
                                    // Si selecciona empresa u otro, limpiar
                                    setEstadoEstudios("");
                                    setNivelAcademico("");
                                    setAnioGraduacion("");
                                }
                            }}
                            disabled={codigoValidado}
                            className={`px-6 py-2 rounded-md font-open-sans font-bold border transition 
                                ${tipoCuenta === tipo
                                ? "bg-una-red text-white border-una-red"
                                : "bg-white text-una-red border-una-red hover:bg-red-50"}
                                disabled:opacity-60`}
                            >
                            {label}
                            </button>
                        ))}
                        </div>

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
                                        onChange={handleCorreoChange}
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
                                {errors?.correo && (
                                    <p className="text-red-500">{errors.correo[0]}</p>
                                )}
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
                                                name="nombre_completo"
                                                type="text"
                                                required
                                                value={nombreCompleto}
                                                onChange={(e) => {
                                                const value = e.target.value;
                                                setNombreCompleto(value);

                                                // Validación en tiempo real: actualiza solo el error de este campo
                                                const err = validarNombreCompletoValor(value);
                                                setErrors((prev: any) => {
                                                    if (err) {
                                                    return { ...prev, nombre_completo: [err] };
                                                    } else {
                                                    const { nombre_completo, ...rest } = prev;
                                                    return rest;
                                                    }
                                                });
                                                }}
                                                onBlur={(e) => {
                                                // Validación adicional en onBlur para asegurar mensaje si estaba vacío y el usuario sale del campo
                                                const err = validarNombreCompletoValor(e.target.value);
                                                setErrors((prev: any) => {
                                                    if (err) return { ...prev, nombre_completo: [err] };
                                                    const { nombre_completo, ...rest } = prev;
                                                    return rest;
                                                });
                                                }}
                                                className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                                                (errors as any).nombre_completo ? 'border-red-500' : 'border-una-gray'
                                                } placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                                placeholder="Ej: Juan Pérez González"
                                                aria-invalid={!!(errors as any).nombre_completo}
                                                aria-describedby={(errors as any).nombre_completo ? 'nombre-error' : undefined}
                                            />

                                            {/* Mensaje de error (compatibiliza con errores del servidor que vienen como array) */}
                                            {(errors as any).nombre_completo && (
                                                <p id="nombre-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive">
                                                {(errors as any).nombre_completo[0]}
                                                </p>
                                            )}
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
                                                onChange={(e) => {
                                                    setNumeroIdentificacion(e.target.value);
                                                    const err = validarIdentificacion(e.target.value);
                                                    setErrors((prev: any) => {
                                                        if (err) return { ...prev, identificacion: [err] };
                                                        const { identificacion, ...rest } = prev;
                                                        return rest;
                                                    });
                                                }}
                                                onBlur={(e) => {
                                                    const err = validarIdentificacion(e.target.value);
                                                    setErrors((prev: any) => {
                                                        if (err) return { ...prev, identificacion: [err] };
                                                        const { identificacion, ...rest } = prev;
                                                        return rest;
                                                    });
                                                }}
                                                className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${(errors as any).identificacion ? 'border-red-500' : 'border-una-gray'} placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                                placeholder="Ej: 112345678"
                                                aria-invalid={!!(errors as any).identificacion}
                                                aria-describedby={(errors as any).identificacion ? 'identificacion-error' : undefined}
                                            />
                                            {(errors as any).identificacion && (
                                                <p id="identificacion-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive">
                                                    {(errors as any).identificacion[0]}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="telefono" className="block text-sm font-bold text-black font-open-sans">
                                                Teléfono de contacto
                                            </label>
                                            <input
                                                id="telefono"
                                                type="tel"
                                                value={telefono}
                                                onChange={(e) => {
                                                    setTelefono(e.target.value);
                                                    const err = validarTelefono(e.target.value);
                                                    setErrors((prev: any) => {
                                                        if (err) return { ...prev, telefono: [err] };
                                                        const { telefono, ...rest } = prev;
                                                        return rest;
                                                    });
                                                }}
                                                onBlur={(e) => {
                                                    const err = validarTelefono(e.target.value);
                                                    setErrors((prev: any) => {
                                                        if (err) return { ...prev, telefono: [err] };
                                                        const { telefono, ...rest } = prev;
                                                        return rest;
                                                    });
                                                }}
                                                className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${(errors as any).telefono ? 'border-red-500' : 'border-una-gray'} placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                                placeholder="Ej: 88888888"
                                                aria-invalid={!!(errors as any).telefono}
                                                aria-describedby={(errors as any).telefono ? 'telefono-error' : undefined}
                                            />
                                            {(errors as any).telefono && (
                                                <p id="telefono-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive">
                                                    {(errors as any).telefono[0]}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="fechaNacimiento" className="block text-sm font-bold text-black font-open-sans">
                                                Fecha de nacimiento
                                            </label>
                                            <input
                                                id="fechaNacimiento"
                                                type="date"
                                                value={fechaNacimiento}
                                                onChange={(e) => {
                                                    setFechaNacimiento(e.target.value);
                                                    const err = validarFechaNacimiento(e.target.value);
                                                    setErrors((prev: any) => {
                                                        if (err) return { ...prev, fecha_nacimiento: [err] };
                                                        const { fecha_nacimiento, ...rest } = prev;
                                                        return rest;
                                                    });
                                                }}
                                                onBlur={(e) => {
                                                    const err = validarFechaNacimiento(e.target.value);
                                                    setErrors((prev: any) => {
                                                        if (err) return { ...prev, fecha_nacimiento: [err] };
                                                        const { fecha_nacimiento, ...rest } = prev;
                                                        return rest;
                                                    });
                                                }}
                                                className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${(errors as any).fecha_nacimiento ? 'border-red-500' : 'border-una-gray'} placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                                min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split("T")[0]}
                                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString().split("T")[0]}
                                                aria-invalid={!!(errors as any).fecha_nacimiento}
                                                aria-describedby={(errors as any).fecha_nacimiento ? 'fecha-nacimiento-error' : undefined}
                                            />
                                            {(errors as any).fecha_nacimiento && (
                                                <p id="fecha-nacimiento-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive">
                                                    {(errors as any).fecha_nacimiento[0]}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="genero" className="block text-sm font-bold text-black font-open-sans">
                                                Género
                                            </label>
                                            <select
                                                id="genero"
                                                value={genero}
                                                onChange={(e) => {
                                                    setGenero(e.target.value);
                                                    const err = validarGenero(e.target.value);
                                                    setErrors((prev: any) => {
                                                        if (err) return { ...prev, genero: [err] };
                                                        const { genero, ...rest } = prev;
                                                        return rest;
                                                    });
                                                }}
                                                onBlur={(e) => {
                                                    const err = validarGenero(e.target.value);
                                                    setErrors((prev: any) => {
                                                        if (err) return { ...prev, genero: [err] };
                                                        const { genero, ...rest } = prev;
                                                        return rest;
                                                    });
                                                }}
                                                className={`mt-1 block w-full px-3 py-2 border ${(errors as any).genero ? 'border-red-500' : 'border-una-gray'} rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                                aria-invalid={!!(errors as any).genero}
                                                aria-describedby={(errors as any).genero ? 'genero-error' : undefined}
                                            >
                                                <option value="">Seleccione...</option>
                                                <option value="femenino">Femenino</option>
                                                <option value="masculino">Masculino</option>
                                                <option value="otro">Otro</option>
                                            </select>
                                            {(errors as any).genero && (
                                                <p id="genero-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive">
                                                    {(errors as any).genero[0]}
                                                </p>
                                            )}
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
                                                max={120}
                                                min={0}
                                                maxLength={3}
                                                onChange={(e) => {
                                                const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                                                setTiempoConseguirEmpleo(v);
                                                const err = validarTiempoConseguirEmpleo(v, estadoEmpleo);
                                                setErrors((prev: any) => {
                                                    if (err) return { ...prev, tiempo_conseguir_empleo: [err] };
                                                    const { tiempo_conseguir_empleo, ...rest } = prev;
                                                    return rest;
                                                });
                                                }}
                                                onBlur={(e) => {
                                                const err = validarTiempoConseguirEmpleo(e.target.value, estadoEmpleo);
                                                setErrors((prev: any) => {
                                                    if (err) return { ...prev, tiempo_conseguir_empleo: [err] };
                                                    const { tiempo_conseguir_empleo, ...rest } = prev;
                                                    return rest;
                                                });
                                                }}
                                                className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                                                (errors as any).tiempo_conseguir_empleo ? "border-red-500" : "border-una-gray"
                                                } placeholder-una-gray text-gray-900 focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                                placeholder="Ej: 6"
                                                aria-invalid={!!(errors as any).tiempo_conseguir_empleo}
                                                aria-describedby={
                                                (errors as any).tiempo_conseguir_empleo ? "tiempo-conseguir-empleo-error" : undefined
                                                }
                                            />
                                            {errors.tiempo_conseguir_empleo && (
                                                <p className="mt-1 text-sm text-red-600">{errors.tiempo_conseguir_empleo[0]}</p>
                                            )}
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
                                                onChange={(e) => {
                                                setAreaLaboral(e.target.value);
                                                const err = validarAreaLaboral(e.target.value, estadoEmpleo);
                                                setErrors((prev: any) => {
                                                    if (err) return { ...prev, area_laboral: [err] };
                                                    const { area_laboral, ...rest } = prev;
                                                    return rest;
                                                });
                                                }}
                                                onBlur={(e) => {
                                                const err = validarAreaLaboral(e.target.value, estadoEmpleo);
                                                setErrors((prev: any) => {
                                                    if (err) return { ...prev, area_laboral: [err] };
                                                    const { area_laboral, ...rest } = prev;
                                                    return rest;
                                                });
                                                }}
                                                className={`mt-1 block w-full px-3 py-2 border ${
                                                (errors as any).area_laboral ? "border-red-500" : "border-una-gray"
                                                } rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                                aria-invalid={!!(errors as any).area_laboral}
                                                aria-describedby={
                                                (errors as any).area_laboral ? "area-laboral-error" : undefined
                                                }
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
                                            {(errors as any).area_laboral && (
                                                <p id="area-laboral-error" className="mt-1 text-sm text-red-600">
                                                {(errors as any).area_laboral[0]}
                                                </p>
                                            )}
                                            </div>

                                            <div>
                                            <label
                                                htmlFor="salarioPromedio"
                                                className="block text-sm font-bold text-black font-open-sans"
                                            >
                                                Salario promedio
                                            </label>
                                            <select
                                                id="salarioPromedio"
                                                value={salarioPromedio}
                                                onChange={(e) => {
                                                setSalarioPromedio(e.target.value);
                                                const err = validarSalarioPromedio(e.target.value, estadoEmpleo);
                                                setErrors((prev: any) => {
                                                    if (err) return { ...prev, salario_promedio: [err] };
                                                    const { salario_promedio, ...rest } = prev;
                                                    return rest;
                                                });
                                                }}
                                                onBlur={(e) => {
                                                const err = validarSalarioPromedio(e.target.value, estadoEmpleo);
                                                setErrors((prev: any) => {
                                                    if (err) return { ...prev, salario_promedio: [err] };
                                                    const { salario_promedio, ...rest } = prev;
                                                    return rest;
                                                });
                                                }}
                                                className={`mt-1 block w-full px-3 py-2 border ${
                                                (errors as any).salario_promedio ? "border-red-500" : "border-una-gray"
                                                } rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                                aria-invalid={!!(errors as any).salario_promedio}
                                                aria-describedby={
                                                (errors as any).salario_promedio ? "salario-promedio-error" : undefined
                                                }
                                            >
                                                <option value="">Seleccione rango salarial</option>
                                                <option value="<300000">Menor a ₡300,000</option>
                                                <option value="300000-600000">₡300,000 - ₡600,000</option>
                                                <option value="600000-1000000">₡600,000 - ₡1,000,000</option>
                                                <option value=">1000000">Mayor a ₡1,000,000</option>
                                            </select>
                                            {(errors as any).salario_promedio && (
                                                <p
                                                id="salario-promedio-error"
                                                className="mt-1 text-sm text-red-600"
                                                role="alert"
                                                aria-live="assertive"
                                                >
                                                {(errors as any).salario_promedio[0]}
                                                </p>
                                            )}
                                            </div>

                                            <div>
                                            <label
                                                htmlFor="tipoEmpleo"
                                                className="block text-sm font-bold text-black font-open-sans"
                                            >
                                                Tipo de empleo
                                            </label>
                                            <select
                                                id="tipoEmpleo"
                                                value={tipoEmpleo}
                                                onChange={(e) => {
                                                setTipoEmpleo(e.target.value);
                                                const err = validarTipoEmpleo(e.target.value, estadoEmpleo);
                                                setErrors((prev: any) => {
                                                    if (err) return { ...prev, tipo_empleo: [err] };
                                                    const { tipo_empleo, ...rest } = prev;
                                                    return rest;
                                                });
                                                }}
                                                onBlur={(e) => {
                                                const err = validarTipoEmpleo(e.target.value, estadoEmpleo);
                                                setErrors((prev: any) => {
                                                    if (err) return { ...prev, tipo_empleo: [err] };
                                                    const { tipo_empleo, ...rest } = prev;
                                                    return rest;
                                                });
                                                }}
                                                className={`mt-1 block w-full px-3 py-2 border ${
                                                (errors as any).tipo_empleo ? "border-red-500" : "border-una-gray"
                                                } rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                                aria-invalid={!!(errors as any).tipo_empleo}
                                                aria-describedby={
                                                (errors as any).tipo_empleo ? "tipo-empleo-error" : undefined
                                                }
                                            >
                                                <option value="">Seleccione tipo de empleo</option>
                                                <option value="Tiempo completo">Tiempo completo</option>
                                                <option value="Medio tiempo">Medio tiempo</option>
                                                <option value="Temporal">Temporal</option>
                                                <option value="Independiente">Independiente</option>
                                                <option value="Práctica">Práctica</option>
                                            </select>
                                            {(errors as any).tipo_empleo && (
                                                <p
                                                id="tipo-empleo-error"
                                                className="mt-1 text-sm text-red-600"
                                                role="alert"
                                                aria-live="assertive"
                                                >
                                                {(errors as any).tipo_empleo[0]}
                                                </p>
                                            )}
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
                                            // Si es egresado, el select queda deshabilitado porque por defecto es "finalizado"
                                            disabled={tipoCuenta === "egresado"}
                                            className={`mt-1 block w-full px-3 py-2 border border-una-gray rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm ${
                                                tipoCuenta === "egresado" ? "bg-gray-100 cursor-not-allowed" : ""
                                            }`}
                                        >
                                            {tipoCuenta === "estudiante" ? (
                                                <>
                                                    <option value="activo">Activo</option>
                                                    <option value="pausado">Pausado</option>
                                                </>
                                            ) : tipoCuenta === "egresado" ? (
                                                <option value="finalizado">Finalizado</option>
                                            ) : (
                                                <>
                                                    <option value="">Seleccione...</option>
                                                    <option value="activo">Activo</option>
                                                    <option value="pausado">Pausado</option>
                                                    <option value="finalizado">Finalizado</option>
                                                </>
                                            )}
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
                                                <select
                                                    id="anioGraduacion"
                                                    value={anioGraduacion}
                                                    onChange={(e) => {
                                                        setAnioGraduacion(e.target.value);
                                                        const err = validarAnioGraduacion(e.target.value);
                                                        setErrors((prev: any) => {
                                                            if (err) return { ...prev, anio_graduacion: [err] };
                                                            const { anio_graduacion, ...rest } = prev;
                                                            return rest;
                                                        });
                                                    }}
                                                    onBlur={(e) => {
                                                        const err = validarAnioGraduacion(e.target.value);
                                                        setErrors((prev: any) => {
                                                            if (err) return { ...prev, anio_graduacion: [err] };
                                                            const { anio_graduacion, ...rest } = prev;
                                                            return rest;
                                                        });
                                                    }}
                                                    className={`mt-1 block w-full px-3 py-2 border ${(errors as any).anio_graduacion ? 'border-red-500' : 'border-una-gray'} rounded-md shadow-sm text-una-dark-gray focus:outline-none focus:ring-una-red focus:border-una-red sm:text-sm`}
                                                    aria-invalid={!!(errors as any).anio_graduacion}
                                                    aria-describedby={(errors as any).anio_graduacion ? 'anio-graduacion-error' : undefined}
                                                >
                                                    <option value="">Seleccione...</option>
                                                    {Array.from({length: new Date().getFullYear() - 2007}, (_, i) => 2007 + i).map(y => (
                                                        <option key={y} value={y}>{y}</option>
                                                    ))}
                                                </select>
                                                {(errors as any).anio_graduacion && (
                                                    <p id="anio-graduacion-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="assertive">
                                                        {(errors as any).anio_graduacion[0]}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                        )}



                                        {/* MOD: Campo Contraseña with ayuda y error */}
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
                                    {/* Ayuda de requisitos de contraseña */}
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-gray-500 mt-1">
                                            La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y uno de estos caracteres: $ @ ! % ? &. Sin espacios.
                                        </p>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="submit"
                                            // Deshabilitar envío si el formulario no es válido (usamos formularioValido calculado)
                                            disabled={!formularioValido}
                                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-bold rounded-md text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-una-red font-open-sans
                                                ${!formularioValido ? "bg-gray-400 cursor-not-allowed" : "bg-una-red hover:bg-red-800"}`}
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
                                        onClick={() => {
                                            // Guardar validación antes de ir al formulario
                                            sessionStorage.setItem("correo_validado_empresa", "true");
                                            sessionStorage.setItem("correo_empresa", correo);
                                            router.get("/registro-empresa");
                                        }}
                                        className="text-una-red hover:underline"
                                    >
                                        Continuar al formulario de registro de empresa
                                    </button>
                                </div>
                            )}
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

export default Registro;
