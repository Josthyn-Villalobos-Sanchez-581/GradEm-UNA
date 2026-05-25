import { type BreadcrumbItem } from "@/types";
import { type ReactNode, useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { router } from "@inertiajs/react";
import SystemInfoModal from "@/components/SystemInfoModal";
import { useModal } from "@/hooks/useModal";
import { useMessages } from "@/hooks/useMessages";
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
  GraduationCap,
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

  const {
  toast,
  mostrarCreditos,
  setMostrarCreditos,
} = useMessages();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [loadingRuta, setLoadingRuta] = useState<string | null>(null);

  // Nuevo modal institucional
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Tooltip flotante
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const showTooltip = (text: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    setTooltip({
      text,
      x: rect.right + 8,
      y: rect.top + rect.height / 2,
    });
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

    router.post("/logout", {}, {
      onSuccess: () => router.visit("/login"),
      onError: () => {
        modal.alerta({
          titulo: "Error",
          mensaje: "No se pudo cerrar la sesión. Intente de nuevo.",
        });
      },
    });
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
        { title: "Administradores", route: "/usuarios", permisoId: 12 },
        { title: "Usuarios", route: "/usuarios/perfiles", permisoId: 12 },
        { title: "Empresas", route: "/empresas", permisoId: 12 },
        { title: "Catálogos", route: "/catalogo", permisoId: 13 },
        { title: "Auditoría", route: "/auditoria/bitacora", permisoId: 16 },
      ],
    },
    {
      title: "Currículum",
      icon: FileText,
      subMenu: [
        { title: "Mi Currículum", route: "/mi-curriculum/ver", permisoId: 4 },
        { title: "Generar Currículum", route: "/curriculum/generar", permisoId: 2 },
        { title: "Carga de Documentos", route: "/documentos", permisoId: 3 },
      ],
    },
    {
      title: "Ofertas",
      icon: Briefcase,
      subMenu: [
        { title: "Gestionar Ofertas", route: "/empresa/ofertas", permisoId: 7 },
        { title: "Postularme", route: "/ofertas", permisoId: 6 },
        { title: "Mis postulaciones", route: "/misPostulaciones", permisoId: 6 },
      ],
    },
    {
      title: "Cursos",
      icon: BookOpen,
      subMenu: [
        { title: "Gestión de Cursos", route: "/cursos", permisoId: 8 },
        { title: "Inscribirme", route: "/cursos/inscripcion", permisoId: 9 },
        { title: "Mis Cursos", route: "/cursos/mis-cursos", permisoId: 9 },
      ],
    },
    {
      title: "Eventos",
      icon: Calendar,
      subMenu: [
        { title: "Gestión de Eventos", route: "/eventos", permisoId: 10 },
        { title: "Inscribirse a Eventos", route: "/eventos/inscripcion", permisoId: 11 },
        { title: "Mis Eventos", route: "/eventos/inscripcion/mis-eventos", permisoId: 11 },
      ],
    },
    {
      title: "Reportes",
      icon: BarChart3,
      subMenu: [
        { title: "Egresados", route: "/reportes-egresados", permisoId: 14 },
        { title: "Ofertas y Postulaciones", route: "/reportes-ofertas", permisoId: 15 },
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

  useEffect(() => {
    const menuActivo = filteredMenu.find((item) =>
      item.subMenu?.some((s) => currentUrl.startsWith(s.route!))
    );

    if (menuActivo) {
      setOpenMenu(menuActivo.title);
    }
  }, [currentUrl]);

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
          bg-gradient-to-r 
          from-[#5C0A0D] 
          via-[#8E1215] 
          to-[#CD1719]
          shadow-md z-50 px-5 flex items-center justify-between
          border-b border-black/20 backdrop-blur-[2px]
        "
      >

        {/* Overlay real */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

        <button className="text-white md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Abrir menú">
          <Menu size={30} />
        </button>

        <div className="flex items-center gap-3 ml-1">
          <Link href="https://www.una.ac.cr/" target="_blank" className="flex items-center gap-3" aria-label="Visitar sitio de la Universidad Nacional">
            <img src={logoUnaUrl} className="h-14 translate-x-[-6px]" alt="Logo Universidad Nacional" />
          </Link>
          <img src={logoGradEmUrl} className="h-14" alt="Logo GradEm" />
        </div>

        <button
          onClick={openSystemInfo}
          className="
            hidden md:flex items-center gap-2 
            bg-white/10 text-white px-4 py-2 rounded-full text-sm 
            hover:bg-white/20 transition
          "
          aria-label="Información del sistema"
        >
          <Info size={16} />
          Acerca de
        </button>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`
    fixed top-20 left-0 h-[calc(100vh-5rem)]
    bg-gradient-to-b 
    from-[#4A0709] 
    via-[#8E1215] 
    to-[#CD1719]
    text-white border-r border-red-900
    shadow-[4px_0_25px_rgba(0,0,0,0.35)]
    backdrop-blur-[2px]
    bg-opacity-95
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
          aria-label="Colapsar menú"
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>


        {/* MENÚ */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 px-3 py-4 flex flex-col gap-1">
          {filteredMenu.map((item, index) => {

            let rutaActiva: string | null = null;

            if (item.subMenu) {
              const rutasOrdenadas = item.subMenu
                .map(s => s.route!)
                .sort((a, b) => b.length - a.length); // mayor longitud primero

              rutaActiva = rutasOrdenadas.find(r =>
                currentUrl === r || currentUrl.startsWith(r + "/")
              ) || null;
            }

            const Icon = item.icon ?? LayoutDashboard;

            const isSubActive = !!rutaActiva;

            const isActive =
              (item.route && currentUrl.startsWith(item.route)) || isSubActive;

            const isOpen = openMenu === item.title;

            return (
              <div key={item.title} className="relative group">
                {/* BOTÓN PRINCIPAL */}
                <button
                  onClick={() => {
                    if (sidebarCollapsed && item.subMenu) {
                      setSidebarCollapsed(false);
                      setOpenMenu(item.title);
                      return;
                    }

                    if (item.subMenu) {
                      setOpenMenu(isOpen ? null : item.title);
                    } else if (item.route) {
                      setOpenMenu(null); // 🔴 cerrar todo al navegar
                      router.visit(item.route);
                    }
                  }}
                  className={`
            flex items-center justify-between px-3 py-2 rounded-lg 
            transition-all text-[15px] font-medium

            ${isActive
                      ? `
                          bg-gradient-to-r from-[#CD1719] to-[#8E1215]
                          border-l-4 border-white
                          shadow-lg shadow-black/40
                          ring-1 ring-white/30
                        `
                      : isOpen
                        ? "bg-white/10"
                        : "hover:bg-white/10"
                    }
          `}
                  aria-label="Navegar"
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      size={20}
                      className={`
                transition-all duration-200
                ${isActive
                          ? "text-white scale-110 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
                          : "text-white/70 group-hover:text-white"
                        }
              `}
                    />
                    {renderAnimatedLabel(item.title, index)}
                  </span>

                  {item.subMenu && !sidebarCollapsed && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {/* SUBMENÚ */}
                {!sidebarCollapsed && item.subMenu && (
                  <div
                    className={`
              overflow-hidden ml-4 
              border-l-2 border-white/30 
              bg-gradient-to-b from-black/20 to-transparent
              transition-all duration-300 ease-in-out
              ${isOpen
                        ? "max-h-72 opacity-100 pl-4 py-2"
                        : "max-h-0 opacity-0 pl-0 py-0"
                      }
            `}
                  >
                    {item.subMenu.map((sub) => {
                      const isSubItemActive = sub.route === rutaActiva;

                      return (
                        <Link
                          key={sub.title}
                          href={sub.route!}
                          onClick={() => setOpenMenu(item.title)} // 🔴 mantiene abierto correcto
                          className={`
                    relative flex items-center text-sm px-3 py-2 rounded-md
                    transition-all duration-200 ease-in-out hover:translate-x-1

                    ${isSubItemActive
                              ? `
                        bg-gradient-to-r from-[#CD1719]/80 to-[#8E1215]/80
                        text-white font-semibold
                        shadow-inner shadow-black/40
                      `
                              : "text-gray-200 hover:bg-white/10"
                            }
                  `}
                          aria-label={`Navegar a ${sub.title}`}
                        >
                          {/* Indicador lateral */}
                          {isSubItemActive && (
                            <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-full shadow-lg"></span>
                          )}

                          <span>{sub.title}</span>

                          {/* Punto indicador */}
                          {isSubItemActive && (
                            <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                          )}
                        </Link>
                      );
                    })}
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
              onClick={() => router.visit("/perfil")}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg 
                transition-all text-[15px]
                ${isPerfilActive
                  ? "bg-white/15 border-l-4 border-[#034991]"
                  : "hover:bg-white/10"
                }
              `}
              aria-label="Mi Perfil"
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
              aria-label="Cerrar Sesión"
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

      {toast && (
        <div
          className="
            fixed top-6 left-1/2 -translate-x-1/2
            z-[9999]
            bg-[#034991]
            text-white
            px-5 py-2.5
            rounded-full
            shadow-2xl
            text-sm
            font-semibold
            animate-pulse
            pointer-events-none
          "
          aria-live="polite"
        >
          {toast}
        </div>
      )}

      {mostrarCreditos && (
        <div
          className="
            fixed inset-0 z-[9999]
            flex items-center justify-center
            bg-black/40 backdrop-blur-sm
          "
        >
          <div
            className="
              bg-white
              rounded-3xl
              shadow-2xl
              p-8
              max-w-lg
              w-full
              border border-slate-200
              text-center
              animate-fade-in
            "
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-5">
              <div className="flex justify-center mb-5">
                <div
                  className="
                    w-20 h-20 rounded-full
                    bg-[#034991]/10
                    flex items-center justify-center
                  "
                >
                  <GraduationCap
                    size={42}
                    className="text-[#034991]"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-black text-[#034991] uppercase italic">
                Sistema desarrollado por el equipo GradEm-SIUA
              </h2>
            </div>

            <p className="text-slate-600 leading-relaxed font-medium">
              Módulos de Registro de Usuarios, Carga de Documentos,
              Cursos, Eventos y Reportes de Ofertas y Postulaciones
              desarrollados por Gerald Huertas Rodríguez.
            </p>

            <button
              onClick={() => setMostrarCreditos(false)}
              className="
                mt-8
                px-6 py-2.5
                rounded-full
                bg-[#034991]
                text-white
                font-semibold
                hover:opacity-90
                transition
              "
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* TOOLTIP */}
      {tooltip && (
        <div
          className="
            fixed z-[9999] px-3 py-1.5 text-xs text-white 
            bg-black/80 backdrop-blur-md rounded-md shadow-xl 
            pointer-events-none transition-opacity duration-200
          "
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          {tooltip.text}
        </div>
      )}

      {/* ============================
          MODAL INSTITUCIONAL (NEW)
      ============================ */}
      <SystemInfoModal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />

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
                      <Link href={b.href} aria-label={`Ir a ${b.title}`}>
                        {b.title}
                      </Link>
                      <span className="text-gray-700">›</span>
                    </>
                  ) : (
                    <span className="font-medium text-gray-700" aria-label="Página actual">
                      {b.title}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          )}

          <div className="bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl p-6 overflow-x-hidden">
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
