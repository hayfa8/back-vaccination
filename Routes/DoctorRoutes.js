import express from 'express'
import { Doctor_Registration, Doctor_Login, email_confirmation, forget_password, reset_password } from '../Controllers/User.registartion.Controller.js'

import {create_dossier, update_dossier, get_Nb_enfants, get_list_dossier, approve_meeting, decline_meeting, get_todays_meetings, get_child_vaccins_ByID, update_VaccinationStatus_true, update_VaccinationStatus_false } from "../Controllers/DoctorController.js"



const router = express.Router()

// **Dossier Medical Routes
router.post('/create_dossier', create_dossier);
router.put('/update_dossier/:childId', update_dossier); 
router.get('/get_Nb_enfants', get_Nb_enfants);
router.get('/get_list_dossier', get_list_dossier);

// **Child Vaccines
router.get('/get_child_vaccins_by_id/:childId', get_child_vaccins_ByID);
router.put('/update_vaccination_true/:childId/:vaccinId', update_VaccinationStatus_true);
router.put('/update_vaccination_false/:childId/:vaccinId', update_VaccinationStatus_false);


// **Meeting Management Routes
router.put('/approve_meeting/:meetingId', approve_meeting); 
router.put('/decline_meeting/:meetingId', decline_meeting);
router.get('/get_todays_meetings/:id', get_todays_meetings);


// **Doctor User Management Routes
router.post('/Doctor_Registration', Doctor_Registration)
router.post('/Doctor_Login', Doctor_Login)

router.put('/verify', email_confirmation)

router.post('/forget-password', forget_password);
router.post('/reset-password', reset_password);

export default router;