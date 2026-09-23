# RegistroBiblioTK — Servicio de registro

Parte del sistema BiblioTK (ver `../CLAUDE.md`). Crea usuarios en la tabla `usuarios`.

- **Puerto:** 3000 (`PORT` en `.env`)
- **Arranque:** `npm run dev` (`node src/app.js`; `nodemon` está instalado pero no se usa en el script)
- **Dependencias clave:** express 5, mysql2, bcrypt, cors

## Estructura

- `src/app.js` — express + `express.json()` + CORS (sin `credentials`) + router en `/RegistroBiblioTK` + middleware de errores: JSON mal formado → 400; cualquier otro error → 500 genérico. Arranca solo si `testConnection()` (un `SELECT 1` real) funciona.
- `src/config/db.js` — pool mysql2 y `testConnection()` real
- `src/router/routerBiblioTK.js`
- `src/controllers/registroController.js` — `Registro`

## Endpoints

| Método | Ruta | Controlador | Descripción |
|---|---|---|---|
| GET | `/RegistroBiblioTK/health` | inline | Health check |
| POST | `/RegistroBiblioTK/Registro` | `Registro` | Crea un usuario, siempre con rol `usuario` |

### POST /Registro
Body: `nombres`, `apellidos`, `email`, `cc`, `contrasena`, `celular`, `nombreUsuario`.

1. Valida cada campo (`validarRegistro`, mismo estilo que `validarPerfil` en PerfilBiblioTK) → **400** `{ campo, message }` con la razón puntual si algo no cumple.
2. Si ya existe un usuario con el mismo `email`, `cc` o `nombreusuario` → **409** `{ campo, message }`.
3. Hashea `contrasena` con bcrypt (10 rondas) e inserta con `rol = 'usuario'` fijo y `fecharegistro = NOW()` → **201** `{ message, id }`.
4. Error inesperado → **500** con mensaje genérico (el detalle solo sale por consola).

## Problemas conocidos

- La validación de campos y los mensajes de error se agregaron después de crear el servicio: si alguna regla no coincide con lo que espera el front, ajustar `validarRegistro`.
