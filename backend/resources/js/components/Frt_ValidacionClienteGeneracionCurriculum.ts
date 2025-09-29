export type ErrorMapa = Record<string, string>;

export function validarPaso(datos: any, paso: number): ErrorMapa {
  const e: ErrorMapa = {};
  if (paso === 1) {
    if (!datos.datosPersonales?.nombreCompleto) e['datosPersonales.nombreCompleto'] = 'Requerido';
    if (!datos.datosPersonales?.correo) e['datosPersonales.correo'] = 'Correo requerido';
  }
  if (paso === 2) {
    (datos.educaciones ?? []).forEach((ed: any, i: number) => {
      if (!ed.institucion) e[`educaciones.${i}.institucion`] = 'Requerido';
      if (!ed.titulo) e[`educaciones.${i}.titulo`] = 'Requerido';
    });
  }
  if (paso === 3) {
    (datos.experiencias ?? []).forEach((ex: any, i: number) => {
      if (!ex.empresa) e[`experiencias.${i}.empresa`] = 'Requerido';
      if (!ex.puesto) e[`experiencias.${i}.puesto`] = 'Requerido';
    });
  }
  return e;
}
