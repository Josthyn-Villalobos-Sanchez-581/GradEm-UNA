// resources/js/components/reportes/GraficoOfertasMes.tsx

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import type { SerieMes } from "@/types/estadisticas";

interface Props {
  data: SerieMes[];
}

export default function GraficoOfertasMes({ data }: Props) {
  const formatearMes = (mes: string) => {
    const fecha = new Date(mes + "-01");
    return fecha.toLocaleDateString("es-ES", { month: "short" }).toUpperCase();
  };

  const ultimo = data ? data.length - 1 : 0;

  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[420px] h-full flex flex-col">
      <h3 className="mb-4 font-semibold text-black">Ofertas por Mes</h3>

      <div className="flex-1 flex items-center justify-center w-full">
        {!data || data.length === 0 ? (
          <p className="text-gray-600">No hay datos para mostrar.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
              <XAxis dataKey="mes" tickFormatter={formatearMes} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={index} fill={index === ultimo ? "#CD1719" : "rgba(205,23,25,0.25)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-gray-600">
        Cantidad de ofertas publicadas por mes según los filtros aplicados
      </p>
    </div>
  );
}