import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
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

interface CatalogoItem {
  id: number;
  nombre: string;
}

interface CatalogosStats {
  carreras: CatalogoItem[];
  empresas: CatalogoItem[];
}

interface Props {
  userPermisos: number[];
  catalogosIniciales: CatalogosStats;
}

export default function ReportesOfertas({
  userPermisos,
  catalogosIniciales,
}: Props) {

  const [catalogos] = useState(catalogosIniciales);

  /* Estado */
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosStats>({
    fecha_inicio: null,
    fecha_fin: null,
    tipo_oferta: null,
    carrera: null,
    empresa: null,
  });

  const [kpis, setKpis] = useState<KpiInfo | null>(null);
  const [datosPostulaciones, setDatosPostulaciones] = useState<
    { nombre: string; valor: number }[]
  >([]);
  const [graficoOfertasMes, setGraficoOfertasMes] = useState<SerieMes[]>([]);
  const [resultadosTopEmpresas, setResultadosTopEmpresas] = useState<TopEmpresa[]>([]);
  const [resultadosTopCarreras, setResultadosTopCarreras] = useState<CarreraSolicitada[]>([]);

const modal = useModal();

const [reportesSeleccionados, setReportesSeleccionados] = useState<string[]>([
  "ofertas_mes",
  "postulaciones_tipo",
  "top_empresas",
  "top_carreras",
]);

const [hayResultados, setHayResultados] = useState(false);
const [hayErrores, setHayErrores] = useState(false);


const etiquetasFiltros: Record<string, string> = {
  fecha_inicio: "Fecha inicio",
  fecha_fin: "Fecha fin",
  tipo_oferta: "Tipo de oferta",
  carrera: "Carrera",
  empresa: "Empresa",
};

const catalogoPorFiltro: Record<string, any[]> = {
  carrera: catalogos?.carreras,
  empresa: catalogos?.empresas,
};

const resolverNombre = (
  catalogo: { id: number; nombre: string }[] | undefined,
  id: number | string
): string => {
  if (!catalogo) return String(id);
  return catalogo.find((c) => c.id === Number(id))?.nombre ?? String(id);
};

const filtrosLegibles = Object.entries(filtros)
  .filter(([_, valor]) => valor !== null && valor !== "")
  .map(([campo, valor]) => {
    const catalogo = catalogoPorFiltro[campo];

    return {
      campo: etiquetasFiltros[campo] ?? campo,
      valor: catalogo
        ? resolverNombre(catalogo, valor as string | number)
        : String(valor),
    };
  });


  /* Actualizar filtros (campo a campo) */
  const actualizarFiltros = <K extends keyof FiltrosStats>(
    campo: K,
    valor: FiltrosStats[K]
  ) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const limpiarFiltros = (filtros: FiltrosStats): FiltrosStats => {
    return {
      fecha_inicio: filtros.fecha_inicio || null,
      fecha_fin: filtros.fecha_fin || null,
      tipo_oferta: filtros.tipo_oferta || null,
      carrera: filtros.carrera ?? null,
      empresa: filtros.empresa ?? null,
    };
  };

  const resetearFiltros = () => {
    setFiltros({
      fecha_inicio: null,
      fecha_fin: null,
      tipo_oferta: null,
      carrera: null,
      empresa: null,
    });
  };

  const descargarPdf = async () => {
    if (!hayResultados) {
      modal.alerta({
        titulo: "Sin datos",
        mensaje: "No existen datos para generar el reporte en PDF.",
      });
      return;
    }

    const filtrosLimpios = limpiarFiltros(filtros);

    try {
      const res = await axios.post(
        "/reportes-ofertas/descargar-pdf",
        {
          reportes: reportesSeleccionados,
          parametros: filtrosLimpios, // 🔥 MISMO OBJETO
          filtrosLegibles,
        },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "Reporte_Ofertas_UNA.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      modal.alerta({
        titulo: "Error",
        mensaje: "No fue posible generar el PDF del reporte.",
      });
    }
  };



  /* Fetch principal */
  const fetchReportes = async () => {
    // -----------------------------
    // Validación de fechas
    // -----------------------------
    if (filtros.fecha_inicio && filtros.fecha_fin) {
      if (filtros.fecha_inicio > filtros.fecha_fin) {
        modal.alerta({
          titulo: "Rango de fechas inválido",
          mensaje: "La fecha de inicio no puede ser mayor que la fecha fin.",
        });
        setHayErrores(true);
        return;
      }
    }

    if (
      (filtros.fecha_inicio && !filtros.fecha_fin) ||
      (!filtros.fecha_inicio && filtros.fecha_fin)
    ) {
      modal.alerta({
        titulo: "Fechas incompletas",
        mensaje: "Debe indicar ambas fechas: inicio y fin.",
      });
      setHayErrores(true);
      return;
    }

    setLoading(true);

    const filtrosLimpios = limpiarFiltros(filtros);

    try {
      const [
        kpisData,
        donutData,
        ofertasMesData,
        empresasData,
        carrerasData,
      ] = await Promise.all([
        estadisticasService.obtenerKpis(filtrosLimpios),
        estadisticasService.obtenerPostulacionesTipo(filtrosLimpios),
        estadisticasService.obtenerOfertasPorMes(filtrosLimpios),
        estadisticasService.obtenerTopEmpresas(filtrosLimpios),
        estadisticasService.obtenerTopCarreras(filtrosLimpios),
      ]);

      setKpis(kpisData);
      setDatosPostulaciones(
        donutData.map(d => ({ nombre: d.label, valor: d.value }))
      );
      setGraficoOfertasMes(ofertasMesData);
      setResultadosTopEmpresas(empresasData);
      setResultadosTopCarreras(
        carrerasData.map(c => ({ ...c, tendencia: c.tendencia ?? 0 }))
      );

      const hayData =
        ofertasMesData.length > 0 ||
        donutData.length > 0 ||
        empresasData.length > 0 ||
        carrerasData.length > 0;

      setHayResultados(
        ofertasMesData.length > 0 ||
        donutData.length > 0 ||
        empresasData.length > 0 ||
        carrerasData.length > 0
      );
    } catch (error) {
      console.error("Error cargando estadísticas", error);

      modal.alerta({
      titulo: "Error",
      mensaje: "No fue posible cargar las estadísticas. Intente nuevamente.",
      });

      setHayErrores(true);
      setHayResultados(false);
      setHayErrores(false);
    } finally {
      setLoading(false);
    }
  };

  /* Render */
  return (
    <div className="reportes-ofertas-container">
      <Head title="Panel de Estadísticas de Empleos" />

      {/* Encabezado */}
      <div className="bg-white border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Títulos */}
          <div>
            <h1 className="text-2xl font-bold text-[#D9232E]">
              Panel de Estadísticas de Empleos
            </h1>
            <p className="text-sm text-gray-600 mt-1 max-w-3xl">
              Página para la generación de estadísticas sobre empleos y postulaciones.
            </p>
          </div>

          {/* Botón PDF */}
          {hayResultados && (
            <Button
              variant="destructive"
              disabled={loading || hayErrores}
              onClick={descargarPdf}
              className="h-[42px] w-full sm:w-auto"
            >
              Descargar PDF
            </Button>
          )}

        </div>
      </div>

      {/* Contenido */}
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-black">

      {/* =======================
            FILTROS (SIDEBAR)
        ======================= */}
        <aside
          className="
            lg:col-span-1
            bg-white
            rounded-xl
            shadow
            flex
            flex-col
            h-[calc(100vh-9rem)]
            sticky
            top-24
          "
        >
          {/* CONTENEDOR CON SCROLL */}
          <div
            className="
              flex-1
              overflow-y-auto
              px-5
              py-4
              space-y-6
              scrollbar-thin
              scrollbar-thumb-transparent
              scrollbar-track-transparent
            "
          >
            <h2 className="text-lg font-bold text-[#034991] mb-4">
              Filtros
            </h2>

            <FiltrosEstadisticas
              catalogos={catalogos}
              filtros={filtros}
              actualizarFiltros={actualizarFiltros}
            />

            <div className="flex flex-col gap-3 pt-4">
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700"
                onClick={resetearFiltros}
              >
                Limpiar filtros
              </Button>

              <Button
                disabled={loading || hayErrores}
                className="bg-[#003366] hover:bg-[#002244] text-white"
                onClick={fetchReportes}
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        </aside>

        {/* =======================
            RESULTADOS
        ======================= */}
        <main className="lg:col-span-3 space-y-6">

          {/* KPIs */}
          {kpis && (
            <div className="bg-white rounded-xl shadow p-6">
              <GraficoKpis datos={kpis} />
            </div>
          )}

          {/* Gráficos */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GraficoOfertasMes data={graficoOfertasMes} />
            <GraficoDonutPostulaciones datos={datosPostulaciones} />
          </div>

          {/* Rankings */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TopEmpresas empresas={resultadosTopEmpresas} />
            <CarrerasSolicitadas carreras={resultadosTopCarreras} />
          </div>

        </main>
      </div>

      {/* LOADING OVERLAY */}
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
