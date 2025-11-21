import { subsystems, menus } from '../src/dbms/db-structure.js';
import bcrypt from 'bcrypt';
import DBMS from '../src/dbms/dbms.js';
import Repository from '../src/repository/repository.js';
import Debugger from '../src/debugger/debugger.js';
import Utils from '../src/utils/utils.js';
import Validator from '../src/validator/validator.js';
import Config from '../config/config.js';
import Formatter from '../src/formatter/formatter.js';

const methods = [];

// Instanciar primero Repository para que el singleton DBMS sea la subclase con todos los métodos
const repository = new Repository();
// Reusar la instancia como dbms genérico
const dbms = repository;
const validator = new Validator(dbms);
dbms.validator = validator;
const dbger = new Debugger();
const utils = new Utils();
const config = new Config();
const formatter = new Formatter();
await dbms.init();
const PROFILES = await config.getProfiles();

export const trailMethods = async () => {
  /********************************************************************* */

  const users = [
    {
      username: 'Bustos',
      password: 'QWEqwe123·',
      email: 'luisdavidbustosnunez@gmail.com',
    },
    {
      username: 'Bustoss',
      password: 'QWEqwe123·',
      email: 'luissdavidbustosnunez@gmail.com',
    },
  ];

  // ======================== PRUEBAS QUERIES.YAML ========================
  const unique = () => Date.now().toString(36).slice(-6);
  const userA = {
    username: 'user_' + unique(),
    password: 'Passw0rd·',
    email: 'user_' + unique() + '@example.com',
    status: 'active',
    register_date: new Date().toDateString(),
  };
  const profileName = 'profile_' + unique();
  const optionName = 'option_' + unique();
  const menuName = 'menu_' + unique();
  const subsystemName = 'subsystem_' + unique();
  const className = 'class_' + unique();
  const methodName = 'method_' + unique();

  const log = (label, data) =>
    console.log(
      `\n[TEST] ${label}:`,
      typeof data === 'object' ? JSON.stringify(data) : data
    );

  const getIdByName = async (table, nameFieldValue, nameField = 'name') => {
    const res = await dbms.getWhere({
      tableName: table,
      data: { keyValueData: { [nameField]: nameFieldValue } },
    });
    return res?.data?.[0]?.id || res?.rows?.[0]?.id;
  };

  const ensureByName = async () => {
    // Crear entidades base necesarias usando DBMS.insert (nombres únicos evitan conflicto)
    await dbms.insert({
      tableName: 'profile',
      data: { keyValueData: { name: profileName, description: profileName } },
    });
    await dbms.insert({
      tableName: 'option',
      data: {
        keyValueData: {
          name: optionName,
          description: optionName,
          tx: Date.now() % 100000,
        },
      },
    });
    await dbms.insert({
      tableName: 'subsystem',
      data: {
        keyValueData: { name: subsystemName, description: subsystemName },
      },
    });
    const id_subsystem = await getIdByName('subsystem', subsystemName);
    await dbms.insert({
      tableName: 'menu',
      data: {
        keyValueData: { name: menuName, description: menuName, id_subsystem },
      },
    });
    await dbms.insert({
      tableName: 'class',
      data: { keyValueData: { name: className, description: className } },
    });
    await dbms.insert({
      tableName: 'method',
      data: { keyValueData: { name: methodName, description: methodName } },
    });
    // Crear usuario base (para getUserWhere)
    await dbms.insert({ tableName: 'user', data: { keyValueData: userA } });
  };

  const execQN = async (nameQuery, objParams, arrayParamsIfNeeded = []) => {
    const qDef = dbms.queries?.[nameQuery];
    let paramsToSend = objParams;
    // Si el YAML no tiene schema+orderArray visibles, usar array fallback
    const hasFieldSchema =
      qDef &&
      typeof qDef === 'object' &&
      qDef.structure_params &&
      !qDef.structure_params.root;
    const hasOrder = qDef && Array.isArray(qDef.orderArray);
    if (!(hasFieldSchema && hasOrder)) {
      paramsToSend = arrayParamsIfNeeded;
    }
    try {
      const res = await dbms.executeNamedQuery({
        nameQuery,
        params: paramsToSend,
      });
      log(nameQuery, res?.rows ?? res);
      return res;
    } catch (e) {
      console.error(`[ERROR] ${nameQuery}:`, e?.message || e);
      return null;
    }
  };

  await ensureByName();

  // 1) Usuarios
  await execQN('insertUser', userA, [
    userA.username,
    userA.password,
    userA.email,
    userA.status,
    userA.register_date,
  ]);
  await execQN('getUserWhere', { username: userA.username }, [userA.username]);
  await execQN('deleteUserByUsername', { username: userA.username }, [
    userA.username,
  ]);

  // 2) Perfiles ↔ Opciones
  await execQN(
    'setProfileOption',
    { option_name: optionName, profile_name: profileName },
    [optionName, profileName]
  );
  await execQN('getProfileOptions', { profile_name: profileName }, [
    profileName,
  ]);
  await execQN('getProfilesOptions', {}, []);
  await execQN(
    'delProfileOption',
    { option_name: optionName, profile_name: profileName },
    [optionName, profileName]
  );

  // Reasignar para siguientes pruebas
  await execQN(
    'setProfileOption',
    { option_name: optionName, profile_name: profileName },
    [optionName, profileName]
  );

  // ===== Prueba del método Repository.getOptionsAllowed =====
  try {
    const allowed = await repository.getOptionsAllowed({
      profile: profileName,
    });
    log('getOptionsAllowed', allowed);
    if (!Array.isArray(allowed) || !allowed.includes(optionName)) {
      console.error(
        `[ERROR] getOptionsAllowed: se esperaba que incluyera '${optionName}' para el perfil '${profileName}'`
      );
    } else {
      console.log('[OK] getOptionsAllowed incluye la opción esperada');
    }
  } catch (e) {
    console.error(
      '[ERROR] getOptionsAllowed lanzó excepción:',
      e?.message || e
    );
  }

  // 3) Menús ↔ Opciones
  await execQN(
    'setMenuOption',
    { option_name: optionName, menu_name: menuName },
    [optionName, menuName]
  );
  await execQN('getMenuOptions', { menu_name: menuName }, [menuName]);
  await execQN('getMenusOptions', {}, []);

  // ======================== PRUEBA: Security.loadPermissions ========================
  try {
    const { default: Security } = await import('#security/security.js');
    const security = new Security();
    const permissions = await security.loadPermissions();
    const entries = Object.entries(permissions);
    console.log(
      `\n[TEST] Security.loadPermissions -> total claves: ${entries.length}`
    );
    console.log(
      '[TEST] Security.loadPermissions -> muestra (10):',
      entries.slice(0, 10)
    );
  } catch (err) {
    console.error(
      '[TEST] Security.loadPermissions falló:',
      err?.message || err
    );
  }

  // 4) Menú ↔ Opción ↔ Perfil
  await execQN(
    'getMenuOptionsProfile',
    { menu_name: menuName, profile_name: profileName },
    [menuName, profileName]
  );
  await execQN('getMenusOptionsProfile', { profile_name: profileName }, [
    profileName,
  ]);
  await execQN('getMenusOptionsProfiles', {}, []);
  await execQN(
    'delMenuOptionProfile',
    { option_name: optionName, menu_name: menuName, profile_name: profileName },
    [optionName, menuName, profileName]
  );

  // Reasignar para resto de pruebas
  await execQN(
    'setMenuOption',
    { option_name: optionName, menu_name: menuName },
    [optionName, menuName]
  );
  await execQN(
    'setProfileOption',
    { option_name: optionName, profile_name: profileName },
    [optionName, profileName]
  );

  // 5) Perfil ↔ Método
  await execQN(
    'setProfileMethod',
    { method_name: methodName, profile_name: profileName },
    [methodName, profileName]
  );
  await execQN('getProfileMethods', { profile_name: profileName }, [
    profileName,
  ]);
  await execQN('getProfilesMethods', {}, []);
  await execQN(
    'delProfileMethod',
    { method_name: methodName, profile_name: profileName },
    [methodName, profileName]
  );

  // 6) Clase ↔ Método
  await execQN(
    'setClassMethod',
    { class_name: className, method_name: methodName },
    [className, methodName]
  );
  await execQN('getClassMethods', { class_name: className }, [className]);
  await execQN('getClassesMethods', {}, []);
  await execQN(
    'delClassMethod',
    { class_name: className, method_name: methodName },
    [className, methodName]
  );

  // 7) Subsistema ↔ Clase ↔ Método
  await execQN(
    'setSubsystemClassMethod',
    { subsystem_name: subsystemName, class_name: className },
    [subsystemName, className]
  );
  await execQN(
    'getSubsystemClassesMethods',
    { subsystem_name: subsystemName },
    [subsystemName]
  );

  // 7.1) Menú ↔ Opción ↔ Perfil (CTE único)
  await execQN(
    'setMenuOptionProfile',
    { option_name: optionName, menu_name: menuName, profile_name: profileName },
    [optionName, menuName, profileName]
  );

  // Reemplazo de perfil en vínculo Opción↔Perfil manteniendo Opción↔Menú
  const profileName2 = 'profile_' + unique();
  await dbms.insert({
    tableName: 'profile',
    data: { keyValueData: { name: profileName2, description: profileName2 } },
  });
  await execQN(
    'replaceMenuOptionProfile',
    {
      option_name: optionName,
      menu_name: menuName,
      old_profile_name: profileName,
      new_profile_name: profileName2,
    },
    [optionName, menuName, profileName, profileName2]
  );
  await execQN('getMenusOptionsProfile', { profile_name: profileName2 }, [
    profileName2,
  ]);
  // Limpieza del reemplazo
  await execQN(
    'delMenuOptionProfile',
    {
      option_name: optionName,
      menu_name: menuName,
      profile_name: profileName2,
    },
    [optionName, menuName, profileName2]
  );

  // 8) Limpieza opcional (descomentar si quieres reset total)
  // await execQN('delAllMenusOptionsProfiles', {}, []);

  // 9) Usuario ↔ Perfil (CTE único)
  const userB = {
    username: 'user_' + unique(),
    password: 'Passw0rd·',
    email: 'user_' + unique() + '@example.com',
    status: 'active',
    register_date: new Date().toDateString(),
  };
  await execQN('insertUser', userB, [
    userB.username,
    userB.password,
    userB.email,
    userB.status,
    userB.register_date,
  ]);
  await execQN(
    'setUserProfile',
    { username: userB.username, profile_name: profileName },
    [userB.username, profileName]
  );
  await execQN('getUserProfiles', { username: userB.username }, [
    userB.username,
  ]);
  await execQN(
    'delUserProfile',
    { username: userB.username, profile_name: profileName },
    [userB.username, profileName]
  );
  await execQN('deleteUserByUsername', { username: userB.username }, [
    userB.username,
  ]);

  // 10) Helpers de transacción (CTE único)
  const txDesc = 'tx_desc_' + unique();
  const txSet = await execQN(
    'setTxTransaction',
    {
      subsystem_name: subsystemName,
      class_name: className,
      method_name: methodName,
      description: txDesc,
    },
    [subsystemName, className, methodName, txDesc]
  );
  const txId = txSet?.rows?.[0]?.tx || txSet?.data?.[0]?.tx;
  await execQN(
    'getTxTransactionByNames',
    {
      subsystem_name: subsystemName,
      class_name: className,
      method_name: methodName,
    },
    [subsystemName, className, methodName]
  );
  if (txId) {
    await execQN('getTxTransactionById', { tx: Number(txId) }, [Number(txId)]);
    await execQN('delTxTransactionById', { tx: Number(txId) }, [Number(txId)]);
  }

  const jsonProfiles = {
    Bustos: ['administrador de seguridad', 'participante'],
    Bustoss: ['administrador de eventos'],
  };

  const objParamsTest = {
    user1: [PROFILES.EVENT_ADMIN.name, PROFILES.SECURITY_ADMIN.name],
    user2: [PROFILES.PARTICIPANT.name, PROFILES.SUPER_ADMIN.name],
    user3: [PROFILES.SUPER_ADMIN.name],
  };

  const arrParamsTest = [
    {
      username: 'user1',
      profiles: PROFILES.EVENT_ADMIN.name,
    },
    {
      username: 'user2',
      profiles: PROFILES.PARTICIPANT.name,
    },
    { username: 'user3', profiles: PROFILES.SUPER_ADMIN.name },
  ];

  // ---------------------------------------------------------------  //
  // ---------------------------------------------------------------  //
  // --------------------------- PRUEBAS ---------------------------  //
  // ---------------------------------------------------------------  //
  // ---------------------------------------------------------------  //

  // --- PRUEBA DE CONSTRUCCIÓN DE CONSULTA SQL DINÁMICA ---

  const tableName = 'user';
  const data = {
    username: 'Bustos',
    email: 'luisdavidbustosnunez@gmail.com',
  };
  const keys = Object.keys(data);
  const values = Object.values(data);
  const queryString = `SELECT * FROM public.${tableName} WHERE ${keys.map((f, i) => `${f} = $${i + 1}`).join(' AND ')};`;

  // console.log(await testSqlQueryString({ values, queryString }));

  // ---------------------------------------------------------------  //
  // ---------------- PRUEBA DE OBTENCIÓN DE USUARIO ---------------  //
  // ---------------------------------------------------------------  //

  // await dbms
  //   .getUsersWhere({
  //     keyValueData: {
  //       username: 'Bustos1',
  //     },
  //   })
  //   .then((res) => {
  //     console.log(res);
  //   });

  // ---------------------------------------------------------------  //
  // ---------------- PRUEBA DE INSERCIÓN DE USUARIO ---------------  //
  // ---------------------------------------------------------------  //

  // insertUser({
  //   keyValueData: {
  //     username: 'Bustos1',
  //     password: 'QWEqwe123·',
  //     email: 'luis1davidbustosnunez@gmail.com',
  //     status: 'active',
  //     register_date: new Date().toDateString(),
  //   },
  // });

  // ---------------------------------------------------------------  //
  // -------- PRUEBAS DE VALIDACIÓN DE ESTRUCTURAS DE DATOS --------  //
  // ---------------------------------------------------------------  //

  // const errors = validator.validateStructuredData(
  //   {
  //     item1: ['string1', 'string2', 'string3'],
  //     int: 123,
  //     float: 12.34,
  //     date: new Date(),
  //     bool: true,
  //     obj: { key1: 'value1', key2: 2 },
  //     obj2: { key1: 'value1', key2: 2 },
  //     str: 'a sample string',
  //   },
  //   {
  //     item1: 'strings_array',
  //     int: 'string',
  //     float: 'boolean',
  //     date: 'date',
  //     bool: 'boolean',
  //     obj: 'object',
  //     obj2: {
  //       key1: 'string',
  //       key2: 'string',
  //     },
  //     str: 'string',
  //   }
  // );
  // console.log('Validation Errors:', errors);

  //

  // ---------------------------------------------------------------  //
  // --------------- PRUEBAS DE MÉTODOS DE MAPEADOR ----------------  //
  // ---------------------------------------------------------------  //

  // --- PRUEBA DE MAPEADOR DE ARRAY A ARRAY ---
  // console.log(formatter.mapArrayParams(arrParamsTest, ['username', 'profiles']));

  // --- PRUEBA DE MAPEADOR DE OBJETO A ARRAY ---
  // console.log(formatter.mapObjectParams(objParamsTest));

  // --- PRUEBA DE CONVERSIÓN DE ESTRUCTURA A ARRAY ORDENADO ---

  // console.log(
  //   formatter.structureToOrderedArray(
  //     {
  //       username: 'Bustos',
  //       id: 123,
  //       isActive: true,
  //       profile: { name: 'admin', description: 'Administrator profile' },
  //       arrayTest: [1, 2, 3],
  //       floatValue: 12.34,
  //       dateValue: new Date(),
  //       nestedObject: { key1: 'value1', key2: 2 },
  //     },
  //     [
  //       'id',
  //       'username',
  //       'isActive',
  //       'profile',
  //       'floatValue',
  //       'nestedObject',
  //       'arrayTest',
  //     ]
  //   )
  // );

  // ---------------------------------------------------------------  //
  // ---------- PRUEBA DE ASIGNACIÓN DE PERFIL A USUARIO -----------  //
  // ---------------------------------------------------------------  //

  // console.log(await dbms
  //   .setUserProfile({
  //     username: 'Bustos1',
  //     profile: PROFILES.EVENT_ADMIN.name,
  //   })
  //   .then((res) => res));

  // ---------------------------------------------------------------  //
  // --------- PRUEBA DE ASIGNACIÓN DE PERFILES A USUARIOS ---------  //
  // ---------------------------------------------------------------  //

  // console.log(
  //   await dbms
  //     .setUsersProfiles({
  //       Bustos1: [PROFILES.SECURITY_ADMIN.name, PROFILES.PARTICIPANT.name],
  //     })
  //     .then((res) => res)
  // );

  // ---------------------------------------------------------------  //
  // ---- PRUEBA DE QUERY. OBTENCIÓN DE USUARIOS Y SUS PERFILES ----  //
  // ---------------------------------------------------------------  //

  // const queryTest = 'getUsersProfiles';
  // const queryTestValues = [];

  // console.log(`--- TEST QUERY ${queryTest} ---`);
  // const queryResult = await dbms
  //   .query(dbms.queries[queryTest], queryTestValues)
  //   .then((res) => res.rows);
  // console.log('Result:', queryResult);

  //

  // ---------------------------------------------------------------  //
  // -- PRUEBA DE TRANSACCIÓN: inserción, obtención y eliminación --  //
  // ---------------------------------------------------------------  //
  const testUsername = 'trans_test_user';
  const testEmail = 'trans_test_user@example.com';
  const testPassword = 'Test1234';
  // Usar los nombres de los queries definidos en queries.yaml
  const transactionParams = {
    insertUser: [
      testUsername,
      testPassword,
      testEmail,
      'active',
      new Date().toDateString(),
    ],
    getUserWhere: [testUsername],
    deleteUserByUsername: [testUsername],
  };
  // console.log(
  //   '--- INICIANDO TRANSACCIÓN DE INSERCIÓN, OBTENCIÓN Y ELIMINACIÓN ---'
  // );
  // const transactionResult =
  //   await dbms.executeJsonTransaction(transactionParams);
  // console.log('Resultado de la transacción:', transactionResult);

  // Nota: no cerramos el pool aquí para no interferir con otras suites.
  // Usa runRepositoryTests() o un teardown dedicado para finalizar el pool.
  // await dbms.poolDisconnection();
};

// Ejecutar pruebas de trail sólo bajo flag explícita para evitar interferencias
if (process.env.TEST_TRAIL_METHODS === 'true') {
  trailMethods();
}

const testValidationObject = () => {
  const errors = validator.validateStructuredData(
    {
      item1: ['string1', 'string2', 'string3'],
      int: 123,
      float: 12.34,
      date: new Date(),
      bool: true,
      obj: { key1: 'value1', key2: 2 },
      obj2: { key1: 'value1', key2: 2 },
      str: 'a sample string',
    },
    {
      item1: 'strings_array',
      int: 'int',
      float: 'float',
      date: 'date',
      bool: 'boolean',
      obj: 'object',
      obj2: {
        key1: 'string',
        key2: 'int',
      },
      str: 'string',
    }
  );
  console.log('Validation Errors:', errors);
};
testValidationObject();

const updateProfile = async ({ name = '', description = '' }) => {
  console.log('--- UPDATE PROFILE ---');
  await dbms
    .query('UPDATE public.profile SET description = $1 WHERE name = $2;', [
      description,
      name,
    ])
    .then((res) => {
      console.log(res);
    });
};

const deleteProfile = async ({ name }) => {
  console.log('--- DELETE PROFILE ---');
  await dbms
    .query('DELETE FROM public.profile WHERE name = $1;', [name])
    .then((res) => {
      console.log(res.rowCount > 0);
    });
};

const getUsersProfiles = async (userData) => {
  await dbms.getUsersWhere(userData).then(async (res) => {
    for (const user of res.data) {
      const userId = user.id;
      await dbms
        .getUserProfilesWhere({
          keyValueData: {
            user_id: userId,
          },
        })
        .then((resProfiles) => {
          console.log('User Profiles:', resProfiles);
        });
    }
  });
};

const printQueries = (ammo, start = 0) => {
  const end = start + ammo;
  console.log('--- QUERIES FROM CONFIG ---');
  Object.keys(dbms.queries).forEach((query, index) => {
    if (index > start && index < end) {
      console.log(query, '=>', dbms.queries[query], '\n');
    }
  });
};

// ================== PRUEBAS DE REPOSITORY ==================
// Generador de datos simples para creación de entidades
const uniqueSuffix = () => Date.now().toString(36).slice(-6);

const sampleData = {
  user: () => ({
    username: 'test_user_' + uniqueSuffix(),
    email: 'user_' + uniqueSuffix() + '@example.com',
    password: 'TestPass1·',
    status: 'active',
    register_date: new Date().toDateString(),
  }),
  profile: () => ({
    name: 'profile_' + uniqueSuffix(),
    description: 'Descripción perfil de prueba',
  }),
  subsystem: () => ({
    name: 'subsystem_' + uniqueSuffix(),
    description: 'Desc subsistema',
  }),
  class: () => ({ name: 'class_' + uniqueSuffix(), description: 'Desc clase' }),
  method: () => ({
    name: 'method_' + uniqueSuffix(),
    description: 'Desc método',
  }),
  menu: (subsystemName) => ({
    subsystem: subsystemName,
    menu: 'menu_' + uniqueSuffix(),
    description: 'Desc menú',
  }),
  option: () => ({
    option: 'option_' + uniqueSuffix(),
    description: 'Desc opción',
    tx: 'tx_' + uniqueSuffix(),
  }),
};

// ============== SEEDING/FIXTURES PARA PRUEBAS ==============
const q = (name) => `"${name}"`;
const schemaTable = (table) => `public.${q(table)}`;

const ensureEntity = async (table, fields) => {
  const keyField = Object.prototype.hasOwnProperty.call(fields, 'username')
    ? 'username'
    : 'name';
  const keyValue = fields[keyField];
  if (!keyValue) throw new Error(`Falta campo clave para ${table}`);
  const sel = `SELECT id FROM ${schemaTable(table)} WHERE ${q(keyField)} = $1 LIMIT 1;`;
  const resSel = await dbms.query({ query: sel, params: [keyValue] });
  if (resSel?.rows?.[0]?.id) return resSel.rows[0].id;
  const keys = Object.keys(fields);
  const cols = keys.map((k) => q(k)).join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const vals = keys.map((k) => fields[k]);
  const ins = `INSERT INTO ${schemaTable(table)} (${cols}) VALUES (${placeholders}) RETURNING id;`;
  const resIns = await dbms.query({ query: ins, params: vals });
  return resIns?.rows?.[0]?.id;
};

const seedRepositoryFixtures = async () => {
  console.group('== SEED DE DATOS PARA PRUEBAS ==');
  try {
    // Usuario base
    const username = 'repo_user_test';
    const email = 'repo_user_test@example.com';
    const passHash = await bcrypt.hash('RepoTest1·', 10);
    const userId = await ensureEntity('user', {
      username,
      email,
      password: passHash,
      status: 'active',
      register_date: new Date(),
    });
    console.log('Usuario listo:', username, 'id:', userId);

    // Perfil base (si no quieres depender de Config.PROFILES)
    const profileName = PROFILES?.PARTICIPANT?.name || 'repo_profile_test';
    const profileId = await ensureEntity('profile', {
      name: profileName,
      description: 'Perfil de prueba para repository',
    });
    console.log('Perfil listo:', profileName, 'id:', profileId);

    // Subsystem/Class/Method base
    const subsystemName = 'repo_subsystem_test';
    const subsystemId = await ensureEntity('subsystem', {
      name: subsystemName,
      description: 'Subsistema de prueba',
    });
    console.log('Subsistema listo:', subsystemName, 'id:', subsystemId);

    const className = 'repo_class_test';
    const classId = await ensureEntity('class', {
      name: className,
      description: 'Clase de prueba',
    });
    console.log('Clase lista:', className, 'id:', classId);

    const methodName = 'repo_method_test';
    const methodId = await ensureEntity('method', {
      name: methodName,
      description: 'Método de prueba',
    });
    console.log('Método listo:', methodName, 'id:', methodId);

    // Menu base (requiere id_subsystem)
    const menuName = 'repo_menu_test';
    const selMenu = `SELECT id FROM ${schemaTable('menu')} WHERE ${q('name')} = $1 LIMIT 1;`;
    const resMenuSel = await dbms.query({ query: selMenu, params: [menuName] });
    let menuId = resMenuSel?.rows?.[0]?.id;
    if (!menuId) {
      const insMenu = `INSERT INTO ${schemaTable('menu')} (${q('id_subsystem')}, ${q('name')}, ${q('description')}) VALUES ($1, $2, $3) RETURNING id;`;
      const resMenuIns = await dbms.query({
        query: insMenu,
        params: [subsystemId, menuName, 'Menú de prueba'],
      });
      menuId = resMenuIns?.rows?.[0]?.id;
    }
    console.log('Menú listo:', menuName, 'id:', menuId);

    // Transaction base (para campo tx entero en option)
    let transactionId = null;
    try {
      const txCode = 'repo_tx_seed_' + uniqueSuffix();
      const insTx = `INSERT INTO ${schemaTable('transaction')} (${q('tx')}, ${q('description')}, ${q('id_subsystem')}, ${q('id_class')}, ${q('id_method')}) VALUES ($1,$2,$3,$4,$5) RETURNING id;`;
      const resTx = await dbms.query({
        query: insTx,
        params: [
          txCode,
          'Transacción seed para opción',
          subsystemId,
          classId,
          methodId,
        ],
      });
      transactionId = resTx?.rows?.[0]?.id;
      console.log('Transacción lista: txCode', txCode, 'id:', transactionId);
    } catch (e) {
      console.error('No se pudo crear transacción seed, usando fallback tx=1');
      transactionId = 1; // fallback
    }

    // Option base (tx entero requerido)
    const optionName = 'repo_option_test';
    // Insertar opción sin campo tx (posible columna entera en BD real)
    let optionId;
    try {
      const insOpt = `INSERT INTO ${schemaTable('option')} (${q('name')}, ${q('description')}, ${q('tx')}) VALUES ($1,$2,$3) RETURNING id;`;
      const resOpt = await dbms.query({
        query: insOpt,
        params: [optionName, 'Opción de prueba', transactionId],
      });
      optionId = resOpt?.rows?.[0]?.id;
      console.log(
        'Opción lista:',
        optionName,
        'id:',
        optionId,
        'tx:',
        transactionId
      );
    } catch (e) {
      console.error(
        'Error creando opción con tx, intentando ensureEntity sin tx (puede fallar si NOT NULL).'
      );
      optionId = await ensureEntity('option', {
        name: optionName,
        description: 'Opción de prueba (fallback)',
      });
      console.log('Opción fallback lista:', optionName, 'id:', optionId);
    }

    console.groupEnd();
    return {
      user: { username },
      profile: { name: profileName },
      subsystem: { name: subsystemName },
      className: { name: className },
      method: { name: methodName },
      menu: { name: menuName },
      option: { name: optionName },
    };
  } catch (err) {
    console.error('Error en seed de pruebas:', err.message || err);
    console.groupEnd();
    throw err;
  }
};

// Helper de validación estructural antes de llamar métodos
const validateInput = (label, data, expectedType = 'object') => {
  const isValid = validator.validateField(data, expectedType);
  if (!isValid) {
    console.error(
      `[VALIDATION ERROR] ${label}: se esperaba tipo ${expectedType}`
    );
    return false;
  }
  return true;
};

// Wrapper para ejecutar y loguear pruebas
const runTest = async ({ name, method, data, expectError = false }) => {
  console.group(`TEST: ${name}`);
  try {
    if (name === 'handleGetSetData') {
      console.log('Precheck typeof data.method:', typeof data?.method);
      console.log(
        'Precheck typeof data.methodIfNotFound:',
        typeof data?.methodIfNotFound
      );
    }
    if (data && !validateInput(name, data)) {
      console.groupEnd();
      return { name, skipped: true };
    }
    if (typeof repository[method] !== 'function') {
      console.error(`Método ${method} no existe en Repository`);
      console.groupEnd();
      return { name, error: 'missing_method' };
    }
    const result = await repository[method](data || {});
    console.log('Resultado:', result);
    console.groupEnd();
    return { name, success: !expectError };
  } catch (err) {
    if (expectError) {
      console.log('Error esperado:', err.message || err);
      console.groupEnd();
      return { name, success: true, expectedError: true };
    }
    console.error('Error en prueba:', err.message || err);
    console.groupEnd();
    return { name, error: err };
  }
};

// Construcción de conjunto de pruebas básicas para cada método del repositorio
// Nota: Muchos métodos requieren datos existentes en BD; estas pruebas son "smoke tests" y pueden fallar si faltan FK.
const buildRepositoryTests = (fixtures) => {
  const userA = { username: fixtures.user.username };
  const profileA = { name: fixtures.profile.name };
  const subsystemA = { name: fixtures.subsystem.name };
  const classA = { name: fixtures.className.name };
  const methodA = { name: fixtures.method.name };
  const optionA = {
    option: fixtures.option.name,
    description: 'Desc opción seed',
  };

  return [
    {
      name: 'setUserProfile',
      method: 'setUserProfile',
      data: {
        userData: { username: userA.username },
        profileData: { name: profileA.name },
      },
    },
    {
      name: 'getUserProfiles',
      method: 'getUserProfiles',
      data: { username: userA.username },
    },
    { name: 'getUsersProfiles', method: 'getUsersProfiles', data: {} },
    {
      name: 'setUsersProfiles',
      method: 'setUsersProfiles',
      data: { [userA.username]: [profileA.name] },
    },
    {
      name: 'delUserProfile',
      method: 'delUserProfile',
      data: {
        username: userA.username,
        profile: profileA.name,
        confirmDelete: 'DELETE_user_profile'.toUpperCase(),
      },
    },
    // NEGATIVA: intentar obtener perfiles de usuario tras borrado
    {
      name: 'getUserProfiles_afterDelUserProfile',
      method: 'getUserProfiles',
      data: { username: userA.username },
      // tras borrar, debe devolver lista vacía (no error)
    },
    {
      name: 'setProfileOption',
      method: 'setProfileOption',
      data: {
        profile: profileA.name,
        option: optionA.option,
        description: optionA.description,
      },
    },
    {
      name: 'getProfileOptions',
      method: 'getProfileOptions',
      data: { profile: profileA.name },
    },
    { name: 'getProfilesOptions', method: 'getProfilesOptions', data: {} },
    {
      name: 'delProfileOption',
      method: 'delProfileOption',
      data: {
        profile: profileA.name,
        option: optionA.option,
        confirmDelete: 'DELETE_option_profile'.toUpperCase(),
      },
    },
    // NEGATIVA: intentar obtener opciones de perfil tras borrado
    {
      name: 'getProfileOptions_afterDelProfileOption',
      method: 'getProfileOptions',
      data: { profile: profileA.name },
      // tras borrar, debe devolver lista vacía (no error)
    },
    {
      name: 'setMenuOptionProfile',
      method: 'setMenuOptionProfile',
      data: {
        menu: fixtures.menu.name,
        option: optionA.option,
        profile: profileA.name,
      },
    },
    {
      name: 'getMenuOptionsProfile',
      method: 'getMenuOptionsProfile',
      data: { menu: fixtures.menu.name, profile: profileA.name },
    },
    {
      name: 'getMenusOptionsProfiles',
      method: 'getMenusOptionsProfiles',
      data: {},
    },
    {
      name: 'delMenuOptionsProfile',
      method: 'delMenuOptionsProfile',
      data: {
        menu: fixtures.menu.name,
        arrOptions: [optionA.option],
        profile: profileA.name,
        // Se requieren DOS confirmaciones: una para option_menu y otra para option_profile
        confirmDelete: 'DELETE_OPTION_MENU',
        confirmDelete2: 'DELETE_OPTION_PROFILE',
      },
    },
    // NEGATIVA: intentar obtener opciones de menú/perfil tras borrado
    {
      name: 'getMenuOptionsProfile_afterDelMenuOptionsProfile',
      method: 'getMenuOptionsProfile',
      data: { menu: fixtures.menu.name, profile: profileA.name },
      // tras borrar, debe devolver lista vacía (no error)
    },
    {
      name: 'setProfileMethod',
      method: 'setProfileMethod',
      data: {
        profile: profileA.name,
        method: methodA.name,
        description: methodA.description,
      },
    },
    {
      name: 'getProfileMethods',
      method: 'getProfileMethods',
      data: { profile: profileA.name },
    },
    { name: 'getProfilesMethods', method: 'getProfilesMethods', data: {} },
    {
      name: 'delProfileMethod',
      method: 'delProfileMethod',
      data: {
        profile: profileA.name,
        method: methodA.name,
        confirmDelete: 'DELETE_method_profile'.toUpperCase(),
      },
    },
    // NEGATIVA: intentar obtener métodos de perfil tras borrado
    {
      name: 'getProfileMethods_afterDelProfileMethod',
      method: 'getProfileMethods',
      data: { profile: profileA.name },
      // tras borrar, debe devolver lista vacía (no error)
    },
    {
      name: 'setClassMethod',
      method: 'setClassMethod',
      data: {
        className: classA.name,
        method: methodA.name,
        description: methodA.description,
      },
    },
    {
      name: 'getClassMethods',
      method: 'getClassMethods',
      data: { className: classA.name },
    },
    { name: 'getClassesMethods', method: 'getClassesMethods', data: {} },
    {
      name: 'delClassMethod',
      method: 'delClassMethod',
      data: {
        className: classA.name,
        method: methodA.name,
        confirmDelete: 'DELETE_class_method'.toUpperCase(),
      },
    },
    // NEGATIVA: intentar obtener métodos de clase tras borrado
    {
      name: 'getClassMethods_afterDelClassMethod',
      method: 'getClassMethods',
      data: { className: classA.name },
      // tras borrar, debe devolver lista vacía (no error)
    },
    {
      name: 'setSubsystemClassMethod',
      method: 'setSubsystemClassMethod',
      data: {
        subsystem: subsystemA.name,
        className: classA.name,
        method: methodA.name,
        description: methodA.description,
      },
    },
    {
      name: 'getSubsystemClassesMethods',
      method: 'getSubsystemClassesMethods',
      data: { subsystem: subsystemA.name },
    },
    {
      name: 'getSubsystemsClassesMethods',
      method: 'getSubsystemsClassesMethods',
      data: {},
    },
    {
      name: 'delSubsystemClassMethod',
      method: 'delSubsystemClassMethod',
      data: {
        subsystem: subsystemA.name,
        className: classA.name,
        method: methodA.name,
        // Se requieren DOS confirmaciones: una para class_method y otra para subsystem_class
        confirmDelete: 'DELETE_CLASS_METHOD',
        confirmDelete2: 'DELETE_SUBSYSTEM_CLASS',
      },
    },
    // NEGATIVA: intentar obtener métodos de subsistema tras borrado
    {
      name: 'getSubsystemClassesMethods_afterDelSubsystemClassMethod',
      method: 'getSubsystemClassesMethods',
      data: { subsystem: subsystemA.name },
      // tras borrar, debe devolver lista vacía (no error)
    },
    {
      name: 'setTxTransaction',
      method: 'setTxTransaction',
      data: {
        subsystem: subsystemA.name,
        className: classA.name,
        method: methodA.name,
        description: 'Tx test',
      },
    },
    {
      name: 'getTxTransaction',
      method: 'getTxTransaction',
      data: {
        subsystem: subsystemA.name,
        className: classA.name,
        method: methodA.name,
      },
    },
    {
      name: 'handleGetSetData',
      method: 'handleGetSetData',
      data: {
        method: repository.getProfileMethods.bind(repository),
        methodIfNotFound: repository.setProfileMethod.bind(repository),
        data: { profile: profileA.name },
        dataIfNotFound: { method: methodA.name, profile: profileA.name },
      },
    },
    {
      name: 'backupSubsystemsClassesMethodsReverseOrder',
      method: 'backupSubsystemsClassesMethodsReverseOrder',
      data: {},
    },
  ];
};

const runRepositoryTests = async () => {
  console.group('== INICIO PRUEBAS REPOSITORY ==');
  // Preparar datos previos
  const fixtures = await seedRepositoryFixtures();
  // Crear transacciones específicas para pruebas de borrado
  const txDelRes = await repository.setTxTransaction({
    subsystem: fixtures.subsystem.name,
    className: fixtures.className.name,
    method: fixtures.method.name,
    description: 'Tx test del',
  });
  const txForDeletion = txDelRes?.data?.tx;

  const txAllRes = await repository.setTxTransaction({
    subsystem: fixtures.subsystem.name,
    className: fixtures.className.name,
    method: fixtures.method.name,
    description: 'Tx test all del',
  });

  // Tx específico para replaceMenusOptionsProfiles (constant shape) y pruebas con methodRef
  const replaceTxRes = await repository.setTxTransaction({
    subsystem: 'repo_subsystem_replace',
    className: 'ReplaceClass',
    method: 'ReplaceMethod',
    description: 'Tx para replaceMenusOptionsProfiles',
  });
  const replaceTxId = replaceTxRes?.data?.tx;

  const tests = buildRepositoryTests(fixtures);
  // --- PRUEBAS AGRESIVAS (bulk replace/delete) ---
  // 1) replaceMenusOptionsProfiles con forma simple por perfil
  // Caso 1: forma por perfil (se espera error si la columna id_subsystem es NOT NULL y no se provee)
  tests.push({
    name: 'replaceMenusOptionsProfiles_profileShape',
    method: 'replaceMenusOptionsProfiles',
    data: {
      [fixtures.profile.name]: {
        [fixtures.menu.name]: [fixtures.option.name],
      },
    },
    expectError: true,
  });
  // Caso 2: forma constante con subsistema -> debería tener éxito
  tests.push({
    name: 'replaceMenusOptionsProfiles_constantShape',
    method: 'replaceMenusOptionsProfiles',
    data: {
      repo_subsystem_replace: {
        TestMenuReplace: {
          options: {
            TestOptionReplace: {
              allowedProfiles: [fixtures.profile.name],
              method: {
                subsystem: 'repo_subsystem_replace',
                className: 'ReplaceClass',
                method: 'ReplaceMethod',
              },
            },
          },
        },
      },
    },
    expectError: false,
  });
  // Caso 2b: forma por perfil con tx en línea "Opción|tx" -> debería tener éxito
  const inlineOptionName = 'InlineOption_' + Date.now().toString(36).slice(-5);
  tests.push({
    name: 'setMenusOptionsProfiles_profileShape_withInlineTx',
    method: 'setMenusOptionsProfiles',
    data: {
      [fixtures.profile.name]: {
        [fixtures.menu.name]: [inlineOptionName + '|' + replaceTxId],
      },
    },
    expectError: true,
  });
  // 1c) setMenuOptionProfile simple con referencia a método (resolución automática de tx)
  const optWithMethodRef =
    'OptWithMethodRef_' + Date.now().toString(36).slice(-5);
  tests.push({
    name: 'setMenuOptionProfile_withMethodRef',
    method: 'setMenuOptionProfile',
    data: {
      menu: fixtures.menu.name,
      option: optWithMethodRef,
      profile: fixtures.profile.name,
      subsystem: 'repo_subsystem_replace',
      className: 'ReplaceClass',
      method: 'ReplaceMethod',
    },
    expectError: false,
  });
  // 2) delAllMenusOptionsProfiles para limpiar por completo
  tests.push({
    name: 'delAllMenusOptionsProfiles',
    method: 'delAllMenusOptionsProfiles',
    data: {},
  });
  // NEGATIVA: intentar leer menús/opciones/perfiles tras limpiar todo
  tests.push({
    name: 'getMenusOptionsProfiles_afterDelAll',
    method: 'getMenusOptionsProfiles',
    data: {},
    // tras borrar todo, debe devolver lista vacía (no error)
  });
  // 3) replaceSubsystemsClassesMethods con payload mínimo
  tests.push({
    name: 'replaceSubsystemsClassesMethods',
    method: 'replaceSubsystemsClassesMethods',
    data: {
      [fixtures.subsystem.name]: {
        [fixtures.className.name]: [fixtures.method.name],
      },
    },
  });
  // Añadir pruebas de eliminación de transacciones
  tests.push({
    name: 'delTxTransaction',
    method: 'delTxTransaction',
    data: { confirmDelete: 'DELETE_TRANSACTION', tx: txForDeletion },
  });
  tests.push({
    name: 'delAllTxTransaction',
    method: 'delAllTxTransaction',
    data: { confirmDelete: 'DELETE_ALL_TRANSACTION' },
  });
  // Verificar NOT_FOUND tras eliminar todas las transacciones
  tests.push({
    name: 'getTxTransactionAfterDeleteAll',
    method: 'getTxTransaction',
    data: {
      subsystem: fixtures.subsystem.name,
      className: fixtures.className.name,
      method: fixtures.method.name,
    },
    expectError: true,
  });
  // Verificar NOT_FOUND tras delTxTransaction (debe fallar y contarse como éxito esperado)
  tests.push({
    name: 'getTxTransactionAfterDelete',
    method: 'getTxTransaction',
    data: { tx: txForDeletion },
    expectError: true,
  });
  // 4) delAllSubsystemsClassesMethods al final para no afectar pruebas previas
  tests.push({
    name: 'delAllSubsystemsClassesMethods',
    method: 'delAllSubsystemsClassesMethods',
    data: {},
  });
  const results = [];
  for (const test of tests) {
    results.push(await runTest(test));
  }
  console.groupEnd();
  console.group('== RESUMEN PRUEBAS REPOSITORY ==');
  const ok = results.filter((r) => r.success).length;
  const fail = results.filter((r) => r.error).length;
  const skipped = results.filter((r) => r.skipped).length;
  console.log(`Éxitos: ${ok}, Fallos: ${fail}, Omitidos: ${skipped}`);
  results.forEach((r) => console.log(r.name, '=>', r));
  console.groupEnd();
  // Teardown opcional para limpiar seeds si está habilitado
  if (process.env.TEST_TEARDOWN === 'true') {
    await teardownRepositoryFixtures(fixtures);
  }
  // Cerrar pool al final
  await dbms.poolDisconnection();
};

// Ejecutar automáticamente si se llama con flag de entorno TEST_REPOSITORY
// Ajuste temporal: ejecutar SOLO el test de Security.loadPermissions y comentar el resto de pruebas
if (process.env.TEST_REPOSITORY === 'true') {
  (async () => {
    try {
      // Purga de tablas (excepto user, user_profile, profile) controlada por SKIP_PURGE
      const skipPurge =
        String(process.env.SKIP_PURGE || '').toLowerCase() === 'true';
      if (!skipPurge) {
        const preserve = new Set(['user', 'user_profile', 'profile']);
        // Orden seguro: primero tablas join, luego transaction y finalmente tablas base
        const deletionOrder = [
          'option_menu',
          'option_profile',
          'class_method',
          'method_profile',
          'subsystem_class',
          'transaction',
          'option',
          'menu',
          'method',
          'class',
          'subsystem',
        ].filter((t) => !preserve.has(t));
        console.group(
          '== PURGA DE TABLAS (excepto user, user_profile, profile) =='
        );
        for (const table of deletionOrder) {
          try {
            const sql = `DELETE FROM public."${table}";`;
            const res = await dbms.query({ query: sql, params: [] });
            console.log(`Limpieza de ${table}: OK`, res?.rowCount ?? '');
          } catch (err) {
            console.warn(`Limpieza de ${table}: WARN ->`, err?.message || err);
          }
        }
        console.groupEnd();
      } else {
        console.log('== PURGA OMITIDA por SKIP_PURGE=true ==');
      }

      // Conteo rápido de permisos en tabla method_profile (útil para diagnóstico)
      try {
        const countRes = await dbms.query({
          query: 'SELECT COUNT(*)::int AS c FROM public."method_profile";',
          params: [],
        });
        const totalMP = countRes?.rows?.[0]?.c ?? 0;
        console.log(`[TEST] method_profile total: ${totalMP}`);
      } catch (e) {
        console.warn(
          '[TEST] No se pudo contar method_profile:',
          e?.message || e
        );
      }

      const { default: Security } = await import('#security/security.js');
      const security = new Security();
      const permissions = await security.loadPermissions();
      const entries = Object.entries(permissions || {});
      console.log(
        `\n[TEST] Security.loadPermissions -> total claves: ${entries.length}`
      );
      console.log(
        '[TEST] Security.loadPermissions -> muestra (10):',
        entries.slice(0, 10)
      );

      // Prueba directa del nuevo método checkPermissionMethod
      try {
        const checkByNames = await security.checkPermissionMethod({
          subsystem: 'security',
          className: 'dbms',
          method: 'query',
          // usar el nombre real del perfil sembrado en BD
          profile: 'administrador de seguridad',
        });
        console.log(
          '[TEST] Security.checkPermissionMethod by names (security/dbms/query, administrador de seguridad):',
          checkByNames
        );

        // Prueba equivalente por IDs (resolviendo primero las referencias)
        try {
          const idsRes = await dbms.executeNamedQuery({
            nameQuery: 'resolveMethodPermissionRefs',
            params: {
              subsystem_name: 'security',
              class_name: 'dbms',
              method_name: 'query',
              profile_name: 'administrador de seguridad',
            },
          });
          const row = idsRes?.rows?.[0] || {};
          const checkByIds = await security.checkPermissionMethod({
            id_subsystem: row.id_subsystem,
            id_class: row.id_class,
            id_method: row.id_method,
            id_profile: row.id_profile,
          });
          console.log(
            '[TEST] Security.checkPermissionMethod by IDs (security/dbms/query, administrador de seguridad):',
            checkByIds,
            '-> ids:',
            row
          );
        } catch (e) {
          console.warn(
            '[TEST] checkPermissionMethod (by IDs) lanzó error:',
            e?.message || e
          );
        }
      } catch (e) {
        console.warn(
          '[TEST] checkPermissionMethod (by names) lanzó error:',
          e?.message || e
        );
      }
    } catch (err) {
      console.error(
        '[TEST] Security.loadPermissions falló:',
        err?.message || err
      );
    } finally {
      try {
        await dbms.poolDisconnection();
      } catch (_) {}
    }
  })();
  // Nota: runRepositoryTests() queda comentado para evitar ejecutar otras pruebas
  // runRepositoryTests();
}

// Export explícito para ejecución manual desde PowerShell: $env:TEST_REPOSITORY="true"; node .dev-trials/trail-methods.js
export const testRepository = runRepositoryTests;

// ================== TEARDOWN OPCIONAL ==================
const teardownRepositoryFixtures = async (fixtures) => {
  if (!fixtures) return;
  console.group('== TEARDOWN PRUEBAS REPOSITORY ==');
  try {
    // Borrar usuario seed
    try {
      await dbms.deleteWhere({
        tableName: 'user',
        data: { keyValueData: { username: fixtures.user.username } },
      });
      console.log('Usuario eliminado:', fixtures.user.username);
    } catch (e) {
      console.warn('No se pudo eliminar usuario seed:', e.message || e);
    }

    // Intentar limpiar entidades base (si no fueron eliminadas por los delAll*)
    const maybeDeleteByName = async (table, name) => {
      try {
        if (!name) return;
        await dbms.deleteWhere({
          tableName: table,
          data: { keyValueData: { name } },
        });
        console.log(`${table} eliminado:`, name);
      } catch (_) {
        // silenciar si ya no existe o hay FKs
      }
    };

    await maybeDeleteByName('menu', fixtures?.menu?.name);
    await maybeDeleteByName('option', fixtures?.option?.name);
    await maybeDeleteByName('method', fixtures?.method?.name);
    await maybeDeleteByName('class', fixtures?.className?.name);
    await maybeDeleteByName('subsystem', fixtures?.subsystem?.name);

    // Limpiar posible transacción de seed por descripción conocida
    try {
      await dbms.query({
        query: 'DELETE FROM public."transaction" WHERE description = $1;',
        params: ['Transacción seed para opción'],
      });
      console.log('Transacción seed eliminada por descripción');
    } catch (_) {
      // ignorar si no existe
    }
  } catch (err) {
    console.warn('Teardown encontró problemas:', err.message || err);
  } finally {
    console.groupEnd();
  }
};
