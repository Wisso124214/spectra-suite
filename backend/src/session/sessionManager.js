import Debugger from '#debugger/debugger.js';

export default class SessionManager {
  constructor() {
    this.dbgr = new Debugger();
  }

  createAndUpdateSession = (req, data) => {
    this.createSession(req);
    this.updateSession(req, data);
    this.dbgr.logColoredText(
      'Session data after createAndUpdate:' +
        JSON.stringify(req.session.data, null, 2),
      ['blue', 'bold']
    );
  };

  createSession = (req) => {
    if (!req.session.data) {
      req.session.data = {};
    }
  };

  updateSession = (req, data) => {
    let userData = data || {};
    if (!req.session.data) {
      this.createSession(req);
    }
    req.session.data = { ...req.session.data, ...userData };
    return req.session.data;
  };

  destroySession = (req) => {
    req.session.destroy((err) => {
      if (err) {
        return { errorCode: 500, message: 'Error al cerrar sesión' };
      }
    });
    return { message: 'Sesión cerrada correctamente' };
  };

  getSession = (req) => {
    return req.session.data || {};
  };

  existSession = (req) => {
    if (req.session.data && Object.keys(req.session.data).length > 0) {
      return true;
    } else {
      return false;
    }
  };
}
