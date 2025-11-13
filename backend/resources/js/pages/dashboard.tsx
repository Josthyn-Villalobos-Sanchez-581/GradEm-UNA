import React from "react";
import PpLayout from "@/layouts/PpLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";

import {
  FileText,
  Briefcase,
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  AlertCircle,
} from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
];

export default function Dashboard() {
  const page = usePage();

  const user = (page.props as any).auth.user ?? { name: "Usuario" };
  const permisos: number[] = (page.props as any).userPermisos ?? [];
  const rol: string = (page.props as any).userRol ?? "Sin rol";

  /* ===================== ACCIONES DEPENDIENDO DEL ROL ===================== */
  const acciones = [
    permisos.includes(2) && {
      title: "Generar CV",
      desc: "Diseña y descarga tu currículum de forma profesional.",
      href: "/curriculum/generar",
      icon: FileText,
    },
    permisos.includes(5) && {
      title: "Ofertas de empleo",
      desc: "Explora oportunidades laborales disponibles.",
      href: "/ofertas",
      icon: Briefcase,
    },
    permisos.includes(8) && {
      title: "Cursos y formación",
      desc: "Capacitación continua y talleres institucionales.",
      href: "/cursos",
      icon: BookOpen,
    },
    permisos.includes(10) && {
      title: "Eventos UNA",
      desc: "Actividades académicas y eventos especiales.",
      href: "/eventos",
      icon: Calendar,
    },
    permisos.includes(12) && {
      title: "Gestión de usuarios",
      desc: "Administración de perfiles, roles y accesos.",
      href: "/usuarios/perfiles",
      icon: Users,
    },
    permisos.includes(14) && {
      title: "Reportes institucionales",
      desc: "Indicadores y estadísticas del sistema.",
      href: "/reportes-egresados",
      icon: BarChart3,
    },
  ].filter(Boolean) as any[];

  return (
    <>
      <Head title="Dashboard" />

      <div className="max-w-7xl mx-auto p-6 pb-16 space-y-12">

        {/* ============================== BIENVENIDA ============================== */}
        <section className="bg-gradient-to-br from-white to-[#F4F6F9] rounded-2xl border shadow-sm p-10">
          <h1 className="text-4xl font-semibold text-[#1E2A38] leading-tight">
            Bienvenido(a), <span className="text-[#034991]">{user.name}</span>
          </h1>

          <p className="text-gray-600 mt-2 text-sm">
            Rol asignado:{" "}
            <span className="font-medium text-gray-900">{rol}</span>
          </p>

          <p className="mt-5 max-w-3xl text-gray-600 text-sm leading-relaxed">
            Este es tu panel principal del sistema <strong>GradEm-UNA</strong>.
            Desde aquí podrás acceder de forma rápida a los módulos esenciales,
            revisar novedades institucionales y consultar tus herramientas personalizadas.
          </p>
        </section>

        {/* ============================== AVISOS ============================== */}
        <section className="bg-white border shadow-sm rounded-xl p-6 flex gap-4 items-start">
          <div className="p-3 rounded-full bg-[#FFF0F0]">
            <AlertCircle size={26} className="text-[#CD1719]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#A6141C]">
              Noticias y avisos institucionales
            </h3>
            <p className="text-gray-600 text-sm mt-1 leading-relaxed">
              Aún no hay avisos recientes. Aquí aparecerán comunicados importantes,
              recordatorios, mantenimiento del sistema o noticias de la UNA.
            </p>
          </div>
        </section>

        {/* ========================== ACCIONES RÁPIDAS ========================== */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Accesos directos
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {acciones.map((item: any, idx: number) => (
              <Link
                key={idx}
                href={item.href}
                className="
                  group bg-white rounded-xl border shadow-sm p-6 
                  hover:shadow-lg hover:-translate-y-1 transition-all
                  flex items-start gap-4
                "
              >
                <div className="p-3 rounded-xl bg-[#F6F8FA] group-hover:bg-[#EEF2F6] transition">
                  <item.icon size={26} className="text-gray-700" />
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 group-hover:text-black">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {acciones.length === 0 && (
            <p className="text-gray-600 text-sm mt-4">
              Aún no tienes accesos rápidos asignados según tus permisos.
            </p>
          )}
        </section>

        {/* ============================= WIDGETS ESPECIALES ============================= */}
        {permisos.includes(14) && (
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Área de reportes
            </h2>

            <div className="bg-white border rounded-xl shadow-sm p-6">
              <p className="text-gray-600 text-sm">
                Accede al módulo de reportes para consultar estadísticas
                institucionales, gráficos comparativos y análisis de egresados.
              </p>

              <Link
                href="/reportes-egresados"
                className="inline-block mt-4 text-sm px-4 py-2 bg-[#034991] text-white rounded-lg hover:bg-[#02396F] transition"
              >
                Ir a reportes
              </Link>
            </div>
          </section>
        )}

      </div>
    </>
  );
}

/* ======================= LAYOUT DINÁMICO ======================= */
Dashboard.layout = (page: any) => {
  const userPermisos = page.props.userPermisos as number[];

  return (
    <PpLayout breadcrumbs={breadcrumbs} userPermisos={userPermisos}>
      {page}
    </PpLayout>
  );
};
