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
    habilidades = [],
    idiomas = [],
    incluirFotoPerfil,
  } = datos;

  return (
    <aside className="border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Vista previa</h2>
      <p className="text-sm text-gray-600 mb-3">
        Representación aproximada del PDF final.
      </p>
      <hr className="mb-4" />

      {/* Datos personales */}
      <section className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 pb-1 border-b-2 border-gray-900">
          Datos personales
        </h3>
        
        {incluirFotoPerfil ? (
          <div className="flex items-start gap-3 mb-2">
            <img
              src={fotoPerfilUrl}
              alt="Foto de perfil"
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-900 flex-shrink-0"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{datosPersonales.nombreCompleto}</p>
              <p className="text-sm text-gray-700">
                {datosPersonales.correo}
                {datosPersonales.telefono ? (
                  <> · {datosPersonales.telefono}</>
                ) : null}
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="font-semibold text-gray-900">{datosPersonales.nombreCompleto}</p>
            <p className="text-sm text-gray-700">
              {datosPersonales.correo}
              {datosPersonales.telefono ? (
                <> · {datosPersonales.telefono}</>
              ) : null}
            </p>
          </>
        )}

        {resumenProfesional?.trim() && (
          <p className="mt-2 text-sm text-gray-700">{resumenProfesional}</p>
        )}
      </section>

      {/* Formación académica */}
      {educaciones.length > 0 && (
        <section className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 pb-1 border-b-2 border-gray-900">
            Formación académica
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {educaciones.map((e, i) => (
              <li key={i} className="text-sm text-gray-700">
                {e.tipo && (
                  <span className="text-xs text-gray-500 uppercase font-medium">[{e.tipo}] </span>
                )}
                <span className="font-medium text-gray-900">{e.titulo}</span>
                {e.institucion ? ` — ${e.institucion}` : ''}
                {e.fecha_fin && <> ({e.fecha_fin})</>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Experiencia laboral */}
      {experiencias.length > 0 && (
        <section className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 pb-1 border-b-2 border-gray-900">
            Experiencia laboral
          </h3>
          <div className="space-y-3">
            {experiencias.map((ex, i) => (
              <div key={i}>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">{ex.puesto}</span>
                  {ex.empresa ? ` — ${ex.empresa}` : ''}
                  {(ex.periodo_inicio || ex.periodo_fin) && (
                    <span className="text-gray-600 text-xs">
                      {' '}({ex.periodo_inicio || '¿?'} - {ex.periodo_fin || 'Actual'})
                    </span>
                  )}
                </div>
                
                {/* Funciones */}
                {ex.funciones && ex.funciones.length > 0 && (
                  <ul className="list-disc pl-5 mt-1 text-xs text-gray-600">
                    {ex.funciones.map((func, fIdx) => (
                      func.descripcion.trim() && (
                        <li key={fIdx}>{func.descripcion}</li>
                      )
                    ))}
                  </ul>
                )}

                {/* Referencias */}
                {ex.referencias && ex.referencias.length > 0 && (
                  <div className="mt-2 pl-3 border-l-2 border-gray-300">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Referencias:</p>
                    {ex.referencias.map((ref, rIdx) => (
                      (ref.nombre || ref.contacto || ref.correo) && (
                        <div key={rIdx} className="text-xs text-gray-600 mb-1">
                          <strong className="text-gray-900">{ref.nombre}</strong>
                          {ref.relacion && <> - {ref.relacion}</>}
                          {ref.contacto && <> · Tel: {ref.contacto}</>}
                          {ref.correo && <> · Email: {ref.correo}</>}
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

      {/* Habilidades */}
      {habilidades.length > 0 && (
        <section className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 pb-1 border-b-2 border-gray-900">
            Habilidades
          </h3>
          <div className="flex flex-wrap gap-2">
            {habilidades
              .filter((h) => h.descripcion?.trim())
              .map((h, i) => (
                <span
                  key={i}
                  className="border border-gray-900 rounded-full px-3 py-1 text-xs bg-gray-50 text-gray-900"
                >
                  {h.descripcion}
                </span>
              ))}
          </div>
        </section>
      )}

      {/* Idiomas */}
      {idiomas.length > 0 && (
        <section className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 pb-1 border-b-2 border-gray-900">
            Idiomas
          </h3>
          <div className="flex flex-wrap gap-2">
            {idiomas
              .filter((x) => x.nombre?.trim() || x.nivel)
              .map((x, i) => (
                <span
                  key={i}
                  className="border border-gray-900 rounded-full px-3 py-1 text-xs bg-gray-50 text-gray-900"
                >
                  {x.nombre || '—'}
                  {x.nivel ? ` (${x.nivel})` : ''}
                </span>
              ))}
          </div>
        </section>
      )}
    </aside>
  );
}