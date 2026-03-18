import { X, ChevronDown } from "lucide-react";
import { useState } from "react";

interface Props {
    open: boolean;
    onClose: () => void;
}

interface SectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = false }: SectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div
            className="
        rounded-xl border border-gray-200 
        bg-white shadow-sm 
        transition hover:shadow-md
      "
        >
            <button
                onClick={() => setOpen(!open)}
                className="
          w-full flex items-center justify-between
          px-5 py-3
          text-sm font-semibold
          text-gray-800
        "
            >
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#CD1719]" />
                    {title}
                </span>

                <ChevronDown
                    size={18}
                    className={`
            transition-transform duration-300
            ${open ? "rotate-180 text-[#CD1719]" : "text-gray-400"}
          `}
                />
            </button>

            <div
                className={`
          transition-all duration-300 overflow-hidden
          ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
            >
                <div className="px-5 pb-4 text-sm text-gray-700 space-y-1 border-t">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function SystemInfoModal({ open, onClose }: Props) {
    if (!open) return null;

    return (
        <>
            {/* OVERLAY */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
                onClick={onClose}
            />

            {/* CONTENEDOR */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 pointer-events-none">
                <div
                    className="
            pointer-events-auto
            w-full max-w-4xl
            max-h-[90vh]
            bg-white
            rounded-2xl
            shadow-2xl
            overflow-hidden
            flex flex-col
            border border-gray-200
          "
                >
                    {/* HEADER */}
                    <div
                        className="
              px-6 py-4
              flex items-center justify-between
              bg-gradient-to-r from-[#CD1719] via-[#B01517] to-[#7A0F13]
              text-white
            "
                    >
                        <div>
                            <h2 className="text-lg font-bold tracking-wide">
                                Sistema GradEm
                            </h2>
                            <p className="text-xs text-white/80">
                                Documento técnico del sistema
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="hover:bg-white/20 p-2 rounded-lg transition"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {/* BODY */}
                    <div className="p-6 overflow-y-auto space-y-4 bg-gray-50">

                        {/* 1 */}
                        <Section title="1. Identificación del Sistema" defaultOpen>
                            <p><strong>Nombre:</strong> GradEm-UNA</p>
                            <p><strong>Versión:</strong> 1.0.0</p>
                            <p><strong>Fecha:</strong> Marzo 2026</p>
                            <p><strong>Institución:</strong> Universidad Nacional de Costa Rica</p>
                            <p><strong>Dependencia:</strong> Escuela de Informática</p>
                            <p><strong>Proyecto:</strong> SIUA</p>
                        </Section>

                        {/* 2 */}
                        <Section title="2. Descripción General">
                            <p>
                                Plataforma institucional para la gestión académica y profesional
                                de estudiantes y egresados, facilitando su vinculación con el sector
                                empresarial.
                            </p>
                        </Section>

                        {/* 3 */}
                        <Section title="3. Objetivos del Sistema">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Centralizar información académica.</li>
                                <li>Facilitar inserción laboral.</li>
                                <li>Gestionar eventos y cursos.</li>
                                <li>Generar reportes institucionales.</li>
                            </ul>
                        </Section>

                        {/* 4 */}
                        <Section title="4. Tecnologías Utilizadas">
                            <ul className="list-disc list-inside space-y-1">
                                <li>React + TypeScript + Inertia.js</li>
                                <li>Laravel 12</li>
                                <li>MySQL</li>
                                <li>TailwindCSS</li>
                                <li>DomPDF</li>
                            </ul>
                        </Section>

                        {/* 5 */}
                        <Section title="5. Equipo de Desarrollo">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Jairo Valverde Ramírez</li>
                                <li>Gerald Huertas Rodríguez</li>
                                <li>Kevin Beita Marin</li>
                                <li>Froylan Rivera Salas</li>
                                <li>Josthyn Villalobos Sanchez</li>
                            </ul>
                        </Section>

                        {/* 6 */}
                        <Section title="6. Funcionalidades Principales">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Gestión de currículum.</li>
                                <li>Ofertas laborales.</li>
                                <li>Cursos y eventos.</li>
                                <li>Roles y permisos.</li>
                                <li>Auditoría.</li>
                            </ul>
                        </Section>

                        {/* 7 */}
                        <Section title="7. Información de Contacto">
                            <p><strong>Correo:</strong> gradem@una.ac.cr</p>
                            <p><strong>Sede:</strong> SIUA - Alajuela</p>
                        </Section>

                    </div>
                </div>
            </div>
        </>
    );
}