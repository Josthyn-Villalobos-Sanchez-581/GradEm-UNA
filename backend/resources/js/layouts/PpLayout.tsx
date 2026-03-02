

import { type BreadcrumbItem } from "@/types";
import { type ReactNode, useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { useModal } from "@/hooks/useModal";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  LayoutDashboard,
  Settings,
  FileText,
  Briefcase,
  BookOpen,
  Calendar,
  BarChart3,
  LogOut,
  User,
  Info,
  X
} from "lucide-react";

interface PpLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  userPermisos: number[];
}

interface MenuItem {
  title: string;
  permisoId?: number;
  route?: string;
  icon?: React.ElementType;
  subMenu?: MenuItem[];
}

export default function PpLayout({
  children,
  breadcrumbs,
  userPermisos,
}: PpLayoutProps) {
  const modal = useModal();
  const currentUrl = usePage().url;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Nuevo modal institucional
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Tooltip flotante
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const showTooltip = (text: string, e: React.MouseEvent) => {
    setTooltip({ text, x: e.clientX + 12, y: e.clientY + 12 });
  };

  const moveTooltip = (e: React.MouseEvent) => {
    if (tooltip) setTooltip({ ...tooltip, x: e.clientX + 12, y: e.clientY + 12 });
  };

  const hideTooltip = () => setTooltip(null);

  // Inicialización Axios
  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
  }, []);

  // Estado para saber cuándo el sidebar ya terminó de expandirse
  const [sidebarReadyForText, setSidebarReadyForText] = useState(!sidebarCollapsed);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (!sidebarCollapsed) {
      // Esperamos a que termine la animación de width/transform (~500ms)
      timeoutId = window.setTimeout(() => {
        setSidebarReadyForText(true);
      }, 10);
    } else {
      // Si se colapsa, escondemos el texto de inmediato
      setSidebarReadyForText(false);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [sidebarCollapsed]);

  const toggleSidebarCollapse = () => {
    const v = !sidebarCollapsed;
    setSidebarCollapsed(v);
    localStorage.setItem("sidebarCollapsed", String(v));
  };

  const logoUnaUrl = new URL("../assets/logoUNATopBar.png", import.meta.url).href;
  const logoGradEmUrl = new URL("../assets/LogoGradEmUNABlanco.png", import.meta.url).href;

  // LOGOUT con confirmación
  const handleLogout = async () => {
    const confirmar = await modal.confirmacion({
      titulo: "Cerrar sesión",
      mensaje: "¿Está seguro de que desea cerrar sesión?",
    });

    if (!confirmar) return;

    try {
      const csrf = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");

      const r = await axios.post(
        "/logout",
        {},
        { headers: { "X-CSRF-TOKEN": csrf || "" }, withCredentials: true }
      );

      if (r.data.redirect) window.location.href = r.data.redirect;
    } catch (err) {
      modal.alerta({
        titulo: "Error",
        mensaje: "No se pudo cerrar la sesión. Intente de nuevo.",
      });
    }
  };

  // Abrir modal institucional
  const openSystemInfo = () => setShowInfoModal(true);

  // ---------------- MENÚ BASE ----------------
  const menuBase: MenuItem[] = [
    { title: "Dashboard", route: "/dashboard", permisoId: 1, icon: LayoutDashboard },
    {
      title: "Administración",
      icon: Settings,
      subMenu: [
        { title: "Roles y Permisos", route: "/roles_permisos", permisoId: 12 },
        { title: "Gestión ADS", route: "/usuarios", permisoId: 12 },
        { title: "Ver Usuarios", route: "/usuarios/perfiles", permisoId: 12 },
        { title: "Catálogos", route: "/catalogo", permisoId: 13 },
        { title: "Auditoría", route: "/auditoria", permisoId: 16 },
      ],
    },
    {
      title: "Currículum",
      icon: FileText,
      subMenu: [
        { title: "Generar CV", route: "/curriculum/generar", permisoId: 2 },
        { title: "Carga de Documentos", route: "/documentos", permisoId: 3 },
        { title: "Mi Currículum", route: "/mi-curriculum/ver", permisoId: 4 },
      ],
    },
    {
      title: "Ofertas",
      icon: Briefcase,
      subMenu: [
        { title: "Publicar Oferta", route: "/empresa/ofertas/crear", permisoId: 5 },
        { title: "Postularme", route: "/ofertas", permisoId: 6 },
        { title: "Mis postulaciones", route: "/misPostulaciones", permisoId: 6 },
        { title: "Gestionar Ofertas", route: "/empresa/ofertas", permisoId: 7 },
      ],
    },
    {
      title: "Cursos",
      icon: BookOpen,
      subMenu: [
        { title: "Gestión", route: "/cursos", permisoId: 8 },
        { title: "Inscripción", route: "/inscripcion-cursos", permisoId: 9 },
      ],
    },
    {
      title: "Eventos",
      icon: Calendar,
      subMenu: [
        { title: "Gestión", route: "/eventos", permisoId: 10 },
        { title: "Confirmar Asistencia", route: "/confirmar-asistencia", permisoId: 11 },
      ],
    },
    {
      title: "Reportes",
      icon: BarChart3,
      subMenu: [
        { title: "Egresados", route: "/reportes-egresados", permisoId: 14 },
        { title: "Ofertas/Postulaciones", route: "/reportes-ofertas", permisoId: 15 },
      ],
    },
  ];

  const filteredMenu = menuBase
    .map((m) => {
      if (m.subMenu) {
        const sub = m.subMenu.filter((s) => userPermisos.includes(s.permisoId!));
        return sub.length ? { ...m, subMenu: sub } : null;
      }
      return userPermisos.includes(m.permisoId!) ? m : null;
    })
    .filter(Boolean) as MenuItem[];

  const isPerfilActive = currentUrl.startsWith("/perfil");

  // ============================
  //   ANIMACIÓN LETRA POR LETRA
  // ============================
  const renderAnimatedLabel = (text: string, menuIndex: number) => {
    if (sidebarCollapsed) return null;

    // Base de delay por opción de menú (para que vayan una tras otra)
    const baseDelay = menuIndex * 80; // ms

    return (
      <span className="inline-flex menu-text">
        {text.split("").map((char, i) => {
          const delay = baseDelay + i * 25; // ms por letra

          return (
            <span
              key={`${text}-${i}`}
              className="menu-text-char"
              style={{
                display: "inline-block",
                opacity: sidebarReadyForText ? 1 : 0,
                transform: sidebarReadyForText ? "translateY(0)" : "translateY(4px)",
                transition: `opacity 0.22s ease-out ${delay}ms, transform 0.22s ease-out ${delay}ms`,
                whiteSpace: "pre", // respeta espacios
              }}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  // ======================================================
  // RENDER PRINCIPAL
  // ======================================================

  return (
    <div className="flex h-screen bg-gray-100 overflow-x-hidden">
      {/* TOPBAR */}
      <header
        className="
          fixed top-0 left-0 w-full h-20 
          bg-gradient-to-r from-[#CD1719] via-[#B01517] to-[#7A0F13]
          shadow-md z-50 px-5 flex items-center justify-between
        "
      >
        <button className="text-white md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={30} />
        </button>

        <div className="flex items-center gap-3 ml-1">
          <Link href="https://www.una.ac.cr">
            <img src={logoUnaUrl} className="h-14 translate-x-[-6px]" />
          </Link>
          <img src={logoGradEmUrl} className="h-14" />
        </div>

        <button
          onClick={openSystemInfo}
          className="
            hidden md:flex items-center gap-2 
            bg-white/10 text-white px-4 py-2 rounded-full text-sm 
            hover:bg-white/20 transition
          "
        >
          <Info size={16} />
          Acerca de
        </button>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`
    fixed top-20 left-0 h-[calc(100vh-5rem)]
    bg-gradient-to-b from-[#CD1719] via-[#B01517] to-[#7A0F13]
    text-white border-r border-red-900 shadow-xl
    transition-all duration-300 z-40 flex flex-col justify-between
    ${sidebarCollapsed ? "w-18" : "w-48"}
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `}
      >
       {/* Botón colapso */}
<button
  onClick={toggleSidebarCollapse}
  className="
    hidden md:flex absolute top-1/2 -translate-y-1/2
    bg-[#B3151A] hover:bg-[#9e1317]
    text-white shadow-lg w-10 h-10 rounded-full
    justify-center items-center transition
    border-1 border-[#f3f4f6]
    z-[9999]
  "
  style={{ right: "-20px" }}
>
  {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
</button>


        {/* MENÚ */}
        <nav className="flex-1 overflow-y-visible px-3 py-4 flex flex-col gap-1">
          {filteredMenu.map((item, index) => {
            const Icon = item.icon ?? LayoutDashboard;
            const isActive =
              (item.route && currentUrl.startsWith(item.route)) ||
              item.subMenu?.some((s) => currentUrl.startsWith(s.route!));

            return (
              <div
                key={item.title}
                className="relative group"
                onMouseEnter={(e) => sidebarCollapsed && showTooltip(item.title, e)}
                onMouseMove={moveTooltip}
                onMouseLeave={hideTooltip}
              >
                <button
                  onClick={() => {
                    if (sidebarCollapsed && item.subMenu) {
                      setSidebarCollapsed(false);
                      setOpenMenu(item.title);
                      return;
                    }
                    item.subMenu
                      ? setOpenMenu(openMenu === item.title ? null : item.title)
                      : item.route && (window.location.href = item.route);
                  }}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg 
                    transition-all text-[15px] font-medium
                    ${isActive
                      ? "bg-white/15 border-l-4 border-[#034991]"
                      : "hover:bg-white/10"
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      size={20}
                      className="transition-transform duration-200 group-hover:scale-110"
                    />
                    {/* Texto animado SOLO para el menú principal */}
                    {renderAnimatedLabel(item.title, index)}
                  </span>
                  {item.subMenu && !sidebarCollapsed && (
                    <ChevronDown
                      size={16}
                      className={`
                        transition-transform 
                        ${openMenu === item.title ? "rotate-180" : ""}
                      `}
                    />
                  )}
                </button>

                {/* SUBMENÚ (sin animación letra por letra) */}
                {!sidebarCollapsed && item.subMenu && (
                  <div
                    className={`
                      overflow-hidden ml-6 border-l border-white/10 
                      transition-all duration-300
                      ${openMenu === item.title
                        ? "max-h-72 opacity-100 pl-3 py-1"
                        : "max-h-0 opacity-0 pl-0 py-0"
                      }
                    `}
                  >
                    {item.subMenu.map((sub) => (
                      <Link
                        key={sub.title}
                        href={sub.route!}
                        className={`
                          block text-sm px-3 py-1 rounded transition-all duration-200 hover:translate-x-1
                          ${currentUrl.startsWith(sub.route!)
                            ? "bg-white/10 text-white"
                            : "text-gray-100 hover:bg-white/5"
                          }
                        `}
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* FOOTER SIDEBAR */}
        <div className="border-t border-white/20 px-3 py-3 flex flex-col gap-2">
          {/* PERFIL */}
          <div
            className="relative group"
            onMouseEnter={(e) => sidebarCollapsed && showTooltip("Mi Perfil", e)}
            onMouseMove={moveTooltip}
            onMouseLeave={hideTooltip}
          >
            <button
              onClick={() => (window.location.href = "/perfil")}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg 
                transition-all text-[15px]
                ${isPerfilActive
                  ? "bg-white/15 border-l-4 border-[#034991]"
                  : "hover:bg-white/10"
                }
              `}
            >
              <User
                size={18}
                className="transition-all group-hover:scale-110"
              />
              {renderAnimatedLabel("Mi Perfil", filteredMenu.length)}
            </button>
          </div>

          {/* LOGOUT */}
          <div
            className="relative group"
            onMouseEnter={(e) => sidebarCollapsed && showTooltip("Cerrar Sesión", e)}
            onMouseMove={moveTooltip}
            onMouseLeave={hideTooltip}
          >
            <button
              onClick={handleLogout}
              className="
                flex items-center gap-2 px-3 py-2 rounded-lg 
                hover:bg-white/10 transition text-[15px]
              "
            >
              <LogOut
                size={18}
                className="transition-all group-hover:scale-110"
              />
              {renderAnimatedLabel(
                "Cerrar Sesión",
                filteredMenu.length + 1
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* OVERLAY MÓVIL */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* TOOLTIP */}
      {tooltip && (
        <div
          className="
            fixed z-[9999] px-2 py-1 text-xs text-white 
            bg-black/90 backdrop-blur-sm rounded-md shadow-lg 
            pointer-events-none
          "
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          {tooltip.text}
        </div>
      )}

      {/* ============================
          MODAL INSTITUCIONAL (NEW)
      ============================ */}
      {showInfoModal && (
        <>
          {/* OVERLAY – Cierre al hacer clic afuera */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={() => setShowInfoModal(false)}
          />

          {/* CONTENEDOR */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 pointer-events-none">
            {/* MODAL */}
            <div
              className="
                pointer-events-auto
                w-full max-w-3xl
                max-h-[85vh]
                rounded-xl shadow-2xl overflow-hidden
                bg-white border border-gray-200
                animate-scale-in
              "
            >
              {/* HEADER INSTITUCIONAL */}
              <div
                className="
                  bg-gradient-to-r 
                  from-[#CD1719] via-[#B01517] to-[#7A0F13]
                  text-white px-6 py-4
                  flex items-center justify-between
                  shadow-md
                "
              >
                <h2 className="text-lg font-bold tracking-wide">
                  Información del Sistema
                </h2>

                <button
                  onClick={() => setShowInfoModal(false)}
                  className="text-white/80 hover:text-white transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* CONTENIDO CON SCROLL */}
              <div
                className="
                  px-7 py-6 overflow-y-auto max-h-[70vh] space-y-7 
                  scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
                "
              >
                {/* SECCIÓN */}
                <section>
                  <h3 className="text-[#034991] font-semibold text-lg flex items-center gap-2">
                    📌 Datos Generales
                  </h3>
                  <div className="mt-2 text-gray-700 leading-relaxed">
                    <p><strong>Versión:</strong> 1.0.0</p>
                    <p><strong>Última actualización:</strong> Noviembre 2025</p>
                    <p><strong>Institución:</strong> Universidad Nacional de Costa Rica (UNA)</p>
                    <p><strong>Facultad:</strong> Escuela de Informática — Proyecto SIUA</p>
                  </div>
                </section>

                <hr className="border-gray-200" />

                {/* SECCIÓN */}
                <section>
                  <h3 className="text-[#034991] font-semibold text-lg">
                    👥 Equipo de Desarrollo
                  </h3>
                  <ul className="mt-3 space-y-1 text-gray-700 list-disc list-inside">
                    <li><strong>Jairo Valverde Ramírez</strong> — Full Stack + UX/UI</li>
                    <li><strong>Gerald Huertas Rodríguez</strong> — Full Stack + UX/UI</li>
                    <li><strong>Kevin Beita Marin</strong> — Full Stack + UX/UI</li>
                    <li><strong>Froylan Rivera Salas</strong> — Full Stack + UX/UI</li>
                    <li><strong>Josthyn Villalobos Sanchez</strong> — Full Stack + UX/UI</li>
                  </ul>
                </section>

                <hr className="border-gray-200" />

                {/* SECCIÓN */}
                <section>
                  <h3 className="text-[#034991] font-semibold text-lg">
                    💡 Propósito del Sistema
                  </h3>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    GradEm-UNA es una plataforma para conectar estudiantes, egresados, empresas e instituciones,
                    centralizando la gestión de currículums, cursos, ofertas laborales, eventos y análisis estadístico.
                  </p>
                </section>

                <hr className="border-gray-200" />

                {/* SECCIÓN */}
                <section>
                  <h3 className="text-[#034991] font-semibold text-lg">
                    🛠️ Tecnologías Principales
                  </h3>
                  <ul className="mt-3 text-gray-700 list-disc list-inside space-y-1">
                    <li>React + TypeScript + Inertia.js</li>
                    <li>Laravel 12 (PHP 8.2)</li>
                    <li>MySQL</li>
                    <li>TailwindCSS + Lucide Icons</li>
                    <li>DomPDF</li>
                    <li>Arquitectura modular SIUA</li>
                  </ul>
                </section>

                <hr className="border-gray-200" />

                {/* SECCIÓN */}
                <section>
                  <h3 className="text-[#034991] font-semibold text-lg">
                    🔐 Características Clave
                  </h3>
                  <ul className="mt-3 text-gray-700 list-disc list-inside space-y-1">
                    <li>Control dinámico de roles y permisos</li>
                    <li>Gestión de ofertas, cursos y eventos</li>
                    <li>Generador profesional de CV</li>
                    <li>Panel institucional con estadísticas</li>
                    <li>Auditoría interna de acciones</li>
                  </ul>
                </section>

                <hr className="border-gray-200" />

                {/* SECCIÓN */}
                <section>
                  <h3 className="text-[#034991] font-semibold text-lg">
                    📞 Contacto
                  </h3>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    <strong>Correo:</strong> gradem@una.ac.cr<br />
                    <strong>Sede:</strong> Sede Interuniversitaria de Alajuela (SIUA)
                  </p>
                </section>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CONTENIDO */}
      <main
        className={`
    relative
    flex-1 p-6 mt-20 overflow-y-auto
    transition-[margin] duration-500 ease-in-out
    ${sidebarCollapsed ? "md:ml-18" : "md:ml-48"}
  `}
      >
        <div className="w-full max-w-full overflow-x-hidden">
          {breadcrumbs && (
            <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1">
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i < breadcrumbs.length - 1 ? (
                    <>
                      <Link href={b.href}>{b.title}</Link>
                      <span className="text-gray-400">›</span>
                    </>
                  ) : (
                    <span className="font-medium text-gray-700">{b.title}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          <div className="bg-white shadow-lg rounded-xl p-6 overflow-x-hidden">
            {children}
          </div>

          <footer className="text-center text-gray-500 mt-6 text-xs">
            Sistema GradEm © 2025 - Universidad Nacional
          </footer>
        </div>
      </main>
    </div>
  );
}
