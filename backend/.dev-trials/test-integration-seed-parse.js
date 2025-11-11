import { execSync } from 'child_process';
import Repository from '#repository/repository.js';
import { parseMOP } from '#atx/parse-mop.js';
import { menus as structureMenus } from '#dbms/db-structure.js';

// Utility: stable stringify with sorted keys
const stableStringify = (obj) => {
  const replacer = (key, value) => value;
  const allKeys = [];
  JSON.stringify(obj, (k, v) => {
    allKeys.push(k);
    return v;
  });
  const sortKeys = (input) => {
    if (Array.isArray(input)) return input.map(sortKeys);
    if (input && typeof input === 'object') {
      const keys = Object.keys(input).sort();
      const out = {};
      for (const k of keys) out[k] = sortKeys(input[k]);
      return out;
    }
    return input;
  };
  return JSON.stringify(sortKeys(obj));
};

const simplifyMenus = (menus) => {
  // Produce a simplified shape ignoring ids, tx, method, params.
  const out = {};
  for (const subsystem of Object.keys(menus || {})) {
    out[subsystem] = {};
    const level1 = menus[subsystem] || {};
    for (const menuName of Object.keys(level1)) {
      const menuNode = level1[menuName] || {};
      const simpleMenu = {
        description: menuNode.description || '',
        options: [],
        submenus: {},
      };
      // options at menu level
      for (const optName of Object.keys(menuNode.options || {})) {
        simpleMenu.options.push({
          name: optName,
          description: menuNode.options[optName].description || '',
        });
      }
      // submenus
      for (const subName of Object.keys(menuNode.submenus || {})) {
        const subNode = menuNode.submenus[subName] || {};
        const simpleSub = {
          description: subNode.description || '',
          options: [],
        };
        for (const optName of Object.keys(subNode.options || {})) {
          simpleSub.options.push({
            name: optName,
            description: subNode.options[optName].description || '',
          });
        }
        // sort options for deterministic order
        simpleSub.options.sort((a, b) => a.name.localeCompare(b.name));
        simpleMenu.submenus[subName] = simpleSub;
      }
      simpleMenu.options.sort((a, b) => a.name.localeCompare(b.name));
      out[subsystem][menuName] = simpleMenu;
    }
  }
  return out;
};

const runSeeder = () => {
  console.log('-> Ejecutando seeder (reset + seed) ...');
  execSync('node .\\.dev-trials\\seed-db-structure.js --reset', {
    stdio: 'inherit',
  });
};

const compareAndFix = async () => {
  // Run seeder first
  runSeeder();

  console.log('-> Ejecutando parseMOP para obtener estructura desde DB...');
  const parsed = await parseMOP('');

  const simplifiedParsed = simplifyMenus(parsed || {});
  const simplifiedStructure = simplifyMenus(structureMenus || {});

  const sParsed = stableStringify(simplifiedParsed);
  const sStructure = stableStringify(simplifiedStructure);

  if (sParsed === sStructure) {
    console.log(
      'TEST: PASS - parseMOP coincide con db-structure (ignorando tx/method/params)'
    );
    process.exit(0);
  }

  console.log(
    'TEST: Differences detected between DB (parseMOP) and db-structure. Re-running seeder to apply canonical structure to DB...'
  );
  try {
    // Re-run the seeder (reset + seed) to apply canonical menus/options/profiles
    runSeeder();
  } catch (e) {
    console.error(
      'Error re-ejecutando el seeder para aplicar la estructura canónica:',
      e?.message || e
    );
    process.exit(2);
  }
  // Run a fresh child process to parse+compare (avoids pool end issues in this process)
  console.log(
    '-> Ejecutando comparación en proceso hijo tras aplicar cambios...'
  );
  try {
    execSync('node .\\.dev-trials\\compare-simplified-child.js', {
      stdio: 'inherit',
    });
    console.log(
      'TEST: PASS after fix - DB updated and parseMOP matches db-structure'
    );
    process.exit(0);
  } catch (e) {
    console.error(
      'TEST: FAIL after fix - comparison child reported mismatch or error'
    );
    process.exit(3);
  }
};

run().catch((e) => {
  console.error('Fatal error running integration test:', e?.message || e);
  process.exit(10);
});

async function run() {
  await compareAndFix();
}
