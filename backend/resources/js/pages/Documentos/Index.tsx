import React from "react";
import { Head, Link } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";

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
          <Link
            href="/curriculum-cargado"
            className="block bg-[#034991] hover:bg-[#0563c1] text-white font-semibold py-4 px-6 rounded-lg shadow-md text-center transition"
          >
            📄 Cargar Currículum
          </Link>

          {/* Espacio para más tipos */}
          <button
            disabled
            className="block bg-gray-400 cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg shadow-md text-center"
          >
            🎓 Certificados (Próximamente)
          </button>
          <button
            disabled
            className="block bg-gray-400 cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg shadow-md text-center"
          >
            📑 Títulos (Próximamente)
          </button>
        </div>
      </div>
    </>
  );
}

DocumentosIndex.layout = (page: React.ReactNode & { props: DocumentosIndexProps }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
