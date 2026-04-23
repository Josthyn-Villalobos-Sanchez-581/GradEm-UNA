import React, { useState, useEffect, useRef } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import axios from "axios";
import EventoDetalleModal from "@/components/modal/EventoDetalleModal";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Calendar,
  CalendarDays,
  MapPin,
  Eye,
  Trash2,
  Play,
  Plus,
  Edit3,
  Search,
  Filter,
  FilterX,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ArrowLeft,
  GraduationCap,
  Users,
  Link as LinkIcon,
  Info,
  ChevronDown
} from "lucide-react";

/* =======================
   Tipos
======================= */

interface Evento {
  id_evento: number;
  titulo: string;
  descripcion?: string;
  fecha_evento?: string;
  hora_evento?: string;
  id_modalidad?: number;
  id_ubicacion?: number;
  estado_id: number;
  carreras_invitadas?: number[] | string;
  roles_interesados?: number[] | string;
  otras_observaciones?: string;

  usuario_id?: number;
  creador_nombre?: string;

  modalidad_nombre?: string;
  canton_nombre?: string;
  provincia_nombre?: string;
  pais_nombre?: string;

cupos?: number;

  // NUEVOS
  carreras?: string[];
  roles?: string[];
}

interface Props {
  eventos: Evento[];
  modalidades: { id_modalidad: number; nombre: string }[];
  ubicaciones: { id_canton: number; nombre: string }[];
  carreras: { id_carrera: number; nombre: string }[];
  roles: { id_rol: number; nombre_rol: string }[];
  userPermisos: number[];
}

/* =======================
   Componente
======================= */

export default function EventosIndex(props: Props) {
  const [eventos, setEventos] = useState<Evento[]>(props.eventos);
  const modal = useModal();
  const { auth } = usePage().props as any;

  const puedeGestionar = [1, 2, 3].includes(auth?.user?.id_rol);

  /* =======================
     Filtros
  ======================= */

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroModalidad, setFiltroModalidad] = useState("todas");
  const [filtroCreador, setFiltroCreador] = useState("");
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  const [eventosFiltradosState, setEventosFiltradosState] = useState<Evento[]>(eventos);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);


  const itemsPorPagina = 8;

  const eventosFiltrados = eventos
    // búsqueda
    .filter((e) =>
      e.titulo.toLowerCase().includes(busqueda.toLowerCase())
    )

    // estado
    .filter((e) => {
      if (filtroEstado === "publicado") return e.estado_id === 1;
      if (filtroEstado === "borrador") return e.estado_id !== 1;
      return true;
    })

    // modalidad
    .filter((e) => {
      if (filtroModalidad === "todas") return true;
      return e.modalidad_nombre === filtroModalidad;
    })

    // creador (tipo búsqueda)
    .filter((e) =>
      e.creador_nombre
        ?.toLowerCase()
        .includes(filtroCreador.toLowerCase())
    );

  const aplicarFiltros = () => {
    const filtrados = eventos
      .filter((e) =>
        e.titulo.toLowerCase().includes(busqueda.toLowerCase())
      )
      .filter((e) => {
        if (filtroEstado === "publicado") return e.estado_id === 1;
        if (filtroEstado === "borrador") return e.estado_id !== 1;
        return true;
      })
      .filter((e) => {
        if (filtroModalidad === "todas") return true;
        return e.modalidad_nombre === filtroModalidad;
      })
      .filter((e) =>
        e.creador_nombre?.toLowerCase().includes(filtroCreador.toLowerCase())
      );

    setEventosFiltradosState(filtrados);
    setPaginaActual(1);
    setFiltrosAplicados(true);
  };

  /* =======================
     KPIs
  ======================= */

  const totalEventos = eventosFiltrados.length;
  const publicados = eventosFiltrados.filter(e => e.estado_id === 1).length;
  const borradores = eventosFiltrados.filter(e => e.estado_id !== 1).length;

  /* =======================
     Paginación
  ======================= */

  const totalPaginas = Math.ceil(eventosFiltrados.length / itemsPorPagina);

  const eventosPaginados = eventosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  /* =======================
     Acciones
  ======================= */

  const inactivarEvento = async (evento: Evento) => {
    let motivo = "";

    const confirmado = await modal.confirmacion({
      titulo: "Inactivar evento",
      contenido: (
        <div>
          <p>
            ¿Seguro que deseas inactivar <strong>{evento.titulo}</strong>?
          </p>
          <textarea
            className="border p-2 w-full mt-2"
            onChange={(e) => (motivo = e.target.value)}
          />
        </div>
      ),
    });

    if (!confirmado) return;

    if (motivo.length < 10) {
      modal.alerta({
        titulo: "Motivo inválido",
        mensaje: "Debe tener mínimo 10 caracteres",
      });
      return;
    }

    try {
      await axios.put(
        route("eventos.estado", evento.id_evento),
        { motivo }
      );

      // eliminar del frontend
      setEventos((prev) =>
        prev.filter((e) => e.id_evento !== evento.id_evento)
      );

      modal.alerta({
        titulo: "Evento inactivado",
        mensaje: "Correctamente",
      });
    } catch (error: any) {

      modal.alerta({
        titulo: "Error",
        mensaje:
          error.response?.data?.message ??
          error.message ??
          "Error desconocido",
      });
    }
  };

  const publicarEvento = async (evento: Evento) => {
    try {
      await axios.put(route("eventos.publicar", { idEvento: evento.id_evento }));

      setEventos((prev) =>
        prev.map((e) =>
          e.id_evento === evento.id_evento
            ? { ...e, estado_id: 1 }
            : e
        )
      );

      modal.alerta({
        titulo: "Publicado",
        mensaje: "Evento publicado correctamente",
      });
    } catch (error: any) {
      modal.alerta({
        titulo: "Error",
        mensaje: error.response?.data?.message ?? "No se pudo publicar",
      });
    }
  };

  const [detalle, setDetalle] = useState<Evento | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [formEvento, setFormEvento] = useState({
    titulo: "",
    descripcion: "",
    fecha_evento: "",
    hora_evento: "",
    id_modalidad: "",
    id_ubicacion: "",
    carrerasInvitadas: [] as string[],
    rolesInteresados: [] as string[],
    otras_observaciones: "",
     cupos: "",
  });
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});
  const [carrerasOpen, setCarrerasOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const carrerasDropdownRef = useRef<HTMLDivElement | null>(null);
  const rolesDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (carrerasDropdownRef.current && !carrerasDropdownRef.current.contains(event.target as Node)) {
        setCarrerasOpen(false);
      }
      if (rolesDropdownRef.current && !rolesDropdownRef.current.contains(event.target as Node)) {
        setRolesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCarrera = (idCarrera: string) => {
    setFormEvento((prev) => {
      const seleccionadas = prev.carrerasInvitadas.includes(idCarrera)
        ? prev.carrerasInvitadas.filter((item) => item !== idCarrera)
        : [...prev.carrerasInvitadas, idCarrera];

      return { ...prev, carrerasInvitadas: seleccionadas };
    });
  };

  const toggleRol = (idRol: string) => {
    setFormEvento((prev) => {
      const seleccionadas = prev.rolesInteresados.includes(idRol)
        ? prev.rolesInteresados.filter((item) => item !== idRol)
        : [...prev.rolesInteresados, idRol];

      return { ...prev, rolesInteresados: seleccionadas };
    });
  };

  const normalizarHoraEvento = (hora?: string) => {
    if (!hora) return "";

    const partes = hora.trim().split(":");
    if (partes.length < 2) return hora.trim();

    return `${partes[0].padStart(2, "0")}:${partes[1].padStart(2, "0")}`;
  };

  const abrirFormularioEvento = (modo: "create" | "edit", evento?: Evento) => {
    setFormMode(modo);

    if (modo === "edit" && evento) {
      setEventoSeleccionado(evento);

      const carrerasInvitadas = typeof evento.carreras_invitadas === 'string'
        ? JSON.parse(evento.carreras_invitadas)
        : evento.carreras_invitadas ?? [];

      const rolesInteresados = Array.isArray(evento.roles_interesados)
        ? evento.roles_interesados
        : typeof evento.roles_interesados === 'string'
          ? JSON.parse(evento.roles_interesados)
          : [];

      setFormEvento({
        titulo: evento.titulo || "",
        descripcion: evento.descripcion || "",
        fecha_evento: evento.fecha_evento || "",
        hora_evento: normalizarHoraEvento(evento.hora_evento),
        id_modalidad: evento.id_modalidad ? String(evento.id_modalidad) : "",
        id_ubicacion: evento.id_ubicacion ? String(evento.id_ubicacion) : "",
        carrerasInvitadas: carrerasInvitadas.map(String),
        rolesInteresados: Array.isArray(rolesInteresados) ? rolesInteresados.map(String) : [],
        otras_observaciones: evento.otras_observaciones || "",
        cupos: evento.cupos ? String(evento.cupos) : "",
      });
    } else {
      setEventoSeleccionado(null);
      setFormEvento({
        titulo: "",
        descripcion: "",
        fecha_evento: "",
        hora_evento: "",
        id_modalidad: "",
        id_ubicacion: "",
        carrerasInvitadas: [],
        rolesInteresados: [],
        otras_observaciones: "",
        cupos:  "",
      });
    }

    setErroresForm({});
    setDetalle(null);
    setView("form");
  };

  const cerrarFormularioEvento = () => {
    setView("list");
    setEventoSeleccionado(null);
    setErroresForm({});
  };

  const filtrarTextoEvento = (valor: string, max: number) =>
    valor
      .replace(/[^\p{L}\p{N}\s.,;:()"'¡!¿?%&@\/-]/gu, "")
      .slice(0, max);

  const validarFormularioEvento = () => {
    const errores: Record<string, string> = {};
    const textoValido = /^[\p{L}\p{N}\s.,;:()"'¡!¿?%&@\/-]+$/u;

    if (!formEvento.titulo.trim()) {
      errores.titulo = "Tí­tulo es obligatorio";
    } else if (formEvento.titulo.trim().length < 5) {
      errores.titulo = "El tí­tulo debe tener al menos 5 caracteres";
    } else if (formEvento.titulo.trim().length > 100) {
      errores.titulo = "El tí­tulo no puede superar los 100 caracteres";
    } else if (!textoValido.test(formEvento.titulo.trim())) {
      errores.titulo = "El tí­tulo contiene caracteres inválidos";
    }

    if (!formEvento.descripcion.trim()) {
      errores.descripcion = "Descripción es obligatoria";
    } else if (formEvento.descripcion.trim().length < 10) {
      errores.descripcion = "Mínimo 10 caracteres";
    } else if (formEvento.descripcion.trim().length > 500) {
      errores.descripcion = "Máximo 500 caracteres";
    } else if (!textoValido.test(formEvento.descripcion.trim())) {
      errores.descripcion = "La descripción contiene caracteres inválidos";
    }

    if (!formEvento.fecha_evento) {
      errores.fecha_evento = "Fecha del evento es obligatoria";
    } else {
      const selectedDate = new Date(formEvento.fecha_evento);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date(`${new Date().getFullYear() + 2}-12-31`);
      if (selectedDate < today) {
        errores.fecha_evento = "La fecha debe ser hoy o posterior";
      } else if (selectedDate > maxDate) {
        errores.fecha_evento = "La fecha debe ser como máximo a dos años";
      }
    }

    if (!formEvento.hora_evento) {
      errores.hora_evento = "Hora del evento es obligatoria";
    }

    if (!formEvento.id_modalidad) {
      errores.id_modalidad = "Modalidad es obligatoria";
    }

    if (!formEvento.id_ubicacion) {
      errores.id_ubicacion = "Ubicación es obligatoria";
    }

    if (!formEvento.carrerasInvitadas.length) {
      errores.carrerasInvitadas = "Debe seleccionar al menos una carrera invitada";
    }

    if (!formEvento.rolesInteresados.length) {
      errores.rolesInteresados = "Debe seleccionar al menos un tipo de usuario interesado";
    }

    /*if (formMode === 'edit') {
      if (!formEvento.otras_observaciones.trim()) {
        errores.otras_observaciones = "Otras observaciones es obligatorio";
      }
    }*/

    if (formEvento.otras_observaciones.trim()) {
      if (formEvento.otras_observaciones.trim().length < 10) {
        errores.otras_observaciones = "Mínimo 10 caracteres";
      } else if (formEvento.otras_observaciones.trim().length > 500) {
        errores.otras_observaciones = "Máximo 500 caracteres";
      }
    }
if (formEvento.cupos) {
  const cuposNum = Number(formEvento.cupos);

  if (isNaN(cuposNum)) {
    errores.cupos = "Debe ser un número válido";
  } else if (cuposNum <= 0) {
    errores.cupos = "Debe ser mayor a 0";
  } else if (cuposNum > 10000) {
    errores.cupos = "Máximo permitido: 10000";
  }
}
    setErroresForm(errores);
    return Object.keys(errores).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

const submitFormularioEvento = async () => {

  if (isSubmitting) { 
    return;
  }

  const valido = validarFormularioEvento();

  if (!valido) {
    return;
  }

  setIsSubmitting(true);

  try {
    if (formMode === "create") {
      const payload = {
        ...formEvento,
        id_modalidad: formEvento.id_modalidad || null,
        id_ubicacion: formEvento.id_ubicacion || null,
        hora_evento: normalizarHoraEvento(formEvento.hora_evento),
        carreras_invitadas: formEvento.carrerasInvitadas.map(Number),
        roles_interesados: formEvento.rolesInteresados.map(Number),
        otras_observaciones: formEvento.otras_observaciones.trim() || null,
        cupos: formEvento.cupos.trim() === "" ? null : Number(formEvento.cupos),
      };

      const response = await axios.post(route("eventos.store"), payload);

      setEventos((prev) => [response.data.evento, ...prev]);

    } else if (eventoSeleccionado) {
      const payload = {
        ...formEvento,
        id_modalidad: formEvento.id_modalidad || null,
        id_ubicacion: formEvento.id_ubicacion || null,
        hora_evento: normalizarHoraEvento(formEvento.hora_evento),
        carreras_invitadas: formEvento.carrerasInvitadas.map(Number),
        roles_interesados: formEvento.rolesInteresados.map(Number),
        otras_observaciones: formEvento.otras_observaciones.trim() || null,
        cupos: formEvento.cupos.trim() === "" ? null : Number(formEvento.cupos),
      };

      const response = await axios.put(
        route("eventos.update", { idEvento: eventoSeleccionado.id_evento }),
        payload
      );

      setEventos((prev) =>
        prev.map((evento) =>
          evento.id_evento === eventoSeleccionado.id_evento
            ? response.data.evento
            : evento
        )
      );
    }

    modal.alerta({
      titulo: "Éxito",
      mensaje: "Operación realizada correctamente",
    });

    cerrarFormularioEvento();

  } catch (error: any) {

    modal.alerta({
      titulo: "Error",
      mensaje:
        error.response?.data?.message ??
        "Ocurrió un error al guardar el evento.",
    });

  } finally {
    setIsSubmitting(false);
  }
};

  const editarEvento = async (evento: Evento) => {
    try {
      const response = await axios.get(route("eventos.show", { idEvento: evento.id_evento }));
      if (response.data?.success) {
        abrirFormularioEvento("edit", response.data.evento);
      } else {
        modal.alerta({
          titulo: "Error",
          mensaje: "No se pudo cargar el evento para edición.",
        });
      }
    } catch (error: any) {
      modal.alerta({
        titulo: "Error",
        mensaje: error.response?.data?.message ?? "No se pudo cargar el evento.",
      });
    }
  };

  const modalidadesUnicas = Array.from(
    new Set(eventos.map(e => e.modalidad_nombre).filter(Boolean))
  );
  /* =======================
     Render
  ======================= */

  return (
    <>
      <Head title="Gestión de Eventos" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 relative">

        {/* HEADER: Aseguramos que sea un bloque sólido que empuje el contenido hacia abajo */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-[#034991]">
              {view === "list" ? "Gestión de Eventos" :
                formMode === 'create' ? 'Registrar Evento' : 'Editar Evento'}
            </h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
              {view === "list"
                ? "Administra los eventos, publica, edita y consulta información rápidamente."
                : formMode === 'create'
                  ? "Crea un nuevo evento completando los campos del formulario."
                  : `Actualiza la información y fechas del evento: ${formEvento.titulo || ''}`}
            </p>
          </div>

          {/* DERECHA */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Solo mostrar Filtros y Registrar si estamos en la lista */}
            {view === "list" && (
              <>
                {/* Botón Dashboard - Ahora condicionado a la lista */}
                <Button
                  variant="outline"
                  className="h-10 rounded-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB]"
                  onClick={() => window.location.href = route("dashboard")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>

                {/* Botón Filtros */}
                <Button
                  variant="outline"
                  className="h-10 rounded-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB]"
                  onClick={() => setMostrarFiltros(prev => !prev)}
                >
                  {mostrarFiltros ? (
                    <>
                      <FilterX className="w-4 h-4 mr-2" />
                      Ocultar filtros
                    </>
                  ) : (
                    <>
                      <Filter className="w-4 h-4 mr-2" />
                      Mostrar filtros
                    </>
                  )}
                </Button>

                {/* Botón Registrar */}
                {puedeGestionar && (
                  <Button
                    className="h-10 rounded-full bg-[#034991] hover:bg-[#023165]"
                    onClick={() => abrirFormularioEvento("create")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar evento
                  </Button>
                )}
              </>
            )}

            {/* Solo mostrar botón Volver si estamos en el formulario */}
            {view === "form" && (
              <Button
                variant="secondary"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 border-none shadow-sm transition-all"
                onClick={cerrarFormularioEvento}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Volver
              </Button>
            )}
          </div>
        </div>

        {view === "list" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* SIDEBAR SOLO SI mostrarFiltros */}
            {mostrarFiltros && (
              <aside className="lg:col-span-3 transition-all duration-300">
                <div className="sticky top-6">
                  <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">

                    <h2 className="text-lg font-semibold text-[#034991] border-b pb-2 flex items-center gap-2">

                      <Filter className="w-4 h-4" /> Filtros de eventos

                    </h2>

                    <div className="space-y-4 text-sm">

                      <div className="flex flex-col">
                        <label className="font-semibold mb-1 text-slate-700">Buscar</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input placeholder="Tí­tulo del evento..."
                            value={busqueda}
                            onChange={(e) => {
                              setBusqueda(e.target.value);
                              setPaginaActual(1);
                            }}
                            className="w-full pl-9 bg-white text-black border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold mb-1 text-slate-700">Estado</label>
                        <select value={filtroEstado}
                          onChange={(e) => {
                            setFiltroEstado(e.target.value);
                            setPaginaActual(1);
                          }}
                          className="bg-white text-black border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none" >
                          <option value="todos">Todos los estados</option>
                          <option value="publicado">Publicado</option>
                          <option value="borrador">Borrador</option>
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold mb-1 text-slate-700">Modalidad</label>
                        <select
                          value={filtroModalidad}
                          onChange={(e) => {
                            setFiltroModalidad(e.target.value);
                            setPaginaActual(1);
                          }}
                          className="bg-white text-black border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="todas">Todas</option>
                          {modalidadesUnicas.map((m, index) => (
                            <option key={index} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold mb-1 text-slate-700">Creador</label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            placeholder="Nombre del creador..."
                            value={filtroCreador}
                            onChange={(e) => {
                              setFiltroCreador(e.target.value);
                              setPaginaActual(1);
                            }}
                            className="w-full pl-9 bg-white text-black border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <Button
                        variant="default"
                        onClick={aplicarFiltros}
                        className="w-full rounded-full"
                      >
                        Aplicar filtros
                      </Button>

                      <Button
                        variant="outline"
                        title="Quitar filtros"
                        className="w-full border-[#034991] text-[#034991] hover:bg-[#E6F2FB] rounded-full"
                        onClick={() => {
                          setBusqueda("");
                          setFiltroEstado("todos");
                          setFiltroModalidad("todas");
                          setFiltroCreador("");
                        }}
                      >
                        Limpiar filtros

                      </Button>

                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* MAIN DINÁMICO */}
            <main className={`${mostrarFiltros ? "lg:col-span-9" : "lg:col-span-12"} space-y-4 transition-all duration-300`}>


              {/* KPIs ESTILO CURSOS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                  <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Total Eventos</p>
                    <p className="text-2xl font-bold text-slate-900">{totalEventos}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Publicados</p>
                    <p className="text-2xl font-bold text-slate-900">{publicados}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                  <div className="rounded-xl bg-amber-100 p-2 text-amber-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Borradores</p>
                    <p className="text-2xl font-bold text-slate-900">{borradores}</p>
                  </div>
                </div>
              </div>

              {/* RESULTADO FILTROS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">

                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                    Resultado de filtros
                  </h3>
                  <span className="text-xs text-slate-400">
                    {eventosFiltrados.length} resultados
                  </span>
                </div>

                {/* LISTA DE EVENTOS */}
                <div
                  className={`grid grid-cols-1 ${mostrarFiltros
                    ? "md:grid-cols-2"
                    : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
                    } gap-3`}
                >
                  {eventosPaginados.length > 0 ? (
                    eventosPaginados.map((evento) => (
                      <div key={evento.id_evento} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h2
                              className="font-bold text-lg text-slate-800 line-clamp-1 cursor-pointer hover:text-blue-600 transition"
                              onClick={() =>
                                router.visit(route("eventos.inscritos", { idEvento: evento.id_evento }))
                              }
                            >
                              {evento.titulo}
                            </h2>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${evento.estado_id === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                              {evento.estado_id === 1 ? 'Publicado' : 'Borrador'}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                            {evento.descripcion ?? "Sin descripciÓn disponible para este evento."}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-blue-500" />
                              {evento.fecha_evento || 'Por definir'}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-red-500" />
                              <span className="truncate">{evento.canton_nombre}, {evento.provincia_nombre}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto pt-4 border-t flex gap-2 flex-wrap">
                          {evento.estado_id === 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-[#034991] hover:bg-blue-50"
                              onClick={() => router.visit(route("eventos.inscritos", { idEvento: evento.id_evento }))}
                            >
                              <User className="w-3 h-3 mr-1" /> Inscritos
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="secondary"
                            title="Ver evento"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700"
                            onClick={async () => {
                              try {
                                const res = await axios.get(route("eventos.show", evento.id_evento));

                                if (res.data.success) {
                                  setDetalle(res.data.evento);
                                }
                              } catch {
                                modal.alerta({
                                  titulo: "Error",
                                  mensaje: "No se pudo cargar el detalle del evento",
                                });
                              }
                            }}
                          >
                            <Eye className="w-3.5 mr-1" /> Ver
                          </Button>

                          {/* Botón Agregar: Solo visible si tiene permisos y está en la lista */}
                          {puedeGestionar && (
                            <>
                              {evento.estado_id !== 1 && (
                                <Button size="sm" title="Publicar evento" onClick={() => publicarEvento(evento)}>
                                  <Play className="w-3 mr-1" /> Publicar
                                </Button>
                              )}
                              <Button size="sm" variant="outline" title="Editar evento" className="border-slate-300" onClick={() => editarEvento(evento)}>
                                <Edit3 className="w-3.5 mr-1" /> Editar
                              </Button>
                              <Button size="sm" variant="destructive" title="Inactivar evento" onClick={() => inactivarEvento(evento)}>
                                <Trash2 className="w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500 py-10">
                      No se encontraron eventos que coincidan con los filtros aplicados.
                    </div>
                  )}
                </div>
              </div>

              {/* PAGINACIÓN ESTILO  */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-slate-500 text-sm bg-slate-50 p-3 rounded-xl border border-slate-200">

                {/* IZQUIERDA */}
                <div>
                  Mostrando {eventosPaginados.length} de {eventosFiltrados.length} eventos
                </div>

                {/* DERECHA */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPaginaActual(paginaActual - 1)}
                    disabled={paginaActual === 1}
                  >
                    Anterior
                  </Button>

                  <div className="flex items-center px-4 font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg h-8 shadow-sm">
                    {paginaActual} / {totalPaginas || 1}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPaginaActual(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas || totalPaginas === 0}
                  >
                    Siguiente
                  </Button>
                </div>

              </div>
            </main>
          </div >

        ) : (
          <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-12">

                {/* SIDEBAR INFORMATIVO (Estilo Cursos/Ofertas) */}
                <aside className="col-span-12 md:col-span-3 bg-gray-50/50 border-r border-gray-100 p-8 flex flex-col items-center">
                  <div className="flex flex-col items-center text-center mb-10">
                    <div className="relative p-4 bg-white rounded-full shadow-md mb-4 text-[#034991]">
                      <CalendarDays className="w-16 h-16" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      Gestión de Eventos
                    </h3>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">
                      Módulo de Vinculación
                    </span>
                  </div>

                  <div className="hidden md:block space-y-4">
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                      <p className="text-xs text-[#034991] font-medium leading-relaxed">
                        {formMode === 'create'
                          ? "Estás registrando un nuevo evento. Asegúrate de definir la ubicación y las carreras invitadas correctamente."
                          : "Estás editando la información de un evento. Los cambios se actualizarán en el calendario de los interesados."}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[11px] text-slate-500 font-medium uppercase mb-2 tracking-wider">Recordatorio</p>
                      <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                        <li>Define la modalidad</li>
                        <li>Selecciona carreras</li>
                        <li>Indica el tipo de público</li>
                      </ul>
                    </div>
                  </div>
                </aside>

                {/* CUERPO DEL FORMULARIO */}
                <section className="col-span-12 md:col-span-9 p-6 md:p-10 flex flex-col">
                  <div className="flex-grow space-y-6">
                    {/* Encabezado interno */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">
                          {formMode === 'create' ? "Información General del Evento" : "Modificar Detalles del Evento"}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                          {formMode === 'create'
                            ? "Complete los campos para publicar el nuevo evento en el sistema."
                            : "Actualice la información necesaria del evento seleccionado."}
                        </p>
                      </div>
                    </div>

                    {/* Grid de campos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">

                      {/* Título y Modalidad */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Título del evento <span className="text-[#CD1719]">*</span>
                        </label>
                        <input
                          value={formEvento.titulo}
                          onChange={(e) => setFormEvento((prev) => ({ ...prev, titulo: filtrarTextoEvento(e.target.value, 100) }))}
                          className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${erroresForm.titulo ? "border-[#CD1719] ring-red-50" : "border-slate-300"}`}
                          placeholder="Ej: Jornada de Vinculación Profesional"
                        />
                        {erroresForm.titulo && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{erroresForm.titulo}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Modalidad <span className="text-[#CD1719]">*</span>
                        </label>
                        <select
                          value={formEvento.id_modalidad}
                          onChange={(e) => setFormEvento((prev) => ({ ...prev, id_modalidad: e.target.value }))}
                          className={`w-full border rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${erroresForm.id_modalidad ? "border-[#CD1719]" : "border-slate-300"}`}
                        >
                          <option value="">Seleccione</option>
                          {(props.modalidades ?? []).map((m) => (
                            <option key={m.id_modalidad} value={m.id_modalidad}>{m.nombre}</option>
                          ))}
                        </select>
                        {erroresForm.id_modalidad && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{erroresForm.id_modalidad}</p>}
                      </div>

                      {/* DescripciÃ³n */}
                      <div className="md:col-span-3">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Descripción del evento <span className="text-[#CD1719]">*</span>
                        </label>
                        <textarea
                          value={formEvento.descripcion}
                          onChange={(e) => setFormEvento((prev) => ({ ...prev, descripcion: filtrarTextoEvento(e.target.value, 500) }))}
                          className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${erroresForm.descripcion ? "border-[#CD1719]" : "border-slate-300"}`}
                          rows={3}
                          placeholder="Detalle los objetivos y actividades del evento..."
                        />
                        {erroresForm.descripcion && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{erroresForm.descripcion}</p>}
                      </div>

                      {/* Fecha, Hora y Ubicación */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Fecha del evento <span className="text-[#CD1719]">*</span>
                        </label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={formEvento.fecha_evento}
                          onChange={(e) => setFormEvento((prev) => ({ ...prev, fecha_evento: e.target.value }))}
                          className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${erroresForm.fecha_evento ? "border-[#CD1719]" : "border-slate-300"}`}
                        />
                        {erroresForm.fecha_evento && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{erroresForm.fecha_evento}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Hora de inicio <span className="text-[#CD1719]">*</span>
                        </label>
                        <input
                          type="time"
                          value={formEvento.hora_evento}
                          onChange={(e) => setFormEvento((prev) => ({ ...prev, hora_evento: e.target.value }))}
                          className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${erroresForm.hora_evento ? "border-[#CD1719]" : "border-slate-300"}`}
                        />
                        {erroresForm.hora_evento && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{erroresForm.hora_evento}</p>}
                      </div>
<div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        Límite de cupos
    </label>
    <input
        type="number"
        min={1}
        step={1}
        value={formEvento.cupos ?? ""}
       onChange={(e) =>
  setFormEvento((prev) => ({
    ...prev,
    cupos: e.target.value,
  }))
}
        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
        placeholder="Ej: 50"
    />
    <p className="text-gray-400 text-[11px] mt-1 italic font-medium">
        Déjelo vacío para eventos sin límite de cupos.
    </p>
</div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Ubicación / Cantón <span className="text-[#CD1719]">*</span>
                        </label>
                        <select
                          value={formEvento.id_ubicacion}
                          onChange={(e) => setFormEvento((prev) => ({ ...prev, id_ubicacion: e.target.value }))}
                          className={`w-full border rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${erroresForm.id_ubicacion ? "border-[#CD1719]" : "border-slate-300"}`}
                        >
                          <option value="">Seleccione</option>
                          {(props.ubicaciones ?? []).map((u) => (
                            <option key={u.id_canton} value={u.id_canton}>{u.nombre}</option>
                          ))}
                        </select>
                        {erroresForm.id_ubicacion && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{erroresForm.id_ubicacion}</p>}
                      </div>

                      {/* Carreras y Roles (Multi-selects con estilo alineado) */}
                      <div className="md:col-span-2 relative" ref={carrerasDropdownRef}>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Carreras invitadas <span className="text-[#CD1719]">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setCarrerasOpen((prev) => !prev)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${erroresForm.carrerasInvitadas ? "border-[#CD1719] bg-red-50" : "border-slate-300 bg-white"}`}
                        >
                          <div className="flex flex-wrap items-center gap-2 min-h-[46px]">
                            {formEvento.carrerasInvitadas.length === 0 ? (
                              <span className="text-slate-400">Seleccione las opciones</span>
                            ) : (
                              formEvento.carrerasInvitadas.map((carreraId) => {
                                const item = props.carreras.find((c) => String(c.id_carrera) === carreraId);
                                return item ? (
                                  <span key={carreraId} className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-1 text-xs font-medium">
                                    {item.nombre}
                                  </span>
                                ) : null;
                              })
                            )}
                          </div>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </button>

                        {carrerasOpen && (
                          <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl max-h-72 overflow-auto p-3">
                            {(props.carreras ?? []).map((carrera) => {
                              const seleccionado = formEvento.carrerasInvitadas.includes(String(carrera.id_carrera));
                              return (
                                <div
                                  key={carrera.id_carrera}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => toggleCarrera(String(carrera.id_carrera))}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault();
                                      toggleCarrera(String(carrera.id_carrera));
                                    }
                                  }}
                                  className="w-full text-left rounded-xl px-3 py-2 transition-colors hover:bg-slate-100 flex items-center gap-3 cursor-pointer"
                                >
                                  <Checkbox checked={seleccionado} onCheckedChange={() => toggleCarrera(String(carrera.id_carrera))} />
                                  <span className="text-sm text-slate-700">{carrera.nombre}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {erroresForm.carrerasInvitadas && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{erroresForm.carrerasInvitadas}</p>}
                      </div>

                      <div className="md:col-span-1 relative" ref={rolesDropdownRef}>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Público objetivo <span className="text-[#CD1719]">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setRolesOpen((prev) => !prev)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${erroresForm.rolesInteresados ? "border-[#CD1719] bg-red-50" : "border-slate-300 bg-white"}`}
                        >
                          <div className="flex flex-wrap items-center gap-2 min-h-[46px]">
                            {formEvento.rolesInteresados.length === 0 ? (
                              <span className="text-slate-400">Seleccione las opciones</span>
                            ) : (
                              formEvento.rolesInteresados.map((rolId) => {
                                const item = props.roles.find((r) => String(r.id_rol) === rolId);
                                return item ? (
                                  <span key={rolId} className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-xs font-medium">
                                    {item.nombre_rol}
                                  </span>
                                ) : null;
                              })
                            )}
                          </div>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </button>

                        {rolesOpen && (
                          <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl max-h-72 overflow-auto p-3">
                            {(props.roles ?? []).map((rol) => {
                              const seleccionado = formEvento.rolesInteresados.includes(String(rol.id_rol));
                              return (
                                <div
                                  key={rol.id_rol}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => toggleRol(String(rol.id_rol))}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault();
                                      toggleRol(String(rol.id_rol));
                                    }
                                  }}
                                  className="w-full text-left rounded-xl px-3 py-2 transition-colors hover:bg-slate-100 flex items-center gap-3 cursor-pointer"
                                >
                                  <Checkbox checked={seleccionado} onCheckedChange={() => toggleRol(String(rol.id_rol))} />
                                  <span className="text-sm text-slate-700">{rol.nombre_rol}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {erroresForm.rolesInteresados && <p className="text-xs text-[#CD1719] mt-1.5 font-medium">{erroresForm.rolesInteresados}</p>}
                      </div>

                      {/* Observaciones */}
                      <div className="md:col-span-3">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Otras observaciones
                        </label>
                        <textarea
                          value={formEvento.otras_observaciones}
                          onChange={(e) => setFormEvento((prev) => ({ ...prev, otras_observaciones: filtrarTextoEvento(e.target.value, 500) }))}
                          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          rows={2}
                          placeholder="Dirección exacta, enlaces de reunión o requisitos adicionales..."
                        />
                        {formMode === 'create' && (
                          <p className="text-gray-400 text-[11px] mt-1 italic font-medium">Puede definirse luego</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FOOTER DE BOTONES */}
                  <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
                    <Button
                      variant="ghost"
                      onClick={cerrarFormularioEvento}
                      className="text-slate-500 hover:bg-slate-100 px-8 rounded-full transition-colors font-medium"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={submitFormularioEvento}
                      disabled={isSubmitting}
                      className={`bg-[#034991] text-white px-10 rounded-full shadow-lg transition-all active:scale-95 font-semibold ${isSubmitting ? 'opacity-60 cursor-not-allowed hover:bg-[#034991]' : 'hover:bg-blue-800'}`}
                    >
                      {isSubmitting ? 'Procesando...' : formMode === "create" ? "Registrar evento" : "Guardar cambios"}
                    </Button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETALLE (OVERLAY ESTILO CURSOS) */}
      {
        <EventoDetalleModal
          detalle={detalle}
          onClose={() => setDetalle(null)}
        />
      }
    </>
  );
}

EventosIndex.layout = (page: any) => (
  <PpLayout userPermisos={page.props.userPermisos}>
    {page}
  </PpLayout>
);
