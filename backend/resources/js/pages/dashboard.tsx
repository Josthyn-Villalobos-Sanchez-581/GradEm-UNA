// resources/js/pages/Dashboard.tsx
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import PpLayout from '@/layouts/PpLayout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: dashboard().url },
];

interface DashboardProps {
  userPermisos: number[]; // Permisos del usuario enviados desde backend
}

export default function Dashboard({ userPermisos }: DashboardProps) {
  return (
    <>
      <Head title="Dashboard" />

      {/* Contenedor principal */}
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
        {/* Sección superior: indicadores / estadísticas */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Bloques de ejemplo, reemplazar con widgets reales */}
          <div className="relative aspect-video overflow-hidden rounded-xl border border-gray-300">
            <PlaceholderPattern className="absolute inset-0 w-full h-full stroke-gray-300" />
          </div>
          <div className="relative aspect-video overflow-hidden rounded-xl border border-gray-300">
            <PlaceholderPattern className="absolute inset-0 w-full h-full stroke-gray-300" />
          </div>
          <div className="relative aspect-video overflow-hidden rounded-xl border border-gray-300">
            <PlaceholderPattern className="absolute inset-0 w-full h-full stroke-gray-300" />
          </div>
        </div>

        {/* Sección inferior: contenido amplio, reportes o gráficos */}
        <div className="relative min-h-[60vh] flex-1 overflow-hidden rounded-xl border border-gray-300">
          <PlaceholderPattern className="absolute inset-0 w-full h-full stroke-gray-300" />
        </div>
      </div>
    </>
  );
}

// Layout dinámico: envía los permisos al layout
Dashboard.layout = (page: React.ReactNode & { props: DashboardProps }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout breadcrumbs={breadcrumbs} userPermisos={permisos}>{page}</PpLayout>;
};
