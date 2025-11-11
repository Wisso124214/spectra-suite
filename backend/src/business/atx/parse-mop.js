import DBMS from '#dbms/dbms.js';
import Utils from '#utils/utils.js';
import Config from '#config/config.js';
import Debugger from '#debugger/debugger.js';

export const parseMOP = async (profile) => {
  const dbms = new DBMS();
  try {
    await dbms.init();
    const result = await dbms.executeNamedQuery({
      nameQuery: 'getMenusOptionsProfile',
      params: {
        profile_name: profile,
      },
    });

    let menus = {};

    console.log('MOP Result:', result.rows);
  } catch (error) {
    const utils = new Utils();
    const config = new Config().getConfig();
    const ERROR_CODES = config.ERROR_CODES;

    utils.handleError({
      message: 'Error parsing MOP',
      errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
      error,
    });
  } finally {
    await dbms.poolDisconnection();
  }
};
