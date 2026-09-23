import express from 'express';
import cors from 'cors';
import { testConnection } from './config/db.js';
import routerBiblioTK from './router/routerBiblioTK.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5172",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5145",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use('/RegistroBiblioTK', routerBiblioTK);

// Los detalles del error se quedan en la consola: al cliente solo le llega un mensaje genérico
app.use((error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ message: 'El cuerpo de la solicitud no es un JSON válido' });
  }

  console.error('Error del servidor:', error);
  return res.status(500).json({ message: 'Error interno del servidor' });
});

async function iniciarServidor() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch {
    process.exitCode = 1;
  }
}

iniciarServidor();
