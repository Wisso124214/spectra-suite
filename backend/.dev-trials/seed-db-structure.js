import Repository from '#repository/repository.js';
import DBMS from '#dbms/dbms.js';
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
        if (opt && typeof opt === 'object') {
          // Normalize description length and method shape; do not persist additional metadata table
          try {
            const originalDesc =
              typeof opt.description === 'string' ? opt.description : '';
            // preserve a short human description to avoid varchar(200) overflow
            opt.description =
              originalDesc && originalDesc.length > 190
                ? originalDesc.slice(0, 190)
                : originalDesc;
            // normalize method shape to use 'class' key (match db-structure.js shape)
            if (opt.method && typeof opt.method === 'object') {
              opt.method = {
                subsystem:
                  opt.method.subsystem || opt.method.subsystemName || null,
                class: opt.method.class || opt.method.className || null,
                className: opt.method.className || opt.method.class || null,
                method: opt.method.method || null,
              };
            }
            if (!opt.params) opt.params = null;
          } catch (e) {
            // fallback: dejar description como estaba
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
  // Instanciar Repository primero (Repository extiende DBMS) y usarlo como DBMS singleton
  const repository = new Repository();
  const dbms = repository; // repository también expone la API de DBMS

  // Conectar validador (algunos métodos lo usan)
  const validator = new Validator(dbms);
  dbms.validator = validator;

  // Debug prints removed for cleaner output (use console.debug if needed locally)

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
    // No se crea tabla adicional option_meta; las descripciones y metadatos se obtienen de las tablas existentes
    const menusNormalized = normalizeMenus(menus);
    // menusNormalized debug prints removed to reduce noise; use console.debug locally if required

    // Pre-resolve all tx values (outside the big transaction) to avoid race conditions
    const txMap = new Map();
    // Canonical key for method references to avoid duplicates caused by
    // minor differences in object shape/whitespace/newlines
    const normalize = (s) =>
      typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().toLowerCase() : '';
    const resolveKey = (methodObj) => {
      if (!methodObj || typeof methodObj !== 'object') return '';
      const subsystemName = normalize(
        methodObj.subsystem || methodObj.subsystemName || ''
      );
      const className = normalize(methodObj.className || methodObj.class || '');
      const methodName = normalize(methodObj.method || '');
      return `${subsystemName}::${className}::${methodName}`;
    };
    for (const subsystem of Object.keys(menusNormalized || {})) {
      const level1 = menusNormalized[subsystem] || {};
      for (const menuName of Object.keys(level1)) {
        const menuNode = level1[menuName] || {};
        // top-level options
        for (const optName of Object.keys(menuNode.options || {})) {
          const optNode = menuNode.options[optName] || {};
          const methodRef = optNode.method || null;
          if (methodRef) {
            const key = resolveKey({
              ...methodRef,
              subsystem: methodRef.subsystem || subsystem,
            });
            if (!txMap.has(key)) {
              // try to get existing tx first to avoid duplicate inserts
              const className = methodRef.className || methodRef.class || null;
              const methodName = methodRef.method || null;
              let existing = null;
              if (className && methodName) {
                const qres = await dbms.query({
                  query: `SELECT t.tx FROM public."transaction" t
                    JOIN public."subsystem" s ON t.id_subsystem = s.id
                    JOIN public."class" c ON t.id_class = c.id
                    JOIN public."method" m ON t.id_method = m.id
                    WHERE s.name = $1 AND c.name = $2 AND m.name = $3 LIMIT 1;`,
                  params: [subsystem, className, methodName],
                });
                existing = qres?.rows?.[0]?.tx || null;
              }
              const tx =
                existing ||
                (await repository._resolveTxFromMethodRef(
                  methodRef,
                  subsystem
                ));
              txMap.set(key, tx);
            }
          }
        }
        // submenus
        for (const subName of Object.keys(menuNode.submenus || {})) {
          const subNode = menuNode.submenus[subName] || {};
          for (const optName of Object.keys(subNode.options || {})) {
            const optNode = subNode.options[optName] || {};
            const methodRef = optNode.method || null;
            if (methodRef) {
              const key = resolveKey({
                ...methodRef,
                subsystem: methodRef.subsystem || subsystem,
              });
              if (!txMap.has(key)) {
                const className =
                  methodRef.className || methodRef.class || null;
                const methodName = methodRef.method || null;
                let existing = null;
                if (className && methodName) {
                  const qres = await dbms.query({
                    query: `SELECT t.tx FROM public."transaction" t
                      JOIN public."subsystem" s ON t.id_subsystem = s.id
                      JOIN public."class" c ON t.id_class = c.id
                      JOIN public."method" m ON t.id_method = m.id
                      WHERE s.name = $1 AND c.name = $2 AND m.name = $3 LIMIT 1;`,
                    params: [subsystem, className, methodName],
                  });
                  existing = qres?.rows?.[0]?.tx || null;
                }
                const tx =
                  existing ||
                  (await repository._resolveTxFromMethodRef(
                    methodRef,
                    subsystem
                  ));
                txMap.set(key, tx);
              }
            }
          }
        }
      }
    }

    // Ensure all pre-resolved transactions actually exist in the DB (extra safety pass)
    for (const key of txMap.keys()) {
      try {
        const parts = (key || '').split('::');
        if (parts.length !== 3) continue;
        const [ssName, className, methodName] = parts;
        if (!ssName || !className || !methodName) continue;
        const qres = await dbms.query({
          query: `SELECT t.tx FROM public."transaction" t JOIN public."subsystem" s ON t.id_subsystem = s.id JOIN public."class" c ON t.id_class = c.id JOIN public."method" m ON t.id_method = m.id WHERE s.name = $1 AND c.name = $2 AND m.name = $3 LIMIT 1;`,
          params: [ssName, className, methodName],
        });
        const exists = qres?.rows?.[0]?.tx || null;
        if (!exists) {
          // create it explicitly (setTxTransaction does SELECT-before-INSERT internally)
          try {
            const created = await repository.setTxTransaction({
              subsystem: ssName,
              className,
              method: methodName,
            });
            console.log(
              'DEBUG ensure tx:',
              key,
              '->',
              created?.data?.tx || created
            );
            // update map with created tx if needed
            if (created && created.data && created.data.tx)
              txMap.set(key, created.data.tx);
          } catch (e) {
            console.warn(
              'Warning: could not ensure tx for',
              key,
              e?.message || e
            );
          }
        }
      } catch (e) {
        // non-fatal
        console.warn('Warning while ensuring txMap key', key, e?.message || e);
      }
    }

    // Deterministic seeding: drop and recreate menus/options/joins based strictly on menusNormalized
    await repository._withTransaction(async (client) => {
      // Clean existing MOP tables (deterministic full replace)
      await client.query('DELETE FROM public.option_profile;');
      await client.query('DELETE FROM public.option_menu;');
      await client.query('DELETE FROM public."menu";');
      await client.query('DELETE FROM public."option";');

      // Recreate menus/options/profiles exactly as in menusNormalized
      for (const subsystem of Object.keys(menusNormalized || {})) {
        // get subsystem id
        const ssRes = await client.query(
          'SELECT id FROM public."subsystem" WHERE name = $1 LIMIT 1;',
          [subsystem]
        );
        const subsystemId = ssRes?.rows?.[0]?.id || null;

        const level1 = menusNormalized[subsystem] || {};
        for (const menuName of Object.keys(level1)) {
          const menuNode = level1[menuName] || {};
          const menuId = await repository._ensureEntityByUniqueField(
            client,
            'menu',
            {
              name: menuName,
              description: menuNode?.description || menuName,
              id_subsystem: subsystemId,
            }
          );

          // insert options at menu level
          const topOpts = Object.keys(menuNode.options || {});
          if (topOpts.length)
            console.log(`Seeding options for menu '${menuName}':`, topOpts);
          for (const optName of topOpts) {
            const optNode = menuNode.options[optName] || {};
            const methodRef =
              (optNode.__meta && optNode.__meta.method) ||
              optNode.method ||
              null;
            const key = resolveKey({
              ...(methodRef || {}),
              subsystem: methodRef?.subsystem || subsystem,
            });
            const tx = txMap.get(key) || null;
            const optionId = await repository._ensureOptionWithTx(client, {
              name: optName,
              description: optNode.description || optName,
              tx,
            });
            await repository._ensureJoin(client, 'option_menu', {
              id_option: optionId,
              id_menu: menuId,
            });
            for (const prof of optNode.allowedProfiles || []) {
              const profileId = await repository._ensureEntityByUniqueField(
                client,
                'profile',
                { name: prof }
              );
              await repository._ensureJoin(client, 'option_profile', {
                id_option: optionId,
                id_profile: profileId,
              });
            }
          }

          // submenus
          const subs = Object.keys(menuNode.submenus || {});
          if (subs.length)
            console.log(`Seeding submenus for menu '${menuName}':`, subs);
          for (const subName of subs) {
            const subNode = menuNode.submenus[subName] || {};
            const subId = await repository._ensureEntityByUniqueField(
              client,
              'menu',
              {
                name: subName,
                description: subNode?.description || subName,
                id_subsystem: subsystemId,
                id_parent: menuId,
              }
            );

            const subOpts = Object.keys(subNode.options || {});
            if (subOpts.length)
              console.log(
                `Seeding options for submenu '${subName}' (parent '${menuName}'):`,
                subOpts
              );
            for (const optName of subOpts) {
              const optNode = subNode.options[optName] || {};
              const methodRef = optNode.method || null;
              const key = resolveKey({
                ...(methodRef || {}),
                subsystem: methodRef?.subsystem || subsystem,
              });
              const tx = txMap.get(key) || null;
              const optionId = await repository._ensureOptionWithTx(client, {
                name: optName,
                description: optNode.description || optName,
                tx,
              });
              await repository._ensureJoin(client, 'option_menu', {
                id_option: optionId,
                id_menu: subId,
              });
              for (const prof of optNode.allowedProfiles || []) {
                const profileId = await repository._ensureEntityByUniqueField(
                  client,
                  'profile',
                  { name: prof }
                );
                await repository._ensureJoin(client, 'option_profile', {
                  id_option: optionId,
                  id_profile: profileId,
                });
              }
            }
          }
        }
      }
    }, 'Error determinista en setMenusOptionsProfiles');

    // No persistimos metadata adicional en DB; los métodos y descripciones se leen de las tablas existentes

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
      const countRes = await dbms.query({
        query: 'SELECT COUNT(*)::int AS c FROM public."method_profile";',
        params: [],
      });
      const total = countRes?.rows?.[0]?.c ?? 0;
      console.log(`[CHECK] method_profile total: ${total}`);

      const sampleRes = await dbms.query({
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
