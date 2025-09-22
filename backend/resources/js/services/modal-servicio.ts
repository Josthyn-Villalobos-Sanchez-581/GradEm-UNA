import type { ModalAPI } from "../context/ModalContext";

let api: ModalAPI | null = null;

/** Registra la instancia global del API de modal (lo llama el Provider) */
export function registrarServicioModal(instancia: ModalAPI) {
  api = instancia;
}

/** Alerta utilizable fuera de componentes React (servicios, utils, etc.) */
export function alerta(opciones: { titulo?: string; mensaje?: any; textoAceptar?: string }) {
  if (!api) throw new Error("El servicio de modal no está listo. Envuelve tu app con <ModalProvider>.");
  return api.alerta(opciones);
}

/** Confirmación utilizable fuera de componentes React */
export function confirmacion(opciones: {
  titulo?: string;
  mensaje?: any;
  textoAceptar?: string;
  textoCancelar?: string;
}) {
  if (!api) throw new Error("El servicio de modal no está listo. Envuelve tu app con <ModalProvider>.");
  return api.confirmacion(opciones);
}
