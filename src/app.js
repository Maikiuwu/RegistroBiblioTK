import express from 'express'
import bodyParser from 'body-parser'
import routerBiblioTK from './router/routerBiblioTK.js'
import pool from './config/db.js'
import { testConnection }from './config/db.js'
import cors from "cors"

// instanciar express
const app = express()

// Lectura de body en formato JSON
app.use(bodyParser.json())
const allowedOrigins = Object.entries(process.env)
    .filter(([key, value]) => key.startsWith('ALLOWED_ORIGIN_') && value)
    .map(([, origin]) => origin.trim());

app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

// Manejar solicitudes OPTIONS para todas las rutas
//app.options("./*", cors());

// Arrancar servidor
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})

// Probar conexión a la base de datos
testConnection();

// Enrutar rutas RegistroBiblioTK
app.use('/RegistroBiblioTK', routerBiblioTK)
