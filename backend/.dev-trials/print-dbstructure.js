import { menus } from '#dbms/db-structure.js';

const run = async () => {
  try {
    console.log(JSON.stringify(menus.security['Gestión de Usuarios'], null, 2));
  } catch (e) {
    console.error('err', e?.message || e);
  }
};
run();
