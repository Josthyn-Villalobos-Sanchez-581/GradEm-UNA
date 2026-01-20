import React from 'react';
import { Button } from "@/components/ui/button";
import Frt_VistaPreviaCurriculum from '../../pages/Frt_VistaPreviaCurriculum';
import type { FormCV } from '../../types/curriculum';

interface ModalVistaPreviaProps {
  isOpen:  boolean;
  onClose: () => void;
  datos: FormCV;
  fotoPerfilUrl: string;
}

export default function ModalVistaPreviaCurriculum({ 
  isOpen, 
  onClose, 
  datos, 
  fotoPerfilUrl 
}: ModalVistaPreviaProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* ✅ Overlay con estilo inline para forzar el efecto */}
      <div 
        className="fixed inset-0 bg-black z-50 transition-all duration-300"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)' 
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal centrado */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header fijo con degradado profesional */}
            <div className="sticky top-0 bg-gradient-to-r from-[#034991] to-[#023970] text-white px-6 py-4 flex items-center justify-between z-10 shadow-md">
              <div>
                <h2 className="text-xl font-bold">Vista Previa del Currículum</h2>
                <p className="text-sm text-gray-200 mt-1">
                  Así se verá tu currículum en el PDF final
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                aria-label="Cerrar modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="bg-white rounded-lg shadow-sm">
                <Frt_VistaPreviaCurriculum 
                  datos={datos} 
                  fotoPerfilUrl={fotoPerfilUrl} 
                />
              </div>
            </div>

            {/* Footer fijo */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between shadow-lg">
              <p className="text-sm text-gray-600">
                💡 Los cambios se reflejan en tiempo real
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={onClose} 
                  variant="outline"
                  className="border-gray-300"
                >
                  Cerrar
                </Button>
                <Button 
                  onClick={onClose}
                  className="bg-[#034991] hover:bg-[#023970]"
                >
                  Continuar Editando
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Agregar animación personalizada */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}