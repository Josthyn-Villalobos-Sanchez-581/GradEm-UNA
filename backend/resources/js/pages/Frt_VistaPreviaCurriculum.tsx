// resources/js/pages/Frt_VistaPreviaCurriculum.tsx
// ✅ Vista previa actualizada: ahora renderiza Idiomas (nombre + nivel) y Referencias.
//    Mantiene estilos simples y condicionales por sección.

import React from 'react';

// Tipos alineados con el formulario
type Educacion = {
  institucion: string;
  titulo: string;
  fecha_inicio?: string;
  fecha_fin?: string;
};

type Experiencia = {
  empresa: string;
  puesto: string;
  periodo_inicio?: string;
  periodo_fin?: string;
  funciones?: string;
};

type Habilidad = { descripcion: string };
type Idioma = { nombre: string; nivel: '' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Nativo' };
type Referencia = { nombre: string; contacto: string; relacion: string };

type FormCV = {
  usuarioId: number;
  datosPersonales: {
    nombreCompleto: string;
    correo: string;
    telefono: string;
  };
  resumenProfesional: string;
  educaciones: Educacion[];
  experiencias: Experiencia[];
  habilidades: Habilidad[];
  idiomas: Idioma[];
  referencias: Referencia[];
};

export default function Frt_VistaPreviaCurriculum({ datos }: { datos: FormCV }) {
  const {
    datosPersonales,
    resumenProfesional,
    educaciones = [],
    experiencias = [],
    habilidades = [],
    idiomas = [],
    referencias = [],
  } = datos;

  return (
    <aside className="border rounded-lg p-4">
      <h2 className="text-xl font-bold text-[#034991]">Vista previa</h2>
      <p className="text-sm text-gray-600 mb-2">
        Esta es una representación HTML del PDF institucional.
      </p>
      <hr className="mb-3" />

      {/* Datos personales */}
      <section className="mb-3">
        <h3 className="text-[#CD1719] font-semibold">Datos personales</h3>
        <p className="font-semibold">{datosPersonales.nombreCompleto}</p>
        <p className="text-sm">
          {datosPersonales.correo}
          {datosPersonales.telefono ? (
            <>
              {' '}&middot; {datosPersonales.telefono}
            </>
          ) : null}
        </p>
        {resumenProfesional?.trim() && (
          <p className="mt-2 text-sm">{resumenProfesional}</p>
        )}
      </section>

      {/* Formación académica */}
      {educaciones.length > 0 && (
        <section className="mb-3">
          <h3 className="text-[#CD1719] font-semibold">Formación académica</h3>
          <ul className="list-disc pl-5">
            {educaciones.map((e, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium">{e.titulo}</span>
                {e.institucion ? ` — ${e.institucion}` : ''}
                {(e.fecha_inicio || e.fecha_fin) && (
                  <> ({e.fecha_inicio || '¿?'} - {e.fecha_fin || 'Actual'})</>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Experiencia laboral */}
      {experiencias.length > 0 && (
        <section className="mb-3">
          <h3 className="text-[#CD1719] font-semibold">Experiencia laboral</h3>
          <ul className="list-disc pl-5">
            {experiencias.map((ex, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium">{ex.puesto}</span>
                {ex.empresa ? ` — ${ex.empresa}` : ''}
                {(ex.periodo_inicio || ex.periodo_fin) && (
                  <> ({ex.periodo_inicio || '¿?'} - {ex.periodo_fin || 'Actual'})</>
                )}
                {ex.funciones?.trim() && <div className="mt-1">{ex.funciones}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}

     {/* Habilidades */}
{habilidades.length > 0 && (
  <section className="mb-3">
    <h3 className="text-[#CD1719] font-semibold">Habilidades</h3>
    <div className="flex flex-wrap gap-2">
      {habilidades
        .filter((h) => h.descripcion?.trim())
        .map((h, i) => (
          <span key={i} className="text-sm">
            {h.descripcion}
          </span>
        ))}
    </div>
  </section>
)}

{/* ✅ Idiomas (nombre + nivel MCER) */}
{idiomas.length > 0 && (
  <section className="mb-3">
    <h3 className="text-[#CD1719] font-semibold">Idiomas</h3>
    <div className="flex flex-wrap gap-2">
      {idiomas
        .filter((x) => x.nombre?.trim() || x.nivel)
        .map((x, i) => (
          <span key={i} className="text-sm">
            {x.nombre || '—'}
            {x.nivel ? ` (${x.nivel})` : ''}
          </span>
        ))}
    </div>
  </section>
)}


      {/* ✅ Referencias */}
      {referencias.length > 0 && (
        <section className="mb-1">
          <h3 className="text-[#CD1719] font-semibold">Referencias</h3>
          <ul className="list-disc pl-5">
            {referencias
              .filter((r) => r.nombre?.trim() || r.contacto?.trim() || r.relacion?.trim())
              .map((r, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">{r.nombre || '—'}</span>
                  {r.relacion ? ` — ${r.relacion}` : ''}
                  {r.contacto ? ` · ${r.contacto}` : ''}
                </li>
              ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
