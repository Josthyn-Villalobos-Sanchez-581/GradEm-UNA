// resources/js/types/curriculum.ts

export type Funcion = {
  descripcion: string;
};

export type Educacion = {
  tipo: 'Título' | 'Certificación' | 'Curso' | 'Diplomado' | 'Técnico' | '';
  institucion: string;
  titulo: string;
  fecha_fin?: string;
};

export type Experiencia = {
  empresa: string;
  puesto: string;
  periodo_inicio?: string;
  periodo_fin?: string;
  funciones: Funcion[];
  referencias: Referencia[]; // NUEVO: Referencias asociadas a esta experiencia
};

export type Habilidad = {
  descripcion: string;
};

export type Idioma = {
  nombre: string;
  nivel: '' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Nativo';
};

export type Referencia = {
  nombre: string;
  contacto: string;
  correo: string;
  relacion: string;
};

export type Certificacion = {
  nombre: string;
  institucion?: string;
  fecha_obtencion?: string;
};

export type FormCV = {
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
  // referencias: Referencia[]; // ELIMINADO: Ahora están dentro de cada experiencia
  incluirFotoPerfil?: boolean;
  [key: string]: unknown;
};