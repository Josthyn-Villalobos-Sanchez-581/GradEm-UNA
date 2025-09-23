
//backend/resources/js/pages/Usuarios/CrearAdmin.tsx 
// backend/resources/js/pages/Usuarios/CrearAdmin.tsx
import React from "react";
import { Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import FormularioRegistroAdmin from "@/components/FormularioRegistroAdmin";

export default function CrearAdmin(props: any) {
  return (
    <>
      <Head title="Crear Usuario Administrador/Dirección/Subdirección" />
      {/*<div className="max-w-7xl mx-auto px-6 py-6 space-y-6 text-black">
        <div className="bg-white shadow rounded-lg p-6">
       
        </div>
      </div>*/}
         <FormularioRegistroAdmin />
    </>
 
);

}

CrearAdmin.layout = (page: React.ReactNode & { props?: any }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};