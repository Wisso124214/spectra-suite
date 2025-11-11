import { parseMOP } from '#atx/parse-mop.js';
import { menus as structureMenus } from '#dbms/db-structure.js';

const normalizeMethod = (m) => {
  if (!m) return null;
  return {
    subsystem: (m.subsystem || m.subsystemName || '').toString().toLowerCase(),
    class: (m.class || m.className || '').toString().toLowerCase(),
    method: (m.method || '').toString().toLowerCase(),
  };
};

const run = async () => {
  // Silence console.log during parseMOP to avoid duplicate JSON printing
  const origLog = console.log;
  console.log = () => {};
  const parsed = await parseMOP('');
  console.log = origLog;

  const diffs = [];
  for (const subsystem of Object.keys(structureMenus || {})) {
    const expectedSubsystem = structureMenus[subsystem];
    const parsedSubsystem = parsed[subsystem];
    if (!parsedSubsystem) {
      diffs.push({ type: 'missing_subsystem', subsystem });
      continue;
    }
    for (const menuName of Object.keys(expectedSubsystem || {})) {
      const expectedMenu = expectedSubsystem[menuName];
      const parsedMenu = parsedSubsystem[menuName];
      if (!parsedMenu) {
        diffs.push({ type: 'missing_menu', subsystem, menu: menuName });
        continue;
      }
      const expectedOptions = expectedMenu.options || {};
      const expectedSubmenus = expectedMenu.submenus || {};
      for (const optName of Object.keys(expectedOptions)) {
        const expOpt = expectedOptions[optName];
        const parOpt = (parsedMenu.options || {})[optName];
        if (!parOpt) {
          diffs.push({
            type: 'missing_option',
            subsystem,
            menu: menuName,
            option: optName,
          });
          continue;
        }
        const nm = normalizeMethod(expOpt.method);
        const pm = normalizeMethod(parOpt.method);
        if (JSON.stringify(nm) !== JSON.stringify(pm)) {
          diffs.push({
            type: 'method_mismatch',
            subsystem,
            menu: menuName,
            option: optName,
            expected: nm,
            found: pm,
          });
        }
      }
      for (const subName of Object.keys(expectedSubmenus)) {
        const expSub = expectedSubmenus[subName];
        const parSub = (parsedMenu.submenus || {})[subName];
        if (!parSub) {
          diffs.push({
            type: 'missing_submenu',
            subsystem,
            menu: menuName,
            submenu: subName,
          });
          continue;
        }
        const expOpts = expSub.options || {};
        for (const optName of Object.keys(expOpts)) {
          const expOpt = expOpts[optName];
          const parOpt = (parSub.options || {})[optName];
          if (!parOpt) {
            diffs.push({
              type: 'missing_option',
              subsystem,
              menu: menuName,
              submenu: subName,
              option: optName,
            });
            continue;
          }
          const nm = normalizeMethod(expOpt.method);
          const pm = normalizeMethod(parOpt.method);
          if (JSON.stringify(nm) !== JSON.stringify(pm)) {
            diffs.push({
              type: 'method_mismatch',
              subsystem,
              menu: menuName,
              submenu: subName,
              option: optName,
              expected: nm,
              found: pm,
            });
          }
        }
      }
    }
  }

  if (diffs.length === 0) {
    console.log(
      'COMPARE: OK - parseMOP reconstruction matches db-structure (methods normalized)'
    );
  } else {
    console.log('COMPARE: Differences found:', JSON.stringify(diffs, null, 2));
  }
  process.exit(0);
};

run();
