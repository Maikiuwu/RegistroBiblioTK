import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const letras = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ";
const patronNombre = new RegExp(`^[${letras}]+(?:[ '-][${letras}]+)*$`);
const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const patronCedula = /^[1-9]\d*$/;
const patronCelular = /^\d{7,15}$/;

const mensajesDuplicado = {
  email: 'Ese correo ya está registrado.',
  cc: 'Esa cédula ya está registrada.',
  nombreUsuario: 'Ese nombre de usuario ya está en uso.',
};

function comoTexto(valor) {
  return typeof valor === 'string' || typeof valor === 'number'
    ? String(valor).trim()
    : '';
}

function normalizarRegistro(datos = {}) {
  return {
    nombres: comoTexto(datos.nombres),
    apellidos: comoTexto(datos.apellidos),
    email: comoTexto(datos.email).toLowerCase(),
    cc: comoTexto(datos.cc),
    contrasena: typeof datos.contrasena === 'string' ? datos.contrasena : '',
    celular: comoTexto(datos.celular),
    nombreUsuario: comoTexto(datos.nombreUsuario),
  };
}

function esNombreValido(valor) {
  return valor.length >= 2 && valor.length <= 50 && patronNombre.test(valor);
}

// Cada regla dice exactamente qué está mal, no solo que algo falló
function validarRegistro(datos) {
  if (!esNombreValido(datos.nombres)) {
    return {
      campo: 'nombres',
      message:
        'Los nombres deben tener entre 2 y 50 caracteres: letras, espacios, apóstrofes o guiones.',
    };
  }

  if (!esNombreValido(datos.apellidos)) {
    return {
      campo: 'apellidos',
      message:
        'Los apellidos deben tener entre 2 y 50 caracteres: letras, espacios, apóstrofes o guiones.',
    };
  }

  if (!patronCedula.test(datos.cc) || datos.cc.length > 15) {
    return {
      campo: 'cc',
      message: 'La cédula debe ser un número entero mayor que 0, de hasta 15 dígitos.',
    };
  }

  if (!patronEmail.test(datos.email) || datos.email.length > 100) {
    return {
      campo: 'email',
      message: 'Ingresa un correo válido, por ejemplo: tu@correo.com.',
    };
  }

  if (!patronCelular.test(datos.celular)) {
    return {
      campo: 'celular',
      message: 'El celular debe contener solo números, entre 7 y 15 dígitos.',
    };
  }

  if (!datos.nombreUsuario || datos.nombreUsuario.length > 30) {
    return {
      campo: 'nombreUsuario',
      message: 'El nombre de usuario debe tener entre 1 y 30 caracteres.',
    };
  }

  if (datos.contrasena.length < 8) {
    return {
      campo: 'contrasena',
      message: 'La contraseña debe tener al menos 8 caracteres.',
    };
  }

  return null;
}

function mismoTexto(a, b) {
  return String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();
}

export async function Registro(req, res, next) {
  try {
    const datos = normalizarRegistro(req.body);
    const errorValidacion = validarRegistro(datos);

    if (errorValidacion) {
      return res.status(400).json(errorValidacion);
    }

    // La tabla no tiene índices UNIQUE: la unicidad se comprueba acá, igual que en Perfil
    const [duplicados] = await pool.query(
      `SELECT email, cc, nombreusuario FROM usuarios WHERE email = ? OR cc = ? OR nombreusuario = ? LIMIT 1`,
      [datos.email, datos.cc, datos.nombreUsuario],
    );

    if (duplicados.length) {
      const [existente] = duplicados;
      const campo = mismoTexto(existente.email, datos.email)
        ? 'email'
        : mismoTexto(existente.cc, datos.cc)
          ? 'cc'
          : 'nombreUsuario';

      return res.status(409).json({ campo, message: mensajesDuplicado[campo] });
    }

    const hashpassword = await bcrypt.hash(datos.contrasena, 10);

    // El rol nunca se toma del body: todo registro público entra como "usuario".
    // Antes cualquiera podía mandar "rol": "admin" y auto-promoverse.
    const [resultado] = await pool.query(
      `INSERT INTO usuarios
        (nombres, apellidos, email, cc, password, rol, fecharegistro, activo, celular, nombreusuario)
       VALUES (?, ?, ?, ?, ?, 'usuario', NOW(), true, ?, ?)`,
      [
        datos.nombres,
        datos.apellidos,
        datos.email,
        datos.cc,
        hashpassword,
        datos.celular,
        datos.nombreUsuario,
      ],
    );

    return res.status(201).json({
      message: 'Usuario registrado con éxito',
      id: resultado.insertId,
    });
  } catch (error) {
    return next(error);
  }
}
