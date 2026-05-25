import { useEffect, useRef, useState } from "react";

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function useMessages() {

  const [mostrarCreditos, setMostrarCreditos] =
    useState(false);

  const [toast, setToast] =
    useState<string | null>(null);

  const konamiIndex = useRef(0);

  const shortcutBuffer = useRef<string[]>([]);

  const timeoutBuffer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  // ======================================================
  // MOSTRAR TOAST
  // ======================================================
  const mostrarToast = (
    mensaje: string,
    duracion = 4000
  ) => {

    setToast(mensaje);

    window.setTimeout(() => {
      setToast(null);
    }, duracion);
  };

  // ======================================================
  // KONAMI
  // ======================================================
  useEffect(() => {

    const handleKonami = (e: KeyboardEvent) => {

      const tecla = e.key;

      if (tecla === KONAMI_SEQUENCE[konamiIndex.current]) {

        konamiIndex.current++;

        if (
          konamiIndex.current ===
          KONAMI_SEQUENCE.length
        ) {

          mostrarToast(
            "Sello UNA 📕. By Gerald",
            5000
          );

          konamiIndex.current = 0;
        }

      } else {

        konamiIndex.current = 0;
      }
    };

    window.addEventListener(
      "keydown",
      handleKonami
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKonami
      );
    };

  }, []);

  // ======================================================
  // SHORTCUTS
  // ======================================================
  useEffect(() => {

    const handleShortcuts = (
      e: KeyboardEvent
    ) => {

      if (
        e.ctrlKey &&
        e.shiftKey &&
        e.key.toLowerCase() === "g"
      ) {

        e.preventDefault();

        setMostrarCreditos(true);

        return;
      }

      if (e.ctrlKey && e.altKey) {

        const key = e.key.toLowerCase();

        if (key === "j") {

          mostrarToast(
            "yaG oriaJ"
          );

          return;
        }

        if (key === "y") {

          mostrarToast(
            "yaG nyhtsoJ"
          );

          return;
        }

        shortcutBuffer.current.push(key);

        if (
          shortcutBuffer.current.length > 2
        ) {

          shortcutBuffer.current.shift();
        }

        const buffer =
          shortcutBuffer.current.join("");

        if (timeoutBuffer.current) {

          clearTimeout(
            timeoutBuffer.current
          );
        }

        timeoutBuffer.current =
          window.setTimeout(() => {

            shortcutBuffer.current = [];

          }, 1000);

        if (buffer === "kk") {

          mostrarToast(
            "yaG auiS nimdA niveK"
          );

          shortcutBuffer.current = [];
        }
      }
    };

    window.addEventListener(
      "keydown",
      handleShortcuts
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleShortcuts
      );
    };

  }, []);

  return {
    toast,
    mostrarCreditos,
    setMostrarCreditos,
  };
}