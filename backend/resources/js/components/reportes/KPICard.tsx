interface Props {
  titulo: string;
  valor: string | number;
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
