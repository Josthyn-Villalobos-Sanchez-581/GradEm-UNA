import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";

export interface FilaGraficoAnual {
  anio: number | string;
  total_egresados: number;
}

interface Props {
  filas: FilaGraficoAnual[];
}

export default function GraficoBarras({ filas }: Props) {
  if (!filas || filas.length === 0) {
    return (
      <p className="text-gray-600 text-center mt-4">
        No hay datos para mostrar en el gráfico de barras.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[420px]">
      <h2 className="font-semibold mb-4 text-black">
        Egresados por año
      </h2>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filas}
            margin={{
              top: 20,
              right: 10,
              left: 0, // ⬅️ espacio real para el label
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="anio"
              tick={{ fill: "#000", fontSize: 12 }}
              label={{
                value: "Año de graduación",
                position: "insideBottom",
                offset: -25,
                fill: "#000",
              }}
            />

            <YAxis
              allowDecimals={false}
              tick={{ fill: "#000", fontSize: 12 }}
              label={{
                value: "Cantidad de egresados",
                angle: -90,
                position: "center", // ✅ válido en TS
                offset: 15,       // ✅ evita corte
                fill: "#000",
              }}
            />

            <Tooltip
              cursor={{ fill: "rgba(3,73,145,0.08)" }}
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                color: "#000",
              }}
              labelStyle={{ fontWeight: "bold", color: "#000" }}
            />

            <Bar
              dataKey="total_egresados"
              fill="#034991"
              radius={[6, 6, 0, 0]}
              animationDuration={900}
            >
              <LabelList
                dataKey="total_egresados"
                position="top"
                fill="#000"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-center text-sm text-gray-600">
        Distribución anual de egresados según filtros aplicados
      </p>
    </div>
  );
}