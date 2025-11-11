import { parseMOP } from '#atx/parse-mop.js';
import { menus as structureMenus } from '#dbms/db-structure.js';

const stableStringify = (obj) => {
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
      for (const optName of Object.keys(menuNode.options || {})) {
        simpleMenu.options.push({
          name: optName,
          description: menuNode.options[optName].description || '',
        });
      }
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
        simpleSub.options.sort((a, b) => a.name.localeCompare(b.name));
        simpleMenu.submenus[subName] = simpleSub;
      }
      simpleMenu.options.sort((a, b) => a.name.localeCompare(b.name));
      out[subsystem][menuName] = simpleMenu;
    }
  }
  return out;
};

const run = async () => {
  try {
    const parsed = await parseMOP('');
    const sParsed = stableStringify(simplifyMenus(parsed || {}));
    const sStructure = stableStringify(simplifyMenus(structureMenus || {}));
    if (sParsed === sStructure) {
      console.log('CHILD-COMPARE: OK - simplified structures match');
      process.exit(0);
    }
    console.error('CHILD-COMPARE: MISMATCH');
    console.error(
      'Parsed simplified:',
      JSON.stringify(simplifyMenus(parsed || {}), null, 2)
    );
    console.error(
      'Expected simplified:',
      JSON.stringify(simplifyMenus(structureMenus || {}), null, 2)
    );
    process.exit(2);
  } catch (e) {
    console.error('CHILD-COMPARE: error running parseMOP:', e?.message || e);
    process.exit(3);
  }
};

run();
