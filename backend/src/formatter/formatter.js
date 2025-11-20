import Validator from "../validator/validator.js";
import Utils from "../utils/utils.js";
import Config from "../../config/config.js";

export default class Formatter {
  constructor() {
    this.validator = new Validator();
    this.utils = new Utils();
    this.ERROR_CODES = new Config().getErrorCodes();
  }

  formatObjectParams(obj, orderedArray = ['key', 'value'], schema = null) {
    // Modo 1: objeto simple + orderArray (+ schema opcional) -> devuelve arreglo plano ordenado
    const isObjectOfArrays =
      obj &&
      typeof obj === 'object' &&
      !Array.isArray(obj) &&
      Object.values(obj).every((v) => Array.isArray(v));

    // Si NO es objeto de arrays, tratamos como objeto plano a ordenar
    if (!isObjectOfArrays) {
      if (
        !orderedArray ||
        !Array.isArray(orderedArray) ||
        orderedArray.length === 0
      ) {
        return [];
      }

      // Validación por esquema si viene definido
      if (schema) {
        const validationErrors = this.validator.validateStructuredData(
          obj,
          schema
        );
        if (validationErrors && validationErrors.length > 0) {
          this.utils.handleError({
            message: 'Parámetros inválidos: ' + validationErrors.join('. '),
            errorCode: this.ERROR_CODES.BAD_REQUEST,
          });
        }
      }

      // Verificación de presencia de claves requeridas
      const ensurePath = (root, path) => {
        const keys = path.split('.');
        let current = root;
        for (const k of keys) {
          if (current == null || !(k in current)) {
            this.utils.handleError({
              message: `Parámetro requerido '${path}' ausente`,
              errorCode: this.ERROR_CODES.BAD_REQUEST,
            });
          }
          current = current[k];
        }
      };
      orderedArray.forEach((p) => ensurePath(obj, p));

      // Construcción del arreglo ordenado
      return this.structureToOrderedArray(obj, orderedArray);
    }

    // Modo 2 (retrocompatibilidad): objeto de arrays -> devuelve array de arreglos
    const validationErrors = this.validator.validateStructuredData(obj, {
      root: 'object_of_arrays',
    });
    if (validationErrors && validationErrors.length > 0) {
      this.utils.handleError({
        message:
          'Invalid array structure for mapping' + validationErrors.join('. '),
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    }

    let result = [];
    let keys = Object.keys(obj);
    if (!orderedArray || !keys || keys.length === 0) {
      return result;
    }

    keys.forEach((key) => {
      const values = obj[key];
      for (const value of values) {
        result.push(this.structureToOrderedArray({ key, value }, orderedArray));
      }
    });
    return result;
  }

  formatArrayParams(array, orderedArray) {
    const validationErrors = this.validator.validateStructuredData(array, {
      root: 'array_of_objects',
    });
    if (validationErrors && validationErrors.length > 0) {
      this.utils.handleError({
        message:
          'Invalid array structure for mapping' + validationErrors.join('. '),
        errorCode: this.ERROR_CODES.BAD_REQUEST,
      });
    }

    let result = [];
    if (!array || array.length === 0) {
      return result;
    }

    array.forEach((obj) => {
      const keys = Object.keys(obj);
      if (orderedArray)
        result.push(this.structureToOrderedArray(obj, orderedArray));
      else result.push(keys.map((key) => obj[key]));
    });
    return result;
  }

  structureToOrderedArray(structure, orderedArray) {
    const result = [];
    orderedArray.forEach((item) => {
      const keys = item.split('.');
      let current = structure;
      keys.forEach((key) => {
        if (current[key]) {
          current = current[key];
        }
      });
      result.push(current);
    });
    return result;
  }
}
