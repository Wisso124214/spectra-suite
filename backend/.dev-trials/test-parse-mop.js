import { parseMOP } from '#atx/parse-mop.js';

const run = async () => {
  const profileName = 'administrador de seguridad';
  await parseMOP(profileName);
};
run();
