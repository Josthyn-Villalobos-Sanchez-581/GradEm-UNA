interface CarreraSolicitada {
  carrera: string;
  vacantes: number;
  tendencia: number;
}

export default function CarrerasSolicitadas({
  carreras,
}: {
  carreras: CarreraSolicitada[];
}) {
  if (!carreras || carreras.length === 0) {
    return (
      <div className="card carreras">
        <h3>Carreras Más Solicitadas</h3>
        <p className="text-sm text-gray-500 mt-4">
          No hay datos para mostrar.
        </p>
      </div>
    );
  }

  return (
    <div className="card carreras">
      <div className="cabecera">
        <h3>Carreras Más Solicitadas</h3>
      </div>

      <table>
        <thead>
          <tr>
            <th>CARRERA</th>
            <th>VACANTES</th>
            <th>TENDENCIA</th>
          </tr>
        </thead>
        <tbody>
          {carreras.map((c) => (
            <tr key={c.carrera}>
              <td>{c.carrera}</td>
              <td>{c.vacantes}</td>
              <td
                className={
                  c.tendencia > 0
                    ? "positivo"
                    : c.tendencia < 0
                    ? "negativo"
                    : ""
                }
              >
                {c.tendencia > 0 && "+"}
                {c.tendencia}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
