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
      <Head title="Carga de Otros Archivos" />
      <div className="max-w-xl mx-auto p-6 text-gray-900">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#034991]">Carga de Otros Archivos</h2>
            <button
              type="button"
              onClick={() => router.get(route("documentos.index"))}
              className="bg-[#034991] hover:bg-blue-800 text-white px-4 py-1 rounded shadow text-sm"
            >
              Ir a Documentos
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            Formatos permitidos: <strong>PDF, PNG, JPG, DOC, DOCX, ZIP, RAR, TXT</strong>. Máximo{" "}
            <strong>5MB</strong> por archivo. Se pueden seleccionar varios archivos.
          </p>

          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
              dragOver ? "border-red-500 bg-red-50" : files.length ? "border-green-400" : "border-gray-300"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDragOver(true)}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleAddFiles(e.dataTransfer.files);
            }}
          >
            {!files.length ? (
              <p className="text-gray-500">
                Arrastre sus archivos aquí o{" "}
                <span className="text-[#034991] font-semibold">haga clic</span> para seleccionar
              </p>
            ) : (
              <div className="text-left">
                <p className="font-medium text-green-700 mb-2">{files.length} archivo(s) listo(s) para subir:</p>
                <ul className="list-disc pl-5 text-sm">
                  {files.map((f, i) => (
                    <li key={i}>
                      {f.name} ({Math.round(f.size / 1024)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.zip,.rar,.txt"
              className="hidden"
              multiple
              onChange={(e) => handleAddFiles(e.target.files)}
            />
          </div>

          {/* Botones */}
          <form onSubmit={handleUpload} className="mt-6 flex justify-center gap-3">
            <button
              type="submit"
              className="bg-[#034991] hover:bg-[#0563c1] text-white px-6 py-2 rounded shadow disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!files.length}
            >
              Subir Archivos
            </button>
            {files.length > 0 && (
              <button
                type="button"
                onClick={() => setFiles([])}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded shadow"
              >
                Cancelar
              </button>
            )}
          </form>

          {/* Lista existente */}
          <div className="mt-8 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Otros archivos cargados:</h3>
            {documentos && documentos.length > 0 ? (
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
                    <div className="flex gap-2">
                      <span className="text-sm text-gray-500">
                        {new Date(doc.fecha_subida).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(doc.id_documento)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No tiene otros archivos cargados.</p>
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
