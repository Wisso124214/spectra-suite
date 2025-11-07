export default class Utils {
  constructor() {}

  toUpperCaseFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  getAllDinamicMethodNames = (thisArg) =>
    Object.keys(thisArg).filter(
      (method) => typeof thisArg[method] === 'function'
    );

  handleError({ message, errorCode, error = {} }) {
    const errPayload = {
      message,
      errorCode,
      error:
        error && typeof error === 'object'
          ? {
              message: error.message || undefined,
              code: error.code || error.errno || undefined,
              detail: error.detail || undefined,
            }
          : error,
    };
    throw new Error(JSON.stringify(errPayload));
  }
}
