
import React from "react";
import PpLayout from "@/layouts/PpLayout";
import EditarAdministrador from "./EditarAdministrador";
import EditarEstudiante from "./EditarEstudiante";
import EditarEgresado from "./EditarEgresado";
import EditarEmpresa from "./EditarEmpresa";


interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  identificacion: string;
  telefono: string;
  fecha_nacimiento: string;
  genero: string;

  // Estado laboral
  estado_empleo: string;
  tiempo_conseguir_empleo: number | null;
  area_laboral_id: number | null;
  salario_promedio: string | null;
  tipo_empleo: string | null;

  // Estado académico
  estado_estudios: string;
  anio_graduacion: number | null;
  nivel_academico: string | null;

  // Ubicación (forma "id_*")
  id_pais: number | null;
  id_provincia: number | null;
  id_canton: number | null;

  // Posibles campos que vienen del backend con otro nombre (opcional)
  pais_id?: number | null;
  provincia_id?: number | null;
  canton_id?: number | null;

  // Académico
  id_universidad: number | null;
  id_carrera: number | null;
}


interface Empresa {
  id_empresa: number;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  persona_contacto: string | null;
  usuario_id: number;

  id_pais?: number | null;
  id_provincia?: number | null;
  id_canton?: number | null;
}


interface AreaLaboral {
  id: number;
  nombre: string;
}

interface Pais {
  id: number;
  nombre: string;
}

interface Provincia {
  id: number;
  nombre: string;
  id_pais: number;
}

interface Canton {
  id: number;
  nombre: string;
  id_provincia: number;
}

interface Universidad {
  id: number;
  nombre: string;
  sigla: string;
}

interface Carrera {
  id: number;
  nombre: string;
  id_universidad: number;
  area_conocimiento: string;
}

interface Props {
  usuario: Usuario;
  areaLaborales: AreaLaboral[];
  paises: Pais[];
  provincias: Provincia[];
  cantones: Canton[];
  universidades: Universidad[];
  carreras: Carrera[];
  userPermisos: number[];
  rolNombre: string;
  empresa?: Empresa | null | undefined; // ← corregido
}


export default function EditarRouter(props: Props) {
  const rol = props.rolNombre?.toLowerCase();
  const usuarioNormalizado = {
  ...props.usuario,
  id_pais: props.usuario.id_pais ?? props.usuario.pais_id ?? null,
  id_provincia: props.usuario.id_provincia ?? props.usuario.provincia_id ?? null,
  id_canton: props.usuario.id_canton ?? props.usuario.canton_id ?? null,
};

  // Router por rol
  if (rol.toLowerCase() === "empresa") {
    return <EditarEmpresa {...props} />;
  }

  if (rol.toLowerCase() === "estudiante") {
    return <EditarEstudiante {...props} />;
  }

  if (rol.toLowerCase() === "egresado") {
    return <EditarEgresado {...props} />;
  }

  if (rol.toLowerCase() === "administrador del Sistema"|| rol.toLowerCase() === "superusuario" || rol.toLowerCase() === "dirección" || rol.toLowerCase() === "subdirección") {
    return <EditarAdministrador {...props} />;
  }

  // Fallback (rol desconocido)
  return (
    <div className="p-6 text-center text-red-600">
      <h1 className="text-xl font-bold">Rol no reconocido</h1>
      <p>No se puede cargar el formulario de edición.</p>
    </div>
  );
}

EditarRouter.layout = (page: React.ReactNode & { props: Props }) => {
  const permisos = page.props?.userPermisos ?? [];
  return <PpLayout userPermisos={permisos}>{page}</PpLayout>;
};







