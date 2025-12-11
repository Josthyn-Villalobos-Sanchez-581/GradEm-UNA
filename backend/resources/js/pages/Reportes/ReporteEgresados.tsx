// resources/js/pages/Reportes/ReporteEgresados.tsx
import React, { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";

/* ---------------------------
   Tipos
----------------------------*/
type PieSlice = { name: string; value: number };

type GraficoEmpleo = {
  total?: number;
  empleados: number;
  desempleados: number;
  no_especificado: number;
  pct_empleados?: number;
  pct_desempleados?: number;
  pct_no_especificado?: number;
} | null;

type GraficoAnualRow = {
  anio: number | string;
  total_egresados: number;
};

type ResultadoRow = {
  id_usuario?: number;
  nombre_completo?: string;
  genero?: string;
  nivel_academico?: string;
  anio_graduacion?: number;
  estado_empleo?: string;
  [k: string]: any;
};

type Catalogo = {
  universidades: any[]; // estructura flexible, backend puede devolver id / id_universidad
  carreras: any[];
  areasLaborales: any[];
  paises: any[];
  provincias: any[];
  cantones: any[];
  generos?: { id: string; nombre: string }[];
  estadosEstudios?: { id: string; nombre: string }[];
  nivelesAcademicos?: { id: string; nombre: string }[];
  estadosEmpleo?: { id: string; nombre: string }[];
  rangosSalariales?: { id: string; nombre: string }[];
  tiposEmpleo?: { id: string; nombre: string }[];
};

interface Props {
  userPermisos: number[];
}

/* ---------------------------
   Componentes SVG con tipos
----------------------------*/
function PieSVG({ data }: { data: PieSlice[] }) {
  const total = data.reduce((acc: number, d: PieSlice) => acc + d.value, 0);
  let accumulated = 0;

  const COLORS = ["#3b82f6", "#ef4444", "#f59e0b"];

  return (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      {data.map((slice: PieSlice, index: number) => {
        const pct = total === 0 ? 0 : slice.value / total;
        const angle = pct * 360;

        const circle = (
          <circle
            key={index}
            r="16"
            cx="16"
            cy="16"
            fill="transparent"
            stroke={COLORS[index % COLORS.length]}
            strokeWidth="32"
            strokeDasharray={`${angle} ${360 - angle}`}
            strokeDashoffset={-accumulated}
          />
        );

        accumulated += angle;
        return circle;
      })}
    </svg>
  );
}

function BarSVG({ data }: { data: GraficoAnualRow[] }) {
  const max = Math.max(...(data.map((d) => d.total_egresados) || [1]), 1);

  return (
    <div className="flex items-end h-full gap-4">
      {data.map((d, i) => {
        const height = (d.total_egresados / max) * 100;
        return (
          <div key={i} className="flex flex-col items-center">
            <div
              className="w-10 bg-blue-600 rounded-t"
              style={{ height: `${height}%` }}
            />
            <span className="text-xs mt-2">{d.anio}</span>
          </div>
        );
      })}
    </div>
  );
}

/* =====================================================
   Página ReporteEgresados (TSX)
======================================================*/
export default function ReporteEgresados(props: Props) {
  const userPermisos = props.userPermisos ?? [];
  // Catalogos
  const [catalogos, setCatalogos] = useState<Catalogo>({
    universidades: [],
    carreras: [],
    areasLaborales: [],
    paises: [],
    provincias: [],
    cantones: [],
    generos: [
      { id: "masculino", nombre: "Masculino" },
      { id: "femenino", nombre: "Femenino" },
      { id: "otro", nombre: "Otro" },
    ],
    estadosEstudios: [
      { id: "activo", nombre: "Activo" },
      { id: "pausado", nombre: "Pausado" },
      { id: "finalizado", nombre: "Finalizado" },
    ],
    nivelesAcademicos: [
      { id: "Diplomado", nombre: "Diplomado" },
      { id: "Bachillerato", nombre: "Bachillerato" },
      { id: "Licenciatura", nombre: "Licenciatura" },
      { id: "Maestría", nombre: "Maestría" },
      { id: "Doctorado", nombre: "Doctorado" },
    ],
    estadosEmpleo: [
      { id: "empleado", nombre: "Empleado" },
      { id: "desempleado", nombre: "Desempleado" },
    ],
    rangosSalariales: [
      { id: "<300000", nombre: "Menor a ₡300,000" },
      { id: "300000-600000", nombre: "₡300,000 - ₡600,000" },
      { id: "600000-1000000", nombre: "₡600,000 - ₡1,000,000" },
      { id: ">1000000", nombre: "Mayor a ₡1,000,000" },
    ],
    tiposEmpleo: [
      { id: "Tiempo completo", nombre: "Tiempo completo" },
      { id: "Medio tiempo", nombre: "Medio tiempo" },
      { id: "Temporal", nombre: "Temporal" },
      { id: "Independiente", nombre: "Independiente" },
      { id: "Práctica", nombre: "Práctica" },
    ],
  } as Catalogo);

  // Resultados y gráficos
  const [resultados, setResultados] = useState<ResultadoRow[]>([]);
  const [graficoEmpleo, setGraficoEmpleo] = useState<GraficoEmpleo>(null);
  const [graficoAnual, setGraficoAnual] = useState<GraficoAnualRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Tipo de reporte seleccionado (tabla / pie / barras / todos)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<string>("");

  // FILTROS (tipados correctamente)
  const [universidad, setUniversidad] = useState<number | null>(null);
  const [carrera, setCarrera] = useState<number | null>(null);
  const [pais, setPais] = useState<number | null>(null);
  const [provincia, setProvincia] = useState<number | null>(null);
  const [canton, setCanton] = useState<number | null>(null);

  const [fechaInicio, setFechaInicio] = useState<number | null>(null);
  const [fechaFin, setFechaFin] = useState<number | null>(null);

  const [genero, setGenero] = useState<string | null>(null);
  const [estadoEstudios, setEstadoEstudios] = useState<string | null>(null);
  const [nivelAcademico, setNivelAcademico] = useState<string | null>(null);
  const [estadoEmpleo, setEstadoEmpleo] = useState<string | null>(null);

  const [tiempoEmpleo, setTiempoEmpleo] = useState<number | null>(null);
  const [areaLaboral, setAreaLaboral] = useState<number | null>(null);
  const [salario, setSalario] = useState<string | null>(null);
  const [tipoEmpleo, setTipoEmpleo] = useState<string | null>(null);

  const modal = useModal();
  /* Construir parámetros para las llamadas */
  const buildParams = () => ({
    universidad,
    carrera,
    pais,
    provincia,
    canton,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    genero,
    estado_estudios: estadoEstudios,
    nivel_academico: nivelAcademico,
    estado_empleo: estadoEmpleo,
    tiempo_empleo: tiempoEmpleo,
    area_laboral: areaLaboral,
    salario,
    tipo_empleo: tipoEmpleo,
  });

  /* Carga inicial de catálogos — solo catálogos (no ejecuta reportes) */
  useEffect(() => {
    let mounted = true;

    const cargarCatalogos = async () => {
      try {
        const res = await axios.get("/reportes/catalogos");
        // Soportar dos formatos: { success: true, ... } o directamente {...}
        const payload = res.data && res.data.success ? res.data : res.data;
        if (!mounted) return;

        // Evitar sobreescribir catálogos fijos si backend no los devuelve
        setCatalogos((prev) => ({
          ...prev,
          universidades: (payload.universidades ?? prev.universidades) as any[],
          carreras: (payload.carreras ?? prev.carreras) as any[],
          areasLaborales: (payload.areasLaborales ?? prev.areasLaborales) as any[],
          paises: (payload.paises ?? prev.paises) as any[],
          provincias: (payload.provincias ?? prev.provincias) as any[],
          cantones: (payload.cantones ?? prev.cantones) as any[],
          generos: (payload.generos ?? prev.generos) as any[],
          estadosEstudios: (payload.estadosEstudios ?? prev.estadosEstudios) as any[],
          nivelesAcademicos: (payload.nivelesAcademicos ?? prev.nivelesAcademicos) as any[],
          estadosEmpleo: (payload.estadosEmpleo ?? prev.estadosEmpleo) as any[],
          rangosSalariales: (payload.rangosSalariales ?? prev.rangosSalariales) as any[],
          tiposEmpleo: (payload.tiposEmpleo ?? prev.tiposEmpleo) as any[],
        }));
      } catch (err) {
        console.error("Error cargando catálogos:", err);
      }
    };

    cargarCatalogos();

    return () => {
      mounted = false;
    };
  }, []);

  /* Función que consulta los reportes según tipo seleccionado */
  const fetchReportes = async () => {
    // 1. Validar tipo de reporte
    if (!reporteSeleccionado) {
      modal.alerta({
        titulo: "Reporte no seleccionado",
        mensaje: "Debe seleccionar un tipo de reporte antes de generar.",
      });
      return;
    }

    // 2. Validar fechas
    const ANIO_ACTUAL = new Date().getFullYear();

    if (fechaInicio !== null && fechaInicio < 2007) {
      modal.alerta({
        titulo: "Año inválido",
        mensaje: "El año de inicio no puede ser menor a 2007.",
      });
      return;
    }

    if (fechaFin !== null && fechaFin > ANIO_ACTUAL) {
      modal.alerta({
        titulo: "Año inválido",
        mensaje: `El año de fin no puede ser mayor al año actual (${ANIO_ACTUAL}).`,
      });
      return;
    }

    if (
      fechaInicio !== null &&
      fechaFin !== null &&
      fechaInicio > fechaFin
    ) {
      modal.alerta({
        titulo: "Rango de años inválido",
        mensaje: "El año de inicio no puede ser mayor que el año de fin.",
      });
      return;
    }

    setLoading(true);

    try {
      const params = buildParams();

      let resultadosTemp: ResultadoRow[] = [];
      let graficoEmpleoTemp: any = null;
      let graficoAnualTemp: GraficoAnualRow[] = [];

      if (reporteSeleccionado === "tabla" || reporteSeleccionado === "todos") {
        const r = await axios.get("/reportes/egresados", { params });
        resultadosTemp = r.data?.data ?? [];
      }

      if (reporteSeleccionado === "pie" || reporteSeleccionado === "todos") {
        const r = await axios.get("/reportes/grafico-empleo", { params });
        graficoEmpleoTemp = r.data?.data ?? null;
      }

      if (reporteSeleccionado === "barras" || reporteSeleccionado === "todos") {
        const r = await axios.get("/reportes/grafico-anual", { params });
        graficoAnualTemp = r.data?.data ?? [];
      }

      // 3. Validar si todo vino vacío
      if (
        (reporteSeleccionado === "tabla" && resultadosTemp.length === 0) ||
        (reporteSeleccionado === "pie" && !graficoEmpleoTemp) ||
        (reporteSeleccionado === "barras" && graficoAnualTemp.length === 0) ||
        (reporteSeleccionado === "todos" &&
          resultadosTemp.length === 0 &&
          !graficoEmpleoTemp &&
          graficoAnualTemp.length === 0)
      ) {
        modal.alerta({
          titulo: "Sin resultados",
          mensaje: "No se encontraron datos para los filtros seleccionados.",
        });
      }

      // Guardar en estado
      setResultados(resultadosTemp);
      setGraficoEmpleo(graficoEmpleoTemp);
      setGraficoAnual(graficoAnualTemp);
    } catch (err) {
      console.error("Error cargando reportes:", err);
      modal.alerta({
        titulo: "Error al cargar",
        mensaje: "Ocurrió un error procesando el reporte.",
      });
    } finally {
      setLoading(false);
    }
  };


  /* Datos para Pie */
  const pieData: PieSlice[] = graficoEmpleo
    ? [
      { name: "Empleados", value: graficoEmpleo.empleados ?? 0 },
      { name: "Desempleados", value: graficoEmpleo.desempleados ?? 0 },
      { name: "No especificado", value: graficoEmpleo.no_especificado ?? 0 },
    ]
    : [];

  /* Helpers para obtener id flexible (id o id_xxx) */
  const getId = (obj: any, fallback?: string) => obj?.id ?? obj?.[fallback ?? "id"] ?? null;

  return (
    <>
      <Head title="Reportes - Egresados" />

      <div className="font-display bg-[#f5f7f8] min-h-screen flex justify-center py-10 text-black">
        <div className="bg-white rounded-xl shadow-sm w-full max-w-7xl p-8">
          <h1 className="text-2xl font-bold text-[#034991] mb-6">Reporte de Egresados</h1>

          {/* Tipo de reporte */}
          <div className="mb-6">
            <label className="font-bold text-[#034991]">Tipo de reporte:</label>
            <select
              className="border p-2 rounded ml-3"
              value={reporteSeleccionado}
              onChange={(e) => setReporteSeleccionado(e.target.value)}
            >
              <option value="">Seleccione una opción</option>
              <option value="tabla">Tabla de egresados</option>
              <option value="pie">Gráfico pie (Empleo)</option>
              <option value="barras">Gráfico barras (Egresados por año)</option>
              <option value="todos">Todos los reportes</option>
            </select>
          </div>

          {/* FILTROS */}
          <div className="grid md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg mb-6">
            {/* Universidad */}
            <select
              className="border p-2 rounded"
              value={universidad ?? ""}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setUniversidad(val);
                setCarrera(null);
              }}
            >
              <option value="">Universidad</option>
              {(catalogos.universidades ?? []).map((u: any) => {
                // soporta id o id_universidad
                const id = getId(u, "id_universidad") as number;
                return (
                  <option key={String(id)} value={id}>
                    {u.nombre}
                  </option>
                );
              })}
            </select>

            {/* Carrera (filtrada) */}
            <select
              className="border p-2 rounded"
              value={carrera ?? ""}
              onChange={(e) => setCarrera(e.target.value ? Number(e.target.value) : null)}
              disabled={!universidad}
            >
              <option value="">Carrera</option>
              {(catalogos.carreras ?? [])
                .filter((c: any) => {
                  const idUniv = c.id_universidad ?? c.id ?? c.universidad_id;
                  return !universidad || Number(idUniv) === universidad;
                })
                .map((c: any) => {
                  const id = getId(c, "id_carrera") as number;
                  return (
                    <option key={String(id)} value={id}>
                      {c.nombre}
                    </option>
                  );
                })}
            </select>

            {/* País */}
            <select
              className="border p-2 rounded"
              value={pais ?? ""}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setPais(val);
                setProvincia(null);
                setCanton(null);
              }}
            >
              <option value="">País</option>
              {(catalogos.paises ?? []).map((p: any) => {
                const id = getId(p, "id_pais") as number;
                return (
                  <option key={String(id)} value={id}>
                    {p.nombre}
                  </option>
                );
              })}
            </select>

            {/* Provincia (depende Pais) */}
            <select
              className="border p-2 rounded"
              value={provincia ?? ""}
              disabled={!pais}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setProvincia(val);
                setCanton(null);
              }}
            >
              <option value="">Provincia</option>
              {(catalogos.provincias ?? [])
                .filter((pr: any) => {
                  const idPais = pr.id_pais ?? pr.pais_id ?? pr.idPais;
                  return !pais || Number(idPais) === pais;
                })
                .map((pr: any) => {
                  const id = getId(pr, "id_provincia") as number;
                  return (
                    <option key={String(id)} value={id}>
                      {pr.nombre}
                    </option>
                  );
                })}
            </select>

            {/* Cantón (depende Provincia) */}
            <select
              className="border p-2 rounded"
              value={canton ?? ""}
              disabled={!provincia}
              onChange={(e) => setCanton(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Cantón</option>
              {(catalogos.cantones ?? [])
                .filter((c: any) => {
                  const idProv = c.id_provincia ?? c.provincia_id ?? c.idProvincia;
                  return !provincia || Number(idProv) === provincia;
                })
                .map((c: any) => {
                  const id = getId(c, "id_canton") as number;
                  return (
                    <option key={String(id)} value={id}>
                      {c.nombre}
                    </option>
                  );
                })}
            </select>

            {/* Año inicio */}
            <input
              className="border p-2 rounded"
              type="number"
              placeholder="Año inicio"
              value={fechaInicio ?? ""}
              onChange={(e) => setFechaInicio(e.target.value ? Number(e.target.value) : null)}
            />

            {/* Año fin */}
            <input
              className="border p-2 rounded"
              type="number"
              placeholder="Año fin"
              value={fechaFin ?? ""}
              onChange={(e) => setFechaFin(e.target.value ? Number(e.target.value) : null)}
            />

            {/* Género */}
            <select className="border p-2 rounded" value={genero ?? ""} onChange={(e) => setGenero(e.target.value || null)}>
              <option value="">Género</option>
              {(catalogos.generos ?? []).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                </option>
              ))}
            </select>

            {/* Estado estudios */}
            <select className="border p-2 rounded" value={estadoEstudios ?? ""} onChange={(e) => setEstadoEstudios(e.target.value || null)}>
              <option value="">Estado estudios</option>
              {(catalogos.estadosEstudios ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>

            {/* Nivel academico */}
            <select className="border p-2 rounded" value={nivelAcademico ?? ""} onChange={(e) => setNivelAcademico(e.target.value || null)}>
              <option value="">Nivel académico</option>
              {(catalogos.nivelesAcademicos ?? []).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nombre}
                </option>
              ))}
            </select>

            {/* Estado empleo */}
            <select className="border p-2 rounded" value={estadoEmpleo ?? ""} onChange={(e) => setEstadoEmpleo(e.target.value || null)}>
              <option value="">Estado empleo</option>
              {(catalogos.estadosEmpleo ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>

            {/* Tiempo empleo */}
            <input className="border p-2 rounded" type="number" placeholder="Tiempo empleo (meses)" value={tiempoEmpleo ?? ""} onChange={(e) => setTiempoEmpleo(e.target.value ? Number(e.target.value) : null)} />

            {/* Area laboral */}
            <select className="border p-2 rounded" value={areaLaboral ?? ""} onChange={(e) => setAreaLaboral(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Área laboral</option>
              {(catalogos.areasLaborales ?? []).map((a: any) => (
                <option key={a.id ?? a.id_area_laboral} value={a.id ?? a.id_area_laboral}>
                  {a.nombre}
                </option>
              ))}
            </select>

            {/* Salario (rangos) */}
            <select className="border p-2 rounded" value={salario ?? ""} onChange={(e) => setSalario(e.target.value || null)}>
              <option value="">Rango salarial</option>
              {(catalogos.rangosSalariales ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>

            {/* Tipo empleo */}
            <select className="border p-2 rounded" value={tipoEmpleo ?? ""} onChange={(e) => setTipoEmpleo(e.target.value || null)}>
              <option value="">Tipo empleo</option>
              {(catalogos.tiposEmpleo ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botón generar */}
          <Button variant="default" size="default" onClick={fetchReportes}>
            Generar Reporte
          </Button>

          {/* Indicaciones iniciales */}
          {!reporteSeleccionado && (
            <p className="text-gray-600 text-center text-md mt-5">
              Seleccione el tipo de reporte y aplique los filtros necesarios antes de generar.
            </p>
          )}

          {/* Cargando */}
          {loading && <p className="text-gray-500 text-center text-lg mt-5">Cargando reportes...</p>}

          {/* Tabla */}
          {(reporteSeleccionado === "tabla" || reporteSeleccionado === "todos") && resultados.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mb-4">Resultados ({resultados.length})</h2>
              <div className="overflow-x-auto mb-8">
                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2">ID</th>
                      <th className="border p-2">Nombre</th>
                      <th className="border p-2">Genero</th>
                      <th className="border p-2">Nivel</th>
                      <th className="border p-2">Año</th>
                      <th className="border p-2">Estado empleo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map((r, idx) => (
                      <tr key={r.id_usuario ?? idx}>
                        <td className="border p-2">{r.id_usuario}</td>
                        <td className="border p-2">{r.nombre_completo}</td>
                        <td className="border p-2">{r.genero}</td>
                        <td className="border p-2">{r.nivel_academico}</td>
                        <td className="border p-2">{r.anio_graduacion}</td>
                        <td className="border p-2">{r.estado_empleo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pie */}
          {(reporteSeleccionado === "pie" || reporteSeleccionado === "todos") && graficoEmpleo && (
            <>
              <h2 className="font-semibold mb-3">Estado laboral</h2>
              <div className="w-full h-64 flex items-center justify-center">
                <div className="w-64 h-64">
                  <PieSVG data={pieData} />
                </div>
              </div>
            </>
          )}

          {/* Barras */}
          {(reporteSeleccionado === "barras" || reporteSeleccionado === "todos") && graficoAnual.length > 0 && (
            <>
              <h2 className="font-semibold mt-10 mb-3">Egresados por año</h2>
              <div className="w-full h-64 border p-4 rounded-md">
                <BarSVG data={graficoAnual} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

ReporteEgresados.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};