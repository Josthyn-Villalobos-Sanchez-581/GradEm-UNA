import React, { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import PpLayout from "@/layouts/PpLayout";

/* --------------------------------------------------
   PIE SVG Component (sin librerías)
----------------------------------------------------*/
function PieSVG({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  let accumulated = 0;

  const COLORS = ["#3b82f6", "#ef4444", "#f59e0b"];

  return (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      {data.map((slice, index) => {
        const value = slice.value;
        const pct = total === 0 ? 0 : value / total;
        const angle = pct * 360;

        const circle = (
          <circle
            key={index}
            r="16"
            cx="16"
            cy="16"
            fill="transparent"
            stroke={COLORS[index]}
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

/* --------------------------------------------------
   BAR SVG Component (sin librerías)
----------------------------------------------------*/
function BarSVG({ data }: { data: any[] }) {
  const max = Math.max(...data.map((d) => d.total_egresados), 1);

  return (
    <div className="flex items-end h-full gap-4">
      {data.map((d, i) => {
        const height = (d.total_egresados / max) * 100;

        return (
          <div key={i} className="flex flex-col items-center">
            <div
              className="w-10 bg-blue-600 rounded-t"
              style={{ height: `${height}%` }}
            ></div>
            <span className="text-xs mt-2">{d.anio}</span>
          </div>
        );
      })}
    </div>
  );
}

/* =====================================================
     PÁGINA COMPLETA DEL REPORTE (SIN LIBRERÍAS)
======================================================*/
export default function ReporteEgresados() {
  const [resultados, setResultados] = useState([]);
  const [graficoEmpleo, setGraficoEmpleo] = useState<any | null>(null);
  const [graficoAnual, setGraficoAnual] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --------------------------
  // CATÁLOGOS
  // --------------------------
  const [catalogos, setCatalogos] = useState<any>({
    universidades: [],
    carreras: [],
    areasLaborales: [],
    paises: [],
    provincias: [],
    cantones: [],
    estadosEstudios: [],
    nivelesAcademicos: [],
    estadosEmpleo: [],
    tiposEmpleo: [],
  });

  const generos = [
    { id: "masculino", nombre: "Masculino" },
    { id: "femenino", nombre: "Femenino" },
    { id: "otro", nombre: "Otro" }
  ];

  const estadosEstudiosList = [
    { id: "activo", nombre: "Activo" },
    { id: "pausado", nombre: "Pausado" },
    { id: "finalizado", nombre: "Finalizado" },
  ];

  const nivelesAcademicosList = [
    { id: "Diplomado", nombre: "Diplomado" },
    { id: "Bachillerato", nombre: "Bachillerato" },
    { id: "Licenciatura", nombre: "Licenciatura" },
    { id: "Maestría", nombre: "Maestría" },
    { id: "Doctorado", nombre: "Doctorado" },
  ];

  const estadosEmpleoList = [
    { id: "empleado", nombre: "Empleado" },
    { id: "desempleado", nombre: "Desempleado" },
  ];

  const tiposEmpleoList = [
    { id: "Tiempo completo", nombre: "Tiempo completo" },
    { id: "Medio tiempo", nombre: "Medio tiempo" },
    { id: "Temporal", nombre: "Temporal" },
    { id: "Independiente", nombre: "Independiente" },
    { id: "Práctica", nombre: "Práctica" },
  ];

  const rangosSalarialesList = [
    { id: "<300000", nombre: "Menor a ₡300,000" },
    { id: "300000-600000", nombre: "₡300,000 - ₡600,000" },
    { id: "600000-1000000", nombre: "₡600,000 - ₡1,000,000" },
    { id: ">1000000", nombre: "Mayor a ₡1,000,000" },
  ];


  // --------------------------
  // FILTROS
  // --------------------------
  const [universidad, setUniversidad] = useState<string | null>(null);
  const [carrera, setCarrera] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState<number | null>(null);
  const [fechaFin, setFechaFin] = useState<number | null>(null);
  const [genero, setGenero] = useState<string | null>(null);
  const [estadoEstudios, setEstadoEstudios] = useState<string | null>(null);
  const [nivelAcademico, setNivelAcademico] = useState<string | null>(null);
  const [estadoEmpleo, setEstadoEmpleo] = useState<string | null>(null);
  const [tiempoEmpleo, setTiempoEmpleo] = useState<number | null>(null);
  const [areaLaboral, setAreaLaboral] = useState<string | null>(null);
  const [salario, setSalario] = useState<string | null>(null);
  const [tipoEmpleo, setTipoEmpleo] = useState<string | null>(null);
  const [canton, setCanton] = useState<string | null>(null);
  const [pais, setPais] = useState<string | null>(null);
  const [provincia, setProvincia] = useState<string | null>(null);


  const buildParams = () => ({
    universidad,
    carrera,
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
    canton,
  });

  // --------------------------
  // FETCH DATOS
  // --------------------------
  const fetchTodo = async () => {
    setLoading(true);

    try {
      const params = buildParams();

      const [r1, r2, r3] = await Promise.all([
        axios.get("/reportes/egresados", { params }),
        axios.get("/reportes/grafico-empleo", { params }),
        axios.get("/reportes/grafico-anual", { params }),
      ]);

      setResultados(r1.data.data ?? []);
      setGraficoEmpleo(r2.data.data ?? null);
      setGraficoAnual(r3.data.data ?? []);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  // --------------------------
  // CARGA INICIAL
  // --------------------------
  useEffect(() => {
  const loadCatalogos = async () => {
    try {
      const [u, c, a, p, pr, ca] = await Promise.all([
        axios.get("/universidades"),
        axios.get("/carreras"),
        axios.get("/areas-laborales"),
        axios.get("/paises"),
        axios.get("/provincias"),
        axios.get("/cantones"),
      ]);

      setCatalogos({
        universidades: Array.isArray(u.data.data) ? u.data.data : u.data,
        carreras: Array.isArray(c.data.data) ? c.data.data : c.data,
        areasLaborales: Array.isArray(a.data.data) ? a.data.data : a.data,
        paises: Array.isArray(p.data.data) ? p.data.data : p.data,
        provincias: Array.isArray(pr.data.data) ? pr.data.data : pr.data,
        cantones: Array.isArray(ca.data.data) ? ca.data.data : ca.data,
      });

    } catch (err) {
      console.error("Error cargando catálogos", err);
    }

    await fetchTodo();
  };

  loadCatalogos();
}, []);



  // --------------------------
  // PIE DATA
  // --------------------------
  const pieData = graficoEmpleo
    ? [
      { name: "Empleados", value: graficoEmpleo.empleados },
      { name: "Desempleados", value: graficoEmpleo.desempleados },
      { name: "No especificado", value: graficoEmpleo.no_especificado },
    ]
    : [];

  return (
    <>
      <Head title="Reportes - Egresados" />

      <div className="font-display bg-[#f5f7f8] min-h-screen flex justify-center py-10 text-black">
        <div className="bg-white rounded-xl shadow-sm w-full max-w-7xl p-8">
          <h1 className="text-2xl font-bold text-[#034991] mb-6">
            Reporte de Egresados
          </h1>

          {/* ============================
              FILTROS
          ===============================*/}
          <div className="grid md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg mb-6">

            {/* UNIVERSIDAD */}
            <select
              className="border p-2 rounded"
              value={universidad ?? ""}
              onChange={(e) =>
                setUniversidad(e.target.value || null)
              }
            >
              <option value="">Universidad</option>
              {catalogos.universidades.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>

            {/* CARRERA (FILTRADA) */}
            <select
              className="border p-2 rounded"
              value={carrera ?? ""}
              onChange={(e) => setCarrera(e.target.value || null)}
            >
              <option value="">Carrera</option>
              {catalogos.carreras
                .filter((c: any) => !universidad || c.id_universidad == universidad)
                .map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
            </select>

            {/* AÑO INICIO */}
            <input
              className="border p-2 rounded"
              type="number"
              placeholder="Año inicio"
              value={fechaInicio ?? ""}
              onChange={(e) =>
                setFechaInicio(e.target.value ? Number(e.target.value) : null)
              }
            />

            {/* AÑO FIN */}
            <input
              className="border p-2 rounded"
              type="number"
              placeholder="Año fin"
              value={fechaFin ?? ""}
              onChange={(e) =>
                setFechaFin(e.target.value ? Number(e.target.value) : null)
              }
            />

            {/* GÉNERO */}
            <select
              className="border p-2 rounded"
              value={genero ?? ""}
              onChange={(e) => setGenero(e.target.value || null)}
            >
              <option value="">Seleccione género</option>
              {generos.map((g) => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>

            {/* ESTADO ESTUDIOS */}
            <select
              className="border p-2 rounded"
              value={estadoEstudios ?? ""}
              onChange={(e) => setEstadoEstudios(e.target.value || null)}
            >
              <option value="">Seleccione estado</option>
              {estadosEstudiosList.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>


            {/* NIVEL ACADÉMICO */}
            <select
              className="border p-2 rounded"
              value={nivelAcademico ?? ""}
              onChange={(e) => setNivelAcademico(e.target.value || null)}
            >
              <option value="">Seleccione nivel académico</option>
              {nivelesAcademicosList.map((n) => (
                <option key={n.id} value={n.id}>{n.nombre}</option>
              ))}
            </select>


            {/* ESTADO EMPLEO */}
            <select
              className="border p-2 rounded"
              value={estadoEmpleo ?? ""}
              onChange={(e) => setEstadoEmpleo(e.target.value || null)}
            >
              <option value="">Seleccione estado</option>
              {estadosEmpleoList.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>

            {/* TIEMPO EMPLEO */}
            <input
              className="border p-2 rounded"
              type="number"
              placeholder="Tiempo empleo"
              value={tiempoEmpleo ?? ""}
              onChange={(e) =>
                setTiempoEmpleo(e.target.value ? Number(e.target.value) : null)
              }
            />

            {/* ÁREA LABORAL */}
            <select
              className="border p-2 rounded"
              value={areaLaboral ?? ""}
              onChange={(e) => setAreaLaboral(e.target.value || null)}
            >
              <option value="">Área laboral</option>
              {catalogos.areasLaborales.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>

            {/* SALARIO */}
            <select
              className="border p-2 rounded"
              value={salario ?? ""}
              onChange={(e) => setSalario(e.target.value || null)}
            >
              <option value="">Seleccione rango salarial</option>
              {rangosSalarialesList.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>

            {/* TIPO EMPLEO */}
            <select
              className="border p-2 rounded"
              value={tipoEmpleo ?? ""}
              onChange={(e) => setTipoEmpleo(e.target.value || null)}
            >
              <option value="">Seleccione tipo</option>
              {tiposEmpleoList.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>

            {/* Pais */}
            <select
              className="border p-2 rounded"
              value={pais ?? ""}
              onChange={(e) => {
                const val = e.target.value || null;
                setPais(val);
                setProvincia(null);
                setCanton(null);
              }}
            >
              <option value="">País</option>
              {catalogos.paises.map((p: any) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>

            {/* Provincia */}
            <select
              className="border p-2 rounded"
              disabled={!pais}
              value={provincia ?? ""}
              onChange={(e) => {
                const val = e.target.value || null;
                setProvincia(val);
                setCanton(null);
              }}
            >
              <option value="">Provincia</option>
              {catalogos.provincias
                .filter((pr: any) => pr.id_pais == pais)
                .map((pr: any) => (
                  <option key={pr.id} value={pr.id}>{pr.nombre}</option>
                ))}
            </select>


            {/* Canton */}
            <select
              className="border p-2 rounded"
              disabled={!provincia}
              value={canton ?? ""}
              onChange={(e) => setCanton(e.target.value || null)}
            >
              <option value="">Cantón</option>
              {catalogos.cantones
                .filter((c: any) => c.id_provincia == provincia)
                .map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
            </select>

          </div>

          {/* BOTÓN */}
          <button
            onClick={fetchTodo}
            className="px-4 py-2 bg-[#034991] text-white rounded hover:opacity-90 mb-6"
          >
            Buscar
          </button>

          {/* ============================
              RESULTADOS
          ===============================*/}
          {loading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">
                Resultados ({resultados.length})
              </h2>

              {/* TABLA */}
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
                    {resultados.map((r: any) => (
                      <tr key={r.id_usuario}>
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

              {/* =======================
                  GRÁFICO PIE
              =========================*/}
              <h2 className="font-semibold mb-3">Estado laboral</h2>

              <div className="w-full h-64 flex items-center justify-center">
                <div className="w-64 h-64">
                  <PieSVG data={pieData} />
                </div>
              </div>

              {/* =======================
                  GRÁFICO BARRAS
              =========================*/}
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

ReporteEgresados.layout = (page: any) => (
  <PpLayout userPermisos={page.props?.userPermisos ?? []}>
    {page}
  </PpLayout>
);
