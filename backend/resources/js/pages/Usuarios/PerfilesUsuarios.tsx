import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";
import axios from "axios";
import { useModal } from "@/hooks/useModal";
import PerfilModal from "./PerfilModal"; // Importamos la modal
// backend/resources/js/pages/Usuarios/PerfilesUsuarios.tsx

interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  identificacion: string;
  telefono: string;
  rol: { nombre_rol: string };
  universidad?: { nombre: string };
  carrera?: { nombre: string };
  estado_id: number; // 👈 NUEVO
}

interface Props {
  usuarios: Usuario[];
  userPermisos: number[];
}

export default function PerfilesUsuarios(props: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(props.usuarios);
  const modal = useModal();
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  // Definir un tipo con las claves válidas
  type ColumnaKey =
    | "nombre_completo"
    | "correo"
    | "identificacion"
    | "telefono"
    | "rol"
    | "universidad"
    | "carrera";

  // Estado para las columnas visibles con tipo seguro
  const [columnasVisibles, setColumnasVisibles] = useState<Record<ColumnaKey, boolean>>({
    nombre_completo: true,
    correo: true,
    identificacion: true,
    telefono: true,
    rol: true,
    universidad: true,
    carrera: true,
  });

  // Alternar visibilidad con tipo validado
  const toggleColumna = (columna: ColumnaKey) => {
    setColumnasVisibles((prev) => ({
      ...prev,
      [columna]: !prev[columna],
    }));
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(usuariosFiltrados.length / itemsPorPagina);
  const usuariosPaginados = usuariosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const cambiarPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) setPaginaActual(pagina);
  };

  // ---------- MODAL DE PERFIL ----------
  const [perfilModalOpen, setPerfilModalOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<number | null>(null);

  const abrirPerfilModal = (id: number) => {
    setUsuarioSeleccionado(id);
    setPerfilModalOpen(true);
  };

  return (
    <>
      <Head title="Perfiles de Usuarios" />
      <div className="w-full p-6 text-gray-900">
        <h2 className="text-2xl font-bold mb-6 text-black">
          Visualización de Usuarios
        </h2>

        {/* Filtros de búsqueda */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="border border-gray-400 text-gray-700 rounded-lg px-4 py-2 w-full md:w-1/3 focus:outline-none"
          />

          {/* Checkboxes para mostrar/ocultar columnas */}
          <div className="flex flex-wrap gap-3 bg-gray-50 border border-gray-200 p-3 rounded-md shadow-sm">
            {(Object.entries(columnasVisibles) as [ColumnaKey, boolean][])
              .filter(([col]) => col !== "nombre_completo") // ocultamos el checkbox del nombre
              .map(([col, visible]) => (
                <label key={col} className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={() => toggleColumna(col)}
                    className="mr-2 accent-[#034991]"
                  />
                  {col
                    .replace("_", " ")
                    .replace("correo", "Correo")
                    .replace("identificacion", "Identificación")
                    .replace("telefono", "Teléfono")
                    .replace("rol", "Rol")
                    .replace("universidad", "Universidad")
                    .replace("carrera", "Carrera")}
                </label>
              ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="w-full overflow-x-auto bg-white p-6 rounded-lg shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {columnasVisibles.nombre_completo && (
                  <th className="px-4 py-2 text-left text-gray-500">Nombre completo</th>
                )}
                {columnasVisibles.correo && (
                  <th className="px-4 py-2 text-left text-gray-500">Correo</th>
                )}
                {columnasVisibles.identificacion && (
                  <th className="px-4 py-2 text-left text-gray-500">Identificación</th>
                )}
                {columnasVisibles.telefono && (
                  <th className="px-4 py-2 text-left text-gray-500">Teléfono</th>
                )}
                {columnasVisibles.rol && (
                  <th className="px-4 py-2 text-left text-gray-500">Rol</th>
                )}
                {columnasVisibles.universidad && (
                  <th className="px-4 py-2 text-left text-gray-500">Universidad</th>
                )}
                {columnasVisibles.carrera && (
                  <th className="px-4 py-2 text-left text-gray-500">Carrera</th>
                )}
                <th className="px-4 py-2 text-center text-gray-500" style={{ minWidth: "170px" }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuariosPaginados.map((u) => (
                <tr key={u.id_usuario} className="border-t hover:bg-gray-50">
                  {columnasVisibles.nombre_completo && (
                    <td className="px-4 py-2">{u.nombre_completo}</td>
                  )}
                  {columnasVisibles.correo && <td className="px-4 py-2">{u.correo}</td>}
                  {columnasVisibles.identificacion && (
                    <td className="px-4 py-2">{u.identificacion}</td>
                  )}
                  {columnasVisibles.telefono && <td className="px-4 py-2">{u.telefono}</td>}
                  {columnasVisibles.rol && <td className="px-4 py-2">{u.rol?.nombre_rol}</td>}
                  {columnasVisibles.universidad && (
                    <td className="px-4 py-2">{u.universidad?.nombre ?? "-"}</td>
                  )}
                  {columnasVisibles.carrera && (
                    <td className="px-4 py-2">{u.carrera?.nombre ?? "-"}</td>
                  )}
                  <td className="px-4 py-2 text-center flex justify-center gap-2">
                     {/* BOTÓN VER PERFIL (abre modal) */}
                    <button onClick={() => abrirPerfilModal(u.id_usuario)} className="bg-[#034991] hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shadow font-semibold text-sm whitespace-nowrap">
                      Ver Perfil
                    </button>

                    <button
                      onClick={async () => {
                        // Mostrar modal de confirmación institucional
                        const confirmado = await modal.confirmacion({
                          titulo: u.estado_id === 1 ? "Inactivar cuenta" : "Activar cuenta",
                          mensaje: `¿Está seguro que desea ${
                            u.estado_id === 1 ? "inactivar" : "activar"
                          } la cuenta de ${u.nombre_completo}?`,
                        });

                        if (!confirmado) return;

                        try {
                          const res = await axios.put(`/usuarios/${u.id_usuario}/toggle-estado`);
                          modal.alerta({
                            titulo: "Estado actualizado",
                            mensaje: res.data.message,
                          });

                          // ✅ Actualizamos el estado local de usuarios sin recargar
                          const nuevosUsuarios = usuarios.map((usr) =>
                            usr.id_usuario === u.id_usuario
                              ? { ...usr, estado_id: res.data.nuevo_estado }
                              : usr
                          );
                          // actualiza el estado del listado completo
                          setUsuarios([...nuevosUsuarios]);
                        } catch (err: any) {
                          console.error(err);
                          modal.alerta({
                            titulo: "Error",
                            mensaje: "Ocurrió un error al cambiar el estado del usuario.",
                          });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg shadow font-semibold text-sm whitespace-nowrap ${
                        u.estado_id === 1
                          ? "bg-[#CD1719] hover:bg-red-700 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {u.estado_id === 1 ? "Inactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
              {usuariosPaginados.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Anterior
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => cambiarPagina(i + 1)}
                className={`px-3 py-1 rounded ${
                  paginaActual === i + 1
                    ? "bg-[#CD1719] text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
      {usuarioSeleccionado && (
  <PerfilModal
    usuarioId={usuarioSeleccionado}
    isOpen={perfilModalOpen}
    onClose={() => setPerfilModalOpen(false)}
  />
)}
    </>
  );
}

PerfilesUsuarios.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
