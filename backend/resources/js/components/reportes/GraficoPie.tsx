import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export interface PorcionPie {
  nombre: string;
  valor: number;
  [key: string]: string | number;
}

interface Props {
  datos: PorcionPie[];
}

const COLORES = [
  "#034991", // azul institucional
  "#dc2626", // rojo
  "#f59e0b", // amarillo
];

export default function GraficoPie({ datos }: Props) {
  if (!datos || datos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 min-h-[420px] flex items-center justify-center">
        <p className="text-gray-600">
          No hay datos para mostrar en el gráfico.
        </p>
      </div>
    );
  }

  const total = datos.reduce((acc, d) => acc + d.valor, 0);

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 min-h-[420px] flex items-center justify-center">
        <p className="text-gray-600">
          No existen registros para los filtros seleccionados.
        </p>
      </div>
    );
  }

  const resumen = datos.map((d, index) => ({
    nombre: d.nombre,
    valor: d.valor,
    color: COLORES[index % COLORES.length],
  }));

  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[420px]">
      <h2 className="font-semibold mb-4 text-black">
        Estado laboral de egresados
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Gráfico */}
        <div className="md:col-span-2 flex items-center justify-center">
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datos}
                  dataKey="valor"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={65}
                  paddingAngle={3}
                  animationDuration={900}
                >
                  {datos.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORES[index % COLORES.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value: number, name: string) => [
                    value,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    color: "#000",
                  }}
                  labelStyle={{
                    fontWeight: "bold",
                    color: "#000",
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-black text-sm">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resumen lateral */}
        <div className="flex flex-col justify-center gap-4 text-black">
          {resumen.map((item) => (
            <div
              key={item.nombre}
              className="flex items-center justify-between border rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-sm font-medium">
                  {item.nombre}
                </span>
              </div>

              <span className="text-lg font-bold">
                {item.valor}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-gray-600">
        Distribución del estado de empleo de los egresados
      </p>
    </div>
  );
}
