import { parseMOP } from '#atx/parse-mop.js';
import { menus as sourceMenus } from '#dbms/db-structure.js';

const buildShape = (menus) => {
  const out = {};
  for (const subsystem of Object.keys(menus || {})) {
    out[subsystem] = {};
    const level1 = menus[subsystem] || {};
    for (const menuName of Object.keys(level1)) {
      const node = level1[menuName] || {};
      const nodeShape = {
        description: node.description || '',
        options: [],
        submenus: {},
      };
      if (node.options) {
        nodeShape.options = Object.keys(node.options || {});
      }
      if (node.submenus) {
        for (const subName of Object.keys(node.submenus || {})) {
          const subNode = node.submenus[subName] || {};
          nodeShape.submenus[subName] = {
            description: subNode.description || '',
            options: Object.keys(subNode.options || {}),
          };
        }
      }
      out[subsystem][menuName] = nodeShape;
    }
  }
  return out;
};

const buildShapeFromParse = (menus) => {
  const out = {};
  for (const subsystem of Object.keys(menus || {})) {
    out[subsystem] = {};
    const level1 = menus[subsystem] || {};
    for (const menuName of Object.keys(level1)) {
      const node = level1[menuName] || {};
      const nodeShape = {
        description: node.description || '',
        options: [],
        submenus: {},
      };
      if (node.options) {
        nodeShape.options = Object.keys(node.options || {});
      }
      if (node.submenus) {
        for (const subName of Object.keys(node.submenus || {})) {
          const subNode = node.submenus[subName] || {};
          nodeShape.submenus[subName] = {
            description: subNode.description || '',
            options: Object.keys(subNode.options || {}),
          };
        }
      }
      out[subsystem][menuName] = nodeShape;
    }
  }
  return out;
};

const diffSets = (a = [], b = []) => {
  const sa = new Set(a || []);
  const sb = new Set(b || []);
  const inAnotB = [...sa].filter((x) => !sb.has(x));
  const inBnotA = [...sb].filter((x) => !sa.has(x));
  return { inAnotB, inBnotA };
};

const compare = (sourceShape, parsedShape) => {
  const report = {
    subsystemsOnlyInSource: [],
    subsystemsOnlyInParsed: [],
    menus: {},
  };
  const sourceSubs = new Set(Object.keys(sourceShape || {}));
  const parsedSubs = new Set(Object.keys(parsedShape || {}));
  report.subsystemsOnlyInSource = [...sourceSubs].filter(
    (s) => !parsedSubs.has(s)
  );
  report.subsystemsOnlyInParsed = [...parsedSubs].filter(
    (s) => !sourceSubs.has(s)
  );

  const subsystems = new Set([
    ...Object.keys(sourceShape || {}),
    ...Object.keys(parsedShape || {}),
  ]);
  for (const s of subsystems) {
    const srcMenus = sourceShape[s] || {};
    const parsedMenus = parsedShape[s] || {};
    const menuNames = new Set([
      ...Object.keys(srcMenus || {}),
      ...Object.keys(parsedMenus || {}),
    ]);
    for (const m of menuNames) {
      const srcNode = srcMenus[m] || { options: [], submenus: {} };
      const parsedNode = parsedMenus[m] || { options: [], submenus: {} };
      const optDiff = diffSets(srcNode.options, parsedNode.options);
      const submenuNames = new Set([
        ...Object.keys(srcNode.submenus || {}),
        ...Object.keys(parsedNode.submenus || {}),
      ]);
      const subDiffs = {};
      for (const sn of submenuNames) {
        const srcSubOpts =
          (srcNode.submenus[sn] && srcNode.submenus[sn].options) || [];
        const parsedSubOpts =
          (parsedNode.submenus[sn] && parsedNode.submenus[sn].options) || [];
        const d = diffSets(srcSubOpts, parsedSubOpts);
        if (d.inAnotB.length || d.inBnotA.length) subDiffs[sn] = d;
      }
      if (
        optDiff.inAnotB.length ||
        optDiff.inBnotA.length ||
        Object.keys(subDiffs).length > 0
      ) {
        if (!report.menus[s]) report.menus[s] = {};
        report.menus[s][m] = { options: optDiff, submenus: subDiffs };
      }
    }
  }
  return report;
};

const run = async () => {
  try {
    const parsed = await parseMOP('');
    const source = sourceMenus;
    const srcShape = buildShape(source);
    const parsedShape = buildShapeFromParse(parsed);
    const report = compare(srcShape, parsedShape);
    console.log('=== Comparison report (ignoring method/params) ===');
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    console.error('Error comparing menus:', e?.message || e);
  } finally {
    // ensure DB pool disconnect if parseMOP left it open
    try {
      const DBMS = (await import('#dbms/dbms.js')).default;
      await new DBMS().poolDisconnection();
    } catch (e) {}
  }
};

run();
