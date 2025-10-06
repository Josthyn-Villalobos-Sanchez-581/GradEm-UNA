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
}

interface Props {
  documentos: Documento[];
  userPermisos: number[];
}

export default function CertificadosIndex({ documentos = [], userPermisos }: Props) {
  const modal = useModal();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const validarArchivo = (file: File) => {
    const allowed = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowed.includes(file.type)) return "Formato no permitido. Solo PDF, PNG o JPG.";
    if (file.size > 2 * 1024 * 1024) return "Archivo supera el límite de 2MB.";
    return null;
  };

  const handleAddFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    for (const f of arr) {
      const err = validarArchivo(f);
      if (err) {
        modal.alerta({ titulo: "Archivo inválido", mensaje: `${f.name}: ${err}` });
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
      await Inertia.post(route("certificados.upload"), formData, {
        forceFormData: true,
        onSuccess: () => {
          modal.alerta({ titulo: "Éxito", mensaje: "Certificados cargados correctamente." });
          setFiles([]);
        },
        onError: (errors) => {
          modal.alerta({ titulo: "Error", mensaje: "No se pudo cargar. Verifique los archivos." });
          console.error(errors);
        },
      });
    } catch {
      modal.alerta({ titulo: "Error", mensaje: "Error inesperado al subir los archivos." });
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await modal.confirmacion({
      titulo: "Eliminar Certificado",
      mensaje: "¿Está seguro que desea eliminar este certificado?",
    });
    if (!ok) return;

    try {
      await Inertia.delete(route("certificados.delete"), {
        data: { id_documento: id },
        onSuccess: () => {
          modal.alerta({ titulo: "Éxito", mensaje: "Certificado eliminado correctamente." });
        },
        onError: () => {
          modal.alerta({ titulo: "Error", mensaje: "No se pudo eliminar el certificado." });
        },
      });
    } catch {
      modal.alerta({ titulo: "Error", mensaje: "Error inesperado al eliminar." });
    }
  };

  return (
    <>
      <Head title="Carga de Certificados" />
      <div className="max-w-xl mx-auto p-6 text-gray-900">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#034991]">Carga de Certificados</h2>
            <button
              type="button"
              onClick={() => Inertia.get(route("documentos.index"))}
              className="bg-[#034991] hover:bg-blue-800 text-white px-4 py-1 rounded shadow text-sm"
            >
              Ir a Documentos
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            Formatos permitidos: <strong>PDF, PNG, JPG</strong>. Máximo <strong>2MB</strong> por archivo. Se pueden seleccionar varios archivos.
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
                Arrastre aquí los archivos o haga clic para seleccionarlos
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => handleAddFiles(e.target.files)}
              />
            </div>

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
              Subir Certificados
            </button>
          </form>

          {/* Lista de certificados */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Certificados cargados</h3>
            {documentos.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {documentos.map((doc) => (
                  <li key={doc.id_documento} className="flex justify-between items-center py-2">
                    <a
                      href={`/storage/${doc.ruta_archivo}`}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      {doc.ruta_archivo.split("/").pop()}
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
              <p className="text-gray-600">No hay certificados cargados aún.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

CertificadosIndex.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
