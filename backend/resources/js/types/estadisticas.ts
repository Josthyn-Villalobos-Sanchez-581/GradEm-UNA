// resources/js/types/estadisticas.ts

export type TipoOferta = 'empleo' | 'practica' | 'todas';

export interface FiltrosStats {
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo_oferta?: TipoOferta;
  campo_aplicacion?: string;
  empresa?: string;
}

/* ================= KPIs ================= */

export interface KpiInfo {
  total_ofertas: number;
  ofertas_activas: number;
  total_postulaciones: number;
  empresas_activas: number;
}

/* ================= GRÁFICOS ================= */

export interface SerieMes {
  mes: string;
  valor: number;
}

export interface DonutData {
  label: string;
  value: number;
}

/* ================= TABLAS ================= */

export interface TopEmpresa {
  nombre: string;
  postulaciones: number;
}

export interface CarreraSolicitada {
  carrera: string;
  vacantes: number;
  tendencia: number;
}
