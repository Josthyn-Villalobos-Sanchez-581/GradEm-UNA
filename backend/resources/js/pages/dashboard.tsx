import React from 'react';
import PpLayout from '@/layouts/PpLayout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { useModal } from "../hooks/useModal";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: dashboard().url },
];

export default function Dashboard() {
  const modal = useModal();

  // Ejemplo de confirmación
  const handleConfirm = async () => {
    const ok = await modal.confirmacion({
      titulo: "Confirmar acción",
      mensaje: "¿Está seguro que desea continuar?"
    });
    if (ok) {
      // Acción si el usuario confirma
      // ...por ejemplo, mostrar otro modal...
      await modal.alerta({ titulo: "Confirmado", mensaje: "Acción confirmada." });
    }
  };

  return (
    <>
      <Head title="Dashboard" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-8 text-center border-l-4 border-[#0D47A1]">
          <h1 className="text-3xl font-bold text-[#0D47A1]">
            Bienvenido al sistema GradEm-UNA-SIUA
          </h1>
          {/* Botón para mostrar confirmación */}
          <button
            onClick={handleConfirm}
            className="mt-8 px-6 py-2 bg-[#0D47A1] text-white rounded font-bold"
          >
            Probar confirmación
          </button>
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
