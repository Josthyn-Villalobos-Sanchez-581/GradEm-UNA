// resources/js/pages/Frt_VistaPreviaCurriculum.tsx

import React from 'react';
import { usePage } from '@inertiajs/react';
import FotoXDefecto from '../assets/FotoXDefecto.png';

// IMPORTAR TIPOS COMPARTIDOS
import type { FormCV, Educacion, Experiencia, Habilidad, Idioma, Certificacion } from '../types/curriculum';

type UsuarioActual = {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  telefono?: string;
  fotoPerfil?: { ruta_imagen: string } | null;
};

interface VistaPreviaProps {
  datos: FormCV;
  fotoPerfilUrl: string;
}

export default function Frt_VistaPreviaCurriculum({ datos, fotoPerfilUrl }: VistaPreviaProps) {
  const page = usePage<{ auth: { user?: any }, usuario?: UsuarioActual }>();

  const {
    datosPersonales,
    resumenProfesional,
    educaciones = [],
    experiencias = [],
    habilidadesTecnicas = [],
    habilidadesBlandas = [],
    certificaciones = [],
    idiomas = [],
    incluirFotoPerfil,
  } = datos;

  return (
    <aside className="border rounded-lg p-6 bg-white shadow-sm max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Vista previa</h2>
      <p className="text-sm text-gray-600 mb-3">
        Diseño ATS-Friendly: Formato optimizado para sistemas de seguimiento de candidatos.
      </p>
      <hr className="mb-4 border-gray-900" />

      {/* ===== ENCABEZADO: DATOS PERSONALES ===== */}
      <section className="mb-6 text-center pb-4 border-b-2 border-gray-900">
        {incluirFotoPerfil && (
          <img
            src={fotoPerfilUrl}
            alt="Foto de perfil"
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-900 mx-auto mb-3"
          />
        )}
        
        <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-3">
          {datosPersonales.nombreCompleto}
        </h3>
        
        <div className="text-sm text-gray-700 space-y-1">
          {datosPersonales.correo && (
            <div><strong>Email:</strong> {datosPersonales.correo}</div>
          )}
          {datosPersonales.telefono && (
            <div><strong>Teléfono:</strong> {datosPersonales.telefono}</div>
          )}
          {datosPersonales.linkedin && (
            <div className="text-blue-600">
              <strong>LinkedIn:</strong> {datosPersonales.linkedin}
            </div>
          )}
          {datosPersonales.github && (
            <div className="text-blue-600">
              <strong>GitHub:</strong> {datosPersonales.github}
            </div>
          )}
        </div>
      </section>

      {/* ===== RESUMEN PROFESIONAL ===== */}
      {resumenProfesional?.trim() && (
        <section className="mb-5">
          <h3 className="text-sm font-bold text-gray-900 uppercase border-b-2 border-gray-900 pb-1 mb-2 tracking-wider">
            Perfil Profesional
          </h3>
          <p className="text-xs text-gray-700 text-justify leading-relaxed">
            {resumenProfesional}
          </p>
        </section>
      )}

      {/* ===== FORMACIÓN ACADÉMICA ===== */}
      {educaciones.length > 0 && (
        <section className="mb-5">
          <h3 className="text-sm font-bold text-gray-900 uppercase border-b-2 border-gray-900 pb-1 mb-2 tracking-wider">
            Formación Académica
          </h3>
          <div className="space-y-3">
            {educaciones.map((e, i) => (
              <div key={i} className="text-xs">
                <div className="font-bold text-gray-900">
                  {e.tipo && (
                    <span className="text-[9px] text-gray-500 uppercase font-bold mr-2">
                      [{e.tipo}]
                    </span>
                  )}
                  {e.titulo}
                </div>
                {e.institucion && (
                  <div className="text-gray-600 italic">{e.institucion}</div>
                )}
                {e.fecha_fin && (
                  <div className="text-gray-500 text-[10px]">
                    Fecha de finalización: {e.fecha_fin}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== CERTIFICACIONES ===== */}
      {certificaciones.length > 0 && (
        <section className="mb-5">
          <h3 className="text-sm font-bold text-gray-900 uppercase border-b-2 border-gray-900 pb-1 mb-2 tracking-wider">
            Certificaciones y Cursos
          </h3>
          <div className="space-y-3">
            {certificaciones.map((cert, i) => (
              <div key={i} className="text-xs">
                <div className="font-bold text-gray-900">{cert.nombre}</div>
                {cert.institucion && (
                  <div className="text-gray-600 italic">{cert.institucion}</div>
                )}
                {cert.fecha_obtencion && (
                  <div className="text-gray-500 text-[10px]">
                    Fecha de obtención: {cert.fecha_obtencion}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== EXPERIENCIA PROFESIONAL ===== */}
      {experiencias.length > 0 && (
        <section className="mb-5">
          <h3 className="text-sm font-bold text-gray-900 uppercase border-b-2 border-gray-900 pb-1 mb-2 tracking-wider">
            Experiencia Profesional
          </h3>
          <div className="space-y-4">
            {experiencias.map((ex, i) => (
              <div key={i} className="text-xs">
                <div className="font-bold text-gray-900">{ex.puesto}</div>
                {ex.empresa && (
                  <div className="text-gray-600 italic">{ex.empresa}</div>
                )}
                {(ex.periodo_inicio || ex.periodo_fin) && (
                  <div className="text-gray-500 text-[10px]">
                    {ex.periodo_inicio || '??'} - {ex.trabajando_actualmente ? 'Actual' : (ex.periodo_fin || 'Actual')}
                  </div>
                )}
                
                {/* Funciones */}
                {ex.funciones && ex.funciones.length > 0 && (
                  <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                    {ex.funciones.map((func, fIdx) => (
                      func.descripcion.trim() && (
                        <li key={fIdx}>{func.descripcion}</li>
                      )
                    ))}
                  </ul>
                )}

                {/* Referencias */}
                {ex.referencias && ex.referencias.length > 0 && (
                  <div className="mt-2 pl-3 border-l-4 border-gray-300">
                    <p className="font-bold text-gray-900 mb-1 text-[10px]">Referencias:</p>
                    {ex.referencias.map((ref, rIdx) => (
                      ref.nombre && (
                        <div key={rIdx} className="text-gray-600 mb-1 text-[10px]">
                          <strong className="text-gray-900">{ref.nombre}</strong>
                          {ref.relacion && <> ({ref.relacion})</>}
                          {ref.contacto && <> - Tel: {ref.contacto}</>}
                          {ref.correo && <> - Email: {ref.correo}</>}
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== HABILIDADES TÉCNICAS ===== */}
      {habilidadesTecnicas.length > 0 && (
        <section className="mb-5">
          <h3 className="text-sm font-bold text-gray-900 uppercase border-b-2 border-gray-900 pb-1 mb-2 tracking-wider">
            Habilidades Técnicas
          </h3>
          <div className="text-xs text-gray-900 leading-relaxed">
            {habilidadesTecnicas
              .filter((h) => h.descripcion?.trim())
              .map((h, i, arr) => (
                <span key={i}>
                  {h.descripcion}
                  {i < arr.length - 1 && <span className="text-gray-500"> • </span>}
                </span>
              ))}
          </div>
        </section>
      )}

      {/* ===== COMPETENCIAS PROFESIONALES ===== */}
      {habilidadesBlandas.length > 0 && (
        <section className="mb-5">
          <h3 className="text-sm font-bold text-gray-900 uppercase border-b-2 border-gray-900 pb-1 mb-2 tracking-wider">
            Competencias Profesionales
          </h3>
          <div className="text-xs text-gray-900 leading-relaxed">
            {habilidadesBlandas
              .filter((h) => h.descripcion?.trim())
              .map((h, i, arr) => (
                <span key={i}>
                  {h.descripcion}
                  {i < arr.length - 1 && <span className="text-gray-500"> • </span>}
                </span>
              ))}
          </div>
        </section>
      )}

      {/* ===== IDIOMAS ===== */}
      {idiomas.length > 0 && (
        <section className="mb-5">
          <h3 className="text-sm font-bold text-gray-900 uppercase border-b-2 border-gray-900 pb-1 mb-2 tracking-wider">
            Idiomas
          </h3>
          <div className="text-xs text-gray-900 leading-relaxed">
            {idiomas
              .filter((x) => x.nombre?.trim() || x.nivel)
              .map((x, i, arr) => (
                <span key={i}>
                  {x.nombre || '—'}
                  {x.nivel ? ` (${x.nivel})` : ''}
                  {i < arr.length - 1 && <span className="text-gray-500"> • </span>}
                </span>
              ))}
          </div>
        </section>
      )}
    </aside>
  );
}