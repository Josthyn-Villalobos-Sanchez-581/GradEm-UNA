import React, { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import { PlusCircle } from "lucide-react";
import PpLayout from "@/layouts/PpLayout";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";

interface Item {
  id: number;
  nombre: string;
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

  // ==========================
  // MENSAJES DEL BACKEND
  // ==========================
  useEffect(() => {
    if (flash?.error) modal.alerta({ titulo: "Error", mensaje: flash.error });
    if (flash?.success) modal.alerta({ titulo: "Éxito", mensaje: flash.success });
    if (errors?.error) modal.alerta({ titulo: "Error", mensaje: errors.error });
  }, [flash, errors]);

  // ==========================
  // SECCIONES
  // ==========================
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

  // Checkbox + doble clic
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

  // ==========================
  // COMPONENTE TABLA
  // ==========================
  const TablaCatalogo = ({
    titulo,
    nombreCampo,
    endpoint,
    data,
  }: {
    titulo: string;
    nombreCampo: string;
    endpoint: string;
    data: Item[];
  }) => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [nombreNuevo, setNombreNuevo] = useState("");

    const filtered = data.filter((d) =>
      d[nombreCampo]?.toLowerCase().includes(search.toLowerCase())
    );
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const guardar = async () => {
      if (!nombreNuevo.trim()) {
        modal.alerta({
          titulo: "Error",
          mensaje: "Debe ingresar un nombre válido.",
        });
        return;
      }

      const ok = await modal.confirmacion({
        titulo: editingItem ? "Actualizar registro" : "Agregar nuevo",
        mensaje: editingItem
          ? `¿Desea actualizar este ${titulo.toLowerCase()}?`
          : `¿Desea agregar un nuevo ${titulo.toLowerCase()}?`,
      });
      if (!ok) return;

      const payload: Record<string, any> = { nombre: nombreNuevo };
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
          setNombreNuevo("");
          setEditingItem(null);
        },
      });
    };

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
      });
    };

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
            {/* Formulario Inline */}
            <div className="flex flex-wrap items-end gap-3 border-b pb-3">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  {editingItem
                    ? `Editar ${titulo.slice(0, -1)}`
                    : `Agregar nuevo ${titulo.slice(0, -1)}`}
                </label>
                <input
                  type="text"
                  placeholder={`Nombre del ${titulo.toLowerCase().slice(0, -1)}`}
                  value={nombreNuevo}
                  onChange={(e) => setNombreNuevo(e.target.value)}
                  className="border border-gray-300 px-4 py-2 rounded-lg w-72 shadow-sm focus:ring-2 focus:ring-[#034991] focus:outline-none"
                />
              </div>
              <Button
                onClick={guardar}
                variant="default"
                size="default"
                className="flex items-center gap-2 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                {editingItem ? "Actualizar" : "Agregar"}
              </Button>
              {editingItem && (
                <Button
                  onClick={() => {
                    setEditingItem(null)
                    setNombreNuevo("")
                  }}
                  variant="secondary"
                  size="default"
                  className="transition-colors"
                >
                  Cancelar
                </Button>
              )}
            </div>

            {/* Buscador y tabla */}
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

            {/* Tabla */}
            <div className="overflow-auto max-h-96 rounded-lg border border-gray-200 mt-3">
              <table className="w-full text-left">
                <thead className="bg-[#A7A7A9] text-white uppercase text-sm">
                  <tr>
                    <th className="px-5 py-3 font-semibold">ID</th>
                    <th className="px-5 py-3 font-semibold">Nombre</th>
                    <th className="px-5 py-3 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-4 text-gray-500 italic"
                      >
                        No se encontraron registros.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-[#E8EEF7] transition-colors border-b last:border-none"
                      >
                        <td className="px-5 py-3">{item.id}</td>
                        <td className="px-5 py-3">{item[nombreCampo]}</td>
                        <td className="px-5 py-3 flex justify-center gap-3">
                          <Button
                            onClick={() => {
                              setEditingItem(item)
                              setNombreNuevo(item[nombreCampo])
                            }}
                            variant="default"
                            size="sm"
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => eliminar(item.id)}
                            variant="destructive"
                            size="sm"
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex justify-center gap-2 mt-5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  size="sm"
                  variant={pageNum === page ? "default" : "outline"}
                >
                  {pageNum}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================
  // RENDERIZADO PRINCIPAL
  // ==========================
  return (
    <>
      <Head title="Gestión de Catálogos" />
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6 text-[#000000]">
        {/* SELECCIÓN DE SECCIONES */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 mb-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-2xl font-bold text-[#034991]">Seleccionar Secciones</h2>
            <Button
              onClick={mostrarTodas}
              variant="default"
              size="default"
              className="transition-colors"
            >
              Mostrar Todo
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            {allSections.map((sec) => (
              <label
                key={sec}
                onClick={() => handleClick(sec)}
                onDoubleClick={() => handleDoubleClick(sec)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                  sections.includes(sec)
                    ? "bg-[#BEE3F8] border-[#034991]"
                    : "border-gray-300 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={sections.includes(sec)}
                  onChange={() => handleClick(sec)}
                  className="w-4 h-4 accent-[#034991]"
                />
                <span className="font-medium capitalize">{sec.replace("_", " ")}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SECCIONES */}
        {sections.includes("paises") && (
          <TablaCatalogo titulo="Países" nombreCampo="nombre" endpoint="paises" data={paises} />
        )}
        {sections.includes("provincias") && (
          <TablaCatalogo titulo="Provincias" nombreCampo="nombre" endpoint="provincias" data={provincias} />
        )}
        {sections.includes("cantones") && (
          <TablaCatalogo titulo="Cantones" nombreCampo="nombre" endpoint="cantones" data={cantones} />
        )}
        {sections.includes("universidades") && (
          <TablaCatalogo titulo="Universidades" nombreCampo="nombre" endpoint="universidades" data={universidades} />
        )}
        {sections.includes("carreras") && (
          <TablaCatalogo titulo="Carreras" nombreCampo="nombre" endpoint="carreras" data={carreras} />
        )}
        {sections.includes("estados") && (
          <TablaCatalogo titulo="Estados" nombreCampo="nombre_estado" endpoint="estados" data={estados} />
        )}
        {sections.includes("modalidades") && (
          <TablaCatalogo titulo="Modalidades" nombreCampo="nombre_modalidad" endpoint="modalidades" data={modalidades} />
        )}
        {sections.includes("idiomas") && (
          <TablaCatalogo titulo="Idiomas" nombreCampo="nombre" endpoint="idiomas" data={idiomas} />
        )}
        {sections.includes("areas_laborales") && (
          <TablaCatalogo titulo="Áreas Laborales" nombreCampo="nombre" endpoint="areas-laborales" data={areas_laborales} />
        )}
      </div>
    </>
  );
}

CatalogoIndex.layout = (page: React.ReactNode & { props: CatalogoProps }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};

