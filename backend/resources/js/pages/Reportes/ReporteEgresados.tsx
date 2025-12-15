import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import PpLayout from "@/layouts/PpLayout";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";

import TablaEgresados from "@/components/reportes/TablaEgresados";
import GraficoPie from "@/components/reportes/GraficoPie";
import GraficoBarras from "@/components/reportes/GraficoBarras";
import ReportesFiltros from "@/components/reportes/ReportesFiltros";

import { useParametrosReporte } from "@/hooks/useParametrosReporte";

// ------------------------------------------------------
// TIPOS
// ------------------------------------------------------
interface GraficoEmpleo {
  empleados: number;
  desempleados: number;
  no_especificado: number;
}

interface GraficoAnualRow {
  anio: string | number;
  total_egresados: number;
}

interface Catalogo {
  universidades: any[];
  carreras: any[];
  areasLaborales: any[];
  paises: any[];
  provincias: any[];
  cantones: any[];
  generos: { id: string; nombre: string }[];
  estadosEstudios: { id: string; nombre: string }[];
  nivelesAcademicos: { id: string; nombre: string }[];
  estadosEmpleo: { id: string; nombre: string }[];
  rangosSalariales: { id: string; nombre: string }[];
  tiposEmpleo: { id: string; nombre: string }[];
}

// ------------------------------------------------------
// MAPEO FILTROS
// ------------------------------------------------------
const filtrosPorReporte: Record<string, string[]> = {
  barras: ["universidadId", "carreraId", "fechaInicio", "fechaFin", "genero", "estadoEmpleo"],
  tabla: [
    "universidadId",
    "carreraId",
    "fechaInicio",
    "fechaFin",
    "genero",
    "estadoEstudios",
    "nivelAcademico",
    "estadoEmpleo",
    "tiempoEmpleo",
    "areaLaboralId",
    "salario",
    "tipoEmpleo",
    "paisId",
    "provinciaId",
    "cantonId",
  ],

  pie: [
    "universidadId",
    "carreraId",
    "fechaInicio",
    "fechaFin",
    "genero",
  ],
};

// ------------------------------------------------------
// RESOLVER ID -> NOMBRE DESDE CATÁLOGOS
// ------------------------------------------------------
const resolverNombre = (
  catalogo: { id: any; nombre: string }[],
  valor: any
) => {
  const item = catalogo.find((c) => String(c.id) === String(valor));
  return item ? item.nombre : valor;
};


interface Props {
  userPermisos: number[];
  catalogosIniciales: Catalogo;
}

export default function ReporteEgresados({
  userPermisos,
  catalogosIniciales,
}: Props) {
  const modal = useModal();
  const [hayErrores, setHayErrores] = useState(false);
  const [catalogos] = useState(catalogosIniciales);

  // ------------------------------------------------------
  // CATÁLOGO ASOCIADO A CADA FILTRO
  // ------------------------------------------------------
  const catalogoPorFiltro: Record<string, any[] | null> = {
    universidadId: catalogos.universidades,
    carreraId: catalogos.carreras,
    areaLaboralId: catalogos.areasLaborales,
    paisId: catalogos.paises,
    provinciaId: catalogos.provincias,
    cantonId: catalogos.cantones,

    genero: catalogos.generos,
    estadoEstudios: catalogos.estadosEstudios,
    nivelAcademico: catalogos.nivelesAcademicos,
    estadoEmpleo: catalogos.estadosEmpleo,
    salario: catalogos.rangosSalariales,
    tipoEmpleo: catalogos.tiposEmpleo,

    fechaInicio: null,
    fechaFin: null,
  };


  const {
    filtros,
    actualizarFiltros,
    obtenerParametrosBackend,
  } = useParametrosReporte();

  const [tipoReporte, setTipoReporte] = useState<string | null>(null);
  const [resultados, setResultados] = useState<any[]>([]);
  const [graficoEmpleo, setGraficoEmpleo] = useState<GraficoEmpleo | null>(null);
  const [graficoAnual, setGraficoAnual] = useState<GraficoAnualRow[]>([]);
  const [loading, setLoading] = useState(false);

  const hayResultados =
    resultados.length > 0 ||
    graficoAnual.length > 0 ||
    (graficoEmpleo &&
      graficoEmpleo.empleados +
      graficoEmpleo.desempleados +
      graficoEmpleo.no_especificado >
      0);


  const mostrarFiltro = (campo: string) => {
    if (!tipoReporte) return false;
    if (tipoReporte === "todos") return true;
    return filtrosPorReporte[tipoReporte]?.includes(campo);
  };

  // -------------------------------------------------------
  // FILTROS LEGIBLES (ID -> NOMBRE)
  // -------------------------------------------------------
  const filtrosLegibles = Object.entries(filtros)
    .filter(([_, valor]) => valor !== null && valor !== "")
    .map(([campo, valor]) => {
      const catalogo = catalogoPorFiltro[campo];

      return {
        campo,
        valor: catalogo
          ? resolverNombre(catalogo, valor)
          : valor,
      };
    });


  // -------------------------------------------------------
  // GENERAR REPORTE
  // -------------------------------------------------------
  const fetchReportes = async () => {
    if (!tipoReporte) {
      modal.alerta({
        titulo: "Reporte no seleccionado",
        mensaje: "Debe seleccionar el tipo de reporte.",
      });
      return;
    }

    if (hayErrores) {
      modal.alerta({
        titulo: "Errores en filtros",
        mensaje: "Corrija los errores antes de continuar.",
      });
      return;
    }

    const params = obtenerParametrosBackend();
    setLoading(true);

    try {
      let tabla: any[] = [];
      let pie: GraficoEmpleo | null = null;
      let barras: GraficoAnualRow[] = [];

      if (["tabla", "todos"].includes(tipoReporte)) {
        const r = await axios.get("/reportes/egresados", { params });
        tabla = r.data?.data ?? [];
      }

      if (["pie", "todos"].includes(tipoReporte)) {
        const r = await axios.get("/reportes/grafico-empleo", { params });
        pie = r.data?.data ?? null;
      }

      if (["barras", "todos"].includes(tipoReporte)) {
        const r = await axios.get("/reportes/grafico-anual", { params });
        barras = r.data?.data ?? [];
      }

      setResultados(tabla);
      setGraficoEmpleo(pie);
      setGraficoAnual(barras);

      if (
        tabla.length === 0 &&
        (!pie || (pie.empleados + pie.desempleados + pie.no_especificado === 0)) &&
        barras.length === 0
      ) {
        modal.alerta({
          titulo: "Sin resultados",
          mensaje: "No se encontraron datos con los filtros aplicados.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const descargarPdf = async () => {
    if (!tipoReporte) return;

    const params = obtenerParametrosBackend();

    try {
      const res = await axios.post(
        "/reportes/descargar-pdf",
        {
          tipoReporte,
          parametros: params,
          filtrosLegibles,
        },
        { responseType: "blob" }
      );


      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "Reporte_GradEm_UNA.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      modal.alerta({
        titulo: "Error",
        mensaje: "No fue posible generar el PDF del reporte.",
      });
    }
  };


  const datosPie = graficoEmpleo
    ? [
      { nombre: "Empleados", valor: graficoEmpleo.empleados },
      { nombre: "Desempleados", valor: graficoEmpleo.desempleados },
      { nombre: "No especificado", valor: graficoEmpleo.no_especificado },
    ]
    : [];

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <>
      <Head title="Reportes de Egresados" />

      <div className="min-h-screen bg-gray-100 py-10 text-black">
        <div className="w-full px-6 space-y-6 text-black">


          {/* Encabezado */}
          <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="text-2xl font-bold text-[#034991]">
              Reportes de Egresados
            </h1>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 w-full lg:w-auto">

              {/* Selector tipo */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="text-base font-medium text-black whitespace-nowrap">
                  Tipo de reporte
                </label>

                <select
                  className="w-full sm:w-auto min-w-[180px]
        text-base border border-gray-300 rounded-md
        px-2 py-2 bg-white text-black
        focus:ring-1 focus:ring-[#034991]"
                  value={tipoReporte ?? ""}
                  onChange={(e) => setTipoReporte(e.target.value || null)}
                >
                  <option value="">Seleccione</option>
                  <option value="tabla">Tabla</option>
                  <option value="pie">Gráfico pie</option>
                  <option value="barras">Gráfico barras</option>
                  <option value="todos">Todos</option>
                </select>
              </div>

              {/* Botones */}
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  onClick={fetchReportes}
                  disabled={!tipoReporte || hayErrores}
                  className="w-full sm:w-auto h-[42px]"
                >
                  Generar reporte
                </Button>

                {hayResultados && (
                  <Button
                    variant="destructive"
                    onClick={descargarPdf}
                    className="w-full sm:w-auto h-[42px]"
                  >
                    Descargar PDF
                  </Button>
                )}
              </div>
            </div>
          </header>




          {/* Contenido */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-black">

            {/* Filtros */}
            <aside className="lg:col-span-1 bg-white rounded-xl shadow flex flex-col h-[calc(100vh-9rem)] sticky top-24">

              {/* CONTENEDOR CON SCROLL */}
              <div
                className="
                            flex-1 overflow-y-auto px-5 py-4 space-y-4
                            scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent
                          "
                style={{ direction: "rtl" }}
              >
                <div style={{ direction: "ltr" }}>
                  {tipoReporte ? (
                    <ReportesFiltros
                      catalogos={catalogos}
                      filtros={filtros}
                      actualizarFiltros={actualizarFiltros}
                      setErroresGlobales={setHayErrores}
                      mostrarFiltro={mostrarFiltro}
                    />
                  ) : (
                    <p className="text-center text-gray-600">
                      Seleccione el tipo de reporte
                    </p>
                  )}
                </div>
              </div>
            </aside>



            {/* Resultados */}
            <main className="lg:col-span-3 space-y-6">

              {loading && (
                <p className="text-center text-gray-600">Cargando...</p>
              )}

              {(tipoReporte === "pie" || tipoReporte === "todos") &&
                graficoEmpleo && (
                  <GraficoPie datos={datosPie} />
                )}


              {(tipoReporte === "barras" || tipoReporte === "todos") &&
                graficoAnual.length > 0 && (
                  <GraficoBarras filas={graficoAnual} />
                )}


              {(tipoReporte === "tabla" || tipoReporte === "todos") &&
                resultados.length > 0 && (
                  <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="font-semibold mb-4">
                      Detalle de egresados
                    </h2>
                    <TablaEgresados filas={resultados} />
                  </div>
                )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

ReporteEgresados.layout = (page: any) => {
  const permisos = page.props.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
