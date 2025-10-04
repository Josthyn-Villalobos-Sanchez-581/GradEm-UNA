import { useModalContext } from "../context/ModalContext";
//backend/resources/js/hooks/useModal.ts
export function useModal() {
  const { alerta, confirmacion } = useModalContext();
  return { alerta, confirmacion };
}
