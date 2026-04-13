import React, { useMemo, useState } from "react";
import { TooltipProps } from "recharts";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

export interface PorcionPie {
  nombre: string;
  valor: number;
}

interface Props {
  datos: PorcionPie[];
}

/* =======================
   PALETAS FIJAS (SIN GRADIENTES)
======================= */
const PALETAS_PIE: Record<string, string[]> = {
  institucional: ["#1d4ed8", "#dc2626", "#16a34a", "#f59e0b"],
  vibrante: ["#7c3aed", "#06b6d4", "#f97316", "#84cc16"],
  natural: ["#065f46", "#92400e", "#0369a1", "#7c2d12"],
  contraste: ["#000000", "#c8cbab", "#ef4444", "#22c55e"],
};

export default function GraficoPie({ datos }: Props) {
  const total = datos.reduce((acc, d) => acc + d.valor, 0);

  const [paletaActiva, setPaletaActiva] = useState(() => {
    return localStorage.getItem("graficoPiePaleta") || "institucional";
  });

  const [modoValor, setModoValor] = useState<"porcentaje" | "numero">(() => {
    return (localStorage.getItem("graficoPieModo") as any) || "porcentaje";
  });

  const formatter: TooltipProps<number, string>["formatter"] = (
    value,
    name,
    props
  ) => {
    const numero = value ?? 0;

    const porcentaje = props?.payload?.porcentaje
      ? props.payload.porcentaje.toFixed(1)
      : "0";

    return [
      modoValor === "numero"
        ? `${numero} egresados`
        : `${porcentaje}%`,
      name,
    ];
  };

  const colores = PALETAS_PIE[paletaActiva] || PALETAS_PIE.institucional;

  const datosProcesados = useMemo(() => {
    if (!datos) return [];
    return datos.map((d, index) => ({
      ...d,
      porcentaje: total ? (d.valor / total) * 100 : 0,
      color: colores[index % colores.length],
    }));
  }, [datos, total, colores]);

  const columnas = Math.min(datosProcesados.length, 3);

  if (!datos || datos.length === 0 || total === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 min-h-[420px] flex items-center justify-center">
        <p className="text-gray-600">
          No existen registros para los filtros seleccionados.
        </p>
      </div>
    );
  }

  /* =======================
     DATOS CON PORCENTAJE
  ======================= */

  /* =======================
     LABEL INTERNO
  ======================= */
  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
  }: any) => {
    if (value === 0 || percent === 0) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {modoValor === "porcentaje"
          ? `${(percent * 100).toFixed(1)}%`
          : value}
      </text>
    );
  };

  return (
    <section className="bg-white shadow-xl rounded-2xl p-6 h-[560px] flex flex-col">
      {/* =======================
          HEADER
      ======================= */}
      <header className="mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#034991]">
            Estado laboral de egresados
          </h2>
          <p className="text-sm text-gray-600">
            Distribución del estado de empleo
          </p>

          {/* SELECTOR DE PALETA */}
          <div className="flex gap-2 mt-2">

            {Object.keys(PALETAS_PIE).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setPaletaActiva(key);
                  localStorage.setItem("graficoPiePaleta", key);
                }}
                className={`
                  flex gap-1 p-1 rounded-full border transition
                  ${paletaActiva === key ? "ring-2 ring-gray-400 scale-105" : ""}
                `}
              >
                {PALETAS_PIE[key].slice(0, 3).map((c, i) => (
                  <span
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </button>
            ))}
          </div>
        </div>

        {/* TOGGLE MODO */}
        <button
          onClick={() => {
            const nuevo = modoValor === "porcentaje" ? "numero" : "porcentaje";
            setModoValor(nuevo);
            localStorage.setItem("graficoPieModo", nuevo);
          }}
          className="
            px-4 py-2 
            rounded-full border
            text-sm font-medium
            bg-gray-100 hover:bg-gray-200
            transition
          "
        >
          {modoValor === "porcentaje"
            ? "Ver números"
            : "Ver porcentajes"}
        </button>
      </header>

      {/* =======================
          GRÁFICO
      ======================= */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="relative h-[340px]">
          {/* TOTAL CENTRAL */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-gray-500">Total</span>
            <span className="text-2xl font-bold">
              {total}
            </span>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={datosProcesados}
                dataKey="valor"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={115}
                paddingAngle={3}
                label={renderLabel}
                labelLine={false}
                animationDuration={800}
              >
                {datosProcesados.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>

              <Tooltip formatter={formatter} />

            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* =======================
            LEYENDA INFERIOR
        ======================= */}
        {/* LEYENDA */}
        <div
          className="mt-3 grid gap-2 overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }}
        >
          {datosProcesados.map((item) => (
            <div
              key={item.nombre}
              className="flex items-center gap-2 border rounded-md px-2 py-2 bg-gray-50 min-w-0"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="text-xs min-w-0">
                <p className="text-gray-700 truncate">
                  {item.nombre}
                </p>
                <p className="text-gray-500">
                  {item.porcentaje.toFixed(1)}% · {item.valor} egresados
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
