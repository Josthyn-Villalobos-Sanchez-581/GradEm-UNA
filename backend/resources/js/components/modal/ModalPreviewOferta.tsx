import React from "react";
import { X } from "lucide-react";
import OfertaDetalle from "@/components/ofertas/OfertaDetalle";
import { Button } from "@/components/ui/button";

interface Props {
    oferta: any;
    onClose: () => void;
}

export default function ModalPreviewOferta({ oferta, onClose }: Props) {
    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
            <div className="bg-white w-full max-w-5xl max-h-[90%] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h3 className="text-lg font-bold text-[#034991]">
                        Vista previa de la oferta
                    </h3>
                    <button onClick={onClose}>
                        <X className="w-5 h-5 text-gray-500 hover:text-red-600 transition" />
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <OfertaDetalle modo="preview" oferta={oferta} />
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
