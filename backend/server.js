import 'module-alias/register.js';
import Config from '#config/config.js';
import app from '#src/middleware.js';
import DBMS from '#dbms/dbms.js';
import Session from '#src/session/session.js';
import Security from '#src/security/security.js';
import Validator from '#validator/validator.js';
import Repository from '#repository/repository.js';

const { PORT, SERVER_URL } = new Config().getConfig();

const dbms = new DBMS(null);
const validator = new Validator(dbms);
dbms.validator = validator;
const session = new Session();
const security = new Security();
const repository = new Repository();

(async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${SERVER_URL}`);
    });

    // Endpoint ligero: obtener opciones permitidas para un perfil
    app.get('/profiles/:profile/options', async (req, res) => {
      try {
        const { profile } = req.params;
        const options = await repository.getOptionsAllowed({ profile });
        res.json({ profile, options });
      } catch (err) {
        res.status(err?.errorCode || 500).json({
          message: err?.message || 'Error obteniendo opciones del perfil',
        });
      }
    });

    // Listar usuarios (sin exponer contraseñas)
    app.get('/users', async (req, res) => {
      try {
        const result = await dbms.executeNamedQuery({ nameQuery: 'getUsers' });
        const users = result?.rows || [];
        res.json(users);
      } catch (err) {
        res.status(err?.errorCode || 500).json({
          message: err?.message || 'Error obteniendo usuarios',
        });
      }
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
})()
  .then(async () => {
    await session.init(app);
    await dbms.init();
    // console.log('dbms: ', dbms.getThis());
    // console.log('dbms methods:', dbms.getAllDinamicMethodNames());
    // console.log('session methods:', session.getAllDinamicMethodNames());
  })
  .catch((err) => {
    console.log('Error server listening ', err);
    dbms.poolDisconnection();
  });

process.on('uncaughtException', (err) => {
  console.log(err);
  dbms.poolDisconnection();
});
