// resources/js/types/estadisticas.ts

export type TipoOferta = "empleo" | "practica" | "todas" | null;

export interface FiltrosStats {
  fecha_inicio: string | null;
  fecha_fin: string | null;
  tipo_oferta: TipoOferta;
  carrera: number | null;
  empresa: number | null;
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
