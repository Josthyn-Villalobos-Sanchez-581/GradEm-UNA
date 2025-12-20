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
  const ultimo = data.length - 1;

  return (
    <div className="card grafico">
      <h3 className="mb-4 font-semibold">Ofertas por Mes</h3>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={
                    index === ultimo
                      ? "#CD1719"
                      : "rgba(205,23,25,0.25)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
