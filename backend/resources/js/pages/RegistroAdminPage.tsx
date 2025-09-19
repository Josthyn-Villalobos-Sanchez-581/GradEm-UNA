import React from 'react';
import FormularioRegistroAdmin from '../components/FormularioRegistroAdmin';
import PpLayout from '../layouts/PpLayout';

const RegistroAdminPage: React.FC = () => {
  // Puedes cambiar los números según los permisos que quieras probar
  const permisosPrueba = [1, 2, 3, 4, 5, 6, 7];

  return (
    <PpLayout userPermisos={permisosPrueba}>
      <FormularioRegistroAdmin />
    </PpLayout>
  );
};

export default RegistroAdminPage;

