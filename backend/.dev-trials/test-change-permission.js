import Security from '#security/security.js';
import DBMS from '#dbms/dbms.js';
import Config from '#config/config.js';

const log = (...args) => console.log('[test-change-permission]', ...args);
const fail = (msg, err) => {
  console.error('\u274c', msg, err?.message || err || '');
  process.exitCode = 1;
};
const ok = (msg, data) => console.log('\u2705', msg, data ?? '');

(async () => {
  try {
    // Preparar dependencias: queries y perfiles
    const dbms = new DBMS();
    if (!dbms.queries) {
      await dbms.init();
    }
    const cfg = new Config();
    const PROFILES = await cfg.getProfiles();
    const SECURITY_ADMIN_NAME =
      PROFILES.SECURITY_ADMIN?.name || 'administrador de seguridad';

    const target = {
      subsystem: 'security',
      className: 'dbms',
      method: 'query',
      profile: SECURITY_ADMIN_NAME,
    };

    log('Objetivo', target);

    const security = new Security();
    await security.loadPermissions();

    // Utilidad: consulta estado actual en BD
    const hasAllowed = async () => {
      const res = await dbms.executeNamedQuery({
        nameQuery: 'hasProfileMethod',
        params: { method_name: target.method, profile_name: target.profile },
      });
      return !!res?.rows?.[0]?.allowed;
    };

    // 1) Estado inicial
    const prev = await hasAllowed();
    ok('Estado inicial (allowed):', prev);

    // 2) Cambiar al opuesto
    const toggled = !prev;
    const resChange1 = await security.changePermission({
      ...target,
      value: toggled,
    });
    ok('Resultado changePermission #1', resChange1);

    const now1 = await hasAllowed();
    if (now1 !== toggled) {
      throw new Error(
        `No se reflejó el cambio esperado. Esperado=${toggled} Actual=${now1}`
      );
    }
    ok('Verificación #1 OK (toggled)', now1);

    // 3) Restaurar al estado original
    const resChange2 = await security.changePermission({
      ...target,
      value: prev,
    });
    ok('Resultado changePermission #2 (restore)', resChange2);

    const now2 = await hasAllowed();
    if (now2 !== prev) {
      throw new Error(
        `No se restauró el estado original. Esperado=${prev} Actual=${now2}`
      );
    }
    ok('Verificación #2 OK (restaurado)', now2);

    // 4) Carga de permisos en memoria tras cambios
    const map = await security.loadPermissions();
    ok('Mapa de permisos cargado (tamaño)', Object.keys(map || {}).length);

    console.log('\nResumen:');
    console.table([
      { paso: 'Inicial', allowed: prev },
      { paso: 'Tras cambio', allowed: now1 },
      { paso: 'Restaurado', allowed: now2 },
    ]);
  } catch (error) {
    fail('Fallo en prueba de changePermission', error);
  }
})();
