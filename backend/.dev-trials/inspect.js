import Repository from '#repository/repository.js';

const run = async () => {
  const repo = new Repository();
  await repo.init();
  try {
    const menus = await repo.query({
      query: `SELECT m.id, m.name, m.id_parent, s.name AS subsystem FROM public."menu" m LEFT JOIN public."subsystem" s ON m.id_subsystem = s.id ORDER BY m.id;`,
      params: [],
    });
    console.log('MENUS:', menus?.rows);
    const joins = await repo.query({
      query: `SELECT om.id_menu, mm.name AS menu_name, o.id as option_id, o.name AS option_name FROM public.option_menu om JOIN public."menu" mm ON om.id_menu = mm.id JOIN public."option" o ON om.id_option = o.id ORDER BY mm.id, o.id;`,
      params: [],
    });
    console.log('OPTION_MENU:', joins?.rows);
  } catch (e) {
    console.error('error', e?.message || e);
  } finally {
    await repo.poolDisconnection();
  }
};
run();
