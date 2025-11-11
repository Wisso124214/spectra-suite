import { parseMOP } from '#atx/parse-mop.js';

const run = async () => {
  const profileName = 'administrador de base de datos';
  await parseMOP(profileName);
};
run();
