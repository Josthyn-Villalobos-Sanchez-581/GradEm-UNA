import React from "react";
import { Head, Link } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";

// 1. Interfaz de propiedades (se elimina actionText, ya no es necesario)
interface DocumentUploadCardProps {
  title: string;
  description: string;
  emoji: string;
  actionUrl: string; // Se mantiene la URL para la navegación
}

// 2. Componente Tarjeta de Carga modificado (sin el botón)
const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({ 
    title, 
    description, 
    emoji, 
    actionUrl 
}) => {
  return (
    <div
      // La acción de navegación está únicamente en el onClick de la tarjeta principal
      className="bg-white rounded-xl p-8 flex flex-col items-center justify-center text-center 
                 shadow-md border border-gray-200 transition-all duration-300 cursor-pointer h-full
                 hover:shadow-lg hover:border-blue-600 transform hover:-translate-y-0.5"
      onClick={() => window.location.href = actionUrl}
    >
      {/* 1. Ícono */}
      <div className="text-6xl text-[#CD1719] mb-4"> 
        {emoji}
      </div>
      
      {/* 2. Título */}
      <h3 className="text-xl font-bold text-[#034991] mb-2">
        {title}
      </h3>
      
      {/* 3. Descripción */}
      <p className="text-gray-500 text-sm">
        {description}
      </p>
      
      {/* *** SE HA ELIMINADO EL COMPONENTE <Button> ***
      */}
    </div>
  );
};


// Interfaz para las propiedades del componente principal
interface DocumentosIndexProps {
  userPermisos: number[];
}

// Componente principal DocumentosIndex
export default function DocumentosIndex({}: DocumentosIndexProps) {
  return (
    <>
      <Head title="Carga de Documentos" />
      <div className="max-w-4xl mx-auto space-y-6 p-8 bg-white rounded-lg shadow-lg"> 
        <h2 className="text-3xl font-bold text-[#034991] mb-4 text-center">
          Carga de Documentos
        </h2>
        <p className="text-gray-600 mb-8 text-center">
          Por favor, seleccione el tipo de documento que desea gestionar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Tarjeta Currículum Vitae (Se eliminó actionText) */}
          <DocumentUploadCard
            emoji="📄"
            title="Currículum Vitae"
            description="Haga clic para subir, actualizar o revisar su currículum vitae."
            actionUrl="/curriculum-cargado"
          />

          {/* Tarjeta Títulos Académicos (Se eliminó actionText) */}
          <DocumentUploadCard
            emoji="🎓"
            title="Títulos"
            description="Haga clic para subir los archivos de sus títulos."
            actionUrl="/titulos-cargados"
          />

          {/* Tarjeta Certificados (Se eliminó actionText) */}
          <DocumentUploadCard
            emoji="🏅"
            title="Certificados"
            description="Haga clic para subir sus certificados de cursos, seminarios y reconocimientos adicionales."
            actionUrl="/certificados-cargados"
          />

          {/* Tarjeta Otros Documentos (Se eliminó actionText) */}
          <DocumentUploadCard
            emoji="📎"
            title="Otros Documentos"
            description="Haga clic para cargar cualquier otro documento relevante no clasificado en otras secciones."
            actionUrl="/otros-cargados"
          />
        </div>
      </div>
    </>
  );
}

DocumentosIndex.layout = (page: React.ReactNode & { props: DocumentosIndexProps }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};



/*
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
          {/* Botón Currículum }
          <Button
            onClick={() => window.location.href = "/curriculum-cargado"}
            variant="default"
            size="lg"
            className="block shadow-md text-center"
          >
            📄 Cargar Currículum
          </Button>

          {/* Botón Cargar Certificados }
          <Button
            onClick={() => window.location.href = "/certificados-cargados"}
            variant="default"
            size="lg"
            className="block shadow-md text-center"
          >
            📑 Cargar Certificados
          </Button>

          {/* Botón Cargar Títulos }
          <Button
            onClick={() => window.location.href = "/titulos-cargados"}
            variant="default"
            size="lg"
            className="block shadow-md text-center"
          >
            🎓 Cargar Títulos
          </Button>

          {/* Botón Cargar Otros Archivos }
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
*/