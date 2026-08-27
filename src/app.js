import express from 'express'
import bodyParser from 'body-parser'
import routerBiblioTK from './router/routerBiblioTK.js'

// instanciar express
const app = express()

// Lectura de body en formato JSON
app.use(bodyParser.json())

// Arrancar servidor
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})

// Enrutar rutas RegistroBiblioTK
app.use('/UserLibrary', routerBiblioTK)
