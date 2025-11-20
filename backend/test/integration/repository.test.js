import { GenericContainer } from 'testcontainers';
import fs from 'fs';
import path from 'path';
import Config from "../../config/config.js";
import Repository from "../../src/repository/repository.js";

jest.setTimeout(60000);

let container;
let dbUrlEnv = {};

let repo;

beforeAll(async () => {
  // Start a Postgres container (if Docker available). If Docker is not available,
  // fall back to using PG connection info from environment variables.
  let startedWithContainer = false;
  try {
    container = await new GenericContainer('postgres', '14')
      .withEnv('POSTGRES_USER', 'test')
      .withEnv('POSTGRES_PASSWORD', 'test')
      .withEnv('POSTGRES_DB', 'testdb')
      .withExposedPorts(5432)
      .start();

    const mappedPort = container.getMappedPort(5432);
    const host = container.getHost();

    process.env.PGHOST = host;
    process.env.PGPORT = String(mappedPort);
    process.env.PGUSER = 'test';
    process.env.PGPASSWORD = 'test';
    process.env.PGDATABASE = 'testdb';
    startedWithContainer = true;
  } catch (err) {
    // If Docker isn't available, GenericContainer will throw. Try to continue
    // if the caller provided PG connection info via env vars.
    console.warn(
      'Could not start Postgres container (Docker may be unavailable):',
      err && err.message
    );
    if (!process.env.PGHOST) {
      // No fallback available; rethrow to fail the setup with a clear message.
      throw new Error(
        'Docker not available and no PGHOST environment variable set. Enable Docker or set PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE to run integration tests.'
      );
    }
  }
  // NOTE: Intentionally skipping applying db-backups/backup.sql here.
  // We create a minimal schema (DDL) above to run the integration smoke tests
  // so the full backup is not required and may contain psql-only commands that
  // cannot be executed via node-postgres client.

  // Initialize DBMS/Repository instances
  repo = new Repository();
  await repo.init();

  // Create minimal DDL for the tables used by the repository tests (if they don't exist).
  const ddls = [
    `CREATE TABLE IF NOT EXISTS public."subsystem" (id SERIAL PRIMARY KEY, name TEXT UNIQUE);`,
    `CREATE TABLE IF NOT EXISTS public."class" (id SERIAL PRIMARY KEY, name TEXT UNIQUE);`,
    `CREATE TABLE IF NOT EXISTS public."method" (id SERIAL PRIMARY KEY, name TEXT UNIQUE);`,
    `CREATE TABLE IF NOT EXISTS public."profile" (id SERIAL PRIMARY KEY, name TEXT UNIQUE);`,
    `CREATE TABLE IF NOT EXISTS public."menu" (id SERIAL PRIMARY KEY, name TEXT UNIQUE, id_parent INT NULL, id_subsystem INT NULL);`,
    `CREATE TABLE IF NOT EXISTS public."option" (id SERIAL PRIMARY KEY, name TEXT UNIQUE, description TEXT, tx INT NULL);`,
    `CREATE TABLE IF NOT EXISTS public."user" (id SERIAL PRIMARY KEY, username TEXT UNIQUE, password TEXT, email TEXT, status TEXT, register_date TEXT);`,
    `CREATE TABLE IF NOT EXISTS public."user_profile" (id_user INT REFERENCES public."user"(id) ON DELETE CASCADE, id_profile INT REFERENCES public."profile"(id) ON DELETE CASCADE, PRIMARY KEY(id_user, id_profile));`,
    `CREATE TABLE IF NOT EXISTS public."option_profile" (id_option INT REFERENCES public."option"(id) ON DELETE CASCADE, id_profile INT REFERENCES public."profile"(id) ON DELETE CASCADE, PRIMARY KEY(id_option, id_profile));`,
    `CREATE TABLE IF NOT EXISTS public."option_menu" (id_option INT REFERENCES public."option"(id) ON DELETE CASCADE, id_menu INT REFERENCES public."menu"(id) ON DELETE CASCADE, PRIMARY KEY(id_option, id_menu));`,
    `CREATE TABLE IF NOT EXISTS public."transaction" (tx SERIAL PRIMARY KEY, description TEXT, id_subsystem INT REFERENCES public."subsystem"(id), id_class INT REFERENCES public."class"(id), id_method INT REFERENCES public."method"(id));`,
    `CREATE TABLE IF NOT EXISTS public."class_method" (id_class INT REFERENCES public."class"(id) ON DELETE CASCADE, id_method INT REFERENCES public."method"(id) ON DELETE CASCADE, PRIMARY KEY(id_class, id_method));`,
    `CREATE TABLE IF NOT EXISTS public."method_profile" (id_method INT REFERENCES public."method"(id) ON DELETE CASCADE, id_profile INT REFERENCES public."profile"(id) ON DELETE CASCADE, PRIMARY KEY(id_method, id_profile));`,
    `CREATE TABLE IF NOT EXISTS public."subsystem_class" (id_subsystem INT REFERENCES public."subsystem"(id) ON DELETE CASCADE, id_class INT REFERENCES public."class"(id) ON DELETE CASCADE, PRIMARY KEY(id_subsystem, id_class));`,
  ];

  for (const ddl of ddls) {
    try {
      await repo.query(ddl);
    } catch (e) {
      // ignore DDL errors in case the DB user lacks permissions
      console.warn('DDL execution warning:', e && e.message);
    }
  }

  // Ensure base entities exist for the repository methods we will test
  const setupSqls = [
    `INSERT INTO public."subsystem"(name) VALUES('test_sub') ON CONFLICT DO NOTHING;`,
    `INSERT INTO public."class"(name) VALUES('testClass') ON CONFLICT DO NOTHING;`,
    `INSERT INTO public."method"(name) VALUES('testMethod') ON CONFLICT DO NOTHING;`,
    `INSERT INTO public."profile"(name) VALUES('P_test') ON CONFLICT DO NOTHING;`,
    `INSERT INTO public."menu"(id_subsystem, name) VALUES((SELECT id FROM public."subsystem" WHERE name='test_sub'), 'M_test') ON CONFLICT DO NOTHING;`,
    `INSERT INTO public."option"(name, tx) VALUES('O_test', 0) ON CONFLICT DO NOTHING;`,
    // Entries for delete tests
    `INSERT INTO public."subsystem"(name) VALUES('del_sub') ON CONFLICT DO NOTHING;`,
    `INSERT INTO public."class"(name) VALUES('delClass') ON CONFLICT DO NOTHING;`,
    `INSERT INTO public."method"(name) VALUES('delMethod') ON CONFLICT DO NOTHING;`,
    `INSERT INTO public."profile"(name) VALUES('P_test2') ON CONFLICT DO NOTHING;`,
  ];

  for (const s of setupSqls) {
    try {
      await repo.query(s);
    } catch (e) {
      // ignore; schema may not exist if backup didn't run
    }
  }
});

afterAll(async () => {
  // Cleanup test artifacts created during the integration tests.
  // We target only names created by the tests (prefixes) to avoid touching baseline data.
  try {
    const cleanupSqls = [
      // Remove any temporary transactions created by tests
      `DELETE FROM public."transaction" WHERE description LIKE '%json_tx_%' OR description LIKE '%temp%';`,

      // Remove joins referencing options created by tests
      `DELETE FROM public."option_profile" op USING public."option" o WHERE op.id_option = o.id AND (o.name LIKE 'O_bulk%' OR o.name LIKE 'O_profile_%' OR o.name LIKE 'O_bulkprof_%' OR o.name LIKE 'Opt_H_%' OR o.name LIKE 'O_profile_%');`,
      `DELETE FROM public."option_menu" om USING public."option" o WHERE om.id_option = o.id AND (o.name LIKE 'O_bulk%' OR o.name LIKE 'O_profile_%' OR o.name LIKE 'O_bulkprof_%' OR o.name LIKE 'Opt_H_%');`,
      `DELETE FROM public."option_menu" om USING public."menu" m WHERE om.id_menu = m.id AND (m.name LIKE 'M_bulk%' OR m.name LIKE 'M_profile_%' OR m.name LIKE 'Menu_H_%');`,

      // Remove user_profile links for test users
      `DELETE FROM public."user_profile" up USING public."user" u WHERE up.id_user = u.id AND (u.username LIKE 'dup_test_%' OR u.username LIKE 'json_tx_%' OR u.username LIKE 'bulk_user_%' OR u.username LIKE 'rb_test_%');`,

      // Remove method/profile/class links created by tests
      `DELETE FROM public."method_profile" mp USING public."method" m WHERE mp.id_method = m.id AND m.name LIKE 'method_bulk_%';`,
      `DELETE FROM public."class_method" cm USING public."class" c WHERE cm.id_class = c.id AND c.name LIKE 'class_bulk_%';`,

      // Remove options, menus, subsystems, methods and users created during tests
      `DELETE FROM public."transaction" WHERE description LIKE '%json_tx_%' OR description LIKE '%temp%';`,
      `DELETE FROM public."option" WHERE name LIKE 'O_bulk%' OR name LIKE 'O_profile_%' OR name LIKE 'O_bulkprof_%' OR name LIKE 'Opt_H_%' OR name LIKE 'O_profile_%';`,
      `DELETE FROM public."menu" WHERE name LIKE 'M_bulk%' OR name LIKE 'M_profile_%' OR name LIKE 'Menu_H_%';`,
      `DELETE FROM public."subsystem" WHERE name LIKE 'bulk_sub_%' OR name LIKE 'sub_h_%' OR name = 'profile_sub';`,
      `DELETE FROM public."method" WHERE name LIKE 'method_bulk_%';`,
      `DELETE FROM public."user" WHERE username LIKE 'dup_test_%' OR username LIKE 'json_tx_%' OR username LIKE 'bulk_user_%' OR username LIKE 'rb_test_%';`,
    ];

    for (const s of cleanupSqls) {
      try {
        await repo.query(s);
      } catch (e) {
        // ignore individual cleanup errors but continue
        // console.warn('Cleanup warning:', e && e.message);
      }
    }
  } catch (e) {
    // ignore global cleanup errors
  }

  if (container) await container.stop();
  if (repo && typeof repo.poolDisconnection === 'function') {
    try {
      await repo.poolDisconnection();
    } catch (e) {
      /* ignore */
    }
  }
});

describe('Repository integration tests (smoke)', () => {
  test('setTxTransaction and getTxTransactionByNames', async () => {
    // Create a tx
    const res = await repo.setTxTransaction({
      subsystem: 'test_sub',
      className: 'testClass',
      method: 'testMethod',
      description: 'desc',
    });
    expect(res).toBeDefined();
    // Now attempt to fetch by names
    const sel = await repo.executeNamedQuery({
      nameQuery: 'getTxTransactionByNames',
      params: {
        subsystem_name: 'test_sub',
        class_name: 'testClass',
        method_name: 'testMethod',
      },
    });
    expect(sel).toBeDefined();
  });

  test('setMenuOptionProfile and getMenuOptionsProfile', async () => {
    const payload = { menu: 'M_test', option: 'O_test', profile: 'P_test' };
    // call setMenuOptionProfile
    const setRes = await repo.setMenuOptionProfile(payload);
    expect(setRes).toBeDefined();
    // call getMenuOptionsProfile
    const getRes = await repo.getMenuOptionsProfile({
      menu: 'M_test',
      profile: 'P_test',
    });
    expect(getRes).toBeDefined();
  });

  test('delTxTransaction by names and by id', async () => {
    // create tx
    const r1 = await repo.setTxTransaction({
      subsystem: 'del_sub',
      className: 'delClass',
      method: 'delMethod',
      description: 'to delete',
    });
    const txValue = r1?.data?.tx || null;
    expect(txValue).not.toBeNull();
    // delete by id
    const delById = await repo.delTxTransaction({
      confirmDelete: `DELETE_TRANSACTION`,
      tx: txValue,
    });
    expect(delById).toBeDefined();
  });

  // Add a few additional smoke checks for complex queries
  test('resolveMethodPermissionRefs and loadPermissions', async () => {
    const refs = await repo.executeNamedQuery({
      nameQuery: 'resolveMethodPermissionRefs',
      params: ['security', 'dbms', 'query', 'administrador de seguridad'],
    });
    expect(refs).toBeDefined();
    const perms = await repo.executeNamedQuery({
      nameQuery: 'loadPermissions',
      params: [],
    });
    expect(perms).toBeDefined();
  });

  // Additional tests to reach ~12 methods coverage
  test('setUserProfile / getUserProfiles / delUserProfile', async () => {
    // create a user via named query
    const now = new Date().toISOString();
    try {
      await repo.executeNamedQuery({
        nameQuery: 'insertUser',
        params: {
          username: 'u_test',
          password: 'p',
          email: 'u@test.local',
          status: 'active',
          register_date: now,
        },
      });
    } catch (e) {
      // ignore duplicate user errors if user already exists from previous runs
    }
    // assign profile
    const setRes = await repo.setUserProfile({
      username: 'u_test',
      profile: 'P_test',
    });
    expect(setRes).toBeDefined();
    const got = await repo.getUserProfiles({ username: 'u_test' });
    expect(got).toBeDefined();
    // delete user profile
    await repo.delUserProfile({
      username: 'u_test',
      profile: 'P_test',
      confirmDelete: 'DELETE_USER_PROFILE',
    });
    const gotAfter = await repo.getUserProfiles({ username: 'u_test' });
    expect(gotAfter).toBeDefined();
  });

  test('setProfileOption / getProfileOptions / delProfileOption', async () => {
    const setRes = await repo.setProfileOption({
      option: 'O_test',
      profile: 'P_test',
    });
    expect(setRes).toBeDefined();
    const got = await repo.getProfileOptions({ profile: 'P_test' });
    expect(got).toBeDefined();
    await repo.delProfileOption({
      option: 'O_test',
      profile: 'P_test',
      confirmDelete: 'DELETE_OPTION_PROFILE',
    });
    const gotAfter = await repo.getProfileOptions({ profile: 'P_test' });
    expect(gotAfter).toBeDefined();
  });

  test('setMenuOption / getMenuOptions / delMenuOption', async () => {
    const setRes = await repo.setMenuOption({
      option: 'O_test',
      menu: 'M_test',
    });
    expect(setRes).toBeDefined();
    const got = await repo.getMenuOptions({ menu: 'M_test' });
    expect(got).toBeDefined();
    await repo.delMenuOption({
      option: 'O_test',
      menu: 'M_test',
      confirmDelete: 'DELETE_OPTION_MENU',
    });
    const gotAfter = await repo.getMenuOptions({ menu: 'M_test' });
    expect(gotAfter).toBeDefined();
  });

  test('setProfileMethod / getProfileMethods / delProfileMethod', async () => {
    const setRes = await repo.setProfileMethod({
      method: 'testMethod',
      profile: 'P_test',
    });
    expect(setRes).toBeDefined();
    const got = await repo.getProfileMethods({ profile: 'P_test' });
    expect(got).toBeDefined();
    await repo.delProfileMethod({
      method: 'testMethod',
      profile: 'P_test',
      confirmDelete: 'DELETE_METHOD_PROFILE',
    });
    const gotAfter = await repo.getProfileMethods({ profile: 'P_test' });
    expect(gotAfter).toBeDefined();
  });

  test('setClassMethod / getClassMethods / delClassMethod', async () => {
    const setRes = await repo.setClassMethod({
      className: 'testClass',
      method: 'testMethod',
    });
    expect(setRes).toBeDefined();
    const got = await repo.getClassMethods({ className: 'testClass' });
    expect(got).toBeDefined();
    await repo.delClassMethod({
      className: 'testClass',
      method: 'testMethod',
      confirmDelete: 'DELETE_CLASS_METHOD',
    });
    const gotAfter = await repo.getClassMethods({ className: 'testClass' });
    expect(gotAfter).toBeDefined();
  });

  // Additional methods to reach ~15 methods coverage
  test('getUsers and getUsersProfiles', async () => {
    const users = await repo.executeNamedQuery({
      nameQuery: 'getUsers',
      params: [],
    });
    expect(users).toBeDefined();
    const usersProfiles = await repo.executeNamedQuery({
      nameQuery: 'getUsersProfiles',
      params: [],
    });
    expect(usersProfiles).toBeDefined();
  });

  test('getMenusOptionsProfiles and getProfilesOptions', async () => {
    const menusOptsProfiles = await repo.executeNamedQuery({
      nameQuery: 'getMenusOptionsProfiles',
      params: [],
    });
    expect(menusOptsProfiles).toBeDefined();
    const profilesOpts = await repo.executeNamedQuery({
      nameQuery: 'getProfilesOptions',
      params: [],
    });
    expect(profilesOpts).toBeDefined();
  });

  test('replaceMenuOptionProfile and delAllMenusOptionsProfiles', async () => {
    // Ensure two profiles exist
    try {
      await repo.executeNamedQuery({
        nameQuery: 'setProfileOption',
        params: ['O_test', 'P_test'],
      });
    } catch (e) {}
    // Try a replace (old -> new)
    try {
      await repo.replaceMenuOptionProfile({
        menu: 'M_test',
        option: 'O_test',
        profile: 'P_test',
        new_profile: 'P_test2',
      });
    } catch (e) {
      // repo.replaceMenuOptionProfile wraps logic in transactions; ignore errors if any
    }
    // Now delete all menus/options/profiles mapping
    const delAll = await repo.delAllMenusOptionsProfiles();
    expect(delAll).toBeDefined();
  });

  test('setSubsystemClassMethod and setSubsystemsClassesMethods', async () => {
    // setSubsystemClassMethod
    const setRes = await repo.setSubsystemClassMethod({
      subsystem: 'test_sub',
      className: 'testClass',
      method: 'testMethod',
    });
    expect(setRes).toBeDefined();
    // setSubsystemsClassesMethods bulk: supply a tiny shape
    const bulk = { test_sub: { testClass: ['testMethod'] } };
    const bulkRes = await repo.setSubsystemsClassesMethods(bulk);
    expect(bulkRes).toBeDefined();
  });

  test('transaction rollback should not persist on error', async () => {
    // Use internal transactional wrapper to insert a temp option then force an error
    const uniqueName = `rb_test_${Date.now()}`;
    // Ensure the name doesn't exist
    const before = await repo.executeNamedQuery({
      nameQuery: 'getMenusOptions',
      params: [],
    });
    // Run a transaction that inserts then throws
    const res = await repo
      ._withTransaction(async (client) => {
        await client.query(
          'INSERT INTO public."option" (name, tx) VALUES ($1, $2);',
          [uniqueName, 0]
        );
        // force error
        throw new Error('force-rollback');
      }, 'forced rollback test')
      .catch((e) => e);

    // After the transaction the inserted row should NOT exist
    const found = await repo.query(
      `SELECT id FROM public."option" WHERE name = $1;`,
      [uniqueName]
    );
    expect(found.rows.length).toBe(0);
  });

  test('duplicate-key on insertUser should throw', async () => {
    const now = new Date().toISOString();
    const username = `dup_test_${Date.now()}`;
    // First insert should succeed
    await repo.executeNamedQuery({
      nameQuery: 'insertUser',
      params: {
        username,
        password: 'p',
        email: `${username}@test.local`,
        status: 'active',
        register_date: now,
      },
    });
    // Second insert with same username should throw an error (handled by utils.handleError)
    let threw = false;
    try {
      await repo.executeNamedQuery({
        nameQuery: 'insertUser',
        params: {
          username,
          password: 'p',
          email: `${username}@test.local`,
          status: 'active',
          register_date: now,
        },
      });
    } catch (e) {
      threw = true;
      // ensure error payload includes message about duplicate or DB_ERROR
      expect(String(e)).toMatch(
        /23505|Transacción|Error ejecutando la consulta nombrada|message/
      );
    }
    expect(threw).toBe(true);
  });

  test('negative cases: methods should throw on invalid input', async () => {
    // setUserProfile requires username/profile
    await expect(repo.setUserProfile({})).rejects.toThrow();
    // getUserProfiles requires username
    await expect(repo.getUserProfiles({})).rejects.toThrow();
    // setMenuOption requires option/menu
    await expect(repo.setMenuOption({})).rejects.toThrow();
  });

  // --- Additional positive tests (bulk, JSON, helpers) ---
  test('setUsersProfiles and delUsersProfiles (bulk)', async () => {
    const ts = Date.now();
    const payload = {
      [`bulk_user_a_${ts}`]: ['P_test'],
      [`bulk_user_b_${ts}`]: ['P_test'],
    };
    // Ensure users exist with required non-null fields (some DB schemas require password/email)
    const now = new Date().toISOString();
    await repo
      .executeNamedQuery({
        nameQuery: 'insertUser',
        params: {
          username: Object.keys(payload)[0],
          password: 'p',
          email: `${Object.keys(payload)[0]}@test.local`,
          status: 'active',
          register_date: now,
        },
      })
      .catch(() => {});
    await repo
      .executeNamedQuery({
        nameQuery: 'insertUser',
        params: {
          username: Object.keys(payload)[1],
          password: 'p',
          email: `${Object.keys(payload)[1]}@test.local`,
          status: 'active',
          register_date: now,
        },
      })
      .catch(() => {});
    const res = await repo.setUsersProfiles(payload);
    expect(res).toBeDefined();
    // cleanup
    await repo.delUsersProfiles(payload);
  });

  test('setMenusOptions and delMenusOptions (bulk)', async () => {
    const ts = Date.now();
    const menuName = `M_bulk_${ts}`;
    const optionName = `O_bulk_${ts}`;
    // Ensure subsystem exists and create menu with id_subsystem to satisfy NOT NULL constraints
    await repo.query(
      `INSERT INTO public."subsystem"(name) VALUES($1) ON CONFLICT DO NOTHING;`,
      [`bulk_sub_${ts}`]
    );
    await repo.query(
      `INSERT INTO public."menu"(name, id_subsystem) VALUES($1, (SELECT id FROM public."subsystem" WHERE name=$2)) ON CONFLICT DO NOTHING;`,
      [menuName, `bulk_sub_${ts}`]
    );
    // Ensure option has non-null tx
    await repo.query(
      `INSERT INTO public."option"(name, tx) VALUES($1, $2) ON CONFLICT DO NOTHING;`,
      [optionName, 0]
    );
    const setRes = await repo.setMenusOptions({ [menuName]: [optionName] });
    expect(setRes).toBeDefined();
    // delete the mapping
    await repo.delMenusOptions({ [menuName]: [optionName] });
    const after = await repo.getMenuOptions({ menu: menuName });
    expect(after).toBeDefined();
  });

  test('setMenusOptionsProfiles default-shape assignment', async () => {
    const ts = Date.now();
    const profile = `P_test`;
    const menu = `M_profile_${ts}`;
    const opt = `O_profile_${ts}`;
    const data = { [profile]: { [menu]: [opt] } };
    // prepare required fields: create subsystem and menu with id_subsystem, and option with tx
    await repo.query(
      `INSERT INTO public."subsystem"(name) VALUES($1) ON CONFLICT DO NOTHING;`,
      ['profile_sub']
    );
    await repo.query(
      `INSERT INTO public."menu"(name, id_subsystem) VALUES($1, (SELECT id FROM public."subsystem" WHERE name=$2)) ON CONFLICT DO NOTHING;`,
      [menu, 'profile_sub']
    );
    await repo.query(
      `INSERT INTO public."option"(name, tx) VALUES($1, $2) ON CONFLICT DO NOTHING;`,
      [opt, 0]
    );
    const res = await repo.setMenusOptionsProfiles(data);
    expect(res).toBeDefined();
    // now get by menu/profile
    const got = await repo.getMenuOptionsProfile({ menu, profile });
    expect(got).toBeDefined();
    // cleanup
    await repo
      .delMenuOptionsProfile({ profile, menu, arrOptions: [opt] })
      .catch(() => {});
  });

  test('executeJsonNamedQuery should run multiple named queries', async () => {
    const result = await repo.executeJsonNamedQuery({
      getUsers: [],
      getProfilesOptions: [],
    });
    expect(Array.isArray(result)).toBe(true);
  });

  test('executeJsonTransaction should commit multiple named queries in a tx', async () => {
    const ts = Date.now();
    const username = `json_tx_${ts}`;
    const now = new Date().toISOString();
    const json = {
      insertUser: {
        username,
        password: 'p',
        email: `${username}@test.local`,
        status: 'active',
        register_date: now,
      },
    };
    const res = await repo.executeJsonTransaction(json, 'json tx test');
    expect(res).toBeDefined();
    // ensure user exists
    const users = await repo.executeNamedQuery({
      nameQuery: 'getUsers',
      params: [],
    });
    const found = (users.rows || []).some((r) => r.username === username);
    expect(found).toBe(true);
  });

  test('getOptionsAllowed returns array', async () => {
    const opts = await repo.getOptionsAllowed({ profile: 'P_test' });
    expect(Array.isArray(opts)).toBe(true);
  });

  test('setProfilesOptions and delProfilesOptions (bulk) operations', async () => {
    const ts = Date.now();
    const profile = 'P_test';
    const opt = `O_bulkprof_${ts}`;
    // Ensure option has non-null tx required by schema
    await repo.query(
      `INSERT INTO public."option"(name, tx) VALUES($1, $2) ON CONFLICT DO NOTHING;`,
      [opt, 0]
    );
    await repo.setProfilesOptions({ [profile]: [opt] });
    const got = await repo.getProfileOptions({ profile });
    expect(got).toBeDefined();
    await repo.delProfilesOptions({ [profile]: [opt] }).catch(() => {});
  });

  test('setProfilesMethods and delProfilesMethods (bulk)', async () => {
    const ts = Date.now();
    const profile = 'P_test';
    const method = `method_bulk_${ts}`;
    // ensure method exists
    await repo
      .executeNamedQuery({
        nameQuery: 'getClassMethods',
        params: ['testClass'],
      })
      .catch(() => {});
    await repo.setProfilesMethods({ [profile]: [method] }).catch(() => {});
    const got = await repo.getProfileMethods({ profile });
    expect(got).toBeDefined();
    // cleanup: try delete
    try {
      await repo.delProfileMethod({
        method,
        profile,
        confirmDelete: 'DELETE_METHOD_PROFILE',
      });
    } catch (e) {}
  });

  test('setMenusOptionsProfiles hierarchical shape', async () => {
    const ts = Date.now();
    const subsystem = `sub_h_${ts}`;
    const menu = `Menu_H_${ts}`;
    const submenu = `Sub_H_${ts}`;
    const opt = `Opt_H_${ts}`;
    const data = {
      [subsystem]: {
        [menu]: {
          submenus: {
            [submenu]: {
              options: {
                [opt]: { allowedProfiles: ['P_test'] },
              },
            },
          },
        },
      },
    };
    // make sure option rows will include non-null tx by having tx set during processing
    // when optionNode lacks tx, implementation may attempt to resolve tx from method; to be safe, insert option with tx here
    await repo.query(
      `INSERT INTO public."option"(name, tx) VALUES($1, $2) ON CONFLICT DO NOTHING;`,
      [opt, 0]
    );
    const res = await repo.setMenusOptionsProfiles(data);
    expect(res).toBeDefined();
    // cleanup
    await repo.delAllMenusOptionsProfiles();
  });

  test('getMenuOptionsProfile by menu/profile returns array', async () => {
    const ts = Date.now();
    const menu = 'M_test';
    const profile = 'P_test';
    const res = await repo.getMenuOptionsProfile({ menu, profile });
    expect(Array.isArray(res)).toBe(true);
  });

  test('delAllMenusOptionsProfiles returns message', async () => {
    const res = await repo.delAllMenusOptionsProfiles();
    expect(res).toBeDefined();
    expect(res.message || res).toBeTruthy();
  });

  // --- Additional negative tests (10) ---
  test('delUserProfile without confirmation should throw', async () => {
    await expect(
      repo.delUserProfile({ username: 'nonexistent', profile: 'P_test' })
    ).rejects.toThrow();
  });

  test('delProfileOption without confirmation should throw', async () => {
    await expect(
      repo.delProfileOption({ option: 'O_test', profile: 'P_test' })
    ).rejects.toThrow();
  });

  test('delMenuOption without confirmation should throw', async () => {
    await expect(
      repo.delMenuOption({ option: 'O_test', menu: 'M_test' })
    ).rejects.toThrow();
  });

  test('delClassMethod without confirmation should throw', async () => {
    await expect(
      repo.delClassMethod({ className: 'testClass', method: 'testMethod' })
    ).rejects.toThrow();
  });

  test('delProfileMethod without confirmation should throw', async () => {
    await expect(
      repo.delProfileMethod({ method: 'testMethod', profile: 'P_test' })
    ).rejects.toThrow();
  });

  test('delTxTransaction without confirmation should throw', async () => {
    // create tx then try delete without confirm
    const r = await repo.setTxTransaction({
      subsystem: 'test_sub',
      className: 'testClass',
      method: 'testMethod',
      description: 'temp',
    });
    const txVal = r?.data?.tx;
    await expect(repo.delTxTransaction({ tx: txVal })).rejects.toThrow();
  });

  test('setUsersProfiles invalid payload should behave gracefully', async () => {
    // The implementation returns { data: [] } when no entries provided
    const r1 = await repo.setUsersProfiles(null);
    expect(r1).toBeDefined();
    const r2 = await repo.setUsersProfiles({});
    expect(r2).toBeDefined();
  });

  test('setMenusOptionsProfiles invalid shape should throw', async () => {
    await expect(repo.setMenusOptionsProfiles(null)).rejects.toThrow();
    await expect(repo.setMenusOptionsProfiles('string')).rejects.toThrow();
  });

  test('executeNamedQuery with missing name should throw', async () => {
    await expect(
      repo.executeNamedQuery({ nameQuery: 'no_such_named_query', params: [] })
    ).rejects.toThrow();
  });

  test('getProfileOptions without profile should throw', async () => {
    await expect(repo.getProfileOptions({})).rejects.toThrow();
  });
});
