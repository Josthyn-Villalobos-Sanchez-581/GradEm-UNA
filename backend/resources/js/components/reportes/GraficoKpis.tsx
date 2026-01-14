// resources/js/components/reportes/GraficoKpis.tsx

import type { KpiInfo } from "@/types/estadisticas";
import KPICard from "@/components/reportes/KPICard";

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
        <KPICard titulo="Empresas Activas" valor={datos.empresas_activas} />
      </div>
    </div>
  );
}
