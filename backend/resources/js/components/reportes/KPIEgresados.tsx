import React, { useMemo } from "react";

interface GraficoEmpleo {
  empleados: number;
  desempleados: number;
  no_especificado: number;
}

interface GraficoAnualRow {
  anio: string | number;
  total_egresados: number;
}

interface Props {
  resultados: any[];
  graficoEmpleo: GraficoEmpleo | null;
  graficoAnual: GraficoAnualRow[];
  graficoCarrera: { carrera: string; total_egresados: number }[];
}

export default function KpiResumen({
  resultados,
  graficoEmpleo,
  graficoAnual,
  graficoCarrera,
}: Props) {
  const totalEgresados = resultados.length;

  const anioMax = useMemo(() => {
    if (!graficoAnual.length) return null;

    return graficoAnual.reduce((max, item) =>
      item.total_egresados > max.total_egresados ? item : max
    );
  }, [graficoAnual]);

  const totalSinEmpleo = graficoEmpleo
    ? graficoEmpleo.desempleados + graficoEmpleo.no_especificado
    : 0;

  const carreraTop = useMemo(() => {
    if (!graficoCarrera?.length) return null;

    return graficoCarrera.reduce((max, item) =>
      item.total_egresados > max.total_egresados ? item : max
    );
  }, [graficoCarrera]);

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* ================= TOTAL EGRESADOS ================= */}
        <div className="flex flex-col items-center text-center">
          <span className="text-3xl font-bold text-[#034991]">
            {totalEgresados}
          </span>
          <span className="text-sm text-gray-500 mt-1">
            Total egresados
          </span>
          <span className="text-xs text-gray-400 mt-1">
            Registros encontrados
          </span>
        </div>

        {/* ================= CARRERA TOP ================= */}
        {carreraTop && (
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl font-bold text-indigo-600">
              {carreraTop.total_egresados}
            </span>
            <span className="text-sm text-gray-500 mt-1">
              Egresados en la carrera
            </span>
            <span className="text-xs font-medium text-gray-600 mt-2 text-center max-w-[220px] break-words">
              {carreraTop.carrera}
            </span>
          </div>
        )}

        {/* ================= EMPLEO ================= */}
        {graficoEmpleo && (
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl font-bold text-green-600">
              {graficoEmpleo.empleados}
            </span>
            <span className="text-sm text-gray-500 mt-1">
              Con empleo
            </span>
            <span className="text-xs text-gray-400 mt-1">
              Sin empleo: {totalSinEmpleo}
            </span>
          </div>
        )}

        {/* ================= AÑO TOP ================= */}
        {anioMax && (
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl font-bold text-purple-600">
              {anioMax.total_egresados}
            </span>
            <span className="text-sm text-gray-500 mt-1">
              Egresados en el año
            </span>
            <span className="text-xs font-medium text-gray-600 mt-2">
              {anioMax.anio}
            </span>
          </div>
        )}

      </div>
    </div>
  );
}