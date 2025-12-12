import React from "react";

export interface PorcionPie {
  nombre: string;
  valor: number;
}

interface Props {
  datos: PorcionPie[];
}

export default function GraficoPie({ datos }: Props) {
  if (!datos || datos.length === 0) {
    return (
      <p className="text-gray-600 text-center mt-4">
        No hay datos para mostrar en el gráfico pie.
      </p>
    );
  }

  const total = datos.reduce((acc, item) => acc + item.valor, 0);
  let acumulado = 0;

  const COLORES = ["#3b82f6", "#ef4444", "#f59e0b"]; // mismos colores que tenías

  return (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      {datos.map((item, index) => {
        const porcentaje = total === 0 ? 0 : item.valor / total;
        const angulo = porcentaje * 360;

        const porcion = (
          <circle
            key={index}
            r="16"
            cx="16"
            cy="16"
            fill="transparent"
            stroke={COLORES[index % COLORES.length]}
            strokeWidth="32"
            strokeDasharray={`${angulo} ${360 - angulo}`}
            strokeDashoffset={-acumulado}
          />
        );

        acumulado += angulo;
        return porcion;
      })}
    </svg>
  );
}
