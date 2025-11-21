import 'module-alias/register.js';
import app from './src/middleware.js';
import Config from './config/config.js';
import DBMS from './src/dbms/dbms.js';
import Session from './src/session/session.js';
import Security from './src/security/security.js';
import Validator from './src/validator/validator.js';
import Dispatcher from './src/dispatcher/dispatcher.js';
import Business from './src/_business/business.js';

const { PORT, SERVER_URL } = new Config();

const dbms = new DBMS(null);
const validator = new Validator(dbms);
dbms.validator = validator;
const session = new Session();
const security = new Security();
const dispatcher = new Dispatcher(app);
const business = new Business();

(async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on ${SERVER_URL}`);
    });

    business.init();
    await session.init(app);
    await dbms.init();
    await dispatcher.init();
  } catch (err) {
    console.error('Error starting server:', err);
    dispatcher.dbms.poolDisconnection();
  }
})();

process.on('uncaughtException', (err) => {
  console.error(err);
  dispatcher.dbms.poolDisconnection();
});
