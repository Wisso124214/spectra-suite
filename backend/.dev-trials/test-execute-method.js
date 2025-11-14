import executeMethod from '#atx/execute-method.js';

const testExecuteMethod = async () => {
  const paths = [
    { className: 'atx', method: 'parseMOP' },
    { className: 'helpers', method: '_q' },
  ];
  for (const p of paths) {
    const path = await executeMethod({
      className: p.className,
      method: p.method,
      params: p.params || {},
    });
    console.log(`Path for ${p.className}.${p.method}: ${path}`);
  }
};
testExecuteMethod();
