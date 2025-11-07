import DBMS from '#dbms/dbms.js';
import Security from '#security/security.js';

// Pequeña prueba de Security.executeMethod
// 1) Invoca loadPermissions (sin parámetros)
// 2) Invoca checkPermissionMethod con nombres
// Nota: Asume que la estructura base y permisos ya fueron sembrados.
// Si no, puedes ejecutar antes: npm run seed:reset-check

(async () => {
  try {
    const dbms = new DBMS();
    await dbms.init(); // carga queries.yaml en memoria

    const security = new Security();

    console.log('\n[TEST] Ejecutando loadPermissions vía executeMethod...');
    const permissionsMap = await security.executeMethod({
      className: 'security',
      method: 'loadPermissions',
      params: undefined,
    });
    console.log(
      '[RESULT] Total claves de permisos cargadas:',
      Object.keys(permissionsMap || {}).length
    );

    console.log(
      '\n[TEST] Ejecutando checkPermissionMethod vía executeMethod...'
    );
    // Caso de prueba: ajustar subsystem/className/method/profile si difiere de la BD sembrada
    const checkResult = await security.executeMethod({
      className: 'security',
      method: 'checkPermissionMethod',
      params: {
        subsystem: 'security',
        className: 'dbms',
        method: 'query',
        profile: 'SECURITY_ADMIN',
      },
    });
    console.log('[RESULT] checkPermissionMethod:', checkResult);

    console.log('\n[SUCCESS] Prueba de executeMethod finalizada.');
  } catch (err) {
    console.error('[ERROR] Falla en prueba executeMethod:', err);
    console.error(
      'Sugerencia: Ejecuta seeding con permisos y reintenta: npm run seed:reset-check'
    );
  } finally {
    // Opcional: terminar proceso explícitamente
    process.exit(0);
  }
})();
