import React, { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import { Head, Link } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import EnlacesExternos from "@/pages/Perfil/EnlacesExternos"; // ✅ usa el mismo componente
import { Button } from "@/components/ui/button";
// backend/resources/js/pages/Usuarios/VerPerfil.tsx

interface FotoPerfil {
  ruta_imagen: string;
}

interface Curriculum {
  id_curriculum: number;
  ruta_archivo_pdf: string;
}

interface DocumentoAdjunto {
  id_documento: number;
  nombre_original: string;
  rutaPublica: string;
  fecha_subida: string;
}

interface Universidad {
  nombre: string;
}

interface Carrera {
  nombre: string;
}

interface Plataforma {
  id_plataforma: number;
  tipo: string;
  url: string;
}
interface Empresa {
  id_empresa?: number;
  nombre?: string;
  correo?: string;
  telefono?: string;
  persona_contacto?: string;
  id_pais?: number | null;
  id_provincia?: number | null;
  id_canton?: number | null;
}

interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  identificacion: string;
  telefono: string;
  fecha_nacimiento?: string;
  genero?: string;
  estado_empleo?: string;
  estado_estudios?: string;
  anio_graduacion?: number | null;
  nivel_academico?: string | null;
  tiempo_conseguir_empleo?: number | null;
  area_laboral_id?: number | null;
  areaLaboral?: AreaLaboral | null;
  salario_promedio?: string | null;
  tipo_empleo?: string | null;
  universidad?: Universidad | null;
  carrera?: Carrera | null;
  fotoPerfil?: FotoPerfil | null;
  curriculum?: Curriculum | null;
  tiene_adjuntos?: boolean; // Nuevo campo para indicar si tiene adjuntos
  rol?: { nombre_rol: string };
  empresa?: Empresa | null;
}

interface AreaLaboral {
  nombre_area: string;
}

interface Plataforma {
  id_plataforma: number;
  tipo: string;
  url: string;
}

interface Props {
  usuario: Usuario;
  plataformas: Plataforma[];
  userPermisos: number[];
}

/*export default function VerPerfil({ usuario, plataformas }: Props) {
  const [mostrarCV, setMostrarCV] = useState(false);

  const fotoPerfilUrl = usuario.fotoPerfil?.ruta_imagen || FotoXDefecto;

  plataformas?: Plataforma[];
  userPermisos: number[];
}
*/
export default function VerPerfil({ usuario, plataformas = [] }: Props) {
  const [mostrarCV, setMostrarCV] = useState(false);
  const modal = useModal();

  const [mostrarAdjuntos, setMostrarAdjuntos] = useState(false);
  const [cargandoAdjuntos, setCargandoAdjuntos] = useState(false);
  const [adjuntos, setAdjuntos] = useState<DocumentoAdjunto[]>([]);
  const [docSeleccionado, setDocSeleccionado] = useState<DocumentoAdjunto | null>(null);

  const fotoPerfilUrl = usuario.fotoPerfil?.ruta_imagen || FotoXDefecto;
  const renderValor = (valor: any) =>
    valor ? <span className="text-black">{valor}</span> : <span className="text-gray-400 italic">N/A</span>;

  // Asegurarse de que los adjuntos no se muestren automáticamente al entrar
  useEffect(() => {
    setMostrarAdjuntos(false);
    setAdjuntos([]);
    setDocSeleccionado(null);
  }, []);

  // Si el usuario tiene rol Empresa, mostrar diseño distinto
  if (usuario.rol?.nombre_rol?.toLowerCase() === "empresa") {
    return (
      <>
        <Head title="Perfil de Empresa" />
        <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6 text-black">
          <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-200">
            <h2 className="text-2xl font-bold text-[#034991]">Perfil de Empresa</h2>
            {/* Botón Volver */}
            <Button asChild variant="secondary">
              <Link href="/usuarios/perfiles">Volver</Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Columna izquierda - Foto */}
            <div className="flex flex-col items-center md:w-1/3">
              <div className="h-48 w-48 overflow-hidden rounded-lg border border-gray-300 shadow-sm mb-4">
                <img
                  src={fotoPerfilUrl}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Columna derecha - Datos */}
            <div className="flex-1">
              {/* Datos de la empresa */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-700">
                  Información de la Empresa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><strong>Nombre:</strong> {renderValor(usuario.empresa?.nombre)}</p>
                  <p><strong>Correo:</strong> {renderValor(usuario.empresa?.correo)}</p>
                  <p><strong>Teléfono:</strong> {renderValor(usuario.empresa?.telefono)}</p>
                  <p><strong>Persona de contacto:</strong> {renderValor(usuario.empresa?.persona_contacto)}</p>
                </div>
              </div>

              {/* Datos del usuario responsable */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-700">
                  Usuario responsable
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><strong>Nombre completo:</strong> {renderValor(usuario.nombre_completo)}</p>
                  <p><strong>Identificación:</strong> {renderValor(usuario.identificacion)}</p>
                </div>
              </div>

              {/* Enlaces externos */}
              <EnlacesExternos
                enlaces={plataformas || []}
                usuario={usuario}
                soloLectura={true} // 👈 modo lectura solo
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ✅ Caso general: egresados, estudiantes, etc.
  return (
    <>
      <Head title={`Perfil de ${usuario.nombre_completo}`} />

      <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-200">
          <h2 className="text-2xl font-bold text-[#034991]">Perfil del Usuario</h2>
            {/* Botón Volver */}
            <Button asChild variant="secondary">
              <Link href="/usuarios/perfiles">Volver</Link>
            </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Columna izquierda: Foto */}
          <div className="flex flex-col items-center md:w-1/3">
            <div className="h-48 w-48 overflow-hidden rounded-lg border border-gray-300 shadow-sm mb-4">
              <img src={fotoPerfilUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Columna derecha */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4 text-black">{usuario.nombre_completo}</h2>

            {/* Datos personales */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
              <h3 className="font-semibold mb-2 text-black">Datos personales</h3>
              <p><strong className="text-black">Correo:</strong> {renderValor(usuario.correo)}</p>
              <p><strong className="text-black">Teléfono:</strong> {renderValor(usuario.telefono)}</p>
              <p><strong className="text-black">Identificación:</strong> {renderValor(usuario.identificacion)}</p>
              <p><strong className="text-black">Fecha de Nacimiento:</strong> {renderValor(usuario.fecha_nacimiento)}</p>
              <p><strong className="text-black">Género:</strong> {renderValor(usuario.genero)}</p>
            </div>

            {/* Datos académicos */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
              <h3 className="font-semibold mb-2 text-black">Datos académicos</h3>
              <p><strong className="text-black">Estado de estudios:</strong> {renderValor(usuario.estado_estudios)}</p>
              <p><strong className="text-black">Nivel académico:</strong> {renderValor(usuario.nivel_academico)}</p>
              <p><strong className="text-black">Año de graduación:</strong> {renderValor(usuario.anio_graduacion)}</p>
              <p><strong className="text-black">Universidad:</strong> {renderValor(usuario.universidad?.nombre)}</p>
              <p><strong className="text-black">Carrera:</strong> {renderValor(usuario.carrera?.nombre)}</p>
            </div>

            {/* Datos laborales */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
              <h3 className="font-semibold mb-2 text-black">Datos laborales</h3>
              <p><strong className="text-black">Estado de empleo:</strong> {renderValor(usuario.estado_empleo)}</p>
              {usuario.estado_empleo?.toLowerCase() === "empleado" && (
                <>
                  <p><strong className="text-black">Tiempo para conseguir empleo:</strong> {renderValor(usuario.tiempo_conseguir_empleo)}</p>
                  <p><strong className="text-black">Área laboral:</strong> {renderValor(usuario.areaLaboral?.nombre_area)}</p>
                  <p><strong className="text-black">Salario promedio:</strong> {renderValor(usuario.salario_promedio)}</p>
                  <p><strong className="text-black">Tipo de empleo:</strong> {renderValor(usuario.tipo_empleo)}</p>
                </>
              )}
            </div>

            {/* Contenedor de botones Currículum + Documentos Adjuntos */}
            <div className="mt-4 flex justify-start items-center space-x-3">
              {/* Botón: Ver/Ocultar Currículum */}
              {usuario.curriculum?.ruta_archivo_pdf && (
                <Button
                  onClick={() => setMostrarCV(!mostrarCV)}
                  variant="default"
                  className="min-w-[200px]"
                >
                  {mostrarCV ? "Ocultar Currículum" : "Ver Currículum"}
                </Button>
              )}

              {/* Botón: Ver/Ocultar Documentos Adjuntos */}
              {usuario.tiene_adjuntos && (
                <Button
                  onClick={async () => {
                    if (mostrarAdjuntos) {
                      // Si ya se muestran, ocultarlos
                      setMostrarAdjuntos(false);
                      setAdjuntos([]);
                      setDocSeleccionado(null);
                      return;
                    }

                    // Mostrar y cargar adjuntos
                    setMostrarAdjuntos(true);
                    setCargandoAdjuntos(true);
                    try {
                      const resp = await fetch(`/usuarios/${usuario.id_usuario}/adjuntos`);
                      if (!resp.ok) throw new Error("No se pudieron cargar los adjuntos");
                      const data = await resp.json();
                      setAdjuntos(data);
                      if (data.length > 0) setDocSeleccionado(data[0]);
                    } catch (err) {
                      await modal.alerta({
                        titulo: "Error",
                        mensaje: "No se pudieron cargar los archivos adjuntos.",
                      });
                    } finally {
                      setCargandoAdjuntos(false);
                    }
                  }}
                  variant="default"
                  className="min-w-[220px]"
                >
                  {mostrarAdjuntos
                    ? "Ocultar Documentos Adjuntos"
                    : cargandoAdjuntos
                    ? "Cargando..."
                    : "Ver Documentos Adjuntos"}
                </Button>
              )}
            </div>

            {/* Vista del Currículum */}
            {mostrarCV && (
              <div className="mt-3 border rounded-lg shadow overflow-hidden">
                <embed
                  src={usuario.curriculum?.ruta_archivo_pdf}
                  type="application/pdf"
                  className="w-full h-[600px]"
                />
              </div>
            )}

            {/* Vista de Documentos Adjuntos */}
            {mostrarAdjuntos && (
              <div className="mt-6">
                {cargandoAdjuntos ? (
                  <p className="text-center text-gray-500 italic">Cargando adjuntos...</p>
                ) : adjuntos.length === 0 ? (
                  <p className="text-center text-gray-500 italic">
                    No se encontraron documentos adjuntos.
                  </p>
                ) : (
                  <>
                    {/* Lista de documentos */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {adjuntos.map((doc) => (
                        <div
                          key={doc.id_documento}
                          className={`border rounded-lg p-4 cursor-pointer hover:shadow transition ${
                            docSeleccionado?.id_documento === doc.id_documento
                              ? "border-blue-700 bg-blue-50"
                              : "border-gray-200"
                          }`}
                          onClick={() => setDocSeleccionado(doc)}
                        >
                          <p className="font-semibold text-lg text-gray-800">
                            📄 {doc.nombre_original}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Vista previa */}
                    {docSeleccionado && (
                      <div className="mt-6">
                        <h3
                          className="text-lg font-semibold mb-3 text-center"
                          style={{ color: "#034991" }}
                        >
                          Visualizando: {docSeleccionado.nombre_original}
                        </h3>
                        <div className="flex justify-center">
                          <embed
                            src={docSeleccionado.rutaPublica}
                            type="application/pdf"
                            className="w-full h-[70vh] border rounded-lg shadow-lg"
                            style={{ borderColor: "#A7A7A9" }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}


            {/* 🔗 Enlaces a plataformas externas */}
            <div className="mt-6">
              <EnlacesExternos
                enlaces={plataformas || []}
                usuario={usuario}
                soloLectura={true} // 👈 modo lectura solo
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
// ✅ Layout principal
VerPerfil.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
