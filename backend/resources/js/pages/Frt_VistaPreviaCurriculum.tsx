// resources/js/pages/Frt_VistaPreviaCurriculum.tsx

import React from 'react';
import { usePage } from '@inertiajs/react';
import FotoXDefecto from '../assets/FotoXDefecto.png';

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
  incluirFotoPerfil?: boolean; // ✅ CAMBIO: ahora es opcional como en el otro archivo
  [key: string]: any; // ✅ NUEVO: agregar esta línea para que coincida
};

// ✅ NUEVO: Tipo para el usuario con foto
type UsuarioActual = {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  telefono?: string; // ✅ CAMBIO: hacer opcional como en el otro archivo
  fotoPerfil?: { ruta_imagen: string } | null;
};

export default function Frt_VistaPreviaCurriculum({ datos }: { datos: FormCV }) {
  // ✅ NUEVO: Obtener información del usuario desde el contexto de la página
  const page = usePage<{ auth: { user?: any }, usuario?: UsuarioActual }>();
  const usuario: UsuarioActual | null = page.props.usuario || (page.props.auth?.user
    ? {
        id_usuario: page.props.auth.user.id_usuario,
        nombre_completo: page.props.auth.user.nombre_completo,
        correo: page.props.auth.user.correo,
        telefono: page.props.auth.user.telefono,
        fotoPerfil: page.props.auth.user.fotoPerfil || null,
      }
    : null);

  const {
    datosPersonales,
    resumenProfesional,
    educaciones = [],
    experiencias = [],
    habilidades = [],
    idiomas = [],
    referencias = [],
    incluirFotoPerfil, // ✅ CAMBIO: sin valor por defecto porque es opcional
  } = datos;

  // ✅ NUEVO: Obtener URL de la foto
  const fotoPerfilUrl = usuario?.fotoPerfil?.ruta_imagen || FotoXDefecto;

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
        
        {/* ✅ NUEVO: Contenedor con o sin foto */}
        {incluirFotoPerfil ? (
          <div className="flex items-start gap-4 mb-2">
            <img
              src={fotoPerfilUrl}
              alt="Foto de perfil"
              className="w-16 h-16 rounded-lg object-cover border-2 border-[#034991] flex-shrink-0"
            />
            <div className="flex-1">
              <p className="font-semibold">{datosPersonales.nombreCompleto}</p>
              <p className="text-sm">
                {datosPersonales.correo}
                {datosPersonales.telefono ? (
                  <>
                    {' '}&middot; {datosPersonales.telefono}
                  </>
                ) : null}
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="font-semibold">{datosPersonales.nombreCompleto}</p>
            <p className="text-sm">
              {datosPersonales.correo}
              {datosPersonales.telefono ? (
                <>
                  {' '}&middot; {datosPersonales.telefono}
                </>
              ) : null}
            </p>
          </>
        )}

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
                <span
                  key={i}
                  className="border rounded px-2 py-1 text-sm bg-gray-50"
                >
                  {h.descripcion}
                </span>
              ))}
          </div>
        </section>
      )}

      {/* Idiomas */}
      {idiomas.length > 0 && (
        <section className="mb-3">
          <h3 className="text-[#CD1719] font-semibold">Idiomas</h3>
          <div className="flex flex-wrap gap-2">
            {idiomas
              .filter((x) => x.nombre?.trim() || x.nivel)
              .map((x, i) => (
                <span
                  key={i}
                  className="border rounded px-2 py-1 text-sm bg-gray-50"
                >
                  {x.nombre || '—'}
                  {x.nivel ? ` (${x.nivel})` : ''}
                </span>
              ))}
          </div>
        </section>
      )}

      {/* Referencias */}
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