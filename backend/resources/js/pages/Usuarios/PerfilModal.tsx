// backend/resources/js/pages/Usuarios/PerfilModal.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useModal } from "@/hooks/useModal";
import FotoXDefecto from "@/assets/FotoXDefecto.png";

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
  usuarioId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function PerfilModal({ usuarioId, isOpen, onClose }: Props) {
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [mostrarCV, setMostrarCV] = useState(false);
  const modal = useModal();

 useEffect(() => {
  if (!isOpen) return;

  setMostrarCV(false); // solo cerramos CV, no limpiamos perfil

  const cargarPerfil = async () => {
    try {
      const res = await axios.get(`/usuarios/${usuarioId}/perfil-json`);
      setPerfil(res.data.usuario);
    } catch (error: any) {
      console.error(error);
      modal.alerta({
        titulo: "Error",
        mensaje: "No se pudo cargar el perfil del usuario.",
      });
      onClose();
    }
  };

  cargarPerfil();
}, [usuarioId, isOpen]);

  if (!isOpen || !perfil) return null;

  const fotoPerfilUrl = perfil.fotoPerfil?.ruta_imagen || FotoXDefecto;

  const renderValor = (valor: any) =>
    valor ? <span>{valor}</span> : <span className="text-gray-400 italic">N/A</span>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full md:w-3/4 max-h-[90vh] overflow-y-auto p-6 relative shadow-lg">
        {/* Botón cerrar */}
       <button
  onClick={() => {
    setPerfil(null);
    setMostrarCV(false);
    onClose();
  }}
  className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl font-bold"
>
  ×
</button>


        {/* Contenido */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Columna izquierda: Foto */}
          <div className="flex flex-col items-center md:w-1/3">
            <div className="h-48 w-48 overflow-hidden rounded-lg border border-gray-300 shadow-sm mb-4">
              <img src={fotoPerfilUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Columna derecha: Información */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">{perfil.nombre_completo}</h2>

            {/* Datos personales */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
              <h3 className="font-semibold mb-2">Datos personales</h3>
              <p><strong>Correo:</strong> {renderValor(perfil.correo)}</p>
              <p><strong>Teléfono:</strong> {renderValor(perfil.telefono)}</p>
              <p><strong>Identificación:</strong> {renderValor(perfil.identificacion)}</p>
              <p><strong>Fecha de Nacimiento:</strong> {renderValor(perfil.fecha_nacimiento)}</p>
              <p><strong>Género:</strong> {renderValor(perfil.genero)}</p>
            </div>

            {/* Datos académicos */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
              <h3 className="font-semibold mb-2">Datos académicos</h3>
              <p><strong>Estado de estudios:</strong> {renderValor(perfil.estado_estudios)}</p>
              <p><strong>Nivel académico:</strong> {renderValor(perfil.nivel_academico)}</p>
              <p><strong>Año de graduación:</strong> {renderValor(perfil.anio_graduacion)}</p>
              <p><strong>Universidad:</strong> {renderValor(perfil.universidad?.nombre)}</p>
              <p><strong>Carrera:</strong> {renderValor(perfil.carrera?.nombre)}</p>
            </div>

            {/* Datos laborales */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
              <h3 className="font-semibold mb-2">Datos laborales</h3>
              <p><strong>Estado de empleo:</strong> {renderValor(perfil.estado_empleo)}</p>
              {perfil.estado_empleo?.toLowerCase() === "empleado" && (
                <>
                  <p><strong>Tiempo para conseguir empleo:</strong> {renderValor(perfil.tiempo_conseguir_empleo)}</p>
                  <p><strong>Área laboral:</strong> {renderValor(perfil.area_laboral_id)}</p>
                  <p><strong>Salario promedio:</strong> {renderValor(perfil.salario_promedio)}</p>
                  <p><strong>Tipo de empleo:</strong> {renderValor(perfil.tipo_empleo)}</p>
                </>
              )}
            </div>

            {/* Currículum */}
            {perfil.curriculum?.ruta_archivo_pdf && (
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
                      src={perfil.curriculum.ruta_archivo_pdf}
                      type="application/pdf"
                      className="w-full h-[600px]"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
