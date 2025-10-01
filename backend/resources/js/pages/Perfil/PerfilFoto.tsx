import React, { useState, useRef } from "react";
import axios from "axios";
import { Head } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import FotoXDefecto from "@/assets/FotoXDefecto.png";
import { Inertia } from "@inertiajs/inertia";

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
  texto: "'Goudy Old Style', serif",
};

export default function PerfilFoto({ userPermisos, fotoPerfil }: Props) {
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const modal = useModal();

  const validarImagen = (file: File) => {
    const formatosPermitidos = ["image/jpeg", "image/png"];
    if (!formatosPermitidos.includes(file.type))
      return "Formato inválido. Solo JPG o PNG.";
    if (file.size > 2 * 1024 * 1024)
      return "La imagen supera el tamaño máximo permitido (2MB).";
    return null;
  };

  const handleFile = (file: File) => {
    const errorMsg = validarImagen(file);
    if (errorMsg) {
      modal.alerta({ titulo: "Archivo inválido", mensaje: errorMsg });
      setFoto(null);
      setPreview(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (img.width < 500 || img.height < 500) {
        modal.alerta({
          titulo: "Imagen demasiado pequeña",
          mensaje: "La imagen debe tener al menos 500x500 píxeles.",
        });
        setFoto(null);
        setPreview(null);
      } else {
        setFoto(file);
        setPreview(URL.createObjectURL(file));
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foto)
      return modal.alerta({
        titulo: "Error",
        mensaje: "Debe seleccionar una foto válida.",
      });

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

      modal.alerta({
        titulo: "Éxito",
        mensaje: "Foto de perfil actualizada exitosamente.",
      }).then(() => {
        Inertia.visit("/perfil");
      });

      setFoto(null);
      setPreview(null);
    } catch {
      modal.alerta({
        titulo: "Error",
        mensaje:
          "No se pudo subir la foto. Verifique formato, tamaño y dimensiones.",
      });
    }
  };

  return (
    <>
      <Head title="Actualizar Foto de Perfil" />
      <div
        className="max-w-md mx-auto p-6 space-y-6"
        style={{ color: COLORS.negro, fontFamily: FONT.texto }}
      >
        <div
          className="bg-white shadow-md rounded-lg p-6"
          style={{ backgroundColor: COLORS.blanco }}
        >
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: COLORS.azul, fontFamily: FONT.titulo }}
          >
            Actualizar Foto de Perfil
          </h2>
          <p className="mb-4" style={{ color: COLORS.gris }}>
            Seleccione una foto <strong>JPG o PNG</strong>, máximo 2MB,
            mínimo 500x500 píxeles.
          </p>

          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition hover:border-blue-600 ${
              preview ? "border-green-400" : "border-gray-300"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              borderColor: preview ? COLORS.azul : COLORS.gris,
            }}
          >
            {!preview ? (
              <>
                <img
                  src={FotoXDefecto}
                  alt="placeholder"
                  className="h-32 w-32 object-cover rounded-full mb-3"
                />
                <p
                  className="text-center"
                  style={{ color: COLORS.gris, fontFamily: FONT.texto }}
                >
                  Arrastre su foto aquí o{" "}
                  <span style={{ color: COLORS.rojo, fontFamily: FONT.titulo }}>
                    haga clic
                  </span>{" "}
                  para seleccionar
                </p>
              </>
            ) : (
              <img
                src={preview}
                alt="Vista previa"
                className="h-48 w-48 md:h-56 md:w-56 object-cover rounded-lg shadow"
              />
            )}
            <input
              ref={inputRef}
              type="file"
              name="foto"
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={(e) =>
                e.target.files && handleFile(e.target.files[0])
              }
            />
          </div>

          {/* Botones */}
          <form onSubmit={handleUpload} className="mt-6 flex justify-center gap-3">
            <button
              type="submit"
              className="px-6 py-2 rounded shadow"
              style={{
                backgroundColor: COLORS.azul,
                color: COLORS.blanco,
                fontFamily: FONT.titulo,
              }}
              disabled={!foto}
            >
              Subir Foto
            </button>
            {foto && (
              <button
                type="button"
                onClick={() => {
                  setFoto(null);
                  setPreview(null);
                }}
                className="px-6 py-2 rounded shadow"
                style={{
                  backgroundColor: COLORS.rojo,
                  color: COLORS.blanco,
                  fontFamily: FONT.titulo,
                }}
              >
                Cancelar
              </button>
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

