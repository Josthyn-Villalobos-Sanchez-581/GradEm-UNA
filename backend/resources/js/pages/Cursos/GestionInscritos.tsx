import React, { useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { route } from "ziggy-js";
import { ArrowLeft, Bell, Download, Search, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useModal } from "@/hooks/useModal";

interface Curso {
  id_curso: number;
  titulo: string;
  descripcion?: string;
  id_modalidad?: number;
  modalidad?: { id_modalidad: number; nombre: string };
  nombreInstructor?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_limite_inscripcion?: string;
  duracion?: string;
  cupos?: number;
  estado_id: number;
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
  curso: Curso;
  inscritos: Inscrito[];
  inscritosCount: number;
  userPermisos?: number[];
}

export default function GestionInscritos({ curso, inscritos }: Props) {
  const modal = useModal();
  const [busqueda, setBusqueda] = useState("");
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

  const correosInscritos = useMemo(() => {
    const validos = inscritos
      .map((i) => i.correo?.trim())
      .filter((correo): correo is string => Boolean(correo));

    return Array.from(new Set(validos));
  }, [inscritos]);

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

  const descargarPdf = () => {
    window.location.href = route("cursos.inscritos.descargar-pdf", {
      idCurso: curso.id_curso,
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
      await axios.post(route("notificaciones.cursos.recordatorio"), {
        correos: correosInscritos,
        nombre_curso: curso.titulo,
        fecha_evento: displayValue(curso.fecha_inicio),
        mensaje,
      });

      setMostrarModalRecordatorio(false);
      setMensajeRecordatorio("");

      await modal.alerta({
        titulo: "Recordatorio enviado",
        mensaje: `Se envió el recordatorio a ${correosInscritos.length} inscritos.`,
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

  return (
    <>
      <Head title={`Inscritos - ${curso.titulo}`} />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inscritos del curso</h1>
            <p className="text-sm text-slate-500 font-medium">
              {curso.titulo} | <span className="text-red-600 font-bold">
                {inscritos.length} {inscritos.length === 1 ? "inscrito" : "inscritos"}
              </span>
            </p>
          </div>

          <div className="flex w-full md:w-auto flex-col sm:flex-row gap-2">
            <Button onClick={descargarPdf} className="bg-[#034991] hover:bg-[#02376e] text-white">
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
            <Button onClick={abrirModalRecordatorio} className="bg-amber-500 hover:bg-amber-600 text-white">
              <Bell className="w-4 h-4 mr-2" />
              Enviar recordatorio
            </Button>
            <Button variant="outline" onClick={() => router.visit(route("cursos.index"))}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a gestión de cursos
            </Button>
          </div>
        </div>

        <div className="relative w-full md:w-96 mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={manejarCambioBusqueda}
            placeholder="Buscar por nombre, correo, ID o carrera..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <aside className="lg:col-span-4 xl:col-span-3 bg-gray-50/50 border border-gray-200 rounded-2xl p-8 flex flex-col items-center shadow-sm h-fit sticky top-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative p-4 bg-white rounded-full shadow-md mb-4 text-[#034991]">
                <GraduationCap className="w-12 h-12" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-3">{curso.titulo}</h3>

              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider mt-3">
                {displayValue(curso.modalidad?.nombre)}
              </span>
            </div>

            <div className="w-full space-y-4">
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Instructor a cargo</p>
                <p className="text-sm font-semibold text-slate-800">{displayValue(curso.nombreInstructor)}</p>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#034991]/70 tracking-tight">Fecha de inicio</p>
                    <p className="text-sm font-semibold text-slate-700">{displayValue(curso.fecha_inicio)}</p>
                  </div>

                  <div className="pt-2 border-t border-blue-100/50">
                    <p className="text-[10px] uppercase font-bold text-[#034991]/70 tracking-tight mb-1">Ocupación de cupos</p>
                    <div className="flex items-end justify-between">
                      <p className="text-sm font-semibold text-slate-800">
                        {inscritos.length} <span className="text-slate-400 font-normal">/ {curso.cupos || "∞"}</span>
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        curso.cupos && inscritos.length >= curso.cupos
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {curso.cupos && inscritos.length >= curso.cupos ? "Lleno" : "Disponible"}
                      </span>
                    </div>
                    {curso.cupos && (
                      <div className="w-full bg-blue-200/50 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-[#034991] h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((inscritos.length / curso.cupos) * 100, 100)}%` }}
                        ></div>
                      </div>
                    )}
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inscritosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-medium italic">
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
                      className="rounded-lg h-8 px-3 text-xs font-medium"
                      onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
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
                      className="rounded-lg h-8 px-3 text-xs font-medium"
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
                Se enviará a {correosInscritos.length} inscritos del curso.
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
                  className="bg-amber-500 hover:bg-amber-600 text-white"
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
