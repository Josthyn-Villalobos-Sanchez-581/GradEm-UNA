import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import OfertaDetalle from "@/components/ofertas/OfertaDetalle";

interface Props {
    oferta: any;
    onClose: () => void;
    tipo?: "preview" | "detalle";
}

export default function ModalOferta({
    oferta,
    onClose,
    tipo = "detalle",
}: Props) {

    /* =========================
       BLOQUEAR SCROLL
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
       TITULO DINÁMICO
    ========================= */
    const titulo =
        tipo === "preview"
            ? "Vista previa de la oferta"
            : "Detalle de la oferta";

    /* =========================
       RENDER
    ========================= */
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">

            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h3 className="text-lg font-bold text-[#034991]">
                        {titulo}
                    </h3>

                    <button onClick={onClose}>
                        <X className="w-5 h-5 text-gray-500 hover:text-red-600 transition" />
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <OfertaDetalle
                        oferta={oferta}
                        modo={tipo === "preview" ? "preview" : "publica"}
                    />
                </div>

                {/* FOOTER */}
                <div className="border-t px-6 py-4 flex justify-end">
                    <Button variant="secondary" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>

            </div>
        </div>
    );
}
