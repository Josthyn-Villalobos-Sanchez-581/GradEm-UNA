import React, { useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { route } from "ziggy-js";
import { ArrowLeft, Bell, Calendar, CalendarClock, Clock, Download, MapPin, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import axios from "axios";
import { Loader2 } from "lucide-react";
interface Evento {
  id_evento: number;
  titulo: string;
  descripcion?: string;
  fecha_evento?: string;
  hora_evento?: string;
  estado_id: number;
  modalidad_nombre?: string;
  canton_nombre?: string;
  provincia_nombre?: string;
  pais_nombre?: string;
}

interface Inscrito {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  identificacion: string;
  telefono: string;
  universidad?: string;
  carrera?: string;
}

interface Props {
  evento: Evento;
  inscritos: Inscrito[];
  inscritosCount: number;
  userPermisos?: number[];
}

export default function GestionInscritos({ evento, inscritos }: Props) {
  const modal = useModal();
  const [busqueda, setBusqueda] = useState("");
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModalRecordatorio, setMostrarModalRecordatorio] = useState(false);
  const [mensajeRecordatorio, setMensajeRecordatorio] = useState("");
  const [enviandoRecordatorio, setEnviandoRecordatorio] = useState(false);

  const itemsPorPagina = 10;

  const inscritosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();
    if (!texto) return inscritos;

    return inscritos.filter((i) => {
      return (
        i.nombre_completo?.toLowerCase().includes(texto) ||
        i.correo?.toLowerCase().includes(texto) ||
        i.identificacion?.toLowerCase().includes(texto) ||
        i.telefono?.toLowerCase().includes(texto) ||
        i.universidad?.toLowerCase().includes(texto) ||
        i.carrera?.toLowerCase().includes(texto)
      );
    });
  }, [inscritos, busqueda]);

  const totalPaginas = Math.ceil(inscritosFiltrados.length / itemsPorPagina);

  const inscritosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return inscritosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [inscritosFiltrados, paginaActual]);

  const manejarCambioBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorRaw = e.target.value;
    const valorValidado = valorRaw
      .replace(/[^A-Za-z0-9\u00C0-\u017F ]/g, "")
      .slice(0, 100);

    setBusqueda(valorValidado);
    setPaginaActual(1);
  };

  const displayValue = (value?: string | null) => {
    if (!value) return "NA";
    const trimmed = value.trim();
    return trimmed.length ? trimmed : "NA";
  };

  const ubicacionCompleta = [
    evento.canton_nombre,
    evento.provincia_nombre,
    evento.pais_nombre,
  ]
    .filter(Boolean)
    .join(", ");

  const correosInscritos = useMemo(() => {
    const validos = inscritos
      .map((i) => i.correo?.trim())
      .filter((correo): correo is string => Boolean(correo));

    return Array.from(new Set(validos));
  }, [inscritos]);

  const descargarPdf = async (tipo: string) => {
    if (descargandoPdf) return;

    setDescargandoPdf(true);

    modal.alerta({
      titulo: "Generando PDF",
      textoAceptar: "",
      contenido: (
        <div className="flex flex-col items-center gap-4 py-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#034991]" />
          <p className="text-sm text-slate-600">
            Estamos preparando tu archivo PDF...
          </p>
        </div>
      ),
    });

    try {
      const res = await axios.get(
        route("eventos.pdf", {
          idEvento: evento.id_evento,
          tipo,
        }),
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download =
        tipo === "participantes"
          ? `Participantes_${evento.titulo}.pdf`
          : `Asistencia_${evento.titulo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      modal.alerta({
        titulo: "Descarga completada",
        mensaje: "El PDF se descargó correctamente.",
      });
    } catch {
      modal.alerta({
        titulo: "Error",
        mensaje: "Ocurrió un problema al descargar el PDF.",
      });
    } finally {
      setDescargandoPdf(false);
    }
  };

  const abrirModalPdf = () => {
    modal.alerta({
      titulo: "Descargar lista de participantes",
      textoAceptar: "Cerrar",
      contenido: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Selecciona el tipo de PDF que deseas descargar.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              className="w-full rounded-full bg-[#034991] hover:bg-[#02386f]"
              onClick={() => descargarPdf("participantes")}
              disabled={descargandoPdf}
            >
              {descargandoPdf ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando PDF...
                </>
              ) : (
                "Descargar Lista de Participantes"
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full rounded-full border-[#034991]/30 text-[#034991] hover:bg-[#034991]/10 hover:text-[#02386f]"
              onClick={() => descargarPdf("asistencia")}
              disabled={descargandoPdf}
            >
              {descargandoPdf ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando PDF...
                </>
              ) : (
                "Descargar Hoja de Asistencia"
              )}
            </Button>
          </div>
        </div>
      ),
    });
  };

  const abrirModalRecordatorio = async () => {
    if (inscritos.length === 0) {
      await modal.alerta({
        titulo: "Sin inscritos",
        mensaje: "No hay inscritos para enviar recordatorios.",
      });
      return;
    }

    if (correosInscritos.length === 0) {
      await modal.alerta({
        titulo: "Sin correos válidos",
        mensaje: "No se encontraron correos para enviar recordatorios.",
      });
      return;
    }

    setMostrarModalRecordatorio(true);
  };

  const enviarRecordatorio = async () => {
    const mensaje = mensajeRecordatorio.trim();

    if (mensaje.length < 10) {
      await modal.alerta({
        titulo: "Mensaje incompleto",
        mensaje: "El recordatorio debe tener al menos 10 caracteres.",
      });
      return;
    }

    setEnviandoRecordatorio(true);

    try {
      const response = await axios.post(route("notificaciones.eventos.recordatorio"), {
        id_evento: evento.id_evento,
        correos: correosInscritos,
        nombre_evento: evento.titulo,
        fecha_evento: displayValue(evento.fecha_evento),
        mensaje,
      });

      const enviados = response?.data?.enviados ?? correosInscritos.length;

      setMostrarModalRecordatorio(false);
      setMensajeRecordatorio("");

      await modal.alerta({
        titulo: "Recordatorio enviado",
        mensaje: `Se envió el recordatorio a ${enviados} inscritos.`,
      });
    } catch (error: any) {
      await modal.alerta({
        titulo: "Error al enviar",
        mensaje:
          error?.response?.data?.message ??
          error?.response?.data?.mensaje ??
          "No fue posible enviar el recordatorio. Intenta nuevamente.",
      });
    } finally {
      setEnviandoRecordatorio(false);
    }
  };

  const confirmarEliminarInscrito = async (inscrito: Inscrito) => {
    const confirmado = await modal.confirmacion({
      titulo: "Eliminar inscripción",
      mensaje: `¿Deseas eliminar a ${inscrito.nombre_completo} del evento?`,
      textoAceptar: "Sí, eliminar",
      textoCancelar: "Cancelar",
    });

    if (!confirmado) return;

    eliminarInscrito(inscrito.id_usuario);
  };

  const eliminarInscrito = async (idUsuario: number) => {
    try {
      setEliminandoId(idUsuario);

      await axios.delete(
        route("eventos.inscritos.eliminar", {
          idEvento: evento.id_evento,
          idUsuario,
        })
      );

      modal.alerta({
        titulo: "Éxito",
        mensaje: "Participante eliminado correctamente.",
      });

      router.reload({
        only: ["inscritos", "inscritosCount"],
      });
    } catch {
      modal.alerta({
        titulo: "Error",
        mensaje: "No se pudo eliminar al participante.",
      });
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <>
      <Head title={`Inscritos - ${evento.titulo}`} />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inscritos del evento</h1>
            <p className="text-sm text-slate-500 font-medium">
              {evento.titulo} |{" "}
              <span className="text-red-600 font-bold">
                {inscritos.length} {inscritos.length === 1 ? "inscrito" : "inscritos"}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={manejarCambioBusqueda}
                placeholder="Buscar por nombre, correo, ID o carrera..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>

            <Button
              onClick={abrirModalPdf}
              className="bg-[#034991] hover:bg-[#02386f] rounded-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>

            <Button
              onClick={abrirModalRecordatorio}
              className="bg-[#034991] hover:bg-[#02386f] text-white rounded-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              Enviar recordatorio
            </Button>

            <Button
              variant="outline"
              onClick={() => router.visit(route("eventos.index"))}
              className="rounded-full border-[#034991]/30 text-[#034991] hover:bg-[#034991]/10 hover:text-[#02386f]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a eventos
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <aside className="lg:col-span-4 xl:col-span-3 bg-gray-50/50 border border-gray-200 rounded-2xl p-8 flex flex-col items-center shadow-sm h-fit sticky top-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative p-4 bg-white rounded-full shadow-md mb-4 text-[#034991]">
                <CalendarClock className="w-12 h-12" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-3">{evento.titulo}</h3>

              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider mt-3">
                {displayValue(evento.modalidad_nombre)}
              </span>
            </div>

            <div className="w-full space-y-4">
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Modalidad</p>
                <p className="text-sm font-semibold text-slate-800">{displayValue(evento.modalidad_nombre)}</p>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#034991]" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#034991]/70 tracking-tight">Fecha del evento</p>
                      <p className="text-sm font-semibold text-slate-700">{displayValue(evento.fecha_evento)}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-100/50 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#034991]/70 tracking-tight">Hora del evento</p>
                      <p className="text-sm font-semibold text-slate-700">{displayValue(evento.hora_evento)}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-100/50 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#034991]/70 tracking-tight">Ubicación</p>
                      <p className="text-sm font-semibold text-slate-700">{displayValue(ubicacionCompleta)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center italic px-2">
                Mostrando la lista oficial de participantes inscritos hasta la fecha.
              </p>
            </div>
          </aside>

          <div className="lg:col-span-8 xl:col-span-9">
            <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Correo</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Identificación</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Teléfono</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Universidad</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Carrera</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inscritosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-medium italic">
                          No se encontraron inscritos que coincidan con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      inscritosPaginados.map((inscrito) => (
                        <tr key={inscrito.id_usuario} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-slate-800">{displayValue(inscrito.nombre_completo)}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{displayValue(inscrito.correo)}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{displayValue(inscrito.identificacion)}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{displayValue(inscrito.telefono)}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{displayValue(inscrito.universidad)}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{displayValue(inscrito.carrera)}</td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-full text-[#034991] hover:bg-[#034991]/10 hover:text-[#02386f]"
                              onClick={() => confirmarEliminarInscrito(inscrito)}
                              disabled={eliminandoId === inscrito.id_usuario}
                            >
                              {eliminandoId === inscrito.id_usuario ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {inscritosFiltrados.length > 0 && (
                <div className="mt-4 flex items-center justify-between text-slate-500 text-sm bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    Mostrando {inscritosFiltrados.length} resultados de {inscritos.length} inscritos totales.
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full h-8 px-3 text-xs font-medium border-[#034991]/30 text-[#034991] hover:bg-[#034991]/10 hover:text-[#02386f]"
                      onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                      disabled={paginaActual === 1}
                    >
                      Anterior
                    </Button>

                    <div className="flex items-center px-4 font-semibold text-[#034991] bg-white border border-[#034991]/20 rounded-full h-8 shadow-sm">
                      {paginaActual} / {totalPaginas || 1}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full h-8 px-3 text-xs font-medium border-[#034991]/30 text-[#034991] hover:bg-[#034991]/10 hover:text-[#02386f]"
                      onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                      disabled={paginaActual === totalPaginas || totalPaginas === 0}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {mostrarModalRecordatorio && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Enviar recordatorio</h2>
              <p className="text-sm text-slate-600 mb-4">
                Se enviará a {correosInscritos.length} inscritos del evento.
              </p>

              <label className="block text-sm font-medium text-slate-700 mb-2">Mensaje del recordatorio</label>
              <textarea
                value={mensajeRecordatorio}
                onChange={(e) => setMensajeRecordatorio(e.target.value.slice(0, 1000))}
                placeholder="Escribe el mensaje que recibirán los inscritos..."
                className="w-full min-h-[140px] rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
              <p className="text-xs text-slate-500 mt-2">{mensajeRecordatorio.length}/1000 caracteres</p>

              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="rounded-full border-[#034991]/30 text-[#034991] hover:bg-[#034991]/10 hover:text-[#02386f]"
                  onClick={() => {
                    setMostrarModalRecordatorio(false);
                    setMensajeRecordatorio("");
                  }}
                  disabled={enviandoRecordatorio}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={enviarRecordatorio}
                  disabled={enviandoRecordatorio}
                  className="rounded-full bg-[#034991] hover:bg-[#02386f] text-white"
                >
                  {enviandoRecordatorio ? "Enviando..." : "Enviar recordatorio"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

GestionInscritos.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
