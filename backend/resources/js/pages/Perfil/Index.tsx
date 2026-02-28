import React, { useState } from "react";
import { Link, Head } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import IconoEdicion from "@/assets/IconoEdicion.png";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import EnlacesExternos from "./EnlacesExternos";
// Importación de iconos
import { 
  User, Mail, Phone, MapPin, Calendar, IdCard, 
  Briefcase, GraduationCap, Globe, Building2, 
  ChevronLeft, Edit, Trash2, FileText 
} from "lucide-react";

interface FotoPerfil { ruta_imagen: string }
interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  identificacion: string;
  telefono: string;
  fecha_nacimiento: string;
  genero: string;
  estado_empleo: string;
  estado_estudios: string;
  anio_graduacion: number | null;
  nivel_academico: string | null;
  tiempo_conseguir_empleo: number | null;
  area_laboral_id: number | null;
  id_canton: number | null;
  salario_promedio: string | null;
  tipo_empleo: string | null;
  id_universidad: number | null;
  id_carrera: number | null;
  fotoPerfil?: FotoPerfil | null;
}

interface Empresa {
  id_empresa: number;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  persona_contacto: string | null;
}

interface AreaLaboral { id: number; nombre: string }
interface Pais { id: number; nombre: string }
interface Provincia { id: number; nombre: string; id_pais: number }
interface Canton { id: number; nombre: string; id_provincia: number }
interface Universidad { id: number; nombre: string; sigla: string }
interface Carrera { id: number; nombre: string; id_universidad: number; area_conocimiento: string }
interface Plataforma { id_plataforma: number; tipo: string; url: string }

interface Props {
  usuario: Usuario;
  empresa?: Empresa | null;
  areaLaborales: AreaLaboral[];
  paises: Pais[];
  provincias: Provincia[];
  cantones: Canton[];
  universidades: Universidad[];
  carreras: Carrera[];
  userPermisos: number[];
  plataformas: Plataforma[];
  rolNombre: string;
}

export default function Index({
  usuario,
  empresa,
  areaLaborales,
  paises,
  provincias,
  cantones,
  universidades,
  carreras,
  plataformas,
  rolNombre,
}: Props) {
  const modal = useModal();
  const [activeTab, setActiveTab] = useState(
    rolNombre.toLowerCase() === "empresa" ? "empresa" : "datos"
  );

  const cantonActual = cantones.find(c => c.id === usuario.id_canton);
  const provinciaActual = cantonActual ? provincias.find(p => p.id === cantonActual.id_provincia) : null;
  const paisActual = provinciaActual ? paises.find(pa => pa.id === provinciaActual.id_pais) : null;
  const universidadActual = universidades.find(u => u.id === usuario.id_universidad);
  const carreraActual = carreras.find(c => c.id === usuario.id_carrera);
  const fotoPerfilUrl = usuario.fotoPerfil?.ruta_imagen || FotoXDefecto;

  const eliminarFotoPerfil = async () => {
    const confirm = await modal.confirmacion({
      titulo: "Confirmar eliminación",
      mensaje: "¿Está seguro que desea eliminar su foto de perfil?",
    });
    if (!confirm) return;

    Inertia.post("/perfil/foto/eliminar", {}, {
      onSuccess: () => modal.alerta({ titulo: "Éxito", mensaje: "Foto de perfil eliminada." }),
      onError: (errors: any) =>
        modal.alerta({ titulo: "Error", mensaje: errors.foto || "No se pudo eliminar la foto." }),
    });
  };

  const renderValor = (valor: any) =>
    valor ? <span className="text-black ml-1">{valor}</span> : <span className="text-gray-400 italic ml-1">N/A</span>;

  // Componente interno para mantener iconos y texto alineados
  const InfoItem = ({ icon: Icon, label, children }: { icon: any, label: string, children: React.ReactNode }) => (
    <div className="flex items-center justify-center gap-2 text-center break-all">
      <Icon className="w-4 h-4 text-[#034991] flex-shrink-0" />
      <p className="leading-tight">
        <span className="font-bold">{label}:</span> {children}
      </p>
    </div>
  );

  // -------------------------------------------------------
  // VISTA EMPRESA
  // -------------------------------------------------------
  if (rolNombre.toLowerCase() === "empresa") {
    const secciones = [
      { id: "empresa", label: "Información de la Empresa", icon: Building2 },
      { id: "responsable", label: "Usuario Responsable", icon: User },
      { id: "enlaces", label: "Enlaces Externos", icon: Globe },
    ];

    return (
      <>
        <Head title="Perfil de Empresa" />
        <div className="w-full max-w-screen-2xl mx-auto px-6 py-10 text-black">
          <div className="bg-white rounded-xl shadow-sm p-8">

            <header className="flex justify-between items-center border-b pb-3 mb-8">
              <h1 className="text-2xl font-bold text-[#034991] flex items-center gap-2">
                <Building2 className="w-6 h-6" /> Perfil de Empresa
              </h1>
              <div className="flex gap-3">
                <Button asChild variant="secondary"><Link href="/dashboard" className="flex items-center gap-1"><ChevronLeft className="w-4 h-4"/> Volver</Link></Button>
                <Button asChild variant="default"><Link href="/perfil/editar" className="flex items-center gap-1"><Edit className="w-4 h-4"/> Editar</Link></Button>
              </div>
            </header>

            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img src={fotoPerfilUrl} className="rounded-full w-36 h-36 object-cover shadow-md mb-3" />
                <Link
                  href="/perfil/foto"
                  title="Editar foto de perfil"
                  className="absolute -bottom-2 -right-2 flex items-center justify-center h-10 w-10 rounded-full bg-white border border-gray-300 shadow-md hover:scale-110 transition"
                >
                  <img src={IconoEdicion} alt="Editar" className="w-5 h-5" />
                </Link>
              </div>

              {usuario.fotoPerfil && (
                <button
                  onClick={eliminarFotoPerfil}
                  className="mt-4 font-heading text-[#034991] font-semibold hover:text-[#CD1719] transition flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Borrar Foto de Perfil
                </button>
              )}

              <p className="text-2xl font-bold mt-4 break-words break-all text-center">{rolNombre}: {empresa?.nombre}</p>
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4 flex-shrink-0" />
                <span>Usuario: {renderValor(usuario.nombre_completo)}</span>
              </div>
            </div>

            <div className="flex justify-center flex-wrap gap-3 border-b pb-4 mb-6">
              {secciones.map(tab => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "outline" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className="font-semibold text-black flex items-center gap-2"
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </Button>
              ))}
            </div>

            {activeTab === "empresa" && (
              <section>
                <h3 className="text-xl font-bold text-[#034991] mb-4 text-center">Información de la Empresa</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-black">
                  <InfoItem icon={Building2} label="Nombre de la empresa">{renderValor(empresa?.nombre)}</InfoItem>
                  <InfoItem icon={Mail} label="Correo">{renderValor(empresa?.correo)}</InfoItem>
                  <InfoItem icon={Phone} label="Teléfono">{renderValor(empresa?.telefono)}</InfoItem>
                  <InfoItem icon={MapPin} label="Ubicación">{renderValor(paisActual ? `${paisActual.nombre}, ${provinciaActual?.nombre}, ${cantonActual?.nombre}` : "N/A")}</InfoItem>
                  <InfoItem icon={User} label="Persona de contacto">{renderValor(empresa?.persona_contacto)}</InfoItem>
                </div>
              </section>
            )}

            {activeTab === "responsable" && (
              <section>
                <h3 className="text-xl font-bold text-[#034991] mb-4 text-center">Usuario Responsable</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-black">
                  <InfoItem icon={User} label="Nombre completo">{renderValor(usuario.nombre_completo)}</InfoItem>
                  <InfoItem icon={IdCard} label="Identificación">{renderValor(usuario.identificacion)}</InfoItem>
                </div>
              </section>
            )}

            {activeTab === "enlaces" && (
              <section>
                <h3 className="text-xl font-bold text-[#034991] mb-4 flex items-center justify-center gap-2"><Globe className="w-5 h-5"/> Enlaces Externos</h3>
                <EnlacesExternos enlaces={plataformas} usuario={usuario} rolNombre={rolNombre} soloLectura={false} />
              </section>
            )}
          </div>
        </div>
      </>
    );
  }

  // -------------------------------------------------------
  // VISTA ESTUDIANTE / EGRESADO / OTROS
  // -------------------------------------------------------
  const mostrarEnlaces = ["egresado", "estudiante", "empresa"].includes(rolNombre.toLowerCase());

  const tabs = [
    { id: "datos", label: "Datos Personales", icon: User },
    { id: "academicos", label: "Datos Académicos", icon: GraduationCap },
    ...(rolNombre.toLowerCase() === "egresado" || rolNombre.toLowerCase() === "estudiante"
      ? [{ id: "laborales", label: "Datos Laborales", icon: Briefcase }]
      : []),
    ...(mostrarEnlaces ? [{ id: "enlaces", label: "Enlaces Externos", icon: Globe }] : []),
  ];

  return (
    <>
      <Head title={`Perfil - ${usuario.nombre_completo}`} />
      <div className="w-full max-w-screen-2xl mx-auto px-6 py-10 text-black">
        <div className="bg-white rounded-xl shadow-sm p-8">

          <header className="flex justify-between items-center border-b pb-3 mb-8">
            <h1 className="text-2xl font-bold text-[#034991] flex items-center gap-2">
              <User className="w-6 h-6"/> Mi Perfil
            </h1>
            <div className="flex gap-3">
              <Button asChild variant="secondary"><Link href="/dashboard" className="flex items-center gap-1"><ChevronLeft className="w-4 h-4"/> Volver</Link></Button>
              <Button asChild variant="default"><Link href="/perfil/editar" className="flex items-center gap-1"><Edit className="w-4 h-4"/> Editar</Link></Button>
            </div>
          </header>

          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img src={fotoPerfilUrl} className="rounded-full w-36 h-36 object-cover shadow-md mb-3" />
              <Link
                href="/perfil/foto"
                title="Editar foto de perfil"
                className="absolute -bottom-2 -right-2 flex items-center justify-center h-10 w-10 rounded-full bg-white border border-gray-300 shadow-md hover:scale-110 transition"
              >
                <img src={IconoEdicion} alt="Editar" className="w-5 h-5" />
              </Link>
            </div>

            {usuario.fotoPerfil && (
              <button
                onClick={eliminarFotoPerfil}
                className="mt-4 font-heading text-[#034991] font-semibold hover:text-[#CD1719] transition flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Borrar Foto de Perfil
              </button>
            )}

            <p className="text-2xl font-bold mt-4 break-words break-all text-center">{rolNombre}: {usuario.nombre_completo}</p>
            <div className="flex flex-col items-center gap-1 text-gray-700 mt-2">
               <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-[#034991] flex-shrink-0"/> Carrera: {carreraActual?.nombre}</span>
               <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-[#034991] flex-shrink-0"/> Universidad: {universidadActual?.nombre}</span>
            </div>

            {["egresado", "estudiante"].includes(rolNombre?.toLowerCase() ?? "") && (
              <Button asChild variant="default" className="mt-3">
                <Link href="/mi-curriculum/ver" className="flex items-center gap-2"><FileText className="w-4 h-4"/> Ver Currículum</Link>
              </Button>
            )}
          </div>

          <div className="flex justify-center flex-wrap gap-3 border-b pb-4 mb-6">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "outline" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className="font-semibold text-black flex items-center gap-2"
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </Button>
            ))}
          </div>

          <div className="mt-6 space-y-10 text-black">
            {activeTab === "datos" && (
              <section>
                <h3 className="text-xl font-bold text-[#034991] mb-4 text-center">Datos Personales</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <InfoItem icon={User} label="Nombre completo">{renderValor(usuario.nombre_completo)}</InfoItem>
                  <InfoItem icon={IdCard} label="Identificación">{renderValor(usuario.identificacion)}</InfoItem>
                  <InfoItem icon={Mail} label="Correo">{renderValor(usuario.correo)}</InfoItem>
                  <InfoItem icon={Phone} label="Teléfono">{renderValor(usuario.telefono)}</InfoItem>
                  <InfoItem icon={Calendar} label="Fecha de nacimiento">{renderValor(usuario.fecha_nacimiento)}</InfoItem>
                  <InfoItem icon={User} label="Género">{renderValor(usuario.genero)}</InfoItem>
                  <InfoItem icon={MapPin} label="Ubicación">{renderValor(paisActual ? `${paisActual.nombre}, ${provinciaActual?.nombre}, ${cantonActual?.nombre}` : "N/A")}</InfoItem>
                </div>
              </section>
            )}

            {activeTab === "academicos" && (
              <section>
                <h3 className="text-xl font-bold text-[#034991] mb-4 text-center">Datos Académicos</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <InfoItem icon={Building2} label="Universidad">{renderValor(universidadActual?.nombre)}</InfoItem>
                  <InfoItem icon={GraduationCap} label="Carrera">{renderValor(carreraActual?.nombre)}</InfoItem>
                  {(rolNombre.toLowerCase() === "egresado" || rolNombre.toLowerCase() === "estudiante") && (
                    <>
                      <InfoItem icon={FileText} label="Estado de estudios">{renderValor(usuario.estado_estudios)}</InfoItem>
                      <InfoItem icon={IdCard} label="Nivel académico">{renderValor(usuario.nivel_academico)}</InfoItem>
                      <InfoItem icon={Calendar} label="Año de graduación">{renderValor(usuario.anio_graduacion)}</InfoItem>
                    </>
                  )}
                </div>
              </section>
            )}

            {(rolNombre.toLowerCase() === "egresado" || rolNombre.toLowerCase() === "estudiante") && activeTab === "laborales" && (
              <section>
                <h3 className="text-xl font-bold text-[#034991] mb-4 text-center">Datos Laborales</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <InfoItem icon={Briefcase} label="Estado de empleo">{renderValor(usuario.estado_empleo)}</InfoItem>
                  {usuario.estado_empleo?.toLowerCase() === "empleado" && (
                    <>
                      <InfoItem icon={Calendar} label="Tiempo para conseguir empleo (meses)">{renderValor(usuario.tiempo_conseguir_empleo)}</InfoItem>
                      <InfoItem icon={Building2} label="Área laboral">{renderValor(areaLaborales.find(a => a.id === usuario.area_laboral_id)?.nombre)}</InfoItem>
                      <InfoItem icon={FileText} label="Salario promedio">{renderValor(usuario.salario_promedio)}</InfoItem>
                      <InfoItem icon={Briefcase} label="Tipo de empleo">{renderValor(usuario.tipo_empleo)}</InfoItem>
                    </>
                  )}
                </div>
              </section>
            )}

            {mostrarEnlaces && activeTab === "enlaces" && (
              <section>
                <h3 className="text-xl font-bold text-[#034991] mb-4 flex items-center justify-center gap-2"><Globe className="w-5 h-5"/> Enlaces a Plataformas Externas</h3>
                <EnlacesExternos enlaces={plataformas} usuario={usuario} rolNombre={rolNombre} soloLectura={false} />
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

Index.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};