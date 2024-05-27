import express from 'express';
import { update_deviceToken } from '../Controllers/NotificationController.js';

const router = express.Router();

router.put('/update-device-token/:parentId', update_deviceToken);

export default router;
