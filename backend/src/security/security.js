import DBMS from '#dbms/dbms.js';
import Utils from '#utils/utils.js';
import Config from '#config/config.js';

export default class Security {
  constructor(data = {}) {
    if (!Security.instance) {
      const {} = data;
      this.permissions = {};
      this.utils = new Utils();
      this.dbms = new DBMS();
      this.ERROR_CODES = new Config().getErrorCodes();

      Security.instance = this;
    }
    return Security.instance;
  }

  /**
   * Carga todos los permisos método↔perfil en memoria.
   * Construye un objeto permissions con claves del tipo
   *   `${id_subsystem}_${id_class}_${id_method}_${id_profile}` => boolean
   * donde el valor es true si existe relación en method_profile y false en caso contrario.
   */
  async loadPermissions() {
    try {
      if (!this.dbms.queries) {
        await this.dbms.init();
      }
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'loadPermissions',
        params: [],
      });
      const map = {};
      for (const row of res.rows || []) {
        const key = `${row.id_subsystem}_${row.id_class}_${row.id_method}_${row.id_profile}`;
        map[key] = !!row.allowed;
      }
      this.permissions = map;
      return map;
    } catch (error) {
      return this.utils.handleError({
        message: 'Error cargando permisos',
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }

  // Normaliza un alias de perfil
  async _normalizeProfileName(profile) {
    if (!profile || typeof profile !== 'string') return profile;
    try {
      const profiles = await new Config().getProfiles();
      // Si coincide con una clave de alias, devolver el nombre real
      if (profiles && Object.prototype.hasOwnProperty.call(profiles, profile)) {
        const mapped = profiles[profile]?.name || profile;
        return mapped;
      }
      // Si ya viene como nombre real, mantenerlo
      return profile;
    } catch (_) {
      // En caso de error de config, devolver original
      return profile;
    }
  }

  /**
   * changePermission
   * Cambia (concede o revoca) el permiso de acceso de un perfil a un método
   * identificado por (subsystem, className, method). Valida que la cadena
   * subsystem→class→method exista y que el perfil exista. Luego inserta o
   * elimina la fila en public."method_profile".
   *
   * data: {
   *   subsystem: string,
   *   className: string,
   *   method: string,
   *   profile: string,
   *   value: boolean // true => concede, false => revoca
   * }
   * Devuelve resumen con estado previo/actual y la clave en el mapa en memoria.
   */
  async changePermission(data = {}) {
    const { subsystem, className, method, profile, value } = data || {};

    // Validación básica de entradas
    const isNonEmptyString = (v) =>
      typeof v === 'string' && v.trim().length > 0;
    if (
      !isNonEmptyString(subsystem) ||
      !isNonEmptyString(className) ||
      !isNonEmptyString(method) ||
      !isNonEmptyString(profile) ||
      typeof value !== 'boolean'
    ) {
      this.utils.handleError({
        message:
          'Parámetros inválidos: subsystem, className, method, profile (string) y value (boolean) son requeridos',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    }

    try {
      if (!this.dbms.queries) {
        await this.dbms.init();
      }

      // Resolver IDs y relaciones usando consulta nombrada
      const profileName = await this._normalizeProfileName(profile.trim());
      const idsRes = await this.dbms.executeNamedQuery({
        nameQuery: 'resolveMethodPermissionRefs',
        params: {
          subsystem_name: subsystem.trim(),
          class_name: className.trim(),
          method_name: method.trim(),
          profile_name: profileName,
        },
      });

      const row = idsRes?.rows?.[0] || {};
      const {
        id_subsystem,
        id_class,
        id_method,
        id_profile,
        valid_sc,
        valid_cm,
      } = row;

      // Errores específicos para guiar al operador
      if (!id_subsystem) {
        this.utils.handleError({
          message: `Subsistema no encontrado: ${subsystem}`,
          errorCode: this.ERROR_CODES.NOT_FOUND,
        });
      }
      if (!id_class) {
        this.utils.handleError({
          message: `Clase no encontrada: ${className}`,
          errorCode: this.ERROR_CODES.NOT_FOUND,
        });
      }
      if (!valid_sc) {
        this.utils.handleError({
          message: `La clase '${className}' no pertenece al subsistema '${subsystem}'`,
          errorCode: this.ERROR_CODES.CONFLICT,
        });
      }
      if (!id_method) {
        this.utils.handleError({
          message: `Método no encontrado: ${method}`,
          errorCode: this.ERROR_CODES.NOT_FOUND,
        });
      }
      if (!valid_cm) {
        this.utils.handleError({
          message: `El método '${method}' no pertenece a la clase '${className}'`,
          errorCode: this.ERROR_CODES.CONFLICT,
        });
      }
      if (!id_profile) {
        this.utils.handleError({
          message: `Perfil no encontrado: ${profile}`,
          errorCode: this.ERROR_CODES.NOT_FOUND,
        });
      }

      // Estado previo usando consulta nombrada (por nombres para compatibilidad)
      const prevRes = await this.dbms.executeNamedQuery({
        nameQuery: 'hasProfileMethod',
        params: { method_name: method.trim(), profile_name: profileName },
      });
      const previous = !!prevRes?.rows?.[0]?.allowed;

      if (value) {
        // Conceder permiso
        await this.dbms.executeNamedQuery({
          nameQuery: 'grantMethodPermission',
          params: { method_name: method.trim(), profile_name: profileName },
        });
      } else {
        // Revocar permiso
        await this.dbms.executeNamedQuery({
          nameQuery: 'revokeMethodPermission',
          params: { method_name: method.trim(), profile_name: profileName },
        });
      }

      // Refrescar permisos en memoria
      await this.loadPermissions();

      const key = `${id_subsystem}_${id_class}_${id_method}_${id_profile}`;
      return {
        ok: true,
        key,
        previous,
        current: !!value,
        changed: previous !== !!value,
        ids: { id_subsystem, id_class, id_method, id_profile },
        action: value ? 'granted' : 'revoked',
      };
    } catch (error) {
      // this.utils.handleError ya lanzó; este catch es preventivo
      throw error;
    }
  }

  /**
   * checkPermissionMethod
   * Verifica si un perfil tiene permiso sobre un método.
   * Acepta dos formas de entrada:
   *  - Por IDs: { id_subsystem, id_class, id_method, id_profile }
   *  - Por nombres: { subsystem, className, method, profile } (todos string)
   * En ambos casos compone la clave `${id_subsystem}_${id_class}_${id_method}_${id_profile}`
   * y retorna el booleano correspondiente de this.permissions (false si no existe).
   */
  async checkPermissionMethod(data = {}) {
    const {
      // por IDs
      id_subsystem,
      id_class,
      id_method,
      id_profile,
      // por nombres
      subsystem,
      className,
      method,
      profile,
    } = data || {};

    const isNonEmptyString = (v) =>
      typeof v === 'string' && v.trim().length > 0;
    const isInt = (v) => Number.isInteger(v);

    // Cargar permisos en memoria si aún no están presentes
    if (!this.permissions || Object.keys(this.permissions).length === 0) {
      await this.loadPermissions();
    }

    let ids = {
      id_subsystem: null,
      id_class: null,
      id_method: null,
      id_profile: null,
    };

    // Caso 1: entrada por IDs completa
    if (
      isInt(id_subsystem) &&
      isInt(id_class) &&
      isInt(id_method) &&
      (isInt(id_profile) || isInt(profile))
    ) {
      ids = {
        id_subsystem,
        id_class,
        id_method,
        id_profile: isInt(id_profile) ? id_profile : profile,
      };
    }
    // Caso 2: entrada por nombres completa (incluye profile como string)
    else if (
      isNonEmptyString(subsystem) &&
      isNonEmptyString(className) &&
      isNonEmptyString(method) &&
      isNonEmptyString(profile)
    ) {
      // Resolver IDs mediante consulta nombrada
      try {
        if (!this.dbms.queries) {
          await this.dbms.init();
        }
        const profileName = await this._normalizeProfileName(profile.trim());
        const idsRes = await this.dbms.executeNamedQuery({
          nameQuery: 'resolveMethodPermissionRefs',
          params: {
            subsystem_name: subsystem.trim(),
            class_name: className.trim(),
            method_name: method.trim(),
            profile_name: profileName,
          },
        });
        const row = idsRes?.rows?.[0] || {};
        const {
          id_subsystem: s,
          id_class: c,
          id_method: m,
          id_profile: p,
        } = row;
        ids = { id_subsystem: s, id_class: c, id_method: m, id_profile: p };
      } catch (error) {
        this.utils.handleError({
          message: 'Error resolviendo referencias de permiso',
          errorCode: this.ERROR_CODES.DB_ERROR,
          error,
        });
      }
    } else {
      this.utils.handleError({
        message:
          'Parámetros inválidos: use IDs { id_subsystem, id_class, id_method, id_profile } o nombres { subsystem, className, method, profile }',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    }

    const { id_subsystem: s, id_class: c, id_method: m, id_profile: p } = ids;
    // Si faltó resolver algún ID, no hay permiso (o datos inválidos)
    if (!isInt(s) || !isInt(c) || !isInt(m) || !isInt(p)) {
      return false;
    }

    const key = `${s}_${c}_${m}_${p}`;
    return {
      hasPermission: !!this.permissions[key],
      subsystem: subsystem || null,
      className: className || null,
      method: method || null,
      profile: profile || null,
      key,
    };
  }

  async executeMethod({ className, method, params }) {
    const c = await import(`#${className}/${className}.js`);
    let i = new c.default();
    if (i && typeof i[method] !== 'function') {
      this.utils.handleError({
        message: `Método '${method}' no encontrado en clase '${className}'`,
        errorCode: this.ERROR_CODES.NOT_FOUND,
      });
    }
    const r = await i[method](params);
    i = null;
    return r;
  }

  /**
   * getTxTransaction
   * data: { tx? } OR { subsystem, className, method }
   * Devuelve información de la transacción y nombres asociados
   */
  async getTxTransaction(data) {
    if (!data || typeof data !== 'object') {
      console.log('invalid data: ', data);
      return {
        message: 'Datos inválidos, el parámetro debe ser un objeto',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      };
    }

    const { tx, subsystem, className, method } = data;
    let queryString = '';
    let params = [];
    if (tx) {
      queryString = `SELECT t.tx, t.description, s.name AS subsystem, c.name AS class, m.name AS method
        FROM public."transaction" t
        JOIN public."subsystem" s ON t.id_subsystem = s.id
        JOIN public."class" c ON t.id_class = c.id
        JOIN public."method" m ON t.id_method = m.id
        WHERE t.tx = $1::integer;`;
      params = [tx];
    } else if (subsystem && className && method) {
      queryString = `SELECT t.tx, t.description, s.name AS subsystem, c.name AS class, m.name AS method
        FROM public."transaction" t
        JOIN public."subsystem" s ON t.id_subsystem = s.id
        JOIN public."class" c ON t.id_class = c.id
        JOIN public."method" m ON t.id_method = m.id
        WHERE s.name = $1 AND c.name = $2 AND m.name = $3;`;
      params = [subsystem, className, method];
    } else {
      return this.utils.handleError({
        message: 'Debe proporcionar tx o subsystem/className/method',
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    }
    try {
      const res = await this.dbms
        .query({ query: queryString, params })
        .then((r) => r);
      if (!res.rows || res.rows.length === 0)
        return this.utils.handleError({
          message: 'Transacción no encontrada',
          errorCode: this.ERROR_CODES.NOT_FOUND,
        });

      res.rows[0].className = res.rows[0].class;
      return res.rows[0];
    } catch (error) {
      return this.utils.handleError({
        message: 'Error en getTxTransaction',
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }
}
