import React from "react";

export interface FilaEgresado {
  nombre_completo?: string;
  genero?: string;
  nivel_academico?: string;
  anio_graduacion?: number;
  estado_empleo?: string;
  [key: string]: any;
}

interface Props {
  filas: FilaEgresado[];
}

export default function TablaEgresados({ filas }: Props) {
  if (!filas || filas.length === 0) {
    return (
      <p className="text-gray-600 text-center mt-6">
        No hay datos disponibles para mostrar.
      </p>
    );
  }

  return (
    <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm text-black">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">#</th>
            <th className="px-4 py-3 text-left font-semibold">Nombre</th>
            <th className="px-4 py-3 text-left font-semibold">Género</th>
            <th className="px-4 py-3 text-left font-semibold">
              Nivel académico
            </th>
            <th className="px-4 py-3 text-left font-semibold">
              Año graduación
            </th>
            <th className="px-4 py-3 text-left font-semibold">
              Estado de empleo
            </th>
          </tr>
        </thead>

        <tbody>
          {filas.map((fila, index) => (
            <tr
              key={index}
              className={`
                ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                hover:bg-blue-50 transition
              `}
            >
              {/* Numeración */}
              <td className="px-4 py-3 font-medium">
                {index + 1}
              </td>

              <td className="px-4 py-3">
                {fila.nombre_completo ?? "—"}
              </td>
              <td className="px-4 py-3 capitalize">
                {fila.genero ?? "—"}
              </td>
              <td className="px-4 py-3">
                {fila.nivel_academico ?? "—"}
              </td>
              <td className="px-4 py-3">
                {fila.anio_graduacion ?? "—"}
              </td>
              <td className="px-4 py-3 capitalize">
                {fila.estado_empleo ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pie de tabla */}
      <div className="px-4 py-2 text-xs text-gray-600 bg-gray-50">
        Total de resultados: <strong>{filas.length}</strong>
      </div>
    </div>
  );
}
