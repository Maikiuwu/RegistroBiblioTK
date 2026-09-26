import dns from "node:dns/promises";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

async function domainCanReceiveEmail(email) {
	const domain = email.split("@")[1];

	try {
		const mxRecords = await dns.resolveMx(domain);
		return mxRecords.length > 0;
	} catch {
		// ENOTFOUND / ENODATA → el dominio no existe o no acepta correo
		return false;
	}
}

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
			nombreUsuario,
		} = req.body;

		// 1. Validar que el dominio del correo exista de verdad
		const dominioValido = await domainCanReceiveEmail(email);

		if (!dominioValido) {
			return res.status(400).json({
				field: "email",
				message:
					"El dominio de ese correo no existe o no puede recibir mensajes.",
			});
		}

		const hashpassword = await bcrypt.hash(contrasena, 10);

		const verificarExistenciaUsuario = async (email, cc, nombreUsuario) => {
			const [rows] = await pool.query(
				`SELECT * FROM usuarios WHERE email = ? OR cc = ? OR nombreusuario = ?`,
				[email, cc, nombreUsuario],
			);
			return rows.length > 0;
		};

		const usuarioExiste = await verificarExistenciaUsuario(
			email,
			cc,
			nombreUsuario,
		);

		if (usuarioExiste) {
			return res.status(409).json({
				message: "El usuario ya existe",
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

		return res.status(201).json({
			message: "Usuario registrado con éxito",
			id: resultado.insertId,
		});
	} catch (error) {
		console.error("Error al insertar:", error);
		return res.status(500).json({
			message: "Error en el registro",
			error: error.message,
		});
	}
}
