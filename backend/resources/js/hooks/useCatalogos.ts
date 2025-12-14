import { useEffect, useState } from "react";
import axios from "axios";

/** --------------------------
 * Tipos
 ---------------------------*/
export type Catalogo = {
  universidades: any[];
  carreras: any[];
  areasLaborales: any[];
  paises: any[];
  provincias: any[];
  cantones: any[];
  generos: { id: string; nombre: string }[];
  estadosEstudios: { id: string; nombre: string }[];
  nivelesAcademicos: { id: string; nombre: string }[];
  estadosEmpleo: { id: string; nombre: string }[];
  rangosSalariales: { id: string; nombre: string }[];
  tiposEmpleo: { id: string; nombre: string }[];
};

/** --------------------------
 * Hook principal para reportes
 ---------------------------*/
export function useCatalogos() {
  const [catalogos, setCatalogos] = useState<Catalogo>({
    universidades: [],
    carreras: [],
    areasLaborales: [],
    paises: [],
    provincias: [],
    cantones: [],
    generos: [
      { id: "masculino", nombre: "Masculino" },
      { id: "femenino", nombre: "Femenino" },
      { id: "otro", nombre: "Otro" },
    ],
    estadosEstudios: [
      { id: "activo", nombre: "Activo" },
      { id: "pausado", nombre: "Pausado" },
      { id: "finalizado", nombre: "Finalizado" },
    ],
    nivelesAcademicos: [
      { id: "Diplomado", nombre: "Diplomado" },
      { id: "Bachillerato", nombre: "Bachillerato" },
      { id: "Licenciatura", nombre: "Licenciatura" },
      { id: "Maestría", nombre: "Maestría" },
      { id: "Doctorado", nombre: "Doctorado" },
    ],
    estadosEmpleo: [
      { id: "empleado", nombre: "Empleado" },
      { id: "desempleado", nombre: "Desempleado" },
    ],
    rangosSalariales: [
      { id: "<300000", nombre: "Menor a ₡300,000" },
      { id: "300000-600000", nombre: "₡300,000 - ₡600,000" },
      { id: "600000-1000000", nombre: "₡600,000 - ₡1,000,000" },
      { id: ">1000000", nombre: "Mayor a ₡1,000,000" },
    ],
    tiposEmpleo: [
      { id: "Tiempo completo", nombre: "Tiempo completo" },
      { id: "Medio tiempo", nombre: "Medio tiempo" },
      { id: "Temporal", nombre: "Temporal" },
      { id: "Independiente", nombre: "Independiente" },
      { id: "Práctica", nombre: "Práctica" },
    ],
  });

  /** Cargar catálogos desde backend */
  // hooks/useCatalogos.ts (reemplaza la parte donde haces setCatalogos)
useEffect(() => {
  let activo = true;

  const cargarCatalogos = async () => {
    try {
      const respuesta = await axios.get("/reportes/catalogos");
      const datos = respuesta.data?.success ? respuesta.data : respuesta.data;

      if (!activo) return;

      // Normalizador: garantiza propiedades consistentes y tipos string
      const norm = {
        universidades: (datos.universidades ?? []).map((u: any) => ({
          id: String(u.id ?? u.id_universidad ?? u.id_univ ?? ""),
          nombre: u.nombre ?? u.nombre_universidad ?? "",
        })),
        carreras: (datos.carreras ?? []).map((c: any) => ({
          id: String(c.id ?? c.id_carrera ?? ""),
          nombre: c.nombre ?? "",
          universidadId: String(c.id_universidad ?? c.universidad_id ?? c.universidadId ?? ""),
        })),
        paises: (datos.paises ?? []).map((p: any) => ({
          id: String(p.id ?? p.id_pais ?? ""),
          nombre: p.nombre ?? "",
        })),
        provincias: (datos.provincias ?? []).map((p: any) => ({
          id: String(p.id ?? p.id_provincia ?? ""),
          nombre: p.nombre ?? "",
          paisId: String(p.id_pais ?? p.pais_id ?? ""),
        })),
        cantones: (datos.cantones ?? []).map((c: any) => ({
          id: String(c.id ?? c.id_canton ?? ""),
          nombre: c.nombre ?? "",
          provinciaId: String(c.id_provincia ?? c.provincia_id ?? ""),
        })),
        areasLaborales: (datos.areasLaborales ?? []).map((a: any) => ({
          id: String(a.id ?? a.id_area_laboral ?? ""),
          nombre: a.nombre ?? "",
        })),
        // mantén los catálogos fijos tal como estaban
        generos: datos.generos ?? [
          { id: "masculino", nombre: "Masculino" },
          { id: "femenino", nombre: "Femenino" },
          { id: "otro", nombre: "Otro" },
        ],
        estadosEstudios: datos.estadosEstudios ?? [
          { id: "activo", nombre: "Activo" },
          { id: "pausado", nombre: "Pausado" },
          { id: "finalizado", nombre: "Finalizado" },
        ],
        nivelesAcademicos: datos.nivelesAcademicos ?? [
          { id: "Diplomado", nombre: "Diplomado" },
          { id: "Bachillerato", nombre: "Bachillerato" },
          { id: "Licenciatura", nombre: "Licenciatura" },
          { id: "Maestría", nombre: "Maestría" },
          { id: "Doctorado", nombre: "Doctorado" },
        ],
        estadosEmpleo: datos.estadosEmpleo ?? [
          { id: "empleado", nombre: "Empleado" },
          { id: "desempleado", nombre: "Desempleado" },
        ],
        rangosSalariales: datos.rangosSalariales ?? [
          { id: "<300000", nombre: "Menor a ₡300,000" },
          { id: "300000-600000", nombre: "₡300,000 - ₡600,000" },
          { id: "600000-1000000", nombre: "₡600,000 - ₡1,000,000" },
          { id: ">1000000", nombre: "Mayor a ₡1,000,000" },
        ],
        tiposEmpleo: datos.tiposEmpleo ?? [
          { id: "Tiempo completo", nombre: "Tiempo completo" },
          { id: "Medio tiempo", nombre: "Medio tiempo" },
          { id: "Temporal", nombre: "Temporal" },
          { id: "Independiente", nombre: "Independiente" },
          { id: "Práctica", nombre: "Práctica" },
        ],
      };

      setCatalogos((prev) => ({ ...prev, ...norm }));
    } catch (error) {
      console.error("Error cargando catálogos:", error);
    }
  };

  cargarCatalogos();
  return () => {
    activo = false;
  };
}, []);


  return { catalogos, setCatalogos };
}
