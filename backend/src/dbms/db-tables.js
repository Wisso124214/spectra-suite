// The tables with underscores are join tables
// Every id are type integer, else fields are type string except register_date in user table which is date

const tables = {
  class: {
    name: 'The name of the class',
    description: 'A brief description of the class',
  },
  class_method: {
    id_class: 'The ID of the class',
    id_method: 'The ID of the method',
  },
  menu: {
    id_subsystem: 'The ID of the subsystem related to the menu',
    name: 'The name of the menu',
    description: 'A brief description of the menu',
    id_parent:
      'The ID of the parent menu (if any). This is required to insert menus within other menus. Only the child menus must have this field (the "id_parent" must be the ID of the parent menu).',
  },
  method: {
    name: 'The name of the method',
    description: 'A brief description of the method',
  },
  method_profile: {
    id_method: 'The ID of the method',
    id_profile: 'The ID of the profile',
  },
  option: {
    name: 'The name of the option',
    description: 'A brief description of the option',
    tx: 'The transaction associated with the option. Integer', //Is not a foreign key
  },
  option_menu: {
    id_option: 'The ID of the option',
    id_menu: 'The ID of the menu',
  },
  option_profile: {
    id_option: 'The ID of the option',
    id_profile: 'The ID of the profile',
  },
  profile: {
    name: 'The name of the profile',
    description: 'A brief description of the profile',
  },
  subsystem: {
    name: 'The name of the subsystem',
    description: 'A brief description of the subsystem',
  },
  subsystem_class: {
    id_subsystem: 'The ID of the subsystem',
    id_class: 'The ID of the class',
  },
  transaction: {
    tx: 'The id of the transaction. It is a serial auto-incremented field. Do not set it manually',
    description: 'A brief description of the transaction',
    id_subsystem: 'The ID of the subsystem related to the transaction',
    id_class: 'The ID of the class related to the transaction',
    id_method: 'The ID of the method related to the transaction',
  },
  user: {
    username: 'The unique username of the user',
    email: 'The unique email of the user',
    password: 'The hashed password of the user',
    register_date: 'The date when the user registered',
    status: 'The status of the user (active, inactive, etc.)',
  },
  user_profile: {
    id_user: 'The ID of the user',
    id_profile: 'The ID of the profile',
  },
};
