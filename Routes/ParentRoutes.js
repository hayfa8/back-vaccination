import express from 'express'
import { Parent_Registration, Parent_login, email_confirmation, forget_password, reset_password } from '../Controllers/User.registartion.Controller.js';
import {assign_child_to_parent, get_all_doctors_names, get_childs, create_meeting, update_meeting, get_all_meetings, get_pending_meetings, get_declined_meetings, get_approved_meetings } from '../Controllers/ParentController.js'


const router = express.Router()

// **Child-Parent Management Routes**
router.put('/assign_child_to_parent/:parentId', assign_child_to_parent); 
router.get('/get_all_doctors_names', get_all_doctors_names);


// **Child Data Routes** 
router.get('/get_childs/:parentId', get_childs); 


// **Meeting Management Routes** 
router.post('/create_meeting', create_meeting);
router.get('/get_all_meetings', get_all_meetings);
router.put('/update_meeting/:meetingId', update_meeting); 


// **Meeting filtering by status**
router.get('/get_pending_meetings', get_pending_meetings);
router.get('/get_declined_meetings', get_declined_meetings);
router.get('/get_approved_meetings', get_approved_meetings);


// **Parent User Management Routes** 
router.post('/Parent_Registration', Parent_Registration)
router.post('/Parent_login', Parent_login)
router.put('/verify', email_confirmation)
router.post('/forget-password', forget_password);
router.post('/reset-password', reset_password);

export default router;