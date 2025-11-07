# Backend Spectra Suite v4

Documentación técnica completa del backend: arquitectura, componentes, métodos públicos, formatos de entrada/salida, ejemplos prácticos y notas de operación.

## Índice

- [Arquitectura y estructura](#arquitectura-y-estructura)
- [Configuración y arranque](#configuración-y-arranque)
- [Modelo de datos (tablas)](#modelo-de-datos-tablas)
- [Errores y códigos](#errores-y-códigos)
- [Capa DBMS (acceso a datos)](#capa-dbms-acceso-a-datos)
- [Repositorio (APIs de dominio)](#repositorio-apis-de-dominio)
  - [Usuarios y Perfiles](#usuarios-y-perfiles)
  - [Perfiles y Opciones](#perfiles-y-opciones)
  - [Menús, Opciones y Perfiles](#menús-opciones-y-perfiles)
  - [Perfiles y Métodos](#perfiles-y-métodos)
  - [Clases y Métodos](#clases-y-métodos)
  - [Subsistemas, Clases y Métodos](#subsistemas-clases-y-métodos)
  - [Transacciones (tx)](#transacciones-tx)
  - [Utilidades de repositorio](#utilidades-de-repositorio)
- [Sesión y autenticación](#sesión-y-autenticación)
- [Validación y formateo](#validación-y-formateo)
- [Utilidades y otros componentes](#utilidades-y-otros-componentes)
- [Pruebas locales y seeding](#pruebas-locales-y-seeding)
- [Ejemplos completos](#ejemplos-completos)
- [Integración continua (CI)](#integración-continua-ci)
- [Esquemas de datos de entrada por método](#esquemas-de-datos-de-entrada-por-método)
- [Esquemas de salida por método](#esquemas-de-salida-por-método)
- [Cheat sheet de métodos](#cheat-sheet-de-métodos)
- [Seguridad: verificación de permisos](#seguridad-verificación-de-permisos)

## Arquitectura y estructura

Monorepo de backend Node.js (ES Modules). Carpetas principales:

```text
config/           # Configuración (perfiles, queries YAML, secretos locales)
src/
  dbms/           # Acceso a BD y helpers transaccionales
  repository/     # Lógica de dominio: métodos de alto nivel
  session/        # Lógica de sesión y rutas HTTP
  security/       # (Placeholder) seguridad/roles
  validator/      # Validaciones y tipos
  formatter/      # Formateo de estructuras (mapas/arrays)
  utils/          # Utilidades base (manejo de errores)
  debugger/       # Utilidad simple de logging estructurado
.dev-trials/      # Script de pruebas (trail-methods.js) y helpers
server.js         # Punto de entrada de la app Express
package.json      # Scripts y alias de imports
```

Imports con alias (package.json -> "imports"):

`#repository/*`, `#dbms/*`, `#session/*`, `#validator/*`, `#formatter/*`, `#utils/*`, etc.

## Configuración y arranque

- Node 18+ recomendado.
- Dependencias clave: `pg`, `express`, `bcrypt`, `jsonwebtoken`.
- Base de datos PostgreSQL (configurada en `config/secret-config.js`).

Scripts útiles:

- Iniciar servidor: `npm start`
- Desarrollo con nodemon: `npm run dev`
- Pruebas de repositorio: `npm run test:repository`
- Pruebas de seguridad (carga + cambio de permisos): `npm run test:security`
- Seeding de estructura base (subsystems + menus): `npm run seed:db-structure`
- Reset completo y seeding (limpia y vuelve a poblar): `node .dev-trials/seed-db-structure.js --reset`
- Flags de entorno soportados por el runner de pruebas:
  - `TEST_REPOSITORY=true` ejecuta el camino mínimo enfocado a seguridad (solo `Security.loadPermissions`).
  - `TEST_TRAIL_METHODS=true` ejecuta la suite completa de `.dev-trials/trail-methods.js` (todas las pruebas de dominio).
  - `SKIP_PURGE=true` omite la purga previa de datos en el modo `TEST_REPOSITORY` (útil cuando ya sembraste la BD y quieres medir solo la carga de permisos).
  - `TEST_TEARDOWN=true` habilita el teardown para limpiar los seeds al final.

### Referencia rápida (scripts y banderas)

| Tipo   | Comando                        | Descripción                                                               |
| ------ | ------------------------------ | ------------------------------------------------------------------------- |
| Script | `npm run seed:db-structure`    | Siembra estructura (SCM + MOP) sin borrar.                                |
| Script | `npm run seed:reset`           | Limpia tablas relacionadas de SCM/MOP/TX y vuelve a sembrar.              |
| Script | `npm run seed:check`           | Verifica method_profile y Security.loadPermissions (sin reset).           |
| Script | `npm run seed:reset-check`     | Reset + siembra + verificación de permisos.                               |
| Script | `npm run check:permissions`    | Chequeo rápido standalone de permisos.                                    |
| Script | `npm run test:repository`      | Camino mínimo (Security.loadPermissions) con purga selectiva por defecto. |
| Script | `npm run test:repo:skip-purge` | Camino mínimo sin purga (usa datos existentes).                           |
| Script | `npm run test:trail`           | Suite completa de pruebas de dominio.                                     |
| Script | `npm run test:security`        | Ejecuta pruebas de Security: carga de permisos + cambio/restauración.     |
| Script | `npm run test:security:load`   | Solo prueba de carga de permisos (`Security.loadPermissions`).            |
| Script | `npm run test:security:change` | Solo prueba de alternar permiso (`Security.changePermission`).            |
| Script | `npm run ci:test:security`     | Reset + seed + ejecución de la suite de seguridad (para CI).              |
| Flag   | `TEST_REPOSITORY=true`         | Activa camino mínimo en `trail-methods.js`.                               |
| Flag   | `TEST_TRAIL_METHODS=true`      | Activa suite completa en `trail-methods.js`.                              |
| Flag   | `SKIP_PURGE=true`              | Omite purga previa en camino mínimo.                                      |
| Flag   | `TEST_TEARDOWN=true`           | Limpieza de seeds al finalizar.                                           |

## Modelo de datos (tablas)

### Pruebas de Security

- Carga de permisos (`Security.loadPermissions`):
  - Comando: `npm run test:security:load`
  - Valida que el mapa de permisos se cargue en memoria y verifica una clave conocida (security/dbms/query para el perfil SECURITY_ADMIN) tanto en memoria como en BD.

- Cambio de permiso (`Security.changePermission`):
  - Comando: `npm run test:security:change`
  - Alterna (revoca/otorga) el permiso anterior, valida el cambio contra BD y restaura el estado original.

- Suite de seguridad (ambas):
  - Comando: `npm run test:security`
  - Ejecuta secuencialmente carga y cambio/restauración de permiso.

Notas:

- Si necesitas datos consistentes antes de probar, usa `npm run seed:reset-check` para resetear y sembrar la estructura base (subsystems/classes/methods, menús/opciones/perfiles) y verificar permisos.

---

## Seguridad: verificación de permisos

El componente `Security` expone `checkPermissionMethod(data)` para consultar si un perfil tiene permiso sobre un método específico.

Entradas soportadas:

- Por nombres:
  - `{ subsystem, className, method, profile }`
  - `profile` acepta alias definidos en `config/profiles.json` (p. ej. `SECURITY_ADMIN`) o el nombre persistido en BD (p. ej. `administrador de seguridad`).
- Por IDs:
  - `{ id_subsystem, id_class, id_method, id_profile }`

Comportamiento:

- Si los permisos en memoria no están cargados, llama internamente a `loadPermissions`.
- Cuando se pasan nombres, resuelve los IDs mediante `resolveMethodPermissionRefs` y compone la clave `${id_subsystem}_${id_class}_${id_method}_${id_profile}` para consultar `this.permissions`.
- Retorna un booleano.

Ejemplos rápidos:

```js
const { default: Security } = await import('#security/security.js');
const security = new Security();

// Por nombres (con alias de perfil)
await security.checkPermissionMethod({
  subsystem: 'security',
  className: 'dbms',
  method: 'query',
  profile: 'SECURITY_ADMIN', // alias -> se normaliza a "administrador de seguridad"
});

// Por nombres (con nombre persistido)
await security.checkPermissionMethod({
  subsystem: 'security',
  className: 'dbms',
  method: 'query',
  profile: 'administrador de seguridad',
});

// Por IDs
await security.checkPermissionMethod({
  id_subsystem: 60,
  id_class: 106,
  id_method: 394,
  id_profile: 1,
});
```

Resumen de tablas (todas las columnas `id` son enteros; strings salvo `register_date` en `user`):

- `user(username, email, password, register_date, status)`
- `profile(name, description)`
- `subsystem(name, description)`
- `class(name, description)`
- `method(name, description)`
- `transaction(tx, description, id_subsystem, id_class, id_method)`
  - Nota: `tx` es entero autoincremental (serial). No lo establezcas manualmente; el código inserta `description` + FKs y usa `RETURNING tx`. Se usa para vincular `option.tx` con la transacción asociada.
- `menu(id_subsystem, name, description, id_parent)`
- `option(name, description, tx)`
  - Nota: `tx` se usa para vincular la opción con la transacción asociada.
- Tablas join: `user_profile`, `option_profile`, `option_menu`, `class_method`, `subsystem_class`, `method_profile`.

Restricciones relevantes:

- `menu.id_subsystem` suele ser NOT NULL. Si creas menús por forma “perfil” sin especificar subsistema, fallará.
- `option.tx` sujeto a unicidad lógica: la implementación reutiliza la opción si ya existe para un `tx` dado.

## Errores y códigos

Los errores se generan vía `Utils.handleError({ message, errorCode, error })` y se lanzan como `Error` cuyo `message` es un JSON stringificado.

Códigos (`config/config.js`):
\n- `BAD_REQUEST` (400)
\n- `UNAUTHORIZED` (401)
\n- `FORBIDDEN` (403)

- `NOT_FOUND` (404)
- `REQUEST_TIMEOUT` (408)
- `CONFLICT` (409)
- `INTERNAL_SERVER_ERROR` (500)
- `DB_ERROR` (503)

Formato de error típico:

```jsonc
{
  "message": "Error en <método>",
  "errorCode": 503,
  "error": { "code": "23502", "detail": "..." },
}
```

## Capa DBMS (acceso a datos)

`src/dbms/dbms.js` expone utilidades de base para consultas y transacciones:

- `init()` carga queries desde `config/queries.yaml`.
- `connection()`/`disconnection(client)` gestionan el pool de PG.
- `query({ query, params })` ejecuta SQL directo.
- `executeNamedQuery({ nameQuery, params })` usa una query por nombre del YAML.
- `executeJsonNamedQuery(json)` ejecuta un conjunto `{ 'SQL_NAME': [params] }`.
- Transacciones:
  - `beginTransaction()`, `commitTransaction(client)`, `rollbackTransaction(client)`
  - `executeJsonTransaction(json)` ejecuta JSON nombrado dentro de una transacción.
- Helpers CRUD genéricos: `get`, `getWhere`, `insert`, `updateById`, `updateByUsername`, `deleteByUsername`, `deleteById`, `deleteWhere`, `deleteAll`.

Ejemplo (consulta simple):

```js
const res = await dbms.query({
  query: 'SELECT * FROM public."user" WHERE username = $1',
  params: ['alice'],
});
console.log(res.rows);
```

Ejemplo (transacción JSON):

```js
await dbms.executeJsonTransaction({
  insertUser: [
    'alice',
    'hash',
    'alice@example.com',
    'active',
    new Date().toDateString(),
  ],
  getUserWhere: ['alice'],
});
```

## Repositorio (APIs de dominio)

Clase `Repository` extiende `DBMS` y centraliza operaciones de dominio. A continuación se listan los métodos más usados, su propósito, entradas/salidas y ejemplos.

> Formato de respuesta estándar: cuando hay retorno de inserciones, suele ser `{ data: [...] }`; en listados, arreglos de filas; en eliminaciones masivas: `{ message: '...' }`.

### Usuarios y Perfiles

- `setUserProfile({ userData: { username }, profileData: { name } })` → Asigna un perfil al usuario.
  - Salida: `{ data: [ { id_user, id_profile } ] }`
- `getUserProfiles({ username })` → Perfiles de un usuario.
  - Salida: `[{ user_id, username, profile_id, profile_name }]`
- `getUsersProfiles()` → Todos los usuarios con sus perfiles.
  - Salida: arreglo de `{ user_id, username, profile_id, profile_name }`
- `setUsersProfiles({ [username]: [profileName, ...] })` → Asignación masiva por mapa.
  - Salida: `{ data: [ { username, profile } ] }`
- `delUserProfile({ username, profile, confirmDelete })` → Quita un perfil a un usuario.
  - `confirmDelete` debe ser `DELETE_USER_PROFILE` (upper).

### Perfiles y Opciones

- `setProfileOption({ profile, option, description? })` → Enlaza una opción a un perfil (idempotente).
  - Salida: `{ data: [ { id_option, id_profile } ] }`
- `getProfileOptions({ profile })` → Opciones de un perfil.
  - Salida: `[{ profile_id, profile_name, option_id, option_name }]`
- `getOptionsAllowed({ profile })` → Devuelve solo un arreglo plano con los nombres de las opciones permitidas para el perfil.
- `getProfilesOptions()` → Todas las combinaciones perfil-opción.
- `delProfileOption({ profile, option, confirmDelete })` → Desenlaza opción de perfil.
  - `confirmDelete` debe ser `DELETE_OPTION_PROFILE`.

### Menús, Opciones y Perfiles

- `setMenuOptionProfile({ menu, option, profile, description?, subsystem?, className?, method? })`
  - Crea/vincula la opción al menú y perfil. Si se proporcionan `subsystem/className/method`, se resuelve/crea una transacción `tx` y se asocia a la opción (evitando duplicados por `tx`). También fija `id_subsystem` del menú si se provee `subsystem`.
  - Salida: `{ data: [ { id_menu, id_option, id_profile } ] }`
- `getMenuOptionsProfile({ menu, profile })` y `getMenusOptionsProfiles()` → Listados cruzados.
- `delMenuOptionsProfile(...)`, `delMenusOptionsProfiles(...)`, `delAllMenusOptionsProfiles()` → Eliminaciones.
- `setMenusOptionsProfiles(data)` y `replaceMenusOptionsProfiles(data)` → Cargas masivas en 2 formas:
  1. Forma por perfil ("profile-shape"):

  ```json
  {
    "perfilA": {
      "Menu 1": ["Opción 1", "Opción 2|123"],
      "Menu 2": ["Opción X"]
    }
  }
  ```

  - Nota: si `menu.id_subsystem` es NOT NULL y no se provee subsistema, fallará.
  1. Forma jerárquica constante ("constant-shape"):

  ```json
  {
    "subsystemA": {
      "Menú A": {
        "description": "...",
        "options": {
          "Opción 1": {
            "allowedProfiles": ["perfilA", "perfilB"],
            "method": {
              "subsystem": "subsystemA",
              "className": "Clase",
              "method": "Metodo"
            }
          }
        }
      }
    }
  }
  ```

  - Recomendado: evita NOT NULL al incluir el subsistema.

### Perfiles y Métodos

- `setProfileMethod({ profile, method, description? })` → Concede acceso de un perfil a un método.
- `getProfileMethods({ profile })` y `getProfilesMethods()` → Listados.
- `delProfileMethod(...)`, `delProfilesMethods(...)` → Eliminaciones.

### Clases y Métodos

- `setClassMethod({ className, method, description? })` → Vincula método a clase.
- `getClassMethods({ className })` y `getClassesMethods()` → Listados.
- `delClassMethod(...)`, `delClassesMethods(...)` → Eliminaciones.

### Subsistemas, Clases y Métodos

- `setSubsystemClassMethod({ subsystem, className, method, description? })` → Vincula tríada SCM.
- `getSubsystemClassesMethods({ subsystem })` y `getSubsystemsClassesMethods()` → Listados SCM.
- `replaceSubsystemsClassesMethods(data)` → Reemplazo masivo SCM a partir de estructura mínima:

  ```json
  { "subsystemA": { "ClassA": ["Method1", "Method2"] } }
  ```

\n- `delSubsystemClassMethod(...)`, `delSubsystemsClassesMethods(...)`, `delAllSubsystemsClassesMethods()` → Eliminaciones.
\n- `backupSubsystemsClassesMethodsReverseOrder()` → Backup de SCM y `method_profile` en orden seguro.

- `resetMenusAndRestoreSubsystemsClassesMethods(menusProfilesData, subsystemsClassesMethodsData)` → Resetea menús/joins, y restaura SCM y perfiles de métodos (flujo compuesto).

  Nota sobre permisos (method_profile):
  - Si tu estructura fuente (por ejemplo `src/dbms/db-structure.js`) define `allowedProfiles` por cada método, el repositorio crea automáticamente las filas en `method_profile` correspondientes durante `setSubsystemsClassesMethods(...)`/`replaceSubsystemsClassesMethods(...)`.
  - Perfiles inexistentes listados en `allowedProfiles` se crean de forma idempotente antes de enlazarlos al método.
  - Esto alinea los permisos efectivos de métodos con la definición declarativa sin pasos manuales extra.

### Transacciones (tx)

- `setTxTransaction({ subsystem, className, method, tx?, description? })` → Crea/asegura transacción.
  - Si no se provee `tx`, se genera uno derivado del trío SCM.
  - Salida: `{ message?: string, data: { tx, description } }`
- `getTxTransaction({ tx } | { subsystem, className, method })` → Obtiene datos de una tx.
  - Salida: `{ tx, description, subsystem, class, method }`
- `delTxTransaction({ confirmDelete: 'DELETE_TRANSACTION', tx? | scm })`
- `delAllTxTransaction({ confirmDelete: 'DELETE_ALL_TRANSACTION' })`

Integración con opciones:

- `_resolveTxFromMethodRef({ subsystem, className, method })` deriva/crea `tx`.
- `_ensureOptionWithTx(client, { name, description, tx })` crea o REUTILIZA la opción por `tx` para evitar violar unicidad.

### Utilidades de repositorio

- `_withTransaction(callback, errorMessage?)` → Wrapper transaccional.
- `_ensureEntityByUniqueField(client, table, fields)` → Asegura entidad por campo único (`name` o similar).
- `_ensureJoin(client, table, fields)` → Inserta join si no existe.
- `_isMenusStructureShape(data)` → Detecta forma jerárquica "constant-shape".
- `_requireConfirmJoin(token, table)` → Verifica `confirmDelete` (`DELETE_<TABLE>`/`DELETE_ALL_<TABLE>`).
- `handleGetSetData({ method, methodIfNotFound, data, dataIfNotFound })` → Obtiene; si vacío, setea (utilidad de orquestación).

## Sesión y autenticación

- `src/session/session.js` maneja `login`, `register`, `changeActiveProfile`, `forgotPassword`, `resetPassword`.
- `src/session/sessionRoutes.js` registra endpoints:
  - `POST /login` → Autenticación; establece sesión.
  - `POST /register` → Registro básico (usa `bcrypt` para hash).
  - `GET /logout` → Cierra sesión.
  - `POST /forgotPassword` y `POST /resetPassword` → Flujo de recuperación (placeholder de envío por `Mailer`).

`SessionManager` provee helpers para crear/actualizar/destrozar sesión en `req.session`.

`Tokenizer` (`src/tokenizer/tokenizer.js`) genera/verifica JWT (usado donde aplique).

## Validación y formateo

- `Validator` (`src/validator/validator.js`):
  - Tipos: `array`, `int`, `float`, `string`, `boolean`, `date`, `object`, `function`, `number`, `strings_array`, `object_of_strings`, `object_of_strings_array`, `array_of_objects`, `object_of_arrays` (+ customTypes configurables).
  - Validaciones de campos por entidad (`user`, `profile`, `subsystem`, `class`, `method`, `menu`, `option`, `transaction`).
  - `validateStructuredData(data, structure)` para validar esquemas anidados.

- `Formatter` (`src/formatter/formatter.js`):
  - `formatObjectParams(obj, orderedArray=['key','value'])` → mapea `{ key: [values] }` a filas.
  - `formatArrayParams(array, orderedArray)` → mapea array de objetos a filas.
  - `structureToOrderedArray(structure, orderedArray)` → selecciona campos por paths (`a.b.c`).

## Utilidades y otros componentes

- `Utils.handleError({ message, errorCode, error })` → Lanza un Error con JSON stringificado.
- `Debugger.logData(data, depth)` → Pretty print de objetos/arrays.
- `Security` y `Services`: placeholders listos para expansión.
- `Mailer` (`src/mailer/mailer.js`): integra `resend` para mails; método `sendRecoveryEmail` (flujo de recuperación).

## Pruebas locales y seeding

- Pruebas en `.dev-trials/trail-methods.js` (smoke tests + cobertura: replace/delete masivos, tx, etc.).
- Seed de datos mínimo: crea usuario/perfil/subsistema/clase/método/menú/opción/tx si no existen.
- Teardown opcional: si `TEST_TEARDOWN==='true'`, se limpian seeds (usuario y entidades asociadas) al final.

Formas de ejecución (PowerShell):

- Camino mínimo (solo Seguridad → `Security.loadPermissions`):

```powershell
# Purga previa (limpia todo excepto user/user_profile/profile) y carga permisos
$env:TEST_REPOSITORY='true'; node .dev-trials/trail-methods.js

# Usar datos ya sembrados (omite purga) y solo medir carga de permisos
$env:TEST_REPOSITORY='true'; $env:SKIP_PURGE='true'; node .dev-trials/trail-methods.js

# Con limpieza al final (cuando aplique)
$env:TEST_REPOSITORY='true'; $env:TEST_TEARDOWN='true'; node .dev-trials/trail-methods.js
```

- Suite completa de pruebas de dominio:

```powershell
$env:TEST_TRAIL_METHODS='true'; node .dev-trials/trail-methods.js
```

Notas del runner:

- En el modo mínimo (`TEST_REPOSITORY`), por defecto se ejecuta una purga selectiva previa para garantizar un estado consistente de pruebas (se conservan `user`, `user_profile` y `profile`). Puedes omitirla con `SKIP_PURGE='true'`.
- La salida incluye resúmenes `{ name, success }` y, cuando hay pruebas negativas, errores esperados (por ejemplo, NOT NULL de `menu.id_subsystem`).

### Seeding de estructura base (subsystems + menus)

El script `.dev-trials/seed-db-structure.js` inserta la estructura exportada en `src/dbms/db-structure.js`:

- Subsistemas/Clases/Métodos: vía `repository.setSubsystemsClassesMethods(subsystems)`.
- Menús/Opciones/Perfiles: vía `repository.setMenusOptionsProfiles(menus)`.
- Verificación: `getSubsystemsClassesMethods()` y `getMenusOptionsProfiles()` muestran conteos y un preview.

Comandos (PowerShell):

```powershell
# Solo sembrar (sin borrar)
npm run seed:db-structure

# Resetear (limpiar tablas relacionadas) y sembrar de nuevo
node .dev-trials/seed-db-structure.js --reset
```

Notas:

- El seed acepta la forma constante de `menus` tal como viene en `db-structure.js`.
- Si una opción define `method` usando `{ subsystem, class }`, el seed normaliza internamente a `{ subsystem, className }` para compatibilidad con el repositorio.
- `menu.id_subsystem` puede ser NOT NULL en tu esquema: la forma constante ya incluye el subsistema y evita errores.

### Verificación de permisos (method_profile y Security.loadPermissions)

Herramientas disponibles para auditar permisos efectivos:

- Validación integrada en el seed:

```powershell
# Limpia, siembra y verifica method_profile + carga de permisos
node .dev-trials/seed-db-structure.js --reset --check-permissions
```

- Script dedicado de chequeo rápido:

```powershell
node .dev-trials/check-permissions.js
```

Qué muestra:

- Total de filas en `method_profile` y una muestra uniendo método ↔ perfil.
- Tamaño del mapa de permisos en memoria de `Security.loadPermissions` y un preview de claves.
- Importante: durante el seeding, los `allowedProfiles` definidos por método en `src/dbms/db-structure.js` se traducen automáticamente a filas en `method_profile` y se crean perfiles faltantes si hace falta.

Ejemplo de salida (puede variar):

```text
[CHECK] method_profile total: 123
[CHECK] Muestra method_profile (máx 20): [ { method: '...', profile: '...' }, ... ]
[CHECK] Security.loadPermissions claves: 810
[CHECK] Muestra (10): [ [ 'subsystemId_classId_methodId_profileId', true|false ], ... ]
```

## Integración continua (CI)

Este repositorio incluye un workflow de GitHub Actions para ejecutar las pruebas de repositorio en cada push/PR a `main`.

- Archivo del flujo: `.github/workflows/repository-tests.yml`.
- ¿Qué hace?
  - Levanta un servicio de PostgreSQL 16 con `POSTGRES_DB=web2db`, `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD=postgres`.
  - Genera `config/secret-config.js` en el runner, parametrizado por variables de entorno (`PGHOST`, `PGUSER`, `PGPASSWORD`, `PGPORT`, `PGDATABASE`).
  - Intenta restaurar la BD desde `db-backups/backup.sql` si existe (primero `psql -f`, luego `pg_restore` por si el archivo no es SQL plano). Si no hay backup, las pruebas crean los datos mínimos necesarios.
  - Instala dependencias con `npm ci` y ejecuta `npm run ci:test` con `TEST_REPOSITORY=true` y `TEST_TEARDOWN=true` para asegurar limpieza al final.

Variables de entorno soportadas en CI (y local si generas tu propio `secret-config.js`):

- `PGHOST` (default: `localhost`)
- `PGUSER` (default: `postgres`)
- `PGPASSWORD` (default: `postgres` en CI)
- `PGPORT` (default: `5432`)
- `PGDATABASE` (default: `web2db`)

Ejecución equivalente local (PowerShell), usando el `secret-config.js` del repo:

```powershell
$env:TEST_REPOSITORY='true'; $env:TEST_TEARDOWN='true'; node .dev-trials/trail-methods.js
```

Notas:

- El workflow genera un `resendApiKey` dummy en CI para evitar dependencia de secretos externos.
- Si prefieres no usar `backup.sql`, puedes añadir un script DDL mínimo y referenciarlo en el paso de restauración.

## Ejemplos completos

1. Asignar opción con referencia a método (resuelve tx automáticamente):

```js
await repository.setMenuOptionProfile({
  menu: 'Gestión',
  option: 'Crear Usuario',
  profile: 'administrador de seguridad',
  subsystem: 'security',

### Solución de problemas (troubleshooting)

- Claves de permisos = 0 en el runner mínimo:
  - Asegúrate de haber sembrado datos primero: `npm run seed:reset-check`.
  - Si quieres usar datos existentes, ejecuta el runner con `npm run test:repo:skip-purge` (omite la purga).
  - Verifica que `config/secret-config.js` apunta a la base correcta y que `config/queries.yaml` contiene la consulta `loadPermissions`.

- Error: "Cannot use a pool after calling end on the pool":
  - No ejecutes simultáneamente `TEST_REPOSITORY` y `TEST_TRAIL_METHODS` en un mismo proceso.
  - El runner mínimo cierra el pool al final; ejecuta un solo modo por invocación.
  - Si persiste, cierra terminales previas o reinicia el proceso de Node.

- `SKIP_PURGE` parece no tener efecto:
  - Debe ser el string `'true'` (no boolean) en PowerShell: `$env:SKIP_PURGE='true'`.
  - Usa el script `npm run test:repo:skip-purge` para forzarlo correctamente.

- Conteo de `method_profile` inesperadamente bajo:
  - Verifica que cada método en `src/dbms/db-structure.js` tenga `allowedProfiles` donde aplique.
  - El seeding crea perfiles faltantes de forma idempotente; si hay typos en nombres, se crearán perfiles nuevos con ese typo. Revisa `config/profiles.json` y la consistencia de nombres.
  - Reejecuta `npm run seed:reset-check` para normalizar estado.

- Errores al referenciar métodos desde menús (class vs className):
  - El seeding normaliza internamente `{ class }` → `{ className }`, pero asegúrate de que cada opción con `method` incluya `subsystem`, `className` y `method` válidos.
  className: 'User',
  method: 'create',
});
// => { data: [ { id_menu, id_option, id_profile } ] }
```

1. Carga masiva constant-shape (recomendada):

```json
{
  "security": {
    "Gestión de Usuarios": {
      "description": "Menú de gestión",
      "options": {
        "Crear Usuario": {
          "allowedProfiles": ["administrador de seguridad"],
          "method": {
            "subsystem": "security",
            "className": "User",
            "method": "create"
          }
        }
      }
    }
  }
}
```

1. Carga por perfil (ojo con NOT NULL de menús):

```json
{
  "administrador de seguridad": {
    "Gestión de Usuarios": [
      "Crear Usuario",
      "Editar Usuario|security.User.edit"
    ]
  }
}
```

1. Ciclo de transacciones:

```js
const { data } = await repository.setTxTransaction({
  subsystem: 'security',
  className: 'User',
  method: 'edit',
});
const tx = data.tx;
await repository.getTxTransaction({ tx });
await repository.delTxTransaction({ confirmDelete: 'DELETE_TRANSACTION', tx });
```

---

Si necesitas ampliar esta documentación con endpoints HTTP adicionales, ejemplos cURL o diagramas de relaciones, indícame y lo agrego.

## Esquemas de datos de entrada por método

Esta sección resume, para cada método clave, la estructura esperada de entrada con tipos y significado. Los ejemplos usan comentarios inline con `//` y el formato de los objetos puede variar según tu modelo; usa estos como guía.

### Capa DBMS (salida)

- query

```jsonc
{
  "query": "SELECT * FROM public.\"user\" WHERE username = $1", // string: SQL parametrizada
  "params": ["alice"], // any[]: valores para los placeholders $1, $2, ...
}
```

- executeNamedQuery

```jsonc
{
  "nameQuery": "getUserWhere", // string: clave definida en config/queries.yaml
  "params": ["alice"], // any[] (retrocompat)
}
```

Nuevo formato recomendado (con structure_params y orderArray):

```jsonc
{
  "nameQuery": "insertUser",
  "params": {
    "username": "alice",
    "password": "hash",
    "email": "alice@example.com",
    "status": "active",
    "register_date": "2025-11-06",
  },
}
```

Notas de comportamiento:

- Si la consulta en `config/queries.yaml` define:
  - `structure_params` por campo (sin `root`), y
  - `orderArray` con el orden de placeholders $1..$N,
    entonces `executeNamedQuery` validará los tipos y convertirá el objeto en el arreglo `[...valores]` siguiendo `orderArray`.
- Si envías un array ya ordenado, se verificará la longitud y los tipos mapeando temporalmente contra `orderArray` y `structure_params`.
- Si la consulta no requiere parámetros (`orderArray: []`), puedes omitir `params` y se ejecutará sin argumentos.

- executeJsonNamedQuery / executeJsonTransaction

```jsonc
{
  "insertUser": {
    "username": "alice",
    "password": "hash",
    "email": "alice@example.com",
    "status": "active",
    "register_date": "2025-11-06",
  },
  "getUserWhere": { "username": "alice" },
}
```

También se acepta el arreglo (retrocompat), pero se recomienda el objeto por claridad y validación fuerte.

### Ejemplos rápidos de queries nombradas (nuevo formato)

Usando objetos (recomendado). El sistema valida tipos según `structure_params` y ordena según `orderArray` antes de ejecutar:

```jsonc
// Crear usuario
{
  "nameQuery": "insertUser",
  "params": {
    "username": "alice",
    "password": "hash",
    "email": "alice@example.com",
    "status": "active",
    "register_date": "2025-11-06"
  }
}

// Obtener un usuario por username
{ "nameQuery": "getUserWhere", "params": { "username": "alice" } }

// Perfiles ↔ Opciones
{ "nameQuery": "setProfileOption", "params": { "option_name": "Crear Perfil", "profile_name": "admin" } }
{ "nameQuery": "delProfileOption", "params": { "option_name": "Crear Perfil", "profile_name": "admin" } }
{ "nameQuery": "getProfileOptions", "params": { "profile_name": "admin" } }
{ "nameQuery": "getProfilesOptions", "params": { } }

// Menús ↔ Opciones
{ "nameQuery": "setMenuOption", "params": { "option_name": "Crear Perfil", "menu_name": "Gestión de Perfiles" } }
{ "nameQuery": "delMenuOption", "params": { "option_name": "Crear Perfil", "menu_name": "Gestión de Perfiles" } }
{ "nameQuery": "getMenuOptions", "params": { "menu_name": "Gestión de Perfiles" } }
{ "nameQuery": "getMenusOptions", "params": { } }

// Menú ↔ Opción ↔ Perfil
{ "nameQuery": "getMenuOptionsProfile", "params": { "menu_name": "Gestión de Perfiles", "profile_name": "admin" } }
{ "nameQuery": "getMenusOptionsProfile", "params": { "profile_name": "admin" } }
{ "nameQuery": "getMenusOptionsProfiles", "params": { } }
{ "nameQuery": "delMenuOptionProfile", "params": { "option_name": "Crear Perfil", "menu_name": "Gestión de Perfiles", "profile_name": "admin" } }

// Perfil ↔ Método
{ "nameQuery": "setProfileMethod", "params": { "method_name": "executeNamedQuery", "profile_name": "admin" } }
{ "nameQuery": "delProfileMethod", "params": { "method_name": "executeNamedQuery", "profile_name": "admin" } }
{ "nameQuery": "getProfileMethods", "params": { "profile_name": "admin" } }
{ "nameQuery": "getProfilesMethods", "params": { } }

// Clase ↔ Método
{ "nameQuery": "setClassMethod", "params": { "class_name": "dbms", "method_name": "executeNamedQuery" } }
{ "nameQuery": "delClassMethod", "params": { "class_name": "dbms", "method_name": "executeNamedQuery" } }
{ "nameQuery": "getClassMethods", "params": { "class_name": "dbms" } }

// Subsistema ↔ Clase ↔ Método
{ "nameQuery": "setSubsystemClassMethod", "params": { "subsystem_name": "security", "class_name": "dbms" } }
{ "nameQuery": "getSubsystemClassesMethods", "params": { "subsystem_name": "security" } }
```

### Formato de `config/queries.yaml`

Cada entrada debe especificar:

```yaml
'insertUser':
  {
    query: 'INSERT INTO public."user" (username, password, email, status, register_date) VALUES ($1, $2, $3, $4, $5);',
    structure_params:
      {
        username: 'string',
        password: 'string',
        email: 'string',
        status: 'string',
        register_date: 'string',
      },
    orderArray: ['username', 'password', 'email', 'status', 'register_date'],
  }
```

Reglas:

- `orderArray` debe reflejar exactamente el orden de $1..$N de la query.
- `structure_params` define los tipos a validar por campo.
- Para consultas sin parámetros, usar `structure_params: { }` y `orderArray: []`.

- get

```jsonc
{
  "tableName": "user", // string
  "dbSchema": "public", // string opcional (default: "public")
}
```

- getWhere

```jsonc
{
  "tableName": "user", // string
  "data": {
    "keyValueData": { "username": "alice" }, // object: pares columna=valor
  },
  "dbSchema": "public",
}
```

- insert

```jsonc
{
  "tableName": "profile",
  "data": {
    "keyValueData": { "name": "participante", "description": "..." },
  },
  "dbSchema": "public",
}
```

- updateById

```jsonc
{
  "tableName": "user",
  "data": {
    "userId": 123, // number: id del registro a actualizar (campo id)
    "keyValueData": { "email": "new@example.com", "status": "active" },
  },
  "dbSchema": "public",
}
```

- updateByUsername

```jsonc
{
  "tableName": "user", // string: nombre de la tabla
  "data": {
    "username": "nombre_de_usuario", // string: criterio WHERE username = $N
    "keyValueData": {
      // object: columnas a actualizar
      "email": "nuevo@example.com",
      "status": "active",
    },
  },
  "dbSchema": "public", // opcional
}
```

- deleteByUsername

```jsonc
{
  "tableName": "user",
  "data": {
    "username": "alice", // string
    // si tableName es una tabla join (contiene "_"), también:
    // "confirmDelete": "DELETE_USER_PROFILE" // string exacto requerido
  },
  "dbSchema": "public",
}
```

- deleteById

```jsonc
{
  "tableName": "user",
  "data": {
    "userId": 123, // number
    // si es tabla join: "confirmDelete": "DELETE_USER_PROFILE"
  },
  "dbSchema": "public",
}
```

- deleteAll

```jsonc
{
  "tableName": "option_profile",
  "data": {
    "confirmDelete": "DELETE_ALL_OPTION_PROFILE", // requerido
  },
  "dbSchema": "public",
}
```

- deleteWhere

```jsonc
{
  "tableName": "user_profile",
  "data": {
    "keyValueData": { "id_user": 123, "id_profile": 3 },
    "confirmDelete": "DELETE_USER_PROFILE", // requerido para tablas join
  },
  "dbSchema": "public",
}
```

### Repository (dominio)

- setUserProfile

```jsonc
{
  "userData": { "username": "repo_user_test" }, // string
  "profileData": { "name": "participante" }, // string
}
```

- getUserProfiles

```jsonc
{ "username": "repo_user_test" }
```

- getUsersProfiles

```jsonc
{}
```

- setUsersProfiles

```jsonc
{
  "repo_user_test": ["participante", "administrador de eventos"], // map<string, string[]>
}
```

- delUserProfile

```jsonc
{
  "username": "repo_user_test",
  "profile": "participante",
  "confirmDelete": "DELETE_USER_PROFILE", // requerido
}
```

- setProfileOption

```jsonc
{
  "profile": "participante",
  "option": "Mi Opción", // crea si no existe
  "description": "Descripción opcional", // string opcional
}
```

- getProfileOptions

```jsonc
{ "profile": "participante" }
```

- getProfilesOptions

```jsonc
{}
```

- delProfileOption

```jsonc
{
  "profile": "participante",
  "option": "Mi Opción",
  "confirmDelete": "DELETE_OPTION_PROFILE",
}
```

- setMenuOptionProfile (con soporte de transacciones tx)

```jsonc
{
  "menu": "Gestión", // string: nombre del menú
  "option": "Crear Usuario", // string: nombre de la opción
  "profile": "administrador de seguridad",
  "description": "Opción para crear usuario", // opcional
  // Si se provee subsystem/className/method, se deriva/asegura una tx y se asocia a la opción
  "subsystem": "security", // opcional pero recomendado
  "className": "User", // opcional
  "method": "create", // opcional
}
```

- getMenuOptionsProfile

```jsonc
{ "menu": "Gestión", "profile": "participante" }
```

- getMenusOptionsProfiles

```jsonc
{}
```

- delMenuOptionsProfile

```jsonc
{
  "menu": "Gestión",
  "option": "Crear Usuario",
  "profile": "participante",
  "confirmDelete": "DELETE_OPTION_MENU_PROFILE",
}
```

- delAllMenusOptionsProfiles

```jsonc
{}
```

- setMenusOptionsProfiles / replaceMenusOptionsProfiles (dos formas)

1. Forma por perfil (profile-shape):

```jsonc
{
  "participante": {
    "Menú A": ["Opción 1", "Opción 2|txId"], // "Opción|tx" permite vincular con tx existente
  },
}
```

1. Forma constante jerárquica (constant-shape):

```jsonc
{
  "security": {
    "Gestión de Usuarios": {
      "description": "Menú de gestión",
      "options": {
        "Crear Usuario": {
          "allowedProfiles": ["administrador de seguridad"],
          "method": {
            "subsystem": "security",
            "className": "User",
            "method": "create",
          },
        },
      },
    },
  },
}
```

- setProfileMethod / getProfileMethods / getProfilesMethods / delProfileMethod

```jsonc
// setProfileMethod
{ "profile": "participante", "method": "repo_method_test", "description": "..." }

// getProfileMethods
{ "profile": "participante" }

// delProfileMethod
{ "profile": "participante", "method": "repo_method_test", "confirmDelete": "DELETE_METHOD_PROFILE" }
```

- setClassMethod / getClassMethods / getClassesMethods / delClassMethod

```jsonc
// setClassMethod
{ "className": "User", "method": "create", "description": "..." }

// getClassMethods
{ "className": "User" }

// delClassMethod
{ "className": "User", "method": "create", "confirmDelete": "DELETE_CLASS_METHOD" }
```

- setSubsystemClassMethod / getSubsystemClassesMethods / getSubsystemsClassesMethods / delSubsystemClassMethod / delAllSubsystemsClassesMethods

```jsonc
// setSubsystemClassMethod
{ "subsystem": "security", "className": "User", "method": "create", "description": "..." }

// getSubsystemClassesMethods
{ "subsystem": "security" }

// delSubsystemClassMethod
{ "subsystem": "security", "className": "User", "method": "create", "confirmDelete": "DELETE_SUBSYSTEM_CLASS_METHOD" }

// delAllSubsystemsClassesMethods
{}
```

- replaceSubsystemsClassesMethods (masivo)

```jsonc
{ "security": { "User": ["create", "edit", "delete"] } }
```

- Transacciones (tx)

```jsonc
// setTxTransaction
{ "subsystem": "security", "className": "User", "method": "edit", "description": "Tx de edición" }

// getTxTransaction (por tx o por trío SCM)
{ "tx": 12 }
// o
{ "subsystem": "security", "className": "User", "method": "edit" }

// delTxTransaction
{ "confirmDelete": "DELETE_TRANSACTION", "tx": 12 }

// delAllTxTransaction
{ "confirmDelete": "DELETE_ALL_TRANSACTION" }
```

## Esquemas de salida por método

Esta sección complementa la anterior mostrando los formatos típicos de respuesta (salida) para cada operación. Se incluyen variantes de éxito y error. El manejo de errores centralizado genera un `Error` cuyo `message` es un JSON stringificado con `{ message, errorCode, error }`.

### Formato de error genérico

```jsonc
{
  "message": "Error en <nombreMetodo>", // string descriptivo
  "errorCode": 503, // código HTTP lógico
  "error": {
    // objeto opcional con detalles bajos de PG
    "code": "23503", // código PG (ej: violación de FK)
    "detail": "La fila ...", // detalle si disponible
  },
}
```

### Capa DBMS

- query / executeNamedQuery / executeJsonNamedQuery / executeJsonTransaction

```jsonc
// SUCCESS (consulta SELECT)
{
  "rows": [ { "id": 1, "username": "alice" }, { "id": 2, "username": "bob" } ],
  "rowCount": 2
}

// SUCCESS (array de resultados para executeJsonNamedQuery)
[
  { "rows": [ { "id": 1, "username": "alice" } ], "rowCount": 1 },
  { "rows": [ { "id": 1, "username": "alice" } ], "rowCount": 1 }
]

// ERROR (no encontrados)
{
  "errorCode": 404,
  "message": "No se encontraron registros"
}
```

- get / getWhere

```jsonc
// SUCCESS
{ "data": [ { "id": 10, "username": "repo_user_test", "status": "active" } ] }

// NOT FOUND
{ "errorCode": 404, "message": "No se encontraron registros" }
```

- insert

```jsonc
// SUCCESS
{ "message": "Registro insertado correctamente" }

// ERROR genérico
{ "errorCode": 500, "message": "Error del servidor" }
```

- updateById / updateByUsername

```jsonc
// SUCCESS
{ "message": "Registro actualizado correctamente" }

// NOT FOUND
{ "errorCode": 404, "message": "No se encontraron registros que coincidan con los criterios" }
```

- deleteByUsername / deleteById

```jsonc
// SUCCESS
{ "message": "Registro eliminado correctamente" }

// BAD REQUEST (faltan datos)
{ "errorCode": 400, "message": "No se proporcionaron datos necesarios para la consulta" }
```

- deleteWhere / deleteAll

```jsonc
// SUCCESS
{ "message": "Registro(s) eliminado(s) correctamente" }

// BAD REQUEST / CONFIRMACIÓN requerida
{ "errorCode": 400, "message": "No se proporcionaron datos necesarios para la consulta" }
```

### Repository (cheat sheet)

Convenciones:

1. Métodos de creación/asignación devuelven `{ data: [...] }` con filas mínimas (ids join).
2. Listados devuelven `[{ ... }]` directamente.
3. Bulk delete / replace devuelven `{ message: '...' }`.
4. Errores siguen formato genérico.

- setUserProfile / setProfileOption / setMenuOptionProfile / setProfileMethod / setClassMethod / setSubsystemClassMethod

```jsonc
// SUCCESS
{ "data": [ { "id_user": 37, "id_profile": 3 } ] }
// Otro ejemplo join triple
{ "data": [ { "id_menu": 24, "id_option": 22, "id_profile": 3 } ] }
```

- setUsersProfiles

```jsonc
{ "data": [{ "username": "repo_user_test", "profile": "participante" }] }
```

- getUserProfiles / getProfileOptions / getMenuOptionsProfile / getProfileMethods / getClassMethods / getSubsystemClassesMethods

```jsonc
[
  {
    "user_id": 37,
    "username": "repo_user_test",
    "profile_id": 3,
    "profile_name": "participante",
  },
]
```

- getUsersProfiles / getProfilesOptions / getMenusOptionsProfiles / getProfilesMethods / getClassesMethods / getSubsystemsClassesMethods

```jsonc
[
  {
    "menu_id": 20,
    "menu_name": "repo_menu_test",
    "option_id": 21,
    "option_name": "repo_option_test",
    "profile_id": 3,
    "profile_name": "participante",
  },
]
```

- delUserProfile / delProfileOption / delMenuOptionsProfile / delProfileMethod / delClassMethod / delSubsystemClassMethod

```jsonc
// SUCCESS suele ser undefined o { message: '...' } dependiendo de implementación interna
{ "message": "Registro eliminado correctamente" }
```

- delAllMenusOptionsProfiles / delAllSubsystemsClassesMethods / delAllTxTransaction

```jsonc
{ "message": "Todos los menús/opciones/perfiles eliminados correctamente" }
```

- replaceMenusOptionsProfiles

```jsonc
{ "message": "Estructura de menús procesada correctamente" }
```

- replaceSubsystemsClassesMethods

```jsonc
{ "message": "Subsistemas/clases/métodos reemplazados correctamente" }
```

- setTxTransaction

```jsonc
// SUCCESS creación
{ "data": { "tx": 12, "description": "Tx test del" } }
// SUCCESS ya existente
{ "message": "Transacción ya existente", "data": { "tx": 12, "description": "Tx test del" } }
```

- getTxTransaction

```jsonc
{
  "tx": 12,
  "description": "Tx test del",
  "subsystem": "repo_subsystem_test",
  "class": "repo_class_test",
  "method": "repo_method_test",
}
```

- delTxTransaction

```jsonc
{ "message": "Transacción eliminada correctamente" }
```

- delAllTxTransaction

```jsonc
{ "message": "Todas las transacciones eliminadas correctamente" }
```

- handleGetSetData

```jsonc
// SUCCESS (retorno del método principal si encontró datos)
[
  {
    "profile_id": 3,
    "profile_name": "participante",
    "method_id": 10,
    "method_name": "repo_method_test",
  },
]
// Si no encuentra, ejecuta método de set y retorna su resultado típico { data: [...] }
```

### Patrón de errores esperados en pruebas negativas

```jsonc
{
  "message": "Error en setMenusOptionsProfiles",
  "errorCode": 503,
  "error": {
    "code": "23502", // NOT NULL violation
    "detail": "La fila que falla contiene (...)",
  },
}
```

### Notas finales

- Algunos métodos pueden devolver `undefined` en operaciones de borrado simples; se recomienda estandarizar a `{ message }` si se busca consistencia.
- Para respuestas paginadas futuras se sugiere envoltura: `{ data: [...], page: 1, pageSize: 50, total: 123 }`.
- Ajusta ejemplos de `tx` a tu implementación real (si `tx` termina siendo entero autoincremental o string derivado).

## Cheat sheet de métodos

Resumen rápido. Cada bloque: Nombre → Entrada → Salida → Errores.

### DBMS

---

**query**
Entrada: `{ query: string, params?: any[] }`
Salida: `{ rows, rowCount }`
Errores: `503 DB_ERROR`

---

**executeNamedQuery**
Entrada: `{ nameQuery: string, params?: any[] }`
Salida: `{ rows, rowCount }`
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**executeJsonNamedQuery**
Entrada: `{ <queryName>: any[] }`
Salida: `Array<{ rows, rowCount }>`
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**executeJsonTransaction**
Entrada: `{ <queryName>: any[] }`
Salida: `Array<{ rows, rowCount }>` (transaccional)
Errores: `503 DB_ERROR` (rollback aplicado)

---

**get**
Entrada: `{ tableName: string }`
Salida: `{ data: any[] }`
Errores: `404 NOT_FOUND`

---

**getWhere**
Entrada: `{ tableName, data:{ keyValueData:{} } }`
Salida: `{ data: any[] }`
Errores: `400 BAD_REQUEST`, `404 NOT_FOUND`

---

**insert**
Entrada: `{ tableName, data:{ keyValueData:{} } }`
Salida: `{ message }`
Errores: `400 BAD_REQUEST`, `500 INTERNAL_SERVER_ERROR`

---

**updateById**
Entrada: `{ tableName, data:{ userId:number, keyValueData:{} } }`
Salida: `{ message }`
Errores: `400 BAD_REQUEST`, `404 NOT_FOUND`, `500 INTERNAL_SERVER_ERROR`

---

**updateByUsername**
Entrada: `{ tableName, data:{ username:string, keyValueData:{} } }`
Salida: `{ message }`
Errores: `400 BAD_REQUEST`, `404 NOT_FOUND`, `500 INTERNAL_SERVER_ERROR`

---

**deleteByUsername**
Entrada: `{ tableName, data:{ username:string, confirmDelete? } }`
Salida: `{ message }`
Errores: `400 BAD_REQUEST`, `500 INTERNAL_SERVER_ERROR`

---

**deleteById**
Entrada: `{ tableName, data:{ userId:number, confirmDelete? } }`
Salida: `{ message }`
Errores: `400 BAD_REQUEST`, `500 INTERNAL_SERVER_ERROR`

---

**deleteAll**
Entrada: `{ tableName, data:{ confirmDelete:string } }`
Salida: `{ message }`
Errores: `400 BAD_REQUEST`, `500 INTERNAL_SERVER_ERROR`

---

**deleteWhere**
Entrada: `{ tableName, data:{ keyValueData:{}, confirmDelete? } }`
Salida: `{ message }`
Errores: `400 BAD_REQUEST`, `500 INTERNAL_SERVER_ERROR`

### Repository

---

**setUserProfile**
Entrada: `{ userData:{username}, profileData:{name} }`
Salida: `{ data:[{ id_user, id_profile }] }`
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**getUserProfiles**
Entrada: `{ username }`
Salida: `Array<{ user_id, username, profile_id, profile_name }>`
Errores: `404 NOT_FOUND`, `503 DB_ERROR`

---

**getUsersProfiles**
Entrada: `{}`
Salida: `Array<{ user_id, username, profile_id, profile_name }>`
Errores: `404 NOT_FOUND`, `503 DB_ERROR`

---

**setUsersProfiles**
Entrada: `{ [username]: string[] }`
Salida: `{ data:[{ username, profile }] }`
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**delUserProfile**
Entrada: `{ username, profile, confirmDelete }`
Salida: `{ message }` (o `undefined`)
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**setProfileOption**
Entrada: `{ profile, option, description? }`
Salida: `{ data:[{ id_option, id_profile }] }`
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**getProfileOptions**
Entrada: `{ profile }`
Salida: `Array<{ profile_id, profile_name, option_id, option_name }>`
Errores: `404 NOT_FOUND`, `503 DB_ERROR`

---

**getOptionsAllowed**
Entrada: `{ profile }`
Salida: `Array<string>` (nombres de opciones asociadas al perfil)
Notas: Reutiliza `getProfileOptions` y mapea `rows.map(r => r.option_name)`
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

### Endpoint HTTP relacionado

`GET /profiles/:profile/options`

Respuesta:

```json
{
  "profile": "super administrador",
  "options": ["Crear Perfil", "Actualizar Perfil", "Eliminar Perfil"]
}
```

Posibles códigos:

- 200 OK → Perfil válido (aunque sin opciones devuelve `options: []`).
- 400 BAD_REQUEST → Falta parámetro `profile`.
- 503 DB_ERROR → Error de acceso a BD.

Ejemplo cURL:

```bash
curl -s http://localhost:3050/profiles/super%20administrador/options
```

Uso desde frontend (fetch):

```js
fetch(`${API_BASE}/profiles/${encodeURIComponent(perfil)}/options`)
  .then((r) => r.json())
  .then(({ options }) => {
    // Renderizar lista de opciones permitidas
  });
```

---

**getProfilesOptions**
Entrada: `{}`
Salida: `Array<{ profile_id, profile_name, option_id, option_name }>`
Errores: `404 NOT_FOUND`, `503 DB_ERROR`

---

**delProfileOption**
Entrada: `{ profile, option, confirmDelete }`
Salida: `{ message }` (o `undefined`)
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**setMenuOptionProfile**
Entrada: `{ menu, option, profile, description?, subsystem?, className?, method? }`
Salida: `{ data:[{ id_menu, id_option, id_profile }] }`
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**getMenuOptionsProfile**
Entrada: `{ menu, profile }`
Salida: `Array<{ menu_id, menu_name, option_id, option_name, profile_id, profile_name }>`
Errores: `404 NOT_FOUND`, `503 DB_ERROR`

---

**getMenusOptionsProfiles**
Entrada: `{}`
Salida: `Array<{ menu_id, menu_name, option_id, option_name, profile_id, profile_name }>`
Errores: `404 NOT_FOUND`, `503 DB_ERROR`

---

**delMenuOptionsProfile**
Entrada: `{ menu, option, profile, confirmDelete }`
Salida: `{ message }` (o `undefined`)
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**delAllMenusOptionsProfiles**
Entrada: `{}` (confirmación interna)
Salida: `{ message }`
Errores: `503 DB_ERROR`

---

**setMenusOptionsProfiles**
Entrada: `profile-shape | constant-shape`
Salida: `{ message }`
Errores: `503 DB_ERROR` (NOT NULL si falta subsystem)

---

**replaceMenusOptionsProfiles**
Entrada: `profile-shape | constant-shape`
Salida: `{ message }`
Errores: `503 DB_ERROR`

---

**setProfileMethod**
Entrada: `{ profile, method, description? }`
Salida: `{ data:[{ id_method, id_profile }] }`
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**getProfileMethods**
Entrada: `{ profile }`
Salida: `Array<{ profile_id, profile_name, method_id, method_name }>`
Errores: `404 NOT_FOUND`, `503 DB_ERROR`

---

**getProfilesMethods**
Entrada: `{}`
Salida: `Array<{ profile_id, profile_name, method_id, method_name }>`
Errores: `404 NOT_FOUND`, `503 DB_ERROR`

---

**delProfileMethod**
Entrada: `{ profile, method, confirmDelete }`
Salida: `{ message }` (o `undefined`)
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**setClassMethod**
Entrada: `{ className, method, description? }`
Salida: `{ data:[{ id_class, id_method }] }`
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**getClassMethods**
Entrada: `{ className }`
Salida: `Array<{ class_id?, class_name?, method_id, method_name }>`
Errores: `404 NOT_FOUND`, `503 DB_ERROR`

---

**getClassesMethods**
Entrada: `{}`
Salida: `Array<{ class_id?, class_name?, method_id, method_name }>`
Errores: `404 NOT_FOUND`, `503 DB_ERROR`

---

**delClassMethod**
Entrada: `{ className, method, confirmDelete }`
Salida: `{ message }` (o `undefined`)
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**setSubsystemClassMethod**
Entrada: `{ subsystem, className, method, description? }`
Salida: `{ data:[{ id_subsystem, id_class, id_method }] }`
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**getSubsystemClassesMethods**
Entrada: `{ subsystem }`
Salida: `Array<{ subsystem_id?, subsystem_name?, class_id?, class_name?, method_id, method_name }>`
Errores: `404 NOT_FOUND`, `503 DB_ERROR`

---

**getSubsystemsClassesMethods**
Entrada: `{}`
Salida: `Array<{ subsystem_id?, subsystem_name?, class_id?, class_name?, method_id, method_name }>`
Errores: `404 NOT_FOUND`, `503 DB_ERROR`

---

**delSubsystemClassMethod**
Entrada: `{ subsystem, className, method, confirmDelete }`
Salida: `{ message }` (o `undefined`)
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**delAllSubsystemsClassesMethods**
Entrada: `{}` (confirmación interna)
Salida: `{ message }`
Errores: `503 DB_ERROR`

---

**replaceSubsystemsClassesMethods**
Entrada: `{ subsystem:{ className:[methods] } }`
Salida: `{ message }`
Errores: `503 DB_ERROR`

---

**setTxTransaction**
Entrada: `{ subsystem, className, method, description? }`
Salida: `{ data:{ tx, description } }` (nueva) / `{ message, data:{ tx, description } }` (existente)
Errores: `503 DB_ERROR`

---

**getTxTransaction**
Entrada: `{ tx }` | `{ subsystem, className, method }`
Salida: `{ tx, description, subsystem, class, method }`
Errores: `404 NOT_FOUND`, `503 DB_ERROR`

---

**delTxTransaction**
Entrada: `{ confirmDelete, tx? }` | `{ confirmDelete, subsystem, className, method }`
Salida: `{ message }`
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`

---

**delAllTxTransaction**
Entrada: `{ confirmDelete }`
Salida: `{ message }`
Errores: `400 BAD_REQUEST`, `503 DB_ERROR`
