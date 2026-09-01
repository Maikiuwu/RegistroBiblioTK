import { Router } from 'express'
import { Registro } from '../controllers/registroController.js'

const router = Router()

router.post('/Registro', Registro)

export default router
