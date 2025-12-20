interface EmpresaTop {
  nombre: string;
  postulaciones: number;
}

export default function TopEmpresas({ empresas }: { empresas: EmpresaTop[] }) {
  if (!empresas || empresas.length === 0) {
    return <p className="text-gray-500">No hay datos.</p>;
  }

  const max = Math.max(...empresas.map((e) => e.postulaciones), 1);

  return (
    <div className="card top-empresas">
      <h3>Top Empresas</h3>
      {empresas.map((e) => (
        <div key={e.nombre} className="empresa-row">
          <div className="nombre">{e.nombre}</div>
          <div className="barra">
            <div
              className="llenado"
              style={{ width: `${(e.postulaciones / max) * 100}%` }}
            />
          </div>
          <div className="valor">{e.postulaciones}</div>
        </div>
      ))}
    </div>
  );
}
