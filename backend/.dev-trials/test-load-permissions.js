import Security from '#security/security.js';
import DBMS from '#dbms/dbms.js';
import Config from '#config/config.js';

const ok = (msg, data) => console.log('\u2705', msg, data ?? '');
const fail = (msg, err) => {
  console.error('\u274c', msg, err?.message || err || '');
  process.exitCode = 1;
};

(async () => {
  try {
    const dbms = new DBMS();
    if (!dbms.queries) await dbms.init();

    const security = new Security();
    const map = await security.loadPermissions();

    const size = Object.keys(map || {}).length;
    ok('Mapa de permisos cargado (total claves)', size);
    const sampleEntries = Object.entries(map || {}).slice(0, 10);
    console.log('[muestra]', sampleEntries);

    // Verificación cruzada de un permiso conocido de la semilla
    const cfg = new Config();
    const PROFILES = await cfg.getProfiles();
    const SECURITY_ADMIN_NAME =
      PROFILES.SECURITY_ADMIN?.name || 'administrador de seguridad';

    const refs = await dbms.executeNamedQuery({
      nameQuery: 'resolveMethodPermissionRefs',
      params: {
        subsystem_name: 'security',
        class_name: 'dbms',
        method_name: 'query',
        profile_name: SECURITY_ADMIN_NAME,
      },
    });
    const r = refs?.rows?.[0] || {};
    const key = `${r.id_subsystem}_${r.id_class}_${r.id_method}_${r.id_profile}`;

    if (!r.id_subsystem || !r.id_class || !r.id_method || !r.id_profile) {
      throw new Error(
        'No se pudieron resolver IDs para la tupla esperada (security/dbms/query + SECURITY_ADMIN)'
      );
    }

    if (!Object.prototype.hasOwnProperty.call(map, key)) {
      throw new Error(`La clave ${key} no está en el mapa de permisos`);
    }

    // Debe estar permitido por configuración base (db-structure)
    if (map[key] !== true) {
      throw new Error(
        `Permiso esperado como permitido en el mapa, pero es ${map[key]}`
      );
    }

    // Comprobar también en BD
    const has = await dbms.executeNamedQuery({
      nameQuery: 'hasProfileMethod',
      params: { method_name: 'query', profile_name: SECURITY_ADMIN_NAME },
    });
    const allowed = !!has?.rows?.[0]?.allowed;
    if (allowed !== true) {
      throw new Error(`Verificación en BD no coincide. allowed=${allowed}`);
    }

    ok('Permiso conocido verificado correctamente', { key, allowed: map[key] });
  } catch (error) {
    fail('Fallo en test-load-permissions', error);
  }
})();
