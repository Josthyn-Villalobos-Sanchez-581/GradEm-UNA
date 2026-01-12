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
  puesto:  string;
  periodo_inicio?:  string;
  periodo_fin?:  string;
  trabajando_actualmente?: boolean;
  funciones:  Funcion[];
  referencias:  Referencia[];
};

// ⭐ SEPARAMOS:  Habilidades técnicas y blandas ahora usan el mismo tipo
export type Habilidad = {
  descripcion: string;
};

export type Idioma = {
  nombre: string;
  nivel: '' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Nativo';
};

export type Referencia = {
  nombre:  string;
  contacto: string;
  correo: string;
  relacion: string;
};

// ⭐ YA EXISTÍA: Ahora lo usaremos en el FormCV
export type Certificacion = {
  nombre: string;
  institucion?:  string;
  fecha_obtencion?: string;
};

// ⭐ MODIFICADO: Agregamos certificaciones y separamos habilidades
export type FormCV = {
  usuarioId: number;
  datosPersonales: {
    nombreCompleto: string;
    correo:  string;
    telefono: string;
    linkedin?:  string;
    github?: string;
  };
  resumenProfesional: string;
  educaciones: Educacion[];
  experiencias: Experiencia[];
  
  // ⭐ NUEVO: Separación de habilidades
  habilidadesTecnicas: Habilidad[];   // ⭐ NUEVO
  habilidadesBlandas: Habilidad[];    // ⭐ NUEVO
  
  // ⭐ NUEVO: Certificaciones como sección separada
  certificaciones:  Certificacion[];   // ⭐ NUEVO
  
  idiomas: Idioma[];
  incluirFotoPerfil?:  boolean;
  [key: string]: unknown;
};