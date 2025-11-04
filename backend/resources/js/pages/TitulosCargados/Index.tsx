import React, { useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";

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

export default function TitulosIndex({ documentos = [], userPermisos }: Props) {
  const modal = useModal();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const validarArchivo = (file: File) => {
    const allowed = ["application/pdf"];
    if (!allowed.includes(file.type)) return "Formato no permitido. Solo PDF.";
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
      await Inertia.post(route("titulos.upload"), formData, {
        forceFormData: true,
        onSuccess: () => {
          modal.alerta({ titulo: "Éxito", mensaje: "Títulos cargados correctamente." });
          setFiles([]);
        },
        onError: (errors) => {
          modal.alerta({ titulo: "Error", mensaje: "No se pudo cargar. Verifique los archivos." });
        },
      });
    } catch {
      modal.alerta({ titulo: "Error", mensaje: "Error inesperado al subir los archivos." });
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await modal.confirmacion({
      titulo: "Eliminar Título",
      mensaje: "¿Está seguro que desea eliminar este título?",
    });
    if (!ok) return;

    try {
      await Inertia.delete(route("titulos.delete"), {
        data: { id_documento: id },
        onSuccess: () => {
          modal.alerta({ titulo: "Éxito", mensaje: "Título eliminado correctamente." });
        },
        onError: () => {
          modal.alerta({ titulo: "Error", mensaje: "No se pudo eliminar el título." });
        },
      });
    } catch {
      modal.alerta({ titulo: "Error", mensaje: "Error inesperado al eliminar." });
    }
  };

  return (
    <>
      <Head title="Carga de Títulos" />
      <div className="max-w-xl mx-auto p-6 text-gray-900">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#034991]">Carga de Títulos</h2>
            <Button
              type="button"
              onClick={() => Inertia.get(route("documentos.index"))}
              variant="default"
              size="sm"
              className="shadow"
              style={{ backgroundColor: "#034991" }}
            >
              Ir a Documentos
            </Button>
          </div>

          <p className="text-gray-600 mb-4">
            Formatos permitidos: <strong>PDF</strong>. Máximo <strong>2MB</strong> por archivo. Se pueden seleccionar varios archivos.
          </p>

          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${dragOver ? "border-red-500 bg-red-50" : files.length ? "border-green-400" : "border-gray-300"}`}
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
                    <li key={i}>{f.name} ({Math.round(f.size / 1024)} KB)</li>
                  ))}
                </ul>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              multiple
              onChange={(e) => handleAddFiles(e.target.files)}
            />
          </div>

          {/* Botones */}
          <form onSubmit={handleUpload} className="mt-6 flex justify-center gap-3">
            <Button
              type="submit"
              variant="default"
              size="default"
              disabled={!files.length}
              className="shadow"
            >
              Subir Títulos
            </Button>
            {files.length > 0 && (
              <Button
                type="button"
                onClick={() => setFiles([])}
                variant="destructive"
                size="default"
                className="shadow"
              >
                Cancelar
              </Button>
            )}
          </form>

          {/* Lista existente */}
          <div className="mt-8 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Títulos cargados:</h3>
            {documentos && documentos.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {documentos.map((doc) => (
                  <li key={doc.id_documento} className="flex justify-between items-center py-2">
                    <Button
                      type="button"
                      onClick={() => window.open(`/storage/${doc.ruta_archivo}`, "_blank")}
                      variant="outline"
                      size="sm"
                      className="text-center"
                    >
                      {doc.nombre_original || doc.ruta_archivo.split("/").pop()}
                    </Button>
                    <div className="flex gap-2">
                      <span className="text-sm text-gray-500">{new Date(doc.fecha_subida).toLocaleDateString()}</span>
                      <Button
                        type="button"
                        onClick={() => handleDelete(doc.id_documento)}
                        variant="destructive"
                        size="sm"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No tiene títulos cargados.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

TitulosIndex.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
