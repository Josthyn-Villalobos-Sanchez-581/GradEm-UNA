import { useState } from "react";

export interface ParametrosReporte {
  universidadId: string | null;
  carreraId: string | null;
  fechaInicio: number | null; // ✅
  fechaFin: number | null;    // ✅
  genero: string | null;
  estadoEstudios: string | null;
  nivelAcademico: string | null;
  estadoEmpleo: string | null;
  tiempoEmpleo: string | null;
  areaLaboralId: string | null;
  salario: string | null;
  tipoEmpleo: string | null;
  paisId: string | null;
  provinciaId: string | null;
  cantonId: string | null;
}


const convertirFechaAISO = (fecha: string | null) => {
  if (!fecha) return null;
  const partes = fecha.split("/");
  if (partes.length !== 3) return null;
  const [dia, mes, anio] = partes;
  return `${anio}-${mes}-${dia}`;
};

//hook perteneciente a REPORTES
export function useParametrosReporte() {
  const [filtros, setFiltros] = useState<ParametrosReporte>({
    universidadId: null,
    carreraId: null,
    fechaInicio: null,
    fechaFin: null,
    genero: null,
    estadoEstudios: null,
    nivelAcademico: null,
    estadoEmpleo: null,
    tiempoEmpleo: null,
    areaLaboralId: null,
    salario: null,
    tipoEmpleo: null,
    paisId: null, 
    provinciaId: null,
    cantonId: null,
  });

  /**
   * Actualiza un filtro con manejo de dependencias:
   * - Si cambia el país, se limpian provincia y cantón
   * - Si cambia provincia, se limpia cantón
   */
const actualizarFiltros = (campo: keyof ParametrosReporte, valor: any) => {
  setFiltros((prev) => {
    const nuevo = { ...prev };

    nuevo[campo] = valor === "" ? null : valor;

    // dependencias
    if (campo === "paisId") {
      nuevo.provinciaId = null;
      nuevo.cantonId = null;
    }

    if (campo === "provinciaId") {
      nuevo.cantonId = null;
    }

    return nuevo;
  });
};



  /** Limpia todos los filtros */
  const limpiarFiltros = () => {
    setFiltros({
      universidadId: null,
      carreraId: null,
      fechaInicio: null,
      fechaFin: null,
      genero: null,
      estadoEstudios: null,
      nivelAcademico: null,
      estadoEmpleo: null,
      tiempoEmpleo: null,
      areaLaboralId: null,
      salario: null,
      tipoEmpleo: null,
      paisId: null,
      provinciaId: null,
      cantonId: null,
    });
  };

  /**
   * Convierte los filtros al formato exacto del SP:
   * orden correcto según parámetros declarados en MySQL
   */
  const obtenerParametrosBackend = () => {
    return {
      universidad: filtros.universidadId,
      carrera: filtros.carreraId,
      fecha_inicio: filtros.fechaInicio,
      fecha_fin: filtros.fechaFin,
      genero: filtros.genero,
      estado_estudios: filtros.estadoEstudios,
      nivel_academico: filtros.nivelAcademico,
      estado_empleo: filtros.estadoEmpleo,
      tiempo_empleo: filtros.tiempoEmpleo,
      area_laboral: filtros.areaLaboralId,
      salario: filtros.salario,
      tipo_empleo: filtros.tipoEmpleo,
      pais: filtros.paisId,
      provincia: filtros.provinciaId,
      canton: filtros.cantonId,
    };
  };

  return {
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    obtenerParametrosBackend,
  };
}
