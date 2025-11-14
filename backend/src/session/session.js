import { createRoutes } from './sessionRoutes.js';
import bcrypt from 'bcrypt';
import Validator from '#validator/validator.js';
import DBMS from '#dbms/dbms.js';
import Config from '#config/config.js';
import Tokenizer from '#tokenizer/tokenizer.js';
import Mailer from '#mailer/mailer.js';
import Utils from '#utils/utils.js';
import Debugger from '#debugger/debugger.js';

export default class Session {
  constructor() {
    if (!Session.instance) {
      this.dbms = new DBMS();
      // Pasamos la instancia de DBMS al validador para habilitar validaciones que consultan la BD
      this.validator = new Validator(this.dbms);
      this.tokenizer = new Tokenizer();
      this.mailer = new Mailer();
      this.utils = new Utils();
      this.dbgr = new Debugger();

      this.config = new Config();
      this.SERVER_URL = this.config.SERVER_URL;
      this.ERROR_CODES = this.config.ERROR_CODES;

      Session.instance = this;
    }
    return Session.instance;
  }

  async init(app) {
    createRoutes(app);
    if (!this.config.getProfiles) await this.config.mapProfiles();
    this.PROFILES = await this.config.getProfiles();
  }

  login = async ({ userData }) => {
    try {
      if (!userData || !userData.username || !userData.password) {
        return {
          errorCode: this.ERROR_CODES.BAD_REQUEST,
          message: 'Los datos de usuario son incompletos.',
        };
      }

      const result = await this.dbms.query(
        'SELECT * FROM public."user" WHERE username = $1',
        [userData.username]
      );

      if (!result?.rows?.length) {
        return {
          errorCode: this.ERROR_CODES.NOT_FOUND,
          message: 'Usuario no encontrado',
        };
      }
      if (result.rows.length > 1) {
        return {
          errorCode: this.ERROR_CODES.BAD_REQUEST,
          message:
            'Se han encontrado múltiples usuarios con ese nombre de usuario. Por favor contacte al soporte.',
        };
      }

      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(
        userData.password,
        user.password
      );

      if (!passwordMatch) {
        return {
          errorCode: this.ERROR_CODES.UNAUTHORIZED,
          message: 'Contraseña incorrecta',
        };
      }

      const mergedUserData = { ...user, activeProfile: userData.activeProfile };
      delete mergedUserData.password;
      const profileResult = await this.changeActiveProfile({
        userData: mergedUserData,
      });
      return profileResult;
    } catch (error) {
      console.error('Error en login:', error);
      return {
        errorCode: this.ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'Error del servidor',
      };
    }
  };

  changeActiveProfile = async ({ userData }) => {
    try {
      this.dbgr.logColoredText(
        'Changing active profile with userData:' +
          JSON.stringify(userData, null, 2),
        ['green', 'bold']
      );
      const { username, activeProfile } = userData;
      if (!username) {
        return {
          errorCode: this.ERROR_CODES.BAD_REQUEST,
          message: 'Parámetros incompletos',
        };
      }

      const userProfilesResult = await this.dbms.query(
        `SELECT "profile".* FROM public."user_profile" up
          INNER JOIN public."profile" ON up.id_profile = "profile".id
          INNER JOIN public."user" u ON up.id_user = u.id
          WHERE u.username = $1`,
        [username]
      );

      const userProfiles = userProfilesResult.rows.map((up) => up.name);

      this.dbgr.logColoredText(
        'User profiles available:' + JSON.stringify(userProfiles, null, 2),
        ['green', 'bold']
      );
      // Si el perfil solicitado está entre los perfiles asignados
      if (activeProfile && userProfiles.includes(activeProfile)) {
        const { id, email } = userData;
        return {
          message: `Bienvenido ${activeProfile}, ${username}`,
          userData: { id, username, email, activeProfile },
        };
      }

      // Si hay más de uno y no coincide el solicitado, devolvemos la lista para que el cliente elija
      if (userProfiles.length > 1) {
        this.dbgr.logColoredText(
          'User profiles available:' + JSON.stringify(userProfiles, null, 2),
          ['green', 'bold']
        );
        return {
          message: 'Seleccione el perfil con el que desea iniciar sesión',
          profiles: userProfiles,
        };
      }

      // Solo un perfil disponible
      if (userProfiles.length === 1) {
        const { id, email } = userData;
        return {
          message: `Bienvenido ${userProfiles[0]}, ${username}`,
          userData: { id, username, email, activeProfile: userProfiles[0] },
        };
      }

      // Ningún perfil
      return {
        errorCode: this.ERROR_CODES.FORBIDDEN,
        message:
          'El usuario no tiene perfiles asignados. Por favor contacte al soporte.',
      };
    } catch (error) {
      console.error('Error en changeActiveProfile:', error);
      return {
        errorCode: this.ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'Error al cambiar el perfil activo',
      };
    }
  };

  register = async ({ userData, isParticipant }) => {
    const { username, email, password, confirmPassword } = userData;
    if (!username || !email || !password || !confirmPassword) {
      return {
        errorCode: this.ERROR_CODES.BAD_REQUEST,
        message: 'Por favor llene todos los campos',
        userData,
      };
    }

    const usernameError = this.validator.validateUsername(username);
    const emailError = this.validator.validateEmail(email);
    const passwordError = this.validator.validatePassword(password);
    const confirmPasswordError = this.validator.validateConfirmPassword(
      password,
      confirmPassword
    );

    const validations = {
      usernameError,
      emailError,
      passwordError,
      confirmPasswordError,
    };

    for (const [key, value] of Object.entries(validations)) {
      if (value) {
        return {
          errorCode: this.ERROR_CODES.BAD_REQUEST,
          message: value,
        };
      }
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Copia el resto de los datos del body y reemplaza la contraseña
    userData = {
      status: 'active',
      register_date: new Date().toISOString(),
      ...userData,
      password: hashedPassword,
    };

    if (isParticipant || !userData.activeProfile) {
      userData.activeProfile =
        this.PROFILES?.PARTICIPANT?.name || userData.activeProfile;
    }

    // Usar executeJsonTransaction para que todas las operaciones de registro
    // (insertUser, getUsersWhere, setUserProfile) se ejecuten en una sola transacción
    if (!this.dbms.queries) {
      await this.dbms.init();
    }

    try {
      const jsonParams = {
        insertUser: [
          userData.username,
          userData.password,
          userData.email,
          userData.status,
          userData.register_date,
        ],
        getUsersWhere: [userData.username],
        setUserProfile: [userData.username, userData.activeProfile],
      };

      const results = await this.dbms.executeJsonTransaction(
        jsonParams,
        'Error ejecutando la transacción de registro'
      );

      // results es un array con los resultados en el mismo orden: [insertUserRes, getUsersWhereRes, setUserProfileRes]
      const fetchRes = results && results[1];
      const postedUser = fetchRes?.rows?.[0];
      if (!postedUser) {
        return {
          errorCode: this.ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: 'Error al registrar usuario',
        };
      }

      return {
        message: `${this.utils.toUpperCaseFirstLetter(
          userData.activeProfile
        )}, ${userData.username} registrado exitosamente`,
      };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      // Si utils.handleError fue usado internamente, error.message es JSON stringificado
      try {
        const parsed = JSON.parse(error.message);
        return {
          errorCode: parsed.errorCode || this.ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: parsed.message || 'Error al registrar usuario',
        };
      } catch (_e) {
        return {
          errorCode: this.ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: 'Error al registrar usuario',
        };
      }
    }
  };

  forgotPassword = async ({ userData, origin }) => {
    const { email } = userData;
    if (!email) {
      return {
        errorCode: this.ERROR_CODES.BAD_REQUEST,
        message: 'Por favor ingrese su email',
      };
    }
    const emailError = this.validator.validateEmail(email);
    if (emailError) {
      return { errorCode: this.ERROR_CODES.BAD_REQUEST, message: emailError };
    }

    // Busca el usuario con ese email
    const data = await this.dbms
      .query('SELECT * FROM public."user" WHERE email = $1;', [email])
      .then((result) => result.rows);

    if (data.length > 1) {
      return {
        errorCode: this.ERROR_CODES.BAD_REQUEST,
        message:
          'Se han encontrado múltiples usuarios con ese email. Por favor contacte al soporte.',
      };
    }

    if (data?.length === 1) {
      // Si se encuentra el usuario, enviar un email con el token de recuperación
      const user = data[0];
      const token = this.tokenizer.generateToken({
        user,
        email: user.email,
        userId: user.id,
      });
      this.mailer.sendRecoveryEmail({ email: user.email, token, origin });
      return {
        message: 'Se ha enviado un email de recuperación',
      };
    } else {
      return {
        errorCode: this.ERROR_CODES.NOT_FOUND,
        message: 'Usuario no encontrado',
      };
    }
  };

  resetPassword = async ({ userData }) => {
    const { token, password, confirmPassword } = userData || {};
    // Validación inicial de token
    if (!token) {
      return {
        errorCode: this.ERROR_CODES.BAD_REQUEST,
        message: 'Token no proporcionado',
      };
    }

    const decoded = this.tokenizer.verifyToken(token);
    if (!decoded) {
      return {
        errorCode: this.ERROR_CODES.BAD_REQUEST,
        message: 'Token inválido o expirado. Por favor intente nuevamente',
      };
    }

    const { userId } = decoded || {};
    const dataUser = decoded?.user;

    if (!userId) {
      return {
        errorCode: this.ERROR_CODES.BAD_REQUEST,
        message: 'Token inválido (sin usuario asociado)',
      };
    }

    // Validación de campos
    if (!password || !confirmPassword) {
      return {
        errorCode: this.ERROR_CODES.BAD_REQUEST,
        message: 'Por favor llene todos los campos',
      };
    }

    const passwordError = this.validator.validatePassword(password);
    const confirmPasswordError = this.validator.validateConfirmPassword(
      password,
      confirmPassword
    );

    const validations = { passwordError, confirmPasswordError };
    for (const value of Object.values(validations)) {
      if (value) {
        return {
          errorCode: this.ERROR_CODES.BAD_REQUEST,
          message: value,
        };
      }
    }

    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      await this.dbms.query(
        'UPDATE public."user" SET password = $1 WHERE id = $2;',
        [hashedPassword, userId]
      );

      return {
        message: `Contraseña actualizada correctamente para el usuario ${
          dataUser?.username || ''
        }. Por favor inicie sesión con su nueva contraseña.`,
        redirect: '/login',
      };
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error);
      return {
        errorCode: this.ERROR_CODES.INTERNAL_SERVER_ERROR,
        message:
          'Error al actualizar la contraseña. Intente nuevamente más tarde.',
      };
    }
  };
}
