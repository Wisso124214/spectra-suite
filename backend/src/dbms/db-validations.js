export async function checkEmailInUse(email, dbmsInstance) {
  let emailInUse = false;
  if (dbmsInstance && typeof dbmsInstance.query === 'function') {
    await dbmsInstance
      .query('SELECT COUNT(*) FROM public."user" WHERE email = $1;', [email])
      .then((result) => {
        if (Number(result?.rows?.[0]?.count || 0) > 0) emailInUse = true;
      })
      .catch((err) => console.error('Error checking email existence:', err));
  }

  if (emailInUse) return 'El email ya está en uso.';
  return '';
}

export async function checkUsernameInUse(username, dbmsInstance) {
  if (dbmsInstance && typeof dbmsInstance.query === 'function') {
    try {
      const result = await dbmsInstance.query(
        'SELECT COUNT(*) FROM public."user" WHERE username = $1;',
        [username]
      );
      const userExists = Number(result?.rows?.[0]?.count || 0) > 0;
      if (userExists) {
        return 'El nombre de usuario ya está en uso.';
      }
    } catch (err) {
      console.error('Error checking username existence:', err);
      return 'Error al validar el nombre de usuario.';
    }
  }
}
