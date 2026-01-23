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
    <div className="mt-8 overflow-x-auto bg-white p-4 rounded-2xl">
      <table className="min-w-full border-separate border-spacing-[0px] rounded-2xl overflow-hidden text-sm text-black">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left font-semibold border border-gray-300 first:rounded-tl-2xl">
              #
            </th>
            <th className="px-4 py-3 text-left font-semibold border border-gray-300">
              Nombre
            </th>
            <th className="px-4 py-3 text-left font-semibold border border-gray-300">
              Género
            </th>
            <th className="px-4 py-3 text-left font-semibold border border-gray-300">
              Nivel académico
            </th>
            <th className="px-4 py-3 text-left font-semibold border border-gray-300">
              Año graduación
            </th>
            <th className="px-4 py-3 text-left font-semibold border border-gray-300 last:rounded-tr-2xl">
              Estado de empleo
            </th>
          </tr>
        </thead>

        <tbody>
          {filas.map((fila, index) => (
            <tr key={index} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium border border-gray-300">
                {index + 1}
              </td>

              <td className="px-4 py-3 border border-gray-300">
                {fila.nombre_completo ?? "—"}
              </td>

              <td className="px-4 py-3 border border-gray-300 capitalize">
                {fila.genero ?? "—"}
              </td>

              <td className="px-4 py-3 border border-gray-300">
                {fila.nivel_academico ?? "—"}
              </td>

              <td className="px-4 py-3 border border-gray-300">
                {fila.anio_graduacion ?? "—"}
              </td>

              <td className="px-4 py-3 border border-gray-300 capitalize">
                {fila.estado_empleo ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>

        {/* 🔹 Pie integrado como fila */}
        <tfoot>
          <tr>
            <td
              colSpan={6}
              className="px-4 py-2 text-xs text-gray-600 bg-gray-50 border border-gray-300 rounded-b-2xl"
            >
              Total de resultados:{" "}
              <strong>{filas.length}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
