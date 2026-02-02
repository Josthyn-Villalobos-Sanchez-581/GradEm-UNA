import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Cell,
} from "recharts";

export interface FilaGraficoAnual {
  anio: number | string;
  total_egresados: number;
}

interface Props {
  filas: FilaGraficoAnual[];
}

/* =======================
   PALETAS PREDEFINIDAS
======================= */
const PALETAS: Record<string, string[]> = {
  azul: ["#034991", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"],
  verde: ["#065f46", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
  morado: ["#5b21b6", "#7c3aed", "#a78bfa", "#c4b5fd", "#ddd6fe"],
  naranja: ["#9a3412", "#f97316", "#fb923c", "#fdba74", "#fed7aa"],
};

/* =======================
   UTILIDADES DE COLOR
======================= */
const hexToRgb = (hex: string) => {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")}`;

const interpolarColor = (c1: string, c2: string, ratio: number) => {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);

  return rgbToHex(
    Math.round(a.r + (b.r - a.r) * ratio),
    Math.round(a.g + (b.g - a.g) * ratio),
    Math.round(a.b + (b.b - a.b) * ratio)
  );
};

const obtenerColorPorIndice = (
  paleta: string[],
  index: number,
  total: number
) => {
  if (total <= 1) return paleta[0];

  const posicion = index / (total - 1);
  const escala = posicion * (paleta.length - 1);

  const i = Math.floor(escala);
  const ratio = escala - i;

  const color1 = paleta[i];
  const color2 = paleta[i + 1] ?? paleta[i];

  return interpolarColor(color1, color2, ratio);
};

/* =======================
   TOOLTIP PREMIUM
======================= */
const TooltipPremium = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const { anio, total_egresados, porcentaje } = payload[0].payload;

  return (
    <div className="bg-white rounded-xl shadow-xl border px-4 py-2 text-sm">
      <p className="font-semibold text-[#034991] text-base">
        Año {anio}
      </p>
      <p className="text-gray-800">
        Egresados: <span className="font-bold">{total_egresados}</span>
      </p>
      <p className="text-gray-500 text-xs">
        {porcentaje.toFixed(1)}% del total
      </p>
    </div>
  );
};

/* =======================
   COMPONENTE PRINCIPAL
======================= */
export default function GraficoBarrasAnual({ filas }: Props) {
  const [horizontal, setHorizontal] = useState(false);

  const [paletaActiva, setPaletaActiva] = useState(() => {
    return localStorage.getItem("graficoAnualColor") || "azul";
  });

  const colores = PALETAS[paletaActiva];

  if (!filas || filas.length === 0) return null;

  /* =======================
     PREPARAR DATOS
  ======================= */
  const datos = useMemo(() => {
    const total = filas.reduce((s, f) => s + f.total_egresados, 0);

    return [...filas]
      .sort((a, b) => Number(a.anio) - Number(b.anio))
      .map((f) => ({
        ...f,
        porcentaje: total ? (f.total_egresados / total) * 100 : 0,
      }));
  }, [filas]);

  const necesitaScroll = datos.length > 7;

  return (
    <section className="bg-white shadow-xl rounded-2xl p-6">
      {/* HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#034991]">
            Egresados por año
          </h2>
          <p className="text-sm text-gray-600">
            Distribución anual de egresados
          </p>

          {/* SELECTOR DE COLOR */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm font-medium text-gray-700">
              Color del gráfico:
            </span>

            {Object.keys(PALETAS).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setPaletaActiva(key);
                  localStorage.setItem("graficoAnualColor", key);
                }}
                className={`
                  w-6 h-6 rounded-full border transition
                  ${paletaActiva === key ? "ring-2 ring-gray-400 scale-110" : ""}
                `}
                style={{ backgroundColor: PALETAS[key][0] }}
                title={key}
              />
            ))}
          </div>
        </div>

        {/* ORIENTACIÓN */}
        <button
          onClick={() => setHorizontal((v) => !v)}
          className="
            px-4 py-2 rounded-full border
            text-sm font-medium
            bg-gray-100 hover:bg-gray-200
            transition
          "
        >
          {horizontal ? "Vista vertical" : "Vista horizontal"}
        </button>
      </header>

      {/* GRÁFICO */}
      <div
        className={`w-full ${
          necesitaScroll && horizontal ? "max-h-[420px] overflow-y-auto" : ""
        }`}
      >
        <div className={horizontal ? "h-[480px]" : "h-[380px]"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datos}
              layout={horizontal ? "vertical" : "horizontal"}
              margin={{ top: 20, right: 30, left: 30, bottom: 70 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                horizontal={!horizontal}
                vertical={horizontal}
              />

              {horizontal ? (
                <>
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 13, fill: "#1f2937" }}
                  />
                  <YAxis
                    dataKey="anio"
                    type="category"
                    width={80}
                    tick={{ fontSize: 13, fill: "#1f2937" }}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey="anio"
                    interval={0}
                    tick={{ fontSize: 13, fill: "#1f2937" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 13, fill: "#1f2937" }}
                  />
                </>
              )}

              <Tooltip content={<TooltipPremium />} />

              <Bar
                key={paletaActiva}
                dataKey="total_egresados"
                radius={[12, 12, 12, 12]}
                animationDuration={900}
              >
                <LabelList
                  dataKey="total_egresados"
                  position={horizontal ? "right" : "top"}
                  className="text-sm fill-gray-800 font-medium"
                />

                {datos.map((_, i) => (
                  <Cell
                    key={i}
                    fill={obtenerColorPorIndice(colores, i, datos.length)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
