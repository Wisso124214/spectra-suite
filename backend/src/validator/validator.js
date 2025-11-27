import { checkEmailInUse, checkUsernameInUse } from '../dbms/db-validations.js';
import Config from '../../config/config.js';
import z from 'zod';

export default class Validator {
  constructor(dbmsInstance = null) {
    // Permite inyectar/actualizar DBMS en el singleton si aún no existe o si está vacío
    if (Validator.instance && dbmsInstance && !Validator.instance.dbms) {
      Validator.instance.dbms = dbmsInstance;
      return Validator.instance;
    }

    this.dbms = dbmsInstance;
    this.config = new Config();
    const customTypes = this.config.getCustomTypes();

    if (!Validator.instance) {
      this.types = {
        array: z.array(z.any()),
        int: z.number().int(),
        float: z
          .number()
          .refine((v) => !Number.isInteger(v), { message: 'Debe ser float' }),
        string: z.string(),
        boolean: z.boolean(),
        date: z.date(),
        object: z.object({}).passthrough(),
        strings_array: z.array(z.string()),
        object_of_strings: z.record(z.string()),
        object_of_strings_array: z.record(z.array(z.string())),
        array_of_objects: z.array(z.object({}).passthrough()),
        object_of_arrays: z.record(z.array(z.any())),
        ...customTypes,
      };

      this.validationValues = this.config.getValidationValues();

      Validator.instance = this;
    }
    return Validator.instance;
  }

  async validateUsername(value) {
    const { min, max } = this.validationValues.user.username;

    // Validación con Zod
    const usernameSchema = z
      .string()
      .min(min, `El nombre de usuario debe tener al menos ${min} caracteres.`)
      .max(
        max,
        `El nombre de usuario no puede tener más de ${max} caracteres.`
      );

    try {
      usernameSchema.parse(value);
    } catch (err) {
      return err.errors[0].message; // Retorna primer error de Zod
    }

    const usernameInUse = await checkUsernameInUse(value, this.dbms);
    return usernameInUse || '';
  }

  async validateUsernameLogin(value) {
    const { min, max } = this.validationValues.user.username;

    // Validación con Zod
    const usernameSchema = z
      .string()
      .min(min, `El nombre de usuario debe tener al menos ${min} caracteres.`)
      .max(max, `El nombre de usuario no puede tener más de ${max} caracteres.`)
      .regex(/^[A-Za-z0-9.,$*]+$/, 'Solo letras, números y . , $ *');

    try {
      usernameSchema.parse(value);
    } catch (err) {
      return err.errors[0].message; // Retorna primer error de Zod
    }
    return '';
  }

  async validateEmail(email) {
    const { max } = this.validationValues.user.email;

    const emailSchema = z
      .string()
      .max(max, `El email no puede tener más de ${max} caracteres`)
      .refine(
        (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        'El email no es válido'
      );

    try {
      emailSchema.parse(email);
    } catch (err) {
      return err.errors[0].message;
    }

    const emailInUse = await checkEmailInUse(email, this.dbms);
    return emailInUse || '';
  }

  validatePassword(text) {
    const { min, max } = this.validationValues.user.password;

    const passwordSchema = z
      .string()
      .min(min, `La contraseña debe tener al menos ${min} caracteres`)
      .max(max, `La contraseña no puede tener más de ${max} caracteres`)
      .refine(
        (val) => /[A-Z]/.test(val),
        'La contraseña debe contener al menos una letra mayúscula'
      )
      .refine(
        (val) => /[a-z]/.test(val),
        'La contraseña debe contener al menos una letra minúscula'
      )
      .refine(
        (val) => /[0-9]/.test(val),
        'La contraseña debe contener al menos un número'
      )
      .refine(
        (val) =>
          /[-:+_º·$/[\]}{|~€|@#~€¬`«»%()?¿¡;.'"!@#\$//%\^,&\*]/.test(val),
        'La contraseña debe contener al menos un símbolo'
      );

    try {
      passwordSchema.parse(text);
      return '';
    } catch (err) {
      return err.errors[0].message;
    }
  }

  validateConfirmPassword(pass, confirmPass) {
    const confirmSchema = z
      .string()
      .refine((val) => val === pass, 'Las contraseñas no coinciden');

    try {
      confirmSchema.parse(confirmPass);
      return '';
    } catch (err) {
      return err.errors[0].message;
    }
  }

  getValidationValues(entity, field) {
    return this.validationValues[entity][field];
  }

  validateName(value, entity) {
    const { min, max } = this.getValidationValues(entity, 'name');

    const nameSchema = z
      .string()
      .min(min, `El nombre de ${entity} debe tener al menos ${min} caracteres.`)
      .max(
        max,
        `El nombre de ${entity} no puede tener más de ${max} caracteres.`
      );

    try {
      nameSchema.parse(value);
      return '';
    } catch (err) {
      return err.errors[0].message;
    }
  }

  validateDescription(value, entity) {
    const { max } = this.getValidationValues(entity, 'description');

    const descSchema = z
      .string()
      .max(
        max,
        `La descripción de ${entity} no puede tener más de ${max} caracteres.`
      )
      .optional(); // en caso de que el valor sea undefined o vacío

    try {
      descSchema.parse(value || ''); // si es undefined, parsea ''
      return '';
    } catch (err) {
      return err.errors[0].message;
    }
  }

  validateStructuredData(data, structure) {
    const errors = [];

    const buildSchema = (struct) => {
      if (typeof struct === 'string') {
        switch (struct) {
          case 'string':
            return z.string();
          case 'number':
          case 'int':
            return z.number();
          case 'boolean':
            return z.boolean();
          case 'array':
            return z.array(z.any());
          case 'object':
            return z.object({});
          case 'date':
            return z.date();
          default:
            return z.custom((val) => this.validateField(val, struct) === true);
        }
      } else if (struct.root) {
        return buildSchema(struct.root);
      } else if (typeof struct === 'object') {
        const shape = {};
        for (const key in struct) {
          shape[key] = buildSchema(struct[key]);
        }
        return z.object(shape);
      }

      return z.any();
    };

    const schema = buildSchema(structure);

    try {
      schema.parse(data);
    } catch (err) {
      if (err.errors) {
        err.errors.forEach((e) => errors.push(e.message));
      } else {
        errors.push('Error desconocido en estructura de datos');
      }
    }

    return errors;
  }

  validateField(value, type) {
    const schema = this.types[type];
    if (!schema) return false;

    try {
      schema.parse(value);
      return true;
    } catch (err) {
      return false;
    }
  }
}
