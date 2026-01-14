import type { CarreraSolicitada } from "@/types/estadisticas";

interface Props {
  carreras: CarreraSolicitada[];
}

export default function CarrerasSolicitadas({ carreras }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[420px] flex flex-col">

      {/* TÍTULO SOLO CUANDO HAY DATOS */}
      {carreras.length > 0 && (
        <h3 className="font-semibold mb-4 text-black">
          Carreras más solicitadas
        </h3>
      )}

      {carreras.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">
            No hay datos para mostrar.
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#003366] text-white">
                  <th className="py-3 px-4 text-left font-semibold">
                    CARRERA
                  </th>
                  <th className="py-3 px-4 text-center font-semibold">
                    VACANTES
                  </th>
                  <th className="py-3 px-4 text-center font-semibold">
                    TENDENCIA
                  </th>
                </tr>
              </thead>

              <tbody>
                {carreras.map((c, index) => (
                  <tr
                    key={c.carrera}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4">{c.carrera}</td>

                    <td className="py-3 px-4 text-center font-medium">
                      {c.vacantes}
                    </td>

                    <td
                      className={`py-3 px-4 text-center font-semibold ${
                        c.tendencia > 0
                          ? "text-green-600"
                          : c.tendencia < 0
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {c.tendencia > 0 && "▲ "}
                      {c.tendencia < 0 && "▼ "}
                      {c.tendencia === 0 ? "—" : `${c.tendencia}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            Distribución de vacantes por carrera y su tendencia respecto al período anterior
          </p>
        </>
      )}
    </div>
  );
}