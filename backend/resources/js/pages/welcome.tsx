import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import unaLogo from "../assets/logoUNATopBar.png";
import grademLogo from "../assets/GradEmLayout.png";
import grademLogoOficial from "../assets/GradEm.png";
import { Button } from "@/components/ui/button";
import {
    UserPlus, LogIn, Briefcase, GraduationCap, Calendar,
    Users, ChevronLeft, ChevronRight, Building2, Search,
    FileText, BarChart3, Rocket, Menu, X
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

    return (
        <div className="min-h-screen bg-[#F6F6F6] font-sans text-[#000000] overflow-x-hidden">

            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 w-full z-50 bg-[#CD1719] shadow-lg border-b border-white/10">
                <div className="max-w-full mx-auto px-4 md:px-10 flex justify-between items-center h-20">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 md:gap-4 bg-white/5 p-2 rounded-2xl">
                            <img src={grademLogo} className="h-8 md:h-12" alt="GradEm" />
                            <div className="h-8 w-[1px] bg-white/20 hidden xs:block"></div>
                            <img src={unaLogo} className="h-8 md:h-12 hidden xs:block" alt="UNA" />
                        </div>

                        <div className="hidden lg:flex items-center gap-6 text-white/90 font-bold text-sm uppercase tracking-wider">
                            <button onClick={() => scrollToSection('egresados')} className="hover:text-white transition-colors cursor-pointer">Estudiantes/Egresados</button>
                            <button onClick={() => scrollToSection('empresas')} className="hover:text-white transition-colors cursor-pointer">Empresas</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        <Button variant="ghost" onClick={() => router.get("/login")} className="text-white hover:bg-white/20 font-bold px-2 md:px-4">
                            <LogIn className="w-5 h-5 md:w-4 md:h-4 md:mr-2" /> 
                            <span className="hidden md:inline">Iniciar sesión</span>
                        </Button>
                        <Button onClick={() => router.get("/registro")} className="bg-[#034991] hover:bg-[#023a74] text-white px-4 md:px-6 rounded-full font-bold border border-white/20 text-sm">
                            <UserPlus className="w-4 h-4 md:mr-2" /> 
                            <span className="hidden sm:inline">Registrarme</span>
                        </Button>
                        
                        {/* Botón Hamburguesa para Mobile */}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-white p-1">
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>

                {/* Menú Desplegable Mobile */}
                {isMenuOpen && (
                    <div className="lg:hidden bg-[#CD1719] px-6 py-4 flex flex-col gap-4 border-t border-white/10 animate-in slide-in-from-top">
                        <button onClick={() => scrollToSection('egresados')} className="text-white font-bold uppercase text-left">Estudiantes/Egresados</button>
                        <button onClick={() => scrollToSection('empresas')} className="text-white font-bold uppercase text-left">Empresas</button>
                    </div>
                )}
            </nav>

            {/* --- HERO SECTION --- */}
            <main className="pt-28 md:pt-40 pb-20 relative overflow-hidden">
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
                            <Button onClick={() => router.get("/login")} className="bg-[#CD1719] hover:bg-[#A71315] text-white px-8 md:px-10 py-6 md:py-7 text-lg md:text-xl rounded-[1.2rem] md:rounded-[1.5rem] shadow-xl font-bold">
                                Comenzar ahora
                            </Button>
                            <Button variant="outline" className="border-[#A7A7A9] text-[#000000] px-8 md:px-10 py-6 md:py-7 text-lg md:text-xl rounded-[1.2rem] md:rounded-[1.5rem] hover:bg-[#F6F6F6] transition-all border-2 font-bold">
                                Ver vacantes
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

            {/* --- SECCIÓN EGRESADOS --- */}
            <section id="egresados" className="py-16 md:py-24 bg-white rounded-t-[2rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12 md:mb-16 space-y-4">
                        <span className="text-[#CD1719] font-black uppercase tracking-[0.3em] text-xs md:text-sm">Comunidad Activa</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#000000]">Servicios para estudiantes y egresados</h2>
                        <p className="text-[#A7A7A9] max-w-2xl mx-auto text-base md:text-lg font-medium">Impulsamos tu crecimiento profesional.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-[#034991] rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 hover:shadow-2xl transition-all group relative overflow-hidden text-white">
                            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md group-hover:rotate-12 transition-transform">
                                <Briefcase className="text-white w-8 h-8" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-4">Bolsa de Empleo Exclusiva</h3>
                            <p className="text-white/80 text-base md:text-lg mb-6 max-w-md">Conectamos tu talento con las empresas más prestigiosas del país. Vacantes exclusivas para la comunidad UNA.</p>
                            <Button onClick={() => router.get("/login")} className="rounded-full bg-white text-[#034991] hover:bg-[#F6F6F6] font-bold px-8">
                                Explorar empleos
                            </Button>
                        </div>

                        <div className="bg-[#CD1719] rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl flex flex-col justify-between hover:scale-[1.02] transition-transform">
                            <div>
                                <GraduationCap className="w-12 h-12 mb-6 opacity-90" />
                                <h3 className="text-xl md:text-2xl font-bold mb-4 uppercase italic">Capacitación UNA</h3>
                                <p className="text-white/80 text-base italic">"La verdad nos hace libres"</p>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/20">
                                <span className="text-2xl md:text-3xl font-black">Cursos Activos</span>
                            </div>
                        </div>

                        <div className="bg-[#F6F6F6] border-2 border-[#A7A7A9]/20 rounded-[2rem] md:rounded-[2.5rem] p-8 hover:border-[#CD1719]/40 transition-all text-center flex flex-col items-center group">
                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:bg-[#CD1719]/10 transition-colors">
                                <Users className="text-[#CD1719] w-8 h-8" />
                            </div>
                            <h4 className="font-bold text-xl mb-2">Comunidad</h4>
                            <p className="text-[#A7A7A9] font-medium text-sm">Red de contactos profesional.</p>
                        </div>

                        <div className="bg-[#F6F6F6] border-2 border-[#A7A7A9]/20 rounded-[2rem] md:rounded-[2.5rem] p-8 hover:border-[#034991]/40 transition-all text-center flex flex-col items-center group">
                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:bg-[#034991]/10 transition-colors">
                                <Calendar className="text-[#034991] w-8 h-8" />
                            </div>
                            <h4 className="font-bold text-xl mb-2">Eventos</h4>
                            <p className="text-[#A7A7A9] font-medium text-sm">Talleres y ferias Sede Alajuela.</p>
                        </div>

                        <div className="bg-[#000000] rounded-[2rem] md:rounded-[2.5rem] p-8 transition-all text-center flex flex-col items-center justify-center group">
                            <div className="text-[#CD1719] font-black text-3xl mb-2 italic">CV</div>
                            <h4 className="font-bold text-xl mb-1 text-white">Mi Perfil</h4>
                            <p className="text-[#A7A7A9] text-xs font-bold uppercase tracking-tighter">Gestión de Currículum</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN EMPRESAS --- */}
            <section id="empresas" className="py-16 md:py-24 bg-[#F6F6F6] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-[#034991]/5 rounded-full blur-3xl" />
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12 md:mb-16 space-y-4">
                        <span className="text-[#034991] font-black uppercase tracking-[0.3em] text-xs md:text-sm">Alianzas Estratégicas</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#000000]">Soluciones para Empresas</h2>
                        <p className="text-[#A7A7A9] max-w-2xl mx-auto text-base md:text-lg font-medium">Encuentre el mejor talento humano formado en la Universidad Nacional.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-white border-2 border-[#A7A7A9]/10 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="space-y-6 flex-1 text-center md:text-left">
                                    <div className="bg-[#CD1719]/10 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform mx-auto md:mx-0">
                                        <Search className="text-[#CD1719] w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-[#000000]">Reclutamiento Especializado</h3>
                                    <p className="text-[#A7A7A9] text-base md:text-lg">Acceda a profesionales calificados en diversas áreas técnicas.</p>
                                    <Button onClick={() => router.get("/login")} className="rounded-full bg-[#CD1719] text-white hover:bg-[#A71315] font-bold px-8">
                                        Publicar Vacantes
                                    </Button>
                                </div>
                                <div className="hidden md:flex w-1/3 bg-[#F6F6F6] rounded-3xl p-6 border border-[#A7A7A9]/10 items-center justify-center">
                                    <BarChart3 className="w-20 h-20 text-[#034991]/20" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#034991] rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl flex flex-col justify-between hover:scale-[1.02] transition-transform">
                            <div>
                                <Rocket className="w-12 h-12 mb-6 text-white/90" />
                                <h3 className="text-xl md:text-2xl font-bold mb-4 uppercase tracking-tight">Marca Empleadora</h3>
                                <p className="text-white/80 text-base md:text-lg">Posicione su empresa dentro de la UNA.</p>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/20 flex items-center gap-2">
                                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest">Presencia Activa</span>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-[#A7A7A9]/20 rounded-[2rem] md:rounded-[2.5rem] p-8 hover:border-[#034991] transition-all text-center flex flex-col items-center group">
                            <div className="bg-[#F6F6F6] w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#034991] group-hover:text-white transition-all">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <h4 className="font-bold text-lg mb-2">Perfil Empresa</h4>
                            <p className="text-[#A7A7A9] text-xs uppercase font-bold">Gestión de Info</p>
                        </div>

                        <div className="bg-white border-2 border-[#A7A7A9]/20 rounded-[2rem] md:rounded-[2.5rem] p-8 hover:border-[#034991] transition-all text-center flex flex-col items-center group">
                            <div className="bg-[#F6F6F6] w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#034991] group-hover:text-white transition-all">
                                <Users className="w-8 h-8" />
                            </div>
                            <h4 className="font-bold text-lg mb-2">Filtros</h4>
                            <p className="text-[#A7A7A9] text-xs uppercase font-bold">Habilidades</p>
                        </div>

                        <div className="bg-[#000000] rounded-[2rem] md:rounded-[2.5rem] p-8 text-center flex flex-col items-center justify-center group border border-white/10">
                            <FileText className="text-[#CD1719] w-8 h-8 mb-3" />
                            <h4 className="font-bold text-lg mb-1 text-white">Estadísticas</h4>
                            <p className="text-[#A7A7A9] text-[10px] font-bold uppercase tracking-widest">Métricas</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-white border-t border-[#A7A7A9]/20 py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10 md:gap-12">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <img src={grademLogoOficial} className="h-10 md:h-12 mb-4 opacity-80" alt="Footer Logo" />
                        <p className="text-[#A7A7A9] text-xs font-bold uppercase tracking-widest">© 2026 Universidad Nacional</p>
                    </div>
                    <div className="text-center md:text-right space-y-2">
                        <p className="font-black text-[#000000] uppercase text-base md:text-lg tracking-tighter">Sede Interuniversitaria de Alajuela</p>
                        <p className="text-[#CD1719] text-sm font-bold italic">"La verdad nos hace libres"</p>
                        <div className="flex justify-center md:justify-end gap-6 md:gap-8 mt-6 text-[#A7A7A9] text-[10px] font-black uppercase tracking-[0.2em]">
                            <a href="#" className="hover:text-[#CD1719] transition-colors">Privacidad</a>
                            <a href="#" className="hover:text-[#034991] transition-colors">Contacto</a>
                            <a href="#" className="hover:text-[#CD1719] transition-colors">UNA.ac.cr</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Welcome;