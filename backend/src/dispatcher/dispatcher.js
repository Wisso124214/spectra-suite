import Session from '#session/session.js';
import SessionManager from '#session/sessionManager.js';
import Security from '#security/security.js';
import Config from '#config/config.js';
import Repository from '#repository/repository.js';

export default class Dispatcher {
  constructor(app) {
    this.app = app;
    this.session = new Session();
    this.security = new Security();
    this.config = new Config().getConfig();
    this.ERROR_CODES = this.config.ERROR_CODES;
    this.repository = new Repository();

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
        const { getSession } = new SessionManager();

        // Obtener sesión
        const currentSession = getSession(req);
        if (!currentSession) {
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

        try {
          transactionData = await this.security.getTxTransaction({ tx });
        } catch (err) {
          return res.status(this.ERROR_CODES.NOT_FOUND).send({
            errorCode: this.ERROR_CODES.NOT_FOUND,
            message: 'Error. El código de transacción no es válido.',
          });
        }

        const { subsystem, className, method } = transactionData;

        if (!className || !method) {
          return res.status(this.ERROR_CODES.BAD_REQUEST).send({
            errorCode: this.ERROR_CODES.BAD_REQUEST,
            message: 'Se requieren className y method en la petición',
          });
        }

        // Determinar profile desde la sesión activa
        const profileFromSession = currentSession.activeProfile;

        const checkInput = {
          subsystem: subsystem || null,
          className,
          method,
          profile: payload.profile || profileFromSession || null,
        };

        if (!checkInput.profile) {
          return res.status(this.ERROR_CODES.BAD_REQUEST).send({
            errorCode: this.ERROR_CODES.BAD_REQUEST,
            message:
              'Su sesión ha sido finalizada. Por favor inicie sesión nuevamente.',
          });
        }

        const perm = await this.security.checkPermissionMethod(checkInput);
        // checkPermissionMethod puede devolver false o un objeto { hasPermission }
        const hasPermission =
          perm === false ? false : Boolean(perm && perm.hasPermission);

        if (!hasPermission) {
          return res.status(this.ERROR_CODES.FORBIDDEN).send({
            errorCode: this.ERROR_CODES.FORBIDDEN,
            message: 'No tiene permisos para ejecutar este método',
            permission: perm.hasPermission,
          });
        }

        const objectParams = JSON.parse(params || '{}');
        // Ejecutar el método solicitado
        const execResult = await this.security.executeMethod({
          className,
          method,
          params: objectParams,
        });

        return res.send({ ok: true, result: execResult });
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
          error: error?.message || error,
        });
      }
    });

    this.app.post('/', async (req, res) => {
      await fetch('/toProcess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      })
        .then((response) => response.json())
        .then((data) => res.send(data))
        .catch((error) => {
          console.error('Error en /:', error);
          res
            .status(this.ERROR_CODES.INTERNAL_SERVER_ERROR)
            .send({ error: 'Error procesando la petición' });
        });
    });
  }
}
