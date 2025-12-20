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

export const estadisticasService = {
  async obtenerKpis(filtros: FiltrosStats): Promise<KpiInfo> {
    const { data } = await axios.get("/estadisticas/kpis", { params: filtros });
    return data;
  },

  async obtenerOfertasPorMes(filtros: FiltrosStats): Promise<SerieMes[]> {
    const { data } = await axios.get("/estadisticas/ofertas-por-mes", { params: filtros });
    return data;
  },

  async obtenerPostulacionesTipo(
    filtros: FiltrosStats
  ): Promise<DonutData[]> {
    const { data } = await axios.get("/estadisticas/postulaciones-tipo", {
      params: filtros,
    });
    return data;
  },

  async obtenerTopEmpresas(
    filtros: FiltrosStats
  ): Promise<TopEmpresa[]> {
    const { data } = await axios.get("/estadisticas/top-empresas", {
      params: filtros,
    });
    return data;
  },

  async obtenerTopCarreras(
    filtros:  FiltrosStats
  ): Promise<CarreraSolicitada[]> {
    const { data } = await axios.get("/estadisticas/top-carreras", {
      params: filtros,
    });
    return data;
  },
};
