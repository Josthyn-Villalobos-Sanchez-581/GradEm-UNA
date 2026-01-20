import React from "react";
import { Cell } from "recharts";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";
import type { TopEmpresa } from "@/types/estadisticas";

interface Props {
  empresas: TopEmpresa[];
}

export default function TopEmpresas({ empresas }: Props) {
  if (!empresas || empresas.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 min-h-[420px] flex items-center justify-center">
        <p className="text-gray-600">No hay datos para mostrar.</p>
      </div>
    );
  }

  const totalPostulaciones = empresas.reduce(
    (acc, e) => acc + e.postulaciones,
    0
  );

  if (totalPostulaciones === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 min-h-[420px] flex items-center justify-center">
        <p className="text-gray-500">
          No existen postulaciones para los filtros seleccionados.
        </p>
      </div>
    );
  }

  const datos = empresas.map(e => ({
    empresa: e.nombre,
    postulaciones: e.postulaciones,
    porcentaje: ((e.postulaciones / totalPostulaciones) * 100).toFixed(1),
  }));

  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[420px]">
      <h3 className="font-semibold mb-4 text-black">
        Top Empresas por Postulaciones
      </h3>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datos}
            layout="vertical"
            margin={{ top: 10, right: 40, left: 20, bottom: 10 }}
          >
            <XAxis
              type="number"
              tick={{ fill: "#000" }}
              axisLine={false}
            />

            <YAxis
              type="category"
              dataKey="empresa"
              width={160}
              tick={{ fill: "#000", fontSize: 13 }}
              axisLine={false}
            />

            <Tooltip
              formatter={(value: number, _name, props: any) => [
                `${value} (${props.payload.porcentaje}%)`,
                "Postulaciones",
              ]}
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                color: "#000",
              }}
            />

            <Bar
              dataKey="postulaciones"
              radius={[0, 6, 6, 0]}
              barSize={22}
            >
              {datos.map((_, index) => {
                let fill = "#9ca3af"; // gris (default)

                if (index === 0) fill = "#dc2626"; // rojo - Top 1
                else if (index === 1) fill = "#034991"; // azul - Top 2

                return <Cell key={index} fill={fill} />;
              })}

              <LabelList
                dataKey="porcentaje"
                position="right"
                formatter={(value: any) => (value ? `${value}%` : "")}
                fill="#000"
                fontWeight="bold"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-center text-sm text-gray-600">
        Porcentaje de postulaciones por empresa respecto al total
      </p>
    </div>
  );
}
