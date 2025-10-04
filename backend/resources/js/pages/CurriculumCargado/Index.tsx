import React, { useRef, useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { Inertia } from "@inertiajs/inertia";
import { route } from "ziggy-js";


interface Curriculum {
  id_curriculum: number;
  ruta_archivo_pdf: string;
  fecha_creacion: string;
}

interface Props {
  usuario: { id_usuario: number; nombre_completo: string };
  curriculum?: Curriculum | null;
  userPermisos: number[];
}

export default function CurriculumIndex({ usuario, curriculum }: Props) {
  const modal = useModal();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const validarArchivo = (file: File) => {
    if (file.type !== "application/pdf") return "El archivo debe ser un PDF.";
    if (file.size > 10 * 1024 * 1024) return "El archivo supera el tamaño máximo permitido (10MB).";
    return null;
  };

  const handleFileChange = (file: File) => {
    const errorMsg = validarArchivo(file);
    if (errorMsg) {
      modal.alerta({ titulo: "Archivo inválido", mensaje: errorMsg });
      setFile(null);
      return;
    }
    setFile(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      modal.alerta({ titulo: "Error", mensaje: "Debe seleccionar un archivo PDF válido." });
      return;
    }

    const ok = await modal.confirmacion({
      titulo: "Confirmar carga",
      mensaje: "¿Está seguro que desea subir este currículum? Se reemplazará el currículum actual si existe.",
    });
    if (!ok) return;

    const formData = new FormData();
    formData.append("curriculum", file);

    try {
      await Inertia.post(route("curriculum.upload"), formData, {
        forceFormData: true,
        onSuccess: () => {
          modal.alerta({ titulo: "Éxito", mensaje: "Currículum cargado con éxito." });
          setFile(null);
        },
        onError: () => {
          modal.alerta({ titulo: "Error", mensaje: "No se pudo cargar el archivo. Verifique el formato y el tamaño." });
        },
      });
    } catch {
      modal.alerta({ titulo: "Error", mensaje: "Error inesperado al subir el archivo." });
    }
  };

  const handleDelete = async () => {
    const ok = await modal.confirmacion({
      titulo: "Eliminar Currículum",
      mensaje: "¿Está seguro que desea eliminar su currículum actual?",
    });
    if (!ok) return;

    try {
      await Inertia.delete(route("curriculum.delete"), {
        onSuccess: () => {
          modal.alerta({ titulo: "Éxito", mensaje: "Currículum eliminado correctamente." });
        },
        onError: () => {
          modal.alerta({ titulo: "Error", mensaje: "No se pudo eliminar el currículum." });
        },
      });
    } catch {
      modal.alerta({ titulo: "Error", mensaje: "Error inesperado al eliminar el archivo." });
    }
  };

  return (
    <>
      <Head title="Carga de Currículum" />
      <div className="max-w-xl mx-auto p-6 text-gray-900">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#034991]">Carga de Currículum</h2>
            <button
                type="button"
                onClick={() => Inertia.get(route("documentos.index"))}
                className="bg-[#034991] hover:bg-blue-800 text-white px-4 py-1 rounded shadow text-sm"
            >
                Ir a Documentos
            </button>
          </div>
          <p className="text-gray-600 mb-4">
            Solo se permiten archivos <strong>PDF</strong> de máximo <strong>10MB</strong>.
          </p>
        
          {/* Dropzone */}
          <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                    dragOver
                    ? "border-red-500 bg-red-50" // 👈 rojo cuando arrastran archivo encima
                    : file
                    ? "border-green-400"
                    : "border-gray-300"
                }`}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setDragOver(true)}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                    }
                }}
                >
                {!file ? (
                    <p className="text-gray-500">
                    Arrastre su archivo aquí o{" "}
                    <span className="text-[#034991] font-semibold">haga clic</span> para seleccionar
                    </p>
                ) : (
                    <p className="text-green-600 font-medium">{file.name}</p>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                />
            </div>


          {/* Botones */}
          <form onSubmit={handleUpload} className="mt-6 flex justify-center gap-3">
            <button
              type="submit"
              className="bg-[#034991] hover:bg-[#0563c1] text-white px-6 py-2 rounded shadow disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!file}
            >
              Subir Currículum
            </button>
            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded shadow"
              >
                Cancelar
              </button>
            )}
          </form>

          {/* Currículum existente */}
          {curriculum && (
            <div className="mt-8 border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Currículum actual:</h3>
              <p className="text-sm text-gray-600 mb-3">
                Subido el {new Date(curriculum.fecha_creacion).toLocaleDateString()}
              </p>
              <div className="flex gap-3">
                <a
                  href={`/storage/${curriculum.ruta_archivo_pdf}`}
                  target="_blank"
                  className="bg-[#034991] hover:bg-blue-800 text-white px-4 py-2 rounded shadow text-center"
                >
                  Ver Currículum
                </a>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
                >
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

CurriculumIndex.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};