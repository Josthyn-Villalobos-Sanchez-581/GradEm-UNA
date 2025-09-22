import React, { createContext, useContext } from "react";
import type { OpcionesModal } from "../components/modal/ModalBase";

export type ModalAPI = {
  alerta: (opciones: Omit<OpcionesModal, "tipo">) => Promise<void>;
  confirmacion: (opciones: Omit<OpcionesModal, "tipo">) => Promise<boolean>;
};

export const ModalContext = createContext<ModalAPI | null>(null);

export function useModalContext(): ModalAPI {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModalContext debe usarse dentro de ModalProvider");
  return ctx;
}
