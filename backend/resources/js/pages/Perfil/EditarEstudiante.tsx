import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { route } from "ziggy-js";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import IconoEdicion from "@/assets/IconoEdicion.png";
import { Inertia } from "@inertiajs/inertia";
import axios from "axios";
import CorreoVerificacion from "@/pages/Perfil/CorreoVerificacion";


// -------------------------
// INTERFACES
// -------------------------
interface AreaLaboral { id: number; nombre: string }
interface Pais { id: number; nombre: string }
interface Provincia { id: number; nombre: string; id_pais: number }
interface Canton { id: number; nombre: string; id_provincia: number }
interface Universidad { id: number; nombre: string; sigla: string }
interface Carrera { id: number; nombre: string; id_universidad: number }

interface UsuarioEstudiante {
    id_usuario: number;
    nombre_completo: string;
    correo: string;
    identificacion: string;
    telefono: string;
    fecha_nacimiento: string;
    genero: string;

    // Ubicación
    id_pais: number | null;
    id_provincia: number | null;
    id_canton: number | null;

    // Educación
    id_universidad: number | null;
    id_carrera: number | null;
    estado_estudios: string;

    // Laboral
    estado_empleo: string;
    tiempo_conseguir_empleo: number | null;
    area_laboral_id: number | null;
    salario_promedio: string | null;
    tipo_empleo: string | null;

    // Foto
    fotoPerfil?: { ruta_imagen: string } | null;
}

interface Props {
    usuario: UsuarioEstudiante;
    areaLaborales: AreaLaboral[];
    paises: Pais[];
    provincias: Provincia[];
    cantones: Canton[];
    universidades: Universidad[];
    carreras: Carrera[];
}

// -------------------------
// COMPONENTE
// -------------------------
export default function EditarEstudiante({
    usuario,
    areaLaborales,
    paises,
    provincias,
    cantones,
    universidades,
    carreras,
}: Props) {
    const modal = useModal();

    const [formData, setFormData] = useState<UsuarioEstudiante>(usuario);
    const [nombreFijo] = useState(usuario.nombre_completo);

    const [errores, setErrores] = useState<{ [key: string]: string }>({});
    const [idDuplicada, setIdDuplicada] = useState(false);

    // Secciones
    const [activeSection, setActiveSection] = useState<
        "personales" | "residencia" | "academicos" | "laborales" | "correo" | "condicion"
    >("personales");

    // selects dependientes
    const [selectedPais, setSelectedPais] = useState<number | null>(usuario.id_pais ?? null);
    const [selectedProvincia, setSelectedProvincia] = useState<number | null>(usuario.id_provincia ?? null);
    const [selectedCanton, setSelectedCanton] = useState<number | null>(usuario.id_canton ?? null);
    const [selectedUniversidad, setSelectedUniversidad] = useState<number | null>(usuario.id_universidad ?? null);

    // Foto
    const fotoPerfilUrl = formData.fotoPerfil?.ruta_imagen || FotoXDefecto;

    // Precargar país → provincia → cantón si viene en usuario
    useEffect(() => {
        if (usuario.id_canton) {
            const canton = cantones.find(c => c.id === usuario.id_canton) ?? null;
            const provincia = canton ? provincias.find(p => p.id === canton.id_provincia) ?? null : null;
            const pais = provincia ? paises.find(pa => pa.id === provincia.id_pais) ?? null : null;

            setSelectedPais(pais?.id ?? null);
            setSelectedProvincia(provincia?.id ?? null);
            setSelectedCanton(usuario.id_canton ?? null);

            setFormData(prev => ({
                ...prev,
                id_pais: pais?.id ?? null,
                id_provincia: provincia?.id ?? null,
                id_canton: usuario.id_canton ?? null,
            }));
        }
    }, [usuario, paises, provincias, cantones]);

    // Si estado_empleo es empleado, validar sus campos
    useEffect(() => {
        if (formData.estado_empleo === "empleado") {
            validarCampo("tiempo_conseguir_empleo", formData.tiempo_conseguir_empleo);
            validarCampo("area_laboral_id", formData.area_laboral_id);
            validarCampo("salario_promedio", formData.salario_promedio);
            validarCampo("tipo_empleo", formData.tipo_empleo);
        }
    }, [formData.estado_empleo]);

    // Si cambia a desempleado, limpiar campos laborales
    useEffect(() => {
        if (formData.estado_empleo === "desempleado") {
            setFormData(prev => ({
                ...prev,
                tiempo_conseguir_empleo: null,
                area_laboral_id: null,
                salario_promedio: null,
                tipo_empleo: null,
            }));

            setErrores(prev => {
                const e = { ...prev };
                delete e.tiempo_conseguir_empleo;
                delete e.area_laboral_id;
                delete e.salario_promedio;
                delete e.tipo_empleo;
                return e;
            });
        }
    }, [formData.estado_empleo]);

    useEffect(() => {

        // Si el estudiante no modificó la identificación original → no verificar
        if (formData.identificacion === usuario.identificacion) {
            setErrores(prev => ({ ...prev, identificacion: "" }));
            setIdDuplicada(false);
            return;
        }

        // Validación local
        const errorLocal = validarCampo("identificacion", formData.identificacion);
        if (errorLocal) {
            setIdDuplicada(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const resp = await axios.post("/perfil/verificar-identificacion", {
                    identificacion: formData.identificacion,
                });

                if (resp.data.existe) {
                    setErrores(prev => ({
                        ...prev,
                        identificacion: "La identificación ya existe en el sistema."
                    }));
                    setIdDuplicada(true); //activa bloqueo
                } else {
                    setErrores(prev => ({ ...prev, identificacion: "" }));
                    setIdDuplicada(false); //no está duplicada
                }

            } catch (e) {
                console.error("Error validando identificación", e);
            }

        }, 200);

        return () => clearTimeout(timer);

    }, [formData.identificacion]);


    // -------------------------
    // FOTO - eliminar
    // -------------------------
    const eliminarFotoPerfil = async () => {
        const confirm = await modal.confirmacion({
            titulo: "Confirmar eliminación",
            mensaje: "¿Está seguro que desea eliminar su foto de perfil?",
        });
        if (!confirm) return;

        Inertia.post("/perfil/foto/eliminar", {}, {
            onSuccess: async () => {
                await modal.alerta({ titulo: "Éxito", mensaje: "Foto de perfil eliminada." });
                // Actualizar estado local para quitar url (opcional, si backend retorna nuevo estado sería mejor)
                setFormData(prev => ({ ...prev, fotoPerfil: null }));
            },
            onError: (errors: any) => {
                modal.alerta({ titulo: "Error", mensaje: errors.foto || "No se pudo eliminar la foto." });
            },
        });
    };

    // -------------------------
    // VALIDACIONES 
    // -------------------------
    const validarCampo = (name: string, value: string | number | null) => {
        let error = "";
        const currentYear = new Date().getFullYear();
        const str = String(value ?? "");

        if (name === "nombre_completo") {
            if (!value) error = "El nombre completo es obligatorio.";
            else if (str.length > 80) error = "Máximo 80 caracteres.";
            else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(str)) error = "Solo letras y espacios.";
        }

        if (name === "telefono") {
            if (!/^\d{8}$/.test(str)) error = "Debe ser un número de 8 dígitos.";
        }

        if (name === "identificacion") {
            if (!/^(?=.*\d)[A-Za-z0-9]{5,12}$/.test(str)) {
                error = "Identificación alfanumérica (5-12 caracteres) y debe incluir números.";
            }

            if (idDuplicada === true) {
                error = "La identificación ya existe en el sistema."
            }
        }

        if (name === "fecha_nacimiento") {
            if (!value) error = "Campo obligatorio.";
            else {
                const year = new Date(str).getFullYear();
                if (year > currentYear - 16) error = "Limite de edad de 16 años.";
                else if (year < currentYear - 100) error = "Limite de edad de 100 años.";
            }
        }

        if (name === "estado_estudios" && !value) {
            error = "Seleccione el estado de estudios.";
        }

        if (["genero", "id_pais", "id_provincia", "id_canton", "id_universidad"].includes(name)) {
            if (!value) error = "Este campo es obligatorio.";
        }

        if (name === "id_carrera") {
            if (!value) error = "La carrera es obligatoria.";
        }

        if (name === "estado_empleo" && !value) {
            error = "Seleccione el estado de empleo.";
        }

        // Validaciones condicionales para cuando está empleado
        if (formData.estado_empleo === "empleado") {
            if (name === "tiempo_conseguir_empleo" && !value) error = "Indique los meses para conseguir empleo (Máximo 3 dígitos).";
            if (name === "area_laboral_id" && !value) error = "Seleccione un área laboral.";
            if (name === "salario_promedio" && !value) error = "Seleccione un rango salarial.";
            if (name === "tipo_empleo" && !value) error = "Seleccione un tipo de empleo.";
        }

        setErrores(prev => ({ ...prev, [name]: error }));
        return error;
    };

    // -------------------------
    // HANDLE CHANGE
    // -------------------------
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let { name, value } = e.target;
        let newValue: string | number | null = value;

        // Normalización
        if (name === "telefono") {
            value = value.replace(/\D/g, "").slice(0, 8);
            newValue = value;
        }

        if (name === "identificacion") {
            value = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
            newValue = value;
            setIdDuplicada(false);
            setErrores(prev => ({
                ...prev,
                identificacion: ""
            }));
        }


        // Campos que son numéricos o null
        if (["id_pais", "id_provincia", "id_canton", "id_universidad", "id_carrera", "area_laboral_id"].includes(name)) {
            newValue = value === "" ? null : Number(value);
        }

        // Campos numéricos de meses
        if (name === "tiempo_conseguir_empleo") {
            value = value.replace(/\D/g, "").slice(0, 3); // limitar a 3 dígitos
            newValue = value === "" ? null : Number(value);
        }

        // Si cambia estado_empleo a desempleado, limpiar los campos laborales (igual que original)
        if (name === "estado_empleo" && value === "desempleado") {
            const cleaned = {
                ...formData,
                estado_empleo: value,
                tiempo_conseguir_empleo: null,
                area_laboral_id: null,
                salario_promedio: null,
                tipo_empleo: null,
            };
            setFormData(cleaned);
            setErrores(prev => {
                const e = { ...prev };
                delete e.tiempo_conseguir_empleo;
                delete e.area_laboral_id;
                delete e.salario_promedio;
                delete e.tipo_empleo;
                return e;
            });
            return;
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
        validarCampo(name, newValue);
    };

    // -------------------------
    // CAMBIO DE ROL A EGRESADO
    // -------------------------
    const handleCambioEstudianteAEgresado = async () => {

        // PRIMER MODAL (INFORMATIVO)
        const confirmarImpacto = await modal.confirmacion({
            titulo: "Aviso importante",
            mensaje:
                "Este cambio actualizará su perfil académico y modificará el acceso a " +
                "diferentes áreas y funcionalidades del sistema según la condición de Egresado. " +
                "Le recomendamos verificar que la información proporcionada sea correcta antes de continuar.",
        });

        if (!confirmarImpacto) return;

        // SEGUNDO MODAL (CONFIRMACIÓN FINAL)
        const confirmarCambio = await modal.confirmacion({
            titulo: "Confirmar cambio de condición",
            mensaje:
                "¿Está seguro que desea cambiar su condición académica de Estudiante a Egresado?",
        });

        if (!confirmarCambio) return;

        try {
            await axios.post("/perfil/cambiar-condicion/estudiante-egresado");

            await modal.alerta({
                titulo: "Cambio realizado",
                mensaje:
                    "Su condición académica fue actualizada a Egresado correctamente.",
            });

            // Recargar perfil
            window.location.href = route("perfil.index");

        } catch (error: any) {
            const mensaje =
                error?.response?.data?.error ||
                "No fue posible realizar el cambio de condición.";

            await modal.alerta({
                titulo: "Error",
                mensaje,
            });
        }
    };


    // -------------------------
    // SUBMIT
    // -------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //Bloqueo inmediato si la identificación ya existe
        if (idDuplicada) {
            await modal.alerta({
                titulo: "Identificación duplicada",
                mensaje: "La identificación ingresada ya existe en el sistema. Corrija este campo para continuar.",
            });

            setActiveSection("personales"); // lleva a la sección correcta
            return;
        }


        // Revalidar todo (excluir fotoPerfil e id_usuario)
        const nuevosErrores: { [key: string]: string } = {};
        let hayErrores = false;

        const camposAValidar = Object.keys(formData).filter(k => k !== "fotoPerfil" && k !== "id_usuario");

        camposAValidar.forEach((key) => {
            const val = (formData as any)[key];
            const err = validarCampo(key, val);
            if (err) {
                hayErrores = true;
                nuevosErrores[key] = err;
            }
        });

        setErrores(nuevosErrores);

        if (hayErrores) {
            await modal.alerta({
                titulo: "Errores en el formulario",
                mensaje: "Debe corregir los campos en rojo.",
            });

            // mover a la sección del primer campo con error
            const primerCampo = camposAValidar.find(k => nuevosErrores[k]);
            if (primerCampo) {
                if (["nombre_completo", "correo", "identificacion", "telefono", "fecha_nacimiento", "genero"].includes(primerCampo))
                    setActiveSection("personales");
                else if (["id_pais", "id_provincia", "id_canton"].includes(primerCampo))
                    setActiveSection("residencia");
                else if (["id_universidad", "id_carrera", "anio_graduacion", "nivel_academico", "estado_estudios"].includes(primerCampo))
                    setActiveSection("academicos");
                else
                    setActiveSection("laborales");
            }

            return;
        }

        const ok = await modal.confirmacion({
            titulo: "Guardar cambios",
            mensaje: "¿Desea actualizar sus datos?",
        });

        if (!ok) return;

        // Enviar (excluir fotoPerfil)
        const { fotoPerfil, ...dataToSend } = formData as any;

        router.put(route("perfil.update"), dataToSend, {
            preserveScroll: true,
            onSuccess: async () => {
                await modal.alerta({
                    titulo: "Actualización exitosa",
                    mensaje: "Sus datos se han actualizado correctamente.",
                });
                window.location.href = route("perfil.index");
            },
            onError: async (backendErrors: any) => {
                // Mostrar mensaje del backend
                const errorMsg = Object.values(backendErrors).flat().join(" ");
                await modal.alerta({
                    titulo: "Error al guardar",
                    mensaje: errorMsg || "Hubo un error al actualizar los datos.",
                });
                // Si backend devuelve errores por campo, establecerlos
                setErrores(prev => ({ ...prev, ...(backendErrors || {}) }));
            },
        });
    };

    // -------------------------
    // RENDER
    // -------------------------
    return (
        <>
            <Head title="Editar Perfil de Estudiante" />

            {/* BOTÓN VOLVER (Fuera del contenedor principal si el layout lo permite) */}
            <div className="max-w-6xl mx-auto mb-4">
                <Button asChild variant="ghost" className="text-gray-600 hover:text-red-500">
                    <Link href="/perfil">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Volver al Perfil
                    </Link>
                </Button>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-white shadow-lg rounded-xl">
                {/* Columna izquierda - 30% (vista como admin) */}
                <div className="md:col-span-4 lg:col-span-3 border-r pr-6 text-black">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Perfil</h2>

                    <div className="flex flex-col items-start pb-6 border-b border-gray-200 mb-6 text-black">
                        <div className="relative">
                            <img
                                src={fotoPerfilUrl}
                                alt="Foto de Perfil"
                                className="rounded-full w-24 h-24 object-cover shadow-md mb-3 border-2 border-red-500"
                            />
                            <Link
                                href={route("perfil.foto.mostrar")}
                                title="Editar foto de perfil"
                                className="absolute -bottom-1 -right-1 flex items-center justify-center h-8 w-8 rounded-full bg-white border border-gray-300 shadow-md hover:scale-110 transition"
                            >
                                <img src={IconoEdicion} alt="Editar" className="w-4 h-4" />
                            </Link>
                        </div>

                        {formData.fotoPerfil && (
                            <button
                                type="button"
                                onClick={eliminarFotoPerfil}
                                className="mt-2 text-sm text-red-600 font-semibold hover:text-red-800 transition"
                            >
                                Borrar Foto de Perfil
                            </button>
                        )}

                        <p
                            className="
                               text-lg font-semibold text-gray-800 mt-4 
                               break-words 
                               whitespace-normal 
                               max-w-full 
                               overflow-hidden 
                               text-ellipsis
                             "
                        >
                            {nombreFijo}
                        </p>
                        <p className="text-sm text-gray-500">Estudiante</p>
                    </div>

                    <nav className="flex flex-col space-y-2">
                        <SectionLink title="Datos Personales" active={activeSection === "personales"} onClick={() => setActiveSection("personales")} />
                        <SectionLink title="Cambio de correo" active={activeSection === 'correo'} onClick={() => setActiveSection('correo')} />
                        <SectionLink title="Lugar de Residencia" active={activeSection === "residencia"} onClick={() => setActiveSection("residencia")} />
                        <SectionLink title="Datos Académicos" active={activeSection === "academicos"} onClick={() => setActiveSection("academicos")} />
                        <SectionLink title="Datos Laborales" active={activeSection === "laborales"} onClick={() => setActiveSection("laborales")} />
                        <SectionLink title="Cambio de condición académica" active={activeSection === "condicion"} onClick={() => setActiveSection("condicion")} />
                    </nav>
                </div>

                {/* Columna derecha - 70% contenido */}
                <div className="md:col-span-8 lg:col-span-9 text-black">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-700">
                                {activeSection === "personales" && "Datos Personales"}
                                {activeSection === "residencia" && "Lugar de Residencia"}
                                {activeSection === "academicos" && "Datos Académicos"}
                                {activeSection === "laborales" && "Datos Laborales"}
                                {activeSection === 'correo' && 'Cambiar correo electrónico'}
                            </h3>

                            <div className="flex gap-3">
                                <Button type="submit" variant="default">
                                    Guardar
                                </Button>
                            </div>
                        </div>

                        {/* DATOS PERSONALES */}
                        {activeSection === "personales" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {/* Nombre */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700">Nombre completo</label>
                                    <input
                                        type="text"
                                        name="nombre_completo"
                                        value={formData.nombre_completo}
                                        onChange={handleChange}
                                        onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                        maxLength={80}
                                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.nombre_completo ? "border-red-500" : "border-gray-300"
                                            }`}
                                    />
                                    {errores.nombre_completo && <span className="text-red-500 text-xs mt-1">{errores.nombre_completo}</span>}
                                </div>

                                {/* Identificación */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700">Identificación</label>
                                    <input
                                        type="text"
                                        name="identificacion"
                                        value={formData.identificacion}
                                        onChange={handleChange}
                                        onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                        maxLength={12}
                                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.identificacion ? "border-red-500" : "border-gray-300"
                                            }`}
                                    />
                                    {errores.identificacion && <span className="text-red-500 text-xs mt-1">{errores.identificacion}</span>}
                                </div>

                                {/* Teléfono */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700">Teléfono</label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                        maxLength={8}
                                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.telefono ? "border-red-500" : "border-gray-300"
                                            }`}
                                    />
                                    {errores.telefono && <span className="text-red-500 text-xs mt-1">{errores.telefono}</span>}
                                </div>

                                {/* Fecha nacimiento */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                                    <input
                                        type="date"
                                        name="fecha_nacimiento"
                                        value={formData.fecha_nacimiento}
                                        onChange={handleChange}
                                        onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.fecha_nacimiento ? "border-red-500" : "border-gray-300"
                                            }`}
                                    />
                                    {errores.fecha_nacimiento && <span className="text-red-500 text-xs mt-1">{errores.fecha_nacimiento}</span>}
                                </div>

                                {/* Género */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700">Género</label>
                                    <select
                                        name="genero"
                                        value={formData.genero ?? ""}
                                        onChange={handleChange}
                                        onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.genero ? "border-red-500" : "border-gray-300"
                                            }`}
                                    >
                                        <option value="">Seleccione género</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="femenino">Femenino</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                    {errores.genero && <span className="text-red-500 text-xs mt-1">{errores.genero}</span>}
                                </div>
                            </div>
                        )}

                        {activeSection === 'correo' && (
                            <div className="max-w-lg">
                                <CorreoVerificacion
                                    correoInicial={formData.correo}
                                    onCorreoVerificado={(nuevoCorreo) => {
                                        setFormData(prev => ({ ...prev, correo: nuevoCorreo }));
                                        setErrores(prev => ({ ...prev, correo: "" })); // Limpia error en caso de existir
                                    }}
                                />
                            </div>
                        )}


                        {/* LUGAR DE RESIDENCIA */}
                        {activeSection === "residencia" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {/* País */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700">País</label>
                                    <select
                                        name="id_pais"
                                        value={selectedPais ?? ""}
                                        onChange={(e) => {
                                            const id = e.target.value ? Number(e.target.value) : null;
                                            setSelectedPais(id);
                                            setSelectedProvincia(null);
                                            setSelectedCanton(null);
                                            setFormData(prev => ({ ...prev, id_pais: id, id_provincia: null, id_canton: null }));
                                            validarCampo("id_pais", id);
                                        }}
                                        onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.id_pais ? "border-red-500" : "border-gray-300"
                                            }`}
                                    >
                                        <option value="">Seleccione</option>
                                        {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                    {errores.id_pais && <span className="text-xs text-red-500 mt-1">{errores.id_pais}</span>}
                                </div>

                                {/* Provincia */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700">Provincia</label>
                                    <select
                                        name="id_provincia"
                                        value={selectedProvincia ?? ""}
                                        disabled={!selectedPais}
                                        onChange={(e) => {
                                            const id = e.target.value ? Number(e.target.value) : null;
                                            setSelectedProvincia(id);
                                            setSelectedCanton(null);
                                            setFormData(prev => ({ ...prev, id_provincia: id, id_canton: null }));
                                            validarCampo("id_provincia", id);
                                        }}
                                        onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.id_provincia ? "border-red-500" : "border-gray-300"
                                            }`}
                                    >
                                        <option value="">Seleccione</option>
                                        {provincias.filter(p => p.id_pais === selectedPais).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                    {errores.id_provincia && <span className="text-xs text-red-500 mt-1">{errores.id_provincia}</span>}
                                </div>

                                {/* Cantón */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700">Cantón</label>
                                    <select
                                        name="id_canton"
                                        value={selectedCanton ?? ""}
                                        disabled={!selectedProvincia}
                                        onChange={(e) => {
                                            const id = e.target.value ? Number(e.target.value) : null;
                                            setSelectedCanton(id);
                                            setFormData(prev => ({ ...prev, id_canton: id }));
                                            validarCampo("id_canton", id);
                                        }}
                                        onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm ${errores.id_canton ? "border-red-500" : "border-gray-300"
                                            }`}
                                    >
                                        <option value="">Seleccione</option>
                                        {cantones.filter(c => c.id_provincia === selectedProvincia).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                    {errores.id_canton && <span className="text-xs text-red-500 mt-1">{errores.id_canton}</span>}
                                </div>
                            </div>
                        )}

                        {/* DATOS ACADÉMICOS */}
                        {activeSection === "academicos" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {/* Estado de estudios */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700">Estado de estudios</label>
                                    <select
                                        name="estado_estudios"
                                        value={formData.estado_estudios ?? ""}
                                        onChange={handleChange}
                                        onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm sm:text-sm ${errores.estado_estudios ? "border-red-500" : "border-gray-300"
                                            }`}
                                    >
                                        <option value="">Seleccione estado</option>
                                        <option value="activo">Activo</option>
                                        <option value="pausado">Pausado</option>
                                        <option value="finalizado">Finalizado</option>
                                    </select>
                                    {errores.estado_estudios && <span className="text-red-500 text-xs mt-1">{errores.estado_estudios}</span>}
                                </div>

                                {/* Universidad */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700">Universidad</label>
                                    <select
                                        name="id_universidad"
                                        value={selectedUniversidad ?? ""}
                                        onChange={(e) => {
                                            const id = e.target.value ? Number(e.target.value) : null;
                                            setSelectedUniversidad(id);
                                            setFormData(prev => ({ ...prev, id_universidad: id, id_carrera: null }));
                                            validarCampo("id_universidad", id);
                                        }}
                                        onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm sm:text-sm ${errores.id_universidad ? "border-red-500" : "border-gray-300"
                                            }`}
                                    >
                                        <option value="">Seleccione universidad</option>
                                        {universidades.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.sigla})</option>)}
                                    </select>
                                    {errores.id_universidad && <span className="text-red-500 text-xs mt-1">{errores.id_universidad}</span>}
                                </div>

                                {/* Carrera */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700">Carrera</label>
                                    <select
                                        name="id_carrera"
                                        value={formData.id_carrera ?? ""}
                                        disabled={!selectedUniversidad}
                                        onChange={handleChange}
                                        onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm sm:text-sm ${errores.id_carrera ? "border-red-500" : "border-gray-300"
                                            }`}
                                    >
                                        <option value="">Seleccione carrera</option>
                                        {carreras
                                            .filter(c =>
                                                c.id_universidad === selectedUniversidad &&
                                                c.nombre.toLowerCase() !== "ninguna"
                                            )
                                            .map(c => (
                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                            ))
                                        }
                                    </select>
                                    {errores.id_carrera && <span className="text-red-500 text-xs mt-1">{errores.id_carrera}</span>}
                                </div>
                            </div>
                        )}

                        {/* DATOS LABORALES */}
                        {activeSection === "laborales" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700">Estado de empleo</label>
                                    <select
                                        name="estado_empleo"
                                        value={formData.estado_empleo}
                                        onChange={handleChange}
                                        onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                        className={`mt-1 block w-full p-2 border rounded-md shadow-sm sm:text-sm ${errores.estado_empleo ? "border-red-500" : "border-gray-300"
                                            }`}
                                    >
                                        <option value="">Seleccione estado</option>
                                        <option value="empleado">Empleado</option>
                                        <option value="desempleado">Desempleado</option>
                                    </select>
                                    {errores.estado_empleo && <span className="text-red-500 text-xs mt-1">{errores.estado_empleo}</span>}
                                </div>

                                {formData.estado_empleo === "empleado" && (
                                    <>
                                        <div className="flex flex-col">
                                            <label className="text-sm font-medium text-gray-700">Meses para conseguir empleo</label>
                                            <input
                                                type="number"
                                                name="tiempo_conseguir_empleo"
                                                maxLength={3}
                                                value={formData.tiempo_conseguir_empleo ?? ""}
                                                onChange={handleChange}
                                                onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                                min={0}
                                                className={`mt-1 block w-full p-2 border rounded-md shadow-sm sm:text-sm ${errores.tiempo_conseguir_empleo ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            />
                                            {errores.tiempo_conseguir_empleo && <span className="text-red-500 text-xs mt-1">{errores.tiempo_conseguir_empleo}</span>}
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-sm font-medium text-gray-700">Área laboral</label>
                                            <select
                                                name="area_laboral_id"
                                                value={formData.area_laboral_id ?? ""}
                                                onChange={handleChange}
                                                onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                                className={`mt-1 block w-full p-2 border rounded-md shadow-sm sm:text-sm ${errores.area_laboral_id ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            >
                                                <option value="">Seleccione área laboral</option>
                                                {areaLaborales.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                                            </select>
                                            {errores.area_laboral_id && <span className="text-red-500 text-xs mt-1">{errores.area_laboral_id}</span>}
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-sm font-medium text-gray-700">Rango salarial</label>
                                            <select
                                                name="salario_promedio"
                                                value={formData.salario_promedio ?? ""}
                                                onChange={handleChange}
                                                onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                                className={`mt-1 block w-full p-2 border rounded-md shadow-sm sm:text-sm ${errores.salario_promedio ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            >
                                                <option value="">Seleccione rango salarial</option>
                                                <option value="<300000">Menor a ₡300,000</option>
                                                <option value="300000-600000">₡300,000 - ₡600,000</option>
                                                <option value="600000-1000000">₡600,000 - ₡1,000,000</option>
                                                <option value=">1000000">Mayor a ₡1,000,000</option>
                                            </select>
                                            {errores.salario_promedio && <span className="text-red-500 text-xs mt-1">{errores.salario_promedio}</span>}
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-sm font-medium text-gray-700">Tipo de empleo</label>
                                            <select
                                                name="tipo_empleo"
                                                value={formData.tipo_empleo ?? ""}
                                                onChange={handleChange}
                                                onBlur={(e) => validarCampo(e.target.name, e.target.value)}
                                                className={`mt-1 block w-full p-2 border rounded-md shadow-sm sm:text-sm ${errores.tipo_empleo ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            >
                                                <option value="">Seleccione tipo</option>
                                                <option value="Tiempo completo">Tiempo completo</option>
                                                <option value="Medio tiempo">Medio tiempo</option>
                                                <option value="Temporal">Temporal</option>
                                                <option value="Independiente">Independiente</option>
                                                <option value="Práctica">Práctica</option>
                                            </select>
                                            {errores.tipo_empleo && <span className="text-red-500 text-xs mt-1">{errores.tipo_empleo}</span>}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}


                        {/* CAMBIO DE ROL A EGRESADO */}
                        {activeSection === "condicion" && (
                            <div className="w-full max-w-none space-y-6">
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

                                    {/* HEADER */}
                                    <div className="flex items-center gap-3 px-5 py-4 bg-yellow-50 border-b">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 text-yellow-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z"
                                            />
                                        </svg>

                                        <h4 className="text-lg font-semibold text-yellow-800">
                                            Cambio de condición académica
                                        </h4>
                                    </div>

                                    {/* BODY */}
                                    <div className="px-8 py-6 space-y-6 text-lg text-gray-700">
                                        <p className="leading-relaxed">
                                            Esta opción está destinada a usuarios que han finalizado su proceso
                                            académico y cumplen con la condición de <strong>Egresado</strong>.
                                            Al realizar este cambio, su perfil dejará de ser clasificado como{" "}
                                            <strong>Estudiante</strong>.
                                        </p>

                                        {/* DESPLEGABLE */}
                                        <details className="group">
                                            <summary className="cursor-pointer font-semibold text-red-700 flex items-center gap-2 text-lg">
                                                <span>¿Qué implica realizar este cambio?</span>
                                                <span className="transition-transform group-open:rotate-180">▼</span>
                                            </summary>

                                            <div className="mt-4 pl-6 space-y-2 text-gray-700 text-lg">
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li>Su perfil será actualizado a condición <strong>Egresado</strong>.</li>
                                                    <li>Se habilitarán las funcionalidades y beneficios exclusivos para egresados.</li>
                                                    <li>
                                                        La información académica y laboral será utilizada para análisis
                                                        institucionales y procesos de seguimiento.
                                                    </li>
                                                </ul>
                                            </div>
                                        </details>

                                        {/* ADVERTENCIA INSTITUCIONAL */}
                                        <div className="p-5 rounded-md bg-red-50 border-l-4 border-red-600">
                                            <p className="text-base text-red-700 leading-relaxed">
                                                <strong>Advertencia:</strong><br />
                                                La información registrada en el sistema debe ser real, veraz y
                                                actualizada. Los datos recopilados serán
                                                utilizados para análisis estadísticos, estudios de seguimiento
                                                académico y procesos de mejora continua que apoyan la toma de
                                                decisiones de la universidad.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* BOTÓN */}
                                <div className="flex justify-center">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={handleCambioEstudianteAEgresado}
                                        className="px-6 py-2 text-sm w-auto"
                                    >
                                        Cambiar condición a Egresado
                                    </Button>
                                </div>
                            </div>
                        )}


                    </form>
                </div>
            </div>
        </>
    );
}

// SectionLink (igual que en el admin)
const SectionLink = ({ title, active, onClick }: { title: string; active: boolean; onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className={`
      flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
      ${active ? "bg-red-100 text-red-700 font-bold border-l-4 border-red-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"}
    `}
    >
        {title}
    </button>
);

// Layout
EditarEstudiante.layout = (page: any) => <PpLayout userPermisos={page.props.userPermisos}>{page}</PpLayout>;
