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
  const totalPostulaciones = empresas?.reduce((acc, e) => acc + e.postulaciones, 0) || 0;
  const datos = empresas.map(e => ({
    empresa: e.nombre,
    postulaciones: e.postulaciones,
    porcentaje: totalPostulaciones > 0 ? ((e.postulaciones / totalPostulaciones) * 100).toFixed(1) : "0",
  }));

  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[420px] h-full flex flex-col">
      <h3 className="font-semibold mb-4 text-black">Top Empresas por Postulaciones</h3>

      <div className="flex-1 w-full min-h-[320px]">
        {totalPostulaciones === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">No hay datos para mostrar.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos} layout="vertical" margin={{ top: 10, right: 40, left: 20, bottom: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="empresa" width={140} tick={{ fill: "#000", fontSize: 12 }} axisLine={false} />
              <Tooltip formatter={(value: number, _name, props: any) => [`${value} (${props.payload.porcentaje}%)`, "Postulaciones"]} />
              <Bar dataKey="postulaciones" radius={[0, 6, 6, 0]} barSize={20}>
                {datos.map((_, index) => <Cell key={index} fill={index === 0 ? "#dc2626" : index === 1 ? "#034991" : "#9ca3af"} />)}
                <LabelList dataKey="porcentaje" position="right" formatter={(v: any) => `${v}%`} fill="#000" fontSize={11} fontWeight="bold" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-gray-600">Porcentaje de postulaciones por empresa respecto al total</p>
    </div>
  );
}
