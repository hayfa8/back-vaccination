import cron from "node-cron";
import moment from 'moment';
import { Child } from "../Models/childModel.js";
import { sendPushNotification } from "../Controllers/NotificationController.js";
import { calculateScheduleDate } from "./calculateScheduleDate.js";

// Définir la tâche cron
const startCronJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      console.log("La tâche cron a démarré");
      
      // Récupérer les enfants et peupler la référence vaccinId
      const children = await Child.find().populate('vaccin.vaccinId');
      console.log(`Trouvé ${children.length} enfants`);

      for (const child of children) {
        console.log(`Traitement de l'enfant : ${child.firstName} ${child.lastName}, Date de naissance : ${child.birthday}`);
        
        // Obtenir les âges de vaccination
        const vaccineAges = child.vaccin.map(vaccin => vaccin.vaccinId.age).flat();
        console.log(`Âges des vaccins pour ${child.firstName} ${child.lastName} : ${vaccineAges}`);
        
        const upcomingDates = calculateScheduleDate(child.birthday, vaccineAges);
        console.log(`Dates de vaccination à venir : ${upcomingDates}`);

        for (const upcomingDate of upcomingDates) {
          const reminderDate = moment(upcomingDate, "DD/MM/YYYY").subtract(2, 'days').format("DD/MM/YYYY");
          const today = moment().format("DD/MM/YYYY");

          console.log(`Date à venir : ${upcomingDate}, Date de rappel : ${reminderDate}, Aujourd'hui : ${today}`);

          if (reminderDate === today) {
            console.log(`Envoi de la notification au parent de l'enfant : ${child.firstName} ${child.lastName}`);
            // Appeler la fonction pour envoyer la notification
            await sendPushNotification(child.parentId, `Rappel : Votre enfant ${child.firstName} ${child.lastName} a une vaccination le ${upcomingDate}`);
          }
        }
      }

      console.log("La tâche cron est terminée");
    } catch (error) {
      console.error("Erreur lors de la planification des rappels :", error);
    }
  });
};

export { startCronJob };
