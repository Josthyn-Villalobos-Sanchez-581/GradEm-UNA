import React from "react";
import type { FiltrosStats, TipoOferta } from "@/types/estadisticas";

interface CatalogoItem {
  id: number;
  nombre: string;
}

interface Catalogos {
  carreras: CatalogoItem[];
  empresas: CatalogoItem[];
}

interface Props {
  catalogos: Catalogos;
  filtros: FiltrosStats;
  actualizarFiltros: <K extends keyof FiltrosStats>(
    campo: K,
    valor: FiltrosStats[K]
  ) => void;
}

const MIN_FECHA = "2007-01-01";

const MAX_FECHA = `${new Date().getFullYear() + 1}-12-31`;

export default function FiltrosEstadisticas({
  catalogos,
  filtros,
  actualizarFiltros,
}: Props) {
    return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
      <h2 className="text-lg font-bold text-[#034991] mb-6">
        Filtros de búsqueda
      </h2>

      {/* CONTENEDOR VERTICAL (SIDEBAR FRIENDLY) */}
      <div className="flex flex-col gap-5">

        {/* FECHA INICIO */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Fecha inicio
          </label>
          <input
            type="date"
            min={MIN_FECHA}
            max={MAX_FECHA}
            inputMode="none"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 bg-white
                      focus:outline-none focus:ring-2 focus:ring-[#034991]/30"
            value={filtros.fecha_inicio ?? ""}
            onKeyDown={(e) => e.preventDefault()}
            onFocus={(e) => {
              const input = e.currentTarget as HTMLInputElement;
              if (input.showPicker) {
                input.showPicker();
              }
            }}
            onChange={(e) =>
              actualizarFiltros("fecha_inicio", e.target.value || null)
            }
          />
        </div>

        {/* FECHA FIN */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Fecha fin
          </label>
          <input
            type="date"
            min={MIN_FECHA}
            max={MAX_FECHA}
            inputMode="none"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 bg-white
                      focus:outline-none focus:ring-2 focus:ring-[#034991]/30"
            value={filtros.fecha_fin ?? ""}
            onKeyDown={(e) => e.preventDefault()}
            onFocus={(e) => {
              const input = e.currentTarget as HTMLInputElement;
              if (input.showPicker) {
                input.showPicker();
              }
            }}
            onChange={(e) =>
              actualizarFiltros("fecha_fin", e.target.value || null)
            }
          />
        </div>

        {/* TIPO OFERTA */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Tipo de oferta
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 bg-white
                      focus:outline-none focus:ring-2 focus:ring-[#034991]/30"
            value={filtros.tipo_oferta ?? ""}
            onChange={(e) =>
              actualizarFiltros(
                "tipo_oferta",
                e.target.value === "" ? null : (e.target.value as TipoOferta)
              )
            }
          >
            <option value="">Todas</option>
            <option value="empleo">Empleo</option>
            <option value="practica">Práctica</option>
          </select>
        </div>

        {/* CAMPO APLICACIÓN */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Campo de aplicación
          </label>
          <select
            value={filtros.carrera === null ? "" : String(filtros.carrera)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            onChange={(e) =>
              actualizarFiltros(
                "carrera",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
          >
            <option value="">Todos</option>
            {catalogos.carreras.map((c) => (
              <option key={`carrera-${c.id}`} value={String(c.id)}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* EMPRESA */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Empresa
          </label>
          <select
            value={filtros.empresa === null ? "" : String(filtros.empresa)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            onChange={(e) =>
              actualizarFiltros(
                "empresa",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
          >
            <option value="">Todas</option>
            {catalogos.empresas.map((e) => (
              <option key={`empresa-${e.id}`} value={String(e.id)}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
