

# Documentación exhaustiva de la API

Esta documentación detalla todos los endpoints disponibles, los métodos HTTP soportados, el formato de los datos enviados y recibidos, ejemplos funcionales y posibles respuestas de error.

---

## Notas generales
- Todos los endpoints aceptan datos en el body (JSON) o en la cabecera `data` como string JSON. `EXCEPTO LOS GET`, que nativamente no admiten parámetros por body.
- Las respuestas incluyen mensajes, códigos de error y redirecciones cuando aplica.
- El registro y recuperación de contraseña usan validaciones estrictas.

---

## Endpoints

### Estado de la API
**URL:** `/`
**Método:** `GET`
**Entrada:** Ninguna.
**Respuesta:**
```json
"API is running"
```

---

### Inicio de Sesión
**URL:** `/login`
**Método:** `POST`
**Datos enviados:**
- Body (JSON):
  ```json
  {
    "username": "nombre_de_usuario",
    "password": "tu_contraseña",
    "activeProfile": "nombre_de_perfil" // para seleccionar el perfil cuando el usuario tenga más de un perfil
  }
  ```
- O header `data` como string JSON.

**Respuesta (éxito):**
```json
{
  "message": "Bienvenido <perfil>, <username>"
}
```
**Respuesta (varios perfiles):**
```json
{
  "message": "Seleccione el perfil con el que desea iniciar sesión",
  "profiles": ["participante", "administrador de eventos"]
}
```
**Respuesta (sesión existente):**
```json
{
  "message": "Ya has iniciado sesión. Cierra la sesión para continuar.",
  "redirect": "/home"
}
```
**Errores:**
- 401: Credenciales inválidas
- 404: Usuario no encontrado
- 500: Error del servidor

---

### Registro de Usuario
**URL:** `/register`
**Método:** `POST`
**Datos enviados:**
- Body (JSON):
  ```json
  {
    "username": "nuevo_usuario",
    "email": "correo@ejemplo.com",
    "password": "tu_contraseña",
    "confirmPassword": "tu_contraseña",
    "activeProfile": "participante" // opcional
  }
  ```
- O header `data` como string JSON.

**Respuesta (éxito):**
```json
{
  "message": "{\"message\":\"Bienvenido participante, nuevo_usuario\"}"
}
```
**Errores:**
- 400: Campos faltantes o inválidos
- 500: Error al registrar usuario / Error al iniciar sesión

---

### Cierre de Sesión
**URL:** `/logout`
**Método:** `GET`
**Entrada:** Ninguna (la sesión se identifica por cookie).
**Respuesta (éxito):**
```json
{
  "message": "Sesión cerrada correctamente"
}
```
**Respuesta (sin sesión):**
```json
{
  "message": "No has iniciado sesión.",
  "redirect": "/login"
}
```
**Errores:**
- 500: Error al cerrar sesión

---

### Página Principal
**URL:** `/home`
**Método:** `GET`
**Entrada:** Ninguna (requiere sesión activa).
**Respuesta (éxito):**
```json
{
  "message": "Bienvenido a la página principal, <perfil>, <username>",
  "sessionData": { /* datos de sesión */ }
}
```
**Respuesta (sin sesión):**
```json
{
  "message": "Debes iniciar sesión para acceder a esta página.",
  "redirect": "/login"
}
```

---

### Olvidé mi contraseña
**URL:** `/forgotPassword`
**Método:** `POST`
**Datos enviados:**
- Body (JSON):
  ```json
  {
    "email": "usuario@ejemplo.com"
  }
  ```
- O header `data` como string JSON.

**Respuesta (éxito):**
```json
{
  "message": "Se ha emulado el envío del email de recuperación",
  "userId": "...",
  "email": "...",
  "token": "..."
}
```
**Errores:**
- 400: Email inválido o faltante
- 404: Usuario no encontrado
- 500: Error al buscar usuario

---

### Restablecer contraseña
**URL:** `/resetPassword`
**Método:** `POST`
**Datos enviados:**
- Body (JSON):
  ```json
  {
    "userId": "id_del_usuario",
    "token": "token_de_recuperacion",
    "password": "nueva_contraseña",
    "confirmPassword": "nueva_contraseña"
  }
  ```
- O header `data` como string JSON.

**Respuesta (éxito):**
```json
{
  "message": "Contraseña actualizada correctamente para el usuario . Por favor inicie sesión con su nueva contraseña.",
  "redirect": "/login"
}
```
**Errores:**
- 400: Campos faltantes, contraseñas no coinciden, token inválido
- 500: Error al actualizar la contraseña

---

### Rutas CRUD automáticas (por modelo)
El archivo `src/controllers.js` genera endpoints CRUD para cada modelo exportado desde `models.js`.

#### Ejemplo para el modelo `User`:
- **GET** `/users` — Listar todos los usuarios
- **GET** `/user/:id` — Obtener usuario por id
- **POST** `/user` — Crear usuario
- **PUT** `/user/:id` — Actualizar usuario por id
- **DELETE** `/users` — Eliminar todos los usuarios
- **DELETE** `/user/:id` — Eliminar usuario por id

#### Formato de datos enviados:
- **POST/PUT:** Body (JSON) con los campos del modelo

#### Formato de respuesta:
- **GET (listado):**
  ```json
  [
    {
      "_id": "...",
      "username": "...",
      "email": "...",
      // ...otros campos
    }
  ]
  ```
- **GET (por id):**
  ```json
  {
    "_id": "...",
    "username": "...",
    "email": "...",
    // ...otros campos
  }
  ```
- **POST/PUT:**
  ```json
  {
    "message": "Usuario creado/actualizado correctamente",
    "user": { /* datos del usuario */ }
  }
  ```
- **DELETE:**
  ```json
  {
    "message": "Usuario(s) eliminado(s) correctamente"
  }
  ```

#### Errores comunes:
- 400: ValidationError (campos inválidos)
- 401: UnauthorizedError
- 403: ForbiddenError
- 404: NotFoundError
- 406: NoDataError
- 500: InternalServerError

#### Otros modelos
Las mismas rutas y formatos aplican para los modelos `Profile`, `Subsystem`, `Class`, `Method`, `Menu`, etc. Los nombres de las rutas se derivan de `model.modelName.toLowerCase()`.

---

## Observaciones finales
- Todos los endpoints aceptan datos en el body (JSON) o en la cabecera `data` como string JSON.
- Las respuestas pueden incluir mensajes, redirecciones y códigos de error.
- Los endpoints de sesión y recuperación usan validaciones estrictas.
