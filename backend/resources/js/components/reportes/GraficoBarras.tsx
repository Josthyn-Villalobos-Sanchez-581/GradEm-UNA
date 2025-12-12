import React from "react";

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

  const maximo = Math.max(...filas.map((f) => f.total_egresados), 1);

  return (
    <div className="w-full h-64 border p-4 rounded-md flex items-end gap-4">
      {filas.map((fila, index) => {
        const altura = (fila.total_egresados / maximo) * 100;

        return (
          <div key={index} className="flex flex-col items-center">
            <div
              className="w-10 bg-blue-600 rounded-t"
              style={{ height: `${altura}%` }}
            ></div>
            <span className="text-xs mt-2">{fila.anio}</span>
          </div>
        );
      })}
    </div>
  );
}
