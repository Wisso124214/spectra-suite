import Utils from '#utils/utils.js';
import DBMS from '#dbms/dbms.js';

export default class Repository {
  constructor() {
    // No extend DBMS anymore; instantiate and delegate
    this.dbms = new DBMS();
    this.utils = new Utils();
    // Backup temporal para subsistema/clase/metodo y perfiles de métodos
    this._subsystemsClassesMethodsBackup = null;

    if (!Repository.instance) {
      Repository.instance = this;
    }

    return Repository.instance;
  }

  // Delegate some DBMS methods so external callers (tests/other modules)
  // can still call repo.query(), repo.executeNamedQuery(), etc.
  async init() {
    return await this.dbms.init();
  }

  query(arg1, arg2) {
    return this.dbms.query(arg1, arg2);
  }

  executeNamedQuery(opts) {
    return this.dbms.executeNamedQuery(opts);
  }

  executeJsonNamedQuery(opts) {
    return this.dbms.executeJsonNamedQuery(opts);
  }

  executeJsonTransaction(json, message) {
    return this.dbms.executeJsonTransaction(json, message);
  }

  beginTransaction() {
    return this.dbms.beginTransaction();
  }

  commitTransaction(client) {
    return this.dbms.commitTransaction(client);
  }

  rollbackTransaction(client) {
    return this.dbms.rollbackTransaction(client);
  }

  endTransaction(client) {
    return this.dbms.endTransaction(client);
  }

  poolDisconnection() {
    return this.dbms.poolDisconnection();
  }

  connection() {
    return this.dbms.connection();
  }

  disconnection(client) {
    return this.dbms.disconnection(client);
  }

  // Transaction and helper utilities
  _q(field) {
    return `"${field}"`;
  }

  // Helper to log transaction-related query errors with stack and context
  _logTxError(err, query, params, context = {}) {
    try {
      const info = {
        where: context.where || null,
        subsystem: context.subsystem || null,
        className: context.className || null,
        method: context.method || null,
        ids: context.ids || null,
        code: err && err.code,
        detail: err && err.detail,
        message: err && err.message,
        query: typeof query === 'string' ? query : String(query),
        params: Array.isArray(params) ? params : params,
        stack: new Error().stack,
      };
      // suppressed debug output in normal runs
    } catch (e) {
      // swallow logging errors
      try {
        // suppressed debug fallback
      } catch (ee) {}
    }
  }

  async _withTransaction(
    callback,
    errorMessage = 'Error en transacción genérica'
  ) {
    // Wrapper to run a callback inside a DB transaction using DBMS.beginTransaction/commit/rollback
    const client = await this.dbms.beginTransaction();
    if (!client) {
      return this.utils.handleError({
        message: 'No se pudo iniciar la transacción',
        errorCode: this.ERROR_CODES.DB_ERROR,
      });
    }
    try {
      const result = await callback(client);
      await this.dbms.commitTransaction(client);
      return result;
    } catch (error) {
      try {
        await this.dbms.rollbackTransaction(client);
      } catch (e) {
        // ignore rollback errors but keep original error handling
      }
      return this.utils.handleError({
        message: errorMessage,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    } finally {
      try {
        await this.dbms.endTransaction(client);
      } catch (e) {}
    }
  }

  async _ensureEntityByUniqueField(client, table, fields) {
    // Asumimos campo único 'name' si está presente; si no, usamos primer key
    const keys = Object.keys(fields);
    if (keys.length === 0) return null;
    const tableQ = `public.${this._q(table)}`;
    // Decide whether to use composite fields for lookup (useful for menus where id_subsystem/id_parent matter)
    const useComposite =
      keys.includes('id_subsystem') || keys.includes('id_parent');
    if (useComposite) {
      const where = keys
        .map((k, i) => `${this._q(k)} = $${i + 1}`)
        .join(' AND ');
      const sel = `SELECT id FROM ${tableQ} WHERE ${where} LIMIT 1;`;
      const selVals = keys.map((k) => fields[k]);
      const selRes = await client.query(sel, selVals);
      if (selRes.rows && selRes.rows.length > 0) return selRes.rows[0].id;
    } else {
      // fallback: use single unique key 'name' when present, else first key
      const uniqueKey = keys.includes('name') ? 'name' : keys[0];
      const keyQ = this._q(uniqueKey);
      const sel = `SELECT id FROM ${tableQ} WHERE ${keyQ} = $1 LIMIT 1;`;
      const selRes = await client.query(sel, [fields[uniqueKey]]);
      if (selRes.rows && selRes.rows.length > 0) return selRes.rows[0].id;
    }
    const cols = keys.map((k) => this._q(k)).join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const insVals = keys.map((k) => fields[k]);
    const ins = `INSERT INTO ${tableQ} (${cols}) VALUES (${placeholders}) RETURNING id;`;
    const insRes = await client.query(ins, insVals);
    return insRes.rows[0].id;
  }

  async _ensureJoin(client, table, fields) {
    const keys = Object.keys(fields);
    const tableQ = `public.${this._q(table)}`;
    const where = keys.map((k, i) => `${this._q(k)} = $${i + 1}`).join(' AND ');
    const sel = `SELECT 1 FROM ${tableQ} WHERE ${where} LIMIT 1;`;
    const vals = keys.map((k) => fields[k]);
    const selRes = await client.query(sel, vals);
    if (!selRes.rows || selRes.rows.length === 0) {
      // Dev debug: log join insertions for troubleshooting menu/option/profile mapping
      try {
        // suppressed join-insert debug
      } catch (e) {}
      const cols = keys.map((k) => this._q(k)).join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const ins = `INSERT INTO ${tableQ} (${cols}) VALUES (${placeholders});`;
      await client.query(ins, vals);
    }
  }

  async _forEachJsonMethod({
    data,
    filter,
    onEach,
    errorMessage = 'Error en método masivo',
  }) {
    try {
      const entries = Object.entries(data || {});
      const results = [];
      for (const [key, value] of entries) {
        if (!filter || filter(key, value)) {
          results.push(await onEach({ key, value }));
        }
      }
      return { data: results };
    } catch (error) {
      return this.utils.handleError({
        message: errorMessage,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async _forEachJsonMethodTx({
    data,
    filter,
    onEach,
    errorMessage = 'Error en método masivo tx',
  }) {
    return await this._withTransaction(async (client) => {
      const entries = Object.entries(data || {});
      const results = [];
      for (const [key, value] of entries) {
        if (!filter || filter(key, value)) {
          results.push(await onEach({ key, value }, client));
        }
      }
      return { data: results };
    }, errorMessage);
  }

  async _resolveTxFromMethodRef(methodRef, subsystemFallback = null) {
    if (!methodRef || typeof methodRef !== 'object') return null;
    if (methodRef.tx) return methodRef.tx; // si ya trae tx numérico
    const subsystemName =
      methodRef.subsystem || methodRef.subsystemName || null;
    const classNameResolved = methodRef.className || methodRef.class || null;
    const methodName = methodRef.method || null;
    const data = {
      subsystem: subsystemName || subsystemFallback,
      className: classNameResolved,
      method: methodName,
      description: methodName,
    };
    if (!data.subsystem || !data.className || !data.method) return null;
    // If a client was supplied in methodRef (internal callers can pass client to avoid nested transactions)
    if (methodRef.__client) {
      const txRes = await this.setTxTransactionWithClient(
        methodRef.__client,
        data
      );
      return txRes?.data?.tx || null;
    }
    const txRes = await this.setTxTransaction(data);
    return txRes?.data?.tx || null;
  }

  // Internal variant of setTxTransaction that uses an existing client (no new transaction)
  async setTxTransactionWithClient(client, data) {
    // data: { subsystem, className, method, description? }
    if (!client || !data || typeof data !== 'object')
      return this.utils.handleError({
        message: 'Datos inválidos para setTxTransactionWithClient',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const { subsystem, className, method } = data;
    if (!subsystem || !className || !method)
      return this.utils.handleError({
        message: 'Faltan campos subsystem/className/method',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    // Resolve ids
    const sRes = await client.query(
      'SELECT id FROM public."subsystem" WHERE name = $1 LIMIT 1;',
      [subsystem]
    );
    const cRes = await client.query(
      'SELECT id FROM public."class" WHERE name = $1 LIMIT 1;',
      [className]
    );
    const mRes = await client.query(
      'SELECT id FROM public."method" WHERE name = $1 LIMIT 1;',
      [method]
    );
    if (!sRes.rows.length || !cRes.rows.length || !mRes.rows.length)
      return this.utils.handleError({
        message: 'No se encontraron subsystem/class/method',
        errorCode: this.ERROR_CODES.NOT_FOUND,
      });
    const subsystemId = sRes.rows[0].id;
    const classId = cRes.rows[0].id;
    const methodId = mRes.rows[0].id;
    // Check existing
    const checkRes = await client.query(
      'SELECT tx, description FROM public."transaction" WHERE id_subsystem = $1 AND id_class = $2 AND id_method = $3 LIMIT 1;',
      [subsystemId, classId, methodId]
    );
    if (checkRes.rows && checkRes.rows.length > 0)
      return { message: 'Transacción ya existente', data: checkRes.rows[0] };
    const descValue = data.description || `${subsystem}.${className}.${method}`;
    try {
      const inserted = await client.query(
        'INSERT INTO public."transaction" (description, id_subsystem, id_class, id_method) VALUES ($1, $2, $3, $4) RETURNING tx;',
        [descValue, subsystemId, classId, methodId]
      );
      if (inserted && inserted.rows && inserted.rows.length > 0) {
        return {
          message: 'Transacción creada correctamente',
          data: { tx: inserted.rows[0].tx, description: descValue },
        };
      }
    } catch (e) {
      // Log error context and try select fallback
      try {
        this._logTxError(
          e,
          'INSERT INTO public."transaction" (description, id_subsystem, id_class, id_method) VALUES ($1, $2, $3, $4) RETURNING tx;',
          [descValue, subsystemId, classId, methodId],
          {
            where: 'setTxTransactionWithClient:insert',
            subsystem,
            className,
            method,
          }
        );
      } catch (le) {}
      if (e && (e.code === '23505' || e.code === '42P10')) {
        try {
          const chk = await client.query(
            'SELECT tx, description FROM public."transaction" WHERE id_subsystem = $1 AND id_class = $2 AND id_method = $3 LIMIT 1;',
            [subsystemId, classId, methodId]
          );
          if (chk.rows && chk.rows.length > 0)
            return { message: 'Transacción ya existente', data: chk.rows[0] };
        } catch (se) {
          // fallthrough
        }
      }
      throw e;
    }
    // Fallback select
    const checkResAgain = await client.query(
      'SELECT tx, description FROM public."transaction" WHERE id_subsystem = $1 AND id_class = $2 AND id_method = $3 LIMIT 1;',
      [subsystemId, classId, methodId]
    );
    if (checkResAgain.rows && checkResAgain.rows.length > 0)
      return {
        message: 'Transacción ya existente',
        data: checkResAgain.rows[0],
      };
    return this.utils.handleError({
      message: 'No se pudo crear o recuperar la transacción (client)',
      errorCode: this.ERROR_CODES.DB_ERROR,
    });
  }

  async _ensureOptionWithTx(client, { name, description, tx }) {
    if (!name) return null;
    // No reutilizar opción únicamente por tx: las opciones son entidades por nombre
    // y pueden compartir la misma transacción (tx) si llaman al mismo método.
    // Buscar por nombre primero y actualizar su tx si es necesario.
    const sel = 'SELECT id, tx FROM public."option" WHERE name = $1 LIMIT 1;';
    const selRes = await client.query(sel, [name]);
    if (selRes.rows && selRes.rows.length > 0) {
      const row = selRes.rows[0];
      if (tx && row.tx != tx) {
        await client.query(
          'UPDATE public."option" SET tx = $1 WHERE id = $2;',
          [tx, row.id]
        );
      }
      return row.id;
    }
    const ins =
      'INSERT INTO public."option" (name, description, tx) VALUES ($1, $2, $3) RETURNING id;';
    const insRes = await client.query(ins, [
      name,
      description || name,
      tx || null,
    ]);
    return insRes.rows[0].id;
  }

  async getUsersProfiles() {
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getUsersProfiles',
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: `Error en getUsersProfiles`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  // Confirmación para operaciones de borrado en tablas join
  _requireConfirmJoin(token, table) {
    const base = table.toUpperCase();
    const expected = `DELETE_${base}`;
    const expectedAll = `DELETE_ALL_${base}`;
    if (token === expected || token === expectedAll) return true;
    return this.utils.handleError({
      message: `Confirmación inválida para ${table}`,
      errorCode: this.ERROR_CODES.BAD_REQUEST,
    });
  }

  // Detección de estructura jerárquica de menús (forma constante)
  _isMenusStructureShape(data) {
    if (!data || typeof data !== 'object') return false;
    // Si cualquier valor posee 'options' o 'submenus' en su rama inmediata asumimos forma constante
    const topKeys = Object.keys(data);
    for (const k of topKeys) {
      const v = data[k];
      if (v && typeof v === 'object') {
        if (v.options || v.submenus) return true;
        // inspección un nivel más profundo
        for (const inner of Object.values(v)) {
          if (
            inner &&
            typeof inner === 'object' &&
            (inner.options || inner.submenus)
          )
            return true;
        }
      }
    }
    return false;
  }

  async setUserProfile(data) {
    // Acepta dos formas: {username, profile} o {userData:{username}, profileData:{name}}
    const username = data?.username || data?.userData?.username;
    const profile = data?.profile || data?.profileData?.name;
    if (!username || !profile)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    return await this._withTransaction(async (client) => {
      const userId = await this._ensureEntityByUniqueField(client, 'user', {
        username,
      });
      const profileId = await this._ensureEntityByUniqueField(
        client,
        'profile',
        { name: profile }
      );
      await this._ensureJoin(client, 'user_profile', {
        id_user: userId,
        id_profile: profileId,
      });
      return { data: [{ id_user: userId, id_profile: profileId }] };
    }, 'Error en setUserProfile');
  }

  async getUserProfiles(data) {
    const { username } = data || {};
    if (!username)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const selectQuery = `
      SELECT u.id AS user_id, u.username, p.id AS profile_id, p.name AS profile_name
      FROM public."user" u
      JOIN public."user_profile" up ON u.id = up.id_user
      JOIN public."profile" p ON up.id_profile = p.id
      WHERE u.username = $1;`;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getUserProfiles',
        params: [username],
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: 'Error en getUserProfiles',
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async getMenusOptionsProfiles() {
    const selectQuery = `
      SELECT m.id AS menu_id, m.name AS menu_name, o.id AS option_id, o.name AS option_name, p.id AS profile_id, p.name AS profile_name
      FROM public."menu" m
      JOIN public."option_menu" om ON m.id = om.id_menu
      JOIN public."option" o ON om.id_option = o.id
      JOIN public."option_profile" op ON o.id = op.id_option
      JOIN public."profile" p ON op.id_profile = p.id;`;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getMenusOptionsProfiles',
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: 'Error en getMenusOptionsProfiles',
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  // Bulk assign profiles to multiple users in one pass
  async setUsersProfiles(data) {
    // expected shape: { username: [profile1, profile2], ... }
    const rows = await this._forEachJsonMethodTx({
      data,
      filter: (username, arr) =>
        !!username && Array.isArray(arr) && arr.length > 0,
      onEach: async ({ key: username, value: arrProfiles }, client) => {
        const userId = await this._ensureEntityByUniqueField(client, 'user', {
          username,
        });
        const out = [];
        for (const profile of arrProfiles) {
          const profileId = await this._ensureEntityByUniqueField(
            client,
            'profile',
            { name: profile }
          );
          await this._ensureJoin(client, 'user_profile', {
            id_user: userId,
            id_profile: profileId,
          });
          out.push({ username, profile });
        }
        return out;
      },
      errorMessage: 'Error en setUsersProfiles',
    });
    return { data: (rows?.data || []).flat() };
  }

  async delUserProfile(data) {
    const { username, profile } = data;
    if (!username || !profile)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const conf = this._requireConfirmJoin(data.confirmDelete, 'user_profile');
    if (conf !== true) return conf;

    const queryString = `
      DELETE FROM public."user_profile"
      WHERE id_user = (SELECT id FROM public."user" WHERE username = $1)
      AND id_profile = (SELECT id FROM public."profile" WHERE name = $2);
    `;
    try {
      await this.dbms.executeNamedQuery({
        nameQuery: 'delUserProfile',
        params: [username, profile],
      });
    } catch (error) {
      return this.utils.handleError({
        message: `Error en delUserProfile`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async delUsersProfiles(data) {
    return await this._forEachJsonMethod({
      data,
      filter: (username, arr) => Array.isArray(arr) && arr.length > 0,
      onEach: async ({ key: username, value: arrProfiles }) => {
        const results = [];
        for (const profile of arrProfiles) {
          const out = await this.delUserProfile({
            username,
            profile,
            confirmDelete: 'DELETE_USER_PROFILE',
          });
          results.push({ ...out, username, profile });
        }
        return results;
      },
    });
  }

  async setProfileOption(data) {
    const { option, profile } = data;
    if (!option || !profile)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    return await this._withTransaction(async (client) => {
      const optionId = await this._ensureEntityByUniqueField(client, 'option', {
        name: option,
      });
      const profileId = await this._ensureEntityByUniqueField(
        client,
        'profile',
        { name: profile }
      );
      await this._ensureJoin(client, 'option_profile', {
        id_option: optionId,
        id_profile: profileId,
      });
      return { data: [{ id_option: optionId, id_profile: profileId }] };
    }, 'Error en setProfileOption');
  }

  async setProfilesOptions(data) {
    return await this._forEachJsonMethod({
      data,
      filter: (profile, arr) => Array.isArray(arr) && arr.length > 0,
      onEach: async ({ key: profile, value: arrOptions }) => {
        for (const option of arrOptions) {
          await this.setProfileOption({ option, profile });
        }
      },
    });
  }

  async getProfileOptions(data) {
    const { profile } = data;
    if (!profile)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const selectQuery = `
      SELECT p.id AS profile_id, p.name AS profile_name, o.id AS option_id, o.name AS option_name
      FROM public."profile" p
      JOIN public."option_profile" op ON p.id = op.id_profile
      JOIN public."option" o ON op.id_option = o.id
      WHERE p.name = $1;
    `;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getProfileOptions',
        params: [profile],
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: `Error en getProfileOptions`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  // Devuelve un arreglo con los nombres de las opciones permitidas para un perfil dado
  async getOptionsAllowed(data) {
    const { profile } = data || {};
    if (!profile) {
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    }
    try {
      // Reutiliza la consulta nombrada ya existente para perfil→opciones
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getProfileOptions',
        params: [profile],
      });
      const rows = res?.rows || [];
      // Normaliza salida a lista de nombres de opciones
      return rows.map((r) => r.option_name);
    } catch (error) {
      return this.utils.handleError({
        message: `Error en getOptionsAllowed`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async getProfilesOptions() {
    const selectQuery = `
      SELECT p.id AS profile_id, p.name AS profile_name, o.id AS option_id, o.name AS option_name
      FROM public."profile" p
      JOIN public."option_profile" op ON p.id = op.id_profile
      JOIN public."option" o ON op.id_option = o.id
    `;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getProfilesOptions',
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: `Error en getProfilesOptions`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async delProfileOption(data) {
    const { option, profile } = data;
    if (!option || !profile)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const conf = this._requireConfirmJoin(data.confirmDelete, 'option_profile');
    if (conf !== true) return conf;
    const queryString = `
      DELETE FROM public."option_profile"
      WHERE id_option = (SELECT id FROM public."option" WHERE name = $1)
      AND id_profile = (SELECT id FROM public."profile" WHERE name = $2);
    `;
    try {
      await this.dbms.executeNamedQuery({
        nameQuery: 'delProfileOption',
        params: [option, profile],
      });
    } catch (error) {
      return this.utils.handleError({
        message: `Error en delProfileOption`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async delProfilesOptions(data) {
    return await this._forEachJsonMethod({
      data,
      filter: (profile, arr) => Array.isArray(arr) && arr.length > 0,
      onEach: async ({ key: profile, value: arrOptions }) => {
        for (const option of arrOptions) {
          await this.delProfileOption({
            option,
            profile,
            confirmDelete: 'DELETE_OPTION_PROFILE',
          });
        }
      },
    });
  }

  async setMenuOption(data) {
    const { option, menu } = data;
    if (!option || !menu)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    return await this._withTransaction(async (client) => {
      const optionId = await this._ensureEntityByUniqueField(client, 'option', {
        name: option,
      });
      const menuId = await this._ensureEntityByUniqueField(client, 'menu', {
        name: menu,
      });
      await this._ensureJoin(client, 'option_menu', {
        id_option: optionId,
        id_menu: menuId,
      });
      return { data: [{ id_option: optionId, id_menu: menuId }] };
    }, 'Error en setMenuOption');
  }

  async setMenusOptions(data) {
    const results = await this._forEachJsonMethodTx({
      data,
      filter: (menu, arr) => Array.isArray(arr) && arr.length > 0,
      onEach: async ({ key: menu, value: arrOptions }, client) => {
        const menuId = await this._ensureEntityByUniqueField(client, 'menu', {
          name: menu,
        });
        const local = [];
        for (const option of arrOptions) {
          const optionId = await this._ensureEntityByUniqueField(
            client,
            'option',
            { name: option }
          );
          await this._ensureJoin(client, 'option_menu', {
            id_option: optionId,
            id_menu: menuId,
          });
          local.push({ id_option: optionId, id_menu: menuId });
        }
        return local;
      },
      errorMessage: 'Error en setMenusOptions',
    });
    // Avoid using Array.flat for compatibility with older Node versions
    const flat =
      results && Array.isArray(results)
        ? results.reduce((acc, cur) => acc.concat(cur || []), [])
        : [];
    return { data: flat };
  }

  async getMenuOptions(data) {
    const { menu } = data;
    if (!menu)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const selectQuery = `
      SELECT m.id AS menu_id, m.name AS menu_name, o.id AS option_id, o.name AS option_name
      FROM public."menu" m
      JOIN public."option_menu" om ON m.id = om.id_menu
      JOIN public."option" o ON om.id_option = o.id
      WHERE m.name = $1;
    `;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getMenuOptions',
        params: [menu],
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: `Error en getMenuOptions`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async getMenusOptions() {
    const selectQuery = `
      SELECT m.id AS menu_id, m.name AS menu_name, o.id AS option_id, o.name AS option_name
      FROM public."menu" m
      JOIN public."option_menu" om ON m.id = om.id_menu
      JOIN public."option" o ON om.id_option = o.id
    `;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getMenusOptions',
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: `Error en getMenusOptions`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async delMenuOption(data) {
    const { option, menu } = data;
    if (!option || !menu)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const conf = this._requireConfirmJoin(data.confirmDelete, 'option_menu');
    if (conf !== true) return conf;
    const queryString = `
      DELETE FROM public."option_menu"
      WHERE id_option = (SELECT id FROM public."option" WHERE name = $1)
      AND id_menu = (SELECT id FROM public."menu" WHERE name = $2);
    `;
    try {
      await this.dbms.executeNamedQuery({
        nameQuery: 'delMenuOption',
        params: [option, menu],
      });
    } catch (error) {
      return this.utils.handleError({
        message: `Error en delMenuOption`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async delMenusOptions(data) {
    return await this._forEachJsonMethod({
      data,
      filter: (menu, arr) => Array.isArray(arr) && arr.length > 0,
      onEach: async ({ key: menu, value: arrOptions }) => {
        for (const option of arrOptions) {
          await this.delMenuOption({
            option,
            menu,
            confirmDelete: 'DELETE_OPTION_MENU',
          });
        }
      },
    });
  }

  async setMenuOptionProfile(data) {
    // Two shapes supported:
    // 1) { menu, option, profile }
    // 2) Exported menus const shape from db-structure.js
    if (this._isMenusStructureShape(data)) {
      return await this._withTransaction(async (client) => {
        for (const subsystem of Object.keys(data)) {
          const subsystemNode = data[subsystem];
          const menusLevel1 = Object.keys(subsystemNode || {});
          for (const menuName of menusLevel1) {
            const menuNode = subsystemNode[menuName];
            const menu1Id = await this._ensureEntityByUniqueField(
              client,
              'menu',
              {
                name: menuName,
                description: menuNode?.description || menuName,
              }
            );
            const traverse = async (parentId, currentMenuName, node) => {
              const submenus = Object.keys(node?.submenus || {});
              for (const submenuName of submenus) {
                const submenuNode = node.submenus[submenuName];
                const submenuId = await this._ensureEntityByUniqueField(
                  client,
                  'menu',
                  {
                    name: submenuName,
                    description: submenuNode?.description || submenuName,
                    ...(parentId ? { id_parent: parentId } : {}),
                  }
                );
                const options = Object.keys(submenuNode?.options || {});
                for (const optionName of options) {
                  const optionNode = submenuNode.options[optionName];
                  let txValue = optionNode?.tx;
                  if (!txValue && optionNode?.method) {
                    txValue = await this._resolveTxFromMethodRef(
                      Object.assign({}, optionNode.method || {}, {
                        __client: client,
                      }),
                      subsystem
                    );
                  }
                  const optionId = await this._ensureOptionWithTx(client, {
                    name: optionName,
                    description: optionNode?.description || optionName,
                    tx: txValue,
                  });
                  await this._ensureJoin(client, 'option_menu', {
                    id_menu: submenuId,
                    id_option: optionId,
                  });
                  const allowed = optionNode?.allowedProfiles || [];
                  for (const prof of allowed) {
                    const profileId = await this._ensureEntityByUniqueField(
                      client,
                      'profile',
                      { name: prof }
                    );
                    await this._ensureJoin(client, 'option_profile', {
                      id_option: optionId,
                      id_profile: profileId,
                    });
                  }
                }
                await traverse(submenuId, submenuName, submenuNode);
              }
              const optionsHere = Object.keys(node?.options || {});
              for (const optionName of optionsHere) {
                const optionNode = node.options[optionName];
                let txValue = optionNode?.tx;
                if (!txValue && optionNode?.method) {
                  txValue = await this._resolveTxFromMethodRef(
                    Object.assign({}, optionNode.method || {}, {
                      __client: client,
                    }),
                    subsystem
                  );
                }
                const optionId = await this._ensureOptionWithTx(client, {
                  name: optionName,
                  description: optionNode?.description || optionName,
                  tx: txValue,
                });
                await this._ensureJoin(client, 'option_menu', {
                  id_menu: parentId || menu1Id,
                  id_option: optionId,
                });
                const allowed = optionNode?.allowedProfiles || [];
                for (const prof of allowed) {
                  const profileId = await this._ensureEntityByUniqueField(
                    client,
                    'profile',
                    { name: prof }
                  );
                  await this._ensureJoin(client, 'option_profile', {
                    id_option: optionId,
                    id_profile: profileId,
                  });
                }
              }
            };
            await traverse(menu1Id, menuName, menuNode);
          }
        }
        return { message: 'Menús/Opciones/Perfiles procesados correctamente' };
      }, 'Error en setMenuOptionProfile (forma constante)');
    }

    const { menu, option, profile } = data || {};
    if (!menu || !option || !profile)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    return await this._withTransaction(async (client) => {
      // Si se proporciona subsystem, asegurar id_subsystem para el menú si no existe
      let menuFields = { name: menu };
      if (data.subsystem) {
        const subsystemId = await this._ensureEntityByUniqueField(
          client,
          'subsystem',
          {
            name: data.subsystem,
            description: data.subsystem,
          }
        );
        menuFields = { ...menuFields, id_subsystem: subsystemId };
      }
      const menuId = await this._ensureEntityByUniqueField(
        client,
        'menu',
        menuFields
      );
      // Resolver tx si se proporciona directamente o mediante trio subsystem/class/method
      let txValue = data.tx;
      if (!txValue && (data.subsystem || data.className || data.method)) {
        txValue = await this._resolveTxFromMethodRef(
          Object.assign(
            {},
            {
              subsystem: data.subsystem,
              className: data.className,
              method: data.method,
              __client: client,
            }
          ),
          data.subsystem
        );
      }
      const optionId = await this._ensureOptionWithTx(client, {
        name: option,
        description: option,
        tx: txValue,
      });
      await this._ensureJoin(client, 'option_menu', {
        id_menu: menuId,
        id_option: optionId,
      });
      const profileId = await this._ensureEntityByUniqueField(
        client,
        'profile',
        { name: profile }
      );
      await this._ensureJoin(client, 'option_profile', {
        id_option: optionId,
        id_profile: profileId,
      });
      return {
        data: [{ id_menu: menuId, id_option: optionId, id_profile: profileId }],
      };
    }, 'Error en setMenuOptionProfile');
  }

  async setMenusOptionsProfiles(data) {
    if (!data || typeof data !== 'object')
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });

    return await this._withTransaction(async (client) => {
      if (this._isMenusStructureShape(data)) {
        for (const subsystem of Object.keys(data)) {
          const subsystemId = await this._ensureEntityByUniqueField(
            client,
            'subsystem',
            { name: subsystem, description: subsystem }
          );

          const menusLevel1 = Object.keys(data[subsystem] || {});
          for (const menuName of menusLevel1) {
            const menuNode = data[subsystem][menuName];
            const menu1Id = await this._ensureEntityByUniqueField(
              client,
              'menu',
              {
                name: menuName,
                description: menuNode?.description || menuName,
                id_subsystem: subsystemId,
              }
            );

            const traverse = async (parentId, currentMenuName, node) => {
              const submenus = Object.keys(node?.submenus || {});
              for (const submenuName of submenus) {
                const submenuNode = node.submenus[submenuName];
                const submenuId = await this._ensureEntityByUniqueField(
                  client,
                  'menu',
                  {
                    name: submenuName,
                    description: submenuNode?.description || submenuName,
                    id_subsystem: subsystemId,
                    id_parent: parentId,
                  }
                );

                const options = Object.keys(submenuNode?.options || {});
                for (const optionName of options) {
                  const optionNode = submenuNode.options[optionName];
                  let txValue = optionNode?.tx;
                  if (!txValue && optionNode?.method) {
                    txValue = await this._resolveTxFromMethodRef(
                      Object.assign({}, optionNode.method || {}, {
                        __client: client,
                      }),
                      subsystem
                    );
                  }
                  const optionId = await this._ensureOptionWithTx(client, {
                    name: optionName,
                    description: optionNode?.description || optionName,
                    tx: txValue,
                  });
                  await this._ensureJoin(client, 'option_menu', {
                    id_menu: submenuId,
                    id_option: optionId,
                  });
                  const allowed = optionNode?.allowedProfiles || [];
                  for (const prof of allowed) {
                    const profileId = await this._ensureEntityByUniqueField(
                      client,
                      'profile',
                      { name: prof }
                    );
                    await this._ensureJoin(client, 'option_profile', {
                      id_option: optionId,
                      id_profile: profileId,
                    });
                  }
                }

                await traverse(submenuId, submenuName, submenuNode);
              }

              const optionsHere = Object.keys(node?.options || {});
              for (const optionName of optionsHere) {
                const optionNode = node.options[optionName];
                let txValue = optionNode?.tx;
                if (!txValue && optionNode?.method) {
                  txValue = await this._resolveTxFromMethodRef(
                    Object.assign({}, optionNode.method || {}, {
                      __client: client,
                    }),
                    subsystem
                  );
                }
                const optionId = await this._ensureOptionWithTx(client, {
                  name: optionName,
                  description: optionNode?.description || optionName,
                  tx: txValue,
                });
                await this._ensureJoin(client, 'option_menu', {
                  id_menu: parentId || menu1Id,
                  id_option: optionId,
                });
                const allowed = optionNode?.allowedProfiles || [];
                for (const prof of allowed) {
                  const profileId = await this._ensureEntityByUniqueField(
                    client,
                    'profile',
                    { name: prof }
                  );
                  await this._ensureJoin(client, 'option_profile', {
                    id_option: optionId,
                    id_profile: profileId,
                  });
                }
              }
            };

            await traverse(menu1Id, menuName, menuNode);
          }
        }
        return { message: 'Estructura de menús procesada correctamente' };
      }

      // Default shape (per profile): { profile: { menu: [options] } }
      const profiles = Object.keys(data);
      for (const profile of profiles) {
        const profileData = data[profile];
        if (!profile || !profileData || typeof profileData !== 'object')
          continue;
        const menus = Object.keys(profileData);
        for (const menu of menus) {
          const arrOptions = profileData[menu];
          if (!menu || !Array.isArray(arrOptions)) continue;
          const menuId = await this._ensureEntityByUniqueField(client, 'menu', {
            name: menu,
          });
          for (const option of arrOptions) {
            let optionName = option;
            let txValue = null;
            if (typeof option === 'string' && option.includes('|')) {
              const parts = option.split('|');
              optionName = parts[0];
              const txParsed = parseInt(parts[1], 10);
              if (!isNaN(txParsed)) txValue = txParsed;
            }
            const optionId = await this._ensureOptionWithTx(client, {
              name: optionName,
              description: optionName,
              tx: txValue,
            });
            await this._ensureJoin(client, 'option_menu', {
              id_menu: menuId,
              id_option: optionId,
            });
            const profileId = await this._ensureEntityByUniqueField(
              client,
              'profile',
              { name: profile }
            );
            await this._ensureJoin(client, 'option_profile', {
              id_option: optionId,
              id_profile: profileId,
            });
          }
        }
      }
      return { message: 'Menús/opciones/perfiles asignados correctamente' };
    }, 'Error en setMenusOptionsProfiles');
  }

  // Ejemplos de uso (comentados):
  // this.setMenusOptionsProfiles({
  //   security: {
  //     'Gestión de Perfiles': { description: '...', submenus: { /* ... */ } },
  //     'Gestión de Usuarios': { options: { 'Actualizar mi usuario': { allowedProfiles: ['admin'] } } }
  //   }
  // });
  // this.setMenuOptionProfile({ menu: 'Gestión de Perfiles', option: 'Crear Perfil', profile: 'admin' });
  // this.setUsersProfiles({ alice: ['admin','user'], bob: ['user'] });

  async getMenuOptionsProfile(data) {
    const { menu, profile } = data;
    if (!menu || !profile)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const selectQuery = `
      SELECT m.id AS menu_id, m.name AS menu_name, o.id AS option_id, o.name AS option_name, p.id AS profile_id, p.name AS profile_name
      FROM public."menu" m
      JOIN public."option_menu" om ON m.id = om.id_menu
      JOIN public."option" o ON om.id_option = o.id
      JOIN public."option_profile" op ON o.id = op.id_option
      JOIN public."profile" p ON op.id_profile = p.id
      WHERE m.name = $1 AND p.name = $2;
    `;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getMenuOptionsProfile',
        params: [menu, profile],
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: `Error en getMenuOptionsProfile`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async getMenusOptionsProfile(data) {
    const { profile } = data;
    if (!profile)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const selectQuery = `
      SELECT m.id AS menu_id, m.name AS menu_name, o.id AS option_id, o.name AS option_name, p.id AS profile_id, p.name AS profile_name
      FROM public."menu" m
      JOIN public."option_menu" om ON m.id = om.id_menu
      JOIN public."option" o ON om.id_option = o.id
      JOIN public."option_profile" op ON o.id = op.id_option
      JOIN public."profile" p ON op.id_profile = p.id
      WHERE p.name = $1;
    `;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getMenusOptionsProfile',
        params: [profile],
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: `Error en getMenusOptionsProfile`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async delMenuOptionsProfile(data) {
    const { profile, menu, arrOptions } = data;
    if (!profile || !menu || !arrOptions)
      return this.utils.handleError({
        message: 'Datos inválidos o faltantes',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    for (const option of arrOptions) {
      // Eliminar vínculo option_menu
      await this.delMenuOption({
        option,
        menu,
        confirmDelete: 'DELETE_OPTION_MENU',
      });
      // Eliminar vínculo option_profile
      await this.delProfileOption({
        option,
        profile,
        confirmDelete: 'DELETE_OPTION_PROFILE',
      });
    }
  }

  async delMenusOptionsProfiles(data) {
    const profiles = Object.keys(data);
    for (const profile of profiles) {
      const menus = Object.keys(data[profile]);
      for (const menu of menus) {
        await this.delMenuOptionsProfile({
          profile,
          menu,
          arrOptions: data[profile][menu],
        });
      }
    }
  }

  async delAllMenusOptionsProfiles() {
    return await this._withTransaction(async (client) => {
      await client.query('DELETE FROM public."option_menu";');
      await client.query('DELETE FROM public."option_profile";');
      await client.query('DELETE FROM public."menu";');
      await client.query('DELETE FROM public."option";');
      return {
        message: 'Todos los menús/opciones/perfiles eliminados correctamente',
      };
    }, 'Error en delAllMenusOptionsProfiles');
  }

  async replaceMenuOptionProfile(data) {
    const { menu, option, profile } = data;
    if (!menu || !option || !profile)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    return await this._withTransaction(async (client) => {
      await client.query('DELETE FROM public."option_menu";');
      await client.query('DELETE FROM public."option_profile";');
      await client.query('DELETE FROM public."menu";');
      await client.query('DELETE FROM public."option";');

      const menuId = await this._ensureEntityByUniqueField(client, 'menu', {
        name: menu,
      });
      const optionId = await this._ensureEntityByUniqueField(client, 'option', {
        name: option,
      });
      await this._ensureJoin(client, 'option_menu', {
        id_menu: menuId,
        id_option: optionId,
      });
      const profileId = await this._ensureEntityByUniqueField(
        client,
        'profile',
        { name: profile }
      );
      await this._ensureJoin(client, 'option_profile', {
        id_option: optionId,
        id_profile: profileId,
      });
      return { message: 'Menú/opción/perfil reemplazado correctamente' };
    }, 'Error en replaceMenuOptionProfile');
  }

  async replaceMenusOptionsProfiles(data) {
    // For simplicity and to avoid nested transactions, do two transactional steps
    await this.delAllMenusOptionsProfiles();
    return await this.setMenusOptionsProfiles(data);
  }

  async setProfileMethod(data) {
    const { method, profile } = data;
    if (!method || !profile)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    return await this._withTransaction(async (client) => {
      const methodId = await this._ensureEntityByUniqueField(client, 'method', {
        name: method,
      });
      const profileId = await this._ensureEntityByUniqueField(
        client,
        'profile',
        { name: profile }
      );
      await this._ensureJoin(client, 'method_profile', {
        id_method: methodId,
        id_profile: profileId,
      });
      return { data: [{ id_method: methodId, id_profile: profileId }] };
    }, 'Error en setProfileMethod');
  }

  async setProfilesMethods(data) {
    return await this._forEachJsonMethod({
      data,
      filter: (profile, arr) => Array.isArray(arr) && arr.length > 0,
      onEach: async ({ key: profile, value: arrMethods }) => {
        for (const method of arrMethods) {
          await this.setProfileMethod({ method, profile });
        }
      },
    });
  }

  async getProfileMethods(data) {
    const { profile } = data;
    if (!profile)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const selectQuery = `
      SELECT p.id AS profile_id, p.name AS profile_name, m.id AS method_id, m.name AS method_name
      FROM public."profile" p
      JOIN public."method_profile" mp ON p.id = mp.id_profile
      JOIN public."method" m ON mp.id_method = m.id
      WHERE p.name = $1;
    `;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getProfileMethods',
        params: [profile],
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: `Error en getProfileMethods`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async getProfilesMethods() {
    const selectQuery = `
      SELECT p.id AS profile_id, p.name AS profile_name, m.id AS method_id, m.name AS method_name
      FROM public."profile" p
      JOIN public."method_profile" mp ON p.id = mp.id_profile
      JOIN public."method" m ON mp.id_method = m.id
    `;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getProfilesMethods',
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: `Error en getProfilesMethods`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async delProfileMethod(data) {
    const { method, profile } = data;
    if (!method || !profile)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const conf = this._requireConfirmJoin(data.confirmDelete, 'method_profile');
    if (conf !== true) return conf;
    const queryString = `
      DELETE FROM public."method_profile"
      WHERE id_method = (SELECT id FROM public."method" WHERE name = $1)
      AND id_profile = (SELECT id FROM public."profile" WHERE name = $2);
    `;
    try {
      await this.dbms.executeNamedQuery({
        nameQuery: 'delProfileMethod',
        params: [method, profile],
      });
    } catch (error) {
      return this.utils.handleError({
        message: `Error en delProfileMethod`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async delProfilesMethods(data) {
    return await this._forEachJsonMethod({
      data,
      filter: (profile, arr) => Array.isArray(arr) && arr.length > 0,
      onEach: async ({ key: profile, value: arrMethods }) => {
        for (const method of arrMethods) {
          await this.delProfileMethod({
            method,
            profile,
            confirmDelete: 'DELETE_METHOD_PROFILE',
          });
        }
      },
    });
  }

  async setClassMethod(data) {
    const { className, method } = data;
    if (!className || !method)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    return await this._withTransaction(async (client) => {
      const classId = await this._ensureEntityByUniqueField(client, 'class', {
        name: className,
      });
      const methodId = await this._ensureEntityByUniqueField(client, 'method', {
        name: method,
      });
      await this._ensureJoin(client, 'class_method', {
        id_class: classId,
        id_method: methodId,
      });
      return { data: [{ id_class: classId, id_method: methodId }] };
    }, 'Error en setClassMethod');
  }

  async setClassesMethods(data) {
    return await this._forEachJsonMethod({
      data,
      filter: (className, arr) => Array.isArray(arr) && arr.length > 0,
      onEach: async ({ key: className, value: arrMethods }) => {
        for (const method of arrMethods) {
          await this.setClassMethod({ className, method });
        }
      },
    });
  }

  async getClassMethods(data) {
    const { className } = data;
    if (!className)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const selectQuery = `
      SELECT c.id AS class_id, c.name AS class_name, m.id AS method_id, m.name AS method_name
      FROM public."class" c
      JOIN public."class_method" cm ON c.id = cm.id_class
      JOIN public."method" m ON cm.id_method = m.id
      WHERE c.name = $1;
    `;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getClassMethods',
        params: [className],
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: `Error en getClassMethods`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async getClassesMethods() {
    const selectQuery = `
      SELECT c.id AS class_id, c.name AS class_name, m.id AS method_id, m.name AS method_name
      FROM public."class" c
      JOIN public."class_method" cm ON c.id = cm.id_class
      JOIN public."method" m ON cm.id_method = m.id
    `;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getClassesMethods',
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: `Error en getClassesMethods`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async delClassMethod(data) {
    const { className, method } = data;
    if (!className || !method)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const conf = this._requireConfirmJoin(data.confirmDelete, 'class_method');
    if (conf !== true) return conf;
    const queryString = `
      DELETE FROM public."class_method"
      WHERE id_class = (SELECT id FROM public."class" WHERE name = $1)
      AND id_method = (SELECT id FROM public."method" WHERE name = $2);
    `;
    try {
      await this.dbms.executeNamedQuery({
        nameQuery: 'delClassMethod',
        params: [className, method],
      });
    } catch (error) {
      return this.utils.handleError({
        message: `Error en delClassMethod`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async delClassesMethods(data) {
    return await this._forEachJsonMethod({
      data,
      filter: (className, arr) => Array.isArray(arr) && arr.length > 0,
      onEach: async ({ key: className, value: arrMethods }) => {
        for (const method of arrMethods) {
          await this.delClassMethod({
            className,
            method,
            confirmDelete: 'DELETE_CLASS_METHOD',
          });
        }
      },
    });
  }

  async setSubsystemClassMethod(data) {
    const { subsystem, className, method } = data;
    if (!subsystem || !className || !method)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    return await this._withTransaction(async (client) => {
      const subsystemId = await this._ensureEntityByUniqueField(
        client,
        'subsystem',
        { name: subsystem }
      );
      const classId = await this._ensureEntityByUniqueField(client, 'class', {
        name: className,
      });
      const methodId = await this._ensureEntityByUniqueField(client, 'method', {
        name: method,
      });
      await this._ensureJoin(client, 'class_method', {
        id_class: classId,
        id_method: methodId,
      });
      await this._ensureJoin(client, 'subsystem_class', {
        id_subsystem: subsystemId,
        id_class: classId,
      });
      return {
        data: [
          { id_subsystem: subsystemId, id_class: classId, id_method: methodId },
        ],
      };
    }, 'Error en setSubsystemClassMethod');
  }

  async setSubsystemsClassesMethods(data) {
    // Supports two shapes:
    // A) { subsystem: { className: [method, ...] } }
    // B) The exported "subsystems" const from db-structure.js
    const isSubsystemsConstShape = (obj) => {
      if (!obj || typeof obj !== 'object') return false;
      return Object.values(obj).some(
        (s) =>
          s &&
          typeof s === 'object' &&
          s.classes &&
          typeof s.classes === 'object'
      );
    };

    if (!data || Object.keys(data).length === 0) {
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    }

    if (isSubsystemsConstShape(data)) {
      return await this._withTransaction(async (client) => {
        for (const subsystem of Object.keys(data)) {
          const subsystemId = await this._ensureEntityByUniqueField(
            client,
            'subsystem',
            {
              name: subsystem,
              description: data[subsystem]?.description || subsystem,
            }
          );
          const classes = data[subsystem]?.classes || {};
          for (const className of Object.keys(classes)) {
            const classId = await this._ensureEntityByUniqueField(
              client,
              'class',
              {
                name: className,
                description: classes[className]?.description || className,
              }
            );
            const methodsObj = classes[className]?.methods || {};
            for (const method of Object.keys(methodsObj)) {
              const methodId = await this._ensureEntityByUniqueField(
                client,
                'method',
                {
                  name: method,
                  description: methodsObj[method]?.description || method,
                }
              );
              await this._ensureJoin(client, 'class_method', {
                id_class: classId,
                id_method: methodId,
              });
              await this._ensureJoin(client, 'subsystem_class', {
                id_subsystem: subsystemId,
                id_class: classId,
              });
              // Ensure transaction exists for (subsystem, class, method)
              const txCheckRes = await client.query(
                'SELECT tx FROM public."transaction" WHERE id_subsystem = $1 AND id_class = $2 AND id_method = $3 LIMIT 1;',
                [subsystemId, classId, methodId]
              );
              if (!txCheckRes.rows || txCheckRes.rows.length === 0) {
                const txKey = `${subsystem}.${className}.${method}`;
                const txDesc = methodsObj[method]?.description || txKey;
                try {
                  await client.query(
                    'INSERT INTO public."transaction" (description, id_subsystem, id_class, id_method) VALUES ($1, $2, $3, $4) RETURNING tx;',
                    [txDesc, subsystemId, classId, methodId]
                  );
                } catch (err) {
                  // Log detailed info when duplicate-key occurs or other DB errors
                  if (err && err.code === '23505') {
                    this._logTxError(
                      err,
                      'INSERT INTO public."transaction" (description, id_subsystem, id_class, id_method) VALUES ($1, $2, $3, $4) RETURNING tx;',
                      [txDesc, subsystemId, classId, methodId],
                      {
                        where: 'setSubsystemsClassesMethods:isSubsystemsConst',
                        subsystem,
                        className,
                        method,
                      }
                    );
                    // duplicate key - another process inserted it concurrently, ignore
                  } else {
                    this._logTxError(
                      err,
                      'INSERT INTO public."transaction" (description, id_subsystem, id_class, id_method) VALUES ($1, $2, $3, $4) RETURNING tx;',
                      [txDesc, subsystemId, classId, methodId],
                      {
                        where: 'setSubsystemsClassesMethods:isSubsystemsConst',
                        subsystem,
                        className,
                        method,
                      }
                    );
                    throw err;
                  }
                }
              }
              // Ensure method_profile according to allowedProfiles
              const allowed = methodsObj[method]?.allowedProfiles || [];
              if (Array.isArray(allowed) && allowed.length > 0) {
                for (const prof of allowed) {
                  const profileName =
                    typeof prof === 'string'
                      ? prof
                      : prof && typeof prof === 'object' && prof.name
                        ? prof.name
                        : String(prof);
                  if (!profileName) continue;
                  const profileId = await this._ensureEntityByUniqueField(
                    client,
                    'profile',
                    { name: profileName, description: profileName }
                  );
                  await this._ensureJoin(client, 'method_profile', {
                    id_method: methodId,
                    id_profile: profileId,
                  });
                }
              }
            }
          }
        }
        return {
          message:
            'Estructura de subsistemas/clases/métodos (forma constante) procesada correctamente',
        };
      }, 'Error en setSubsystemsClassesMethods');
    }

    const subs = Object.keys(data);
    for (const subsystem of subs) {
      const classesMethods = data[subsystem];
      const missing =
        !subsystem || !classesMethods || typeof classesMethods !== 'object';
      const empty = Object.keys(classesMethods || {}).length === 0;
      if (missing || empty) {
        this.utils.handleError({
          message: `Datos inválidos o incompletos on ${subsystem}. So skipping`,
          errorCode: this.ERROR_CODES.BAD_REQUEST,
        });
        continue;
      }

      await this._withTransaction(async (client) => {
        const subsystemId = await this._ensureEntityByUniqueField(
          client,
          'subsystem',
          { name: subsystem }
        );
        for (const className of Object.keys(classesMethods)) {
          const methods = classesMethods[className];
          const miss2 = !className || !methods;
          const emp2 = Array.isArray(methods)
            ? methods.length === 0
            : Object.keys(methods || {}).length === 0;
          if (miss2 || emp2) {
            this.utils.handleError({
              message: `Datos inválidos o incompletos on ${className}. So skipping`,
              errorCode: this.ERROR_CODES.BAD_REQUEST,
            });
            continue;
          }
          const list = Array.isArray(methods) ? methods : Object.keys(methods);
          const classId = await this._ensureEntityByUniqueField(
            client,
            'class',
            { name: className }
          );
          for (const method of list) {
            const methodId = await this._ensureEntityByUniqueField(
              client,
              'method',
              { name: method }
            );
            await this._ensureJoin(client, 'class_method', {
              id_class: classId,
              id_method: methodId,
            });
            await this._ensureJoin(client, 'subsystem_class', {
              id_subsystem: subsystemId,
              id_class: classId,
            });
            // Ensure transaction exists for (subsystem, class, method)
            const txCheckRes = await client.query(
              'SELECT tx FROM public."transaction" WHERE id_subsystem = $1 AND id_class = $2 AND id_method = $3 LIMIT 1;',
              [subsystemId, classId, methodId]
            );
            if (!txCheckRes.rows || txCheckRes.rows.length === 0) {
              const txKey = `${subsystem}.${className}.${method}`;
              try {
                await client.query(
                  'INSERT INTO public."transaction" (description, id_subsystem, id_class, id_method) VALUES ($1, $2, $3, $4) RETURNING tx;',
                  [txKey, subsystemId, classId, methodId]
                );
              } catch (err) {
                if (err && err.code === '23505') {
                  this._logTxError(
                    err,
                    'INSERT INTO public."transaction" (description, id_subsystem, id_class, id_method) VALUES ($1, $2, $3, $4) RETURNING tx;',
                    [txKey, subsystemId, classId, methodId],
                    {
                      where: 'setSubsystemsClassesMethods:compact',
                      subsystem,
                      className,
                      method,
                    }
                  );
                  // duplicate key - another process inserted it concurrently, ignore
                } else {
                  this._logTxError(
                    err,
                    'INSERT INTO public."transaction" (description, id_subsystem, id_class, id_method) VALUES ($1, $2, $3, $4) RETURNING tx;',
                    [txKey, subsystemId, classId, methodId],
                    {
                      where: 'setSubsystemsClassesMethods:compact',
                      subsystem,
                      className,
                      method,
                    }
                  );
                  throw err;
                }
              }
            }
          }
        }
        return {
          message: `Clases/métodos del subsistema '${subsystem}' procesados correctamente`,
        };
      }, 'Error en setSubsystemsClassesMethods');
    }
    return { message: 'Todos los subsistemas procesados correctamente' };
  }

  async getSubsystemClassesMethods(data) {
    const { subsystem } = data;
    if (!subsystem)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const selectQuery = `
      SELECT s.id AS subsystem_id, s.name AS subsystem_name,
             c.id AS class_id, c.name AS class_name,
             m.id AS method_id, m.name AS method_name
      FROM public."subsystem" s
      JOIN public."subsystem_class" sc ON s.id = sc.id_subsystem
      JOIN public."class" c ON sc.id_class = c.id
      JOIN public."class_method" cm ON c.id = cm.id_class
      JOIN public."method" m ON cm.id_method = m.id
      WHERE s.name = $1;
    `;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getSubsystemClassesMethods',
        params: [subsystem],
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: `Error en getSubsystemClassesMethods`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async getSubsystemsClassesMethods() {
    const selectQuery = `
      SELECT s.id AS subsystem_id, s.name AS subsystem_name,
             c.id AS class_id, c.name AS class_name,
             m.id AS method_id, m.name AS method_name
      FROM public."subsystem" s
      JOIN public."subsystem_class" sc ON s.id = sc.id_subsystem
      JOIN public."class" c ON sc.id_class = c.id
      JOIN public."class_method" cm ON c.id = cm.id_class
      JOIN public."method" m ON cm.id_method = m.id;
    `;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getSubsystemsClassesMethods',
      });
      return res?.rows || [];
    } catch (error) {
      return this.utils.handleError({
        message: `Error en getSubsystemsClassesMethods`,
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  async delSubsystemClassMethod(data) {
    const { subsystem, className, method } = data;
    if (!subsystem || !className || !method)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const conf1 = this._requireConfirmJoin(data.confirmDelete, 'class_method');
    if (conf1 !== true) return conf1;
    const conf2 = this._requireConfirmJoin(
      data.confirmDelete2,
      'subsystem_class'
    );
    if (conf2 !== true) return conf2;
    return await this._withTransaction(async (client) => {
      await client.query(
        'DELETE FROM public."class_method" WHERE id_class = (SELECT id FROM public."class" WHERE name = $1) AND id_method = (SELECT id FROM public."method" WHERE name = $2);',
        [className, method]
      );
      await client.query(
        'DELETE FROM public."subsystem_class" WHERE id_subsystem = (SELECT id FROM public."subsystem" WHERE name = $1) AND id_class = (SELECT id FROM public."class" WHERE name = $2);',
        [subsystem, className]
      );
      return { message: 'Menús/opciones/perfiles asignados correctamente' };
    }, 'Error en delSubsystemClassMethod');
  }

  async delSubsystemsClassesMethods(data) {
    const subsystems = Object.keys(data);
    for (const subsystem of subsystems) {
      const classesMethods = data[subsystem];
      for (const className in classesMethods) {
        const methods = classesMethods[className];
        for (const method of methods) {
          await this.delSubsystemClassMethod({
            subsystem,
            className,
            method,
            confirmDelete: 'DELETE_CLASS_METHOD',
            confirmDelete2: 'DELETE_SUBSYSTEM_CLASS',
          });
        }
      }
    }
  }

  async delAllSubsystemsClassesMethods() {
    return await this._withTransaction(async (client) => {
      await client.query('DELETE FROM public."class_method";');
      await client.query('DELETE FROM public."subsystem_class";');
      await client.query('DELETE FROM public."method_profile";');
      await client.query('DELETE FROM public."transaction";');
      await client.query('DELETE FROM public."method";');
      await client.query('DELETE FROM public."class";');
      await client.query('DELETE FROM public."subsystem";');
      return {
        message:
          'Todos los subsistemas/clases/métodos eliminados correctamente',
      };
    }, 'Error en delAllSubsystemsClassesMethods');
  }

  async replaceSubsystemClassMethod(data) {
    const { subsystem, className, method } = data;
    if (!subsystem || !className || !method)
      return this.utils.handleError({
        message: 'Datos inválidos o incompletos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    return await this._withTransaction(async (client) => {
      await client.query(
        'DELETE FROM public."class_method" WHERE id_class = (SELECT id FROM public."class" WHERE name = $1) AND id_method = (SELECT id FROM public."method" WHERE name = $2);',
        [className, method]
      );
      await client.query(
        'DELETE FROM public."subsystem_class" WHERE id_subsystem = (SELECT id FROM public."subsystem" WHERE name = $1) AND id_class = (SELECT id FROM public."class" WHERE name = $2);',
        [subsystem, className]
      );
      const subsystemId = await this._ensureEntityByUniqueField(
        client,
        'subsystem',
        { name: subsystem }
      );
      const classId = await this._ensureEntityByUniqueField(client, 'class', {
        name: className,
      });
      const methodId = await this._ensureEntityByUniqueField(client, 'method', {
        name: method,
      });
      await this._ensureJoin(client, 'class_method', {
        id_class: classId,
        id_method: methodId,
      });
      await this._ensureJoin(client, 'subsystem_class', {
        id_subsystem: subsystemId,
        id_class: classId,
      });
      return { message: 'Subsistema/clase/método reemplazados correctamente' };
    }, 'Error en replaceSubsystemClassMethod');
  }

  async replaceSubsystemsClassesMethods(data) {
    const subsystems = Object.keys(data);
    for (const subsystem of subsystems) {
      const classesMethods = data[subsystem];
      for (const className in classesMethods) {
        const methods = classesMethods[className];
        for (const method of methods) {
          await this.replaceSubsystemClassMethod({
            subsystem,
            className,
            method,
          });
        }
      }
    }
  }

  //==================== Transaction (tx) helpers ====================
  /**
   * setTxTransaction
   * Crea (si no existe) una transacción asociada al trío subsystem/class/method
   * data: { subsystem, className, method, tx?, description? }
   * Si no se provee tx se genera como `${subsystem}.${className}.${method}`
   */
  async setTxTransaction(data) {
    const { subsystem, className, method } = data || {};
    if (!subsystem || !className || !method)
      return this.utils.handleError({
        message:
          'Datos inválidos o incompletos (subsystem, className, method requeridos)',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });

    return await this._withTransaction(async (client) => {
      // Asegurar entidades base
      const subsystemId = await this._ensureEntityByUniqueField(
        client,
        'subsystem',
        {
          name: subsystem,
          description: subsystem,
        }
      );
      const classId = await this._ensureEntityByUniqueField(client, 'class', {
        name: className,
        description: className,
      });
      const methodId = await this._ensureEntityByUniqueField(client, 'method', {
        name: method,
        description: method,
      });
      // Asegurar joins
      await this._ensureJoin(client, 'class_method', {
        id_class: classId,
        id_method: methodId,
      });
      await this._ensureJoin(client, 'subsystem_class', {
        id_subsystem: subsystemId,
        id_class: classId,
      });

      // Revisar si ya existe transaction (tabla transaction con PK serial en columna tx)
      // Debug: log the resolved ids before checking/creating transaction
      try {
        // suppressed tx-resolution debug
      } catch (e) {}
      const checkRes = await client.query(
        'SELECT tx, description FROM public."transaction" WHERE id_subsystem = $1 AND id_class = $2 AND id_method = $3 LIMIT 1;',
        [subsystemId, classId, methodId]
      );
      if (checkRes.rows && checkRes.rows.length > 0) {
        return { message: 'Transacción ya existente', data: checkRes.rows[0] };
      }
      const descValue =
        data.description || `${subsystem}.${className}.${method}`;
      // Intentar insertar la transacción con ON CONFLICT para evitar excepciones por race
      let inserted;
      try {
        inserted = await client.query(
          'INSERT INTO public."transaction" (description, id_subsystem, id_class, id_method) VALUES ($1, $2, $3, $4) RETURNING tx;',
          [descValue, subsystemId, classId, methodId]
        );
      } catch (e) {
        // If INSERT fails due to concurrency (duplicate key) try to SELECT the existing row
        if (e && (e.code === '23505' || e.code === '42P10')) {
          // Log the initial insert failure with full context so we can trace race conditions
          try {
            this._logTxError(
              e,
              'INSERT INTO public."transaction" (description, id_subsystem, id_class, id_method) VALUES ($1, $2, $3, $4) RETURNING tx;',
              [descValue, subsystemId, classId, methodId],
              {
                where: 'setTxTransaction:insert',
                subsystem,
                className,
                method,
              }
            );
          } catch (logErr) {}
          try {
            const chk = await client.query(
              'SELECT tx, description FROM public."transaction" WHERE id_subsystem = $1 AND id_class = $2 AND id_method = $3 LIMIT 1;',
              [subsystemId, classId, methodId]
            );
            if (chk.rows && chk.rows.length > 0)
              return { message: 'Transacción ya existente', data: chk.rows[0] };
          } catch (se) {
            // fallthrough to rethrow original error if select also fails
          }
        }
        // log unexpected insert failure and rethrow
        try {
          this._logTxError(
            e,
            'INSERT INTO public."transaction" (description, id_subsystem, id_class, id_method) VALUES ($1, $2, $3, $4) RETURNING tx;',
            [descValue, subsystemId, classId, methodId],
            {
              where: 'setTxTransaction:insert:unexpected',
              subsystem,
              className,
              method,
            }
          );
        } catch (ee) {}
        throw e;
      }
      if (inserted && inserted.rows && inserted.rows.length > 0) {
        return {
          message: 'Transacción creada correctamente',
          data: { tx: inserted.rows[0].tx, description: descValue },
        };
      }
      // Si no se insertó (conflict), recuperar la fila existente
      const checkResAgain = await client.query(
        'SELECT tx, description FROM public."transaction" WHERE id_subsystem = $1 AND id_class = $2 AND id_method = $3 LIMIT 1;',
        [subsystemId, classId, methodId]
      );
      if (checkResAgain.rows && checkResAgain.rows.length > 0) {
        return {
          message: 'Transacción ya existente',
          data: checkResAgain.rows[0],
        };
      }
      // Fallback: devolver error si no se pudo recuperar
      return this.utils.handleError({
        message: 'No se pudo crear o recuperar la transacción',
        errorCode: this.ERROR_CODES.DB_ERROR,
      });
    }, 'Error en setTxTransaction');
  }

  /**
   * delTxTransaction
   * data: { confirmDelete, tx? } OR { confirmDelete, subsystem, className, method }
   */
  async delTxTransaction(data) {
    if (!data || typeof data !== 'object')
      return this.utils.handleError({
        message: 'Datos inválidos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const conf = this._requireConfirmJoin(data.confirmDelete, 'transaction');
    if (conf !== true) return conf;
    const { tx, subsystem, className, method } = data;
    let queryString = '';
    let params = [];
    if (tx) {
      queryString = 'DELETE FROM public."transaction" WHERE tx = $1::integer;';
      params = [tx];
    } else if (subsystem && className && method) {
      queryString = `DELETE FROM public."transaction" WHERE id_subsystem = (SELECT id FROM public."subsystem" WHERE name = $1)
        AND id_class = (SELECT id FROM public."class" WHERE name = $2)
        AND id_method = (SELECT id FROM public."method" WHERE name = $3);`;
      params = [subsystem, className, method];
    } else {
      return this.utils.handleError({
        message: 'Debe proporcionar tx o subsystem/className/method',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    }
    try {
      const nameQuery = tx ? 'delTxTransactionById' : 'delTxTransactionByNames';
      const res = await this.dbms.executeNamedQuery({ nameQuery, params });
      if (res.rowCount === 0)
        return this.utils.handleError({
          message: 'Transacción no encontrada para eliminar',
          errorCode: this.ERROR_CODES.NOT_FOUND,
        });
      return { message: 'Transacción eliminada correctamente' };
    } catch (error) {
      return this.utils.handleError({
        message: 'Error en delTxTransaction',
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  /**
   * delAllTxTransaction
   * data: { confirmDelete }
   */
  async delAllTxTransaction(data) {
    if (!data || typeof data !== 'object')
      return this.utils.handleError({
        message: 'Datos inválidos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    const conf = this._requireConfirmJoin(
      data.confirmDelete,
      'transaction',
      true
    );
    if (conf !== true) return conf;
    return await this._withTransaction(async (client) => {
      await client.query('DELETE FROM public."transaction";');
      return { message: 'Todas las transacciones eliminadas correctamente' };
    }, 'Error en delAllTxTransaction');
  }

  async handleGetSetData({ method, methodIfNotFound, data, dataIfNotFound }) {
    let result = await method(data).then((res) => res);
    if (
      result &&
      result.errorCode &&
      result.errorCode === this.ERROR_CODES.NOT_FOUND
    ) {
      await methodIfNotFound(dataIfNotFound);
      result = await method(data).then((res) => res);
    }
    return result;
  }

  // Backup en orden inverso: primero method_profile, luego method, class y subsystem
  async backupSubsystemsClassesMethodsReverseOrder() {
    return await this._withTransaction(async (client) => {
      const methodProfilesRes = await client.query(`
        SELECT mp.id_method, mp.id_profile
        FROM public."method_profile" mp;`);
      const methodsRes = await client.query(`
        SELECT m.id, m.name, m.description
        FROM public."method" m;`);
      const classesRes = await client.query(`
        SELECT c.id, c.name, c.description
        FROM public."class" c;`);
      const subsystemsRes = await client.query(`
        SELECT s.id, s.name, s.description
        FROM public."subsystem" s;`);
      const classMethodRes = await client.query(`
        SELECT cm.id_class, cm.id_method FROM public."class_method" cm;`);
      const subsystemClassRes = await client.query(`
        SELECT sc.id_subsystem, sc.id_class FROM public."subsystem_class" sc;`);
      // Guardar estructura para poder restaurar
      this._subsystemsClassesMethodsBackup = {
        methodProfiles: methodProfilesRes.rows,
        methods: methodsRes.rows,
        classes: classesRes.rows,
        subsystems: subsystemsRes.rows,
        classMethods: classMethodRes.rows,
        subsystemClasses: subsystemClassRes.rows,
      };
      return { message: 'Copia de seguridad creada correctamente' };
    }, 'Error creating backup subsystems/classes/methods');
  }

  // Realiza backup, elimina tablas dependientes, setea MenusOptionsProfiles y restaura subsistemas/clases/métodos y method_profiles
  async resetMenusAndRestoreSubsystemsClassesMethods(
    menusProfilesData,
    subsystemsClassesMethodsData
  ) {
    // Crear backup primero
    await this.backupSubsystemsClassesMethodsReverseOrder();
    if (!this._subsystemsClassesMethodsBackup)
      return this.utils.handleError({
        message: 'No se pudo crear el backup previo',
        errorCode: this.ERROR_CODES.INTERNAL_SERVER_ERROR,
      });

    return await this._withTransaction(async (client) => {
      // Eliminar en orden que evita FKs (method_profile -> class_method -> subsystem_class -> transaction -> method -> class -> subsystem)
      await client.query('DELETE FROM public."method_profile";');
      await client.query('DELETE FROM public."class_method";');
      await client.query('DELETE FROM public."subsystem_class";');
      await client.query('DELETE FROM public."transaction";');
      await client.query('DELETE FROM public."method";');
      await client.query('DELETE FROM public."class";');
      await client.query('DELETE FROM public."subsystem";');

      // Opcionalmente limpiar menús/opciones antes de recrearlos
      await client.query('DELETE FROM public."option_menu";');
      await client.query('DELETE FROM public."option_profile";');
      await client.query('DELETE FROM public."menu";');
      await client.query('DELETE FROM public."option";');

      // Insertar MenusOptionsProfiles con API existente (fuera de esta transacción para reutilizar ensure) usando la misma conexión
      // Reimplementamos internamente parte de setMenusOptionsProfiles para usar este client sin nueva transacción
      const processMenusStructure = async (data) => {
        const isShape = this._isMenusStructureShape(data);
        if (isShape) {
          for (const subsystem of Object.keys(data)) {
            const menusLevel1 = Object.keys(data[subsystem] || {});
            for (const menuName of menusLevel1) {
              const menuNode = data[subsystem][menuName];
              const menu1Id = await this._ensureEntityByUniqueField(
                client,
                'menu',
                {
                  name: menuName,
                  description: menuNode?.description || menuName,
                }
              );
              const traverse = async (parentId, node) => {
                const submenus = Object.keys(node?.submenus || {});
                for (const submenuName of submenus) {
                  const submenuNode = node.submenus[submenuName];
                  const submenuId = await this._ensureEntityByUniqueField(
                    client,
                    'menu',
                    {
                      name: submenuName,
                      description: submenuNode?.description || submenuName,
                      ...(parentId ? { id_parent: parentId } : {}),
                    }
                  );
                  const options = Object.keys(submenuNode?.options || {});
                  for (const optionName of options) {
                    const optionNode = submenuNode.options[optionName];
                    const optionId = await this._ensureEntityByUniqueField(
                      client,
                      'option',
                      {
                        name: optionName,
                        description: optionNode?.description || optionName,
                      }
                    );
                    await this._ensureJoin(client, 'option_menu', {
                      id_menu: submenuId,
                      id_option: optionId,
                    });
                    for (const prof of optionNode?.allowedProfiles || []) {
                      const profileId = await this._ensureEntityByUniqueField(
                        client,
                        'profile',
                        { name: prof }
                      );
                      await this._ensureJoin(client, 'option_profile', {
                        id_option: optionId,
                        id_profile: profileId,
                      });
                    }
                  }
                  await traverse(submenuId, submenuNode);
                }
                const optionsHere = Object.keys(node?.options || {});
                for (const optionName of optionsHere) {
                  const optionNode = node.options[optionName];
                  const optionId = await this._ensureEntityByUniqueField(
                    client,
                    'option',
                    {
                      name: optionName,
                      description: optionNode?.description || optionName,
                    }
                  );
                  await this._ensureJoin(client, 'option_menu', {
                    id_menu: parentId || menu1Id,
                    id_option: optionId,
                  });
                  for (const prof of optionNode?.allowedProfiles || []) {
                    const profileId = await this._ensureEntityByUniqueField(
                      client,
                      'profile',
                      { name: prof }
                    );
                    await this._ensureJoin(client, 'option_profile', {
                      id_option: optionId,
                      id_profile: profileId,
                    });
                  }
                }
              };
              await traverse(menu1Id, menuNode);
            }
          }
        } else {
          for (const profile of Object.keys(data || {})) {
            const menusData = data[profile];
            for (const menu of Object.keys(menusData || {})) {
              const arrOptions = menusData[menu];
              const menuId = await this._ensureEntityByUniqueField(
                client,
                'menu',
                { name: menu }
              );
              for (const option of arrOptions || []) {
                const optionId = await this._ensureEntityByUniqueField(
                  client,
                  'option',
                  { name: option }
                );
                await this._ensureJoin(client, 'option_menu', {
                  id_menu: menuId,
                  id_option: optionId,
                });
                const profileId = await this._ensureEntityByUniqueField(
                  client,
                  'profile',
                  { name: profile }
                );
                await this._ensureJoin(client, 'option_profile', {
                  id_option: optionId,
                  id_profile: profileId,
                });
              }
            }
          }
        }
      };
      await processMenusStructure(menusProfilesData || {});

      // Restaurar subsystems/classes/methods y relaciones
      // Si se proporciona subsystemsClassesMethodsData usarlo; si no usar backup
      const restoreData =
        subsystemsClassesMethodsData || this._subsystemsClassesMethodsBackup;
      if (!restoreData)
        return this.utils.handleError({
          message: 'No hay datos para restaurar subsistemas/clases/métodos',
          errorCode: this.ERROR_CODES.BAD_REQUEST,
        });

      // Primero insertar subsystems
      const subsystemIdMap = {};
      for (const s of restoreData.subsystems || []) {
        const sId = await this._ensureEntityByUniqueField(client, 'subsystem', {
          name: s.name,
          description: s.description || s.name,
        });
        subsystemIdMap[s.id] = sId;
      }
      // Luego classes
      const classIdMap = {};
      for (const c of restoreData.classes || []) {
        const cId = await this._ensureEntityByUniqueField(client, 'class', {
          name: c.name,
          description: c.description || c.name,
        });
        classIdMap[c.id] = cId;
      }
      // Luego methods
      const methodIdMap = {};
      for (const m of restoreData.methods || []) {
        const mId = await this._ensureEntityByUniqueField(client, 'method', {
          name: m.name,
          description: m.description || m.name,
        });
        methodIdMap[m.id] = mId;
      }
      // Relaciones subsystem_class
      for (const sc of restoreData.subsystemClasses || []) {
        const newSubsystemId = subsystemIdMap[sc.id_subsystem];
        const newClassId = classIdMap[sc.id_class];
        if (newSubsystemId && newClassId) {
          await this._ensureJoin(client, 'subsystem_class', {
            id_subsystem: newSubsystemId,
            id_class: newClassId,
          });
        }
      }
      // Relaciones class_method
      for (const cm of restoreData.classMethods || []) {
        const newClassId = classIdMap[cm.id_class];
        const newMethodId = methodIdMap[cm.id_method];
        if (newClassId && newMethodId) {
          await this._ensureJoin(client, 'class_method', {
            id_class: newClassId,
            id_method: newMethodId,
          });
        }
      }
      // method_profile
      for (const mp of restoreData.methodProfiles || []) {
        const newMethodId = methodIdMap[mp.id_method];
        if (newMethodId) {
          await this._ensureJoin(client, 'method_profile', {
            id_method: newMethodId,
            id_profile: mp.id_profile,
          });
        }
      }
      // Restaurar transactions
      for (const m of restoreData.methods || []) {
        // reconstruimos tx = subsystem.class.method si se puede
        const relatedClass = restoreData.classMethods.find(
          (cm) => cm.id_method === m.id
        );
        if (relatedClass) {
          const relatedSubsystem = restoreData.subsystemClasses.find(
            (sc) => sc.id_class === relatedClass.id_class
          );
          if (relatedSubsystem) {
            const txKey = `${restoreData.subsystems.find((s) => s.id === relatedSubsystem.id_subsystem)?.name}.${restoreData.classes.find((c) => c.id === relatedClass.id_class)?.name}.${m.name}`;
            const newSubsystemId =
              subsystemIdMap[relatedSubsystem.id_subsystem];
            const newClassId = classIdMap[relatedClass.id_class];
            const newMethodId = methodIdMap[m.id];
            if (newSubsystemId && newClassId && newMethodId) {
              const txCheckRes = await client.query(
                'SELECT id FROM public."transaction" WHERE id_subsystem = $1 AND id_class = $2 AND id_method = $3 LIMIT 1;',
                [newSubsystemId, newClassId, newMethodId]
              );
              if (!txCheckRes.rows || txCheckRes.rows.length === 0) {
                // Insert transaction without forcing the tx column (serial PK).
                // Use SELECT-before-INSERT semantics already above; still guard against races.
                try {
                  await client.query(
                    'INSERT INTO public."transaction" (description, id_subsystem, id_class, id_method) VALUES ($1, $2, $3, $4) RETURNING tx;',
                    [
                      m.description || txKey,
                      newSubsystemId,
                      newClassId,
                      newMethodId,
                    ]
                  );
                } catch (e) {
                  // If another session inserted the same transaction concurrently, ignore duplicate-key and continue
                  if (e && e.code === '23505') {
                    // noop - already created by concurrent process
                  } else {
                    throw e;
                  }
                }
              }
            }
          }
        }
      }
      // Actualizar id_subsystem en menú si la entrada tiene forma de subsystems con menus asociados
      const hasSubsystemMenus = (obj) =>
        obj &&
        typeof obj === 'object' &&
        Object.values(obj).some(
          (v) => v && typeof v === 'object' && (v.menus || v.classes)
        );
      if (
        hasSubsystemMenus(subsystemsClassesMethodsData) &&
        subsystemsClassesMethodsData
      ) {
        for (const subsystemName of Object.keys(subsystemsClassesMethodsData)) {
          const subsystemOrig = restoreData.subsystems.find(
            (s) => s.name === subsystemName
          );
          if (!subsystemOrig) continue;
          const newSubsystemId = subsystemIdMap[subsystemOrig.id];
          if (!newSubsystemId) continue;
          const menusObj =
            subsystemsClassesMethodsData[subsystemName].menus || {};
          for (const menuName of Object.keys(menusObj)) {
            await client.query(
              'UPDATE public."menu" SET id_subsystem = $1 WHERE name = $2;',
              [newSubsystemId, menuName]
            );
          }
        }
      }
      return {
        message:
          'Menús reestablecidos y subsistemas/clases/métodos restaurados correctamente',
      };
    }, 'Error al restablecer menús y restaurar subsistemas/clases/métodos');
  }
}
