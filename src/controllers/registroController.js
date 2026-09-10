import pool from '../config/db.js'
import bcrypt from 'bcrypt';

export async function Registro(req, res) {
  try {
    const {
      nombres,
      apellidos,
      email,
      cc,
      contrasena,
      rol = req.body.rol || "1",
      fechaRegistro,
      activo = req.body.activo || true,
      celular,
      nombreUsuario } = req.body;

    const hashpassword = await bcrypt.hash(contrasena, 10);
    //para login
    //await bcrypt.compare(contrasenaRecibida, usuario.password);

    /*
    // 1. Validar datos requeridos
    if (!nombres || !hashpassword) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
*/

    const verificarExistenciaUsuario = async (email, cc, nombreUsuario) => {  
      const [rows] = await pool.query(
        `SELECT * FROM usuarios WHERE email = ? OR cc = ? OR nombreusuario = ?`,
        [email, cc, nombreUsuario]
      );
      return rows.length > 0; // Devuelve true si el usuario ya existe, false si no existe
    };

    const usuarioExiste = await verificarExistenciaUsuario(email, cc, nombreUsuario);

    if (usuarioExiste) {
      return res.status(409).json({
        message: 'El usuario ya existe',
      });
    }

    const [resultado] = await pool.query(
      `INSERT INTO usuarios
    (nombres, apellidos, email, cc, password, rol, fecharegistro, activo, celular, nombreusuario)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [
        nombres,
        apellidos,
        email,
        cc,
        hashpassword,
        rol,
        activo,
        celular,
        nombreUsuario,
      ],
    );

    // 2. Insertar en la base de datos


    // 3. Responder al cliente con el ID creado
    return res.status(201).json({
      message: 'Usuario registrado con éxito',
      id: resultado.insertId
    });

  } catch (error) {
    console.error('Error al insertar:', error);
    return res.status(500).json({
      message: 'Error en el registro',
      error: error.message
    });
  }
}