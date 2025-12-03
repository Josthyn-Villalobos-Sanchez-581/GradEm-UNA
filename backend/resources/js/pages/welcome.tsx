import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import unaLogo from "../assets/logoUNA.png";
import grademLogo from "../assets/GradEm.png";
import { Button } from "@/components/ui/button";

// Imágenes del carrusel
import EstructuraImg from "../assets/Estructura_UNA-Welcome.png";
import LogoUnaWelcome from "../assets/LogoUnaWelcome.png";
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

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((i) => (i + 1) % IMAGENES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const anterior = () => {
        setIndex((i) => (i === 0 ? IMAGENES.length - 1 : i - 1));
    };

    const siguiente = () => {
        setIndex((i) => (i + 1) % IMAGENES.length);
    };

    return (
        <div className="min-h-screen bg-[#F6F6F6] flex flex-col">

            {/* NAVBAR */}
            <nav className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img src={grademLogo} className="h-12" />
                    <img src={unaLogo} className="h-12" />
                </div>

                <Button
                    onClick={() => router.get("/login")}
                    className="bg-[#CD1719] hover:bg-[#A71315] text-white px-6 py-2 rounded-md text-lg"
                >
                    Iniciar sesión
                </Button>
            </nav>

            {/* HERO */}
            <section className="flex flex-col items-center text-center mt-16 px-4">
                <h1 className="text-4xl md:text-5xl font-bold text-[#333] leading-tight">
                    Bienvenido a <span className="text-[#CD1719]">GradEm-SIUA</span>
                </h1>

                <p className="mt-4 text-lg md:text-xl text-[#555] max-w-2xl">
                    Plataforma integral para la gestión, seguimiento y desarrollo profesional
                    de los egresados de la Universidad Nacional – Sede Interuniversitaria de Alajuela.
                </p>

                <Button
                    onClick={() => router.get("/login")}
                    className="mt-8 bg-[#CD1719] hover:bg-[#A71315] text-white px-10 py-4 text-lg rounded-xl shadow-md transition-all"
                >
                    Comenzar ahora
                </Button>
            </section>

            {/* SUMMARY SECTION */}
            <section className="mt-20 px-6 md:px-12 lg:px-32">
                <h2 className="text-3xl font-semibold text-center text-[#333]">
                    ¿Qué ofrece la plataforma?
                </h2>
                <p className="text-center text-[#666] mt-3 max-w-3xl mx-auto">
                    Nuestro sistema conecta a los egresados con oportunidades laborales,
                    cursos, eventos y herramientas para su desarrollo profesional.
                </p>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center">
                        <h3 className="text-xl font-bold text-[#CD1719]">Seguimiento de Egresados</h3>
                        <p className="text-[#555] mt-2">
                            Mantenga actualizado su perfil y acceda a su información profesional.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center">
                        <h3 className="text-xl font-bold text-[#CD1719]">Bolsa de Empleo</h3>
                        <p className="text-[#555] mt-2">
                            Oportunidades laborales exclusivas para la comunidad universitaria.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center">
                        <h3 className="text-xl font-bold text-[#CD1719]">Cursos y Capacitaciones</h3>
                        <p className="text-[#555] mt-2">
                            Formación continua para mejorar su perfil profesional.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center">
                        <h3 className="text-xl font-bold text-[#CD1719]">Eventos y Noticias</h3>
                        <p className="text-[#555] mt-2">
                            Manténgase informado sobre las actividades de la institución.
                        </p>
                    </div>
                </div>
            </section>

            {/* === CARRUSEL MOVIDO AL FINAL === */}
            <section className="mt-20 px-4 flex justify-center">
                <div className="relative w-full max-w-5xl overflow-hidden">

                    <div className="relative w-full h-[280px] md:h-[360px] bg-transparent">
                        {IMAGENES.map((img, i) => (
                            <img
                                key={i}
                                src={img.src}
                                alt={img.alt}
                                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${index === i ? "opacity-100" : "opacity-0"
                                    }`}
                            />
                        ))}

                        {/* FLECHAS */}
                        <button
                            onClick={anterior}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60 text-black px-3 py-2 rounded-full transition"
                        >
                            ‹
                        </button>

                        <button
                            onClick={siguiente}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60 text-black px-3 py-2 rounded-full transition"
                        >
                            ›
                        </button>

                        {/* DOTS */}
                        <div className="absolute bottom-3 w-full flex justify-center gap-2">
                            {IMAGENES.map((_, i) => (
                                <button
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${index === i ? "bg-[#CD1719]" : "bg-gray-300"
                                        }`}
                                    onClick={() => setIndex(i)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="mt-20 bg-white py-10 shadow-inner">
                <div className="text-center text-sm text-[#777] leading-relaxed">
                    <p>Sistema de Gestión de Egresados – GradEm SIUA</p>
                    <p>Universidad Nacional de Costa Rica</p>
                    <p>Sede Interuniversitaria de Alajuela</p>
                </div>
            </footer>
        </div>
    );
};

export default Welcome;
