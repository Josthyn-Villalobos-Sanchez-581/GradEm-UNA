import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  data: { nombre: string; valor: number }[];
}

const COLORES = ["#034991", "#CD1719", "#A7A7A9"];

export default function GraficoDonutPostulaciones({ data }: Props) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500">No hay datos para mostrar.</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-semibold mb-4">Postulaciones por Tipo</h3>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="valor"
              nameKey="nombre"
              innerRadius={70}
              outerRadius={100}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORES[i % COLORES.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
