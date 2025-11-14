import getMethod from '#atx/get-method.js';

export default async function executeMethod({ className, method, params }) {
  let i = await getMethod({ className, method });
  const r = await i[method](params);
  i = null;
  return r;
}
