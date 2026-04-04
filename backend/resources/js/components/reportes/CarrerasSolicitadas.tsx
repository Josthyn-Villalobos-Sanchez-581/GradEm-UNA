import type { CarreraSolicitada } from "@/types/estadisticas";

interface Props {
  carreras: CarreraSolicitada[];
}

export default function CarrerasSolicitadas({ carreras }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-[420px] h-full flex flex-col">
      <h3 className="font-semibold mb-4 text-black flex items-center gap-2">
        Carreras más solicitadas
        <span
          className="
            inline-flex items-center justify-center
            w-4 h-4
            rounded-full
            border border-gray-400
            text-[10px] font-bold
            text-gray-600
            cursor-help
            hover:bg-gray-100
            transition
          "
          title="Para esta tabla deben ingresarse en los filtros la fecha inicio y fecha fin para que se muestren las vacantes y tendencia en ese lapso de tiempo."
        >
          !
        </span>
      </h3>

      <div className="flex-1 w-full overflow-hidden">
        {!carreras || carreras.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">No hay datos para mostrar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#003366] text-white">
                  <th className="py-2 px-4 text-left font-semibold">CARRERA</th>
                  <th className="py-2 px-4 text-center font-semibold">VACANTES</th>
                  <th className="py-2 px-4 text-center font-semibold">TENDENCIA</th>
                </tr>
              </thead>
              <tbody>
                {carreras.map((c, index) => (
                  <tr key={index} className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                    <td className="py-2 px-4 text-xs">{c.carrera}</td>
                    <td className="py-2 px-4 text-center font-medium">{c.vacantes}</td>
                    <td className={`py-2 px-4 text-center font-semibold ${c.tendencia > 0 ? "text-green-600" : c.tendencia < 0 ? "text-red-600" : "text-gray-500"}`}>
                      {c.tendencia > 0 && "▲ "}{c.tendencia < 0 && "▼ "}{c.tendencia === 0 ? "—" : `${Math.abs(c.tendencia)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-gray-600">
        Distribución de vacantes por carrera y su tendencia respecto al período anterior
      </p>
    </div>
  );
}