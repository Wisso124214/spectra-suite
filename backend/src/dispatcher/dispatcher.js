import Session from '../session/session.js';
import SessionManager from '../session/sessionManager.js';
import Security from '../security/security.js';
import Config from '../../config/config.js';
import Debugger from '../debugger/debugger.js';
import DBMS from '../dbms/dbms.js';
import Validator from '../validator/validator.js';
import Business from '../_business/business.js';

export default class Dispatcher {
  constructor(app) {
    if (Dispatcher.instance) return Dispatcher.instance;

    this.app = app;
    this.session = new Session();
    this.sessionMngr = new SessionManager();
    this.security = new Security();
    this.config = new Config();
    this.ERROR_CODES = this.config.ERROR_CODES;
    this.dbms = new DBMS(null);
    this.validator = new Validator(this.dbms);
    this.dbms.validator = this.validator;
    this.dbgr = new Debugger();
    this.business = new Business();

    Dispatcher.instance = this;
    return this;
  }

  async init() {
    // Inicializa DBMS y Dispatcher
    await this.dbms.init();
    this.business.init();
    this.createSessionRoutes();
    this.createToProcess();
    this.createDefaultRoute();
  }

  createSessionRoutes() {
    const { app, session, sessionMngr, ERROR_CODES, dbms } = this;
    const { existSession, createAndUpdateSession, destroySession, getSession } =
      sessionMngr;

    app.get('/usernames', async (req, res) => {
      try {
        const result = await dbms.executeNamedQuery({ nameQuery: 'getUsers' });
        const usernames = (result?.rows || []).map((u) => u.username);
        res.json(usernames);
      } catch (err) {
        res
          .status(err?.errorCode || 500)
          .json({ message: err?.message || 'Error obteniendo usuarios' });
      }
    });

    app.post('/login', async (req, res) => {
      if (existSession(req)) {
        return res.send({
          errorCode: ERROR_CODES.BAD_REQUEST,
          message: `Ya has iniciado sesión. Cierra la sesión para continuar.`,
          redirect: '/home',
        });
      }
      const userData = req.body || JSON.parse(req.headers.data || '{}');
      const ret = await session.login({ userData });

      if (ret?.userData) {
        const sanitized = { ...ret.userData };
        delete sanitized.password;
        createAndUpdateSession(req, sanitized);
        return res.send(ret);
      } else if (ret?.profiles) return res.send(ret);
      else if (ret?.errorCode) return res.status(ret.errorCode).send(ret);
      else
        return res
          .status(ERROR_CODES.INTERNAL_SERVER_ERROR)
          .send({ message: 'Error al iniciar sesión' });
    });

    app.post('/register', async (req, res) => {
      console.log('Registro de usuario iniciado');
      if (existSession(req)) {
        return res.send({
          message: `Ya has iniciado sesión. Cierra la sesión para continuar.`,
          redirect: '/home',
        });
      }
      const userData = req.body || JSON.parse(req.headers.data || '{}');
      const isParticipant =
        getSession(req)?.activeProfile === session.PROFILES?.PARTICIPANT?.name;

      const registerResult = await session.register({
        userData,
        isParticipant,
      });

      if (registerResult.errorCode)
        return res.status(registerResult.errorCode).send(registerResult);

      // Auto login
      const loginResult = await session.login({
        userData: { username: userData.username, password: userData.password },
      });
      if (loginResult.errorCode)
        return res.status(loginResult.errorCode).send(loginResult);

      if (loginResult.userData) {
        const sanitized = { ...loginResult.userData };
        delete sanitized.password;
        createAndUpdateSession(req, sanitized);
      }

      return res.send({ ...registerResult, ...loginResult });
    });

    app.get('/logout', async (req, res) => {
      if (!existSession(req))
        return res.send({
          message: 'No has iniciado sesión.',
          redirect: '/login',
        });
      const result = destroySession(req);
      return res.send(result);
    });

    app.post('/changeProfile', async (req, res) => {
      if (!existSession(req))
        return res.status(ERROR_CODES.UNAUTHORIZED).send({
          errorCode: ERROR_CODES.UNAUTHORIZED,
          message: 'No has iniciado sesión.',
        });
      const userData = req.body || JSON.parse(req.headers.data || '{}');
      const result = await session.changeActiveProfile({ userData });
      if (result.errorCode) return res.status(result.errorCode).send(result);
      createAndUpdateSession(req, result.userData);
      return res.send({ ok: true, result, userData: result.userData });
    });

    app.post('/forgotPassword', async (req, res) => {
      const userData = req.body || JSON.parse(req.headers.data || '{}');
      const origin = req.headers.origin;
      const ret = await session.forgotPassword({ userData, origin });
      if (ret.errorCode) return res.status(ret.errorCode).send(ret);
      return res.send(ret);
    });

    app.post('/resetPassword', async (req, res) => {
      const userData = req.body || JSON.parse(req.headers.data || '{}');
      const ret = await session.resetPassword({ userData });
      if (ret.errorCode) return res.status(ret.errorCode).send(ret);
      return res.send(ret);
    });
  }

  createToProcess() {
    const { app, sessionMngr, security, ERROR_CODES } = this;
    const { getSession } = sessionMngr;

    app.post('/toProcess', async (req, res) => {
      try {
        const userData = getSession(req);
        if (!userData)
          return res.status(ERROR_CODES.UNAUTHORIZED).send({
            errorCode: ERROR_CODES.UNAUTHORIZED,
            message: 'Usuario no autenticado',
          });

        const payload = req.body || JSON.parse(req.headers.data || '{}');
        const { tx, params } = payload;

        let transactionData;
        try {
          transactionData = await security.getTxTransaction({ tx });
        } catch (err) {
          return res.status(ERROR_CODES.NOT_FOUND).send({
            errorCode: ERROR_CODES.NOT_FOUND,
            message: 'Código de transacción inválido',
            userData,
          });
        }

        const { subsystem, className, method } = transactionData;
        if (!className || !method)
          return res.status(ERROR_CODES.BAD_REQUEST).send({
            errorCode: ERROR_CODES.BAD_REQUEST,
            message: 'Se requieren className y method',
            userData,
          });

        const profileFromSession = userData.activeProfile;
        if (!profileFromSession)
          return res.status(ERROR_CODES.BAD_REQUEST).send({
            errorCode: ERROR_CODES.BAD_REQUEST,
            message: 'Sesión expirada',
            userData,
          });

        const perm = await security.checkPermissionMethod({
          subsystem,
          className,
          method,
          profile: profileFromSession,
        });
        if (perm && !perm.hasPermission)
          return res.status(ERROR_CODES.FORBIDDEN).send({
            errorCode: ERROR_CODES.FORBIDDEN,
            tx,
            message: 'Sin permisos',
            permission: perm.hasPermission,
            userData,
          });

        const objectParams =
          typeof params === 'string'
            ? JSON.parse(params || '{}')
            : params || {};
        const execResult = await security.executeMethod({
          subsystem,
          className,
          method,
          params: objectParams,
        });
        const newUserData = getSession(req);

        return res.send({
          ok: true,
          result: execResult,
          userData: newUserData,
        });
      } catch (error) {
        console.error('Error en /toProcess:', error);
        return res.status(ERROR_CODES.INTERNAL_SERVER_ERROR).send({
          errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: 'Error procesando la petición',
          error: JSON.stringify(error),
        });
      }
    });

    // Catch-all POST → redirect 307
    app.post(/.*/, (req, res) => res.redirect(307, '/toProcess'));
  }

  createDefaultRoute() {
    this.app.get('/', async (req, res) => res.send('API running'));
  }
}
