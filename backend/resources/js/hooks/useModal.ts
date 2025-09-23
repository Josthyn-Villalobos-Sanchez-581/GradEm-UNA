import { useModalContext } from "../context/ModalContext";

export function useModal() {
  const { alerta, confirmacion } = useModalContext();
  return { alerta, confirmacion };
}
