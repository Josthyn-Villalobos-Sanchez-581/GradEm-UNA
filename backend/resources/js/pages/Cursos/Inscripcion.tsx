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
    const inscritosActuales = props.inscritosCount?.[curso.id_curso] ?? 0;
    const cuposDisponibles = Math.max(0, (curso.cupos ?? 0) - inscritosActuales);
    const estaLleno = curso.cupos != null && inscritosActuales >= curso.cupos;
    const esVencida = fechaVencida(curso.fecha_limite_inscripcion);

    await modal.alerta({
      titulo: "",
      mensaje: (
        <div className="text-left px-1">
          {/* Accent superior */}
          <div className={`h-2 w-full absolute top-0 left-0 ${esVencida ? "bg-red-500" : "bg-[#034991]"}`} />

          {/* Header Institucional */}
          <div className="relative mb-6 mt-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-1 h-4 rounded-full ${esVencida ? "bg-red-500" : "bg-[#CD1719]"}`} />
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${esVencida ? "text-red-500" : "text-[#CD1719]"}`}>
                Detalles del Programa
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#034991] leading-tight">
              {curso.titulo}
            </h2>
          </div>

          <div className="space-y-4">
            {/* Fila de Badges de Estado - Lógica de Fecha Vencida añadida */}
            <div className="flex gap-2">
              {esVencida ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                  Inscripción Cerrada
                </span>
              ) : estaLleno ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                  Cupo Lleno
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                  Inscripciones Abiertas
                </span>
              )}

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#034991] border border-blue-100">
                {displayValue(curso.modalidad?.nombre)}
              </span>
            </div>

            {/* Información en Formato Píldora */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-[2rem] space-y-2 shadow-sm">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-gray-500 font-medium">Instructor</span>
                <span className="font-bold text-gray-800">{displayValue(curso.nombreInstructor)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-gray-500 font-medium">Fecha de inicio</span>
                <span className="font-bold text-gray-800">{displayValue(curso.fecha_inicio)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-gray-500 font-medium">Inscritos / Cupos</span>
                <span className={`font-bold ${estaLleno || esVencida ? "text-red-700" : "text-gray-800"}`}>
                  {curso.cupos != null ? `${inscritosActuales} / ${curso.cupos}` : "Sin límite"}
                </span>
              </div>

              {/* Barra de Progreso */}
              {curso.cupos && (
                <div className="pt-2">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${esVencida || estaLleno ? "bg-red-500" : "bg-[#034991]"}`}
                      style={{ width: `${(inscritosActuales / curso.cupos) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Descripción */}
            <div className="px-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                Sobre el curso
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {curso.descripcion || "No hay una descripción detallada disponible."}
              </p>
            </div>

            {/* Footer del Modal */}
            <div className={`${esVencida ? "bg-slate-800" : "bg-[#034991]"} rounded-[1.5rem] p-4 flex items-center justify-between text-white transition-colors duration-500`}>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-blue-200 uppercase">Límite inscripción</span>
                <span className={`text-base font-black ${esVencida ? "text-red-400" : "text-amber-400"}`}>
                  {displayValue(curso.fecha_limite_inscripcion)}
                </span>
              </div>
              <div className="h-8 w-px bg-white/20 mx-2" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold text-blue-200 uppercase">Duración</span>
                <span className="text-base font-black">{displayValue(curso.duracion)}</span>
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
                  const cuposDisponibles = Math.max(0, (curso.cupos ?? 0) - inscritosActuales);
                  const estaLleno = curso.cupos != null && inscritosActuales >= curso.cupos;
                  const esVencida = fechaVencida(curso.fecha_limite_inscripcion);

                  return (
                    <article
                      key={curso.id_curso}
                      className="group relative flex flex-col bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-500"
                    >
                      {/* Accent superior dinámico */}
                      <div className={`h-2.5 w-full ${esVencida ? "bg-red-500" : "bg-[#034991]"}`} />

                      <div className="p-7 flex flex-col flex-1">
                        {/* Header: Título y Status */}
                        <div className="flex flex-col gap-2 mb-4">
                          <div className="flex justify-between items-start gap-2">
                            <button
                              onClick={() => verDetalleCurso(curso)}
                              className="text-left text-lg font-bold text-[#034991] leading-tight hover:text-blue-700 transition-colors"
                            >
                              {curso.titulo}
                            </button>
                            <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${estaLleno ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                              }`}>
                              {estaLleno ? "Lleno" : "Activo"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">
                            {displayValue(curso.nombreInstructor)}
                          </p>
                        </div>

                        {/* Info Grid: Datos clave */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Inicio</span>
                            <span className="font-semibold text-gray-700">{displayValue(curso.fecha_inicio)}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Inscripción hasta</span>
                            <span className={`font-bold ${esVencida ? "text-red-600" : "text-amber-600"}`}>
                              {displayValue(curso.fecha_limite_inscripcion)}
                            </span>
                          </div>

                          {/* Sección de Cupos y Progreso */}
                          <div className="pt-2">
                            <div className="flex justify-between items-end mb-1.5">
                              <span className="text-xs text-gray-400 uppercase tracking-tight">Cupos confirmados</span>
                              <span className={`text-sm font-bold ${estaLleno ? "text-red-600" : "text-[#034991]"}`}>
                                {curso.cupos ? `${inscritosActuales} / ${curso.cupos}` : `${inscritosActuales} / ∞`}
                              </span>
                            </div>
                            {curso.cupos && (
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-1000 ${estaLleno ? "bg-red-500" : "bg-[#034991]"}`}
                                  style={{ width: `${Math.min(100, (inscritosActuales / curso.cupos) * 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ACCIONES - Manteniendo el formato Píldora */}
                        <div className="mt-auto flex gap-2 pt-5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-full border-[#034991] text-[#034991] font-bold hover:bg-[#E6F2FB] h-10"
                            onClick={() => verDetalleCurso(curso)}
                          >
                            Ver detalle
                          </Button>

                          {puedeInscribirse && (
                            misInscripciones.has(curso.id_curso) ? (
                              <div className="flex-1 flex items-center justify-center bg-green-100 text-green-700 rounded-full font-bold text-sm h-10 border border-green-200">
                                ✓ Inscrito
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                className="flex-1 rounded-full font-bold h-10 bg-[#034991] hover:bg-[#023a74]"
                                disabled={
                                  inscribiendose.has(curso.id_curso) ||
                                  (curso.cupos != null && cuposDisponibles <= 0)
                                }
                                onClick={() => inscribirse(curso)}
                              >
                                {inscribiendose.has(curso.id_curso) ? "Inscribiendo..." : "Inscribirme"}
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
