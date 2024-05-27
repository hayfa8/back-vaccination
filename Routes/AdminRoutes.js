import express from 'express'
import { login, registerAdmin, get_Non_Verified_Doctors, get_Non_Verified_Parents, Verify_Account, Reject_Account } from '../Controllers/AdminController.js'
import { verifyAdminToken } from '../Middleware/verifyToken.js'
import { create_vaccin, update_vaccin, get_all_vaccins, get_vaccin, delete_vaccin } from '../Controllers/AdminController.js'
const router = express.Router()


// ** User Management Routes**

router.post('/login', login)

router.post('/registerAdmin', registerAdmin) // to delete

router.get('/Non_Verified_Parents',verifyAdminToken , get_Non_Verified_Parents )

router.get('/Non_Verified_Doctors',verifyAdminToken , get_Non_Verified_Doctors )

router.put('/accounts/:id/verify',verifyAdminToken , Verify_Account )

router.put('/accounts/:id/reject',verifyAdminToken , Reject_Account)


// ** Vaccin Management Routes**

router.post('/create_vaccin', create_vaccin);

router.put('/update_vaccin/:id', update_vaccin);

router.delete('/delete_vaccin/:id', delete_vaccin);

router.get('/get_all_vaccins', get_all_vaccins);

router.get('/get_vaccin/:id', get_vaccin);


export default router;