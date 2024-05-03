import express from 'express'
import { Parent_Registration, Parent_login, email_confirmation, forget_password, reset_password } from '../Controllers/UserController.js';

const router = express.Router()

router.post('/Parent_Registration', Parent_Registration)
router.post('/Parent_login', Parent_login)

router.put('/verify', email_confirmation)

router.post('/forget-password', forget_password);
// router.post('/forget-password-sms', forget_password_sms);
router.post('/reset-password', reset_password);

export default router;