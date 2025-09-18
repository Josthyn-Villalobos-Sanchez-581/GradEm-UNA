import React from 'react';
import PpLayout from '@/layouts/PpLayout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: dashboard().url },
];

export default function Dashboard() {
  return (
    <>
      <Head title="Dashboard" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-8 text-center border-l-4 border-[#0D47A1]">
          <h1 className="text-3xl font-bold text-[#0D47A1]">
            Bienvenido al sistema GradEm-UNA-SIUA
          </h1>
        </div>
      </div>
    </>
  );
}

// Layout dinámico
Dashboard.layout = (page: React.ReactNode & { props: { userPermisos: number[] } }) => {
  const { userPermisos } = (page as any).props;
  return <PpLayout breadcrumbs={breadcrumbs} userPermisos={userPermisos}>{page}</PpLayout>;
};
