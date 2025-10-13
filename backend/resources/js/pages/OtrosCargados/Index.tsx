import React, { useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { route } from "ziggy-js";

interface Documento {
  id_documento: number;
  ruta_archivo: string;
  fecha_subida: string;
  nombre_original?: string;
}

interface Props {
  documentos: Documento[];
  userPermisos: number[];
}

export default function OtrosIndex({ documentos = [], userPermisos }: Props) {
  const modal = useModal();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Permitir cualquier tipo de archivo común: PDF, imágenes, Word, TXT, ZIP, etc.
  const validarArchivo = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) return `El archivo ${file.name} supera los 5MB permitidos.`;
    return null;
  };

  const handleAddFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    for (const f of arr) {
      const err = validarArchivo(f);
      if (err) {
        modal.alerta({ titulo: "Archivo inválido", mensaje: err });
        continue;
      }
      setFiles((prev) => [...prev, f]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      modal.alerta({ titulo: "Error", mensaje: "Debe seleccionar al menos un archivo." });
      return;
    }

    const ok = await modal.confirmacion({
      titulo: "Confirmar carga",
      mensaje: `¿Desea subir ${files.length} archivo(s)?`,
    });
    if (!ok) return;

    const formData = new FormData();
    files.forEach((f) => formData.append("archivos[]", f));

    try {
      await Inertia.post(route("otros.upload"), formData, {
        forceFormData: true,
        onSuccess: () => {
          modal.alerta({ titulo: "Éxito", mensaje: "Archivos cargados correctamente." });
          setFiles([]);
        },
        onError: (errors) => {
          modal.alerta({ titulo: "Error", mensaje: "No se pudieron cargar los archivos." });
          console.error(errors);
        },
      });
    } catch {
      modal.alerta({ titulo: "Error", mensaje: "Error inesperado al subir los archivos." });
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await modal.confirmacion({
      titulo: "Eliminar documento",
      mensaje: "¿Está seguro que desea eliminar este archivo?",
    });
    if (!ok) return;

    try {
      await Inertia.delete(route("otros.delete"), {
        data: { id_documento: id },
        onSuccess: () => {
          modal.alerta({ titulo: "Éxito", mensaje: "Archivo eliminado correctamente." });
        },
        onError: () => {
          modal.alerta({ titulo: "Error", mensaje: "No se pudo eliminar el archivo." });
        },
      });
    } catch {
      modal.alerta({ titulo: "Error", mensaje: "Error inesperado al eliminar el archivo." });
    }
  };

  return (
    <>
      <Head title="Carga de Otros Documentos" />
      <div className="max-w-xl mx-auto p-6 text-gray-900">
        <div className="bg-white shadow-lg rounded-lg p-6">
          {/* Título y botón volver */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#034991]">Carga de Otros Documentos</h2>
            <button
              type="button"
              onClick={() => Inertia.get(route("documentos.index"))}
              className="bg-[#034991] hover:bg-blue-800 text-white px-4 py-1 rounded shadow text-sm"
            >
              Ir a Documentos
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            Puede subir archivos como <strong>cartas de recomendación</strong>, <strong>constancias</strong> o
            <strong> documentos adicionales</strong>. Tamaño máximo permitido: <strong>5MB</strong>.
          </p>

          {/* Área de carga */}
          <form onSubmit={handleUpload} className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragOver ? "border-[#034991] bg-blue-50" : "border-gray-300"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleAddFiles(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
            >
              <p className="text-gray-600 mb-2">
                Arrastre los archivos aquí o haga clic para seleccionarlos
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleAddFiles(e.target.files)}
              />
            </div>

            {/* Archivos seleccionados */}
            {files.length > 0 && (
              <ul className="divide-y divide-gray-200 mt-4">
                {files.map((f, i) => (
                  <li key={i} className="py-1 text-sm text-gray-700">
                    {f.name}
                  </li>
                ))}
              </ul>
            )}

            <button
              type="submit"
              className="bg-[#034991] hover:bg-[#0563c1] text-white px-4 py-2 rounded shadow w-full"
            >
              Subir Archivos
            </button>
          </form>

          {/* Lista de archivos cargados */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Archivos cargados</h3>
            {documentos.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {documentos.map((doc) => (
                  <li key={doc.id_documento} className="flex justify-between items-center py-2">
                    <a
                      href={`/storage/${doc.ruta_archivo}`}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      {doc.nombre_original || doc.ruta_archivo.split("/").pop()}
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id_documento)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No hay archivos cargados aún.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

OtrosIndex.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
