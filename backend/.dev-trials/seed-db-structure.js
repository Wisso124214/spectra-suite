import Repository from '#repository/repository.js';
import Validator from '#validator/validator.js';
import { subsystems, menus } from '#dbms/db-structure.js';

// Util: normaliza el objeto menus para usar className en vez de class dentro de method
const normalizeMenus = (menusInput) => {
  const clone = JSON.parse(JSON.stringify(menusInput || {}));

  const fixNode = (node) => {
    if (!node || typeof node !== 'object') return;

    // Opciones al mismo nivel
    if (node.options && typeof node.options === 'object') {
      for (const optName of Object.keys(node.options)) {
        const opt = node.options[optName];
        if (
          opt &&
          typeof opt === 'object' &&
          opt.method &&
          typeof opt.method === 'object'
        ) {
          // Soportar tanto "class" como "className"; renombrar si aplica
          if (opt.method.class && !opt.method.className) {
            opt.method.className = opt.method.class;
          }
        }
      }
    }

    // Recorrer submenús si existen
    if (node.submenus && typeof node.submenus === 'object') {
      for (const sub of Object.keys(node.submenus)) {
        fixNode(node.submenus[sub]);
      }
    }
  };

  for (const subsystem of Object.keys(clone)) {
    const menusLevel1 = clone[subsystem] || {};
    for (const menuName of Object.keys(menusLevel1)) {
      fixNode(menusLevel1[menuName]);
    }
  }
  return clone;
};

// Ejecuta el seeding end-to-end
const run = async () => {
  // Instanciar primero Repository para que el singleton DBMS sea la subclase con todos los métodos
  const repository = new Repository();
  const dbms = repository; // Reusar como DBMS genérico

  // Conectar validador (algunos métodos lo usan)
  const validator = new Validator(dbms);
  dbms.validator = validator;

  // Cargar queries nombradas desde config
  await dbms.init();

  try {
    const doReset = process.argv.includes('--reset');
    const doCheck = process.argv.includes('--check-permissions');
    if (doReset) {
      console.log('==> Reset: eliminando Menus/Options/Profiles…');
      const delMOP = await repository.delAllMenusOptionsProfiles();
      if (delMOP?.message) console.log('Reset MOP:', delMOP.message);

      console.log(
        '==> Reset: eliminando Subsystems/Classes/Methods/Transactions…'
      );
      const delSCM = await repository.delAllSubsystemsClassesMethods();
      if (delSCM?.message) console.log('Reset SCM:', delSCM.message);

      console.log(
        '==> Reset: eliminando todas las transacciones (tabla transaction)…'
      );
      const delTX = await repository.delAllTxTransaction({
        confirmDelete: 'DELETE_ALL_TRANSACTION',
      });
      if (delTX?.message) console.log('Reset TX:', delTX.message);
    }
    console.log(
      '==> Insertando subsistemas/clases/métodos desde db-structure…'
    );
    const resSCM = await repository.setSubsystemsClassesMethods(subsystems);
    if (resSCM?.message) console.log('SCM:', resSCM.message);

    console.log('==> Insertando menús/opciones/perfiles desde db-structure…');
    const menusNormalized = normalizeMenus(menus);
    const resMOP = await repository.setMenusOptionsProfiles(menusNormalized);
    if (resMOP?.message) console.log('MOP:', resMOP.message);

    console.log('==> Verificando inserciones…');
    const scmRows = await repository.getSubsystemsClassesMethods();
    const mopRows = await repository.getMenusOptionsProfiles();

    console.log(
      `Total Subsystems/Classes/Methods: ${Array.isArray(scmRows) ? scmRows.length : 0}`
    );
    console.log(Array.isArray(scmRows) ? scmRows.slice(0, 10) : []);

    console.log(
      `Total Menu/Option/Profile: ${Array.isArray(mopRows) ? mopRows.length : 0}`
    );
    console.log(Array.isArray(mopRows) ? mopRows.slice(0, 10) : []);

    console.log('✅ Seeding y verificación completados.');

    if (doCheck) {
      console.log('==> Chequeando permisos (method_profile y Security)…');
      const countRes = await repository.query({
        query: 'SELECT COUNT(*)::int AS c FROM public."method_profile";',
        params: [],
      });
      const total = countRes?.rows?.[0]?.c ?? 0;
      console.log(`[CHECK] method_profile total: ${total}`);

      const sampleRes = await repository.query({
        query: `
          SELECT m.name AS method, p.name AS profile
          FROM public."method_profile" mp
          JOIN public."method" m ON mp.id_method = m.id
          JOIN public."profile" p ON mp.id_profile = p.id
          ORDER BY m.name, p.name
          LIMIT 10;
        `,
        params: [],
      });
      console.log('[CHECK] Muestra method_profile (máx 10):');
      console.log(sampleRes?.rows || []);

      const { default: Security } = await import('#security/security.js');
      const security = new Security();
      const map = await security.loadPermissions();
      const size = Object.keys(map || {}).length;
      console.log(`[CHECK] Security.loadPermissions claves: ${size}`);
      console.log(
        '[CHECK] Muestra (10):',
        Object.entries(map || {}).slice(0, 10)
      );
    }
  } catch (error) {
    console.error(
      '❌ Error durante el seeding/verificación:',
      error?.message || error,
      error
    );
  }
};

// Permite ejecutar directamente: node .dev-trials/seed-db-structure.js [--reset]
run();
