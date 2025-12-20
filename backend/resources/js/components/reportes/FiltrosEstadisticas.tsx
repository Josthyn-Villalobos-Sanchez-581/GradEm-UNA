import React from "react";
import type {
  FiltrosStats,
  TipoOferta,
} from "@/types/estadisticas";

interface Carrera {
  id: number;
  nombre: string;
}

interface Empresa {
  id_empresa: number;
  nombre: string;
}

interface Catalogos {
  carreras: Carrera[];
  empresas: Empresa[];
}

interface Props {
  catalogos: Catalogos;
  filtros: FiltrosStats;
  actualizarFiltros: <K extends keyof FiltrosStats>(
    campo: K,
    valor: FiltrosStats[K]
  ) => void;
  mostrarFiltro: (campo: keyof FiltrosStats) => boolean;
  onAplicar: (filtros: FiltrosStats) => void;
  onLimpiar: () => void;
}

export default function FiltrosEstadisticas({
  catalogos,
  filtros,
  actualizarFiltros,
  mostrarFiltro,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
      <h2 className="text-lg font-bold text-[#034991] mb-4">
        Filtros de búsqueda
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* FECHA INICIO */}
        {mostrarFiltro("fecha_inicio") && (
          <div className="flex flex-col">
            <label className="font-semibold">Fecha inicio</label>
            <input
              type="date"
              value={filtros.fecha_inicio ?? ""}
              onChange={(e) =>
                actualizarFiltros("fecha_inicio", e.target.value || undefined)
              }
            />
          </div>
        )}

        {/* FECHA FIN */}
        {mostrarFiltro("fecha_fin") && (
          <div className="flex flex-col">
            <label className="font-semibold">Fecha fin</label>
            <input
              type="date"
              value={filtros.fecha_fin ?? ""}
              onChange={(e) =>
                actualizarFiltros("fecha_fin", e.target.value || undefined)
              }
            />
          </div>
        )}

        {/* TIPO OFERTA */}
        {mostrarFiltro("tipo_oferta") && (
          <div className="flex flex-col">
            <label className="font-semibold">Tipo de oferta</label>
            <select
              value={filtros.tipo_oferta ?? "todas"}
              onChange={(e) =>
                actualizarFiltros(
                  "tipo_oferta",
                  e.target.value as TipoOferta
                )
              }
            >
              <option value="todas">Todas</option>
              <option value="empleo">Empleo</option>
              <option value="practica">Práctica</option>
            </select>
          </div>
        )}

        {/* CAMPO APLICACIÓN */}
        {mostrarFiltro("campo_aplicacion") && (
          <div className="flex flex-col">
            <label className="font-semibold">Campo de aplicación</label>
            <select
              value={filtros.campo_aplicacion ?? ""}
              onChange={(e) =>
                actualizarFiltros(
                  "campo_aplicacion",
                  e.target.value || undefined
                )
              }
            >
              <option value="">Todos</option>
              {catalogos.carreras.map((c) => (
                <option key={c.id} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* EMPRESA */}
        {mostrarFiltro("empresa") && (
          <div className="flex flex-col">
            <label className="font-semibold">Empresa</label>
            <select
              value={filtros.empresa ?? ""}
              onChange={(e) =>
                actualizarFiltros("empresa", e.target.value || undefined)
              }
            >
              <option value="">Todas</option>
              {catalogos.empresas.map((e) => (
                <option key={e.id_empresa} value={e.id_empresa}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
