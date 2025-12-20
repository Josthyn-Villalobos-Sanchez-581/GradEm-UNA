import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";

import PpLayout from "@/layouts/PpLayout";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";

/* Filtros */
import FiltrosEstadisticas from "@/components/reportes/FiltrosEstadisticas";

/* Gráficos */
import GraficoKpis from "@/components/reportes/GraficoKpis";
import GraficoDonutPostulaciones from "@/components/reportes/GraficoDonutPostulaciones";
import GraficoOfertasMes from "@/components/reportes/GraficoOfertasMes";

/* Tablas */
import TopEmpresas from "@/components/reportes/TopEmpresas";
import CarrerasSolicitadas from "@/components/reportes/CarrerasSolicitadas";

/* Servicios */
import { estadisticasService } from "@/services/estadisticasService";

/* Tipos */
import type {
  FiltrosStats,
  KpiInfo,
  SerieMes,
  DonutData,
  TopEmpresa,
  CarreraSolicitada,
} from "@/types/estadisticas";

/* Estilos */
import "@/styles/reportes-ofertas.css";

interface CatalogosStats {
  carreras: { id: number; nombre: string }[];
  empresas: { id_empresa: number; nombre: string }[];
}

interface Props {
  userPermisos: number[];
  catalogosIniciales: CatalogosStats;
}

export default function ReportesOfertas({
  userPermisos,
  catalogosIniciales,
}: Props) {
  useModal();
  const [catalogos] = useState(catalogosIniciales);

  // -------------------------------------------------------
  // ESTADO
  // -------------------------------------------------------
  const [loading, setLoading] = useState(false);
  const [hayErrores] = useState(false);

  const [filtros, setFiltros] = useState<FiltrosStats>({});

  const [kpis, setKpis] = useState<KpiInfo | null>(null);
  const [datosPostulaciones, setDatosPostulaciones] = useState<
  { nombre: string; valor: number }[]
>([]);
  const [graficoOfertasMes, setGraficoOfertasMes] = useState<SerieMes[]>([]);
  const [resultadosTopEmpresas, setResultadosTopEmpresas] = useState<TopEmpresa[]>([]);
  const [resultadosTopCarreras, setResultadosTopCarreras] = useState<CarreraSolicitada[]>([]);

  // -------------------------------------------------------
  // FETCH PRINCIPAL
  // -------------------------------------------------------
  const fetchReportes = async () => {
    if (hayErrores) return;

    setLoading(true);

    try {
      const [
        kpisData,
        donutData,
        ofertasMesData,
        empresasData,
        carrerasData,
      ] = await Promise.all([
        estadisticasService.obtenerKpis(filtros),
        estadisticasService.obtenerPostulacionesTipo(filtros),
        estadisticasService.obtenerOfertasPorMes(filtros),
        estadisticasService.obtenerTopEmpresas(filtros),
        estadisticasService.obtenerTopCarreras(filtros),
      ]);

      /* KPIs */
      setKpis(kpisData);

      /* Donut */
      setDatosPostulaciones(
        donutData.map((d: DonutData) => ({
          nombre: d.label,
          valor: d.value,
        }))
      );

      /* Ofertas por mes */
      setGraficoOfertasMes(ofertasMesData);

      /* Top empresas */
      setResultadosTopEmpresas(empresasData);

      /* Top carreras */
      setResultadosTopCarreras(
        carrerasData.map((c: CarreraSolicitada) => ({
          ...c,
          tendencia: c.tendencia ?? 0,
        }))
      );
    } catch (error) {
      console.error("Error cargando estadísticas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, [filtros]);

  const actualizarFiltros = <K extends keyof FiltrosStats>(
  campo: K,
  valor: FiltrosStats[K]
) => {
  setFiltros(prev => ({
    ...prev,
    [campo]: valor,
  }));
};

const mostrarFiltro = (campo: keyof FiltrosStats) => {
  return true; // o lógica condicional real
};

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div className="space-y-6">
      <Head title="Panel de Estadísticas de Empleos" />

      {/* ENCABEZADO */}
      <div className="bg-white border-b pb-4">
        <h1 className="text-2xl font-bold text-[#D9232E]">
          Panel de Estadísticas de Empleos
        </h1>
        <p className="text-sm text-gray-600 mt-1 max-w-3xl">
          Aplicación web para la generación de estadísticas sobre empleos y
          postulaciones.
        </p>
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
          <FiltrosEstadisticas
            catalogos={catalogos}
            filtros={filtros}
            actualizarFiltros={actualizarFiltros}
            mostrarFiltro={mostrarFiltro}
            onAplicar={setFiltros}
            onLimpiar={() => setFiltros({})}
          />

          <div className="flex gap-3 justify-end ml-auto">
            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              onClick={() => setFiltros({})}
            >
              Limpiar filtros
            </Button>

            <Button
              className="bg-[#003366] hover:bg-[#002244] text-white"
              onClick={fetchReportes}
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      </div>

      {/* KPIS */}
      {kpis && <GraficoKpis datos={kpis} />}

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GraficoOfertasMes data={graficoOfertasMes} />
        <GraficoDonutPostulaciones data={datosPostulaciones} />
      </div>

      {/* RANKINGS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopEmpresas empresas={resultadosTopEmpresas} />
        <CarrerasSolicitadas carreras={resultadosTopCarreras} />
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50">
          <span className="text-[#003366] font-semibold">
            Cargando estadísticas...
          </span>
        </div>
      )}
    </div>
  );
}

/* Layout */
ReportesOfertas.layout = (page: any) => {
  const permisos = page.props.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
