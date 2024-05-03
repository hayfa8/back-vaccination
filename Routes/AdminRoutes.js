import express from 'express'
import { login, registerAdmin, get_Non_Verified_Doctors, get_Non_Verified_Parents, Verify_Account, Reject_Account } from '../Controllers/AdminController.js'
import { verifyAdminToken } from '../Middleware/verifyToken.js'

const router = express.Router()

router.post('/login', login)

router.post('/registerAdmin', registerAdmin) // to delet

// router.get('/dashboard', getAdminDashboard )

// router.get('/accounts', get_Non_Verified_Accounts )

router.get('/Non_Verified_Parents',verifyAdminToken , get_Non_Verified_Parents )

router.get('/Non_Verified_Doctors',verifyAdminToken , get_Non_Verified_Doctors )

router.put('/accounts/:id/verify',verifyAdminToken , Verify_Account )

router.put('/accounts/:id/reject',verifyAdminToken , Reject_Account)


export default router;