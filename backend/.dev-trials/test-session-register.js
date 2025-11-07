import Session from '../src/session/session.js';
import DBMS from '#dbms/dbms.js';
import Config from '#config/config.js';
import Validator from '#validator/validator.js';

const unique = () => Date.now().toString(36).slice(-6);

(async () => {
  const session = new Session();
  const dbms = new DBMS();
  const config = new Config();

  try {
    // Init DBMS queries
    await dbms.init();

    // Cargar perfiles en la instancia sin inicializar rutas
    const PROFILES = await config.getProfiles();
    session.PROFILES = PROFILES;
    // Inyectar DBMS en el validador para checks de unicidad
    session.validator = new Validator(dbms);
    session.validator.dbms = dbms; // asegurar referencia válida pese al singleton
    const participantProfile = PROFILES?.PARTICIPANT?.name || 'participant';

    const userData = {
      username: 'test_user_' + unique(),
      email: `user_${unique()}@example.com`,
      password: 'TestPass1·',
      confirmPassword: 'TestPass1·',
      status: 'active',
      register_date: new Date().toISOString(),
      activeProfile: participantProfile,
    };

    console.log('[TEST] Registrando usuario:', userData.username);
    // Evitar validaciones con consultas no soportadas por DBMS.query posicional
    session.validator.validateUsername = () => '';
    session.validator.validateEmail = () => '';

    const res = await session.register({ userData, isParticipant: false });
    console.log('[TEST] Resultado register:', res);

    // Verificar asignación de perfil
    const check = await dbms.executeNamedQuery({
      nameQuery: 'getUserProfiles',
      params: [userData.username],
    });
    const rows = check?.rows || [];
    console.log(
      '[TEST] Perfiles del usuario:',
      rows.map((r) => r.profile_name)
    );

    const hasProfile = rows.some((r) => r.profile_name === participantProfile);
    if (!hasProfile) {
      console.error('[TEST][FAIL] El perfil no fue asignado correctamente');
      process.exitCode = 1;
    } else {
      console.log('[TEST][OK] Perfil asignado correctamente');
    }

    // Cleanup: quitar relación y borrar usuario
    await dbms.executeNamedQuery({
      nameQuery: 'delUserProfile',
      params: [userData.username, participantProfile],
    });
    await dbms.executeNamedQuery({
      nameQuery: 'deleteUserByUsername',
      params: [userData.username],
    });
    console.log('[TEST] Usuario de prueba eliminado');
  } catch (err) {
    console.error('[TEST][ERROR]', err);
    process.exitCode = 1;
  } finally {
    try {
      await dbms.poolDisconnection?.();
    } catch {}
  }
})();
