import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import axios from "axios";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";

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
  estado_id: number;
}

interface Props {
  cursos: Curso[];
  modalidades: { id_modalidad: number; nombre: string }[];
  userPermisos: number[];
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

  /* =======================
     Acciones
  ======================= */

  const soloTextoValido = (valor: string, max: number) =>
    valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, max);

  const textoFiltroValido = (valor: string, max = 100) => {
    return valor
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "")
      .slice(0, max);
  };

  const hoy = new Date();
  const anioActual = hoy.getFullYear();

  const minGlobal = `${anioActual - 1}-01-01`;
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

  const editarCurso = async (curso: Curso) => {
    // ✅ Estado LOCAL, no React
    const draft = {
      titulo: curso.titulo,
      descripcion: curso.descripcion ?? "",
      fecha_inicio: curso.fecha_inicio ?? "",
      fecha_fin: curso.fecha_fin ?? "",
      fecha_limite_inscripcion: curso.fecha_limite_inscripcion ?? "",
      duracion: curso.duracion ?? "",
      id_modalidad: curso.modalidad?.id_modalidad ?? "",
      nombreInstructor: curso.nombreInstructor ?? "",
    };

    const faltantesIniciales = camposFaltantesCurso(curso);

      const inputErrorClass = (condicion: boolean) =>
        condicion
          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-300"
          : "";

    const confirmado = await modal.confirmacion({
      titulo: "Editar curso",
      contenido: (
        <div className="flex flex-col gap-4">

          {faltantesIniciales.length > 0 && (
            <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded text-sm">
              Para poder publicar el curso, complete los campos marcados en rojo.
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Título del curso
            </label>
            <input
              className={`border rounded p-2 ${inputErrorClass(!draft.titulo)}`}
              placeholder="Ej: Introducción a la Programación"
              maxLength={100}
              defaultValue={draft.titulo}
              onChange={(e) =>
                (draft.titulo = soloTextoValido(e.target.value, 100))
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              className={`border rounded p-2 ${inputErrorClass(!draft.descripcion)}`}
              placeholder="Describe brevemente el contenido del curso..."
              maxLength={300}
              defaultValue={draft.descripcion}
              onChange={(e) =>
                (draft.descripcion = soloTextoValido(e.target.value, 300))
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Fecha de inicio
            </label>
            <input
              type="date"
              className={`border rounded p-2 ${inputErrorClass(!draft.fecha_inicio)}`}
              min={minGlobal}
              max={maxGlobal}
              defaultValue={draft.fecha_inicio}
              onKeyDown={(e) => e.preventDefault()}
              onChange={(e) => {
                draft.fecha_inicio = e.target.value;

                // 🔒 Ajustar dependencias
                if (draft.fecha_fin && draft.fecha_fin < draft.fecha_inicio) {
                  draft.fecha_fin = "";
                }

                if (
                  draft.fecha_limite_inscripcion &&
                  draft.fecha_limite_inscripcion > draft.fecha_inicio
                ) {
                  draft.fecha_limite_inscripcion = "";
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Fecha de finalización
            </label>
            <input
              type="date"
              className="border rounded p-2"
              min={draft.fecha_inicio || minGlobal}
              max={maxGlobal}
              defaultValue={draft.fecha_fin}
              onKeyDown={(e) => e.preventDefault()}
              onChange={(e) => (draft.fecha_fin = e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Fecha límite de inscripción
            </label>
            <input
              type="date"
              className={`border rounded p-2 ${inputErrorClass(!draft.fecha_limite_inscripcion)}`}
              min={minGlobal}
              max={draft.fecha_inicio || maxGlobal}
              defaultValue={draft.fecha_limite_inscripcion}
              onKeyDown={(e) => e.preventDefault()}
              onChange={(e) => (draft.fecha_limite_inscripcion = e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Duración
            </label>
            <input
              className="border rounded p-2"
              placeholder="Ej: 4 semanas"
              maxLength={20}
              defaultValue={draft.duracion}
              onChange={(e) => (draft.duracion = e.target.value.slice(0, 20))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Modalidad
            </label>
            <select
              className={`border rounded p-2 ${inputErrorClass(!draft.id_modalidad)}`}
              defaultValue={draft.id_modalidad}
              onChange={(e) => (draft.id_modalidad = e.target.value)}
              required
            >
              <option value="" disabled>
                Seleccione modalidad
              </option>
              {props.modalidades.map((m) => (
                <option key={m.id_modalidad} value={m.id_modalidad}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Nombre del instructor
            </label>
            <input
              className={`border rounded p-2 ${inputErrorClass(!draft.nombreInstructor)}`}
              placeholder="Ej: Nombre Apellido"
              maxLength={100}
              defaultValue={draft.nombreInstructor}
              onChange={(e) =>
                (draft.nombreInstructor = soloTextoValido(e.target.value, 100))
              }
            />
          </div>

        </div>
      ),

      textoAceptar: "Guardar cambios",
      textoCancelar: "Cancelar",
    });

    if (!confirmado) return;

    if (!draft.id_modalidad) {
      await modal.alerta({
        titulo: "Validación",
        mensaje: "Debe seleccionar una modalidad válida.",
      });
      return;
    }

    if (
      !draft.fecha_inicio ||
      !draft.fecha_limite_inscripcion ||
      draft.fecha_limite_inscripcion > draft.fecha_inicio ||
      (draft.fecha_fin && draft.fecha_fin < draft.fecha_inicio)
    ) {
      await modal.alerta({
        titulo: "Fechas inválidas",
        mensaje: (
          <div className="text-sm text-gray-700 space-y-1">
            <p>Verifica que las fechas cumplan la secuencia lógica:</p>
            <p>- La inscripción no puede ser posterior al inicio</p>
            <p>- La fecha fin no puede ser anterior al inicio</p>
          </div>
        ),
      });
      return;
    }

    if (!confirmado) return;

    try {
      await axios.put(route("cursos.update", { idCurso: curso.id_curso }), draft);

      await modal.alerta({
        titulo: "Curso actualizado",
        mensaje: "Los cambios fueron guardados correctamente.",
      });
    } catch (error: any) {
      if (error.response?.status === 422) {
        await modal.alerta({
          titulo: "Campos obligatorios incompletos",
          mensaje:
            "Este curso está publicado. Debe completar todos los campos requeridos antes de guardar.",
        });
      }
      return;
    }

    setCursos((prev) =>
      prev.map((c) =>
        c.id_curso === curso.id_curso
          ? {
            ...c,
            titulo: draft.titulo,
            descripcion: draft.descripcion,
            nombreInstructor: draft.nombreInstructor,
            fecha_inicio: draft.fecha_inicio,
            fecha_fin: draft.fecha_fin,
            fecha_limite_inscripcion: draft.fecha_limite_inscripcion,
            duracion: draft.duracion,
            modalidad: props.modalidades.find(
              (m) => m.id_modalidad === Number(draft.id_modalidad)
            ),
          }
          : c
      )
    );
  };

  const verDetalleCurso = async (curso: Curso) => {
    await modal.alerta({
      titulo: "Detalle del curso",
      mensaje: (
        <div className="flex flex-col gap-4">

          {/* Título */}
          <div>
            <label className="text-sm font-semibold">Título</label>
            <input
              className="border rounded p-2 w-full bg-gray-100"
              value={curso.titulo}
              readOnly
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm font-semibold">Descripción</label>
            <textarea
              className="border rounded p-2 w-full bg-gray-100"
              value={curso.descripcion ?? ""}
              readOnly
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Fecha inicio</label>
              <input
                type="date"
                className="border rounded p-2 w-full bg-gray-100"
                value={curso.fecha_inicio}
                readOnly
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Fecha fin</label>
              <input
                type="date"
                className="border rounded p-2 w-full bg-gray-100"
                value={curso.fecha_fin ?? ""}
                readOnly
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Fecha límite de inscripción
              </label>
              <input
                type="date"
                className="border rounded p-2 w-full bg-gray-100"
                value={curso.fecha_limite_inscripcion}
                readOnly
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Duración</label>
              <input
                className="border rounded p-2 w-full bg-gray-100"
                value={curso.duracion}
                readOnly
              />
            </div>
          </div>

          {/* Modalidad */}
          <div>
            <label className="text-sm font-semibold">Modalidad</label>
            <input
              className="border rounded p-2 w-full bg-gray-100"
              value={curso.modalidad?.nombre ?? ""}
              readOnly
            />
          </div>

          {/* Instructor */}
          <div>
            <label className="text-sm font-semibold">Instructor</label>
            <input
              className="border rounded p-2 w-full bg-gray-100"
              value={curso.nombreInstructor}
              readOnly
            />
          </div>

          {/* Estado */}
          <div>
            <label className="text-sm font-semibold">Estado</label>
            <input
              className="border rounded p-2 w-full bg-gray-100"
              value={curso.estado_id === 1 ? "Publicado" : "Borrador"}
              readOnly
            />
          </div>

        </div>
      ),
    });
  };

  const registrarCurso = async () => {
    // 🔹 Draft local (igual que editar)
    const draft = {
      titulo: "",
      descripcion: "",
      fecha_inicio: "",
      fecha_fin: "",
      fecha_limite_inscripcion: "",
      duracion: "",
      id_modalidad: "",
      nombreInstructor: "",
    };

    const confirmado = await modal.confirmacion({
      titulo: "Registrar curso",
      contenido: (
        <div className="flex flex-col gap-4">

          {/* TÍTULO */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Título del curso
            </label>
            <input
              className="border rounded p-2"
              placeholder="Ej: Introducción a la Programación"
              maxLength={100}
              defaultValue=""
              onChange={(e) =>
                (draft.titulo = soloTextoValido(e.target.value, 100))
              }
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              className="border rounded p-2"
              placeholder="Describe brevemente el contenido del curso..."
              maxLength={300}
              defaultValue=""
              onChange={(e) =>
                (draft.descripcion = soloTextoValido(e.target.value, 300))
              }
            />
          </div>

          {/* FECHA INICIO */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Fecha de inicio
            </label>
            <input
              type="date"
              className="border rounded p-2"
              min={minGlobal}
              max={maxGlobal}
              defaultValue=""
              onKeyDown={(e) => e.preventDefault()}
              onChange={(e) => {
                draft.fecha_inicio = e.target.value;

                if (
                  draft.fecha_fin &&
                  draft.fecha_fin < draft.fecha_inicio
                ) {
                  draft.fecha_fin = "";
                }

                if (
                  draft.fecha_limite_inscripcion &&
                  draft.fecha_limite_inscripcion > draft.fecha_inicio
                ) {
                  draft.fecha_limite_inscripcion = "";
                }
              }}
            />
          </div>

          {/* FECHA FIN */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Fecha de finalización
            </label>
            <input
              type="date"
              className="border rounded p-2"
              min={draft.fecha_inicio || minGlobal}
              max={maxGlobal}
              defaultValue=""
              onKeyDown={(e) => e.preventDefault()}
              onChange={(e) => (draft.fecha_fin = e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Puede definirse posteriormente
            </p>
          </div>

          {/* FECHA LÍMITE */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Fecha límite de inscripción
            </label>
            <input
              type="date"
              className="border rounded p-2"
              min={minGlobal}
              max={draft.fecha_inicio || maxGlobal}
              defaultValue=""
              onKeyDown={(e) => e.preventDefault()}
              onChange={(e) =>
                (draft.fecha_limite_inscripcion = e.target.value)
              }
            />
          </div>

          {/* DURACIÓN */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Duración
            </label>
            <input
              className="border rounded p-2"
              placeholder="Ej: 4 semanas"
              maxLength={20}
              defaultValue=""
              onChange={(e) =>
                (draft.duracion = e.target.value.slice(0, 20))
              }
            />
            <p className="text-xs text-gray-500">
              Puede definirse posteriormente
            </p>
          </div>

          {/* MODALIDAD */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Modalidad
            </label>
            <select
              className="border rounded p-2"
              defaultValue=""
              onChange={(e) => (draft.id_modalidad = e.target.value)}
            >
              <option value="" disabled>
                Seleccione modalidad
              </option>
              {props.modalidades.map((m) => (
                <option key={m.id_modalidad} value={m.id_modalidad}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* INSTRUCTOR */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Nombre del instructor
            </label>
            <input
              className="border rounded p-2"
              placeholder="Ej: Nombre Apellido"
              maxLength={100}
              defaultValue=""
              onChange={(e) =>
                (draft.nombreInstructor = soloTextoValido(e.target.value, 100))
              }
            />
          </div>

        </div>
      ),
      textoAceptar: "Registrar curso",
      textoCancelar: "Cancelar",
    });

    if (!confirmado) return;

    const formularioVacio =
      !draft.titulo &&
      !draft.descripcion &&
      !draft.fecha_inicio &&
      !draft.fecha_fin &&
      !draft.fecha_limite_inscripcion &&
      !draft.duracion &&
      !draft.id_modalidad &&
      !draft.nombreInstructor;

    if (formularioVacio) {
      await modal.alerta({
        titulo: "Registro incompleto",
        mensaje: "Ingrese al menos un dato del curso para poder registrarlo.",
      });
      return;
    }

    const hayFechasIngresadas =
      draft.fecha_inicio ||
      draft.fecha_limite_inscripcion ||
      draft.fecha_fin;

    if (hayFechasIngresadas) {
      if (
        !draft.fecha_inicio ||
        !draft.fecha_limite_inscripcion ||
        draft.fecha_limite_inscripcion > draft.fecha_inicio ||
        (draft.fecha_fin && draft.fecha_fin < draft.fecha_inicio)
      ) {
        await modal.alerta({
          titulo: "Fechas inválidas",
          mensaje: (
            <div className="text-sm text-gray-700 space-y-1">
              <p>Verifica que las fechas cumplan la secuencia lógica:</p>
              <p>- La inscripción no puede ser posterior al inicio</p>
              <p>- La fecha fin no puede ser anterior al inicio</p>
            </div>
          ),
        });
        return;
      }
    }

    const payload = {
      ...draft,
      id_modalidad: draft.id_modalidad || null,
      fecha_fin: draft.fecha_fin || null,
    };

    const response = await axios.post(route("cursos.store"), payload);

    const nuevoCurso = response.data.curso;

    setCursos((prev) => [nuevoCurso, ...prev]);

    await modal.alerta({
      titulo: "Curso registrado",
      mensaje: "El curso fue registrado en estado BORRADOR.",
    });
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

      {/* 1. Un solo contenedor principal para todo el contenido */}
      <div className="w-full p-6 text-gray-900">

        {/* 2. Cabecera (Título y Botón) */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">
            Gestión de Cursos
          </h2>
          {puedeGestionar && (
            <Button variant="destructive" size="default" onClick={registrarCurso}>
              Registrar Curso
            </Button>
          )}
        </div>

        {/* 3. Filtros (Alineados con el resto) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(textoFiltroValido(e.target.value, 100));
              setPaginaActual(1);
            }}
            className="border border-gray-400 rounded-lg px-4 py-2 w-full md:w-1/3"
          />

          <div className="flex flex-wrap gap-3">
            <select
              value={filtroModalidad}
              onChange={(e) => {
                setFiltroModalidad(e.target.value);
                setPaginaActual(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="todos">Todas las modalidades</option>
              {(props.modalidades ?? []).map((m) => (
                <option key={m.id_modalidad} value={m.id_modalidad}>
                  {m.nombre}
                </option>
              ))}
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPaginaActual(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="todos">Todos los estados</option>
              <option value="publicado">Publicado</option>
              <option value="borrador">Borrador</option>
            </select>

            {puedeGestionar && (
              <input
                type="text"
                placeholder="Filtrar por instructor"
                value={filtroInstructor}
                onChange={(e) => {
                  setFiltroInstructor(textoFiltroValido(e.target.value, 100));
                  setPaginaActual(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            )}
          </div>
        </div>

        {/* 4. Tabla */}
        <div className="w-full overflow-x-auto bg-white p-6 rounded-2xl shadow border border-black">
          <table className="min-w-full border-separate border-spacing-[0px] rounded-2xl overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-gray-500 border border-gray-300 first:rounded-tl-2xl">
                  Título
                </th>
                <th className="px-4 py-2 text-left text-gray-500 border border-gray-300">
                  Modalidad
                </th>
                <th className="px-4 py-2 text-left text-gray-500 border border-gray-300">
                  Instructor
                </th>
                <th className="px-4 py-2 text-center text-gray-500 border border-gray-300">
                  Estado
                </th>
                <th className="px-4 py-2 text-center text-gray-500 border border-gray-300 last:rounded-tr-2xl min-w-[170px]">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {cursosPaginados.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-4 text-gray-500 italic border border-gray-300 rounded-b-2xl"
                  >
                    No se encontraron cursos.
                  </td>
                </tr>
              ) : (
                cursosPaginados.map((curso, idx) => (
                  <tr
                    key={curso.id_curso}
                    className={`hover:bg-gray-50 ${
                      curso.estado_id !== 1 ? "bg-yellow-50" : ""
                    }`}
                  >
                    <td
                      className={`px-4 py-2 border border-gray-300 ${
                        idx === cursosPaginados.length - 1 ? "rounded-bl-2xl" : ""
                      }`}
                    >
                      <button
                        onClick={() => verDetalleCurso(curso)}
                        className="text-black underline hover:text-gray-800"
                      >
                        {curso.titulo}
                      </button>
                    </td>

                    <td className="px-4 py-2 border border-gray-300">
                      {displayValue(curso.modalidad?.nombre)}
                    </td>

                    <td className="px-4 py-2 border border-gray-300">
                      {displayValue(curso.nombreInstructor)}
                    </td>

                    <td className="px-4 py-2 border border-gray-300 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          curso.estado_id === 1
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {curso.estado_id === 1 ? "Publicado" : "Borrador"}
                      </span>
                    </td>

                    <td
                      className={`px-4 py-2 text-center border border-gray-300 ${
                        idx === cursosPaginados.length - 1 ? "rounded-br-2xl" : ""
                      }`}
                    >
                      <div className="flex justify-center gap-2">
                        {puedeGestionar && curso.estado_id !== 1 && (
                          <Button
                            size="sm"
                            disabled={cursoIncompleto(curso)}
                            onClick={() => publicarCurso(curso)}
                            title={
                              cursoIncompleto(curso)
                                ? "Complete todos los campos del curso antes de publicarlo"
                                : "Publicar curso"
                            }
                          >
                            Publicar
                          </Button>
                        )}

                        {puedeGestionar && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editarCurso(curso)}
                          >
                            Editar
                          </Button>
                        )}

                        {puedeGestionar && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => eliminarCurso(curso)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🔹 Paginación */}
        <div className="text-sm text-gray-500 mt-6 text-center">
          Mostrando{" "}
          <span className="font-medium">
            {cursosPaginados.length}
          </span>{" "}
          de{" "}
          <span className="font-medium">
            {cursosFiltrados.length}
          </span>{" "}
          cursos registrados · Página{" "}
          <span className="font-medium">
            {paginaActual}
          </span>{" "}
          de{" "}
          <span className="font-medium">
            {totalPaginas}
          </span>
        </div>
        {totalPaginas > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <Button
              size="sm"
              disabled={paginaActual === 1}
              onClick={() => cambiarPagina(paginaActual - 1)}
            >
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

            <Button
              size="sm"
              disabled={paginaActual === totalPaginas}
              onClick={() => cambiarPagina(paginaActual + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}

        {/* =======================
          KPIs
        ======================= */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Total Cursos */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-100 text-red-600">
              📚
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Cursos</p>
              {loadingKpis ? (
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold">{kpiTotalCursos}</p>
              )}
            </div>
          </div>

          {/* Cursos Activos */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
              ▶️
            </div>
            <div>
              <p className="text-sm text-gray-500">Cursos Activos</p>
              {loadingKpis ? (
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold">{kpiCursosActivos}</p>
              )}
            </div>
          </div>

          {/* Pendientes */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-600">
              ⏳
            </div>
            <div>
              <p className="text-sm text-gray-500">Pendientes a Publicar</p>
              {loadingKpis ? (
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold">{kpiPendientes}</p>
              )}
            </div>
          </div>

        </div>
      </div> {/* Fin del max-w-7xl */}
    </>
  );
}

/* =======================
   Layout (idéntico a PerfilesUsuarios)
======================= */

CursosIndex.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
