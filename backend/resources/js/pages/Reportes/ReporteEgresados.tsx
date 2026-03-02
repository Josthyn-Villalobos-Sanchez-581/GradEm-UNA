import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import PpLayout from "@/layouts/PpLayout";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";

import KpiResumen from "@/components/reportes/KPIEgresados";
import TablaEgresados from "@/components/reportes/TablaEgresados";
import GraficoBarrasCarrera from "@/components/reportes/GraficoBarrasCarrera";
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
// MAPEO FILTROS (ACA SE DEFINE QUE FILTROS LLEVARA CADA REPORTE)
// ------------------------------------------------------
const filtrosPorReporte: Record<string, string[]> = {
  barras: [
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
    "estadoEstudios",
    "nivelAcademico",
    "tiempoEmpleo",
    "areaLaboralId",
    "salario",
    "tipoEmpleo",
    "paisId",
    "provinciaId",
    "cantonId",
  ],

  carrera: [
    "universidadId",
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
};

const etiquetasFiltros: Record<string, string> = {
  universidadId: "Universidad",
  carreraId: "Carrera",
  fechaInicio: "Año inicio",
  fechaFin: "Año fin",
  genero: "Género",
  estadoEstudios: "Estado de estudios",
  nivelAcademico: "Nivel académico",
  estadoEmpleo: "Estado de empleo",
  tiempoEmpleo: "Tiempo de empleo",
  areaLaboralId: "Área laboral",
  salario: "Rango salarial",
  tipoEmpleo: "Tipo de empleo",
  paisId: "País",
  provinciaId: "Provincia",
  cantonId: "Cantón",
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
  const REPORTES_DISPONIBLES = ["tabla", "pie", "barras", "carrera"];
  const [cooldownPdf, setCooldownPdf] = useState(false);
  const [filtrosVisibles, setFiltrosVisibles] = useState(true);
  const [filtersCollapsed, setFiltersCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const guardado = localStorage.getItem("filtersCollapsed");
      if (guardado !== null) return guardado === "true";

      return window.innerWidth < 768;
    }
    return false;
  });


  const toggleFilters = () => {
    const v = !filtersCollapsed;
    setFiltersCollapsed(v);
    localStorage.setItem("filtersCollapsed", String(v));
  };



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

  const [tipoReporte, setTipoReporte] = useState<string | null>("multiple");//estados para seleccion del tipo de reporte
  const [reportesSeleccionados, setReportesSeleccionados] = useState<string[]>(REPORTES_DISPONIBLES);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const hoverTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const abrirPanel = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    setPanelAbierto(true);
  };

  const cerrarPanel = () => {
    hoverTimeout.current = setTimeout(() => {
      setPanelAbierto(false);
    }, 250); // ⬅ 250ms de gracia para mover el mouse
  };


  const [resultados, setResultados] = useState<any[]>([]);
  const [graficoCarrera, setGraficoCarrera] = useState<any[]>([]);
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

  //Helper para sincronizar con tipoReporte
  const actualizarTipoReporte = (seleccionados: string[]) => {
    setReportesSeleccionados(seleccionados);

    if (seleccionados.length === 0) {
      setTipoReporte(null);
    } else if (seleccionados.length === 1) {
      setTipoReporte(seleccionados[0]);
    } else {
      setTipoReporte("multiple"); // ✔️ NO "todos"
    }
    //Limpieza del dashboard cuando no hay nada seleccionado
    if (seleccionados.length === 0) {
      setResultados([]);
      setGraficoAnual([]);
      setGraficoEmpleo(null);
      setGraficoCarrera([]);
    }
  };



  const mostrarFiltro = (campo: string) => {
    if (!tipoReporte) return false;

    if (tipoReporte === "multiple") {
      return reportesSeleccionados.some((r) =>
        filtrosPorReporte[r]?.includes(campo)
      );
    }

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
        campo: etiquetasFiltros[campo] ?? campo, // 👈 AQUÍ
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
      let carrera: any[] = [];

      if (reportesSeleccionados.includes("tabla")) {
        const r = await axios.get("/reportes/egresados", { params });
        tabla = r.data?.data ?? [];
      }

      if (reportesSeleccionados.includes("carrera")) {
        const r = await axios.get("/reportes/grafico-por-carrera", { params });
        carrera = r.data?.data ?? [];
        setGraficoCarrera(carrera);
      }



      if (reportesSeleccionados.includes("pie")) {
        const r = await axios.get("/reportes/grafico-empleo", { params });
        pie = r.data?.data ?? null;
      }

      if (reportesSeleccionados.includes("barras")) {
        const r = await axios.get("/reportes/grafico-anual", { params });
        barras = r.data?.data ?? [];
      }


      setResultados(tabla);
      setGraficoEmpleo(pie);
      setGraficoAnual(barras);

      const hayDatos =
        tabla.length > 0 ||
        barras.length > 0 ||
        carrera.length > 0 ||
        (pie &&
          pie.empleados + pie.desempleados + pie.no_especificado > 0);


      if (!hayDatos) {
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
    if (reportesSeleccionados.length === 0 || cooldownPdf) return;

    const params = obtenerParametrosBackend();
    setCooldownPdf(true);

    try {
      const res = await axios.post(
        "/reportes/descargar-pdf",
        {
          reportes: reportesSeleccionados,
          parametros: params,
          filtrosLegibles,
          // 🔽 NUEVO
          visual: {
            barras: {
              paleta: localStorage.getItem("graficoAnualColor") || "azul",
              modo: localStorage.getItem("graficoBarrasModo") || "numero",
            },
            carrera: {
              paleta: localStorage.getItem("graficoCarreraColor") || "azul",
            },
            pie: {
              paleta: localStorage.getItem("graficoPiePaleta") || "institucional",
              modo: localStorage.getItem("graficoPieModo") || "porcentaje",
            },
          },
        },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "Reporte_GradEm_UNA.pdf";
      a.click();
      window.URL.revokeObjectURL(url);

      // ✅ MODAL ÉXITO
      modal.alerta({
        titulo: "Descarga completada",
        mensaje: "El reporte se descargó exitosamente.",
      });
    } catch {
      // ❌ MODAL ERROR
      modal.alerta({
        titulo: "Error inesperado",
        mensaje: "Ocurrió un problema al generar el PDF. Intente nuevamente.",
      });
    } finally {
      setTimeout(() => {
        setCooldownPdf(false);
      }, 5000);
    }
  };



  const datosPie = graficoEmpleo
    ? [
      { nombre: "Empleados", valor: graficoEmpleo.empleados },
      { nombre: "Desempleados", valor: graficoEmpleo.desempleados },
      { nombre: "No especificado", valor: graficoEmpleo.no_especificado },
    ]
    : [];

  useEffect(() => {
    // Solo al montar
    fetchReportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <>
      <Head title="Reportes de Egresados" />

      <div className="min-h-screen py-10 text-black">
        <div className="w-full px-6 space-y-6 text-black">


          {/* Encabezado */}
          <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="text-2xl font-bold text-[#034991]">
              Reportes de Egresados
            </h1>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 w-full lg:w-auto">

              {/* Selector tipo */}
              <div
                className="relative"
                onMouseEnter={abrirPanel}
                onMouseLeave={cerrarPanel}
              >
                <div
                  onClick={() => setPanelAbierto(!panelAbierto)}
                  className="
                              flex items-center justify-between gap-2 px-4 py-2 rounded-full
                              bg-white border border-gray-300 shadow-sm
                              cursor-pointer hover:shadow-md transition
                            "
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-black">
                      Seleccione los reportes
                    </span>

                    {reportesSeleccionados.length > 0 && (
                      <span className="text-xs bg-[#034991] text-white px-2 py-0.5 rounded-full">
                        {reportesSeleccionados.length}
                      </span>
                    )}
                  </div>

                  {/* Flecha tipo select */}
                  <svg
                    className={`
                                w-4 h-4 text-gray-500 transition-transform
                                ${panelAbierto ? "rotate-180" : ""}
                              `}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>



                {/* Panel flotante */}
                <div
                  className={`
                              absolute z-20 mt-2 w-56
                              bg-white rounded-xl shadow-xl border
                              p-4 space-y-3
                              transition
                              ${panelAbierto ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                            `}
                >
                  {[
                    { id: "todos", label: "Todos los reportes" },
                    { id: "tabla", label: "Tabla de egresados" },
                    { id: "carrera", label: "Gráfico por carrera" },
                    { id: "barras", label: "Gráfico barras" },
                    { id: "pie", label: "Gráfico pie" },
                  ].map((opcion) => (
                    <label
                      key={opcion.id}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          opcion.id === "todos"
                            ? REPORTES_DISPONIBLES.every(r => reportesSeleccionados.includes(r))
                            : reportesSeleccionados.includes(opcion.id)
                        }


                        onChange={(e) => {
                          let nuevos: string[] = [];

                          if (opcion.id === "todos") {
                            nuevos = e.target.checked ? [...REPORTES_DISPONIBLES] : [];
                          } else {
                            nuevos = e.target.checked
                              ? [...reportesSeleccionados.filter(r => r !== "todos"), opcion.id]
                              : reportesSeleccionados.filter(r => r !== opcion.id);
                          }

                          actualizarTipoReporte(nuevos);
                        }}
                        className="
                      h-4 w-4 rounded border-gray-300
                      text-[#034991] focus:ring-[#034991]
                      "
                      />
                      <span className="text-sm text-black">
                        {opcion.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>


              {/* Botones */}
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  onClick={fetchReportes}
                  disabled={!tipoReporte || hayErrores || loading}
                  className="w-full sm:w-auto h-[42px] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generando...
                    </>
                  ) : (
                    "Generar reporte"
                  )}
                </Button>


                {hayResultados && (
                  <Button
                    variant="destructive"
                    onClick={descargarPdf}
                    disabled={cooldownPdf}
                    className="w-full sm:w-auto h-[42px] flex items-center justify-center gap-2"
                  >
                    {cooldownPdf ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Espere...
                      </>
                    ) : (
                      "Descargar PDF"
                    )}
                  </Button>

                )}
              </div>
            </div>
          </header>


          {/* Contenido */}
          <div className="flex w-full gap-6 text-black relative">
            {/* Filtros */}
            {tipoReporte && (
              <aside
                className={`
                  relative shrink-0
                  transition-all duration-500 ease-in-out
                  border-r border-gray-200
                  bg-gray-50
                  ${filtersCollapsed ? "w-16" : "w-80"}
                `}
              >

                <button
                  onClick={toggleFilters}
                  className="
                              absolute
                              top-20 md:top-28
                              -right-3
                              w-7 h-7
                              rounded-full
                              bg-white
                              border border-gray-300
                              shadow-md
                              flex items-center justify-center
                              z-30
                              transition
                              hover:scale-110
                            "
                >
                  <span
                    className={`
                      text-gray-600 text-sm
                      transition-transform duration-300
                      ${filtersCollapsed ? "rotate-180" : ""}
                    `}
                  >
                    ❯
                  </span>
                </button>

                {/* CONTENIDO DE FILTROS */}
                <div
                  className={`
                    transition-opacity duration-300
                    ${filtersCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}
                  `}
                >
                  <ReportesFiltros
                    catalogos={catalogos}
                    filtros={filtros}
                    actualizarFiltros={actualizarFiltros}
                    setErroresGlobales={setHayErrores}
                    mostrarFiltro={mostrarFiltro}
                  />
                </div>
              </aside>
            )}
            {!tipoReporte && (
              <div className="lg:col-span-1 flex items-center justify-center text-gray-600 italic">
                Seleccione el tipo de reporte
              </div>
            )}





            {/* CONTENIDO DE REPORTES */}
            <main className="flex-1 space-y-6 min-w-0">

              {loading && (
                <p className="text-center text-gray-600">Cargando...</p>
              )}

              {/* ================= KPI ================= */}
              {reportesSeleccionados.length > 0 && hayResultados && (
                <KpiResumen
                  resultados={resultados}
                  graficoEmpleo={graficoEmpleo}
                  graficoAnual={graficoAnual}
                  graficoCarrera={graficoCarrera}
                />
              )}

              {/* ======================= */}
              {/* GRÁFICOS DASHBOARD     */}
              {/* ======================= */}

              {/* 1️⃣ Gráfico anual arriba (full width) */}
              {reportesSeleccionados.includes("barras") &&
                graficoAnual.length > 0 && (
                  <GraficoBarras filas={graficoAnual} />
                )}

              {/* 2️⃣ Carrera + Pie abajo */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {reportesSeleccionados.includes("carrera") &&
                  graficoCarrera.length > 0 && (
                    <GraficoBarrasCarrera filas={graficoCarrera} />
                  )}

                {reportesSeleccionados.includes("pie") &&
                  graficoEmpleo && (
                    <GraficoPie datos={datosPie} />
                  )}
              </div>

              {reportesSeleccionados.includes("tabla") &&
                resultados.length > 0 && (
                  <section className="flex-1 transition-all duration-500">
                    <div className="bg-white shadow-lg rounded-xl p-6">
                      <h2 className="font-semibold mb-4">
                        Detalle de egresados
                      </h2>
                      <TablaEgresados filas={resultados} />
                    </div>
                  </section>
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
