import React, { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import { PlusCircle } from "lucide-react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";


interface Item {
  id: number;
  [key: string]: any;
}

interface CatalogoProps {
  paises: Item[];
  provincias: Item[];
  cantones: Item[];
  universidades: Item[];
  carreras: Item[];
  estados: Item[];
  modalidades: Item[];
  idiomas: Item[];
  areas_laborales: Item[];
  userPermisos: number[];
  flash?: { success?: string; error?: string };
  errors?: { error?: string };
}

export default function CatalogoIndex({
  paises,
  provincias,
  cantones,
  universidades,
  carreras,
  estados,
  modalidades,
  idiomas,
  areas_laborales,
  flash,
  errors,
  userPermisos,
}: CatalogoProps) {
  const modal = useModal();

  // ========================= MENSAJES =========================
  useEffect(() => {
    if (flash?.error)
      modal.alerta({ titulo: "Error", mensaje: flash.error });
    if (flash?.success)
      modal.alerta({ titulo: "Éxito", mensaje: flash.success });
    if (errors?.error)
      modal.alerta({ titulo: "Error", mensaje: errors.error });
  }, [flash, errors]);

  // ========================= SECCIONES =========================
  const allSections = [
    "paises",
    "provincias",
    "cantones",
    "universidades",
    "carreras",
    "estados",
    "modalidades",
    "idiomas",
    "areas_laborales",
  ];

  const [sections, setSections] = useState<string[]>([...allSections]);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleClick = (section: string) => {
    setSections((prev) =>
      prev.includes(section)
        ? prev.length > 1
          ? prev.filter((s) => s !== section)
          : prev
        : [...prev, section]
    );
  };

  const handleDoubleClick = (section: string) => {
    setSections([section]);
    setOpenSection(section);
  };

  const mostrarTodas = () => {
    setSections([...allSections]);
    setOpenSection(null);
  };

  // ========================= TABLA =========================
  const TablaCatalogo = ({
    titulo,
    nombreCampo,
    endpoint,
    data,
    camposAdicionales = [],
    relacionesSelect = [] as { name: string; label: string; options: Item[] }[],
  }: {
    titulo: string;
    nombreCampo: string;
    endpoint: string;
    data: Item[];
    camposAdicionales?: { name: string; label: string; placeholder?: string }[];
    relacionesSelect?: { name: string; label: string; options: Item[] }[];
  }) => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [formValues, setFormValues] = useState<Record<string, string>>({});

    const filtered = data.filter((d) =>
      d[nombreCampo]?.toLowerCase().includes(search.toLowerCase())
    );
    const paginated = filtered.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const handleChange = (field: string, value: string) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const startEditing = (item: Item) => {
      setEditingItem(item);
      const values: Record<string, string> = {
        [nombreCampo]: item[nombreCampo],
      };
      camposAdicionales.forEach((c) => {
        values[c.name] = item[c.name] || "";
      });
      relacionesSelect.forEach((r) => {
        values[r.name] = item[r.name] || "";
      });
      setFormValues(values);
    };

    // ========================= GUARDAR =========================
    const guardar = async () => {
      // Validación principal
      if (!formValues[nombreCampo]?.trim()) {
        modal.alerta({
          titulo: "Error",
          mensaje: `Debe ingresar un nombre válido para ${titulo.toLowerCase()}.`,
        });
        return;
      }

      // Validar selects
      for (const rel of relacionesSelect) {
        if (!formValues[rel.name]) {
          modal.alerta({
            titulo: "Error",
            mensaje: `Debe seleccionar ${rel.label}.`,
          });
          return;
        }
      }

      const ok = await modal.confirmacion({
        titulo: editingItem ? "Actualizar registro" : "Agregar nuevo registro",
        mensaje: editingItem
          ? `¿Desea actualizar este ${titulo.toLowerCase()}?`
          : `¿Desea agregar un nuevo ${titulo.toLowerCase()}?`,
      });
      if (!ok) return;

      const payload: Record<string, any> = { ...formValues };
      if (editingItem?.id !== undefined) payload.id = editingItem.id;

      Inertia.post(`/catalogo/${endpoint}`, payload, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          modal.alerta({
            titulo: "Éxito",
            mensaje: editingItem
              ? "Registro actualizado correctamente."
              : "Registro agregado correctamente.",
          });
          setFormValues({});
          setEditingItem(null);
        },
        onError: (error) => {
          modal.alerta({
            titulo: "Error",
            mensaje:
              error?.error ||
              "Ocurrió un error al guardar el registro. Verifique los datos.",
          });
        },
      });
    };

    // ========================= ELIMINAR =========================
    const eliminar = async (id: number) => {
      const ok = await modal.confirmacion({
        titulo: "Eliminar registro",
        mensaje: "¿Está seguro que desea eliminar este elemento?",
      });
      if (!ok) return;

      Inertia.delete(`/catalogo/${endpoint}/${id}`, {
        preserveScroll: true,
        onSuccess: () =>
          modal.alerta({
            titulo: "Éxito",
            mensaje: "Registro eliminado correctamente.",
          }),
        onError: (error) =>
          modal.alerta({
            titulo: "Error",
            mensaje:
              error?.error ||
              "No se pudo eliminar el registro. Verifique dependencias o permisos.",
          }),
      });
    };

    // ========================= RENDER TABLA =========================
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
        <div
          className="flex justify-between items-center p-5 cursor-pointer bg-[#F6F8FA] hover:bg-[#EAF2FB] rounded-t-2xl transition-colors"
          onClick={() =>
            setOpenSection(openSection === titulo ? null : titulo)
          }
        >
          <h2 className="text-xl font-bold text-[#034991]">{titulo}</h2>
          <span className="text-gray-600 text-sm">
            {openSection === titulo ? "▲ Ocultar" : "▼ Mostrar"}
          </span>
        </div>

        {openSection === titulo && (
          <div className="p-5 border-t border-gray-200 space-y-4">
            {/* Formulario */}
            <div className="flex flex-wrap items-end gap-3 border-b pb-3">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  {editingItem
                    ? `Editar ${titulo.slice(0, -1)}`
                    : `Agregar nuevo ${titulo.slice(0, -1)}`}
                </label>
                <input
                  type="text"
                  placeholder={`Nombre del ${titulo
                    .toLowerCase()
                    .slice(0, -1)}`}
                  value={formValues[nombreCampo] || ""}
                  onChange={(e) => handleChange(nombreCampo, e.target.value)}
                  className="border border-gray-300 px-4 py-2 rounded-lg w-72 shadow-sm focus:ring-2 focus:ring-[#034991] focus:outline-none"
                />
              </div>

              {/* Campos adicionales */}
              {camposAdicionales.map((c) => (
                <div key={c.name}>
                  <label className="block text-gray-700 font-medium mb-1">
                    {c.label}
                  </label>
                  <input
                    type="text"
                    placeholder={c.placeholder || c.label}
                    value={formValues[c.name] || ""}
                    onChange={(e) => handleChange(c.name, e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded-lg w-48 shadow-sm focus:ring-2 focus:ring-[#034991] focus:outline-none"
                  />
                </div>
              ))}

              {/* Relaciones select */}
              {relacionesSelect.map((r) => (
                <div key={r.name}>
                  <label className="block text-gray-700 font-medium mb-1">
                    {r.label}
                  </label>
                  <select
                    value={formValues[r.name] || ""}
                    onChange={(e) => handleChange(r.name, e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm"
                  >
                    <option value="">Seleccione {r.label}</option>
                    {r.options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <Button onClick={guardar} className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                {editingItem ? "Actualizar" : "Agregar"}
              </Button>

              {editingItem && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingItem(null);
                    setFormValues({});
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>

            {/* Buscador */}
            <div className="flex justify-between items-center flex-wrap gap-4">
              <input
                type="text"
                placeholder={`🔍 Buscar ${titulo.toLowerCase()}...`}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 px-4 py-2 rounded-lg w-64 shadow-sm focus:ring-2 focus:ring-[#034991]"
              />
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-300 px-3 py-2 rounded-lg shadow-sm"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} por página
                  </option>
                ))}
              </select>
            </div>

            {/* 🔹 Tabla con formato uniforme (idéntico a PerfilesUsuarios) */}
            <div className="w-full overflow-x-auto bg-white p-6 rounded-2xl shadow border border-black mt-3">
              <table className="min-w-full border-separate border-spacing-[0px] rounded-2xl overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-500 border border-gray-300 first:rounded-tl-2xl">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-gray-500 border border-gray-300">
                      Nombre
                    </th>

                    {camposAdicionales.map((c) => (
                      <th key={c.name} className="px-4 py-2 text-left text-gray-500 border border-gray-300">
                        {c.label}
                      </th>
                    ))}

                    {relacionesSelect.map((r, idx) => (
                      <th
                        key={r.name}
                        className={`px-4 py-2 text-left text-gray-500 border border-gray-300 ${idx === relacionesSelect.length - 1 ? "last:rounded-tr-2xl" : ""
                          }`}
                      >
                        {r.label}
                      </th>
                    ))}

                    <th className="px-4 py-2 text-center text-gray-500 border border-gray-300 min-w-[160px] last:rounded-tr-2xl">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          2 + camposAdicionales.length + relacionesSelect.length
                        }
                        className="text-center py-4 text-gray-500 italic border border-gray-300 rounded-b-2xl"
                      >
                        No se encontraron registros.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 ${idx === paginated.length - 1 ? "last-row" : ""
                          }`}
                      >
                        <td
                          className={`px-4 py-2 border border-gray-300 ${idx === paginated.length - 1 ? "rounded-bl-2xl" : ""
                            }`}
                        >
                          {item.id}
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          {item[nombreCampo]}
                        </td>

                        {camposAdicionales.map((c) => (
                          <td key={c.name} className="px-4 py-2 border border-gray-300">
                            {item[c.name] ?? "-"}
                          </td>
                        ))}

                        {relacionesSelect.map((r) => {
                          const related = r.options.find((o) => o.id == item[r.name]);
                          return (
                            <td key={r.name} className="px-4 py-2 border border-gray-300">
                              {related?.nombre || "-"}
                            </td>
                          );
                        })}

                        {/* 🔹 Acciones */}
                        <td
                          className={`px-4 py-2 text-center border border-gray-300 ${idx === paginated.length - 1 ? "rounded-br-2xl" : ""
                            }`}
                        >
                          <div className="flex justify-center gap-2">
                            <Button
                              onClick={() => startEditing(item)}
                              variant="default"
                              size="sm"
                              className="font-semibold"
                            >
                              Editar
                            </Button>

                            <Button
                              onClick={() => eliminar(item.id)}
                              variant="destructive"
                              size="sm"
                              className="font-semibold"
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 🔹 Paginación uniforme */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                <Button
                  type="button"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="default"
                  size="sm"
                >
                  Anterior
                </Button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    type="button"
                    onClick={() => setPage(i + 1)}
                    size="sm"
                    variant={page === i + 1 ? "destructive" : "outline"}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  type="button"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  variant="default"
                  size="sm"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Head title="Gestión de Catálogos" />
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6 text-[#000000]">
        {/* ========================================= */}
        {/* SELECCIÓN DE SECCIONES */}
        {/* ========================================= */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 mb-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-2xl font-bold text-[#034991]">
              Seleccionar Secciones
            </h2>
            <Button
              onClick={mostrarTodas}
              variant="default"
              className="bg-[#034991] hover:bg-[#023b73] text-white font-semibold rounded-full px-5 py-2 transition-all duration-200"
            >
              + Mostrar Todo
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {allSections.map((sec) => {
              const activo = sections.includes(sec);
              return (
                <label
                  key={sec}
                  onClick={() => handleClick(sec)}
                  onDoubleClick={() => handleDoubleClick(sec)}
                  className={`flex items-center gap-3 px-5 py-2 rounded-full border-2 cursor-pointer transition-all duration-200 select-none
            ${activo
                      ? "bg-white border-[#034991] text-[#034991]"
                      : "bg-white border-gray-300 text-gray-700 hover:border-[#034991]/70"
                    }`}
                >
                  <div
                    className={`relative flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200 
              ${activo
                        ? "border-[#034991] bg-[#034991]"
                        : "border-[#034991] bg-white"
                      }`}
                  >
                    {activo && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="white"
                        className="w-3 h-3"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.292a1 1 0 0 1 0 1.416l-7.5 7.5a1 1 0 0 1-1.416 0l-3.5-3.5a1 1 0 0 1 1.416-1.416L8.5 11.086l6.792-6.794a1 1 0 0 1 1.412 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={() => handleClick(sec)}
                    className="hidden"
                  />

                  <span className="font-medium capitalize">
                    {sec.replace("_", " ")}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ========================================= */}
        {/* RENDERIZADO DE TABLAS */}
        {/* ========================================= */}
        {sections.includes("paises") && (
          <TablaCatalogo
            titulo="Países"
            nombreCampo="nombre"
            endpoint="paises"
            data={paises}
          />
        )}
        {sections.includes("provincias") && (
          <TablaCatalogo
            titulo="Provincias"
            nombreCampo="nombre"
            endpoint="provincias"
            data={provincias}
            relacionesSelect={[
              { name: "id_pais", label: "País", options: paises },
            ]}
          />
        )}
        {sections.includes("cantones") && (
          <TablaCatalogo
            titulo="Cantones"
            nombreCampo="nombre"
            endpoint="cantones"
            data={cantones}
            relacionesSelect={[
              { name: "id_provincia", label: "Provincia", options: provincias },
            ]}
          />
        )}
        {sections.includes("universidades") && (
          <TablaCatalogo
            titulo="Universidades"
            nombreCampo="nombre"
            endpoint="universidades"
            data={universidades}
            camposAdicionales={[{ name: "sigla", label: "Sigla" }]}
          />
        )}
        {sections.includes("carreras") && (
          <TablaCatalogo
            titulo="Carreras"
            nombreCampo="nombre"
            endpoint="carreras"
            data={carreras}
            relacionesSelect={[
              { name: "id_universidad", label: "Universidad", options: universidades },
            ]}
          />
        )}
        {sections.includes("estados") && (
          <TablaCatalogo
            titulo="Estados"
            nombreCampo="nombre_estado"
            endpoint="estados"
            data={estados}
          />
        )}
        {sections.includes("modalidades") && (
          <TablaCatalogo
            titulo="Modalidades"
            nombreCampo="nombre"
            endpoint="modalidades"
            data={modalidades}
          />
        )}
        {sections.includes("idiomas") && (
          <TablaCatalogo
            titulo="Idiomas"
            nombreCampo="nombre"
            endpoint="idiomas"
            data={idiomas}
          />
        )}
        {sections.includes("areas_laborales") && (
          <TablaCatalogo
            titulo="Áreas Laborales"
            nombreCampo="nombre"
            endpoint="areas_laborales"
            data={areas_laborales}
          />
        )}

      </div>
    </>
  );
}

CatalogoIndex.layout = (page: React.ReactNode & { props: CatalogoProps }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};