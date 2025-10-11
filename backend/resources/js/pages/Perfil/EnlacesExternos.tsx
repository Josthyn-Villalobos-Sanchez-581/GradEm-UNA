import React, { useEffect, useState } from "react";
import axios from "axios";
import { useModal } from "@/hooks/useModal";
//backend/resources/js/pages/Perfil/EnlacesExternos.tsx
interface Enlace {
  id_plataforma: number;
  tipo: string;
  url: string;
}

interface Props {
  enlaces: Enlace[];
  usuario: any;
  soloLectura?: boolean; // 👈 Modo lectura opcional
}

export default function EnlacesExternos({
  enlaces: initialEnlaces = [],
  usuario,
  soloLectura = false,
}: Props) {
  const modal = useModal();
  const [enlaces, setEnlaces] = useState<Enlace[]>(initialEnlaces ?? []);
  const [urlsPredefinidas, setUrlsPredefinidas] = useState<{ [key: string]: string }>({
    LinkedIn: "",
    Instagram: "",
    GitHub: "",
  });
  const [tipo, setTipo] = useState("");
  const [url, setUrl] = useState("");

  // Verifica si el usuario es estudiante o egresado
  const esEstudianteOEgresado = [
    "estudiante",
    "egresado",
    "activo",
    "graduado",
    "finalizado",
    "estudiando",
    "empresa",
  ].includes((usuario.estado_estudios || "").trim().toLowerCase());

  // ✅ Permitir ver en modo lectura aunque no sea estudiante/egresado
  if (!esEstudianteOEgresado && !soloLectura) return null;

  const validarUrl = (u: string) => /^https:\/\/.+/i.test(u);

  const agregarEnlace = async (tipo: string, url: string, isPredefinido = false) => {
    if (soloLectura) return;
    if (!validarUrl(url)) {
      modal.alerta({ titulo: "Error", mensaje: "La URL debe comenzar con https://" });
      return;
    }

    try {
      const { data } = await axios.post("/perfil/plataformas", { tipo, url });
      setEnlaces(data.plataformas);
      modal.alerta({ titulo: "Éxito", mensaje: data.mensaje });
      if (isPredefinido) {
        setUrlsPredefinidas((prev) => ({ ...prev, [tipo]: "" }));
      } else {
        setTipo("");
        setUrl("");
      }
    } catch (error: any) {
      modal.alerta({
        titulo: "Error",
        mensaje: error.response?.data?.error || "Error desconocido",
      });
    }
  };

  const eliminarEnlace = async (id: number) => {
    if (soloLectura) return;
    const confirm = await modal.confirmacion({
      titulo: "Confirmar eliminación",
      mensaje: "¿Desea eliminar este enlace?",
    });
    if (!confirm) return;

    try {
      const { data } = await axios.delete(`/perfil/plataformas/${id}`);
      setEnlaces(data.plataformas);
      modal.alerta({ titulo: "Éxito", mensaje: data.mensaje });
    } catch (error: any) {
      modal.alerta({
        titulo: "Error",
        mensaje: error.response?.data?.error || "Error desconocido",
      });
    }
  };

  const tiposPredefinidos = ["LinkedIn", "Instagram", "GitHub"];

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
        Enlaces a plataformas externas
      </h3>

      {/* Solo mostrar formularios si NO está en modo lectura */}
      {!soloLectura && (
        <>
          {/* Campos predefinidos */}
          <div className="space-y-4 mb-6">
            {tiposPredefinidos.map((t) => {
              const deshabilitado = enlaces.some(
                (e) => e.tipo.toLowerCase() === t.toLowerCase()
              );
              return (
                <div key={t} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                  <p>
                    <strong>{t}:</strong>
                  </p>
                  <input
                    type="url"
                    value={urlsPredefinidas[t]}
                    onChange={(e) =>
                      setUrlsPredefinidas((prev) => ({ ...prev, [t]: e.target.value }))
                    }
                    disabled={deshabilitado}
                    className={`mt-1 block w-full rounded border px-3 py-2 shadow-sm ${
                      deshabilitado
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "text-gray-800 border-gray-300 focus:border-[#034991] focus:ring focus:ring-[#034991]/20"
                    }`}
                    placeholder={`https://${t.toLowerCase()}.com/usuario`}
                  />
                  <button
                    type="button"
                    onClick={() => agregarEnlace(t, urlsPredefinidas[t], true)}
                    disabled={deshabilitado}
                    className={`px-4 py-2 rounded shadow font-semibold ${
                      deshabilitado
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#034991] hover:bg-[#0563c1] text-white"
                    }`}
                  >
                    {deshabilitado ? "Agregado" : "Agregar"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Formulario libre */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              agregarEnlace(tipo, url);
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-gray-800"
          >
            <div>
              <p>
                <strong>Tipo:</strong>
              </p>
              <input
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-800 shadow-sm focus:border-[#034991] focus:ring focus:ring-[#034991]/20"
                placeholder="Otro (ej. Twitter)"
                required
                maxLength={50}
              />
            </div>
            <div>
              <p>
                <strong>URL:</strong> (<span className="font-normal">https://</span>)
              </p>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-800 shadow-sm focus:border-[#034991] focus:ring focus:ring-[#034991]/20"
                placeholder="https://ejemplo.com/usuario"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-[#034991] hover:bg-[#0563c1] text-white font-semibold px-4 py-2 rounded shadow"
              >
                Agregar
              </button>
            </div>
          </form>
        </>
      )}

      {/* Lista de enlaces (siempre visible) */}
      <ul className="mt-6 space-y-2">
        {enlaces.length === 0 && (
          <li className="text-gray-400 italic">No hay enlaces agregados.</li>
        )}
        {enlaces.map((e) => (
          <li
            key={e.id_plataforma}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div>
              <p className="font-semibold text-gray-800">{e.tipo}</p>
              <a
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {e.url}
              </a>
            </div>
            {!soloLectura && (
              <button
                onClick={() => eliminarEnlace(e.id_plataforma)}
                className="bg-[#CD1719] hover:bg-[#a21514] text-white px-3 py-1 rounded"
              >
                Eliminar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
