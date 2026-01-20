// resources/js/components/reportes/KPICard.tsx

interface Props {
  titulo: string;
  valor: number | string;
  subtitulo?: string;
}

export default function KPICard({ titulo, valor, subtitulo }: Props) {
  return (
    <div className="kpi-card">
      <div className="kpi-titulo">{titulo}</div>
      <div className="kpi-valor">{valor}</div>
      {subtitulo && <div className="kpi-subtitulo">{subtitulo}</div>}
    </div>
  );
}
