import Repository from '#repository/repository.js';

const run = async () => {
  const repo = new Repository();
  await repo.init();
  try {
    // Conteo directo en method_profile
    const countRes = await repo.query({
      query: 'SELECT COUNT(*)::int AS c FROM public."method_profile";',
      params: [],
    });
    const total = countRes?.rows?.[0]?.c ?? 0;
    console.log(`[CHECK] method_profile total: ${total}`);

    // Muestra de relaciones método ↔ perfil
    const sampleRes = await repo.query({
      query: `
        SELECT m.name AS method, p.name AS profile
        FROM public."method_profile" mp
        JOIN public."method" m ON mp.id_method = m.id
        JOIN public."profile" p ON mp.id_profile = p.id
        ORDER BY m.name, p.name
        LIMIT 20;
      `,
      params: [],
    });
    console.log('[CHECK] Muestra method_profile (máx 20):');
    console.log(sampleRes?.rows || []);

    // Verificación con Security.loadPermissions
    const { default: Security } = await import('#security/security.js');
    const security = new Security();
    const map = await security.loadPermissions();
    const size = Object.keys(map || {}).length;
    console.log(`[CHECK] Security.loadPermissions claves: ${size}`);
    console.log(
      '[CHECK] Muestra (10):',
      Object.entries(map || {}).slice(0, 10)
    );
  } catch (err) {
    console.error('[CHECK] Error:', err?.message || err);
  } finally {
    try {
      await repo.poolDisconnection();
    } catch (_) {}
  }
};

run();
