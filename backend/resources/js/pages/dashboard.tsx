import React from "react";
import PpLayout from "@/layouts/PpLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { 
  FileText, 
  Briefcase, 
  BookOpen, 
  Users, 
  Calendar, 
  BarChart3, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  Bookmark
} from "lucide-react";

/* =========================
   PALETA OFICIAL UNA
========================= */
const colorAzulUNA = "#034991";
const colorRojoUNA = "#CD1719";

export default function Dashboard() {
  const { auth, userPermisos, userRol } = usePage().props as any;
  const user = auth.user ?? { name: "Usuario" };
  const permisos = userPermisos ?? [];
  const rol = userRol ?? "Sin rol";

  const acciones = [
    permisos.includes(2) && { title: "GENERAR CV", desc: "Diseña tu currículum profesional con sello UNA.", href: "/curriculum/generar", icon: FileText, color: "text-[#034991]", bg: "bg-blue-50", borderColor: "hover:border-blue-200" },
    permisos.includes(5) && { title: "OFERTAS EMPLEO", desc: "Vinculación laboral directa para graduados.", href: "/ofertas", icon: Briefcase, color: "text-[#CD1719]", bg: "bg-red-50", borderColor: "hover:border-red-200" },
    permisos.includes(8) && { title: "FORMACIÓN", desc: "Cursos de actualización y educación continua.", href: "/cursos", icon: BookOpen, color: "text-emerald-700", bg: "bg-emerald-50", borderColor: "hover:border-emerald-200" },
    permisos.includes(10) && { title: "EVENTOS UNA", desc: "Encuentros, congresos y vida estudiantil.", href: "/eventos", icon: Calendar, color: "text-amber-700", bg: "bg-amber-50", borderColor: "hover:border-amber-200" },
    permisos.includes(12) && { title: "USUARIOS", desc: "Administración de accesos institucionales.", href: "/usuarios/perfiles", icon: Users, color: "text-indigo-700", bg: "bg-indigo-50", borderColor: "hover:border-indigo-200" },
    permisos.includes(14) && { title: "REPORTES", desc: "Estadísticas de empleabilidad y seguimiento.", href: "/reportes-egresados", icon: BarChart3, color: "text-slate-700", bg: "bg-slate-100", borderColor: "hover:border-slate-300" },
  ].filter(Boolean) as any[];

  return (
    <>
      <Head title="Dashboard Institucional" />

      <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 space-y-12">
        
        {/* ============================== BIENVENIDA (HERO PREMIUM) ============================== */}
        <section className="relative overflow-hidden bg-white border border-gray-100 rounded-[3rem] shadow-2xl shadow-blue-900/10 transition-all duration-500 hover:shadow-blue-900/20">
          {/* Franja de Identidad UNA */}
          <div className="absolute top-0 left-0 w-2 h-full bg-[#CD1719]" />
          
          {/* Decoración de Fondo (Gradiente Institucional) */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#034991]/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 p-8 md:p-14 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#034991]/10 text-[#034991] text-[11px] font-black tracking-[0.2em] uppercase">
                <Bookmark className="w-3.5 h-3.5 fill-[#034991]" /> Universidad Nacional de Costa Rica
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] italic tracking-tighter">
                PANEL <span className="text-[#034991] uppercase">ADMINISTRATIVO</span>
              </h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 bg-[#CD1719] text-white text-[11px] font-black rounded-xl tracking-widest uppercase shadow-lg shadow-red-500/20">
                  {rol}
                </span>
                <p className="text-gray-500 font-bold text-sm tracking-tight border-l border-gray-200 pl-3">
                  Sesión activa: <span className="text-slate-800 font-black uppercase">{user.name}</span>
                </p>
              </div>
            </div>

            {/* Resumen Rápido Estilo Glassmorphism */}
            <div className="bg-gray-50/50 backdrop-blur-sm border border-gray-100 p-6 rounded-[2rem] min-w-[240px] text-center md:text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Estado del Sistema</p>
                <div className="flex items-center gap-3 justify-center md:justify-end mb-4">
                  <span className="text-lg font-black text-[#034991] uppercase italic">GradEm-UNA</span>
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
                </div>
                <div className="h-px bg-gray-200 w-full mb-4" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">Sistema de Vinculación y Empleabilidad</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* ============================== ACCESOS RÁPIDOS ============================== */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4 px-2">
              <h2 className="text-xs font-black text-[#034991] uppercase tracking-[0.4em]">Servicios al Graduado</h2>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {acciones.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className={`group bg-white rounded-[2.5rem] border-2 border-transparent p-8 shadow-sm ${item.borderColor} hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-2 transition-all duration-300 flex flex-col gap-6 h-full`}
                >
                  <div className={`w-16 h-16 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 group-hover:shadow-inner transition-all duration-500`}>
                    <item.icon size={32} strokeWidth={2.5} />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-black text-slate-800 text-base tracking-tight italic uppercase group-hover:text-[#034991] transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-300 group-hover:text-[#CD1719] transition-colors duration-300 uppercase tracking-[0.2em]">Acceder ahora</span>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#CD1719] group-hover:text-white transition-all duration-300">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ============================== SIDEBAR INSTITUCIONAL ============================== */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 px-2">
              <h2 className="text-xs font-black text-[#CD1719] uppercase tracking-[0.4em]">Comunicación</h2>
            </div>

            {/* AVISOS CON ESTILO DE TARJETA UNA */}
            <div className="relative overflow-hidden bg-[#CD1719] rounded-[2.5rem] p-8 text-white shadow-xl shadow-red-900/20 group hover:rotate-1 transition-transform duration-500">
              <div className="relative z-10 space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <AlertCircle size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-black uppercase italic tracking-tighter">Avisos UNA</h3>
                <p className="text-xs text-red-100/80 font-medium leading-relaxed">
                  Manténgase informado sobre los procesos de graduación, ferias de empleo y actualizaciones del sistema GradEm-UNA.
                </p>
                <div className="h-px bg-white/20 w-full" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Sin notificaciones pendientes</p>
              </div>
              {/* Círculo decorativo */}
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </div>

            {/* WIDGET REPORTES (SI TIENE PERMISO) */}
            {permisos.includes(14) && (
              <div className="bg-[#034991] rounded-[2.5rem] p-9 text-white relative overflow-hidden group shadow-2xl shadow-blue-900/40">
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <BarChart3 className="text-blue-300 w-10 h-10 group-hover:scale-110 transition-transform duration-500" />
                    <Sparkles className="text-white/20 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tight">Estadísticas</h3>
                    <p className="text-xs text-blue-100/70 mt-2 font-medium leading-relaxed">Gestione indicadores clave sobre el éxito profesional de nuestra comunidad.</p>
                  </div>
                  <Link
                    href="/reportes-egresados"
                    style={{ backgroundColor: 'white', color: colorAzulUNA }}
                    className="flex items-center justify-center gap-3 w-full py-4 rounded-[1.2rem] font-black text-[11px] uppercase tracking-[0.15em] hover:bg-[#CD1719] hover:text-white transition-all duration-300 shadow-lg"
                  >
                    GENERAR REPORTES <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                {/* Patrón de líneas decorativo */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <div className="grid grid-cols-2 gap-2">
                        {[...Array(4)].map((_, i) => <div key={i} className="w-1 h-1 bg-white rounded-full" />)}
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

Dashboard.layout = (page: any) => (
  <PpLayout 
    userPermisos={page.props.userPermisos}
    breadcrumbs={[{ title: "Panel Principal", href: "/dashboard" }]}
  >
    {page}
  </PpLayout>
);