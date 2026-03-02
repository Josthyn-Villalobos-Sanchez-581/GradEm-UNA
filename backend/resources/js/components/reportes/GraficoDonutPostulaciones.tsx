import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface DonutPostulacion {
  nombre: string;
  valor: number;
}

interface Props {
  datos: DonutPostulacion[];
}

const COLORES = [
  "#034991",
  "#dc2626",
  "#f59e0b",
  "#16a34a",
];

export default function GraficoDonutPostulaciones({ datos }: Props) {
  const total = datos?.reduce((acc, d) => acc + d.valor, 0) || 0;
  const datosConPorcentaje = datos.map((d, index) => ({
    ...d,
    porcentaje: total > 0 ? ((d.valor / total) * 100).toFixed(1) : "0",
    color: COLORES[index % COLORES.length],
  }));

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
    if (value === 0 || percent === 0) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="bold">
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[420px] h-full flex flex-col">
      <h3 className="font-semibold mb-4 text-black">Postulaciones por tipo</h3>

      <div className="flex-1 flex flex-col justify-center">
        {total === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 text-center">No existen postulaciones para los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={datosConPorcentaje} dataKey="valor" nameKey="nombre" cx="50%" cy="50%" outerRadius={110} innerRadius={65} paddingAngle={3} label={renderLabel} labelLine={false}>
                    {datosConPorcentaje.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.porcentaje}%)`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2">
              {datosConPorcentaje.map((item) => (
                <div key={item.nombre} className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium">{item.nombre}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold block">{item.valor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-gray-600">Distribución de postulaciones según tipo de oferta</p>
    </div>
  );
}
