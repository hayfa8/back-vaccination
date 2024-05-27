import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { Parent } from '../Models/ParentModel.js';
import serviceAccount from './tfa9adni-firebase-adminsdk-229wv-df5f95ffb9.json' assert { type: 'json' };

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount)
});


export const sendPushNotification = async (parentId, message) => {
    try {
      // Fetch the parent's device token from the database
      const parent = await Parent.findById(parentId);
      if (!parent) {
        throw new Error('Parent not found');
      }
  
      const deviceToken = parent.deviceToken;
  
      // Create a message object
      const notification = {
        token: deviceToken,
        notification: {
          title: 'Vaccination Reminder',
          body: message,
        },
      };
  
      // Get messaging service and send the notification
      const messaging = getMessaging();
      await messaging.send(notification);
      console.log('Push notification sent successfully!');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
  

export const update_deviceToken = async(req, res) => {
    const parentId = req.params
    const newToken = req.body
    try {
      await Parent.findByIdAndUpdate(parentId, { deviceToken: newToken }, { new: true });
      console.log('deviceToken mis à jour avec succès');
    } catch (error) {
        console.error('Erreur lors de la mise à jour du token FCM:', error);
        throw error;
    }
};