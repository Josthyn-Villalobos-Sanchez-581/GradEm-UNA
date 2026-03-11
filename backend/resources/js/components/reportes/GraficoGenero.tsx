import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

interface Props {
  datos: { nombre: string; valor: number }[];
  total: number;
}

/* =======================
   PALETAS
======================= */

type TipoPaleta = "institucional" | "vibrante" | "natural" | "contraste";

const PALETAS: Record<TipoPaleta, string[]> = {
  institucional: ["#1d4ed8", "#dc2626", "#16a34a"],
  vibrante: ["#7c3aed", "#06b6d4", "#f97316"],
  natural: ["#065f46", "#92400e", "#0369a1"],
  contraste: ["#000000", "#c8cbab", "#ef4444"],
};

export default function GraficoGenero({ datos, total }: Props) {

  const [paletaActiva, setPaletaActiva] = useState<TipoPaleta>("institucional");

  const [modoValor, setModoValor] = useState<"porcentaje" | "numero">(
    "porcentaje"
  );

  const colores = PALETAS[paletaActiva];

  const datosProcesados = useMemo(() => {
    return datos
      .filter((d) => d.valor > 0)
      .map((d, index) => ({
        ...d,
        porcentaje: total ? (d.valor / total) * 100 : 0,
        color: colores[index % colores.length],
      }));
  }, [datos, total, colores]);

  const columnas = Math.min(datosProcesados.length, 3);

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
        fontSize={13}
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

      {/* HEADER */}
      <header className="mb-3 flex justify-between items-start">

        <div>
          <h2 className="text-lg font-semibold text-[#034991]">
            Distribución por género
          </h2>

          <p className="text-sm text-gray-600">
            Proporción de egresados
          </p>

          {/* SELECTOR COLORES */}
          <div className="flex gap-2 mt-2">
            {(Object.keys(PALETAS) as TipoPaleta[]).map((key) => (
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
                {PALETAS[key].map((c, i) => (
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

        {/* TOGGLE */}
        <button
          onClick={() => {
            const nuevo = modoValor === "porcentaje" ? "numero" : "porcentaje";
            setModoValor(nuevo);
            localStorage.setItem("graficoPieModo", nuevo);
          }}
          className="
            px-4 py-2 rounded-full border
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

      {/* GRAFICO */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="relative h-[340px]">

          {/* TOTAL CENTRO */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-gray-500">
              Total
            </span>
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
                innerRadius={70}
                outerRadius={115}
                paddingAngle={3}
                label={renderLabel}
                labelLine={false}
              >

                {datosProcesados.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}

              </Pie>

              <Tooltip
                formatter={(value: number, name: string, props: any) => {
                  const porcentaje =
                    props?.payload?.porcentaje?.toFixed(1);

                  return modoValor === "numero"
                    ? [`${value} egresados`, name]
                    : [`${porcentaje}%`, name];
                }}
              />

            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

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
                {item.porcentaje.toFixed(1)}% · {item.valor}
              </p>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}