// resources/js/types/curriculum.ts

export type Funcion = {
  descripcion: string;
};

export type Educacion = {
  institucion: string;
  titulo: string;
  fecha_inicio?: string;
  fecha_fin?: string;
};

export type Experiencia = {
  empresa: string;
  puesto: string;
  periodo_inicio?: string;
  periodo_fin?: string;
  funciones: Funcion[]; // Array de funciones
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
  referencias: Referencia[];
  certificaciones: Certificacion[];
  incluirFotoPerfil?: boolean;
  [key: string]: unknown;
};