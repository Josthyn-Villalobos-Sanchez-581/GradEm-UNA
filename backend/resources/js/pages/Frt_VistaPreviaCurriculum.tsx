// resources/js/pages/Frt_VistaPreviaCurriculum.tsx

import React from 'react';
import type { FormCV } from '../types/curriculum';

interface VistaPreviaProps {
  datos: FormCV;
  fotoPerfilUrl?: string; // ⭐ NUEVO: Recibir la URL de la foto
}

export default function Frt_VistaPreviaCurriculum({ datos, fotoPerfilUrl }: VistaPreviaProps) {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#034991] mb-4">Vista Previa</h2>
      
      {/* ⭐ NUEVO: Foto de Perfil + Datos Personales */}
      <div className="mb-4 flex items-start gap-4">
        {/* Foto de perfil */}
        {datos.incluirFotoPerfil && fotoPerfilUrl && (
          <div className="flex-shrink-0">
            <img
              src={fotoPerfilUrl}
              alt="Foto de perfil"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
            />
          </div>
        )}
        
        {/* Datos personales */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 border-b pb-1 mb-2">
            {datos.datosPersonales.nombreCompleto || 'Nombre Completo'}
          </h3>
          <p className="text-sm text-gray-600">{datos.datosPersonales.correo}</p>
          {datos.datosPersonales.telefono && (
            <p className="text-sm text-gray-600">{datos.datosPersonales.telefono}</p>
          )}
        </div>
      </div>

      {/* Resumen Profesional */}
      {datos.resumenProfesional && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-1">Resumen Profesional</h4>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {datos.resumenProfesional}
          </p>
        </div>
      )}

      {/* Educación */}
      {datos.educaciones && datos.educaciones.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Educación</h4>
          {datos.educaciones.map((edu, i) => (
            <div key={i} className="mb-2">
              <p className="text-sm font-medium text-gray-800">{edu.titulo}</p>
              <p className="text-sm text-gray-600">{edu.institucion}</p>
              <p className="text-xs text-gray-500">
                {edu.fecha_inicio && edu.fecha_fin && 
                  `${edu.fecha_inicio} - ${edu.fecha_fin}`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Experiencia con funciones múltiples */}
      {datos.experiencias && datos.experiencias.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">
            Experiencia Laboral
          </h4>
          {datos.experiencias.map((exp, i) => (
            <div key={i} className="mb-3">
              <p className="text-sm font-medium text-gray-800">{exp.puesto}</p>
              <p className="text-sm text-gray-600">{exp.empresa}</p>
              <p className="text-xs text-gray-500 mb-1">
                {exp.periodo_inicio && exp.periodo_fin && 
                  `${exp.periodo_inicio} - ${exp.periodo_fin}`}
              </p>
              
              {/* Renderizar funciones como lista */}
              {exp.funciones && exp.funciones.length > 0 && (
                <ul className="list-disc list-inside ml-2 mt-1">
                  {exp.funciones.map((func, fIdx) => (
                    <li key={fIdx} className="text-xs text-gray-700">
                      {func.descripcion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Habilidades */}
      {datos.habilidades && datos.habilidades.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Habilidades</h4>
          <div className="flex flex-wrap gap-2">
            {datos.habilidades.map((hab, i) => (
              <span
                key={i}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {hab.descripcion}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Idiomas */}
      {datos.idiomas && datos.idiomas.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Idiomas</h4>
          {datos.idiomas.map((idioma, i) => (
            <p key={i} className="text-sm text-gray-700">
              {idioma.nombre} - {idioma.nivel}
            </p>
          ))}
        </div>
      )}

      {/* Referencias */}
      {datos.referencias && datos.referencias.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Referencias</h4>
          {datos.referencias.map((ref, i) => (
            <div key={i} className="mb-2">
              <p className="text-sm font-medium text-gray-800">{ref.nombre}</p>
              <p className="text-xs text-gray-600">{ref.relacion}</p>
              <p className="text-xs text-gray-600">{ref.contacto}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}