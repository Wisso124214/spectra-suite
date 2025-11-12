import Session from '#session/session.js';
import SessionManager from './sessionManager.js';
import Config from '#config/config.js';
import DBMS from '#dbms/dbms.js';

export const createRoutes = async (app) => {
  const session = new Session();
  const sessionMngr = new SessionManager();
  const config = new Config().getConfig();
  const ERROR_CODES = config.ERROR_CODES;
  const dbms = new DBMS();

  const { existSession, createAndUpdateSession, destroySession } = sessionMngr;

  app.get('/usernames', async (req, res) => {
    try {
      const result = await dbms.executeNamedQuery({ nameQuery: 'getUsers' });
      const users = result?.rows || [];
      const usernames = users.map((user) => user.username);
      res.json(usernames);
    } catch (err) {
      res.status(err?.errorCode || 500).json({
        message: err?.message || 'Error obteniendo usuarios',
      });
    }
  });

  app.post('/login', async (req, res) => {
    if (existSession(req)) {
      return res.send({
        message: `Ya has iniciado sesión. Cierra la sesión para continuar.`,
        redirect: '/home',
      });
    }

    const userData = req.body || JSON.parse(req.headers.data || '{}');

    const ret = await session.login({ userData });
    console.log('Login result:', ret);

    if (ret?.userData) {
      const sanitized = { ...ret.userData };
      delete sanitized.password;
      console.log('Sanitized user data for session:', sanitized);
      createAndUpdateSession(req, sanitized);
      return res.send(ret);
    } else if (ret?.profiles) {
      return res.send(ret);
    } else if (ret?.errorCode) {
      return res.status(ret.errorCode).send(ret);
    } else {
      return res.status(ERROR_CODES.INTERNAL_SERVER_ERROR).send({
        errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'Error al iniciar sesión',
      });
    }
  });

  app.post('/register', async (req, res) => {
    let userData = req.body || JSON.parse(req.headers.data || '{}');
    const { username, password } = userData;
    const isParticipant =
      sessionMngr.getSession(req)?.activeProfile ===
      session.PROFILES?.PARTICIPANT?.name;

    if (existSession(req)) {
      return res.send({
        message: `Ya has iniciado sesión. Cierra la sesión para continuar.`,
        redirect: '/home',
      });
    }

    const registerResult = await session.register({ userData, isParticipant });
    if (registerResult.errorCode) {
      return res.status(registerResult.errorCode).send(registerResult);
    }

    // Auto login tras registro
    const loginResult = await session.login({
      userData: { username, password },
    });

    if (loginResult.errorCode) {
      return res.status(loginResult.errorCode).send(loginResult);
    }
    if (loginResult.userData) {
      // Aseguramos que no se guarda password
      const sanitized = { ...loginResult.userData };
      delete sanitized.password;
      createAndUpdateSession(req, sanitized);
    }
    // Si requiere selección de perfil devolvemos lista de perfiles junto al mensaje de registro
    return res.send({ ...registerResult, ...loginResult });
  });

  app.get('/logout', async (req, res) => {
    if (!existSession(req)) {
      return res.send({
        message: 'No has iniciado sesión.',
        redirect: '/login',
      });
    }
    const result = destroySession(req);
    return res.send(result);
  });

  // This should be deleted when /toProcess were done
  app.post('/forgotPassword', async (req, res) => {
    let userData = req.body || JSON.parse(req.headers.data || '{}');
    const origin = req.headers.origin;
    const ret = await session
      .forgotPassword({ userData, origin })
      .then((res) => res);

    if (ret.errorCode) return res.status(ret.errorCode).send(ret);
    else return res.send(ret);
  });

  app.post('/resetPassword', async (req, res) => {
    let userData = req.body || JSON.parse(req.headers.data || '{}');
    const ret = await session.resetPassword({ userData });

    if (ret.errorCode) return res.status(ret.errorCode).send(ret);
    else return res.send(ret);
  });
};
