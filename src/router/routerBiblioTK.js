import { Router } from 'express'
import { Registro } from '../controllers/registroController.js'

const router = Router()
//maikol es gay
router.post('/Registro', Registro)

export default router
