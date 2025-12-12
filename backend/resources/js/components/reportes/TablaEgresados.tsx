import React from "react";

export interface FilaEgresado {
  id_usuario?: number;
  nombre_completo?: string;
  genero?: string;
  nivel_academico?: string;
  anio_graduacion?: number;
  estado_empleo?: string;
  // acepta claves adicionales del backend sin romper
  [key: string]: any;
}

interface Props {
  filas: FilaEgresado[];
}

export default function TablaEgresados({ filas }: Props) {
  if (!filas || filas.length === 0) {
    return (
      <p className="text-gray-600 text-center mt-4">
        No hay datos disponibles para mostrar.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto mt-6">
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Género</th>
            <th className="border p-2">Nivel académico</th>
            <th className="border p-2">Año graduación</th>
            <th className="border p-2">Estado empleo</th>
          </tr>
        </thead>

        <tbody>
          {filas.map((fila, i) => (
            <tr key={fila.id_usuario ?? i}>
              <td className="border p-2">{fila.id_usuario}</td>
              <td className="border p-2">{fila.nombre_completo}</td>
              <td className="border p-2">{fila.genero}</td>
              <td className="border p-2">{fila.nivel_academico}</td>
              <td className="border p-2">{fila.anio_graduacion}</td>
              <td className="border p-2">{fila.estado_empleo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
