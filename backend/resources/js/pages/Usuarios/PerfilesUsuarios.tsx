import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import PpLayout from "@/layouts/PpLayout";

interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  identificacion: string;
  telefono: string;
  rol: { nombre_rol: string };
  universidad?: { nombre: string };
  carrera?: { nombre: string };
}

interface Props {
  usuarios: Usuario[];
  userPermisos: number[];
}

export default function PerfilesUsuarios({ usuarios }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(usuariosFiltrados.length / itemsPorPagina);

  const usuariosPaginados = usuariosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const cambiarPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  return (
    <>
      <Head title="Perfiles de Usuarios" />
      <div className="w-full p-6 text-gray-900">
        <h2 className="text-2xl font-bold mb-6 text-black">
          Visualización de Usuarios
        </h2>

        {/* Barra de búsqueda */}
        <div className="flex items-center mb-6">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1); // resetear a primera página al buscar
            }}
            className="border border-gray-400 text-gray-700 rounded-lg px-4 py-2 w-full max-w-md focus:outline-none"
          />
        </div>

        {/* Tabla */}
        <div className="w-full overflow-x-auto bg-white p-6 rounded-lg shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-gray-500">Nombre completo</th>
                <th className="px-4 py-2 text-left text-gray-500">Correo</th>
                <th className="px-4 py-2 text-left text-gray-500">Identificación</th>
                <th className="px-4 py-2 text-left text-gray-500">Teléfono</th>
                <th className="px-4 py-2 text-left text-gray-500">Rol</th>
                <th className="px-4 py-2 text-left text-gray-500">Universidad</th>
                <th className="px-4 py-2 text-left text-gray-500">Carrera</th>
                <th className="px-4 py-2 text-center text-gray-500" style={{ minWidth: "150px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosPaginados.map((u) => (
                <tr key={u.id_usuario} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{u.nombre_completo}</td>
                  <td className="px-4 py-2">{u.correo}</td>
                  <td className="px-4 py-2">{u.identificacion}</td>
                  <td className="px-4 py-2">{u.telefono}</td>
                  <td className="px-4 py-2">{u.rol?.nombre_rol}</td>
                  <td className="px-4 py-2">{u.universidad?.nombre ?? "-"}</td>
                  <td className="px-4 py-2">{u.carrera?.nombre ?? "-"}</td>
                  <td className="px-4 py-2 text-center">
                    <Link
                      href={`/usuarios/perfiles/${u.id_usuario}`}
                      className="bg-[#CD1719] hover:bg-red-700 text-white px-3 py-1.5 rounded-lg shadow font-semibold text-sm whitespace-nowrap"
                    >
                      Ver Perfil
                    </Link>
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
                className={`px-3 py-1 rounded ${paginaActual === i + 1 ? "bg-[#CD1719] text-white" : "bg-gray-200 hover:bg-gray-300"}`}
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
    </>
  );
}

PerfilesUsuarios.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};
