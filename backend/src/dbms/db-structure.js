import Config from '#config/config.js';
const PROFILES = await new Config().getProfiles();

const { SUPER_ADMIN, SECURITY_ADMIN, EVENT_ADMIN, PARTICIPANT, DB_ADMIN } =
  Object.keys(PROFILES).reduce((acc, key) => {
    acc[key] = PROFILES[key].name;
    return acc;
  }, {});

//db structure

/**
 * subsystems: {
 *   subsystem: {
 *     class: {
 *       method: {
 *        description: 'Descripción del método',
 *        allowedProfiles: [profiles], // Perfiles permitidos para acceder a este método
 *     }
 *   }
 * }
 * }
 */

export const subsystems = {
  security: {
    description: 'Subsistema de seguridad',
    classes: {
      dbms: {
        description: 'Gestión de la base de datos',
        methods: {
          query: {
            description: 'Realiza una consulta en la base de datos',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
          insert: {
            description: 'Inserta datos en la base de datos',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          updateById: {
            description: 'Actualiza datos por ID',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          updateByUsername: {
            description: 'Actualiza datos por nombre de usuario',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          deleteById: {
            description: 'Elimina datos por ID',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          deleteByUsername: {
            description: 'Elimina datos por nombre de usuario',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          get: {
            description: 'Obtiene todos los datos de una tabla',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          getWhere: {
            description: 'Obtiene datos filtrados por condiciones',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          deleteAll: {
            description: 'Elimina todos los datos de una tabla',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          executeNamedQuery: {
            description: 'Ejecuta una consulta nombrada predefinida',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
          executeJsonNamedQuery: {
            description:
              'Ejecuta una serie de consultas nombradas predefinidas, pasándole los parámetros como valores de las keys ({ namedQuery: [params] })',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
          beginTransaction: {
            description: 'Inicia una transacción en la base de datos',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          commitTransaction: {
            description: 'Confirma una transacción en la base de datos',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          rollbackTransaction: {
            description: 'Revierte una transacción en la base de datos',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          endTransaction: {
            description: 'Finaliza una transacción en la base de datos',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          executeJsonTransaction: {
            description:
              'Ejecuta una serie de consultas dentro de una transacción, pasándole los parámetros como valores de las keys ({ query: [params] })',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
        },
      },
      security: {},
    },
  },

  session: {
    description: 'Subsistema de gestión de sesiones',
    classes: {
      session: {
        description: 'Gestión de sesiones de usuario',
        methods: {
          init: {
            description: 'Inicializa el sistema de sesiones',
            allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
          },
          login: {
            description: 'Inicia sesión para un usuario',
            allowedProfiles: [
              SUPER_ADMIN,
              SECURITY_ADMIN,
              DB_ADMIN,
              EVENT_ADMIN,
              PARTICIPANT,
            ],
          },
          register: {
            description: 'Registra un nuevo usuario',
            allowedProfiles: [
              SUPER_ADMIN,
              SECURITY_ADMIN,
              DB_ADMIN,
              EVENT_ADMIN,
              PARTICIPANT,
            ],
          },
          changeActiveProfile: {
            description: 'Cambia el perfil activo del usuario',
            allowedProfiles: [
              SUPER_ADMIN,
              SECURITY_ADMIN,
              DB_ADMIN,
              EVENT_ADMIN,
              PARTICIPANT,
            ],
          },
          forgotPassword: {
            description: 'Inicia el proceso de recuperación de contraseña',
            allowedProfiles: [
              SUPER_ADMIN,
              SECURITY_ADMIN,
              DB_ADMIN,
              EVENT_ADMIN,
              PARTICIPANT,
            ],
          },
          resetPassword: {
            description: 'Restablece la contraseña del usuario',
            allowedProfiles: [
              SUPER_ADMIN,
              SECURITY_ADMIN,
              DB_ADMIN,
              EVENT_ADMIN,
              PARTICIPANT,
            ],
          },
        },
      },
      sessionManager: {
        description: 'Gestión de sesiones',
        methods: {
          createAndUpdateSession: {
            description: 'Crea y actualiza la sesión del usuario',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          createSession: {
            description: 'Crea una nueva sesión',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          updateSession: {
            description: 'Actualiza los datos de la sesión',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          destroySession: {
            description: 'Destruye la sesión actual',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          getSession: {
            description: 'Obtiene los datos de la sesión',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
          existSession: {
            description: 'Verifica si existe una sesión activa',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN],
          },
        },
      },
    },
  },

  services: {
    description: 'Subsistema de servicios',
    classes: {
      mailer: {
        description: 'Servicio de envío de correos electrónicos',
        methods: {
          sendEmail: {
            description: 'Envía un correo electrónico',
            allowedProfiles: [
              SUPER_ADMIN,
              DB_ADMIN,
              SECURITY_ADMIN,
              EVENT_ADMIN,
              PARTICIPANT,
            ],
          },
          sendRecoveryEmail: {
            description: 'Envía un correo electrónico de recuperación',
            allowedProfiles: [
              SUPER_ADMIN,
              SECURITY_ADMIN,
              DB_ADMIN,
              EVENT_ADMIN,
              PARTICIPANT,
            ],
          },
        },
      },
      tokenizer: {
        description: 'Servicio de generación y verificación de tokens',
        methods: {
          generateToken: {
            description: 'Genera un nuevo token',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
          verifyToken: {
            description: 'Verifica un token existente',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
        },
      },
      validator: {
        description: 'Servicio de validación de datos',
        methods: {
          validateUsername: {
            description: 'Valida un nombre de usuario',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
          validateEmail: {
            description: 'Valida un correo electrónico',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
          validatePassword: {
            description: 'Valida una contraseña',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
          validateConfirmPassword: {
            description: 'Valida la confirmación de la contraseña',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
          getValidationValues: {
            description: 'Obtiene los valores de validación',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
          validateName: {
            description: 'Valida un nombre',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
          validateDescription: {
            description: 'Valida una descripción',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
        },
      },
      formatter: {
        description: 'Servicio de conversión de formatos de datos',
        methods: {
          formatObjectParams: {
            description: 'Convierte parámetros de objeto',
            allowedProfiles: [SUPER_ADMIN],
          },
          formatArrayParams: {
            description: 'Convierte parámetros de array',
            allowedProfiles: [SUPER_ADMIN],
          },
          structureToOrderedArray: {
            description: 'Convierte estructura a array ordenado',
            allowedProfiles: [SUPER_ADMIN],
          },
        },
      },
      utils: {
        description: 'Utilidades generales',
        methods: {
          toUpperCaseFirstLetter: {
            description: 'Convierte la primera letra a mayúscula',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
          getAllDinamicMethodNames: {
            description: 'Obtiene todos los nombres de métodos dinámicos',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
          handleError: {
            description: 'Maneja errores personalizados',
            allowedProfiles: [SUPER_ADMIN, DB_ADMIN, SECURITY_ADMIN],
          },
        },
      },
    },
  },
};

/**
 * menus: {
 *   subsystem: {
 *   description: 'Descripción del subsistema',
 *     menu: {
 *       description: 'Descripción del menú',
 *       submenus: {
 *         description: 'Descripción del submenú',
 *         options: {
 *           description: 'Descripción de la opción',
 *           method: { subsystem, class, method }, // Método asociado a esta opción
 *           params: { nameParam: 'example' } // Parámetros de ejemplo para el método
 *           allowedProfiles: [profiles], // Perfiles permitidos para acceder a esta opción
 *         }
 *     }
 *   }
 * }
 */

export const menus = {
  security: {
    'Gestión de Perfiles': {
      description: 'Gestión de Perfiles de Usuario y sus Permisos',
      submenus: {
        'Mantenimiento de Perfiles': {
          description: 'Crear, Actualizar, Eliminar y Listar Perfiles',
          options: {
            'Crear Perfil': {
              description: 'Crear un nuevo Perfil de Usuario',
              allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN, DB_ADMIN],
              method: {
                subsystem: 'security',
                class: 'dbms',
                method: 'insert',
              },
              params: {
                tableName: 'profile',
                data: {
                  keyValueData: {
                    name: 'username',
                    description: 'description of the profile',
                  },
                },
              },
            },
            'Actualizar Perfil': {
              description: 'Actualizar un Perfil de Usuario existente',
              allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN, DB_ADMIN],
              method: {
                subsystem: 'security',
                class: 'dbms',
                method: 'updateById',
              },
              params: {
                tableName: 'profile',
                data: {
                  userId: 1,
                  keyValueData: {
                    name: 'new_profile',
                    description: 'new description of the profile',
                  },
                },
              },
            },
            'Eliminar Perfil': {
              description: 'Eliminar un Perfil de Usuario existente',
              allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN, DB_ADMIN],
              method: {
                subsystem: 'security',
                class: 'dbms',
                method: 'deleteById',
              },
              params: {
                tableName: 'profile',
                data: {
                  userId: 1,
                },
              },
            },
            'Listar Perfiles': {
              description: 'Listar todos los Perfiles de Usuario',
              allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN, DB_ADMIN],
              method: {
                subsystem: 'security',
                class: 'dbms',
                method: 'get',
              },
              params: {
                tableName: 'profile',
              },
            },
          },
        },
        'Gestión de Opciones a Perfiles': {
          description: 'Asignar y Remover Permisos de Opciones a Perfiles',
          options: {
            'Asignar Permiso de Opción a Perfil': {
              description: 'Asignar un Permiso de Opción a un Perfil',
              allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
              method: {
                subsystem: 'security',
                class: 'dbms',
                method: 'executeNamedQuery',
              },
              params: {
                nameQuery: 'setProfileOption',
                params: {
                  option_name: 'OPTION_NAME',
                  profile_name: 'PROFILE_NAME',
                },
              },
            },
            'Remover Permiso de Opción de Perfil': {
              description: 'Remover un Permiso de Opción de un Perfil',
              allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
              method: {
                subsystem: 'security',
                class: 'dbms',
                method: 'executeNamedQuery',
              },
              params: {
                nameQuery: 'delProfileOption',
                params: {
                  option_name: 'OPTION_NAME',
                  profile_name: 'PROFILE_NAME',
                },
              },
            },
            'Asignar Permiso de Método de Perfil': {
              description: 'Asignar un Permiso de Método a un Perfil',
              allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
              method: {
                subsystem: 'security',
                class: 'dbms',
                method: 'executeNamedQuery',
              },
              params: {
                nameQuery: 'setProfileMethod',
                params: {
                  method_name: 'METHOD_NAME',
                  profile_name: 'PROFILE_NAME',
                },
              },
            },
            'Remover Permiso de Método de Perfil': {
              description: 'Remover un Permiso de Método de un Perfil',
              allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
              method: {
                subsystem: 'security',
                class: 'dbms',
                method: 'executeNamedQuery',
              },
              params: {
                nameQuery: 'delProfileMethod',
                params: {
                  method_name: 'METHOD_NAME',
                  profile_name: 'PROFILE_NAME',
                },
              },
            },
          },
        },
      },
    },
    'Gestión de Usuarios': {
      description: 'Crear, Actualizar, Eliminar y Listar Usuarios',
      options: {
        'Cambiar perfil activo': {
          description: 'Cambiar el perfil activo de un Usuario',
          allowedProfiles: [
            SUPER_ADMIN,
            SECURITY_ADMIN,
            DB_ADMIN,
            EVENT_ADMIN,
            PARTICIPANT,
          ],
          method: {
            subsystem: 'session',
            class: 'session',
            method: 'changeActiveProfile',
          },
          params: {
            userData: {
              username: 'exampleUser',
              activeProfile: 'newActiveProfile',
            },
          },
        },
        'Actualizar mi usuario': {
          description: 'Actualizar mi información de Usuario',
          allowedProfiles: [
            SUPER_ADMIN,
            SECURITY_ADMIN,
            DB_ADMIN,
            EVENT_ADMIN,
            PARTICIPANT,
          ],
          method: {
            subsystem: 'security',
            class: 'dbms',
            method: 'updateById',
          },
          params: {
            tableName: 'user',
            data: {
              userId: 10,
              keyValueData: {
                // ...data,
              },
            },
          },
        },
        'Crear Usuario': {
          description: 'Crear un nuevo Usuario',
          allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN, DB_ADMIN],
          method: {
            subsystem: 'security',
            class: 'dbms',
            method: 'insert',
          },
          params: {
            tableName: 'user',
            data: {
              keyValueData: {
                // ...data,
              },
            },
          },
        },
        'Actualizar Usuario': {
          description: 'Actualizar un Usuario existente',
          allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN, DB_ADMIN],
          method: {
            subsystem: 'security',
            class: 'dbms',
            method: 'updateById',
          },
          params: {
            tableName: 'user',
            data: {
              userId: 1,
              keyValueData: {
                // ...data,
              },
            },
          },
        },
        'Eliminar Usuario': {
          description: 'Eliminar un Usuario existente',
          allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN, DB_ADMIN],
          method: {
            subsystem: 'security',
            class: 'dbms',
            method: 'deleteById',
          },
          params: {
            tableName: 'user',
            data: {
              userId: 1,
            },
          },
        },
        'Listar Usuarios': {
          description: 'Listar todos los Usuarios',
          allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN, DB_ADMIN],
          method: {
            subsystem: 'security',
            class: 'dbms',
            method: 'get',
          },
          params: {
            tableName: 'user',
          },
        },
      },
    },
  },
};

// export const menus = {
//   security: {
//     'Gestión de Perfiles': {
//       description: 'Gestión de Perfiles de Usuario y sus Permisos',
//       submenu: {
//         'Mantenimiento de Perfiles': {
//           description: 'Crear, Actualizar, Eliminar y Listar Perfiles',
//           options: {
//             'Crear Perfil': {
//               description: 'Crear un nuevo Perfil de Usuario',
//               allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//             },
//             'Actualizar Perfil': {
//               description: 'Actualizar un Perfil de Usuario existente',
//               allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//             },
//             'Eliminar Perfil': {
//               description: 'Eliminar un Perfil de Usuario existente',
//               allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//             },
//             'Listar Perfiles': {
//               description: 'Listar todos los Perfiles de Usuario',
//               allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//             },
//           },
//         },
//       },
//       'Gestión de Opciones a Perfiles': {
//         description: 'Asignar y Remover Permisos de Opciones a Perfiles',
//         options: {
//           'Asignar Permiso de Opción a Perfil': {
//             description: 'Asignar un Permiso de Opción a un Perfil',
//             allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//           },
//           'Remover Permiso de Opción de Perfil': {
//             description: 'Remover un Permiso de Opción de un Perfil',
//             allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//           },
//         },
//       },
//       'Gestión de Métodos a Perfiles': {
//         description: 'Asignar y Remover Permisos de Métodos a Perfiles',
//         options: {
//           'Asignar Permiso de Método a Perfil': {
//             description: 'Asignar un Permiso de Método a un Perfil',
//             allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//           },
//           'Remover Permiso de Método de Perfil': {
//             description: 'Remover un Permiso de Método de un Perfil',
//             allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//           },
//         },
//       },
//       'Gestión de Perfiles a Usuarios': {
//         description: 'Asignar y Remover Perfiles a Usuarios',
//         options: {
//           'Asignar Perfil a Usuario': {
//             description: 'Asignar un Perfil a un Usuario',
//             allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//           },
//           'Remover Perfil de Usuario': {
//             description: 'Remover un Perfil de un Usuario',
//             allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//           },
//         },
//       },
//     },
//     'Gestión de Usuarios': {
//       description: 'Crear, Actualizar, Eliminar y Listar Usuarios',
//       options: {
//         'Cambiar perfil activo': {
//           description: 'Cambiar el perfil activo de un Usuario',
//           allowedProfiles: [
//             SUPER_ADMIN,
//             SECURITY_ADMIN,
//             EVENT_ADMIN,
//             PARTICIPANT,
//           ],
//         },
//         'Actualizar mi usuario': {
//           description: 'Actualizar mi información de Usuario',
//           allowedProfiles: [
//             SUPER_ADMIN,
//             SECURITY_ADMIN,
//             EVENT_ADMIN,
//             PARTICIPANT,
//           ],
//         },
//         'Crear Usuario': {
//           description: 'Crear un nuevo Usuario',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Actualizar Usuario': {
//           description: 'Actualizar un Usuario existente',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Eliminar Usuario': {
//           description: 'Eliminar un Usuario existente',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Listar Usuarios': {
//           description: 'Listar todos los Usuarios',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//       },
//     },
//     'Gestión de Subsistemas': {
//       description: 'Crear, Actualizar, Eliminar y Listar Subsistemas',
//       options: {
//         'Cambiar subsistema activo': {
//           description: 'Cambiar el subsistema activo de un Usuario',
//           allowedProfiles: [
//             SUPER_ADMIN,
//             SECURITY_ADMIN,
//             EVENT_ADMIN,
//             PARTICIPANT,
//           ],
//         },
//         'Crear Subsistema': {
//           description: 'Crear un nuevo Subsistema',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Actualizar Subsistema': {
//           description: 'Actualizar un Subsistema existente',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Eliminar Subsistema': {
//           description: 'Eliminar un Subsistema existente',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Listar Subsistemas': {
//           description: 'Listar todos los Subsistemas',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//       },
//     },
//     'Gestión de Clases': {
//       description: 'Crear, Actualizar, Eliminar y Listar Clases',
//       options: {
//         'Crear Clase': {
//           description: 'Crear una nueva Clase',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Actualizar Clase': {
//           description: 'Actualizar una Clase existente',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Eliminar Clase': {
//           description: 'Eliminar una Clase existente',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Listar Clases': {
//           description: 'Listar todas las Clases',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//       },
//     },
//     'Gestión de Métodos': {
//       description: 'Crear, Actualizar, Eliminar y Listar Métodos',
//       options: {
//         'Crear Método': {
//           description: 'Crear un nuevo Método',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Actualizar Método': {
//           description: 'Actualizar un Método existente',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Eliminar Método': {
//           description: 'Eliminar un Método existente',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Listar Métodos': {
//           description: 'Listar todos los Métodos',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//       },
//     },
//     'Gestión de Opciones': {
//       description: 'Crear, Actualizar, Eliminar y Listar Opciones',
//       options: {
//         'Crear Opción': {
//           description: 'Crear una nueva Opción',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Actualizar Opción': {
//           description: 'Actualizar una Opción existente',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Eliminar Opción': {
//           description: 'Eliminar una Opción existente',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//         'Listar Opciones': {
//           description: 'Listar todas las Opciones',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//         },
//       },
//     },
//     'Gestión de Menús': {
//       description: 'Crear, Actualizar, Eliminar y Listar Menús y Submenús',
//       submenu: {
//         'Mantenimiento de Menús': {
//           description: 'Crear, Actualizar, Eliminar y Listar Menús',
//           options: {
//             'Crear Menú': {
//               description: 'Crear un nuevo Menú',
//               allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//             },
//             'Actualizar Menú': {
//               description: 'Actualizar un Menú existente',
//               allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//             },
//             'Eliminar Menú': {
//               description: 'Eliminar un Menú existente',
//               allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//             },
//             'Listar Menús': {
//               description: 'Listar todos los Menús',
//               allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//             },
//           },
//         },
//         'Mantenimiento de Submenús': {
//           description: 'Crear, Actualizar, Eliminar y Listar Submenús',
//           options: {
//             'Crear Submenú': {
//               description: 'Crear un nuevo Submenú',
//               allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//             },
//             'Actualizar Submenú': {
//               description: 'Actualizar un Submenú existente',
//               allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//             },
//             'Eliminar Submenú': {
//               description: 'Eliminar un Submenú existente',
//               allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//             },
//             'Listar Submenús': {
//               description: 'Listar todos los Submenús',
//               allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN],
//             },
//           },
//         },
//       },
//     },
//   },

//   session: {
//     'Gestión de Sesión': {
//       description: 'Gestión de la Sesión del Usuario',
//       options: {
//         'Cambiar Contraseña': {
//           description: 'Cambiar la contraseña del usuario',
//           allowedProfiles: [
//             SUPER_ADMIN,
//             SECURITY_ADMIN,
//             EVENT_ADMIN,
//             PARTICIPANT,
//           ],
//         },
//         'Registrar nuevo Usuario': {
//           description: 'Registrar un nuevo usuario en el sistema',
//           allowedProfiles: [SUPER_ADMIN, SECURITY_ADMIN, EVENT_ADMIN],
//         },
//         'Cerrar Sesión': {
//           description: 'Cerrar la sesión del usuario',
//           allowedProfiles: [
//             SUPER_ADMIN,
//             SECURITY_ADMIN,
//             EVENT_ADMIN,
//             PARTICIPANT,
//           ],
//         },
//       },
//     },
//   },

//   services: {
//     Otros: {
//       description: 'Servicios variados del sistema',
//       options: {
//         'Enviar Email': {
//           description: 'Enviar un correo electrónico',
//           allowedProfiles: [
//             SUPER_ADMIN,
//             SECURITY_ADMIN,
//             EVENT_ADMIN,
//             PARTICIPANT,
//           ],
//         },
//       },
//     },
//   },
// };
