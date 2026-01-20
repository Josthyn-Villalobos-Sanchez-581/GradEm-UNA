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
  if (!datos || datos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 min-h-[420px] flex items-center justify-center">
        <p className="text-gray-600">
          No hay datos para mostrar.
        </p>
      </div>
    );
  }

  const total = datos.reduce((acc, d) => acc + d.valor, 0);

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 min-h-[420px] flex items-center justify-center">
        <p className="text-gray-600">
          No existen postulaciones para los filtros seleccionados.
        </p>
      </div>
    );
  }

  const datosConPorcentaje = datos.map((d, index) => ({
    ...d,
    porcentaje: ((d.valor / total) * 100).toFixed(1),
    color: COLORES[index % COLORES.length],
  }));

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
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight="bold"
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[420px] flex flex-col">
      <h3 className="font-semibold mb-4 text-black">
        Postulaciones por tipo
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <div className="md:col-span-2 flex items-center justify-center">
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosConPorcentaje}
                  dataKey="valor"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={65}
                  paddingAngle={3}
                  label={renderLabel}
                  labelLine={false}
                >
                  {datosConPorcentaje.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    `${value} (${props.payload.porcentaje}%)`,
                    name,
                  ]}
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 text-black">
          {datosConPorcentaje.map((item) => (
            <div
              key={item.nombre}
              className="flex items-center justify-between border rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">
                  {item.nombre}
                </span>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold block">
                  {item.valor}
                </span>
                <span className="text-sm font-semibold text-gray-600">
                  {item.porcentaje}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TEXTO SIEMPRE VISIBLE */}
      <p className="mt-4 text-center text-sm text-gray-600">
        Distribución de postulaciones según tipo de oferta
      </p>
    </div>
  );
}
