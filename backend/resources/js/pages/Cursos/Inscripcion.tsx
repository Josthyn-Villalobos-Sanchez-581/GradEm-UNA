import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import axios from "axios";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { router } from "@inertiajs/react";

interface Curso {
  id_curso: number;
  titulo: string;
  descripcion?: string;
  modalidad?: {
    id_modalidad: number;
    nombre: string;
  };
  nombreInstructor?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_limite_inscripcion?: string;
  duracion?: string;
  cupos?: number;
  estado_id: number;
}

interface Props {
  cursos: Curso[];
  modalidades: { id_modalidad: number; nombre: string }[];
  userPermisos: number[];
  misInscripciones: number[];
  inscritosCount: Record<number, number>;
}

export default function CursosInscripcionIndex(props: Props) {
  const modal = useModal();
  const { auth } = usePage().props as any;

  const puedeInscribirse = (props.userPermisos ?? []).includes(9);
  const puedeVerCursosLlenos = [1, 2, 3, 4].includes(auth?.user?.id_rol);
  const [misInscripciones, setMisInscripciones] = useState<Set<number>>(
    new Set(props.misInscripciones ?? [])
  );
  const [inscribiendose, setInscribiendose] = useState<Set<number>>(new Set());

  const [busqueda, setBusqueda] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);



  const fechaVencida = (fecha?: string) => {
    if (!fecha) return false;

    const hoy = new Date();
    const limite = new Date(fecha);

    // llevar al final del día
    limite.setHours(23, 59, 59, 999);

    return hoy > limite;
  };

  const itemsPorPagina = 10;

  const normalizeText = (value?: string | null) =>
    String(value ?? "").toLowerCase();

  const displayValue = (value?: string | null) => {
    if (!value) return "NA";
    return value.trim().length ? value : "NA";
  };

  const textoFiltroValido = (valor: string, max = 100) => {
    return valor
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "")
      .slice(0, max);
  };

  const cursosFiltrados = (props.cursos ?? [])
    .filter((c) => c.estado_id === 1)
    .filter((c) => {
      if (puedeVerCursosLlenos) return true;

      const inscritosActuales = props.inscritosCount[c.id_curso] ?? 0;
      const estaLleno = c.cupos != null && inscritosActuales >= c.cupos;

      return !estaLleno;
    })
    .filter((c) => {
      const texto = busqueda.toLowerCase();
      return (
        normalizeText(c.titulo).includes(texto) ||
        normalizeText(c.descripcion).includes(texto)
      );
    })
    .filter((c) => {
      if (filtroModalidad !== "todos") {
        return String(c.modalidad?.id_modalidad) === filtroModalidad;
      }
      return true;
    });

  const totalPaginas = Math.ceil(cursosFiltrados.length / itemsPorPagina);
  const cursosPaginados = cursosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const cambiarPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroModalidad("todos");
    setPaginaActual(1);
  };

  const inscribirse = async (curso: Curso) => {
    const confirmado = await modal.confirmacion({
      titulo: "Inscribirse al curso",
      mensaje: (
        <p>
          ¿Deseas inscribirte al curso <strong>{curso.titulo}</strong>?
          {curso.cupos != null && (
            <>
              <br />
              <span className="text-sm text-gray-500">
                Cupos disponibles: {" "}
                {Math.max(0, curso.cupos - (props.inscritosCount[curso.id_curso] ?? 0))}
              </span>
            </>
          )}
        </p>
      ),
      textoAceptar: "Inscribirme",
      textoCancelar: "Cancelar",
    });

    if (!confirmado) return;

    setInscribiendose((prev) => new Set(prev).add(curso.id_curso));

    try {
      await axios.post(route("cursos.inscribirse", { idCurso: curso.id_curso }));

      await modal.alerta({
        titulo: "Inscripción exitosa",
        mensaje: (
          <p>
            Te has inscrito correctamente al curso <strong>{curso.titulo}</strong>.
          </p>
        ),
      });
      setMisInscripciones((prev) => new Set(prev).add(curso.id_curso));
    } catch (error: any) {
      await modal.alerta({
        titulo: "No se pudo inscribir",
        mensaje:
          error.response?.data?.message ??
          "Ocurrió un error al procesar la inscripción. Intente nuevamente.",
      });
    } finally {
      setInscribiendose((prev) => {
        const next = new Set(prev);
        next.delete(curso.id_curso);
        return next;
      });
    }
  };

  const verDetalleCurso = async (curso: Curso) => {
    const cuposDisponibles = Math.max(0, (curso.cupos ?? 0) - (props.inscritosCount[curso.id_curso] ?? 0));

    await modal.alerta({
      titulo: "",
      mensaje: (
        <div className="text-left px-1">
          {/* Cabecera Institucional: Título y Badge */}
          <div className="relative mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-[#CD1719] rounded-full" />
              <span className="text-[10px] font-black text-[#CD1719] uppercase tracking-[0.2em]">
                Detalles del Programa
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#034991] leading-tight">
              {curso.titulo}
            </h2>
          </div>

          <div className="space-y-5">
            {/* Bloque de Información General (Estilo Cards Pequeñas) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Modalidad</p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#034991]" />
                  <p className="text-sm font-bold text-[#034991]">{displayValue(curso.modalidad?.nombre)}</p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Instructor</p>
                <p className="text-sm font-bold text-slate-700 truncate">{displayValue(curso.nombreInstructor)}</p>
              </div>
            </div>

            {/* Descripción: Contenedor con foco visual */}
            <div className="bg-white border-2 border-slate-50 p-4 rounded-[1.5rem] shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                Sobre el curso
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {curso.descripcion || "No hay una descripción detallada disponible."}
              </p>
            </div>

            {/* Banner de Cronograma: Inspirado en el footer de la card */}
            <div className="bg-[#034991] rounded-[2rem] p-5 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
              {/* Decoración sutil */}
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />

              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-end border-b border-white/10 pb-3">
                  <div>
                    <p className="text-[9px] font-bold text-blue-200 uppercase tracking-tighter">Duración total</p>
                    <p className="text-lg font-black">{displayValue(curso.duracion)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-amber-400 uppercase tracking-tighter">Límite inscripción</p>
                    <p className="text-lg font-black text-amber-50">{displayValue(curso.fecha_limite_inscripcion)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[8px] font-bold text-blue-300 uppercase">Inicio</p>
                      <p className="text-xs font-bold">{displayValue(curso.fecha_inicio)}</p>
                    </div>
                    <div className="w-px h-6 bg-white/20" />
                    <div>
                      <p className="text-[8px] font-bold text-blue-300 uppercase">Fin</p>
                      <p className="text-xs font-bold">{displayValue(curso.fecha_fin)}</p>
                    </div>
                  </div>

                  <div className="bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                    <p className="text-[8px] font-bold text-blue-200 uppercase text-center">Cupos</p>
                    <p className="text-xs font-black text-center">
                      {curso.cupos ? `${cuposDisponibles} / ${curso.cupos}` : '∞'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    });
  };

  return (
    <>
      <Head title="Inscripción a Cursos" />
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 text-[#000000]" style={{ fontFamily: "Open Sans, sans-serif" }}>
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#034991] tracking-tight">Inscripción a Cursos</h1>
            <p className="text-slate-500 text-sm mt-1">
              Explora cursos publicados y realiza tu inscripción de forma rápida.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-sm text-gray-500">
            <span>
              Resultados encontrados: <span className="font-semibold text-[#034991]">{cursosFiltrados.length}</span>
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB]"
              onClick={() => setMostrarFiltros((prev) => !prev)}
            >
              {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {mostrarFiltros && (
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
                <h2 className="text-lg font-semibold text-[#034991] border-b pb-2">Filtros de búsqueda</h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setPaginaActual(1);
                  }}
                  className="space-y-3 text-sm"
                >
                  <div className="flex flex-col">
                    <label className="font-semibold mb-1">Buscar</label>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                      <input
                        type="text"
                        placeholder="Título o descripción"
                        value={busqueda}
                        onChange={(e) => {
                          setBusqueda(textoFiltroValido(e.target.value, 100));
                          setPaginaActual(1);
                        }}
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="font-semibold mb-1">Modalidad</label>
                    <select
                      value={filtroModalidad}
                      onChange={(e) => {
                        setFiltroModalidad(e.target.value);
                        setPaginaActual(1);
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#034991]"
                    >
                      <option value="todos">Todas</option>
                      {(props.modalidades ?? []).map((m) => (
                        <option key={m.id_modalidad} value={m.id_modalidad}>{m.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button type="submit" variant="default" className="w-full bg-[#034991] hover:bg-[#023165] text-white font-semibold rounded-full">
                      Aplicar filtros
                    </Button>
                    <Button type="button" variant="outline" className="w-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB] font-semibold rounded-full" onClick={limpiarFiltros}>
                      Limpiar
                    </Button>
                  </div>
                </form>
              </div>
            </aside>
          )}

          <section className="flex-1">
            {cursosPaginados.length === 0 ? (
              <div className="text-center text-gray-500 italic mt-6 bg-white border border-gray-200 rounded-2xl py-10 px-4">
                No se encontraron cursos con los filtros seleccionados.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-1">
                {cursosPaginados.map((curso) => {
                  const inscritosActuales = props.inscritosCount[curso.id_curso] ?? 0;
                  const cuposDisponibles = Math.max(
                    0,
                    (curso.cupos ?? 0) - inscritosActuales
                  );
                  const estaLleno =
                    curso.cupos != null && inscritosActuales >= curso.cupos;

                  const esVencida = fechaVencida(curso.fecha_limite_inscripcion);

                  return (
                    <article
                      key={curso.id_curso}
                      className="group relative flex flex-col bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-900/15 transition-all duration-500"
                    >
                      {/* Accent superior */}
                      <div
                        className={`h-2 w-full ${esVencida ? "bg-red-500" : "bg-[#034991]"
                          }`}
                      />

                      <div className="p-6 flex flex-col flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <button
                            onClick={() => verDetalleCurso(curso)}
                            className="text-left text-base font-semibold text-[#034991] hover:underline"
                          >
                            {curso.titulo}
                          </button>

                          {estaLleno ? (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              Lleno
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              Publicado
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">Instructor</span>
                          <span className="font-medium text-gray-800">
                            {displayValue(curso.nombreInstructor)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">Fecha inicio</span>
                          <span className="font-medium text-gray-800">
                            {displayValue(curso.fecha_inicio)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">Inscritos / Cupos</span>
                          <span
                            className={`font-medium ${estaLleno ? "text-red-700" : "text-gray-800"
                              }`}
                          >
                            {curso.cupos != null
                              ? `${inscritosActuales} / ${curso.cupos}`
                              : `${inscritosActuales} / Sin límite`}
                          </span>
                        </div>

                        {/* Barra progreso */}
                        {curso.cupos && (
                          <div className="mt-3">
                            <div className="w-full h-2 bg-gray-200 rounded-full">
                              <div
                                className={`h-full ${cuposDisponibles > 0 ? "bg-[#034991]" : "bg-red-500"
                                  }`}
                                style={{
                                  width: `${(inscritosActuales / curso.cupos) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Botones */}
                        <div className="mt-auto flex gap-2 pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => verDetalleCurso(curso)}
                          >
                            Ver Detalle
                          </Button>

                          {puedeInscribirse && (
                            misInscripciones.has(curso.id_curso) ? (
                              <div className="flex-1 flex items-center justify-center bg-green-100 text-green-700 rounded">
                                ✓ Inscrito
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                disabled={
                                  inscribiendose.has(curso.id_curso) ||
                                  (curso.cupos != null && cuposDisponibles <= 0)
                                }
                                onClick={() => inscribirse(curso)}
                              >
                                Inscribirme
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="text-sm text-gray-500 mt-6 text-center">
              Mostrando <span className="font-medium">{cursosPaginados.length}</span> de <span className="font-medium">{cursosFiltrados.length}</span> cursos
              {totalPaginas > 0 && (
                <>
                  {" "}· Página <span className="font-medium">{paginaActual}</span> de <span className="font-medium">{totalPaginas}</span>
                </>
              )}
            </div>

            {totalPaginas > 1 && (
              <div className="flex justify-center mt-4 space-x-2 pb-2">
                <Button size="sm" disabled={paginaActual === 1} onClick={() => cambiarPagina(paginaActual - 1)}>
                  Anterior
                </Button>

                {Array.from({ length: totalPaginas }, (_, i) => (
                  <Button
                    key={i + 1}
                    size="sm"
                    variant={paginaActual === i + 1 ? "destructive" : "outline"}
                    onClick={() => cambiarPagina(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button size="sm" disabled={paginaActual === totalPaginas} onClick={() => cambiarPagina(paginaActual + 1)}>
                  Siguiente
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

CursosInscripcionIndex.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
