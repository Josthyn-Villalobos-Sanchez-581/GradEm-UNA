import React, { useState, useEffect } from "react";
import { Catalogo } from "@/hooks/useCatalogos";
import { ParametrosReporte } from "@/hooks/useParametrosReporte";


interface Props {
  catalogos: Catalogo;
  filtros: any;
  actualizarFiltros: any;
  setErroresGlobales: any;
  mostrarFiltro: (campo: string) => boolean; // 👈 nuevo
}


export default function ReportesFiltros({
  catalogos,
  filtros,
  actualizarFiltros,
  setErroresGlobales,
  mostrarFiltro,   // 👈 Agregar aquí
}: Props) {
  const limitarAño = (value: string) => {
    const soloNumeros = value.replace(/\D/g, "");
    return soloNumeros.slice(0, 4);
  };
  const [errores, setErrores] = useState({
    fechaInicio: "",
    fechaFin: "",
  });

  // ---------------------------------------
  // 🌐 FILTRADOS DEPENDIENTES
  // ---------------------------------------
  const carrerasFiltradas = filtros.universidadId ? catalogos.carreras.filter((c) => c.id_universidad === Number(filtros.universidadId)) : [];
  const ANO_MIN = 2007;
  const ANO_MAX = new Date().getFullYear();

  const provinciasFiltradas = filtros.paisId ? catalogos.provincias.filter((p) => p.id_pais === Number(filtros.paisId)) : [];
  const cantonesFiltrados = filtros.provinciaId ? catalogos.cantones.filter((c) => c.id_provincia === Number(filtros.provinciaId)) : [];

  // ---------------------------------------
  // 🔁 RESET AUTOMÁTICO DE FILTROS HIJOS
  // ---------------------------------------
  const actualizarConResets = (campo: keyof ParametrosReporte, valor: any) => {
    actualizarFiltros(campo, valor);

    if (campo === "universidadId") {
      actualizarFiltros("carreraId", "");
    }
    if (campo === "paisId") {
      actualizarFiltros("provinciaId", "");
      actualizarFiltros("cantonId", "");
    }
    if (campo === "provinciaId") {
      actualizarFiltros("cantonId", "");
    }
  };

  // ---------------------------------------
  // 🔍 VALIDACIÓN DE AÑOS
  // ---------------------------------------
  useEffect(() => {
    const nuevosErrores = { fechaInicio: "", fechaFin: "" };

    const inicio = filtros.fechaInicio ? Number(filtros.fechaInicio) : null;
    const fin = filtros.fechaFin ? Number(filtros.fechaFin) : null;

    if (inicio !== null) {
      if (inicio < ANO_MIN) {
        nuevosErrores.fechaInicio = "El año de inicio debe ser 2007 o mayor.";
      } else if (inicio > ANO_MAX) {
        nuevosErrores.fechaInicio = "El año de inicio no puede ser mayor que el año actual.";
      }
    }

    if (fin !== null) {
      if (fin < ANO_MIN) {
        nuevosErrores.fechaFin = "El año de fin debe ser 2007 o mayor.";
      } else if (fin > ANO_MAX) {
        nuevosErrores.fechaFin = "El año de fin no puede ser mayor que el año actual.";
      } else if (inicio !== null && fin < inicio) {
        nuevosErrores.fechaFin = "El año de fin no puede ser menor que el año de inicio.";
      }
    }

    setErrores(nuevosErrores);

    const hayErrores =
      nuevosErrores.fechaInicio !== "" || nuevosErrores.fechaFin !== "";

    setErroresGlobales(hayErrores);
  }, [filtros.fechaInicio, filtros.fechaFin]);



  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
      <h2 className="text-lg font-bold text-[#034991] mb-4">
        Filtros de búsqueda
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* UNIVERSIDAD */}
        {mostrarFiltro("universidadId") && (
          <div className="flex flex-col" key="filtro-universidad">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              Universidad
            </label>
            <select
              className="h-11 border rounded-lg px-3 bg-gray-50"
              value={filtros.universidadId ?? ""}
              onChange={(e) =>
                actualizarConResets("universidadId", e.target.value)
              }
            >
              <option value="" key="uni-default">Seleccione</option>
              {catalogos.universidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* CARRERA */}
        {mostrarFiltro("carreraId") && (
          <div className="flex flex-col" key="filtro-carrera">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              Carrera
            </label>
            <select
              className="h-11 border rounded-lg px-3 bg-gray-50 disabled:bg-gray-200"
              disabled={!filtros.universidadId}
              value={filtros.carreraId ?? ""}
              onChange={(e) =>
                actualizarConResets("carreraId", Number(e.target.value))
              }
            >
              <option value="" key="carrera-default">
                {filtros.universidadId ? "Seleccione" : "Seleccione universidad"}
              </option>
              {carrerasFiltradas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        )}


        {/* PAÍS */}
        {mostrarFiltro("paisId") && (
          <div className="flex flex-col" key="filtro-pais">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              País
            </label>
            <select
              className="h-11 border rounded-lg px-3 bg-gray-50"
              value={filtros.paisId ?? ""}
              onChange={(e) => {
                actualizarConResets("paisId", e.target.value)
              }}
            >
              <option value="" key="pais-default">Seleccione</option>
              {catalogos.paises.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* PROVINCIA */}
        {mostrarFiltro("provinciaId") && (
          <div className="flex flex-col" key="filtro-provincia">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              Provincia
            </label>
            <select
              disabled={!filtros.paisId}
              value={filtros.provinciaId ?? ""}
              onChange={(e) => actualizarConResets("provinciaId", e.target.value)}
              className="h-11 border rounded-lg px-3 bg-gray-50"
            >
              <option value="">
                {filtros.paisId ? "Seleccione" : "Seleccione país"}
              </option>

              {provinciasFiltradas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* CANTÓN */}
        {mostrarFiltro("cantonId") && (
          <div className="flex flex-col" key="filtro-canton">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              Cantón
            </label>
            <select
              className="h-11 border rounded-lg px-3 bg-gray-50 disabled:bg-gray-200"
              disabled={!filtros.provinciaId}
              value={filtros.cantonId ?? ""}
              onChange={(e) => {
                const valor = e.target.value === "" ? null : Number(e.target.value);
                actualizarConResets("cantonId", e.target.value)
              }}
            >
              <option value="" key="canton-default">
                {filtros.provinciaId ? "Seleccione" : "Seleccione provincia"}
              </option>
              {cantonesFiltrados.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ------------ AÑO INICIO ------------ */}
        {mostrarFiltro("fechaInicio") && (
          <div className="flex flex-col" key="filtro-anio-inicio">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              Año inicio
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              className="h-11 border rounded-lg px-3 bg-gray-50 hover:bg-gray-100 transition"
              value={filtros.fechaInicio ?? ""}
              onChange={(e) => {
                const valor = limitarAño(e.target.value);
                actualizarFiltros("fechaInicio", valor ? Number(valor) : null);
              }}
            />
            {errores.fechaInicio && (
              <p className="text-red-500 text-xs mt-1">{errores.fechaInicio}</p>
            )}
          </div>
        )}

        {/* ------------ AÑO FIN ------------ */}
        {mostrarFiltro("fechaFin") && (
          <div className="flex flex-col" key="filtro-anio-fin">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              Año fin
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              className="h-11 border rounded-lg px-3 bg-gray-50 hover:bg-gray-100 transition"
              value={filtros.fechaFin ?? ""}
              onChange={(e) => {
                const valor = limitarAño(e.target.value);
                actualizarFiltros("fechaFin", valor ? Number(valor) : null);
              }}
            />
            {errores.fechaFin && (
              <p className="text-red-500 text-xs mt-1">{errores.fechaFin}</p>
            )}
          </div>
        )}

        {/* ------------ AREA LABORAL ------------ */}
        {mostrarFiltro("areaLaboralId") && (
          <div className="flex flex-col" key="filtro-area-laboral">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              Área laboral
            </label>
            <select
              className="h-11 border rounded-lg px-3 bg-gray-50 hover:bg-gray-100 transition"
              value={filtros.areaLaboralId ?? ""}
              onChange={(e) => actualizarFiltros("areaLaboralId", Number(e.target.value))}
            >
              <option value="" key="area-default">Todas</option>
              {catalogos.areasLaborales.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ------------ GÉNERO ------------ */}
        {mostrarFiltro("genero") && (
          <div className="flex flex-col" key="filtro-genero">
            <label className="font-semibold text-sm text-gray-700 mb-1">Género</label>
            <select
              className="h-11 border rounded-lg px-3 bg-gray-50 hover:bg-gray-100 transition"
              value={filtros.genero ?? ""}
              onChange={(e) => actualizarFiltros("genero", e.target.value)}
            >
              <option value="" key="genero-default">Todos</option>
              {catalogos.generos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ------------ ESTADO DE ESTUDIOS ------------ */}
        {mostrarFiltro("estadoEstudios") && (
          <div className="flex flex-col" key="filtro-estado-estudios">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              Estado de estudios
            </label>
            <select
              className="h-11 border rounded-lg px-3 bg-gray-50 hover:bg-gray-100 transition"
              value={filtros.estadoEstudios ?? ""}
              onChange={(e) => actualizarFiltros("estadoEstudios", e.target.value)}
            >
              <option value="" key="estudio-default">Todos</option>
              {catalogos.estadosEstudios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ------------ NIVEL ACADEMICO ------------ */}
        {mostrarFiltro("nivelAcademico") && (
          <div className="flex flex-col" key="filtro-nivel-academico">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              Nivel académico
            </label>
            <select
              className="h-11 border rounded-lg px-3 bg-gray-50 hover:bg-gray-100 transition"
              value={filtros.nivelAcademico ?? ""}
              onChange={(e) => actualizarFiltros("nivelAcademico", e.target.value)}
            >
              <option value="" key="nivel-default">Todos</option>
              {catalogos.nivelesAcademicos.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ------------ ESTADO EMPLEO ------------ */}
        {mostrarFiltro("estadoEmpleo") && (
          <div className="flex flex-col" key="filtro-estado-empleo">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              Estado laboral
            </label>
            <select
              className="h-11 border rounded-lg px-3 bg-gray-50 hover:bg-gray-100 transition"
              value={filtros.estadoEmpleo ?? ""}
              onChange={(e) => actualizarFiltros("estadoEmpleo", e.target.value)}
            >
              <option value="" key="empleo-default">Todos</option>
              {catalogos.estadosEmpleo.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ------------ TIEMPO EMPLEO ------------ */}
        {mostrarFiltro("tiempoEmpleo") && (
          <div className="flex flex-col" key="filtro-tiempo-empleo">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              Tiempo de empleo (meses)
            </label>
            <input
              type="number"
              className="h-11 border rounded-lg px-3 bg-gray-50 hover:bg-gray-100 transition"
              value={filtros.tiempoEmpleo ?? ""}
              onChange={(e) =>
                actualizarFiltros(
                  "tiempoEmpleo",
                  e.target.value ? Number(e.target.value) : null
                )
              }
            />
          </div>
        )}

        {/* ------------ RANGO SALARIAL ------------ */}
        {mostrarFiltro("salario") && (
          <div className="flex flex-col" key="filtro-rango-salarial">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              Rango salarial
            </label>
            <select
              className="h-11 border rounded-lg px-3 bg-gray-50 hover:bg-gray-100 transition"
              value={filtros.salario ?? ""}
              onChange={(e) => actualizarFiltros("salario", e.target.value)}
            >
              <option value="" key="salario-default">Todos</option>
              {catalogos.rangosSalariales.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ------------ TIPO EMPLEO ------------ */}
        {mostrarFiltro("tipoEmpleo") && (
          <div className="flex flex-col" key="filtro-tipo-empleo">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              Tipo de empleo
            </label>
            <select
              className="h-11 border rounded-lg px-3 bg-gray-50 hover:bg-gray-100 transition"
              value={filtros.tipoEmpleo ?? ""}
              onChange={(e) => actualizarFiltros("tipoEmpleo", e.target.value)}
            >
              <option value="" key="tipoEmpleo-default">Todos</option>
              {catalogos.tiposEmpleo.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}