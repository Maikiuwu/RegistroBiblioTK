import { Router } from 'express'
import { Registro } from '../controllers/registroController.js'

const router = Router()

router.get('/health', (req, res) => {
  res.status(200).json({ message: 'API is healthy' })
})

// router.post('/Registro', Registro)

export default router
