import pool from '../config/db.js' 
import bcrypt from 'bcrypt';

export async function Registro(req, res) {
  try {
    const { nombres, contrasena} = req.body;
    const hashpassword = await bcrypt.hashSync(contrasena, 10);

    // 1. Validar datos requeridos
    if (!nombres || !hashpassword) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // 2. Insertar en la base de datos
    const [resultado] = await pool.query(
      'INSERT INTO prueba (nombres, contrasena) VALUES (?, ?)',
      [nombres, hashpassword]
    );

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