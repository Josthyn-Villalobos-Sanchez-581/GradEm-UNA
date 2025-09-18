import React from "react";

// Definición de las propiedades que acepta el layout.
// 'titulo' es opcional y 'children' representa el contenido a mostrar.
type Props = { titulo?: string; children: React.ReactNode };

// Componente principal del layout de la aplicación.
// Muestra un encabezado con el título y el contenido principal.
export default function PpLayout({ titulo = "GradEm-SIUA", children }: Props) {
  return (
    // Contenedor principal con fondo gris claro y altura mínima de pantalla.
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado con fondo blanco y borde inferior */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto p-4">
          {/* Título del layout */}
          <h1 className="text-xl font-semibold">{titulo}</h1>
        </div>
      </header>
      {/* Sección principal donde se renderizan los hijos */}
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
}
