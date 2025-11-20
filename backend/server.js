import 'module-alias/register.js';
import app from './src/middleware.js';
import Dispatcher from './src/dispatcher/dispatcher.js';

const dispatcher = new Dispatcher(app);

(async () => {
  try {
    await dispatcher.init();
    const PORT = dispatcher.config.PORT || 3000;
    const SERVER_URL =
      dispatcher.config.SERVER_URL || `http://localhost:${PORT}`;

    app.listen(PORT, () => {
      console.log(`Server running on ${SERVER_URL}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    dispatcher.dbms.poolDisconnection();
  }
})();

process.on('uncaughtException', (err) => {
  console.error(err);
  dispatcher.dbms.poolDisconnection();
});
