// backend/resources/js/pages/Usuarios/VerPerfil.tsx
import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import EnlacesExternos from "@/pages/Perfil/EnlacesExternos"; // ✅ Import correcto

interface FotoPerfil {
  ruta_imagen: string;
}

interface Curriculum {
  id_curriculum: number;
  ruta_archivo_pdf: string;
}

interface Universidad {
  nombre: string;
}

interface Carrera {
  nombre: string;
}

interface Plataforma {
  id_plataforma: number;
  tipo: string;
  url: string;
}

interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  identificacion: string;
  telefono: string;
  fecha_nacimiento?: string;
  genero?: string;
  estado_empleo?: string;
  estado_estudios?: string;
  anio_graduacion?: number | null;
  nivel_academico?: string | null;
  tiempo_conseguir_empleo?: number | null;
  area_laboral_id?: number | null;
  salario_promedio?: string | null;
  tipo_empleo?: string | null;
  universidad?: Universidad | null;
  carrera?: Carrera | null;
  fotoPerfil?: FotoPerfil | null;
  curriculum?: Curriculum | null;
}

interface Props {
  usuario: Usuario;
  plataformas: Plataforma[];
  userPermisos: number[];
}

export default function VerPerfil({ usuario, plataformas }: Props) {
  const [mostrarCV, setMostrarCV] = useState(false);

  const fotoPerfilUrl = usuario.fotoPerfil?.ruta_imagen || FotoXDefecto;

  const renderValor = (valor: any) =>
    valor ? <span className="text-black">{valor}</span> : <span className="text-gray-400 italic">N/A</span>;

  return (
    <>
      <Head title={`Perfil de ${usuario.nombre_completo}`} />

      <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-200">
          <h2 className="text-2xl font-bold text-[#034991]">Perfil del Usuario</h2>
          <Link
            href="/usuarios/perfiles"
            className="px-4 py-2 rounded shadow text-white font-semibold transition"
            style={{ backgroundColor: "#A7A7A9" }}
          >
            Volver
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Columna izquierda: Foto */}
          <div className="flex flex-col items-center md:w-1/3">
            <div className="h-48 w-48 overflow-hidden rounded-lg border border-gray-300 shadow-sm mb-4">
              <img src={fotoPerfilUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Columna derecha */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4 text-black">{usuario.nombre_completo}</h2>

            {/* Datos personales */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
              <h3 className="font-semibold mb-2 text-black">Datos personales</h3>
              <p><strong className="text-black">Correo:</strong> {renderValor(usuario.correo)}</p>
              <p><strong className="text-black">Teléfono:</strong> {renderValor(usuario.telefono)}</p>
              <p><strong className="text-black">Identificación:</strong> {renderValor(usuario.identificacion)}</p>
              <p><strong className="text-black">Fecha de Nacimiento:</strong> {renderValor(usuario.fecha_nacimiento)}</p>
              <p><strong className="text-black">Género:</strong> {renderValor(usuario.genero)}</p>
            </div>

            {/* Datos académicos */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
              <h3 className="font-semibold mb-2 text-black">Datos académicos</h3>
              <p><strong className="text-black">Estado de estudios:</strong> {renderValor(usuario.estado_estudios)}</p>
              <p><strong className="text-black">Nivel académico:</strong> {renderValor(usuario.nivel_academico)}</p>
              <p><strong className="text-black">Año de graduación:</strong> {renderValor(usuario.anio_graduacion)}</p>
              <p><strong className="text-black">Universidad:</strong> {renderValor(usuario.universidad?.nombre)}</p>
              <p><strong className="text-black">Carrera:</strong> {renderValor(usuario.carrera?.nombre)}</p>
            </div>

            {/* Datos laborales */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
              <h3 className="font-semibold mb-2 text-black">Datos laborales</h3>
              <p><strong className="text-black">Estado de empleo:</strong> {renderValor(usuario.estado_empleo)}</p>
              {usuario.estado_empleo?.toLowerCase() === "empleado" && (
                <>
                  <p><strong className="text-black">Tiempo para conseguir empleo:</strong> {renderValor(usuario.tiempo_conseguir_empleo)}</p>
                  <p><strong className="text-black">Área laboral:</strong> {renderValor(usuario.area_laboral_id)}</p>
                  <p><strong className="text-black">Salario promedio:</strong> {renderValor(usuario.salario_promedio)}</p>
                  <p><strong className="text-black">Tipo de empleo:</strong> {renderValor(usuario.tipo_empleo)}</p>
                </>
              )}
            </div>

            {/* Currículum */}
            {usuario.curriculum?.ruta_archivo_pdf && (
              <div className="mt-4">
                <button
                  onClick={() => setMostrarCV(!mostrarCV)}
                  className="bg-[#034991] hover:bg-[#0563c1] text-white font-semibold px-4 py-2 rounded shadow text-center"
                >
                  {mostrarCV ? "Ocultar Currículum" : "Ver Currículum"}
                </button>

                {mostrarCV && (
                  <div className="mt-3 border rounded-lg shadow overflow-hidden">
                    <embed
                      src={usuario.curriculum.ruta_archivo_pdf}
                      type="application/pdf"
                      className="w-full h-[600px]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 🔗 Enlaces a plataformas externas */}
            <div className="mt-6">
              <EnlacesExternos
                enlaces={plataformas || []}
                usuario={usuario}
                soloLectura={true} // 👈 modo lectura solo
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ✅ Layout principal
VerPerfil.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
