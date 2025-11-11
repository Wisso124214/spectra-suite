import Repository from '#repository/repository.js';

const run = async () => {
  const repo = new Repository();
  await repo.init();
  try {
    const res = await repo.query({
      query:
        'SELECT id, name, description, tx FROM public."option" ORDER BY id ASC;',
      params: [],
    });
    console.log('Options:', res?.rows || []);
  } catch (e) {
    console.error('Error listing options', e?.message || e);
  } finally {
    await repo.poolDisconnection();
  }
};
run();
