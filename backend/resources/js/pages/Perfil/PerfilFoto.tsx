import React, { useState, useRef } from "react";
import axios from "axios";
import { Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import { Inertia } from "@inertiajs/inertia";
import { Button } from "@/components/ui/button"; // para usar el botón definido como componente

interface Props {
  userPermisos: number[];
  fotoPerfil?: string | null;
}

// Colores oficiales UNA
const COLORS = {
  rojo: "#CD1719",
  azul: "#034991",
  gris: "#A7A7A9",
  blanco: "#FFFFFF",
  negro: "#000000",
};

// Tipografía oficial UNA
const FONT = {
  titulo: "'Open Sans', sans-serif",
  texto: "'Open Sans', serif",
};

export default function PerfilFoto({ userPermisos, fotoPerfil }: Props) {
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const modal = useModal();

  // Validaciones base: formato y tamaño
  const validarImagen = (file: File) => {
    const formatosPermitidos = ["image/jpeg", "image/png"];
    if (!formatosPermitidos.includes(file.type))
      return "Formato inválido. Solo se permiten imágenes JPG o PNG.";
    if (file.size > 2 * 1024 * 1024)
      return "La imagen supera el tamaño máximo permitido (2MB).";
    return null;
  };

  // Carga y validación de dimensiones y proporción
  const handleFile = (file: File) => {
    const errorMsg = validarImagen(file);
    if (errorMsg) {
      modal.alerta({ titulo: "Archivo inválido", mensaje: errorMsg });
      setFoto(null);
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const w = img.width;
      const h = img.height;

      // Dimensiones mínimas
      if (w < 500 || h < 500) {
        modal.alerta({
          titulo: "Imagen demasiado pequeña",
          mensaje: "La imagen debe tener al menos 500 × 500 píxeles.",
        });
        setFoto(null);
        setPreview(null);
        URL.revokeObjectURL(objectUrl);
        return;
      }

      // Proporción (cuadrada 1:1 o pasaporte 3.5:4.5 con tolerancia)
      const tol = 0.03; // ±3%
      const ratio = w / h;
      const isCuadrada = Math.abs(ratio - 1.0) <= tol;
      const passportRatio = 3.5 / 4.5; // ≈ 0.777...
      const isPasaporte = h > w && Math.abs(ratio - passportRatio) <= tol;

      if (!(isCuadrada || isPasaporte)) {
        modal.alerta({
          titulo: "Proporción no permitida",
          mensaje:
            "La imagen debe ser cuadrada (1:1) o tamaño pasaporte (3.5:4.5).",
        });
        setFoto(null);
        setPreview(null);
        URL.revokeObjectURL(objectUrl);
        return;
      }

      setFoto(file);
      setPreview(objectUrl);
    };

    img.onerror = () => {
      modal.alerta({
        titulo: "Imagen inválida",
        mensaje: "No fue posible leer las dimensiones de la imagen.",
      });
      setFoto(null);
      setPreview(null);
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foto) {
      return modal.alerta({
        titulo: "Error",
        mensaje: "Debe seleccionar una foto válida.",
      });
    }

    const ok = await modal.confirmacion({
      titulo: "Confirmar actualización",
      mensaje: "¿Está seguro que desea actualizar su foto de perfil?",
    });
    if (!ok) return;

    const formData = new FormData();
    formData.append("foto", foto);

    try {
      await axios.post("/perfil/foto", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      modal
        .alerta({
          titulo: "Éxito",
          mensaje: "Foto de perfil actualizada exitosamente.",
        })
        .then(() => {
          Inertia.visit("/perfil");
        });

      // Limpieza local
      if (preview) URL.revokeObjectURL(preview);
      setFoto(null);
      setPreview(null);
    } catch {
      modal.alerta({
        titulo: "Error",
        mensaje:
          "No se pudo subir la foto. Verifique formato, tamaño, dimensiones y proporción.",
      });
    }
  };

  return (
    <>
      <Head title="Actualizar Foto de Perfil" />
      <div
        className="max-w-3xl mx-auto p-6 space-y-6"
        style={{ color: COLORS.negro, fontFamily: FONT.texto }}
      >
        {/* Botón Volver arriba a la derecha */}
        <div className="flex justify-end mb-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => Inertia.visit("/perfil")}
          >
            ← Volver
          </Button>
        </div>

        <div
          className="bg-white shadow-md rounded-lg p-6"
          style={{ backgroundColor: COLORS.blanco }}
        >
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: COLORS.azul, fontFamily: FONT.titulo }}
          >
            Actualizar Foto de Perfil
          </h2>

          {/* Dropzone ampliada */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Área para arrastrar o seleccionar la foto de perfil"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            className={`w-full border-4 border-dashed rounded-2xl px-6 py-10 sm:py-12 md:py-16 
                        flex flex-col items-center justify-center cursor-pointer 
                        transition hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 
                        ${preview ? "border-blue-400" : "border-gray-300"}`}
            style={{
              borderColor: preview ? COLORS.azul : COLORS.gris,
              minHeight: "320px",
            }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {!preview ? (
              <div className="flex flex-col items-center">
                {/* Imagen redonda perfectamente centrada */}
                <img
                  src={fotoPerfil || FotoXDefecto}
                  alt="placeholder"
                  className="h-40 w-40 object-cover rounded-full mb-4 border-2 border-gray-200 shadow-sm"
                />
                <div className="text-center max-w-md">
                  <p
                    className="text-base sm:text-lg"
                    style={{ color: COLORS.gris, fontFamily: FONT.texto }}
                  >
                    Arrastre su foto aquí o{" "}
                    <span style={{ color: COLORS.rojo, fontFamily: FONT.titulo }}>
                      haga clic
                    </span>{" "}
                    para seleccionar.
                  </p>
                  <p className="mt-2 text-xs sm:text-sm" style={{ color: COLORS.gris }}>
                    Formatos: JPG/PNG — Máx 2MB — Mín 500×500
                  </p>
                </div>
              </div>
            ) : (
              // La vista previa se mantiene cuadrada
              <img
                src={preview}
                alt="Vista previa"
                className="h-56 w-56 md:h-64 md:w-64 object-cover rounded-2xl shadow"
              />
            )}

            <input
              ref={inputRef}
              type="file"
              name="foto"
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
          </div>

          {/* ===== Requisitos y Recomendaciones ===== */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Requisitos */}
            <div className="rounded-lg border p-4 bg-gray-50">
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: COLORS.azul, fontFamily: FONT.titulo }}
              >
                Requisitos
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1" style={{ color: COLORS.negro }}>
                <li>Formato <strong>JPG</strong> o <strong>PNG</strong>.</li>
                <li>Peso máximo <strong>2 MB</strong>.</li>
                <li>Dimensiones mínimas <strong>500 × 500 px</strong>.</li>
                <li>Proporción <strong>1:1</strong> (cuadrada) o <strong>3.5:4.5</strong> (pasaporte).</li>
              </ul>
            </div>

            {/* Recomendaciones */}
            <div className="rounded-lg border p-4 bg-gray-50">
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: COLORS.azul, fontFamily: FONT.titulo }}
              >
                Recomendaciones
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1" style={{ color: COLORS.negro }}>
                <li>Fondo liso y buena iluminación.</li>
                <li>Rostro centrado, sin lentes oscuros ni gorras.</li>
                <li>Evite imágenes borrosas o recortadas en exceso.</li>
                <li>Verifique que el archivo no exceda los 2MB antes de subir.</li>
              </ul>
            </div>
          </div>

          {/* Botones */}
          <form onSubmit={handleUpload} className="mt-8 flex justify-center gap-4">
            <Button type="submit" variant="default" size="lg" disabled={!foto}>
              Subir Foto
            </Button>

            {foto && (
              <Button
                type="button"
                variant="destructive"
                size="lg"
                onClick={() => {
                  if (preview) URL.revokeObjectURL(preview);
                  setFoto(null);
                  setPreview(null);
                }}
              >
                Cancelar
              </Button>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

PerfilFoto.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
