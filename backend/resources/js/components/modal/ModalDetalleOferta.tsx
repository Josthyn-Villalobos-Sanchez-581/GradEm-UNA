import React, { useEffect } from "react";
import { X } from "lucide-react";
import OfertaDetalle from "@/components/ofertas/OfertaDetalle";

interface Props {
  oferta: any;
  onClose: () => void;
}

export default function ModalDetalleOferta({ oferta, onClose }: Props) {
  /* =========================
     EFECTOS
  ========================= */
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);

    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
      {/* Overlay SOLO dentro del contenido */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-xl"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
          relative
          w-full max-w-6xl
          max-h-[85vh]
          bg-white
          rounded-[2.5rem]
          shadow-[0_32px_64px_-12px_rgba(0,0,0,0.35)]
          flex flex-col
          overflow-hidden
          animate-in zoom-in-95 slide-in-from-bottom-4 duration-300
        "
      >
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="
            absolute top-5 right-5 z-20
            w-11 h-11
            flex items-center justify-center
            rounded-2xl
            bg-[#034991]
            text-white
            hover:bg-[#CD1719]
            active:scale-95
            transition-all shadow-lg
          "
          aria-label="Cerrar"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Contenido */}
        <div className="overflow-y-auto overflow-x-hidden">
          <OfertaDetalle oferta={oferta} modo="publica" />
        </div>
      </div>
    </div>
  );
}
