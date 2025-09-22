import React, { useCallback, useMemo, useState } from "react";
import ModalBase, { OpcionesModal } from "../components/modal/ModalBase";
import { ModalContext } from "../context/ModalContext";
import { registrarServicioModal } from "../services/modal-servicio";

type EstadoInterno = {
  abierto: boolean;
  opciones: OpcionesModal | null;
  resolver?: (valor: any) => void;
};

export default function ModalProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<EstadoInterno>({ abierto: false, opciones: null });

  const cerrar = useCallback((resultado?: any) => {
    setEstado((prev) => {
      prev.resolver?.(resultado);
      return { abierto: false, opciones: null };
    });
  }, []);

  const alerta = useCallback((opciones: Omit<OpcionesModal, "tipo">) => {
    return new Promise<void>((resolve) => {
      setEstado({ abierto: true, opciones: { tipo: "alerta", ...opciones }, resolver: () => resolve() });
    });
  }, []);

  const confirmacion = useCallback((opciones: Omit<OpcionesModal, "tipo">) => {
    return new Promise<boolean>((resolve) => {
      setEstado({ abierto: true, opciones: { tipo: "confirmacion", ...opciones }, resolver: (ok: boolean) => resolve(!!ok) });
    });
  }, []);

  const api = useMemo(() => ({ alerta, confirmacion }), [alerta, confirmacion]);

  // Exponer API en un servicio global (para usar en utilidades no-React)
  registrarServicioModal(api);

  return (
    <ModalContext.Provider value={api}>
      {children}
      <ModalBase
        abierto={estado.abierto}
        opciones={estado.opciones || { tipo: "alerta", titulo: "", mensaje: "" }}
        onAceptar={() => cerrar(true)}
        onCancelar={() => cerrar(false)}
        cerrarConEscape
        cerrarClickFondo
      />
    </ModalContext.Provider>
  );
}
