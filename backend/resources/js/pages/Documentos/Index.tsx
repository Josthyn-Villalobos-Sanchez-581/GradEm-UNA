import React from "react";
import { Head, Link } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";

interface DocumentosIndexProps {
  userPermisos: number[];
}

export default function DocumentosIndex({}: DocumentosIndexProps) {
  return (
    <>
      <Head title="Carga de Documentos" />
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Carga de Documentos
        </h2>
        <p className="text-gray-600 mb-6">
          Seleccione el tipo de documento que desea cargar o gestionar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Botón Currículum */}
          <Button
            onClick={() => window.location.href = "/curriculum-cargado"}
            variant="default"
            size="lg"
            className="block shadow-md text-center"
          >
            📄 Cargar Currículum
          </Button>

          {/* Botón Cargar Certificados */}
          <Button
            onClick={() => window.location.href = "/certificados-cargados"}
            variant="default"
            size="lg"
            className="block shadow-md text-center"
          >
            📑 Cargar Certificados
          </Button>

          {/* Botón Cargar Títulos */}
          <Button
            onClick={() => window.location.href = "/titulos-cargados"}
            variant="default"
            size="lg"
            className="block shadow-md text-center"
          >
            🎓 Cargar Títulos
          </Button>

          {/* Botón Cargar Otros Archivos */}
          <Button
            onClick={() => window.location.href = "/otros-cargados"}
            variant="default"
            size="lg"
            className="block shadow-md text-center"
          >
            ⬆️ Cargar Otros Archivos
          </Button>
        </div>
      </div>
    </>
  );
}

DocumentosIndex.layout = (page: React.ReactNode & { props: DocumentosIndexProps }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
