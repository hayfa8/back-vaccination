import express from 'express'
import { Doctor_Registration, Doctor_Login, email_confirmation, forget_password, reset_password } from '../Controllers/UserController.js'

const router = express.Router()

router.post('/Doctor_Registration', Doctor_Registration)
router.post('/Doctor_Login', Doctor_Login)

router.put('/verify', email_confirmation)

router.post('/forget-password', forget_password);
router.post('/reset-password', reset_password);

export default router;