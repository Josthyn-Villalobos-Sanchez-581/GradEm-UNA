// backend/resources/js/pages/Cursos/GestionInscritos.tsx
import React, { useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { route } from "ziggy-js";
import { ArrowLeft, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {GraduationCap} from "lucide-react";
import axios from "axios";
import { useModal } from "@/hooks/useModal";
import { Download, Loader2 } from "lucide-react";
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
  const [busqueda, setBusqueda] = useState("");
  const [descargandoPdf, setDescargandoPdf] = useState(false);
const modal = useModal();
const [eliminandoId, setEliminandoId] = useState<number | null>(null); 
  const [paginaActual, setPaginaActual] = useState(1);
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

  // Validación de entrada: Solo letras, números y espacios, máx 100 caracteres
  const manejarCambioBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorRaw = e.target.value;
    
    // Regex mejorado: Acepta letras (a-z), números, espacios, tildes (áéíóú) y ñ
    const valorValidado = valorRaw
      .replace(/[^a-zA-Z0-9 áéíóúÁÉÍÓÚñÑüÜ]/g, "")
      .slice(0, 100);
      
    setBusqueda(valorValidado);
    setPaginaActual(1); // Resetear a la página 1 cuando el usuario escribe
  };

  const displayValue = (value?: string | null) => {
    if (!value) return "NA";
    const trimmed = value.trim();
    return trimmed.length ? trimmed : "NA";
  };

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
      route("cursos.pdf", {
        idCurso: curso.id_curso,
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
        ? `Participantes_${curso.titulo}.pdf`
        : `Asistencia_${curso.titulo}.pdf`;

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

const confirmarEliminarInscrito = async (inscrito: Inscrito) => {
  const confirmado = await modal.confirmacion({
    titulo: "Eliminar inscripción",
    mensaje: `¿Deseas eliminar a ${inscrito.nombre_completo} del curso?`,
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
      route("cursos.inscritos.eliminar", {
        idCurso: curso.id_curso,
        idUsuario,
      })
    );

    modal.alerta({
      titulo: "Éxito",
      mensaje: "Participante eliminado correctamente.",
    });

    router.reload({
      only: ["inscritos"],
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
  className="w-full bg-[#034991] hover:bg-[#02386f]"
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
  className="w-full"
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

  return (
    <>
      <Head title={`Inscritos - ${curso.titulo}`} />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              className="flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 h-9 w-9 transition-all"
              onClick={() => router.visit(route("cursos.index"))}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inscritos del curso</h1>
                <p className="text-sm text-slate-500 font-medium">
                    {curso.titulo} • <span className="text-red-600 font-bold">
                        {inscritos.length} {inscritos.length === 1 ? "inscrito" : "inscritos"}
                    </span>
                </p>
            </div>
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
    className="bg-[#034991] hover:bg-[#02386f] rounded-xl"
  >
    <Download className="w-4 h-4 mr-2" />
    Descargar PDF
  </Button>

</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Columna de Información del Curso */}
          {/* SIDEBAR INFORMATIVO (Estilo Adaptado) */}
            <aside className="lg:col-span-4 xl:col-span-3 bg-gray-50/50 border border-gray-200 rounded-2xl p-8 flex flex-col items-center shadow-sm h-fit sticky top-8">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative p-4 bg-white rounded-full shadow-md mb-4 text-[#034991]">
                        {/* Icono representativo */}
                        <GraduationCap className="w-12 h-12" />
                    </div>
                    
                    {/* Título del curso dinámico */}
                    <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-3">
                        {curso.titulo}
                    </h3>
                    
                    {/* Badge de Modalidad */}
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider mt-3">
                        {displayValue(curso.modalidad?.nombre)}
                    </span>
                </div>

                <div className="w-full space-y-4">
                    {/* Caja de Información del Instructor */}
                    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Instructor a cargo</p>
                        <p className="text-sm font-semibold text-slate-800">
                            {displayValue(curso.nombreInstructor)}
                        </p>
                    </div>

                    {/* Caja de Fechas y Estado */}
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-[#034991]/70 tracking-tight">Fecha de Inicio</p>
                                <p className="text-sm font-semibold text-slate-700">{displayValue(curso.fecha_inicio)}</p>
                            </div>
                            
                            <div className="pt-2 border-t border-blue-100/50">
                                <p className="text-[10px] uppercase font-bold text-[#034991]/70 tracking-tight mb-1">Ocupación de Cupos</p>
                                <div className="flex items-end justify-between">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {inscritos.length} <span className="text-slate-400 font-normal">/ {curso.cupos || '∞'}</span>
                                    </p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        (curso.cupos && inscritos.length >= curso.cupos) 
                                        ? "bg-red-100 text-red-700" 
                                        : "bg-emerald-100 text-emerald-700"
                                    }`}>
                                        {curso.cupos && inscritos.length >= curso.cupos ? "Lleno" : "Disponible"}
                                    </span>
                                </div>
                                {/* Barra de progreso visual (opcional pero muy útil) */}
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

                    {/* Pequeña nota informativa inferior */}
                    <p className="text-[11px] text-slate-400 text-center italic px-2">
                        Mostrando la lista oficial de participantes inscritos hasta la fecha.
                    </p>
                </div>
            </aside>

          {/* Columna de Tabla de Inscritos */}
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
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-medium italic">
                          No se encontraron inscritos que coincidan con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      inscritosFiltrados.map((inscrito) => (
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
  className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
                        
                        {/* Controles de navegación */}
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="rounded-lg h-8 px-3 text-xs font-medium"
                                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))} 
                                /* Deshabilitado si es la primera página o si solo hay una página en total */
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
                                onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))} 
                                /* Deshabilitado si es la última página o si no hay más de 10 usuarios */
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
      </div>
    </>
  );
}

GestionInscritos.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};