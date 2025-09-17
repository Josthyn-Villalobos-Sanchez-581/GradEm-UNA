import React from "react";

type Props = { titulo?: string; children: React.ReactNode };

export default function PpLayout({ titulo = "GradEm-SIUA", children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto p-4">
          <h1 className="text-xl font-semibold">{titulo}</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
}
