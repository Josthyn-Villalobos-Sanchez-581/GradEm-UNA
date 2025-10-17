import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

//backend/resources/js/components/modal/ModalBase.tsx
type TipoModal = "alerta" | "confirmacion" | "personalizado";

export type OpcionesModal = {
  tipo: TipoModal;
  titulo?: string;
  mensaje?: React.ReactNode;
  textoAceptar?: string;
  textoCancelar?: string;
  contenido?: React.ReactNode;
  ariaLabel?: string;
};

type Props = {
  abierto: boolean;
  opciones: OpcionesModal;
  onAceptar: () => void;
  onCancelar: () => void;
  cerrarConEscape?: boolean;
  cerrarClickFondo?: boolean;
};

export default function ModalBase({
  abierto,
  opciones,
  onAceptar,
  onCancelar,
  cerrarConEscape = true,
  cerrarClickFondo = true,
}: Props) {
  const btnAceptarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!abierto) return;
      if (e.key === "Escape" && cerrarConEscape) onCancelar();
      if (e.key === "Enter" && btnAceptarRef.current) {
        btnAceptarRef.current.click();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [abierto, cerrarConEscape, onCancelar]);

  useEffect(() => {
    if (!abierto) return;
    // Foco accesible al abrir
    setTimeout(() => btnAceptarRef.current?.focus(), 0);
    // Bloqueo de scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [abierto]);

  if (!abierto) return null;

  const {
    tipo,
    titulo = tipo === "confirmacion" ? "Confirmar acción" : "Aviso",
    mensaje = "",
    textoAceptar = tipo === "confirmacion" ? "Aceptar" : "Entendido",
    textoCancelar = "Cancelar",
    contenido,
    ariaLabel = "Diálogo modal",
  } = opciones;

  const handleFondo = () => { if (cerrarClickFondo) onCancelar(); };

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={handleFondo}>
      <div
        className="modal-contenedor"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modal-encabezado">
          <h3 className="modal-titulo">{titulo}</h3>
          <button className="modal-cerrar" aria-label="Cerrar" onClick={onCancelar}>×</button>
        </header>

        <section className="modal-cuerpo">
          {contenido ? contenido : <div className="modal-mensaje">{mensaje}</div>}
        </section>

        <footer className="modal-pie">
          {tipo === "confirmacion" && (
            <Button
              variant="outline" // ❕ botón secundario institucional
              onClick={onCancelar}
              size="default"
            >
              {textoCancelar}
            </Button>
          )}
          <Button
            variant="default" //botón principal institucional
            onClick={onAceptar}
            ref={btnAceptarRef}
            size="default"
          >
            {textoAceptar}
          </Button>
        </footer>
      </div>
    </div>
  );
}
