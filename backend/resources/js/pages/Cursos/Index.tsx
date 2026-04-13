import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import axios from "axios";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, Hourglass, Plus, Edit3, Trash2, Eye, ChevronLeft, ChevronRight, Search, ArrowLeft, Calendar, CalendarClock, Clock, User, GraduationCap, Filter, FilterX } from "lucide-react";

/* =======================
   Tipos
======================= */

interface Curso {
  id_curso: number;
  titulo: string;
  descripcion?: string;
  id_modalidad?: number;
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
  inscritosCount: Record<number, number>;
}

/* =======================
   Componente
======================= */

export default function CursosIndex(props: Props) {
  const [cursos, setCursos] = useState<Curso[]>(props.cursos);
  const modal = useModal();
  const { auth } = usePage().props as any;

  // Roles administrativos (alineado a PerfilesUsuarios)
  const puedeGestionar = [1, 2, 3, 4].includes(auth?.user?.id_rol);

  /* =======================
     Estados de filtros
  ======================= */

  const [busqueda, setBusqueda] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroInstructor, setFiltroInstructor] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);

  const itemsPorPagina = 10;


  React.useEffect(() => {
    setLoadingKpis(true);
    const t = setTimeout(() => setLoadingKpis(false), 300);
    return () => clearTimeout(t);
  }, [busqueda, filtroModalidad, filtroEstado, filtroInstructor]);

  /* =======================
     Helpers
  ======================= */

  const normalizeText = (value?: string | null) =>
    String(value ?? "").toLowerCase();

  const displayValue = (value?: string | null) => {
    if (!value) return "NA";
    return value.trim().length ? value : "NA";
  };

  /* =======================
     Filtros (Frontend)
  ======================= */

  const cursosFiltrados = cursos
    // 🔍 Búsqueda general
    .filter((c) => {
      const texto = busqueda.toLowerCase();
      return (
        normalizeText(c.titulo).includes(texto) ||
        normalizeText(c.descripcion).includes(texto)
      );
    })
    // 🎓 Modalidad
    .filter((c) => {
      if (filtroModalidad !== "todos") {
        return String(c.modalidad?.id_modalidad) === filtroModalidad;
      }
      return true;
    })
    // 📌 Estado
    .filter((c) => {
      if (filtroEstado === "publicado") return c.estado_id === 1;
      if (filtroEstado === "borrador") return c.estado_id !== 1;
      return true;
    })
    // 👨‍🏫 Instructor (solo admins)
    .filter((c) => {
      if (puedeGestionar && filtroInstructor.trim()) {
        return normalizeText(c.nombreInstructor).includes(
          filtroInstructor.toLowerCase()
        );
      }
      return true;
    })
    // 🔒 Ocultar borradores a no admins
    .filter((c) => {
      if (!puedeGestionar) {
        return c.estado_id === 1;
      }
      return true;
    });

  /* =======================
     Paginación
  ======================= */

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
    setFiltroEstado("todos");
    setFiltroInstructor("");
    setPaginaActual(1);
  };

  /* =======================
    KPIs (Frontend)
  ======================= */

  const hoyISO = new Date().toISOString().split("T")[0];

  // Total de cursos según filtros
  const kpiTotalCursos = cursosFiltrados.length;

  // Pendientes a publicar
  const kpiPendientes = cursosFiltrados.filter(
    (c) => c.estado_id !== 1
  ).length;

  // Cursos activos (publicados y dentro del rango de fechas)
  const kpiCursosActivos = cursosFiltrados.filter((c) => {
    if (c.estado_id !== 1 || !c.fecha_inicio) return false;

    const inicio = c.fecha_inicio;
    const fin = c.fecha_fin;

    if (hoyISO < inicio) return false;
    if (fin && hoyISO > fin) return false;

    return true;
  }).length;

  const [loadingKpis, setLoadingKpis] = useState(false);

  const [view, setView] = useState<"list" | "form">("list");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [detalleCurso, setDetalleCurso] = useState<Curso | null>(null);
  const [formCurso, setFormCurso] = useState({
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    fecha_limite_inscripcion: "",
    duracion: "",
    id_modalidad: "",
    nombreInstructor: "",
  });
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});

  const abrirFormularioCurso = (modo: "create" | "edit", curso?: Curso) => {
    setFormMode(modo);
    if (modo === "edit" && curso) {
      setCursoSeleccionado(curso);
      setFormCurso({
        titulo: curso.titulo || "",
        descripcion: curso.descripcion || "",
        fecha_inicio: curso.fecha_inicio || "",
        fecha_fin: curso.fecha_fin || "",
        fecha_limite_inscripcion: curso.fecha_limite_inscripcion || "",
        duracion: curso.duracion || "",
        id_modalidad: String(curso.modalidad?.id_modalidad || curso.id_modalidad || ""),
        nombreInstructor: curso.nombreInstructor || "",
      });
    } else {
      setCursoSeleccionado(null);
      setFormCurso({
        titulo: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
        fecha_limite_inscripcion: "",
        duracion: "",
        id_modalidad: "",
        nombreInstructor: "",
      });
    }
    setErroresForm({});
    setDetalleCurso(null);
    setView("form");
  };

  const cerrarFormularioCurso = () => {
    setView("list");
    setCursoSeleccionado(null);
    setErroresForm({});
  };

  const abrirDetalleCurso = (curso: Curso) => {
    setDetalleCurso(curso);
    // Mantiene la lista en background y abre el overlay modal
    setView("list");
  };

  const verInscritos = (curso: Curso) => {
    router.visit(route("cursos.inscritos", { idCurso: curso.id_curso }));
  };

  const cerrarDetalleCurso = () => {
    setDetalleCurso(null);
  };

  const validarFormularioCurso = () => {
    const e: Record<string, string> = {};
    if (!formCurso.titulo.trim()) e.titulo = "Título es obligatorio";
    if (!formCurso.id_modalidad) e.id_modalidad = "Modalidad es obligatoria";
    if (!formCurso.nombreInstructor.trim()) e.nombreInstructor = "Instructor obligatorio";
    if (!formCurso.fecha_inicio) e.fecha_inicio = "Fecha de inicio es obligatoria";
    if (!formCurso.fecha_limite_inscripcion) e.fecha_limite_inscripcion = "Fecha límite de inscripción es obligatoria";

    if (
      formCurso.fecha_inicio &&
      formCurso.fecha_limite_inscripcion &&
      formCurso.fecha_limite_inscripcion > formCurso.fecha_inicio
    ) {
      e.fecha_limite_inscripcion = "La fecha límite no puede ser posterior a inicio";
    }

    if (
      formCurso.fecha_inicio &&
      formCurso.fecha_fin &&
      formCurso.fecha_fin < formCurso.fecha_inicio
    ) {
      e.fecha_fin = "La fecha fin no puede ser anterior a inicio";
    }

    setErroresForm(e);
    return Object.keys(e).length === 0;
  };

  const submitFormularioCurso = async () => {
    if (!validarFormularioCurso()) return;

    try {
      if (formMode === "create") {
        const payload = {
          ...formCurso,
          id_modalidad: formCurso.id_modalidad || null,
          fecha_fin: formCurso.fecha_fin || null,
        };
        const response = await axios.post(route("cursos.store"), payload);
        setCursos((prev) => [response.data.curso, ...prev]);
        await modal.alerta({ titulo: "Curso registrado", mensaje: "El curso fue registrado en estado BORRADOR." });
      } else if (cursoSeleccionado) {
        const payload = {
          ...formCurso,
          id_modalidad: Number(formCurso.id_modalidad),
          fecha_fin: formCurso.fecha_fin || null,
        };
        await axios.put(route("cursos.update", { idCurso: cursoSeleccionado.id_curso }), payload);
        setCursos((prev) => prev.map((c) => c.id_curso === cursoSeleccionado.id_curso ? {
          ...c,
          titulo: formCurso.titulo,
          descripcion: formCurso.descripcion,
          fecha_inicio: formCurso.fecha_inicio,
          fecha_fin: formCurso.fecha_fin,
          fecha_limite_inscripcion: formCurso.fecha_limite_inscripcion,
          duracion: formCurso.duracion,
          nombreInstructor: formCurso.nombreInstructor,
          modalidad: props.modalidades.find((m) => m.id_modalidad === Number(formCurso.id_modalidad)),
        } : c));
        await modal.alerta({ titulo: "Curso actualizado", mensaje: "Los cambios fueron guardados correctamente." });
      }
      cerrarFormularioCurso();
    } catch (error: any) {
      await modal.alerta({
        titulo: "Error",
        mensaje:
          error.response?.data?.message ??
          "Ocurrió un error al guardar el curso. Intente nuevamente.",
      });
    }
  };

  /* =======================
     Acciones
  ======================= */

const filtrarTextoCurso = (valor: string, max: number) =>
    valor.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúñ.,;:()"'¡!¿?%&@\/\s-]/g, "").slice(0, max);

  const textoFiltroValido = (valor: string, max = 100) => {
    return valor
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "")
      .slice(0, max);
  };

  const hoy = new Date();
  const anioActual = hoy.getFullYear();

  const minGlobal = hoy.toISOString().split('T')[0]; // Fecha de hoy
  const maxGlobal = `${anioActual + 1}-12-31`;

  const eliminarCurso = async (curso: Curso) => {
    let motivo = "";

    const confirmado = await modal.confirmacion({
      titulo: "Eliminar curso",
      contenido: (
        <div className="flex flex-col gap-3">
          <p>
            ¿Seguro que desea eliminar el curso{" "}
            <strong>{curso.titulo}</strong>?
          </p>

          <textarea
            className="border rounded-md p-2 w-full"
            placeholder="Indique el motivo de eliminación (mínimo 10 caracteres)"
            rows={3}
            onChange={(e) => (motivo = e.target.value)}
          />
        </div>
      ),
      textoAceptar: "Eliminar",
      textoCancelar: "Cancelar",
    });

    if (!confirmado) return;

    if (!motivo || motivo.trim().length < 10) {
      await modal.alerta({
        titulo: "Motivo requerido",
        mensaje:
          "Debe indicar un motivo válido (mínimo 10 caracteres) para eliminar el curso.",
      });
      return;
    }

    try {
      await axios.delete(
        route("cursos.destroy", { id: curso.id_curso }),
        {
          data: { motivo },
        }
      );

      await modal.alerta({
        titulo: "Curso eliminado",
        mensaje: "El curso ha sido eliminado con éxito.",
      });

      setCursos((prev) =>
        prev.filter((c) => c.id_curso !== curso.id_curso)
      );
    } catch (error) {
      await modal.alerta({
        titulo: "Error",
        mensaje:
          "Ocurrió un error al eliminar el curso. Inténtelo nuevamente.",
      });
    }
  };


  const publicarCurso = async (curso: Curso) => {
    const confirmado = await modal.confirmacion({
      titulo: "Publicar curso",
      mensaje: (
        <p>
          ¿Desea publicar el curso <strong>{curso.titulo}</strong>?
          <br />
          Una vez publicado estará disponible para inscripción.
        </p>
      ),
      textoAceptar: "Publicar",
      textoCancelar: "Cancelar",
    });

    if (!confirmado) return;

    try {
      await axios.put(route("cursos.publicar", { idCurso: curso.id_curso }));

      modal.alerta({
        titulo: "Curso publicado",
        mensaje: "El curso ha sido publicado con éxito.",
      });

      setCursos((prev) =>
        prev.map((c) =>
          c.id_curso === curso.id_curso
            ? { ...c, estado_id: 1 }
            : c
        )
      );
    } catch (error: any) {
      modal.alerta({
        titulo: "No se puede publicar",
        mensaje: error.response?.data?.message ??
          "Ocurrió un error al publicar el curso.",
      });
    }
  };

  const editarCurso = (curso: Curso) => {
    abrirFormularioCurso("edit", curso);
  };

  const registrarCurso = () => {
    abrirFormularioCurso("create");
  };

  const verDetalleCurso = (curso: Curso) => {
    abrirDetalleCurso(curso);
  };
  const camposFaltantesCurso = (curso: Curso): string[] => {
    const faltantes: string[] = [];

    if (!curso.titulo) faltantes.push("Título");
    if (!curso.descripcion) faltantes.push("Descripción");
    if (!curso.fecha_inicio) faltantes.push("Fecha de inicio");
    if (!curso.fecha_limite_inscripcion) faltantes.push("Fecha límite de inscripción");
    if (!curso.id_modalidad && !curso.modalidad?.id_modalidad) faltantes.push("Modalidad");
    if (!curso.nombreInstructor) faltantes.push("Instructor");

    return faltantes;
  };

  const cursoIncompleto = (curso: Curso) =>
    camposFaltantesCurso(curso).length > 0;

  /* =======================
     Render
  ======================= */

  return (
    <>
      <Head title="Gestión de Cursos" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        {/* ENCABEZADO: Título y Acciones */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#034991]">
              {view === "list" ? "Gestión de Cursos" : 
              formMode === 'create' ? 'Registrar Curso' : 'Editar Curso'}
            </h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
              {view === "list" 
                ? "Administra los cursos, publica, edita y consulta información rápidamente."
                : formMode === 'create'
                  ? "Crea un nuevo curso completando los campos del formulario."
                  : `Actualiza la información y fechas del curso: ${formCurso.titulo || ''}`}
            </p>
          </div>

          {/* Contenedor de acciones a la derecha */}
            <div className="flex items-center gap-3">
              {view === "list" && puedeGestionar && (
                <>
                  {/* Botón de Filtros - Ajustado a h-10 y rounded-full */}
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB] h-10 px-5 text-md font-semibold transition-all"
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  >
                    {mostrarFiltros ? (
                      <><FilterX className="w-4 h-4 mr-2" /> Ocultar filtros</>
                    ) : (
                      <><Filter className="w-4 h-4 mr-2" /> Mostrar filtros</>
                    )}
                  </Button>

                  {/* Botón Registrar - Ajustado a h-10 y rounded-full */}
                  <Button 
                    onClick={() => abrirFormularioCurso("create")}
                    className="bg-[#034991] hover:bg-[#023165] text-white rounded-full h-10 px-5 text-md font-semibold shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Registrar curso
                  </Button>
                </>
              )}

            {view === "form" && (
              <Button 
                variant="secondary" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 border-none shadow-sm transition-all"
                onClick={cerrarFormularioCurso}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Volver
              </Button>
            )}
          </div>
        </div>

        {/* VISTA DE LISTADO CON GRID DINÁMICO */}
        {view === "list" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* ASIDE: Solo se renderiza si mostrarFiltros es true */}
            {mostrarFiltros && (
              <aside className="lg:col-span-3 transition-all duration-300">
                <div className="sticky top-6">
                  <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
                    <h2 className="text-lg font-semibold text-[#034991] border-b pb-2">
                      Filtros de cursos
                    </h2>

                    <div className="space-y-3 text-sm">
                      <div className="flex flex-col">
                        <label className="font-semibold mb-1 text-slate-700">Buscar curso</label>
                        <input
                          type="text"
                          placeholder="Título del curso..."
                          value={busqueda}
                          onChange={(e) => {
                            setBusqueda(textoFiltroValido(e.target.value, 100));
                            setPaginaActual(1);
                          }}
                          className="bg-white text-black placeholder-gray-500 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold mb-1 text-slate-700">Modalidad</label>
                        <select
                          value={filtroModalidad}
                          onChange={(e) => {
                            setFiltroModalidad(e.target.value);
                            setPaginaActual(1);
                          }}
                          className="bg-white text-black border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="todos">Todas las modalidades</option>
                          {(props.modalidades ?? []).map((m) => (
                            <option key={m.id_modalidad} value={m.id_modalidad}>
                              {m.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold mb-1 text-slate-700">Estado</label>
                        <select
                          value={filtroEstado}
                          onChange={(e) => {
                            setFiltroEstado(e.target.value);
                            setPaginaActual(1);
                          }}
                          className="bg-white text-black border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="todos">Todos</option>
                          <option value="publicado">Publicado</option>
                          <option value="borrador">Borrador</option>
                        </select>
                      </div>

                      {puedeGestionar && (
                        <div className="flex flex-col">
                          <label className="font-semibold mb-1 text-slate-700">Instructor</label>
                          <input
                            type="text"
                            placeholder="Nombre del instructor"
                            value={filtroInstructor}
                            onChange={(e) => {
                              setFiltroInstructor(textoFiltroValido(e.target.value, 100));
                              setPaginaActual(1);
                            }}
                            className="bg-white text-black placeholder-gray-500 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      <div className="flex flex-col gap-2 pt-2">
                        <Button
                          className="w-full bg-[#034991] hover:bg-[#023165] text-white font-semibold rounded-full py-2"
                          onClick={() => {}}
                        >
                          Aplicar filtros
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB] font-semibold rounded-full py-2"
                          onClick={() => {
                            setBusqueda("");
                            setFiltroModalidad("todos");
                            setFiltroEstado("todos");
                            setFiltroInstructor("");
                            setPaginaActual(1);
                          }}
                        >
                          Limpiar filtros
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* MAIN: Expansión dinámica de col-span-9 a col-span-12 */}
            <main className={`${mostrarFiltros ? "lg:col-span-9" : "lg:col-span-12"} space-y-4 transition-all duration-300`}>
              
              {/* KPIs dinámicos */}
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-3`}>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                  <div className="rounded-xl bg-blue-100 p-2 text-blue-600"><BookOpen className="w-4 h-4" /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-slate-500">Total cursos</p>
                    <p className="text-2xl font-bold text-slate-900">{kpiTotalCursos}</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600"><Play className="w-4 h-4" /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-slate-500">Cursos activos</p>
                    <p className="text-2xl font-bold text-slate-900">{kpiCursosActivos}</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                  <div className="rounded-xl bg-amber-100 p-2 text-amber-700"><Hourglass className="w-4 h-4" /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-slate-500">Pendientes</p>
                    <p className="text-2xl font-bold text-slate-900">{kpiPendientes}</p>
                  </div>
                </div>
              </div>

              {/* Resumen de Filtros */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Filtros activos</p>
                    <p className="text-sm font-semibold text-slate-700">Resumen rápido</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{cursosFiltrados.length} cursos</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {filtroModalidad !== 'todos' ? `Modalidad: ${props.modalidades.find(m=>String(m.id_modalidad)===filtroModalidad)?.nombre ?? 'Todas'}` : 'Modalidad: Todas'}
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                      {filtroEstado === 'publicado' ? 'Publicado' : filtroEstado === 'borrador' ? 'Borrador' : 'Todos'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {cursosPaginados.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                      No se encontraron cursos con los filtros seleccionados.
                    </div>
                  ) : (
                    /* GRID DE TARJETAS: md:grid-cols-2 por defecto, md:grid-cols-3 si no hay filtros */
                    <div className={`grid grid-cols-1 ${mostrarFiltros ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"} gap-3`}>
                      {cursosPaginados.map((curso) => (
                        <div key={curso.id_curso} className="border rounded-2xl p-4 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p
                                  className="text-lg font-semibold text-slate-900 line-clamp-1 cursor-pointer hover:text-blue-600"
                                  onClick={() => verInscritos(curso)}
                                  title="Ver inscritos"
                                >
                                  {curso.titulo}
                                </p>
                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{displayValue(curso.descripcion)}</p>
                              </div>
                              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded shrink-0 ${curso.estado_id === 1 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                                {curso.estado_id === 1 ? "Publicado" : "Borrador"}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                              <div className="rounded-lg bg-slate-50 p-2"><span className="font-semibold">Mod:</span> {displayValue(curso.modalidad?.nombre)}</div>
                              <div className="rounded-lg bg-slate-50 p-2"><span className="font-semibold">Inst:</span> {displayValue(curso.nombreInstructor)}</div>
                              <div className="rounded-lg bg-slate-50 p-2"><span className="font-semibold">Inicio:</span> {curso.fecha_inicio ?? "NA"}</div>
                              <div className="rounded-lg bg-slate-50 p-2"><span className="font-semibold">Límite:</span> {curso.fecha_limite_inscripcion ?? "NA"}</div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
                            {/* Botón Inscritos: Solo visible si el curso está publicado (estado_id === 1) */}
                              {curso.estado_id === 1 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 text-xs text-[#034991] hover:bg-blue-50" 
                                  onClick={() => verInscritos(curso)}
                                >
                                  <User className="w-3 h-3 mr-1" /> Inscritos
                                </Button>
                              )}
                            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => abrirDetalleCurso(curso)}>
                              <Eye className="w-3 h-3 mr-1" /> Detalle
                            </Button>
                            {puedeGestionar && curso.estado_id !== 1 && (
                              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => publicarCurso(curso)}>
                                Publicar
                              </Button>
                            )}
                            {puedeGestionar && (
                              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => editarCurso(curso)}>
                                <Edit3 className="w-3 h-3 mr-1" /> Editar
                              </Button>
                            )}
                            {puedeGestionar && (
                              <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={() => eliminarCurso(curso)}>
                                <Trash2 className="w-3 h-3 mr-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Paginación */}
              <div className="flex items-center justify-between text-slate-500 text-sm bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>Mostrando {cursosPaginados.length} de {cursosFiltrados.length} cursos</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>Anterior</Button>
                  <div className="flex items-center px-4 font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg h-8 shadow-sm">
                    {paginaActual} / {totalPaginas || 1}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas || totalPaginas === 0}>Siguiente</Button>
                </div>
              </div>
            </main>
          </div>
        )}
      </div>

      {view === "form" && (
        <div className="w-full -mt-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-12">
                    
                    {/* SIDEBAR INFORMATIVO (Estilo Ofertas) */}
                    <aside className="col-span-12 md:col-span-3 bg-gray-50/50 border-r border-gray-100 p-8 flex flex-col items-center">
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="relative p-4 bg-white rounded-full shadow-md mb-4 text-[#034991]">
                                {/* Icono de sombrero de graduado en lugar de FotoXDefecto */}
                                <GraduationCap className="w-16 h-16" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                Gestión Académica
                            </h3>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">
                                Módulo de Cursos
                            </span>
                        </div>

                        <div className="hidden md:block space-y-4">
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                <p className="text-xs text-[#034991] font-medium leading-relaxed">
                                    {formMode === 'create' 
                                        ? "Estás registrando un nuevo curso en el sistema. Asegúrate de definir las fechas correctamente."
                                        : "Estás editando la información de un curso existente. Los cambios se reflejarán inmediatamente."}
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* CUERPO DEL FORMULARIO */}
                    <section className="col-span-12 md:col-span-9 p-6 md:p-10 flex flex-col">
                        <div className="flex-grow space-y-6">
                            {/* Encabezado interno */}
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {formMode === 'create' ? "Información General del Curso" : "Modificar Información"}
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    {formMode === 'create' 
                                        ? "Complete los campos obligatorios para dar de alta el nuevo curso."
                                        : "Actualice los detalles del curso seleccionado."}
                                </p>
                            </div>

                            {/* Grid de campos */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                                
                                {/* Título e Instructor */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Título del curso <span className="text-[#CD1719]">*</span>
                                    </label>
                                    <input
                                        value={formCurso.titulo}
                                        onChange={(e) => setFormCurso((prev) => ({ ...prev, titulo: filtrarTextoCurso(e.target.value, 100) }))}
                                        className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${erroresForm.titulo ? "border-[#CD1719] ring-red-50" : "border-slate-300"}`}
                                        placeholder="Ej: Fundamentos de React"
                                    />
                                    {erroresForm.titulo && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{erroresForm.titulo}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Instructor asignado <span className="text-[#CD1719]">*</span>
                                    </label>
                                    <input
                                        value={formCurso.nombreInstructor}
                                        onChange={(e) => setFormCurso((prev) => ({ ...prev, nombreInstructor: filtrarTextoCurso(e.target.value, 100) }))}
                                        className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${erroresForm.nombreInstructor ? "border-[#CD1719] ring-red-50" : "border-slate-300"}`}
                                        placeholder="Ej: María López"
                                    />
                                    {erroresForm.nombreInstructor && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{erroresForm.nombreInstructor}</p>}
                                </div>

                                {/* Descripción */}
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Descripción detallada <span className="text-[#CD1719]">*</span>
                                    </label>
                                    <textarea
                                        value={formCurso.descripcion}
                                        onChange={(e) => setFormCurso((prev) => ({ ...prev, descripcion: filtrarTextoCurso(e.target.value, 500) }))}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        rows={2}
                                        placeholder="Describa los objetivos del curso..."
                                    />
                                </div>

                                {/* Modalidad y Fecha Inicio */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Modalidad <span className="text-[#CD1719]">*</span>
                                    </label>
                                    <select
                                        value={formCurso.id_modalidad}
                                        onChange={(e) => setFormCurso((prev) => ({ ...prev, id_modalidad: e.target.value }))}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    >
                                        <option value="">Seleccione</option>
                                        {(props.modalidades ?? []).map((m) => (
                                            <option key={m.id_modalidad} value={m.id_modalidad}>{m.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                      Fecha de inicio <span className="text-[#CD1719]">*</span>
                                  </label>
                                  <input
                                      type="date"
                                      min={minGlobal}
                                      max={maxGlobal}
                                      value={formCurso.fecha_inicio}
                                      onChange={(e) => setFormCurso((prev) => ({ ...prev, fecha_inicio: e.target.value }))}
                                      className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${erroresForm.fecha_inicio ? "border-[#CD1719] ring-red-50" : "border-slate-300"}`}
                                  />
                                  {erroresForm.fecha_inicio && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{erroresForm.fecha_inicio}</p>}
                                </div>

                                {/* Duración */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Duración estimada {formMode === 'edit' && <span className="text-[#CD1719]">*</span>}
                                    </label>
                                    <input
                                        value={formCurso.duracion}
                                        onChange={(e) => setFormCurso((prev) => ({ ...prev, duracion: filtrarTextoCurso(e.target.value, 20) }))}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        placeholder="Ej: 4 semanas"
                                    />
                                    {formMode === 'create' && (
                                        <p className="text-gray-400 text-[11px] mt-1 italic font-medium">Puede definirse luego</p>
                                    )}
                                </div>

                                {/* Fecha Fin y Fecha Límite */}
                                <div>
                                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                      Fecha de finalización {formMode === 'edit' && <span className="text-[#CD1719]">*</span>}
                                  </label>
                                  <input
                                      type="date"
                                      // No puede ser antes de la fecha de inicio seleccionada
                                      min={formCurso.fecha_inicio || minGlobal} 
                                      max={maxGlobal}
                                      value={formCurso.fecha_fin}
                                      onChange={(e) => setFormCurso((prev) => ({ ...prev, fecha_fin: e.target.value }))}
                                      className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${erroresForm.fecha_fin ? "border-[#CD1719] ring-red-50" : "border-slate-300"}`}
                                  />
                                  {erroresForm.fecha_fin && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{erroresForm.fecha_fin}</p>}
                                  {formMode === 'create' && !erroresForm.fecha_fin && (
                                      <p className="text-gray-400 text-[11px] mt-1 italic font-medium">Puede definirse luego</p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                      Límite de inscripción <span className="text-[#CD1719]">*</span>
                                  </label>
                                  <input
                                      type="date"
                                      min={minGlobal}
                                      // Permite seleccionar hasta la fecha de inicio o el tope de 3 años
                                      max={formCurso.fecha_inicio || maxGlobal} 
                                      value={formCurso.fecha_limite_inscripcion}
                                      onChange={(e) => setFormCurso((prev) => ({ ...prev, fecha_limite_inscripcion: e.target.value }))}
                                      className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white ${
                                          erroresForm.fecha_limite_inscripcion ? "border-[#CD1719] ring-red-50" : "border-slate-300"
                                      }`}
                                  />
                                  {erroresForm.fecha_limite_inscripcion && (
                                      <p className="text-xs text-[#CD1719] mt-1.5 font-medium">
                                          {erroresForm.fecha_limite_inscripcion}
                                      </p>
                                  )}
                                </div>
                            </div>
                        </div>

                        {/* FOOTER DE BOTONES */}
                        <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
                            <Button 
                                variant="ghost" 
                                onClick={cerrarFormularioCurso}
                                className="text-slate-500 hover:bg-slate-100 px-8 rounded-full transition-colors font-medium"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                onClick={submitFormularioCurso}
                                className="bg-[#034991] hover:bg-blue-800 text-white px-10 rounded-full shadow-lg transition-all active:scale-95 font-semibold"
                            >
                                {formMode === "create" ? "Registrar curso" : "Guardar cambios"}
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )}

      {detalleCurso && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-6xl rounded-3xl overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="relative bg-[#034991] p-6 text-white">
              <h2 className="text-2xl font-bold">{detalleCurso.titulo}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{detalleCurso.modalidad?.nombre ?? 'Modalidad'}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${detalleCurso.estado_id === 1 ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                  {detalleCurso.estado_id === 1 ? 'Publicado' : 'Borrador'}
                </span>
              </div>

              <button
                onClick={cerrarDetalleCurso}
                className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                aria-label="Cerrar detalle"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Descripción</h3>
                  <p className="text-sm text-slate-700">{detalleCurso.descripcion ?? 'No hay descripción proporcionada.'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Instructor</p>
                      <p className="text-base font-semibold text-slate-900">{detalleCurso.nombreInstructor ?? 'No asignado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="lg:col-span-4 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Resumen</h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Duración: <strong className="text-slate-900">{detalleCurso.duracion ?? 'No definida'}</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Inicio: <strong className="text-slate-900">{detalleCurso.fecha_inicio ?? 'NA'}</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Fin: <strong className="text-slate-900">{detalleCurso.fecha_fin ?? 'NA'}</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Límite inscripción: <strong className="text-slate-900">{detalleCurso.fecha_limite_inscripcion ?? 'NA'}</strong></span>
                    </li>
                  </ul>
                </div>

                {puedeGestionar && (
                  <Button className="w-full" onClick={() => editarCurso(detalleCurso)}>
                    Editar
                  </Button>
                )}
              </aside>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


CursosIndex.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
