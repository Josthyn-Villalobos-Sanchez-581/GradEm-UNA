import { type BreadcrumbItem } from '@/types';
import { type ReactNode, useState } from 'react';
import { Link } from '@inertiajs/react';

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs }: AppLayoutProps) {
  // Estados para desplegar submenús
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Topbar */}
      <header className="bg-blue-600 text-white shadow-md relative">
        <div className="flex justify-between items-center px-6 py-3">
          <h1 className="text-lg font-bold">GradEm-UNA</h1>
          <nav className="flex gap-6 relative">
            {/* Dashboard */}
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>

            {/* Roles con submenú */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('roles')}
                className="hover:underline"
              >
                Roles ▾
              </button>
              {openMenu === 'roles' && (
                <div className="absolute bg-white text-black mt-2 rounded shadow-lg py-2 w-48 z-50">
                  <Link
                    href="/roles"
                    className="block px-4 py-2 hover:bg-gray-200"
                  >
                    Ver Roles
                  </Link>
                  <Link
                    href="/roles/create"
                    className="block px-4 py-2 hover:bg-gray-200"
                  >
                    Crear Rol
                  </Link>
                </div>
              )}
            </div>

            {/* Permisos con submenú */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('permisos')}
                className="hover:underline"
              >
                Permisos ▾
              </button>
              {openMenu === 'permisos' && (
                <div className="absolute bg-white text-black mt-2 rounded shadow-lg py-2 w-52 z-50">
                  <Link
                    href="/permisos"
                    className="block px-4 py-2 hover:bg-gray-200"
                  >
                    Ver Permisos
                  </Link>
                  <Link
                    href="/permisos/create"
                    className="block px-4 py-2 hover:bg-gray-200"
                  >
                    Crear Permiso
                  </Link>
                </div>
              )}
            </div>

            {/* Usuarios */}
            <Link href="/usuarios" className="hover:underline">
              Usuarios
            </Link>
          </nav>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs && (
          <div className="bg-blue-700 px-6 py-2 text-sm">
            {breadcrumbs.map((item, idx) => (
              <span key={idx}>
                <Link href={item.href} className="hover:underline">
                  {item.title}
                </Link>
                {idx < breadcrumbs.length - 1 && ' / '}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Contenido */}
      <main className="flex-1 p-6">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-3">
        <p>Sistema de Gestión © 2025 - Universidad Nacional</p>
      </footer>
    </div>
  );
}
