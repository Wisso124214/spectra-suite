import Session from '#session/session.js';
import SessionManager from '#session/sessionManager.js';
import Security from '#security/security.js';
import Config from '#config/config.js';
import Debugger from '#debugger/debugger.js';

export default class Dispatcher {
  constructor(app) {
    this.app = app;
    this.session = new Session();
    this.security = new Security();
    this.config = new Config();
    this.ERROR_CODES = this.config.ERROR_CODES;
    this.dbgr = new Debugger();

    if (!Dispatcher.instance) {
      Dispatcher.instance = this;
    }
    return Dispatcher.instance;
  }

  init() {
    this.createToProcess();
  }

  createToProcess() {
    this.app.post('/toProcess', async (req, res) => {
      try {
        //Cambiar la instancia para arriba para hacer solo una instancia del objeto
        const { getSession } = new SessionManager();

        // Obtener sesión
        const userData = getSession(req);
        if (!userData) {
          return res.status(this.ERROR_CODES.UNAUTHORIZED).send({
            errorCode: this.ERROR_CODES.UNAUTHORIZED,
            message: 'Usuario no autenticado',
          });
        }

        // Payload esperado: puede venir en body o en header.data (compatibilidad)
        const payload = req.body || JSON.parse(req.headers.data || '{}');

        // Validaciones básicas de entrada
        const { tx, params } = payload || {};

        let transactionData = null;

        console.log(
          'Received /toProcess request with tx:',
          tx,
          'and params:',
          params
        );
        try {
          transactionData = await this.security.getTxTransaction({ tx });
        } catch (err) {
          return res.status(this.ERROR_CODES.NOT_FOUND).send({
            errorCode: this.ERROR_CODES.NOT_FOUND,
            message: 'Error. El código de transacción no es válido.',
            userData,
          });
        }

        const { subsystem, className, method } = transactionData;

        if (!className || !method) {
          return res.status(this.ERROR_CODES.BAD_REQUEST).send({
            errorCode: this.ERROR_CODES.BAD_REQUEST,
            message: 'Se requieren className y method en la petición',
            userData,
          });
        }

        // Determinar profile desde la sesión activa
        // Nombrar las trasacciones

        const profileFromSession = userData.activeProfile;

        const checkData = {
          subsystem: subsystem || null,
          className,
          method,
          profile: profileFromSession || null,
        };

        console.log('Check data for permission:', checkData);

        if (!checkData.profile) {
          return res.status(this.ERROR_CODES.BAD_REQUEST).send({
            errorCode: this.ERROR_CODES.BAD_REQUEST,
            message:
              'Su sesión ha sido finalizada. Por favor inicie sesión nuevamente.',
            userData,
          });
        }
        const perm = await this.security.checkPermissionMethod(checkData);

        if (perm && !perm.hasPermission) {
          return res.status(this.ERROR_CODES.FORBIDDEN).send({
            errorCode: this.ERROR_CODES.FORBIDDEN,
            tx: tx,
            message: 'No tiene permisos para ejecutar este método',
            permission: perm.hasPermission,
            userData,
          });
        }

        let objectParams = {};
        if (typeof params === 'string')
          objectParams = JSON.parse(params || '{}');
        else objectParams = params || {};
        // Ejecutar el método solicitado
        const execResult = await this.security.executeMethod({
          subsystem,
          className,
          method,
          params: objectParams,
        });

        const newUserData = getSession(req); // refrescar datos de sesión por si hubo cambios

        return res.send({
          ok: true,
          result: execResult,
          userData: newUserData,
        });
      } catch (error) {
        // Manejo genérico de errores
        const code =
          (this.security &&
            this.security.ERROR_CODES &&
            this.security.ERROR_CODES.INTERNAL_SERVER_ERROR) ||
          500;
        console.error('Error en /toProcess:', error?.message || error);
        return res.status(code).send({
          errorCode: code,
          message: 'Error procesando la petición',
          error: JSON.stringify(error),
        });
      }
    });

    // catch-all POST route: match any path and redirect with 307 to preserve
    // the original HTTP method and request body when forwarding to /toProcess
    // Use a RegExp /.*/ to avoid path-to-regexp parsing issues with '*'
    this.app.post(/.*/, (req, res) => {
      // 307 Temporary Redirect preserves method (POST) and body
      return res.redirect(307, '/toProcess');
    });

    this.app.get('/', async (req, res) => {
      res.send('API running');
    });
  }
}
