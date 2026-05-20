// backend/resources/js/pages/welcome.tsx
import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import unaLogo from "../assets/logoUNATopBar.png";
import grademLogo from "../assets/GradEmLayout.png";
import grademLogoOficial from "../assets/GradEm.png";
import { Button } from "@/components/ui/button";
import {
    UserPlus, LogIn, Briefcase, GraduationCap, Calendar,
    Users, ChevronLeft, ChevronRight, Building2, Search,
    FileText, BarChart3, Rocket, Menu, X, ArrowRight, CheckCircle2, Network, FileUserIcon
} from "lucide-react";

// Imágenes del carrusel
import EstructuraImg from "../assets/Estructura_UNA-Welcome.png";
import LogoUnaWelcome from "../assets/logoUNA.png";
import MedallaUnaWelcome from "../assets/MedallaUnaWelcome.png";
import SedeWelcome from "../assets/SedeWelcome.png";
import SiuaLogoWelcome from "../assets/siuaLogoWelcome.png";

const IMAGENES = [
    { src: EstructuraImg, alt: "Estructura UNA" },
    { src: LogoUnaWelcome, alt: "Logo UNA" },
    { src: MedallaUnaWelcome, alt: "Medalla UNA" },
    { src: SedeWelcome, alt: "Sede UNA" },
    { src: SiuaLogoWelcome, alt: "Logo SIUA" },
];

const Welcome = () => {
    const [index, setIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú móvil

    const scrollToSection = (id: string) => {
        setIsMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((i) => (i + 1) % IMAGENES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const anterior = () => setIndex((i) => (i === 0 ? IMAGENES.length - 1 : i - 1));
    const siguiente = () => setIndex((i) => (i + 1) % IMAGENES.length);
    const [mostrarModalBeneficios, setMostrarModalBeneficios] = useState(false);

    return (
        <div className="min-h-screen bg-[#F6F6F6] font-sans text-[#000000] overflow-x-hidden">

            {/* --- NAVBAR --- */}
            <nav
                className="
                    fixed top-0 w-full z-50 h-20
                    bg-gradient-to-r 
                    from-[#5C0A0D] 
                    via-[#8E1215] 
                    to-[#CD1719]
                    shadow-md border-b border-black/20
                    backdrop-blur-[2px]"
            >
                {/* Overlay igual al layout */}
                <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

                <div className="relative max-w-full mx-auto px-4 md:px-10 flex justify-between items-center h-full">

                    {/* LOGOS */}
                    <div className="flex items-center gap-3">
                        <img src={unaLogo} className="h-10 md:h-14" />
                        <img src={grademLogo} className="h-10 md:h-14" />
                    </div>

                    {/* ACCIONES */}
                    <div className="flex items-center gap-2 md:gap-3">

                        <Button
                            variant="outline"
                            onClick={() => router.get("/login")}
                            className="text-white border-white/30 hover:bg-white/20"
                        >
                            <LogIn className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Iniciar sesión</span>
                        </Button>

                        <Button
                            onClick={() => router.get("/registro")}
                            className="
                    bg-white text-[#CD1719] 
                    hover:bg-gray-100 
                    font-bold rounded-full px-4 md:px-6
                "
                        >
                            <UserPlus className="w-4 h-4 md:mr-2" />
                            <span className="hidden sm:inline">Registrarme</span>
                        </Button>

                        {/* MOBILE */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden text-white"
                        >
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>

                {/* MENÚ MOBILE */}
                {isMenuOpen && (
                    <div className="lg:hidden bg-[#8E1215] px-6 py-4 flex flex-col gap-4 border-t border-white/10">
                        <button onClick={() => scrollToSection('egresados')} className="text-white font-bold uppercase text-left">
                            Estudiantes/Egresados
                        </button>
                        <button onClick={() => scrollToSection('empresas')} className="text-white font-bold uppercase text-left">
                            Empresas
                        </button>
                    </div>
                )}
            </nav>

            {/* Modal de Beneficios */}
            {mostrarModalBeneficios && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

                    <div className="bg-white w-full max-w-lg mx-4 rounded-3xl shadow-2xl p-8 relative animate-fadeIn">

                        {/* Cerrar */}
                        <button
                            onClick={() => setMostrarModalBeneficios(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black"
                        >
                            <X size={24} />
                        </button>

                        {/* CONTENIDO */}
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-black text-[#CD1719] mb-2">
                                Beneficios de registrarte
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Todo lo que obtienes al ser parte de GradEm
                            </p>
                        </div>

                        {/* LISTA */}
                        <div className="space-y-4">
                            {[
                                "Acceso a bolsa de empleo exclusiva",
                                "Creación automática de currículum profesional",
                                "Postulación rápida a ofertas laborales",
                                "Acceso a cursos y capacitaciones",
                                "Participación en eventos y ferias",
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="bg-[#CD1719]/10 text-[#CD1719] p-2 rounded-lg">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <Button
                            onClick={() => router.get("/registro")}
                            className="w-full mt-6 bg-[#CD1719] hover:bg-[#A71315] text-white rounded-xl h-12 font-bold"
                        >
                            Crear mi cuenta
                        </Button>

                    </div>
                </div>
            )
            }

            {/* --- HERO SECTION --- */}
            <main className="pt-28 md:pt-40 pb-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#CD1719]/5 rounded-full blur-3xl opacity-50 -z-10" />
                <section className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left space-y-6 md:space-y-8">
                        <div className="inline-flex items-center bg-[#CD1719]/10 text-[#CD1719] px-4 py-1.5 rounded-full text-xs md:text-sm font-bold tracking-wide uppercase">
                            Sede Interuniversitaria Alajuela
                        </div>
                        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-[#000000] leading-tight">
                            Tu futuro profesional, <br />
                            <span className="text-[#CD1719] relative">
                                empieza aquí.
                                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 10" fill="none">
                                    <path d="M1 9C50 3 150 3 299 9" stroke="#034991" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-[#000000]/70 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            La plataforma definitiva para el seguimiento, empleo y capacitación de los egresados de la
                            <strong className="text-[#034991]"> Universidad Nacional</strong>.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                            <Button onClick={() => router.get("/login") /* generic login */} className="bg-[#CD1719] hover:bg-[#A71315] text-white px-8 md:px-10 py-6 md:py-7 text-lg md:text-xl rounded-[1.2rem] md:rounded-[1.5rem] shadow-xl font-bold">
                                Comenzar ahora
                            </Button>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="relative aspect-[4/3] bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border-4 md:border-8 border-white">
                            {IMAGENES.map((img, i) => (
                                <img
                                    key={i}
                                    src={img.src}
                                    alt={img.alt}
                                    className={`absolute inset-0 w-full h-full object-contain p-4 md:p-8 transition-all duration-1000 ease-in-out ${index === i ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
                                />
                            ))}
                            <button onClick={anterior} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 text-[#CD1719] p-2 rounded-full shadow-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"><ChevronLeft /></button>
                            <button onClick={siguiente} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 text-[#CD1719] p-2 rounded-full shadow-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"><ChevronRight /></button>
                        </div>
                    </div>
                </section>
            </main>

            {/* --- SECCIÓN DE ACCESO RÁPIDO --- */}
            <section className="bg-white py-10 border-b border-[#A7A7A9]/10">
                <div className="max-w-6xl mx-auto px-6">

                    {/* HEADER */}
                    <div className="text-center mb-6">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#A7A7A9]">
                            Información General
                        </p>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-[#000000] mt-2">
                            Explora la plataforma
                        </h2>
                    </div>

                    {/* ATAJOS */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            {
                                id: "egresados",
                                titulo: "Empleo",
                                icon: Briefcase,
                                color: "#034991"
                            },
                            {
                                id: "cv",
                                titulo: "Currículum",
                                icon: FileText,
                                color: "#000000"
                            },
                            {
                                id: "cursos",
                                titulo: "Cursos",
                                icon: GraduationCap,
                                color: "#8E1215"
                            },
                            {
                                id: "cursos",
                                titulo: "Eventos",
                                icon: Calendar,
                                color: "#CD1719"
                            },
                            {
                                id: "empresas",
                                titulo: "Empresas",
                                icon: Building2,
                                color: "#034991"
                            }
                        ].map((item, i) => (
                            <button
                                key={i}
                                onClick={() => scrollToSection(item.id)}
                                className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-[#F6F6F6] hover:scale-105 hover:shadow-md transition-all"
                            >
                                <div
                                    className="p-3 rounded-xl text-white mb-2 group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: item.color }}
                                >
                                    <item.icon size={22} />
                                </div>
                                <span className="text-xs font-bold text-center">
                                    {item.titulo}
                                </span>
                            </button>
                        ))}
                    </div>

                </div>
            </section>

            {/* --- SECCIÓN EGRESADOS (ESTILO BENTO) --- */}
            <section id="egresados" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-black mb-4">Potencia tu perfil <span className="text-[#CD1719]">Egresado</span></h2>
                            <p className="text-gray-500 text-lg">Herramientas diseñadas para acelerar tu inserción laboral y crecimiento profesional.</p>
                        </div>
                        <Button
                            variant="link"
                            onClick={() => setMostrarModalBeneficios(true)}
                            className="text-[#CD1719] font-bold p-0 h-auto"
                        >
                            Ver beneficios para estudiantes
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-12 gap-6">
                        <div className="md:col-span-8 bg-[#034991] rounded-[2rem] p-8 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="relative z-10 flex flex-col h-full justify-between min-h-[240px]">
                                <div className="bg-white/10 w-fit p-3 rounded-2xl backdrop-blur-md mb-6">
                                    <Briefcase size={32} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold mb-2">Bolsa de Empleo UNA</h3>
                                    <p className="text-blue-100 max-w-md">Accede a vacantes exclusivas de empresas que buscan el sello de calidad de la Universidad Nacional.</p>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
                        </div>

                        <div className="md:col-span-4 bg-[#F6F6F6] rounded-[2rem] p-8 border border-gray-100 hover:border-[#CD1719]/30 transition-all group">
                            <Users className="text-[#CD1719] mb-6 group-hover:scale-110 transition-transform" size={40} />
                            <h3 className="text-2xl font-bold mb-3 text-[#1A1A1A]">Networking</h3>
                            <p className="text-gray-500 mb-6">Conéctate con otros profesionales y amplia tu red de contactos estratégicos.</p>
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />)}
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-[#CD1719] flex items-center justify-center text-[10px] text-white font-bold"><Network size={18} /></div>
                            </div>
                        </div>

                        <div className="md:col-span-12 lg:col-span-4 bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group">
                            <Search className="text-[#034991] mb-6 group-hover:rotate-12 transition-transform" size={32} />
                            <h3 className="text-xl font-bold mb-2">Búsqueda Inteligente</h3>
                            <p className="text-gray-500">Filtros avanzados por sede, carrera y modalidad de trabajo.</p>
                        </div>

                        <div className="md:col-span-12 lg:col-span-8 bg-gradient-to-br from-[#CD1719] to-[#8E1215] rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-bold mb-2">¿Listo para empezar?</h3>
                                <p className="opacity-90">Tu próximo gran reto profesional te está esperando.</p>
                            </div>
                            <Button
                                onClick={() => router.get("/registro")}
                                className="bg-white text-[#CD1719] hover:bg-gray-100 rounded-xl px-10 h-12 font-bold shrink-0"
                            >
                                Registrar nuevo perfil
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN CV (IMPACTANTE) --- */}
            <section id="cv" className="py-24 bg-[#F9FAFB]">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 relative">
                        <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="space-y-4">
                                <div className="flex gap-4 items-center border-b pb-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 bg-gray-50 rounded w-full" />
                                    <div className="h-2 bg-gray-50 rounded w-full" />
                                    <div className="h-2 bg-gray-50 rounded w-2/3" />
                                </div>
                                <div className="pt-4 flex flex-wrap gap-2">
                                    <div className="px-3 py-1 bg-blue-50 text-[#034991] text-[10px] rounded-full font-bold uppercase tracking-wider">React</div>
                                    <div className="px-3 py-1 bg-red-50 text-[#CD1719] text-[10px] rounded-full font-bold uppercase tracking-wider">Management</div>
                                    <div className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] rounded-full font-bold uppercase tracking-wider">English C1</div>
                                </div>
                            </div>
                        </div>
                        {/* Overlay Card */}
                        <div className="absolute -bottom-10 -right-6 md:right-10 bg-[#034991] text-white p-6 rounded-2xl shadow-xl -rotate-2 hover:rotate-0 transition-all">
                            <CheckCircle2 className="mb-2 text-blue-300" size={24} />
                            <p className="font-bold text-lg">Altamente Eficientes</p>
                            <p className="text-xs opacity-70">Perfil optimizado para ATS</p>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 space-y-6 text-center lg:text-left">
                        <h2 className="text-4xl font-black leading-tight text-[#1A1A1A]">
                            Tus logros merecen un <br />
                            <span className="text-[#CD1719]">Diseño Profesional</span>
                        </h2>
                        <p className="text-gray-500 text-lg">No te preocupes por el formato. Nosotros nos encargamos de que tu CV destaque entre la multitud.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            {[
                                { title: "Generador Automático", icon: Rocket },
                                { title: "Exportación en PDF", icon: FileText },
                                { title: "Optimizado para Reclutadores", icon: Users },
                                { title: "Acceso directo en línea", icon: ArrowRight },
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors">
                                    <div className="bg-[#CD1719]/10 p-2 rounded-lg text-[#CD1719]">
                                        <feature.icon size={18} />
                                    </div>
                                    <span className="font-bold text-sm text-[#1A1A1A]">{feature.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN CURSOS (GRIDS CON IMÁGENES O ICONOS) --- */}
            <section id="cursos" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-4xl font-black mb-4">Formación y <span className="text-[#034991]">Eventos</span></h2>
                        <p className="text-gray-500">Nunca dejes de aprender. Accede a recursos exclusivos para mantenerte competitivo.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="group bg-gradient-to-br from-[#CD1719] to-[#8E1215] p-10 rounded-[2.5rem] text-white shadow-xl hover:shadow-[#CD1719]/20 transition-all flex flex-col justify-between overflow-hidden relative">
                            <div className="relative z-10">
                                <GraduationCap size={48} className="mb-6" />
                                <h3 className="text-3xl font-bold mb-4">Capacitación Continua</h3>
                                <p className="text-white/80 text-lg mb-8 max-w-md">Cursos técnicos, talleres de habilidades blandas y certificaciones avaladas por la UNA.</p>
                            </div>
                            <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 opacity-10 group-hover:scale-110 transition-transform">
                                <GraduationCap size={240} />
                            </div>
                        </div>

                        <div className="group bg-[#F6F6F6] p-10 rounded-[2.5rem] border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden">
                            <div>
                                <Calendar size={48} className="text-[#034991] mb-6" />
                                <h3 className="text-3xl font-bold mb-4 text-[#1A1A1A]">Próximos Eventos</h3>
                                <p className="text-gray-500 text-lg mb-8 max-w-md">Ferias de empleo, charlas de expertos y webinars.</p>
                            </div>
                            <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 opacity-10 group-hover:scale-110 transition-transform">
                                <Calendar size={240} />
                            </div>  
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN EMPRESAS --- */}
            <section id="empresas" className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-[#1A1A1A] rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-20 hidden lg:block">
                            <Building2 size={200} />
                        </div>

                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">¿Buscas el mejor <br /><span className="text-[#CD1719]">Talento Humano?</span></h2>
                            <p className="text-gray-400 text-lg mb-10">Une tu empresa a nuestra red y conecta directamente con graduados de excelencia formados en una de las mejores universidades de la región.</p>

                            <div className="grid sm:grid-cols-2 gap-8 mb-10">
                                <div className="space-y-2">
                                    <h4 className="text-[#CD1719] font-black text-xl flex items-center gap-2"><FileText size={20} /> Publicación</h4>
                                    <p className="text-sm text-gray-500">Gestión simplificada de ofertas laborales.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-[#034991] font-black text-xl flex items-center gap-2"><BarChart3 size={20} /> Análisis</h4>
                                    <p className="text-sm text-gray-500">Métricas avanzadas de tus procesos de selección.</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => router.get("/registro")}
                                className="bg-[#CD1719] hover:bg-[#A71315] rounded-2xl h-14 px-10 text-lg font-black transition-all hover:scale-105"
                            >
                                Registrar mi Empresa
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-white border-t border-[#A7A7A9]/20 py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10 md:gap-12">

                    {/* Lado Izquierdo: Logo y Copyright */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <img src={grademLogoOficial} className="h-10 md:h-12 mb-4 opacity-80" alt="Footer Logo" />
                        <p className="text-[#A7A7A9] text-xs font-bold uppercase tracking-widest">© 2026 Universidad Nacional</p>
                    </div>

                    {/* Lado Derecho: Info Institucional y Enlaces */}
                    <div className="text-center md:text-right space-y-2">
                        <p className="font-black text-[#000000] uppercase text-base md:text-lg tracking-tighter">Sede Interuniversitaria de Alajuela</p>
                        <p className="text-[#CD1719] text-sm font-bold italic">"La verdad nos hace libres"</p>

                        {/* Enlaces actualizados */}
                        <div className="flex justify-center md:justify-end gap-6 md:gap-8 pt-4 text-[#A7A7A9] text-[10px] font-black uppercase tracking-[0.2em]">
                            <a href="mailto:gradem.una@gmail.com" className="hover:text-[#034991] transition-colors flex items-center gap-1">
                                Contacto: gradem.una@gmail.com
                            </a>
                            <a href="https://www.una.ac.cr" target="_blank" rel="noopener noreferrer" className="hover:text-[#CD1719] transition-colors">
                                UNA.ac.cr
                            </a>
                        </div>
                    </div>

                </div>
            </footer>
        </div>
    );
};

export default Welcome;