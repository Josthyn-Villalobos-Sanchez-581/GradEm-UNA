// resources/js/components/reportes/GraficoKpis.tsx

import type { KpiInfo } from "@/types/estadisticas";

/* ================= SUBCOMPONENTE ================= */

function KPICard({
  titulo,
  valor,
}: {
  titulo: string;
  valor: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="text-sm text-gray-500">{titulo}</div>
      <div className="text-3xl font-bold text-[#034991] mt-2">
        {valor}
      </div>
    </div>
  );
}

/* ================= PRINCIPAL ================= */

interface Props {
  datos: KpiInfo;
}

export default function GraficoKpis({ datos }: Props) {
  if (!datos) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[#034991]">
        Indicadores Clave
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard titulo="Total Ofertas" valor={datos.total_ofertas} />
        <KPICard titulo="Ofertas Activas" valor={datos.ofertas_activas} />
        <KPICard titulo="Postulaciones" valor={datos.total_postulaciones} />
        <KPICard titulo="Empresas" valor={datos.empresas_activas} />
      </div>
    </div>
  );
}
