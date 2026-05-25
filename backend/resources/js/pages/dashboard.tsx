import PpLayout from "@/layouts/PpLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import {
  FileText,
  Briefcase,
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  ChevronRight,
  UserCircle,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  GraduationCap,
  PlusCircle
} from "lucide-react";

export default function Dashboard() {
  const { auth, userPermisos, userRol } = usePage().props as any;
  const user = auth.user ?? { name: "Usuario", fotoPerfil: null };
  const permisos = userPermisos ?? [];
  const rol = userRol ?? "Sin rol";
  const fechaActual = new Date();

  const mostrarMensajeEspecial =
  fechaActual.getDate() === 3 &&
  fechaActual.getMonth() === 5;

  /* ==========================================================
     CATEGORIZACIÓN DE MÓDULOS (DINÁMICO POR PERMISOS)
  ========================================================== */

  const modulosAdmin = [
    permisos.includes(12) && { title: "Gestión de Usuarios", desc: "Control de accesos y roles del sistema.", href: "/usuarios", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    permisos.includes(14) && { title: "Reportes Estadísticos", desc: "Métricas y éxito de empleabilidad.", href: "/reportes-egresados", icon: BarChart3, color: "text-slate-700", bg: "bg-slate-100" },
    permisos.includes(8) && { title: "Control de Cursos", desc: "Administración de la oferta académica.", href: "/cursos", icon: BookOpen, color: "text-emerald-700", bg: "bg-emerald-50" },
    permisos.includes(10) && { title: "Control de Eventos", desc: "Gestión de ferias y actos institucionales.", href: "/eventos", icon: Calendar, color: "text-amber-700", bg: "bg-amber-50" },
  ].filter(Boolean);

  const modulosEmpresa = [
    permisos.includes(5) && { title: "Mis Ofertas Laborales", desc: "Administre y edite sus vacantes publicadas.", href: "/empresa/ofertas", icon: Briefcase, color: "text-[#CD1719]", bg: "bg-red-50" },
    permisos.includes(5) && { title: "Publicar Nueva Oferta", desc: "Captación de talento y nuevos profesionales.", href: "/empresa/ofertas/crear", icon: PlusCircle, color: "text-green-700", bg: "bg-green-50" },
  ].filter(Boolean);

  const modulosEstudiante = [
    permisos.includes(2) && { title: "Generar Currículum", desc: "Cree su CV profesional con sello UNA.", href: "/curriculum/generar", icon: FileText, color: "text-[#034991]", bg: "bg-blue-50" },
    permisos.includes(6) && { title: "Bolsa de Empleo", desc: "Explore ofertas y postúlate a vacantes.", href: "/ofertas", icon: GraduationCap, color: "text-[#CD1719]", bg: "bg-red-50" },
    permisos.includes(9) && { title: "Inscripción de Cursos", desc: "Cursos de formación y actualización.", href: "/cursos/inscripcion", icon: BookOpen, color: "text-emerald-700", bg: "bg-emerald-50" },
    permisos.includes(11) && { title: "Actividades UNA", desc: "Talleres, charlas y eventos próximos.", href: "/eventos/inscripcion", icon: Calendar, color: "text-amber-700", bg: "bg-amber-50" },
  ].filter(Boolean);

  return (
    <>
      <Head title="Dashboard GradEm" />
      <meta name="description" content="Panel principal GradEm-UNA" />

      <div className="min-h-screen bg-[#f8fafc] w-full px-4 md:px-10 py-10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ASIDE: PERFIL (MÁS ROBUSTO) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm text-center">
              <div className="inline-flex p-1.5 rounded-full bg-slate-50 border border-slate-100 mb-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden">
  {user.fotoPerfil?.url ? (
    <img
      src={user.fotoPerfil.url}
      alt="Foto de perfil"
      className="w-full h-full object-cover"
    />
  ) : (
    <UserCircle size={64} className="text-slate-300" />
  )}
</div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight">{user.name}</h2>
              <div className="mt-4 inline-block px-6 py-1.5 bg-[#CD1719] text-white text-xs font-black rounded-full uppercase tracking-[0.2em]">
                {rol}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Sistema</span>
                  <span className="text-base font-black text-[#034991] italic">GradEm-UNA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Estado</span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black text-green-600 uppercase">En Línea</span>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN: CONTENIDO CON TIPOGRAFÍA MEJORADA */}
          <main className="lg:col-span-9 space-y-14">

            <header className="border-b-2 border-slate-200 pb-8 flex justify-between items-center">
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
                  <LayoutDashboard className={`
                      text-[#034991]
                      transition-all duration-500
                    `}
                    size={40}
                  />
                  Dashboard
                </h1>
                <p className="text-slate-500 font-bold text-lg uppercase tracking-tighter">Bienvenido al ecosistema de vinculación institucional</p>
                {mostrarMensajeEspecial && (
                  <div
                    className="
                      mt-4
                      inline-flex
                      items-center
                      gap-2
                      px-4 py-2
                      rounded-full
                      bg-gradient-to-r
                      from-[#034991]
                      to-[#0466C8]
                      text-white
                      text-sm
                      font-bold
                      shadow-lg
                      animate-pulse
                    "
                  >
                    🎊 "Gracias por formar parte de GradEm-SIUA!!" 🎉
                  </div>
                )}
              </div>
            </header>

            {/* SECCIÓN 1: ADMINISTRACIÓN */}
            {modulosAdmin.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-4 px-2">
                  <ShieldCheck className="text-indigo-600" size={24} />
                  <h3 className="text-sm font-black text-indigo-900 uppercase tracking-[0.4em]">Gestión de Plataforma</h3>
                  <div className="h-[2px] flex-1 bg-indigo-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {modulosAdmin.map((item: any, idx: number) => (
                    <DashboardCard key={idx} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* SECCIÓN 2: EMPRESA */}
            {modulosEmpresa.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-4 px-2">
                  <Building2 className="text-[#CD1719]" size={24} />
                  <h3 className="text-sm font-black text-red-900 uppercase tracking-[0.4em]">Portal Corporativo</h3>
                  <div className="h-[2px] flex-1 bg-red-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modulosEmpresa.map((item: any, idx: number) => (
                    <DashboardCard key={idx} item={item} isWide />
                  ))}
                </div>
              </section>
            )}

            {/* SECCIÓN 3: ESTUDIANTES */}
            {modulosEstudiante.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-4 px-2">
                  <GraduationCap className="text-[#034991]" size={24} />
                  <h3 className="text-sm font-black text-[#034991] uppercase tracking-[0.4em]">Servicios al Graduado</h3>
                  <div className="h-[2px] flex-1 bg-blue-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modulosEstudiante.map((item: any, idx: number) => (
                    <DashboardCard key={idx} item={item} isService />
                  ))}
                </div>
              </section>
            )}

          </main>
        </div>
      </div>
    </>
  );
}

/* ==========================================================
   TARJETA CON FUENTES OPTIMIZADAS
========================================================== */
const DashboardCard = ({ item, isService = false }: any) => (
  <Link
    href={item.href}
    aria-label={`${item.title}: ${item.desc}`}
    className={`
      group bg-white border-2 border-slate-100
      rounded-[2.5rem]
      transition-all duration-300
      hover:shadow-2xl
      hover:shadow-slate-200/60
      hover:border-[#034991]
      flex flex-col p-8 h-full

      hover:-translate-y-1
      hover:rotate-[0.2deg]
    `}
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-500`}>
        <item.icon size={32} strokeWidth={2.5} aria-hidden="true" />
      </div>
      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#CD1719] group-hover:text-white transition-all shadow-sm">
        <ChevronRight size={20} aria-hidden="true" />
      </div>
    </div>

    <div className="space-y-3">
      <h4 className="text-lg font-black text-slate-800 uppercase italic leading-tight group-hover:text-[#034991] transition-colors tracking-tight">
        {item.title}
      </h4>
      <p className="text-sm text-slate-500 font-bold leading-relaxed">
        {item.desc}
      </p>
    </div>

    {isService && (
      <div className="mt-6 pt-6 border-t border-slate-100 flex items-center">
        <span className="text-xs font-black text-[#034991]/50 group-hover:text-[#CD1719] uppercase tracking-[0.2em] transition-colors">
          Ingresar al servicio
        </span>
      </div>
    )}
  </Link>
);

Dashboard.layout = (page: any) => (
  <PpLayout userPermisos={page.props.userPermisos}>
    {page}
  </PpLayout>
);