import { type BreadcrumbItem } from '@/types';
import { type ReactNode, useState } from 'react';
import { Link } from '@inertiajs/react';

interface TopbarLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  userPermisos: number[];
}

interface MenuItem {
  title: string;
  permisoId?: number;
  route?: string;
  subMenu?: MenuItem[];
}

export default function TopbarLayout({ children, breadcrumbs, userPermisos }: TopbarLayoutProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const toggleMenu = (menu: string) => setOpenMenu(openMenu === menu ? null : menu);

  const menu: MenuItem[] = [
    { title: 'Dashboard', route: '/dashboard', permisoId: 1 },
    {
      title: 'Administración',
      subMenu: [
        // Redirige al index general de Roles y Permisos
        { title: 'Roles y Permisos', route: '/roles_permisos', permisoId: 12 },
        { title: 'Usuarios', route: '/usuarios', permisoId: 12 },
        { title: 'Catálogos', route: '/catalogos', permisoId: 13 },
        { title: 'Auditoría', route: '/auditoria', permisoId: 16 },
      ],
    },
    {
      title: 'Currículum',
      subMenu: [
        { title: 'Gestión', route: '/curriculum', permisoId: 2 },
        { title: 'Carga de Documentos', route: '/documentos', permisoId: 3 },
        { title: 'Visualización', route: '/ver-curriculum', permisoId: 4 },
      ],
    },
    {
      title: 'Ofertas',
      subMenu: [
        { title: 'Publicar', route: '/ofertas', permisoId: 5 },
        { title: 'Postulación', route: '/postulaciones', permisoId: 6 },
        { title: 'Gestionar', route: '/gestionar-postulaciones', permisoId: 7 },
      ],
    },
    {
      title: 'Cursos',
      subMenu: [
        { title: 'Gestión', route: '/cursos', permisoId: 8 },
        { title: 'Inscripción', route: '/inscripcion-cursos', permisoId: 9 },
      ],
    },
    {
      title: 'Eventos',
      subMenu: [
        { title: 'Gestión', route: '/eventos', permisoId: 10 },
        { title: 'Confirmar Asistencia', route: '/confirmar-asistencia', permisoId: 11 },
      ],
    },
    {
      title: 'Reportes',
      subMenu: [
        { title: 'Egresados', route: '/reportes-egresados', permisoId: 14 },
        { title: 'Ofertas/Postulaciones', route: '/reportes-ofertas', permisoId: 15 },
      ],
    },
    { title: 'Integraciones', route: '/integraciones', permisoId: 17 },
  ];

  const permisos = userPermisos ?? [];
  const filteredMenu = menu
    .map((m) => {
      if (m.subMenu) {
        const sub = m.subMenu.filter((item) => item.permisoId && permisos.includes(item.permisoId));
        return sub.length > 0 ? { ...m, subMenu: sub } : null;
      } else if (m.permisoId && permisos.includes(m.permisoId)) {
        return m;
      }
      return null;
    })
    .filter(Boolean) as MenuItem[];

  // Logo UNA
  const logoUrl = new URL('../assets/logoUNATopBar.png', import.meta.url).href;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="bg-red-700 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4 md:p-6">
          <div className="flex items-center">
            <img src={logoUrl} alt="Logo UNA" className="h-14 w-auto object-contain" />
          </div>

          <nav className="flex gap-6 items-center text-white ml-auto">
            {filteredMenu.map((item) =>
              item.subMenu ? (
                <div key={item.title} className="relative group">
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className="font-medium hover:text-gray-200 transition"
                  >
                    {item.title} ▾
                  </button>
                  <div
                    className={`absolute right-0 mt-2 bg-white text-gray-800 rounded shadow-lg overflow-hidden transition-all duration-300 ${
                      openMenu === item.title ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {item.subMenu.map((sub) => (
                      <Link
                        key={sub.title}
                        href={sub.route!}
                        className="block px-4 py-2 hover:bg-red-50 hover:text-red-700 transition"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.title}
                  href={item.route!}
                  className="font-medium hover:text-gray-200 transition"
                >
                  {item.title}
                </Link>
              )
            )}
          </nav>
        </div>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="bg-red-800 px-6 py-2 text-sm text-white">
            {breadcrumbs.map((item, idx) => (
              <span key={idx}>
                <Link href={item.href} className="hover:text-gray-200">{item.title}</Link>
                {idx < breadcrumbs.length - 1 && ' / '}
              </span>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto p-6">
        <div className="bg-white shadow rounded-xl p-6">{children}</div>
      </main>

      <footer className="bg-white border-t text-center p-4 text-gray-500 text-sm">
        Sistema de Gestión © 2025 - Universidad Nacional
      </footer>
    </div>
  );
}
