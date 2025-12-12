// ------------------------------------------------------
// TIPOS REQUERIDOS PARA GRÁFICOS
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
// MAPEO DE FILTROS POR TIPO DE REPORTE
// ------------------------------------------------------
const filtrosPorReporte: Record<string, string[]> = {
  barras: [
    "universidadId",
    "carreraId",
    "fechaInicio",
    "fechaFin",
    "genero",
    "estadoEmpleo",
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

  const {
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    obtenerParametrosBackend,
  } = useParametrosReporte();

  const [tipoReporte, setTipoReporte] = useState<string | null>(null);
  const mostrarFiltro = (campo: string) => {
    if (!tipoReporte) return false;

    // Si selecciona "todos", mostrar todos los filtros
    if (tipoReporte === "todos") return true;

    // Para los otros tipos, mostrar solo los definidos
    return filtrosPorReporte[tipoReporte]?.includes(campo);
  };

  const [resultados, setResultados] = useState<any[]>([]);
  const [graficoEmpleo, setGraficoEmpleo] = useState<GraficoEmpleo | null>(null);
  const [graficoAnual, setGraficoAnual] = useState<GraficoAnualRow[]>([]);
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------
  // GENERAR REPORTE
  // -------------------------------------------------------
  const fetchReportes = async () => {
    if (!tipoReporte) {
      modal.alerta({
        titulo: "Reporte no seleccionado",
        mensaje: "Debe seleccionar un tipo de reporte antes de generar.",
      });
      return;
    }

    if (hayErrores) {
      modal.alerta({
        titulo: "Errores en el formulario",
        mensaje: "Debe corregir los errores antes de generar el reporte.",
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

      // Modal si todo está vacío
      if (
        tabla.length === 0 &&
        (!pie ||
          (pie.empleados === 0 &&
            pie.desempleados === 0 &&
            pie.no_especificado === 0)) &&
        barras.length === 0
      ) {
        modal.alerta({
          titulo: "Sin resultados",
          mensaje: "No se encontraron resultados con los filtros aplicados.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // DATOS PARA GRÁFICO PIE
  // -------------------------------------------------------
  const datosPie =
    graficoEmpleo
      ? [
        { nombre: "Empleados", valor: graficoEmpleo.empleados ?? 0 },
        { nombre: "Desempleados", valor: graficoEmpleo.desempleados ?? 0 },
        { nombre: "No especificado", valor: graficoEmpleo.no_especificado ?? 0 },
      ]
      : [];

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <>
      <Head title="Reportes - Egresados" />

      <div className="font-display bg-[#f5f7f8] min-h-screen flex justify-center py-10 text-black">
        <div className="bg-white rounded-xl shadow-sm w-full max-w-7xl p-8">
          <h1 className="text-2xl font-bold text-[#034991] mb-6">
            Reporte de Egresados
          </h1>

          {/* Select tipo de reporte */}
          <div className="mb-6">
            <label className="font-bold text-[#034991]">Tipo de reporte:</label>
            <select
              className="border p-2 rounded ml-3"
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
          {/* Si no se ha seleccionado tipo de reporte → no mostrar filtros */}
          {!tipoReporte && (
            <div className="text-center text-gray-600 text-lg py-10">
              Seleccione el tipo de reporte para continuar.
            </div>
          )}
          {tipoReporte && (
            <ReportesFiltros
              catalogos={catalogos}
              filtros={filtros}
              actualizarFiltros={actualizarFiltros}
              setErroresGlobales={setHayErrores}
              mostrarFiltro={mostrarFiltro} // 🔥 SE LO PASAMOS AL COMPONENTE
            />
          )}

          {/* Botón */}
          {tipoReporte && !hayErrores && (
            <div className="text-center mt-6 mb-8">
              <Button className="px-10 py-3" onClick={fetchReportes}>
                Generar Reporte
              </Button>
            </div>
          )}

          {hayErrores && (
            <p className="text-red-600 font-semibold mt-2 flex justify-center">
              Corrija los errores para generar el reporte.
            </p>
          )}

          {!tipoReporte && (
            <p className="text-red-600 font-semibold mt-2 flex justify-center">
              Seleccione el ripo de reporte para continuar.
            </p>
          )}

          {loading && <p className="mt-4 text-center">Cargando...</p>}

          {(tipoReporte === "tabla" || tipoReporte === "todos") &&
            resultados.length > 0 && <TablaEgresados filas={resultados} />}

          {(tipoReporte === "pie" || tipoReporte === "todos") &&
            graficoEmpleo && <GraficoPie datos={datosPie} />}

          {(tipoReporte === "barras" || tipoReporte === "todos") &&
            graficoAnual.length > 0 && (
              <GraficoBarras filas={graficoAnual} />
            )}
        </div>
      </div>
    </>
  );
}

ReporteEgresados.layout = (page: any) => {
  const permisos = page.props.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
