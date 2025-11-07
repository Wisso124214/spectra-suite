// Script standalone para verificar permisos de un método.
// Uso:
//   node .dev-trials/test-check-permission.js --subsystem security --class dbms --method query --profile "SECURITY_ADMIN"
//   node .dev-trials/test-check-permission.js --subsystem security --class dbms --method query --profile "administrador de seguridad"

import { argv } from 'node:process';

const parseArgs = (args) => {
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const val =
      args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    out[key] = val;
  }
  return out;
};

const main = async () => {
  try {
    const args = parseArgs(argv.slice(2));
    const subsystem = args.subsystem || 'security';
    const className = args.class || args.className || 'dbms';
    const method = args.method || 'query';
    const profile = args.profile || 'SECURITY_ADMIN';

    const { default: Security } = await import('#security/security.js');
    const security = new Security();
    const allowed = await security.checkPermissionMethod({
      subsystem,
      className,
      method,
      profile,
    });

    console.log('[CHECK] Params:', { subsystem, className, method, profile });
    console.log('[CHECK] Allowed:', allowed);
    process.exit(0);
  } catch (err) {
    console.error('[CHECK] Error:', err?.message || err);
    process.exit(1);
  }
};

await main();
