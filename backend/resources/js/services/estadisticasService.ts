// resources/js/services/estadisticasService.ts

import axios from "axios";
import type {
  FiltrosStats,
  KpiInfo,
  SerieMes,
  DonutData,
  TopEmpresa,
  CarreraSolicitada,
} from "@/types/estadisticas";

const BASE_URL = "/estadisticas/ofertas";

/**
 * Elimina null, undefined, "", NaN
 * para evitar enviar params inválidos al backend
 */
const limpiarParams = (filtros: FiltrosStats) => {
  const params: Record<string, any> = {};

  Object.entries(filtros).forEach(([key, value]) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (typeof value === "number" && isNaN(value))
    ) {
      return;
    }

    params[key] = value;
  });

  return params;
};

export const estadisticasService = {
  async obtenerKpis(filtros: FiltrosStats): Promise<KpiInfo> {
    const { data } = await axios.get(`${BASE_URL}/kpis`, {
      params: limpiarParams(filtros),
    });
    return data;
  },

  async obtenerOfertasPorMes(
    filtros: FiltrosStats
  ): Promise<SerieMes[]> {
    const { data } = await axios.get(`${BASE_URL}/ofertas-mes`, {
      params: limpiarParams(filtros),
    });
    return data;
  },

  async obtenerPostulacionesTipo(
    filtros: FiltrosStats
  ): Promise<DonutData[]> {
    const { data } = await axios.get(
      `${BASE_URL}/postulaciones-tipo`,
      {
        params: limpiarParams(filtros),
      }
    );
    return data;
  },

  async obtenerTopEmpresas(
    filtros: FiltrosStats
  ): Promise<TopEmpresa[]> {
    const { data } = await axios.get(`${BASE_URL}/top-empresas`, {
      params: limpiarParams(filtros),
    });
    return data;
  },

  async obtenerTopCarreras(
    filtros: FiltrosStats
  ): Promise<CarreraSolicitada[]> {
    const { data } = await axios.get(`${BASE_URL}/top-carreras`, {
      params: limpiarParams(filtros),
    });
    return data;
  },
};
